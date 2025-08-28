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

// --- NEW: Path Normalization Middleware ---
// This middleware ensures that paths like "//api/..." are treated as "/api/..."
const pathNormalizer = (req, res, next) => {
  // Check if originalUrl starts with "//" after the host (e.g., in a proxy scenario)
  if (req.originalUrl.startsWith('//')) {
    req.url = req.originalUrl.substring(1); // Remove the first slash
    req.path = req.path.substring(1);      // Remove the first slash from path too
    console.log(`PATH_NORMALIZER: Normalized originalUrl from '${req.originalUrl}' to '${req.url}'`);
    console.log(`PATH_NORMALIZER: Normalized path from '${req.originalUrl}' to '${req.path}'`);
  } else if (req.path.startsWith('//')) {
    // Also check if req.path itself has a double slash (less common, but for completeness)
    req.url = req.url.substring(1);
    req.path = req.path.substring(1);
    console.log(`PATH_NORMALIZER: Normalized path from '${req.originalUrl}' to '${req.path}'`);
  }
  next(); // Pass control to the next middleware/route handler
};
// --- END NEW ---

// --- Existing: Path Logger Middleware ---
const pathLogger = (req, res, next) => {
  console.log(`PATH_DEBUG: Incoming request URL: ${req.originalUrl}, Path: ${req.path}`);
  next(); // Pass control to the next middleware/route handler
};
// --- END Existing ---


console.log('--- DEBUG: Server Route Setup ---');

// --- Apply Path Normalizer BEFORE any specific routes ---
app.use(pathNormalizer);

// --- REINTRODUCED ALL CUSTOM ROUTE USES with pathLogger ---
console.log("DEBUG: Registering '/api/itero' with iteroRoutes.");
app.use('/api/itero', pathLogger, iteroRoutes); // Added pathLogger

console.log("DEBUG: Registering '/api/shining3d' with shining3dRoutes.");
app.use('/api/shining3d', pathLogger, shining3dRoutes); // Added pathLogger

console.log("DEBUG: Registering '/api/medit' with meditRoutes.");
app.use('/api/medit', pathLogger, meditRoutes); // Added pathLogger

console.log("DEBUG: Registering '/api/download' with downloadRoutes.");
app.use('/api/download', pathLogger, downloadRoutes); // Added pathLogger

console.log("DEBUG: Registering '/api/automation' with automationRoute.");
app.use('/api/automation', pathLogger, automationRoute); // Added pathLogger

// --- REINTRODUCE STATIC FILE SERVING ---
const staticPath = path.join(__dirname, "../client/build");
console.log(`DEBUG: Registering static path for client build: '${staticPath}'`);
app.use(express.static(staticPath));

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
