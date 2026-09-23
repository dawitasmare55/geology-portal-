const express = require('express');
const app = express();
const PORT = 3001; // Your React app will talk to this port

// This allows your server to understand JSON data sent from React
app.use(express.json());

// A simple test "route" to make sure it works
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});