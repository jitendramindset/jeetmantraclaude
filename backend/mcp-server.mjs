/**
 * mcp-server.mjs — Model Context Protocol server for JeetMantra EduOS.
 *
 * Exposes the platform's API as MCP tools so Claude Desktop (or any MCP
 * client, including n8n) can operate the platform conversationally:
 * list/create courses, schedule classes, check students' progress, ask the
 * RAG-grounded tutor, and read platform stats.
 *
 * Transports:
 *   node mcp-server.mjs            → stdio  (Claude Desktop)
 *   node mcp-server.mjs --http 5055 → streamable HTTP at /mcp (n8n, agents)
 *
 * Auth: signs a service JWT with the backend's JWT_SECRET (from .env) and
 * calls the local REST API. Override identity with MCP_USER_ID / MCP_ROLE.
 * The platform backend must be running (default http://localhost:5050).
 *
 * Claude Desktop config (claude_desktop_config.json):
 *   { "mcpServers": { "jeetmantra": {
 *       "command": "node",
 *       "args": ["D:/React App/jeetmantraclaude-main/backend/mcp-server.mjs"] } } }
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
require('dotenv').config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');

const API_BASE = process.env.MCP_API_BASE || 'http://localhost:5050/api';
const TOKEN = jwt.sign(
  { id: process.env.MCP_USER_ID || 'mcp-service', email: 'mcp@jeetmantra.local', role: process.env.MCP_ROLE || 'admin' },
  process.env.JWT_SECRET, { expiresIn: '1h' } // Short TTL — MCP tokens should be rotated frequently
);

async function api(pathname, method = 'GET', body) {
  const r = await fetch(API_BASE + pathname, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error?.message || j.error || ('HTTP ' + r.status));
  return j;
}

// ── Tool definitions ────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'list_courses',
    description: 'List courses on the platform. Optionally filter by a search term (matches title/category).',
    inputSchema: { type: 'object', properties: { search: { type: 'string', description: 'Optional text filter' } } },
    run: async (a) => {
      const r = await api('/courses');
      let list = r.courses || r.data || [];
      if (a.search) { const q = a.search.toLowerCase(); list = list.filter(c => (c.title || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)); }
      return list.map(c => ({ id: c.id, title: c.title, category: c.category, level: c.level, price: c.price, city: c.city, mode: c.class_mode, active: c.is_active }));
    }
  },
  {
    name: 'create_course',
    description: 'Create a new course. Returns the created course with its id and SEO slug.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' }, description: { type: 'string' }, category: { type: 'string' },
        level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] }, price: { type: 'number' },
        ageGroup: { type: 'string' }, timing: { type: 'string' }, city: { type: 'string' },
        classMode: { type: 'string', enum: ['online', 'offline', 'hybrid'] }
      },
      required: ['title']
    },
    run: async (a) => (await api('/courses', 'POST', { category: 'General', level: 'beginner', price: 0, ...a })).course
  },
  {
    name: 'schedule_live_class',
    description: 'Schedule a live class for a course at a given ISO date-time.',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string' }, title: { type: 'string' },
        scheduledTime: { type: 'string', description: 'ISO 8601 date-time' },
        duration: { type: 'number', description: 'Minutes, default 60' }
      },
      required: ['courseId', 'scheduledTime']
    },
    run: async (a) => (await api('/live-classes', 'POST', a)).liveClass
  },
  {
    name: 'list_live_classes',
    description: 'List the live classes of a course (scheduled, live, completed).',
    inputSchema: { type: 'object', properties: { courseId: { type: 'string' } }, required: ['courseId'] },
    run: async (a) => { const r = await api('/live-classes/course/' + a.courseId); return (r.liveClasses || r.classes || []).map(l => ({ id: l.id, title: l.title, time: l.scheduled_time, status: l.status, duration: l.duration })); }
  },
  {
    name: 'course_students',
    description: 'List a course\'s enrolled students with progress % and attendance.',
    inputSchema: { type: 'object', properties: { courseId: { type: 'string' } }, required: ['courseId'] },
    run: async (a) => (await api('/courses/' + a.courseId + '/students')).students
  },
  {
    name: 'student_detail',
    description: 'Full per-student detail in a course: progress, assignment submissions with grades, test scores, recent activity, and doubts asked in chat.',
    inputSchema: { type: 'object', properties: { courseId: { type: 'string' }, studentId: { type: 'string' } }, required: ['courseId', 'studentId'] },
    run: async (a) => api('/courses/' + a.courseId + '/students/' + a.studentId + '/detail')
  },
  {
    name: 'ask_tutor',
    description: 'Ask the platform\'s AI tutor a question. If courseId is given, the answer is grounded in that course\'s indexed documents (RAG) and cites sources.',
    inputSchema: { type: 'object', properties: { question: { type: 'string' }, courseId: { type: 'string' } }, required: ['question'] },
    run: async (a) => api('/ai/tutor', 'POST', a)
  },
  {
    name: 'list_assignments',
    description: 'List a course\'s assignment templates (title, due date) and how many submissions each has.',
    inputSchema: { type: 'object', properties: { courseId: { type: 'string' } }, required: ['courseId'] },
    run: async (a) => {
      const r = await api('/assignments?courseId=' + a.courseId);
      const all = r.assignments || [];
      const templates = all.filter(x => !x.student_id);
      return templates.map(t => ({ id: t.id, title: t.title, due: t.due_date, submissions: all.filter(s => s.parent_id === t.id).length }));
    }
  },
  {
    name: 'create_coupon',
    description: 'Create a discount coupon. Use discountPercent OR discountFlat (₹). Omit courseId to apply to all courses.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' }, discountPercent: { type: 'number' }, discountFlat: { type: 'number' },
        courseId: { type: 'string' }, maxUses: { type: 'number' }, expiresAt: { type: 'string', description: 'ISO date' }
      },
      required: ['code']
    },
    run: async (a) => api('/payments/coupons', 'POST', a)
  },
  {
    name: 'send_notification',
    description: 'Send an in-app notification to a specific user (admin broadcast).',
    inputSchema: { type: 'object', properties: { userId: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, required: ['userId', 'title'] },
    run: async (a) => api('/eduos/notify/send', 'POST', a)
  },
  {
    name: 'recent_activity',
    description: 'Recent platform activity feed (submissions, enrollments, posts) visible to the service account.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => { const r = await api('/activity/me'); return (r.feed || []).slice(0, 15).map(e => ({ what: e.message || e.event_type, who: e.actor_name, when: e.created_at })); }
  },
  {
    name: 'platform_stats',
    description: 'Platform overview: total users, total courses, recent payments and marketplace listings (admin view).',
    inputSchema: { type: 'object', properties: {} },
    run: async () => { const r = await api('/dashboard'); const d = r.dashboard || {}; return { stats: d.stats, recentPayments: (d.recentPayments || []).length, listings: (d.marketplaceListings || []).length, recentUsers: (d.users || []).slice(0, 5).map(u => ({ name: u.full_name, role: u.user_type })) }; }
  }
];

// ── MCP wiring ──────────────────────────────────────────────────────────
function buildServer() {
  const server = new Server({ name: 'jeetmantra-eduos', version: '1.0.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))
  }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = TOOLS.find(t => t.name === req.params.name);
    if (!tool) return { content: [{ type: 'text', text: 'Unknown tool: ' + req.params.name }], isError: true };
    try {
      const out = await tool.run(req.params.arguments || {});
      return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true };
    }
  });
  return server;
}

const args = process.argv.slice(2);
if (args[0] === '--http') {
  // Streamable HTTP (stateless) — for n8n and other HTTP MCP clients.
  const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.post('/mcp', async (req, res) => {
    try {
      const server = buildServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => { transport.close(); server.close(); });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (e) {
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  });
  const port = Number(args[1]) || 5055;
  app.listen(port, () => console.log('JeetMantra MCP (HTTP) on http://localhost:' + port + '/mcp'));
} else {
  const server = buildServer();
  await server.connect(new StdioServerTransport());
  console.error('JeetMantra MCP server running on stdio');
}
