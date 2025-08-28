const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load shared environment variables first
dotenv.config({ path: path.resolve(__dirname, './.env.shared') });

// REMOVED: The server should NOT load client-side .env files like .env.local
// dotenv.config({ path: path.resolve(__dirname, '../client/.env.local') });

// --- DEBUG: Log the problematic variable on Render ---
console.log('DEBUG: process.env.REACT_APP_API_BASE on server startup:', process.env.REACT_APP_API_BASE);
// --- END DEBUG ---

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const iteroRoutes = require('./routes/itero');
const downloadRoutes = require('./routes/download');
const shining3dRoutes = require('./routes/shining3d');
const meditRoutes = require('./routes/medit');
const automationRoute = require('./routes/automation');

// Use routes
app.use('/api/itero', iteroRoutes);
app.use('/api/shining3d', shining3dRoutes);
app.use('/api/medit', meditRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/automation', automationRoute);

// Serve static React files
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
