const express = require('express');
const pool = require('../db/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { uploadMaterial } = require('../middleware/upload');

const router = express.Router();

// Get materials for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.full_name AS uploaded_by_name, u.email AS uploaded_by_email
       FROM materials m
       LEFT JOIN users u ON m.uploaded_by = u.id
       WHERE m.course_id = $1
       ORDER BY m.created_at DESC`,
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload material (staff only)
router.post('/upload', authenticate, requireStaff, uploadMaterial.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { course_id, course_code, title, category } = req.body;
    const fileUrl = `/uploads/materials/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO materials (course_id, course_code, title, category, file_url, file_name, file_size, file_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [course_id, course_code || null, title || req.file.originalname,
       category || 'Lecture Notes', fileUrl, req.file.originalname,
       req.file.size, req.file.mimetype, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Toggle lock
router.patch('/:id/lock', authenticate, requireStaff, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE materials SET locked = NOT locked WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete material (staff only)
router.delete('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    await pool.query('DELETE FROM materials WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;