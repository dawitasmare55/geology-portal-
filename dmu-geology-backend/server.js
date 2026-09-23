const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/publications', require('./routes/publications'));
app.use('/api/news', require('./routes/news'));
app.use('/api/profile', require('./routes/profile'));

// Health check
app.get('/api/hello', (req, res) => res.json({ message: 'Hello from the backend!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://192.168.1.11:${PORT}`));
