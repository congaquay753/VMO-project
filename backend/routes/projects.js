const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Project name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('center_id')
    .isInt({ min: 1 })
    .withMessage('Center ID must be a positive integer'),
  body('project_status')
    .isIn(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'])
    .withMessage('Invalid project status')
];

// @route   GET /api/projects
// @desc    Get all projects with optional filtering and pagination
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    center_id = '',
    project_status = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 1000);
  const offset = (safePage - 1) * safeLimit;
  const validSortFields = ['id', 'name', 'center_id', 'project_status', 'created_at', 'updated_at'];
  const validSortOrders = ['ASC', 'DESC'];

  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = validSortOrders.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';

  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  let params = [];

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (center_id) {
    whereClause += ' AND p.center_id = ?';
    params.push(parseInt(center_id));
  }

  if (project_status) {
    whereClause += ' AND p.project_status = ?';
    params.push(project_status);
  }

  try {
    const countResult = await query(
      `SELECT COUNT(*) as total FROM projects p ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const projects = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.center_id,
        p.project_status,
        p.created_at,
        p.updated_at,
        c.name as center_name,
        c.field as center_field,
        COUNT(pm.id) as member_count
       FROM projects p
       LEFT JOIN centers c ON p.center_id = c.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       ${whereClause}
       GROUP BY p.id
       ORDER BY p.${sortField} ${sortDirection}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const centers = await query('SELECT id, name FROM centers ORDER BY name');

    return res.json({
      status: 'success',
      message: 'Fetched projects successfully',
      data: {
        projects,
        pagination: {
          currentPage: safePage,
          totalPages: Math.ceil(total / safeLimit),
          totalItems: total,
          itemsPerPage: safeLimit,
          hasNextPage: safePage < Math.ceil(total / safeLimit),
          hasPrevPage: safePage > 1
        },
        filters: {
          centers: centers.map(c => ({ id: c.id, name: c.name })),
          statuses: ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch projects'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID with detailed information
// @access  Private
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Get project details
  query(
    `SELECT p.*, c.name as center_name, c.field as center_field
       FROM projects p
       LEFT JOIN centers c ON p.center_id = c.id
       WHERE p.id = ?`,
    [id]
  ).then(projects => {
    if (projects.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const project = projects[0];

    // Get project members
    return query(
      `SELECT 
        pm.id,
        pm.start_time,
        pm.end_time,
        pm.created_at,
        s.id as staff_id,
        s.name as staff_name,
        s.gender,
        s.phone,
        s.address,
        s.description
       FROM project_members pm
       LEFT JOIN staff s ON pm.staff_id = s.id
       WHERE pm.project_id = ?`,
      [id]
    ).then(members => {
      res.json({
        status: 'success',
        data: {
          project,
          members,
          stats: {
            memberCount: members.length,
            activeMembers: members.filter(m => !m.end_time).length
          }
        }
      });
    });
  }).catch(error => {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Admin/Manager only)
router.post('/', [authenticateToken, requireAdminOrManager, ...projectValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, description, center_id, project_status } = req.body;

  // Check if center exists
  query(
    'SELECT id FROM centers WHERE id = ?',
    [center_id]
  ).then(centers => {
    if (centers.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Center not found'
      });
    }

    // Check if project name already exists in the same center
    return query(
      'SELECT id FROM projects WHERE name = ? AND center_id = ?',
      [name, center_id]
    ).then(existingProjects => {
      if (existingProjects.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Project name already exists in this center'
        });
      }

      // Insert new project
      return query(
        'INSERT INTO projects (name, description, center_id, project_status) VALUES (?, ?, ?, ?)',
        [name, description, center_id, project_status]
      ).then(result => {
        const projectId = result.insertId;

        // Get the created project
        return query(
          `SELECT p.*, c.name as center_name, c.field as center_field
       FROM projects p
       LEFT JOIN centers c ON p.center_id = c.id
       WHERE p.id = ?`,
          [projectId]
        ).then(projects => {
          res.status(201).json({
            status: 'success',
            message: 'Project created successfully',
            data: projects[0]
          });
        });
      });
    });
  }).catch(error => {
    console.error('Create project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   PUT /api/projects/:id
// @desc    Update project by ID
// @access  Private (Admin/Manager only)
router.put('/:id', [authenticateToken, requireAdminOrManager, ...projectValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const { name, description, center_id, project_status } = req.body;

  // Check if project exists
  query(
    'SELECT id FROM projects WHERE id = ?',
    [id]
  ).then(existingProjects => {
    if (existingProjects.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if center exists
    return query(
      'SELECT id FROM centers WHERE id = ?',
      [center_id]
    ).then(centers => {
      if (centers.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Center not found'
        });
      }

      // Check if new name conflicts with existing projects in the same center
      return query(
        'SELECT id FROM projects WHERE name = ? AND center_id = ? AND id != ?',
        [name, center_id, id]
      ).then(nameConflict => {
        if (nameConflict.length > 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Project name already exists in this center'
          });
        }

        // Update project
        return query(
          'UPDATE projects SET name = ?, description = ?, center_id = ?, project_status = ? WHERE id = ?',
          [name, description, center_id, project_status, id]
        ).then(() => {
          // Get the updated project
          return query(
            `SELECT p.*, c.name as center_name, c.field as center_field
       FROM projects p
       LEFT JOIN centers c ON p.center_id = c.id
       WHERE p.id = ?`,
            [id]
          ).then(projects => {
            res.json({
              status: 'success',
              message: 'Project updated successfully',
              data: projects[0]
            });
          });
        });
      });
    });
  }).catch(error => {
    console.error('Update project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   DELETE /api/projects/:id
// @desc    Delete project by ID
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdminOrManager], (req, res) => {
  const { id } = req.params;

  // Check if project exists
  query(
    'SELECT id FROM projects WHERE id = ?',
    [id]
  ).then(existingProjects => {
    if (existingProjects.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if project has associated members
    return query(
      'SELECT COUNT(*) as count FROM project_members WHERE project_id = ?',
      [id]
    ).then(memberCount => {
      if (memberCount[0].count > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete project with associated members'
        });
      }

      // Delete project
      return query('DELETE FROM projects WHERE id = ?', [id]).then(() => {
        res.json({
          status: 'success',
          message: 'Project deleted successfully'
        });
      });
    });
  }).catch(error => {
    console.error('Delete project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   GET /api/projects/:id/stats
// @desc    Get project statistics
// @access  Private
router.get('/:id/stats', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check if project exists
  query(
    'SELECT id FROM projects WHERE id = ?',
    [id]
  ).then(projects => {
    if (projects.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Get member statistics
    return query(
      `SELECT 
        COUNT(*) as total_members,
        SUM(CASE WHEN end_time IS NULL THEN 1 ELSE 0 END) as active_members,
        SUM(CASE WHEN end_time IS NOT NULL THEN 1 ELSE 0 END) as completed_members
       FROM project_members
       WHERE project_id = ?`,
      [id]
    ).then(memberStats => {
      // Get staff gender distribution
      return query(
        `SELECT 
        s.gender,
        COUNT(*) as count
       FROM project_members pm
       LEFT JOIN staff s ON pm.staff_id = s.id
       WHERE pm.project_id = ?
       GROUP BY s.gender`,
        [id]
      ).then(genderStats => {
        res.json({
          status: 'success',
          data: {
            projectId: parseInt(id),
            members: memberStats[0],
            genderDistribution: genderStats
          }
        });
      });
    });
  }).catch(error => {
    console.error('Get project stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

module.exports = router; 