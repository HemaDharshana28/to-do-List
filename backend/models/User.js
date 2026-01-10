const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, avatar_color) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, avatarColor]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar_color, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  static async updateProfile(id, { name, avatarColor }) {
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, avatar_color = ? WHERE id = ?',
      [name, avatarColor, id]
    );
    return result.affectedRows > 0;
  }

  static async changePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 12);
    const [result] = await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
