const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectMemberValidation = [
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  body('staff_id')
    .isInt({ min: 1 })
    .withMessage('Staff ID must be a positive integer'),
  body('start_time')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('end_time')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.start_time)) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

// @route   GET /api/project-members
// @desc    Get all project members with optional filtering and pagination
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      project_id = '',
      staff_id = '',
      status = '', // active, completed
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['id', 'project_id', 'staff_id', 'start_time', 'end_time', 'created_at', 'updated_at'];
    const validSortOrders = ['ASC', 'DESC'];

    // Validate sort parameters
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'created_at';
    }
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'DESC';
    }

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (project_id) {
      whereClause += ' AND pm.project_id = ?';
      params.push(parseInt(project_id));
    }

    if (staff_id) {
      whereClause += ' AND pm.staff_id = ?';
      params.push(parseInt(staff_id));
    }

    if (status === 'active') {
      whereClause += ' AND pm.end_time IS NULL';
    } else if (status === 'completed') {
      whereClause += ' AND pm.end_time IS NOT NULL';
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM project_members pm ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get project members with project and staff information
    const [members] = await pool.execute(
      `SELECT 
        pm.id,
        pm.project_id,
        pm.staff_id,
        pm.start_time,
        pm.end_time,
        pm.created_at,
        pm.updated_at,
        p.name as project_name,
        p.description as project_description,
        p.project_status,
        c.name as center_name,
        c.field as center_field,
        s.gender,
        s.phone,
        s.address,
        u.name as staff_name,
        u.status as user_status,
        CASE WHEN pm.end_time IS NULL THEN 'active' ELSE 'completed' END as membership_status
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       LEFT JOIN centers c ON p.center_id = c.id
       LEFT JOIN staff s ON pm.staff_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY pm.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get unique projects for filter options
    const [projects] = await pool.execute(
      'SELECT id, name, description FROM projects ORDER BY name'
    );

    // Get unique staff for filter options
    const [staff] = await pool.execute(
      `SELECT s.id, u.name as staff_name
       FROM staff s
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY u.name`
    );

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      status: 'success',
      data: {
        members,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          availableProjects: projects,
          availableStaff: staff
        }
      }
    });

  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/project-members/:id
// @desc    Get project member by ID with detailed information
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get project member details
    const [members] = await pool.execute(
      `SELECT 
        pm.*,
        p.name as project_name,
        p.description as project_description,
        p.project_status,
        c.name as center_name,
        c.field as center_field,
        s.gender,
        s.phone,
        s.address,
        s.description as staff_description,
        u.name as staff_name,
        u.status as user_status
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       LEFT JOIN centers c ON p.center_id = c.id
       LEFT JOIN staff s ON pm.staff_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE pm.id = ?`,
      [id]
    );

    if (members.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project member not found'
      });
    }

    const member = members[0];

    // Calculate duration
    const startTime = new Date(member.start_time);
    const endTime = member.end_time ? new Date(member.end_time) : new Date();
    const durationMs = endTime - startTime;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    res.json({
      status: 'success',
      data: {
        member,
        duration: {
          days: durationDays,
          isActive: !member.end_time
        }
      }
    });

  } catch (error) {
    console.error('Get project member by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/project-members
// @desc    Create a new project member
// @access  Private (Admin/Manager only)
router.post('/', [authenticateToken, requireAdminOrManager, ...projectMemberValidation], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { project_id, staff_id, start_time, end_time } = req.body;

    // Check if project exists
    const [projects] = await pool.execute(
      'SELECT id FROM projects WHERE id = ?',
      [project_id]
    );

    if (projects.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if staff exists
    const [staff] = await pool.execute(
      'SELECT id FROM staff WHERE id = ?',
      [staff_id]
    );

    if (staff.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff member not found'
      });
    }

    // Check if staff is already a member of this project
    const [existingMembers] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND staff_id = ?',
      [project_id, staff_id]
    );

    if (existingMembers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff member is already a member of this project'
      });
    }

    // Check for overlapping time periods
    const [overlappingMembers] = await pool.execute(
      `SELECT id FROM project_members 
       WHERE staff_id = ? 
       AND (
         (start_time <= ? AND (end_time IS NULL OR end_time > ?)) OR
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND start_time < ?)
       )`,
      [staff_id, start_time, start_time, end_time || start_time, end_time || start_time, start_time, end_time || start_time]
    );

    if (overlappingMembers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff member has overlapping project assignments during this time period'
      });
    }

    // Insert new project member
    const [result] = await pool.execute(
      'INSERT INTO project_members (project_id, staff_id, start_time, end_time) VALUES (?, ?, ?, ?)',
      [project_id, staff_id, start_time, end_time || null]
    );

    const memberId = result.insertId;

    // Get the created project member
    const [members] = await pool.execute(
      `SELECT 
        pm.*,
        p.name as project_name,
        p.description as project_description,
        p.project_status,
        c.name as center_name,
        c.field as center_field,
        s.gender,
        s.phone,
        s.address,
        u.name as staff_name,
        u.status as user_status
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       LEFT JOIN centers c ON p.center_id = c.id
       LEFT JOIN staff s ON pm.staff_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE pm.id = ?`,
      [memberId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Project member added successfully',
      data: members[0]
    });

  } catch (error) {
    console.error('Create project member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/project-members/:id
// @desc    Update project member by ID
// @access  Private (Admin/Manager only)
router.put('/:id', [authenticateToken, requireAdminOrManager, ...projectMemberValidation], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { project_id, staff_id, start_time, end_time } = req.body;

    // Check if project member exists
    const [existingMembers] = await pool.execute(
      'SELECT id FROM project_members WHERE id = ?',
      [id]
    );

    if (existingMembers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project member not found'
      });
    }

    // Check if project exists
    const [projects] = await pool.execute(
      'SELECT id FROM projects WHERE id = ?',
      [project_id]
    );

    if (projects.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if staff exists
    const [staff] = await pool.execute(
      'SELECT id FROM staff WHERE id = ?',
      [staff_id]
    );

    if (staff.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff member not found'
      });
    }

    // Check if staff is already a member of this project (excluding current member)
    const [existingProjectMembers] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND staff_id = ? AND id != ?',
      [project_id, staff_id, id]
    );

    if (existingProjectMembers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff member is already a member of this project'
      });
    }

    // Check for overlapping time periods (excluding current member)
    const [overlappingMembers] = await pool.execute(
      `SELECT id FROM project_members 
       WHERE staff_id = ? AND id != ?
       AND (
         (start_time <= ? AND (end_time IS NULL OR end_time > ?)) OR
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND start_time < ?)
       )`,
      [staff_id, id, start_time, start_time, end_time || start_time, end_time || start_time, start_time, end_time || start_time]
    );

    if (overlappingMembers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff member has overlapping project assignments during this time period'
      });
    }

    // Update project member
    await pool.execute(
      'UPDATE project_members SET project_id = ?, staff_id = ?, start_time = ?, end_time = ? WHERE id = ?',
      [project_id, staff_id, start_time, end_time || null, id]
    );

    // Get the updated project member
    const [members] = await pool.execute(
      `SELECT 
        pm.*,
        p.name as project_name,
        p.description as project_description,
        p.project_status,
        c.name as center_name,
        c.field as center_field,
        s.gender,
        s.phone,
        s.address,
        u.name as staff_name,
        u.status as user_status
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       LEFT JOIN centers c ON p.center_id = c.id
       LEFT JOIN staff s ON pm.staff_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE pm.id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      message: 'Project member updated successfully',
      data: members[0]
    });

  } catch (error) {
    console.error('Update project member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/project-members/:id
// @desc    Delete project member by ID
// @access  Private (Admin/Manager only)
router.delete('/:id', [authenticateToken, requireAdminOrManager], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project member exists
    const [existingMembers] = await pool.execute(
      'SELECT id FROM project_members WHERE id = ?',
      [id]
    );

    if (existingMembers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project member not found'
      });
    }

    // Delete project member
    await pool.execute('DELETE FROM project_members WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Project member removed successfully'
    });

  } catch (error) {
    console.error('Delete project member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/project-members/:id/complete
// @desc    Mark project member as completed
// @access  Private (Admin/Manager only)
router.post('/:id/complete', [authenticateToken, requireAdminOrManager], async (req, res) => {
  try {
    const { id } = req.params;
    const { end_time } = req.body;

    // Check if project member exists
    const [existingMembers] = await pool.execute(
      'SELECT * FROM project_members WHERE id = ?',
      [id]
    );

    if (existingMembers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project member not found'
      });
    }

    const member = existingMembers[0];

    // Check if already completed
    if (member.end_time) {
      return res.status(400).json({
        status: 'error',
        message: 'Project member is already completed'
      });
    }

    // Validate end time
    const endTime = end_time || new Date().toISOString();
    if (new Date(endTime) <= new Date(member.start_time)) {
      return res.status(400).json({
        status: 'error',
        message: 'End time must be after start time'
      });
    }

    // Update end time
    await pool.execute(
      'UPDATE project_members SET end_time = ? WHERE id = ?',
      [endTime, id]
    );

    // Get the updated project member
    const [members] = await pool.execute(
      `SELECT 
        pm.*,
        p.name as project_name,
        p.description as project_description,
        p.project_status,
        c.name as center_name,
        c.field as center_field,
        s.gender,
        s.phone,
        s.address,
        u.name as staff_name,
        u.status as user_status
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       LEFT JOIN centers c ON p.center_id = c.id
       LEFT JOIN staff s ON pm.staff_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE pm.id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      message: 'Project member marked as completed',
      data: members[0]
    });

  } catch (error) {
    console.error('Complete project member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/project-members/:id/stats
// @desc    Get project member statistics
// @access  Private
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project member exists
    const [members] = await pool.execute(
      'SELECT * FROM project_members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project member not found'
      });
    }

    const member = members[0];

    // Calculate duration
    const startTime = new Date(member.start_time);
    const endTime = member.end_time ? new Date(member.end_time) : new Date();
    const durationMs = endTime - startTime;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Get project statistics
    const [projectStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_members,
        SUM(CASE WHEN end_time IS NULL THEN 1 ELSE 0 END) as active_members,
        SUM(CASE WHEN end_time IS NOT NULL THEN 1 ELSE 0 END) as completed_members
       FROM project_members
       WHERE project_id = ?`,
      [member.project_id]
    );

    res.json({
      status: 'success',
      data: {
        memberId: parseInt(id),
        duration: {
          days: durationDays,
          isActive: !member.end_time
        },
        project: projectStats[0]
      }
    });

  } catch (error) {
    console.error('Get project member stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 