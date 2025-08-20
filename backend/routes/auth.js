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
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, password } = req.body;

  try {
    const users = await query(
      `SELECT u.id, u.name, u.password, u.status, u.role_id, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.name = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(401).json({ status: 'error', message: `Account is ${user.status}` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    let staffInfo = null;
    if (user.role_id) {
      const staff = await query(
        `SELECT s.id, s.gender, s.phone, s.address, s.description, s.center_id,
                c.name as center_name, c.field as center_field
         FROM staff s
         LEFT JOIN centers c ON s.center_id = c.id
         WHERE s.name = ?`,
        [username]
      );
      if (staff.length > 0) staffInfo = staff[0];
    }

    const token = jwt.sign(
      { userId: user.id, username: user.name, role: user.role_name, roleId: user.role_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    delete user.password;

    return res.json({
      status: 'success',
      message: 'Login successful',
      data: { user: { ...user, staff: staffInfo }, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (can be restricted later)
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, username, password, role_id } = req.body;

  try {
    const existingUsers = await query('SELECT id FROM users WHERE name = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Username already exists' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await query(
      'INSERT INTO users (name, password, role_id) VALUES (?, ?, ?)',
      [username, hashedPassword, role_id || null]
    );

    const userId = result.insertId;
    const users = await query(
      `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    const user = users[0];
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user: { id: user.id, name: user.name, status: user.status, role: user.role_name } }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  return res.json({ status: 'success', message: 'Logout successful' });
});

// @route   GET /api/auth/me
// @desc    Get current user information
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const users = await query(
      `SELECT u.id, u.name, u.status, u.role_id, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const user = users[0];
    let staffInfo = null;
    if (user.role_id) {
      const staff = await query(
        `SELECT s.id, s.gender, s.phone, s.address, s.description, s.center_id,
                c.name as center_name, c.field as center_field
         FROM staff s
         LEFT JOIN centers c ON s.center_id = c.id
         WHERE s.name = ?`,
        [user.name]
      );
      if (staff.length > 0) staffInfo = staff[0];
    }

    return res.json({
      status: 'success',
      data: {
        user: { id: user.id, name: user.name, status: user.status, role: user.role_name },
        staff: staffInfo
      }
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
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

  try {
    const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    return res.json({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

module.exports = router; 