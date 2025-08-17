const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const roleValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Role name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Role name can only contain letters, numbers, spaces, and underscores')
];

// @route   GET /api/roles
// @desc    Get all roles with optional filtering and pagination
// @access  Private (Admin only)
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['id', 'name', 'created_at', 'updated_at'];
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
      whereClause += ' AND r.name LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM roles r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get roles with user count
    const [roles] = await pool.execute(
      `SELECT 
        r.id,
        r.name,
        r.created_at,
        r.updated_at,
        COUNT(u.id) as user_count
       FROM roles r
       LEFT JOIN users u ON r.id = u.role_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY r.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      status: 'success',
      data: {
        roles,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/roles/:id
// @desc    Get role by ID with detailed information
// @access  Private (Admin only)
router.get('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Get role details
    const [roles] = await pool.execute(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    const role = roles[0];

    // Get users with this role
    const [users] = await pool.execute(
      `SELECT 
        u.id,
        u.name,
        u.status,
        u.created_at,
        u.updated_at,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as has_staff_profile
       FROM users u
       LEFT JOIN staff s ON u.id = s.user_id
       WHERE u.role_id = ?`,
      [id]
    );

    // Get role usage statistics
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(u.id) as total_users,
        SUM(CASE WHEN u.status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN u.status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN u.status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
       FROM users u
       WHERE u.role_id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        role,
        users,
        stats: stats[0]
      }
    });

  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/roles
// @desc    Create a new role
// @access  Private (Admin only)
router.post('/', [authenticateToken, requireAdmin, ...roleValidation], async (req, res) => {
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

    const { name } = req.body;

    // Check if role name already exists
    const [existingRoles] = await pool.execute(
      'SELECT id FROM roles WHERE name = ?',
      [name]
    );

    if (existingRoles.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Role name already exists'
      });
    }

    // Insert new role
    const [result] = await pool.execute(
      'INSERT INTO roles (name) VALUES (?)',
      [name]
    );

    const roleId = result.insertId;

    // Get the created role
    const [roles] = await pool.execute(
      'SELECT * FROM roles WHERE id = ?',
      [roleId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Role created successfully',
      data: roles[0]
    });

  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/roles/:id
// @desc    Update role by ID
// @access  Private (Admin only)
router.put('/:id', [authenticateToken, requireAdmin, ...roleValidation], async (req, res) => {
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
    const { name } = req.body;

    // Check if role exists
    const [existingRoles] = await pool.execute(
      'SELECT id FROM roles WHERE id = ?',
      [id]
    );

    if (existingRoles.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Check if new name conflicts with existing roles
    const [nameConflict] = await pool.execute(
      'SELECT id FROM roles WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameConflict.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Role name already exists'
      });
    }

    // Update role
    await pool.execute(
      'UPDATE roles SET name = ? WHERE id = ?',
      [name, id]
    );

    // Get the updated role
    const [roles] = await pool.execute(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    res.json({
      status: 'success',
      message: 'Role updated successfully',
      data: roles[0]
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/roles/:id
// @desc    Delete role by ID
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const [existingRoles] = await pool.execute(
      'SELECT id FROM roles WHERE id = ?',
      [id]
    );

    if (existingRoles.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Check if role has associated users
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id]
    );

    if (userCount[0].count > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete role with associated users'
      });
    }

    // Delete role
    await pool.execute('DELETE FROM roles WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/roles/:id/stats
// @desc    Get role statistics
// @access  Private (Admin only)
router.get('/:id/stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const [roles] = await pool.execute(
      'SELECT id FROM roles WHERE id = ?',
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Get user statistics
    const [userStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
       FROM users
       WHERE role_id = ?`,
      [id]
    );

    // Get staff profile statistics
    const [staffStats] = await pool.execute(
      `SELECT 
        COUNT(s.id) as total_staff,
        SUM(CASE WHEN s.center_id IS NOT NULL THEN 1 ELSE 0 END) as assigned_to_center,
        SUM(CASE WHEN s.center_id IS NULL THEN 1 ELSE 0 END) as unassigned
       FROM users u
       LEFT JOIN staff s ON u.id = s.user_id
       WHERE u.role_id = ?`,
      [id]
    );

    // Get project participation statistics
    const [projectStats] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT pm.project_id) as total_projects,
        COUNT(DISTINCT pm.staff_id) as staff_in_projects,
        SUM(CASE WHEN pm.end_time IS NULL THEN 1 ELSE 0 END) as active_participations
       FROM users u
       LEFT JOIN staff s ON u.id = s.user_id
       LEFT JOIN project_members pm ON s.id = pm.staff_id
       WHERE u.role_id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        roleId: parseInt(id),
        users: userStats[0],
        staff: staffStats[0],
        projects: projectStats[0]
      }
    });

  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 