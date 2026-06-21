/**
 * mailer.js — shared SMTP sender. Config resolves admin-settings first, then
 * .env (see services/settings.js). Console-logs when SMTP isn't configured so
 * dev works without credentials. Used by auth flows + the admin test button.
 */
const { getSetting } = require('./settings');

async function sendMail(to, subject, body) {
  const user = await getSetting('smtp_user', 'SMTP_USER');
  const pass = await getSetting('smtp_pass', 'SMTP_PASS');
  if (!user || !pass) {
    console.log(`📧 [console-only — SMTP not configured] to=${to} subject="${subject}"\n${body}\n`);
    return { sent: false, mode: 'console' };
  }
  try {
    const nodemailer = require('nodemailer');
    const port = Number(await getSetting('smtp_port', 'SMTP_PORT') || 587);
    const t = nodemailer.createTransport({
      host: (await getSetting('smtp_host', 'SMTP_HOST')) || 'smtp.gmail.com',
      port, secure: port === 465, auth: { user, pass }
    });
    const isHtml = /<[a-z][\s\S]*>/i.test(body);
    await t.sendMail({ from: (await getSetting('smtp_from', 'SMTP_FROM')) || user, to, subject, [isHtml ? 'html' : 'text']: body });
    console.log(`📧 sent to ${to} ("${subject}") via SMTP`);
    return { sent: true, mode: 'smtp' };
  } catch (e) {
    console.error('[mail] send failed:', e.message);
    return { sent: false, mode: 'error', error: e.message };
  }
}

module.exports = { sendMail };
