const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const userId = await User.create({ name, email, password });
    const user = await User.findById(userId);
    const token = generateToken(userId);

    res.status(201).json({ success: true, message: 'Account created successfully', data: { user, token } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ success: true, message: 'Login successful', data: { user: userWithoutPassword, token } });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarColor } = req.body;
    await User.updateProfile(req.user.id, { name, avatarColor });
    const updated = await User.findById(req.user.id);
    res.json({ success: true, message: 'Profile updated', data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);
    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    await User.changePassword(req.user.id, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
