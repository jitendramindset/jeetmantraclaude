const path = require('path');
const fs = require('fs');

const dbPath = process.env.LEVELDB_PATH || path.join(__dirname, '..', 'data', 'leveldb');

// Ensure directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// In-memory fallback if classic-level not installed
let db = null;
const memStore = new Map();

try {
  const { ClassicLevel } = require('classic-level');
  db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  console.log('📦 LevelDB initialized at', dbPath);
} catch (e) {
  console.warn('⚠️  classic-level not installed, using in-memory fallback. Run: npm install classic-level');
}

async function get(key) {
  try {
    if (db) return await db.get(key);
    return memStore.get(key) || null;
  } catch (e) { return null; }
}

async function put(key, value) {
  if (db) return db.put(key, value);
  memStore.set(key, value);
}

async function del(key) {
  try {
    if (db) return await db.del(key);
    memStore.delete(key);
  } catch (e) { return null; }
}

async function list(prefix) {
  const results = [];
  if (db) {
    for await (const [key, value] of db.iterator({ gte: prefix, lte: prefix + '\xff' })) {
      results.push({ key, value });
    }
  } else {
    for (const [key, value] of memStore.entries()) {
      if (key.startsWith(prefix)) results.push({ key, value });
    }
  }
  return results;
}

class SyncQueue {
  async enqueue(operation) {
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await put('sync:' + id, { ...operation, id, queuedAt: new Date().toISOString() });
    return id;
  }

  async dequeue() {
    const items = await list('sync:');
    return items.map(i => i.value);
  }

  async complete(id) {
    await del('sync:' + id);
  }
}

// Cache helpers for dashboard data
async function cacheSet(key, data, ttlSeconds = 300) {
  await put('cache:' + key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function cacheGet(key) {
  const entry = await get('cache:' + key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    await del('cache:' + key);
    return null;
  }
  return entry.data;
}

// Background eviction: expired entries are otherwise only reaped on a read miss
// for that exact key, so cold/abandoned keys would accumulate forever. This
// sweep (a) deletes every expired entry and (b) caps the live cache size,
// evicting the soonest-to-expire first when over the bound.
const CACHE_MAX_ENTRIES = Number(process.env.LEVELDB_CACHE_MAX || 5000);
async function sweepCache() {
  try {
    const entries = await list('cache:');
    const now = Date.now();
    const live = [];
    for (const e of entries) {
      if (!e.value || now > (e.value.expiresAt || 0)) await del(e.key);
      else live.push(e);
    }
    if (live.length > CACHE_MAX_ENTRIES) {
      live.sort((a, b) => (a.value.expiresAt || 0) - (b.value.expiresAt || 0));
      const evict = live.slice(0, live.length - CACHE_MAX_ENTRIES);
      for (const e of evict) await del(e.key);
    }
  } catch (e) { /* best-effort */ }
}
// Run every 5 min + once shortly after boot. unref() so it never keeps the
// process alive on its own.
const _sweepTimer = setInterval(sweepCache, 5 * 60 * 1000);
if (_sweepTimer.unref) _sweepTimer.unref();
const _bootSweep = setTimeout(sweepCache, 30 * 1000);
if (_bootSweep.unref) _bootSweep.unref();

module.exports = { db, get, put, del, list, SyncQueue, cacheSet, cacheGet, sweepCache };
