const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');

const router = express.Router();

// Validation rules - chỉ validate bắt buộc
const centerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Center name is required'),
  body('field')
    .trim()
    .notEmpty()
    .withMessage('Field is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
];

// @route   GET /api/centers
// @desc    Get all centers with optional filtering and pagination
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    field = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  const validSortFields = ['id', 'name', 'field', 'address', 'created_at', 'updated_at'];
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
    whereClause += ' AND (c.name LIKE ? OR c.field LIKE ? OR c.address LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (field) {
    whereClause += ' AND c.field = ?';
    params.push(field);
  }

  // Get total count
  query(
    `SELECT COUNT(*) as total FROM centers c ${whereClause}`,
    params
  ).then(countResult => {
    const total = countResult[0].total;

    // Get centers with staff and project counts
    return query(
      `SELECT 
        c.id,
        c.name,
        c.field,
        c.address,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT s.id) as staff_count,
        COUNT(DISTINCT p.id) as project_count
       FROM centers c
       LEFT JOIN staff s ON c.id = s.center_id
       LEFT JOIN projects p ON c.id = p.center_id
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    ).then(centers => {
      // Get unique fields for filter options
      return query(
        'SELECT DISTINCT field FROM centers ORDER BY field'
      ).then(fields => {
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
          status: 'success',
          data: {
            centers,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: total,
              itemsPerPage: parseInt(limit),
              hasNextPage,
              hasPrevPage
            },
            filters: {
              fields: fields.map(f => f.field)
            }
          }
        });
      });
    });
  }).catch(error => {
    console.error('Error fetching centers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch centers'
    });
  });
});

// @route   GET /api/centers/:id
// @desc    Get center by ID with detailed information
// @access  Private
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Get center details
  query(
    'SELECT * FROM centers WHERE id = ?',
    [id]
  ).then(centers => {
    if (centers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Center not found'
      });
    }

    const center = centers[0];

    // Get staff members
    return query(
      `SELECT s.id, s.name, s.gender, s.phone, s.address, s.description
         FROM staff s
         WHERE s.center_id = ?`,
      [id]
    ).then(staff => {
      // Get projects
      return query(
        `SELECT id, name, description, project_status, created_at, updated_at
         FROM projects
         WHERE center_id = ?`,
        [id]
      ).then(projects => {
        res.json({
          status: 'success',
          data: {
            center,
            staff,
            projects,
            stats: {
              staffCount: staff.length,
              projectCount: projects.length
            }
          }
        });
      });
    });
  }).catch(error => {
    console.error('Get center by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   POST /api/centers
// @desc    Create a new center
// @access  Private (Admin/Manager only)
router.post('/', [authenticateToken, requireAdminOrManager, ...centerValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, field, address } = req.body;

  // Check if center name already exists
  query(
    'SELECT id FROM centers WHERE name = ?',
    [name]
  ).then(existingCenters => {
    if (existingCenters.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Center name already exists'
      });
    }

    // Insert new center
    return query(
      'INSERT INTO centers (name, field, address) VALUES (?, ?, ?)',
      [name, field, address]
    ).then(result => {
      const centerId = result.insertId;

      // Get the created center
      return query(
        'SELECT * FROM centers WHERE id = ?',
        [centerId]
      ).then(centers => {
        res.status(201).json({
          status: 'success',
          message: 'Center created successfully',
          data: centers[0]
        });
      });
    });
  }).catch(error => {
    console.error('Create center error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   PUT /api/centers/:id
// @desc    Update center by ID
// @access  Private (Admin/Manager only)
router.put('/:id', [authenticateToken, requireAdminOrManager, ...centerValidation], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const { name, field, address } = req.body;

  // Check if center exists
  query(
    'SELECT id FROM centers WHERE id = ?',
    [id]
  ).then(existingCenters => {
    if (existingCenters.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Center not found'
      });
    }

    // Check if new name conflicts with existing centers
    return query(
      'SELECT id FROM centers WHERE name = ? AND id != ?',
      [name, id]
    ).then(nameConflict => {
      if (nameConflict.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Center name already exists'
        });
      }

      // Update center
      return query(
        'UPDATE centers SET name = ?, field = ?, address = ? WHERE id = ?',
        [name, field, address, id]
      ).then(() => {
        // Get the updated center
        return query(
          'SELECT * FROM centers WHERE id = ?',
          [id]
        ).then(centers => {
          res.json({
            status: 'success',
            message: 'Center updated successfully',
            data: centers[0]
          });
        });
      });
    });
  }).catch(error => {
    console.error('Update center error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   DELETE /api/centers/:id
// @desc    Delete center by ID
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdminOrManager], (req, res) => {
  const { id } = req.params;

  // Check if center exists
  query(
    'SELECT id FROM centers WHERE id = ?',
    [id]
  ).then(existingCenters => {
    if (existingCenters.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Center not found'
      });
    }

    // Check if center has associated staff or projects
    return query(
      'SELECT COUNT(*) as count FROM staff WHERE center_id = ?',
      [id]
    ).then(staffCount => {
      return query(
        'SELECT COUNT(*) as count FROM projects WHERE center_id = ?',
        [id]
      ).then(projectCount => {
        if (staffCount[0].count > 0 || projectCount[0].count > 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Cannot delete center with associated staff or projects'
          });
        }

        // Delete center
        return query('DELETE FROM centers WHERE id = ?', [id]).then(() => {
          res.json({
            status: 'success',
            message: 'Center deleted successfully'
          });
        });
      });
    });
  }).catch(error => {
    console.error('Delete center error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

// @route   GET /api/centers/:id/stats
// @desc    Get center statistics
// @access  Private
router.get('/:id/stats', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check if center exists
  query(
    'SELECT id FROM centers WHERE id = ?',
    [id]
  ).then(centers => {
    if (centers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Center not found'
      });
    }

    // Get staff statistics
    return query(
      `SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_count,
        SUM(CASE WHEN gender = 'other' THEN 1 ELSE 0 END) as other_count
       FROM staff
       WHERE center_id = ?`,
      [id]
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
       FROM projects
       WHERE center_id = ?`,
        [id]
      ).then(projectStats => {
        res.json({
          status: 'success',
          data: {
            centerId: parseInt(id),
            staff: staffStats[0],
            projects: projectStats[0]
          }
        });
      });
    });
  }).catch(error => {
    console.error('Get center stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });
});

module.exports = router; 