const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const userValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Role ID must be a positive integer')
];

// @route   GET /api/users
// @desc    Get all users with optional filtering and pagination
// @access  Private (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    role_id = '',
    status = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 1000);
  const offset = (safePage - 1) * safeLimit;
  const validSortFields = ['id', 'name', 'status', 'role_id', 'created_at', 'updated_at'];
  const validSortOrders = ['ASC', 'DESC'];

  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = validSortOrders.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';

  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  let params = [];

  if (search) {
    whereClause += ' AND u.name LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm);
  }

  if (role_id) {
    whereClause += ' AND u.role_id = ?';
    params.push(parseInt(role_id));
  }

  if (status) {
    whereClause += ' AND u.status = ?';
    params.push(status);
  }

  try {
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const users = await query(
      `SELECT 
        u.id,
        u.name,
        u.status,
        u.role_id,
        u.created_at,
        u.updated_at,
        r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ${whereClause}
       ORDER BY u.${sortField} ${sortDirection}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const [roles, statuses] = await Promise.all([
      query('SELECT id, name FROM roles ORDER BY name'),
      query('SELECT DISTINCT status FROM users ORDER BY status')
    ]);

    return res.json({
      status: 'success',
      message: 'Fetched users successfully',
      data: {
        users,
        pagination: {
          currentPage: safePage,
          totalPages: Math.ceil(total / safeLimit),
          totalItems: total,
          itemsPerPage: safeLimit,
          hasNextPage: safePage < Math.ceil(total / safeLimit),
          hasPrevPage: safePage > 1
        },
        filters: {
          roles: roles.map(r => ({ id: r.id, name: r.name })),
          statuses: statuses.map(s => s.status)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID with detailed information
// @access  Private (Admin only)
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Get user details
  query(
    `SELECT u.*, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
    [id]
  ).then(users => {
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get staff information if exists
    return query(
      `SELECT s.id, s.gender, s.phone, s.address, s.description, s.center_id,
              c.name as center_name, c.field as center_field
       FROM staff s
       LEFT JOIN centers c ON s.center_id = c.id
       WHERE s.name = ?`,
      [user.name]
    ).then(staff => {
      // Get project memberships if exists
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
         LEFT JOIN staff s ON pm.staff_id = s.id
         WHERE s.name = ?`,
        [user.name]
      ).then(memberships => {
        res.json({
          status: 'success',
          data: {
            user: {
              id: user.id,
              name: user.name,
              status: user.status,
              role: user.role_name
            },
            staff: staff.length > 0 ? staff[0] : null,
            projectMemberships: memberships,
            stats: {
              projectCount: memberships.length,
              activeProjects: memberships.filter(m => !m.end_time).length
            }
          }
        });
      });
    });
  }).catch(error => {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', [authenticateToken, requireAdmin, ...userValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, username, password, role_id } = req.body;

  // Check if username already exists
  query(
    'SELECT id FROM users WHERE name = ?',
    [username]
  ).then(existingUsers => {
    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Check if role exists
    return query(
      'SELECT id FROM roles WHERE id = ?',
      [role_id]
    ).then(roles => {
      if (roles.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Role not found'
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      bcrypt.hash(password, saltRounds).then(hashedPassword => {
        // Insert new user
        return query(
          'INSERT INTO users (name, password, role_id) VALUES (?, ?, ?)',
          [username, hashedPassword, role_id]
        ).then(result => {
          const userId = result.insertId;

          // Get the created user
          return query(
            `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?`,
            [userId]
          ).then(users => {
            const user = users[0];

            res.status(201).json({
              status: 'success',
              message: 'User created successfully',
              data: {
                id: user.id,
                name: user.name,
                status: user.status,
                role: user.role_name
              }
            });
          });
        });
      });
    });
  }).catch(error => {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private (Admin only)
router.put('/:id', [authenticateToken, requireAdmin, ...userValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const { name, username, password, role_id, status } = req.body;

  // Check if user exists
  query(
    'SELECT id FROM users WHERE id = ?',
    [id]
  ).then(existingUsers => {
    if (existingUsers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if new username conflicts with existing users
    return query(
      'SELECT id FROM users WHERE name = ? AND id != ?',
      [username, id]
    ).then(nameConflict => {
      if (nameConflict.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Username already exists'
        });
      }

      // Check if role exists
      return query(
        'SELECT id FROM roles WHERE id = ?',
        [role_id]
      ).then(roles => {
        if (roles.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Role not found'
          });
        }

        // Build update query
        let updateQuery = 'UPDATE users SET name = ?, role_id = ?';
        let updateParams = [username, role_id];

        if (status) {
          updateQuery += ', status = ?';
          updateParams.push(status);
        }

        if (password) {
          // Hash new password
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          bcrypt.hash(password, saltRounds).then(hashedPassword => {
            updateQuery += ', password = ?';
            updateParams.push(hashedPassword);
            updateParams.push(id);

            // Update user
            return query(updateQuery, updateParams).then(() => {
              // Get the updated user
              return query(
                `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
                 FROM users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`,
                [id]
              ).then(users => {
                const user = users[0];

                res.json({
                  status: 'success',
                  message: 'User updated successfully',
                  data: {
                    id: user.id,
                    name: user.name,
                    status: user.status,
                    role: user.role_name
                  }
                });
              });
            });
          });
        } else {
          updateParams.push(id);

          // Update user without password
          return query(updateQuery, updateParams).then(() => {
            // Get the updated user
            return query(
              `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
               FROM users u
               LEFT JOIN roles r ON u.role_id = r.id
               WHERE u.id = ?`,
              [id]
            ).then(users => {
              const user = users[0];

              res.json({
                status: 'success',
                message: 'User updated successfully',
                data: {
                  id: user.id,
                  name: user.name,
                  status: user.status,
                  role: user.role_name
                }
              });
            });
          });
        }
      });
    });
  }).catch(error => {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], (req, res) => {
  const { id } = req.params;

  // Check if user exists
  query(
    'SELECT id FROM users WHERE id = ?',
    [id]
  ).then(existingUsers => {
    if (existingUsers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user has associated staff
    return query(
      'SELECT COUNT(*) as count FROM staff WHERE name = (SELECT name FROM users WHERE id = ?)',
      [id]
    ).then(staffCount => {
      if (staffCount[0].count > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete user with associated staff'
        });
      }

      // Delete user
      return query('DELETE FROM users WHERE id = ?', [id]).then(() => {
        res.json({
          status: 'success',
          message: 'User deleted successfully'
        });
      });
    });
  }).catch(error => {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/:id/stats', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Check if user exists
  query(
    'SELECT id, name FROM users WHERE id = ?',
    [id]
  ).then(users => {
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const userName = users[0].name;

    // Get staff statistics
    return query(
      `SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_count,
        SUM(CASE WHEN gender = 'other' THEN 1 ELSE 0 END) as other_count
       FROM staff
       WHERE name = ?`,
      [userName]
    ).then(staffStats => {
      // Get project statistics
      return query(
        `SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN project_status = 'planning' THEN 1 ELSE 0 END) as planning_count,
        SUM(CASE WHEN project_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN project_status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN project_status = 'on_hold' THEN 1 ELSE 0 END) as on_hold_count,
        SUM(CASE WHEN project_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       INNER JOIN staff s ON pm.staff_id = s.id
       WHERE s.name = ?`,
        [userName]
      ).then(projectStats => {
        res.json({
          status: 'success',
          data: {
            userId: parseInt(id),
            userName,
            staff: staffStats[0],
            projects: projectStats[0]
          }
        });
      });
    });
  }).catch(error => {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

module.exports = router; 