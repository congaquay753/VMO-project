const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const userValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be active, inactive, or suspended'),
  body('role_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Role ID must be a positive integer')
];

// @route   GET /api/users
// @desc    Get all users with optional filtering and pagination
// @access  Private (Admin only)
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      role_id = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['id', 'name', 'status', 'role_id', 'created_at', 'updated_at'];
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
      whereClause += ' AND u.name LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm);
    }

    if (status) {
      whereClause += ' AND u.status = ?';
      params.push(status);
    }

    if (role_id) {
      whereClause += ' AND u.role_id = ?';
      params.push(parseInt(role_id));
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get users with role information
    const [users] = await pool.execute(
      `SELECT 
        u.id,
        u.name,
        u.status,
        u.role_id,
        u.created_at,
        u.updated_at,
        r.name as role_name,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as has_staff_profile
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN staff s ON u.id = s.user_id
       ${whereClause}
       ORDER BY u.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get unique roles for filter options
    const [roles] = await pool.execute(
      'SELECT id, name FROM roles ORDER BY name'
    );

    // Get unique statuses for filter options
    const [statuses] = await pool.execute(
      'SELECT DISTINCT status FROM users ORDER BY status'
    );

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          availableRoles: roles,
          availableStatuses: statuses.map(s => s.status)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID with detailed information
// @access  Private (Admin only)
router.get('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Get user details
    const [users] = await pool.execute(
      `SELECT u.*, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get staff profile if exists
    let staffProfile = null;
    if (user.role_id) {
      const [staff] = await pool.execute(
        `SELECT s.*, c.name as center_name, c.field as center_field
         FROM staff s
         LEFT JOIN centers c ON s.center_id = c.id
         WHERE s.user_id = ?`,
        [id]
      );
      
      if (staff.length > 0) {
        staffProfile = staff[0];
      }
    }

    // Get project memberships if staff profile exists
    let projectMemberships = [];
    if (staffProfile) {
      const [memberships] = await pool.execute(
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
        [staffProfile.id]
      );
      
      projectMemberships = memberships;
    }

    res.json({
      status: 'success',
      data: {
        user,
        staffProfile,
        projectMemberships,
        stats: {
          projectCount: projectMemberships.length,
          activeProjects: projectMemberships.filter(p => !p.end_time).length
        }
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', [authenticateToken, requireAdmin, ...userValidation], async (req, res) => {
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

    const { name, password, status, role_id } = req.body;

    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE name = ?',
      [name]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Check if role exists (if role_id is provided)
    if (role_id) {
      const [roles] = await pool.execute(
        'SELECT id FROM roles WHERE id = ?',
        [role_id]
      );

      if (roles.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Role not found'
        });
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, password, status, role_id) VALUES (?, ?, ?, ?)',
      [name, hashedPassword, status || 'active', role_id || null]
    );

    const userId = result.insertId;

    // Get the created user
    const [users] = await pool.execute(
      `SELECT u.*, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: users[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private (Admin only)
router.put('/:id', [authenticateToken, requireAdmin, ...userValidation], async (req, res) => {
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
    const { name, password, status, role_id } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if new username conflicts with existing users
    const [nameConflict] = await pool.execute(
      'SELECT id FROM users WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameConflict.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Check if role exists (if role_id is provided)
    if (role_id) {
      const [roles] = await pool.execute(
        'SELECT id FROM roles WHERE id = ?',
        [role_id]
      );

      if (roles.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Role not found'
        });
      }
    }

    // Build update query
    let updateQuery = 'UPDATE users SET name = ?, status = ?, role_id = ?';
    let updateParams = [name, status || 'active', role_id || null];

    // Add password to update if provided
    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateQuery += ', password = ?';
      updateParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    // Update user
    await pool.execute(updateQuery, updateParams);

    // Get the updated user
    const [users] = await pool.execute(
      `SELECT u.*, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: users[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user has associated staff profile
    const [staffCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM staff WHERE user_id = ?',
      [id]
    );

    if (staffCount[0].count > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete user with associated staff profile'
      });
    }

    // Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/:id/stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get staff profile statistics
    const [staffStats] = await pool.execute(
      `SELECT 
        COUNT(*) as has_staff_profile,
        SUM(CASE WHEN s.center_id IS NOT NULL THEN 1 ELSE 0 END) as has_center_assignment
       FROM staff s
       WHERE s.user_id = ?`,
      [id]
    );

    // Get project membership statistics
    const [projectStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN pm.end_time IS NULL THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN pm.end_time IS NOT NULL THEN 1 ELSE 0 END) as completed_projects
       FROM project_members pm
       LEFT JOIN staff s ON pm.staff_id = s.id
       WHERE s.user_id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        userId: parseInt(id),
        staff: staffStats[0],
        projects: projectStats[0]
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 