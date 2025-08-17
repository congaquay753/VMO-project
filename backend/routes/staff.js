const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');

const router = express.Router();

// Validation rules - chỉ validate bắt buộc
const staffValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('center_id')
    .notEmpty()
    .withMessage('Center is required')
];

// @route   GET /api/staff
// @desc    Get all staff with optional filtering and pagination
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    center_id = '',
    gender = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  const validSortFields = ['id', 'name', 'birth_date', 'gender', 'center_id', 'created_at', 'updated_at'];
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

  if (search) {
    whereClause += ' AND (s.name LIKE ? OR s.phone LIKE ? OR s.address LIKE ? OR s.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (center_id) {
    whereClause += ' AND s.center_id = ?';
    params.push(parseInt(center_id));
  }

  if (gender) {
    whereClause += ' AND s.gender = ?';
    params.push(gender);
  }

  // Get total count
  query(
    `SELECT COUNT(*) as total FROM staff s ${whereClause}`,
    params
  ).then(countResult => {
    const total = countResult[0].total;

    // Get staff with center information
    return query(
      `SELECT 
        s.id,
        s.name,
        s.birth_date,
        s.gender,
        s.phone,
        s.address,
        s.description,
        s.center_id,
        s.created_at,
        s.updated_at,
        c.name as center_name,
        c.field as center_field,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.staff_id = s.id) as project_count
       FROM staff s
       LEFT JOIN centers c ON s.center_id = c.id
       ${whereClause}
       ORDER BY s.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    ).then(staff => {
      // Get unique centers for filter options
      return query(
        'SELECT id, name FROM centers ORDER BY name'
      ).then(centers => {
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
          status: 'success',
          data: {
            staff,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: total,
              itemsPerPage: parseInt(limit),
              hasNextPage,
              hasPrevPage
            },
            filters: {
              centers: centers.map(c => ({ id: c.id, name: c.name })),
              genders: ['male', 'female', 'other']
            }
          }
        });
      });
    });
  }).catch(error => {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch staff'
    });
  });
});

// @route   GET /api/staff/:id
// @desc    Get staff by ID with detailed information
// @access  Private
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Get staff details
  query(
    `SELECT s.*, c.name as center_name, c.field as center_field
       FROM staff s
       LEFT JOIN centers c ON s.center_id = c.id
       WHERE s.id = ?`,
    [id]
  ).then(staff => {
    if (staff.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Staff member not found'
      });
    }

    const staffMember = staff[0];

    // Get project memberships
    return query(
      `SELECT 
        pm.id,
        pm.start_time,
        pm.end_time,
        pm.created_at,
        p.id as project_id,
        p.name as project_name,
        p.description as project_description,
        p.project_status
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       WHERE pm.staff_id = ?`,
      [id]
    ).then(projects => {
      res.json({
        status: 'success',
        data: {
          staff: staffMember,
          projects,
          stats: {
            projectCount: projects.length,
            activeProjects: projects.filter(p => !p.end_time).length
          }
        }
      });
    });
  }).catch(error => {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/staff
// @desc    Create a new staff member
// @access  Private (Admin/Manager only)
router.post('/', [authenticateToken, requireAdminOrManager, ...staffValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, birth_date, gender, phone, address, description, center_id } = req.body;

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

    // Check if phone number already exists
    query(
      'SELECT id FROM staff WHERE phone = ?',
      [phone]
    ).then(existingPhone => {
      if (existingPhone.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone number already exists'
        });
      }

      // Insert new staff member
      return query(
        'INSERT INTO staff (name, birth_date, gender, phone, address, description, center_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, birth_date || null, gender, phone, address, description || null, center_id]
      ).then(result => {
        const staffId = result.insertId;

        // Get the created staff member
        return query(
          `SELECT s.*, c.name as center_name, c.field as center_field
           FROM staff s
           LEFT JOIN centers c ON s.center_id = c.id
           WHERE s.id = ?`,
          [staffId]
        ).then(staff => {
          res.status(201).json({
            status: 'success',
            message: 'Staff member created successfully',
            data: staff[0]
          });
        });
      });
    });
  }).catch(error => {
    console.error('Create staff error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   PUT /api/staff/:id
// @desc    Update staff member by ID
// @access  Private (Admin/Manager only)
router.put('/:id', [authenticateToken, requireAdminOrManager, ...staffValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const { name, birth_date, gender, phone, address, description, center_id } = req.body;

  // Check if staff exists
  query(
    'SELECT id FROM staff WHERE id = ?',
    [id]
  ).then(existingStaff => {
    if (existingStaff.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Staff member not found'
      });
    }

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

      // Check if phone number conflicts with existing staff
      query(
        'SELECT id FROM staff WHERE phone = ? AND id != ?',
        [phone, id]
      ).then(phoneConflict => {
        if (phoneConflict.length > 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Phone number already exists'
          });
        }

        // Update staff member
        return query(
          'UPDATE staff SET name = ?, birth_date = ?, gender = ?, phone = ?, address = ?, description = ?, center_id = ? WHERE id = ?',
          [name, birth_date || null, gender, phone, address, description || null, center_id, id]
        ).then(() => {
          // Get the updated staff member
          return query(
            `SELECT s.*, c.name as center_name, c.field as center_field
             FROM staff s
             LEFT JOIN centers c ON s.center_id = c.id
             WHERE s.id = ?`,
            [id]
          ).then(staff => {
            res.json({
              status: 'success',
              message: 'Staff member updated successfully',
              data: staff[0]
            });
          });
        });
      });
    });
  }).catch(error => {
    console.error('Update staff error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff member by ID
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdminOrManager], (req, res) => {
  const { id } = req.params;

  // Check if staff exists
  query(
    'SELECT id FROM staff WHERE id = ?',
    [id]
  ).then(existingStaff => {
    if (existingStaff.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Staff member not found'
      });
    }

    // Check if staff has associated project memberships
    query(
      'SELECT COUNT(*) as count FROM project_members WHERE staff_id = ?',
      [id]
    ).then(memberCount => {
      if (memberCount[0].count > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete staff member with associated project memberships'
        });
      }

      // Delete staff member
      return query('DELETE FROM staff WHERE id = ?', [id]).then(() => {
        res.json({
          status: 'success',
          message: 'Staff member deleted successfully'
        });
      });
    });
  }).catch(error => {
    console.error('Delete staff error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   GET /api/staff/:id/stats
// @desc    Get staff statistics
// @access  Private
router.get('/:id/stats', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check if staff exists
  query(
    'SELECT id FROM staff WHERE id = ?',
    [id]
  ).then(staff => {
    if (staff.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Staff member not found'
      });
    }

    // Get project membership statistics
    return query(
      `SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN end_time IS NULL THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN end_time IS NOT NULL THEN 1 ELSE 0 END) as completed_projects
       FROM project_members
       WHERE staff_id = ?`,
      [id]
    ).then(projectStats => {
      // Get project status distribution
      return query(
        `SELECT 
          p.project_status,
          COUNT(*) as count
         FROM project_members pm
         LEFT JOIN projects p ON pm.project_id = p.id
         WHERE pm.staff_id = ?
         GROUP BY p.project_status`,
        [id]
      ).then(statusStats => {
        res.json({
          status: 'success',
          data: {
            staffId: parseInt(id),
            projects: projectStats[0],
            statusDistribution: statusStats
          }
        });
      });
    });
  }).catch(error => {
    console.error('Get staff stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

module.exports = router; 