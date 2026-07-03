/**
 * config/supabase.js
 *
 * Primary DB access: direct PostgreSQL via pg.Pool (SUPABASE_DB_URL).
 * Falls back to Supabase REST client when the pool URL is absent.
 *
 * Exports:
 *   db            — pg.Pool instance for raw SQL (preferred)
 *   supabaseAdmin — compatibility shim with .from() query builder
 *   supabase      — same shim (alias)
 */
const { Pool } = require('pg');

// ── Direct Postgres pool ───────────────────────────────────────────────────
const POOL_URL = process.env.SUPABASE_DB_URL ||
  (process.env.POSTGRES_PASSWORD
    ? `postgresql://postgres:${process.env.POSTGRES_PASSWORD}@127.0.0.1:5432/postgres`
    : null);

if (!POOL_URL) {
  console.warn('⚠️  SUPABASE_DB_URL not set — direct DB access unavailable.');
}

const db = POOL_URL
  ? new Pool({
      connectionString: POOL_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

if (db) {
  db.on('error', (err) => {
    console.error('[pg] Unexpected pool error:', err.message);
  });
}

// ── Supabase REST fallback (used when direct pool unavailable) ─────────────
let _restClient = null;
function getRestClient() {
  if (_restClient) return _restClient;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    function fetchWithTimeout(u, opts = {}) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      return fetch(u, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(t));
    }
    _restClient = createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: fetchWithTimeout },
    });
  } catch (_) {}
  return _restClient;
}

