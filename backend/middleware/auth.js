const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token is required'
    });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (jwtError, decoded) => {
    if (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token'
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired'
        });
      } else {
        console.error('JWT verification error:', jwtError);
        return res.status(401).json({
          status: 'error',
          message: 'Token verification failed'
        });
      }
    }

    // Get user information from database
    query(
      'SELECT id, name, status, role_id FROM users WHERE id = ?',
      [decoded.userId]
    ).then(users => {
      if (users.length === 0) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const user = users[0];

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          status: 'error',
          message: 'User account is not active'
        });
      }

      // Get role information
      return query(
        'SELECT name FROM roles WHERE id = ?',
        [user.role_id]
      ).then(roles => {
        // Add user info to request object
        req.user = {
          id: user.id,
          name: user.name,
          status: user.status,
          role: roles.length > 0 ? roles[0].name : null
        };

        next();
      });
    }).catch(error => {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Authentication failed'
      });
    });
  });
};

// Middleware to check if user has required role
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Convert to array if single role
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is admin or manager
const requireAdminOrManager = requireRole(['admin', 'manager']);

// Middleware to check if user can access resource
const canAccessResource = (resourceType) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next(); // Admin can access everything
    }

    const resourceId = req.params.id || req.body.id;
    if (!resourceId) {
      return next();
    }

    let sqlQuery = '';
    let params = [];

    switch (resourceType) {
      case 'center':
        sqlQuery = `
          SELECT c.id FROM centers c
          INNER JOIN staff s ON s.center_id = c.id
          WHERE c.id = ? AND s.name = ?
        `;
        params = [resourceId, req.user.name];
        break;

      case 'project':
        sqlQuery = `
          SELECT p.id FROM projects p
          INNER JOIN centers c ON p.center_id = c.id
          INNER JOIN staff s ON s.center_id = c.id
          WHERE p.id = ? AND s.name = ?
        `;
        params = [resourceId, req.user.name];
        break;

      case 'staff':
        sqlQuery = `
          SELECT s.id FROM staff s
          WHERE s.id = ? AND s.name = ?
        `;
        params = [resourceId, req.user.name];
        break;

      default:
        return next();
    }

    query(sqlQuery, params).then(results => {
      if (results.length === 0 && req.user.role !== 'manager') {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied to this resource'
        });
      }

      next();
    }).catch(error => {
      console.error('Resource access check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to check resource access'
      });
    });
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  canAccessResource
}; 