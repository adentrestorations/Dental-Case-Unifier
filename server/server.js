const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const iteroRoutes = require('./routes/itero');
const downloadRoutes = require('./routes/download');
const shining3dRoutes = require('./routes/shining3d');
const meditRoutes = require('./routes/medit');

// Use routes
app.use('/api/itero', iteroRoutes);
app.use('/api', downloadRoutes);
app.use('/api/shining3d', shining3dRoutes);
app.use('/api/medit', meditRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

const automationRoute = require('./routes/automation');
app.use('/api', automationRoute);