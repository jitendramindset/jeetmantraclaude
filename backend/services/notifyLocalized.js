/**
 * notifyLocalized.js — locale-aware notification template resolver.
 *
 * Server-side senders (broadcasts, ops alerts, scheduled reminders) call
 * resolveLocalizedTemplate(key, channel, locale) to fetch the right copy. If
 * the requested locale isn't present we fall back to 'en' so a message ALWAYS
 * goes out — silence is worse than English.
 *
 * recipientLocale(userId) is a tiny helper for "what locale does this user
 * prefer?" — reads jeetmantra_users.preferred_locale if the column exists,
 * else 'en'. The column is optional; this never throws.
 */
const { supabaseAdmin } = require('../config/supabase');

const DEFAULT_LOCALE = 'en';

// Returns { subject, body } from notification_templates. Falls back to 'en'
// when the requested locale isn't seeded. Returns null when no template at
// all (caller decides whether to invent default copy).
async function resolveLocalizedTemplate(templateKey, channel, locale) {
  if (!templateKey) return null;
  const ch = channel || 'inapp';
  const want = String(locale || DEFAULT_LOCALE).toLowerCase();

  // Single round-trip: pull both the requested locale and the default and
  // pick the best match client-side. This is robust to PostgREST quirks
  // around .or() with multiple eq filters.
  try {
    const { data } = await supabaseAdmin
      .from('notification_templates')
      .select('locale, subject, body')
      .eq('template_key', templateKey)
      .eq('channel', ch)
      .in('locale', [want, DEFAULT_LOCALE]);
    if (!data || !data.length) return null;
    const exact = data.find(r => String(r.locale).toLowerCase() === want);
    const fallback = data.find(r => String(r.locale).toLowerCase() === DEFAULT_LOCALE);
    const row = exact || fallback || data[0];
    return { subject: row.subject || '', body: row.body || '' };
  } catch (_) {
    // notification_templates may not be migrated yet — degrade gracefully.
    return null;
  }
}

// Returns a 2-letter locale code; never throws.
async function recipientLocale(recipientId) {
  if (!recipientId) return DEFAULT_LOCALE;
  try {
    const { data } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('preferred_locale')
      .eq('id', recipientId)
      .single();
    const v = data && data.preferred_locale ? String(data.preferred_locale).toLowerCase() : '';
    return v || DEFAULT_LOCALE;
  } catch (_) {
    return DEFAULT_LOCALE;
  }
}

module.exports = { resolveLocalizedTemplate, recipientLocale, DEFAULT_LOCALE };
