/**
 * aiAgent.js — in-chat AI agent that can call the platform's own REST APIs,
 * scoped to the caller's role.
 *
 * How it stays safe:
 *  - The tool list shown to the model is filtered by role (CREATOR/SELLER/…).
 *  - Tools execute by calling the SAME internal HTTP endpoints the UI uses,
 *    forwarding the caller's bearer token + X-Active-Institution. So every
 *    auth / capability / tenancy / Joi-validation check the normal API enforces
 *    applies automatically — the agent can never exceed what the user could do
 *    by clicking through the UI.
 *  - Money-moving tools (refund, payout, wallet debit, transfers) are NEVER
 *    registered, so the model cannot move funds regardless of the prompt.
 *
 * Flow: one `ai()` call decides {answer} or {tool,args}; if a tool, we run it
 * and return the structured result for the chat to render. One model call per
 * turn keeps within the shared free-tier quota.
 */
const { ai } = require('../config/aiProvider');
const { CREATOR_ROLES, SELLER_ROLES } = require('../config/roles');

// Each tool maps an intent to a real endpoint. `path` may contain :params that
// are filled from args; `body` lists the keys forwarded for writes.
const TOOLS = [
  // ── READ (broad) ─────────────────────────────────────────────────────────
  { id: 'my_dashboard', roles: null, write: false, method: 'GET', path: '/dashboard',
    desc: 'Get the current user\'s dashboard summary (KPIs, recent items).', args: {} },
  { id: 'my_certificates', roles: null, write: false, method: 'GET', path: '/certificates/my',
    desc: 'List certificates the current user has earned.', args: {} },
  { id: 'wallet_balance', roles: null, write: false, method: 'GET', path: '/wallet',
    desc: 'Show the current user\'s wallet balance and recent transactions.', args: {} },
  { id: 'my_notifications', roles: null, write: false, method: 'GET', path: '/notifications',
    desc: 'List the current user\'s notifications.', args: {} },
  { id: 'my_calendar', roles: null, write: false, method: 'GET', path: '/calendar',
    desc: 'List the current user\'s upcoming calendar events / classes.', args: {} },
  // ── READ (creators) ──────────────────────────────────────────────────────
  { id: 'course_students', roles: CREATOR_ROLES, write: false, method: 'GET', path: '/courses/:courseId/students',
    desc: 'List students enrolled in one of my courses with their progress.',
    args: { courseId: 'the course id (required)' } },
  { id: 'course_analytics', roles: CREATOR_ROLES, write: false, method: 'GET', path: '/courses/:courseId/analytics',
    desc: 'Get analytics (students, completion, revenue) for one of my courses.',
    args: { courseId: 'the course id (required)' } },
  { id: 'list_coupons', roles: SELLER_ROLES, write: false, method: 'GET', path: '/payments/coupons',
    desc: 'List the discount coupons I have created.', args: {} },
  // ── READ (admin) ─────────────────────────────────────────────────────────
  { id: 'platform_stats', roles: ['admin'], write: false, method: 'GET', path: '/admin/stats',
    desc: 'Platform-wide stats (admin only).', args: {} },
  // ── WRITE (creators / sellers) — no money movement ───────────────────────
  { id: 'create_course', roles: SELLER_ROLES, write: true, method: 'POST', path: '/courses',
    desc: 'Create a new course.', body: ['title', 'description', 'category', 'level', 'price'],
    args: { title: 'course title (required)', description: 'short description',
            category: 'e.g. Math', level: 'beginner|intermediate|advanced', price: 'number, 0 for free' } },
  { id: 'create_coupon', roles: SELLER_ROLES, write: true, method: 'POST', path: '/payments/coupons',
    desc: 'Create a discount coupon for my courses.',
    body: ['code', 'discountPercent', 'discountFlat', 'courseId', 'maxUses'],
    args: { code: 'coupon code e.g. WELCOME20 (required)', discountPercent: 'percent off (0-100)',
            discountFlat: 'flat ₹ off (use this OR discountPercent)', courseId: 'optional — restrict to one course',
            maxUses: 'optional max redemptions, default 100' } },
  { id: 'schedule_live_class', roles: CREATOR_ROLES, write: true, method: 'POST', path: '/live-classes',
    desc: 'Schedule a live class for a course.',
    body: ['courseId', 'title', 'scheduledTime', 'duration'],
    args: { courseId: 'course id (required)', title: 'class title',
            scheduledTime: 'ISO datetime (required), e.g. 2026-07-01T10:00:00Z', duration: 'minutes' } }
];

