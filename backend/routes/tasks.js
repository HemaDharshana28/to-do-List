const express = require('express');
const { body } = require('express-validator');
const { getTasks, getTask, createTask, updateTask, deleteTask, getStats, bulkAction } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks/stats
router.get('/stats', getStats);

// POST /api/tasks/bulk
router.post('/bulk', bulkAction);

// GET /api/tasks
router.get('/', getTasks);

// POST /api/tasks
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
  body('tags').optional().isArray(),
], createTask);

// GET /api/tasks/:id
router.get('/:id', getTask);

// PUT /api/tasks/:id
router.put('/:id', [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional({ nullable: true }),
  body('tags').optional().isArray(),
], updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

module.exports = router;
