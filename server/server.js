const express = require('express');
const cors = require('cors'); // Keep cors, as it's typically safe
// const path = require('path'); // Not needed for this minimal setup

const app = express();
app.use(cors()); // Enable CORS for basic functionality
app.use(express.json()); // Keep if your app relies on JSON body parsing

// --- DEBUG: Minimal Route Setup ---
console.log('--- DEBUG: Server Route Setup (Absolute Minimum) ---');

// TEMPORARILY COMMENTED OUT ALL CUSTOM ROUTE IMPORTS AND USES
// const iteroRoutes = require('./routes/itero');
// const downloadRoutes = require('./routes/download');
// const shining3dRoutes = require('./routes/shining3d');
// const meditRoutes = require('./routes/medit');
// const automationRoute = require('./routes/automation');

// app.use('/api/itero', iteroRoutes);
// app.use('/api/shining3d', shining3dRoutes);
// app.use('/api/medit', meditRoutes);
// app.use('/api/download', downloadRoutes);
// app.use('/api/automation', automationRoute);

// TEMPORARILY COMMENTED OUT STATIC FILE SERVING AND CATCH-ALL
// const staticPath = path.join(__dirname, "../client/build");
// app.use(express.static(staticPath));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

// --- ADD A SINGLE, SIMPLE TEST ROUTE ---
console.log("DEBUG: Registering simple test route '/test'.");
app.get('/test', (req, res) => {
  res.send('Server is alive and test route works!');
});
console.log('--- DEBUG: All Routes Registered (Minimal) ---');


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
