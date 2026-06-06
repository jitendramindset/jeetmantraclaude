// Root-level server launcher — manually loads backend/.env then starts server
const fs = require('fs');
const path = require('path');

// Parse and inject backend/.env into process.env before anything else
const envFile = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  });
}

// Change cwd so relative paths in server.js (uploads, data/) resolve correctly
process.chdir(path.join(__dirname, 'backend'));

// Start the backend
require(path.join(__dirname, 'backend', 'server.js'));
