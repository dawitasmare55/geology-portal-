const express = require('express');
const pool = require('../db/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { uploadNews } = require('../middleware/upload');

const router = express.Router();

// Get all news (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.full_name AS uploaded_by_name
       FROM news n
       LEFT JOIN users u ON n.uploaded_by = u.id
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add news (staff only) - accepts optional image and file
router.post(
  '/',
  authenticate,
  requireStaff,
  uploadNews.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, category, content, link, location, event_date, news_date } = req.body;
      const imageUrl = req.files?.image ? `/uploads/news/${req.files.image[0].filename}` : null;
      const fileUrl = req.files?.file ? `/uploads/news/${req.files.file[0].filename}` : null;
      const fileName = req.files?.file ? req.files.file[0].originalname : null;

      const result = await pool.query(
        `INSERT INTO news (title, category, content, image_url, file_url, file_name, link, location, event_date, news_date, uploaded_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [title, category || 'News', content, imageUrl, fileUrl, fileName, link,
         location, event_date || null, news_date || new Date(), req.user.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed' });
    }
  }
);

// Delete news (owner only)
router.delete('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id=$1 AND uploaded_by=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;