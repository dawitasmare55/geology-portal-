const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// LOGIN (both staff and students)
router.post('/login', async (req, res) => {
  const { identifier, password, role } = req.body;

  try {
    const field = role === 'staff' ? 'email' : 'username';
    const result = await pool.query(
      `SELECT * FROM users WHERE ${field} = $1 AND role = $2`,
      [identifier, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role,
        studentId: user.student_id,
        year: user.year,
        rank: user.rank,
        specialization: user.specialization,
        profilePic: user.profile_pic,
        needsPasswordChange: user.needs_password_change
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CHANGE PASSWORD
router.post('/change-password', authenticate, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, needs_password_change = false WHERE id = $2',
      [hash, req.user.id]
    );
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET CURRENT USER
router.get('/me', authenticate, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, full_name, email, username, role, student_id, year, rank, specialization, profile_pic, bio, phone, office FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;