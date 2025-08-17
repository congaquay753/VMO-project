const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const registerValidation = [
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

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, password } = req.body;

  // Find user by username
  query(
    `SELECT u.id, u.name, u.password, u.status, u.role_id, r.name as role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.name = ?`,
    [username]
  ).then(users => {
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: `Account is ${user.status}`
      });
    }

    // Verify password
    bcrypt.compare(password, user.password).then(isPasswordValid => {
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Get staff information if exists
      let staffInfo = null;
      if (user.role_id) {
        query(
          `SELECT s.id, s.gender, s.phone, s.address, s.description, s.center_id,
                  c.name as center_name, c.field as center_field
           FROM staff s
           LEFT JOIN centers c ON s.center_id = c.id
           WHERE s.name = ?`,
          [username]
        ).then(staff => {
          if (staff.length > 0) {
            staffInfo = staff[0];
          }
          
          // Generate JWT token
          const token = jwt.sign(
            { 
              userId: user.id, 
              username: user.name, 
              role: user.role_name,
              roleId: user.role_id
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          // Remove password from response
          delete user.password;

          res.json({
            status: 'success',
            message: 'Login successful',
            data: {
              user: {
                ...user,
                staff: staffInfo
              },
              token
            }
          });
        }).catch(error => {
          console.error('Error fetching staff info:', error);
          // Continue without staff info
          const token = jwt.sign(
            { 
              userId: user.id, 
              username: user.name, 
              role: user.role_name,
              roleId: user.role_id
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          delete user.password;

          res.json({
            status: 'success',
            message: 'Login successful',
            data: {
              user: {
                ...user,
                staff: null
              },
              token
            }
          });
        });
      } else {
        // Generate JWT token without staff info
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.name, 
            role: user.role_name,
            roleId: user.role_id
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        delete user.password;

        res.json({
          status: 'success',
          message: 'Login successful',
          data: {
            user: {
              ...user,
              staff: null
            },
            token
          }
        });
      }
    });
  }).catch(error => {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (can be restricted later)
router.post('/register', registerValidation, (req, res) => {
  // Check validation errors
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

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    bcrypt.hash(password, saltRounds).then(hashedPassword => {
      // Insert new user
      query(
        'INSERT INTO users (name, password, role_id) VALUES (?, ?, ?)',
        [username, hashedPassword, role_id || null]
      ).then(result => {
        const userId = result.insertId;

        // Get the created user
        query(
          `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
           FROM users u
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE u.id = ?`,
          [userId]
        ).then(users => {
          const user = users[0];

          res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
              user: {
                id: user.id,
                name: user.name,
                status: user.status,
                role: user.role_name
              }
            }
          });
        }).catch(error => {
          console.error('Error fetching registered user:', error);
          res.status(500).json({
            status: 'error',
            message: 'Internal server error'
          });
        });
      }).catch(error => {
        console.error('Error hashing password:', error);
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      });
    }).catch(error => {
      console.error('Error hashing password:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    });
  }).catch(error => {
    console.error('Error checking existing username:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  res.json({
    status: 'success',
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user information
// @access  Private
router.get('/me', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Get user information
  query(
    `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
    [userId]
  ).then(users => {
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = users[0];

    let staffInfo = null;
    if (user.role_id) {
      query(
        `SELECT s.id, s.gender, s.phone, s.address, s.description, s.center_id,
                c.name as center_name, c.field as center_field
         FROM staff s
         LEFT JOIN centers c ON s.center_id = c.id
         WHERE s.name = ?`,
        [user.name]
      ).then(staff => {
        if (staff.length > 0) {
          staffInfo = staff[0];
        }
        res.json({
          status: 'success',
          data: {
            user: {
              id: user.id,
              name: user.name,
              status: user.status,
              role: user.role_name
            },
            staff: staffInfo
          }
        });
      }).catch(error => {
        console.error('Error fetching user staff info:', error);
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      });
    } else {
      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            status: user.status,
            role: user.role_name
          },
          staff: null
        }
      });
    }
  }).catch(error => {
    console.error('Error fetching user info:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get current user password
  query(
    'SELECT password FROM users WHERE id = ?',
    [userId]
  ).then(users => {
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify current password
    bcrypt.compare(currentPassword, users[0].password).then(isCurrentPasswordValid => {
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      bcrypt.hash(newPassword, saltRounds).then(hashedNewPassword => {
        // Update password
        query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedNewPassword, userId]
        ).then(() => {
          res.json({
            status: 'success',
            message: 'Password changed successfully'
          });
        }).catch(error => {
          console.error('Error changing password:', error);
          res.status(500).json({
            status: 'error',
            message: 'Internal server error'
          });
        });
      }).catch(error => {
        console.error('Error hashing new password:', error);
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      });
    }).catch(error => {
      console.error('Error comparing current password:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    });
  }).catch(error => {
    console.error('Error fetching user password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

module.exports = router; 