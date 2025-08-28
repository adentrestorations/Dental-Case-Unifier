const express = require('express');
const cors = require('cors');
const path = require('path');
// const dotenv = require('dotenv'); // Not needed for dotenv.config calls in deployed environment

// REMOVED: All dotenv.config calls. Environment variables should be set directly on Render.

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const iteroRoutes = require('./routes/itero');
const downloadRoutes = require('./routes/download');
const shining3dRoutes = require('./routes/shining3d');
const meditRoutes = require('./routes/medit');
const automationRoute = require('./routes/automation');

console.log('--- DEBUG: Server Route Setup ---');

// Use routes
console.log("DEBUG: Registering '/api/itero' with iteroRoutes:", iteroRoutes ? 'Router Loaded' : 'Router Missing!');
app.use('/api/itero', iteroRoutes);

console.log("DEBUG: Registering '/api/shining3d' with shining3dRoutes:", shining3dRoutes ? 'Router Loaded' : 'Router Missing!');
app.use('/api/shining3d', shining3dRoutes);

console.log("DEBUG: Registering '/api/medit' with meditRoutes:", meditRoutes ? 'Router Loaded' : 'Router Missing!');
app.use('/api/medit', meditRoutes);

console.log("DEBUG: Registering '/api/download' with downloadRoutes:", downloadRoutes ? 'Router Loaded' : 'Router Missing!');
app.use('/api/download', downloadRoutes);

console.log("DEBUG: Registering '/api/automation' with automationRoute:", automationRoute ? 'Router Loaded' : 'Router Missing!');
app.use('/api/automation', automationRoute);

// Serve static React files
const staticPath = path.join(__dirname, "../client/build");
console.log(`DEBUG: Registering static path for client build: '${staticPath}'`);
app.use(express.static(staticPath));

// Catch-all route for React app
console.log("DEBUG: Registering catch-all '*' route for index.html.");
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

console.log('--- DEBUG: All Routes Registered ---');


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
