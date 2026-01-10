const { validationResult } = require('express-validator');
const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const filters = {
      status:        req.query.status,
      priority:      req.query.priority,
      search:        req.query.search,
      sort:          req.query.sort,
      dir:           req.query.dir,
      dueBefore:     req.query.dueBefore,
      excludeStatus: req.query.excludeStatus, // ← new: used for overdue filter
      limit:         req.query.limit,
      offset:        req.query.offset,
    };
    const tasks = await Task.findAll(req.user.id, filters);
    res.json({ success: true, data: { tasks, count: tasks.length } });
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { title, description, status, priority, dueDate, tags } = req.body;
    const taskId = await Task.create({ userId: req.user.id, title, description, status, priority, dueDate, tags });
    const task = await Task.findById(taskId, req.user.id);
    res.status(201).json({ success: true, message: 'Task created', data: { task } });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { title, description, status, priority, dueDate, tags } = req.body;
    const updated = await Task.update(req.params.id, req.user.id, { title, description, status, priority, dueDate, tags });
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findById(req.params.id, req.user.id);
    res.json({ success: true, message: 'Task updated', data: { task } });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const deleted = await Task.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await Task.getStats(req.user.id);
    res.json({ success: true, data: { stats } });
  } catch (err) {
    next(err);
  }
};

const bulkAction = async (req, res, next) => {
  try {
    const { action, ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array.' });
    }
    let affected = 0;
    if (action === 'delete') {
      affected = await Task.bulkDelete(ids, req.user.id);
    } else if (action === 'status' && status) {
      affected = await Task.bulkUpdateStatus(ids, req.user.id, status);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action.' });
    }
    res.json({ success: true, message: `Bulk ${action} applied to ${affected} tasks.`, data: { affected } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getStats, bulkAction };
