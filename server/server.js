const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// TEMPORARILY COMMENTED OUT ALL CUSTOM ROUTE IMPORTS
// const iteroRoutes = require('./routes/itero');
// const downloadRoutes = require('./routes/download');
// const shining3dRoutes = require('./routes/shining3d');
// const meditRoutes = require('./routes/medit');
// const automationRoute = require('./routes/automation');

// TEMPORARILY COMMENTED OUT CUSTOM ROUTE USES
// app.use('/api/itero', iteroRoutes);
// app.use('/api/shining3d', shining3dRoutes);
// app.use('/api/medit', meditRoutes);
// app.use('/api/download', downloadRoutes);
// app.use('/api/automation', automationRoute);

console.log('--- DEBUG: Server Route Setup ---');

// --- REINTRODUCE STATIC FILE SERVING ---
const staticPath = path.join(__dirname, "../client/build");
console.log(`DEBUG: Registering static path for client build: '${staticPath}'`);
app.use(express.static(staticPath));

// ADDED a simple test route just to ensure *some* server API works
console.log("DEBUG: Registering simple test route '/test'.");
app.get('/test', (req, res) => {
  res.send('Server is alive and test route works!');
});

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
