const express = require('express');
const pool = require('../db/database');
const { authenticate } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

const router = express.Router();

// Upload/change profile picture
router.post('/photo', authenticate, uploadProfile.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/profiles/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_pic=$1 WHERE id=$2', [url, req.user.id]);
    res.json({ profilePic: url });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update bio/phone/office
router.put('/', authenticate, async (req, res) => {
  try {
    const { bio, phone, office } = req.body;
    await pool.query(
      'UPDATE users SET bio=$1, phone=$2, office=$3 WHERE id=$4',
      [bio, phone, office, req.user.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile (public view)
router.get('/:userId', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, full_name, email, role, rank, specialization, profile_pic, bio, phone, office
       FROM users WHERE id=$1`,
      [req.params.userId]
    );
    res.json(r.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =================== ACHIEVEMENTS ===================

router.get('/:userId/achievements', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM achievements WHERE user_id=$1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/achievements', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const r = await pool.query(
      'INSERT INTO achievements (user_id, text) VALUES ($1,$2) RETURNING *',
      [req.user.id, text]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/achievements/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM achievements WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =================== DOCUMENTS ===================

router.post('/documents', authenticate, uploadProfile.single('doc'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/profiles/${req.file.filename}`;
    const r = await pool.query(
      'INSERT INTO documents (user_id, name, file_url, file_name, file_type) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, req.body.name, url, req.file.originalname, req.file.mimetype]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId/documents', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM documents WHERE user_id=$1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/documents/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM documents WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;