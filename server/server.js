const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- REINTRODUCED ALL CUSTOM ROUTE IMPORTS ---
const iteroRoutes = require('./routes/itero');
const downloadRoutes = require('./routes/download');
const shining3dRoutes = require('./routes/shining3d');
const meditRoutes = require('./routes/medit');
const automationRoute = require('./routes/automation');

console.log('--- DEBUG: Server Route Setup ---');

// --- REINTRODUCED ALL CUSTOM ROUTE USES ---
console.log("DEBUG: Registering '/api/itero' with iteroRoutes.");
app.use('/api/itero', iteroRoutes);

console.log("DEBUG: Registering '/api/shining3d' with shining3dRoutes.");
app.use('/api/shining3d', shining3dRoutes);

console.log("DEBUG: Registering '/api/medit' with meditRoutes.");
app.use('/api/medit', meditRoutes);

console.log("DEBUG: Registering '/api/download' with downloadRoutes.");
app.use('/api/download', downloadRoutes);

console.log("DEBUG: Registering '/api/automation' with automationRoute.");
app.use('/api/automation', automationRoute);

// --- REINTRODUCE STATIC FILE SERVING ---
const staticPath = path.join(__dirname, "../client/build");
console.log(`DEBUG: Registering static path for client build: '${staticPath}'`);
app.use(express.static(staticPath));

// REMOVED: The temporary '/test' route is no longer needed.

// --- REINTRODUCE ROBUST CATCH-ALL ROUTE FOR REACT APP ---
// This handles all GET requests not matched by preceding routes and serves index.html
console.log("DEBUG: Registering robust catch-all route for SPA.");
app.use((req, res) => {
  console.log(`DEBUG: Catch-all route hit for: ${req.originalUrl}`);
  res.sendFile(path.join(staticPath, "index.html"));
});

console.log('--- DEBUG: All Routes Registered ---');


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
