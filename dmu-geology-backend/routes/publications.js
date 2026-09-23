const express = require('express');
const pool = require('../db/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { uploadPublication } = require('../middleware/upload');

const router = express.Router();

// Get all publications (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name AS uploaded_by_name, u.email AS uploaded_by_email
       FROM publications p
       LEFT JOIN users u ON p.uploaded_by = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add publication (staff only)
router.post('/', authenticate, requireStaff, uploadPublication.single('file'), async (req, res) => {
  try {
    const { title, authors, year, journal, doi, abstract } = req.body;
    const fileUrl = req.file ? `/uploads/publications/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;

    const result = await pool.query(
      `INSERT INTO publications (title, authors, year, journal, doi, abstract, file_url, file_name, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, authors, year || null, journal, doi, abstract, fileUrl, fileName, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Update publication (owner only)
router.put('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    const { title, authors, year, journal, doi, abstract } = req.body;
    const result = await pool.query(
      `UPDATE publications SET title=$1, authors=$2, year=$3, journal=$4, doi=$5, abstract=$6
       WHERE id=$7 AND uploaded_by=$8 RETURNING *`,
      [title, authors, year, journal, doi, abstract, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete publication (owner only)
router.delete('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM publications WHERE id = $1 AND uploaded_by = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;