// ── Query builder shim ─────────────────────────────────────────────────────
// Translates .from().select().eq().single() etc into pg queries so existing
// route code continues to work without modification.
function buildShim(pool) {
  function pgShim(table) {
    const state = {
      table,
      op: 'SELECT',
      cols: '*',
      conditions: [],  // { col, op, val }
      insertData: null,
      updateData: null,
      limitVal: null,
      orderCol: null,
      orderAsc: true,
      returnSingle: false,
      returnMaybe: false,
      countOnly: false,
      head: false,
    };
    const vals = [];

    function placeholder() { return `$${vals.length + 1}`; }

    function addCond(col, op, val) {
      if (Array.isArray(val)) {
        const placeholders = val.map(v => { vals.push(v); return `$${vals.length}`; });
        state.conditions.push(`"${col}" ${op} (${placeholders.join(',')})`);
      } else {
        vals.push(val);
        state.conditions.push(`"${col}" ${op} ${placeholder()}`);
      }
    }

    function build() {
      const where = state.conditions.length ? `WHERE ${state.conditions.join(' AND ')}` : '';
      if (state.op === 'SELECT') {
        const cols = state.countOnly ? (state.head ? 'COUNT(*) AS _count' : '*') : state.cols;
        let sql = `SELECT ${cols} FROM "${state.table}" ${where}`;
        if (state.orderCol) sql += ` ORDER BY "${state.orderCol}" ${state.orderAsc ? 'ASC' : 'DESC'}`;
        if (state.limitVal) sql += ` LIMIT ${state.limitVal}`;
        return sql;
      }
      if (state.op === 'INSERT') {
        const keys = Object.keys(state.insertData);
        const ph = keys.map(k => { vals.push(state.insertData[k]); return `$${vals.length}`; });
        return `INSERT INTO "${state.table}" (${keys.map(k => `"${k}"`).join(',')}) VALUES (${ph.join(',')}) RETURNING *`;
      }
      if (state.op === 'UPDATE') {
        const keys = Object.keys(state.updateData);
        const set = keys.map(k => { vals.push(state.updateData[k]); return `"${k}"=$${vals.length}`; });
        return `UPDATE "${state.table}" SET ${set.join(',')} ${where} RETURNING *`;
      }
      if (state.op === 'DELETE') {
        return `DELETE FROM "${state.table}" ${where} RETURNING *`;
      }
    }

    async function run() {
      // Try direct pg first
      if (pool) {
        try {
          const sql = build();
          const result = await pool.query(sql, vals);
          if (state.countOnly && state.head) {
            return { data: null, count: parseInt(result.rows[0]?._count || '0', 10), error: null };
          }
          if (state.returnSingle) {
            if (!result.rows.length) return { data: null, error: { message: 'No rows found', code: 'PGRST116' } };
            return { data: result.rows[0], error: null };
          }
          if (state.returnMaybe) {
            return { data: result.rows[0] || null, error: null };
          }
          return { data: result.rows, error: null };
        } catch (e) {
          return { data: null, error: { message: e.message, code: e.code } };
        }
      }
      // Fallback to REST client
      const rest = getRestClient();
      if (!rest) return { data: null, error: { message: 'No DB connection available' } };
      // Re-build via supabase-js
      let q = rest.from(state.table);
      if (state.op === 'SELECT') {
        q = q.select(state.cols, state.countOnly && state.head ? { count: 'exact', head: true } : {});
      } else if (state.op === 'INSERT') {
        q = q.insert(state.insertData).select();
      } else if (state.op === 'UPDATE') {
        q = q.update(state.updateData).select();
      } else if (state.op === 'DELETE') {
        q = q.delete().select();
      }
      for (const c of state._rawConds || []) {
        if (c.method === 'eq') q = q.eq(c.col, c.val);
        else if (c.method === 'neq') q = q.neq(c.col, c.val);
        else if (c.method === 'in') q = q.in(c.col, c.val);
        else if (c.method === 'is') q = q.is(c.col, c.val);
        else if (c.method === 'gte') q = q.gte(c.col, c.val);
        else if (c.method === 'lte') q = q.lte(c.col, c.val);
        else if (c.method === 'like') q = q.ilike(c.col, `%${c.val}%`);
      }
      if (state.orderCol) q = q.order(state.orderCol, { ascending: state.orderAsc });
      if (state.limitVal) q = q.limit(state.limitVal);
      if (state.returnSingle) q = q.single();
      else if (state.returnMaybe) q = q.maybeSingle();
      return q;
    }

    // Track raw conditions for REST fallback
    state._rawConds = [];
    function addRaw(method, col, val) {
      state._rawConds.push({ method, col, val });
    }

    const api = {
      select(cols, opts = {}) {
        state.cols = cols || '*';
        if (opts.count === 'exact') state.countOnly = true;
        if (opts.head) { state.head = true; state.countOnly = true; }
        return api;
      },
      insert(data) {
        state.op = 'INSERT';
        state.insertData = Array.isArray(data) ? data[0] : data;
        return api;
      },
      update(data) {
        state.op = 'UPDATE';
        state.updateData = data;
        return api;
      },
      delete() {
        state.op = 'DELETE';
        return api;
      },
      eq(col, val) { addCond(col, '=', val); addRaw('eq', col, val); return api; },
      neq(col, val) { addCond(col, '!=', val); addRaw('neq', col, val); return api; },
      in(col, val) { addCond(col, 'IN', val); addRaw('in', col, val); return api; },
      is(col, val) {
        if (val === null) state.conditions.push(`"${col}" IS NULL`);
        else state.conditions.push(`"${col}" IS NOT NULL`);
        addRaw('is', col, val);
        return api;
      },
      gte(col, val) { vals.push(val); state.conditions.push(`"${col}" >= $${vals.length}`); addRaw('gte', col, val); return api; },
      lte(col, val) { vals.push(val); state.conditions.push(`"${col}" <= $${vals.length}`); addRaw('lte', col, val); return api; },
      ilike(col, val) { vals.push(val); state.conditions.push(`"${col}" ILIKE $${vals.length}`); addRaw('like', col, val.replace(/%/g, '')); return api; },
      order(col, opts = {}) {
        state.orderCol = col;
        state.orderAsc = opts.ascending !== false;
        return api;
      },
      limit(n) { state.limitVal = n; return api; },
      single() { state.returnSingle = true; return api; },
      maybeSingle() { state.returnMaybe = true; return api; },
      then(resolve, reject) { return run().then(resolve, reject); },
      catch(reject) { return run().catch(reject); },
    };

    return api;
  }

  return {
    from: (table) => pgShim(table),
    // Expose raw query for complex SQL
    query: (sql, params) => pool
      ? pool.query(sql, params)
      : Promise.reject(new Error('No pg pool available')),
  };
}

const supabaseAdmin = buildShim(db);
const supabase = supabaseAdmin;

module.exports = { db, supabase, supabaseAdmin };
