const { pool } = require('../config/database');

class Task {
  static async create({ userId, title, description, status, priority, dueDate, tags }) {
    const [result] = await pool.execute(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description || null, status || 'todo', priority || 'medium', dueDate || null, JSON.stringify(tags || [])]
    );
    return result.insertId;
  }

  static async findAll(userId, filters = {}) {
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.excludeStatus) {
      query += ' AND status != ?';
      params.push(filters.excludeStatus);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.dueBefore) {
      query += ' AND due_date <= ?';
      params.push(filters.dueBefore);
    }

    const sortMap = { created: 'created_at', due: 'due_date', priority: 'priority', title: 'title' };
    const sortCol = sortMap[filters.sort] || 'created_at';
    const sortDir = filters.dir === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortCol} ${sortDir}`;

    // FIX: inline LIMIT/OFFSET directly as integers in the query string
    // instead of using ? parameters — mysql2 prepared statements mishandle
    // LIMIT/OFFSET params and throw "Incorrect arguments to mysqld_stmt_execute"
    if (filters.limit) {
      const limit  = Math.max(1, parseInt(filters.limit)  || 20);
      const offset = Math.max(0, parseInt(filters.offset) || 0);
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags || [],
    }));
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows.length) return null;
    const task = rows[0];
    return { ...task, tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags || [] };
  }

  static async update(id, userId, data) {
    const fields = [];
    const params = [];

    if (data.title !== undefined)       { fields.push('title = ?');       params.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
    if (data.status !== undefined)      { fields.push('status = ?');      params.push(data.status); }
    if (data.priority !== undefined)    { fields.push('priority = ?');    params.push(data.priority); }
    if (data.dueDate !== undefined)     { fields.push('due_date = ?');    params.push(data.dueDate || null); }
    if (data.tags !== undefined)        { fields.push('tags = ?');        params.push(JSON.stringify(data.tags)); }

    if (!fields.length) return false;
    params.push(id, userId);

    const [result] = await pool.execute(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async getStats(userId) {
    // 'high_priority' backtick-escaped — HIGH is a reserved word in MySQL
    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(status = 'todo') as todo,
        SUM(status = 'in_progress') as in_progress,
        SUM(status = 'done') as done,
        SUM(priority = 'high' AND status != 'done') as \`high_priority\`,
        SUM(due_date < CURDATE() AND status != 'done') as overdue
       FROM tasks WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async bulkUpdateStatus(ids, userId, status) {
    if (!ids.length) return 0;
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.execute(
      `UPDATE tasks SET status = ? WHERE id IN (${placeholders}) AND user_id = ?`,
      [status, ...ids, userId]
    );
    return result.affectedRows;
  }

  static async bulkDelete(ids, userId) {
    if (!ids.length) return 0;
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.execute(
      `DELETE FROM tasks WHERE id IN (${placeholders}) AND user_id = ?`,
      [...ids, userId]
    );
    return result.affectedRows;
  }
}

module.exports = Task;
