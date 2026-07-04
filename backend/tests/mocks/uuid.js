/* CJS shim for the ESM-only `uuid` package so Jest (CommonJS) can require it.
 * Provides the exports the backend actually uses (v4). Backed by Node crypto. */
const crypto = require('crypto');
function v4() { return crypto.randomUUID(); }
module.exports = { v4, validate: (s) => /^[0-9a-f-]{36}$/i.test(String(s)) };