function toolsForRole(roles) {
  const have = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  const isAdmin = have.includes('admin');
  return TOOLS.filter(t => {
    if (!t.roles) return true;                 // open to everyone
    if (isAdmin) return true;                   // admin sees all
    return t.roles.some(r => have.includes(r));
  });
}

// Build the compact tool catalog text the model reads.
function catalog(tools) {
  return tools.map(t => {
    const a = Object.keys(t.args || {}).length
      ? ' | args: ' + Object.entries(t.args).map(([k, v]) => `${k} (${v})`).join(', ')
      : '';
    return `- ${t.id}${t.write ? ' [WRITE]' : ''}: ${t.desc}${a}`;
  }).join('\n');
}

// Call an internal endpoint as the user (same auth → same permissions).
async function callApi(req, tool, args) {
  const base = `${req.protocol}://${req.get('host')}/api`;
  let path = tool.path.replace(/:(\w+)/g, (_, k) => encodeURIComponent(args[k] || ''));
  const headers = { 'Content-Type': 'application/json' };
  if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
  if (req.headers['x-active-institution']) headers['X-Active-Institution'] = req.headers['x-active-institution'];
  let body;
  if (tool.write && tool.body) {
    const b = {};
    tool.body.forEach(k => { if (args[k] !== undefined && args[k] !== '') b[k] = args[k]; });
    body = JSON.stringify(b);
  }
  const r = await fetch(base + path, { method: tool.method, headers, body });
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

/**
 * runAgent(req, message) → { mode, text?, tool?, args?, result?, error? }
 */
async function runAgent(req, message) {
  const roles = req.user.roles || [req.user.role];
  const tools = toolsForRole(roles);
  const sys =
    'You are the in-app assistant for an education platform. You can either ANSWER directly or call ONE tool. ' +
    'Only use a tool from the catalog. Respond with STRICT JSON and nothing else, in one of these shapes:\n' +
    '{"action":"answer","text":"<helpful reply>"}\n' +
    '{"action":"tool","tool":"<tool_id>","args":{...},"say":"<one short sentence describing what you are doing>"}\n' +
    'Rules: pick a tool only when the user clearly wants that data or action. ' +
    'For WRITE tools, only call when the user explicitly asks to create/schedule something and required args are known; ' +
    'otherwise ask for the missing detail with an answer. Never invent ids.';
  const usr = `USER ROLES: ${roles.join(', ')}\n\nTOOL CATALOG:\n${catalog(tools)}\n\nUSER MESSAGE: ${message}`;

  let decision;
  try {
    const out = await ai(req.user.id, sys, usr, { json: true, action: 'agent' });
    decision = typeof out.text === 'string' ? JSON.parse(out.text) : out.text;
  } catch (e) {
    // No AI key / quota / parse failure → degrade to a plain answer.
    return { mode: 'answer', text: 'I could not reach the AI service just now. ' + (e.message || ''), degraded: true };
  }

  if (!decision || decision.action === 'answer') {
    return { mode: 'answer', text: (decision && decision.text) || 'How can I help?' };
  }
  // Tool path.
  const tool = tools.find(t => t.id === decision.tool);
  if (!tool) return { mode: 'answer', text: decision.say || 'I don\'t have a tool for that.' };
  try {
    const res = await callApi(req, tool, decision.args || {});
    return {
      mode: 'tool',
      tool: tool.id,
      write: !!tool.write,
      say: decision.say || (tool.write ? 'Done.' : 'Here\'s what I found.'),
      ok: res.ok,
      status: res.status,
      result: res.ok ? res.json : undefined,
      error: res.ok ? undefined : (res.json && (res.json.error || res.json.message)) || ('HTTP ' + res.status)
    };
  } catch (e) {
    return { mode: 'tool', tool: tool.id, ok: false, error: e.message };
  }
}

module.exports = { runAgent, toolsForRole, TOOLS };
