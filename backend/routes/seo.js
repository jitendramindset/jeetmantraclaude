/**
 * seo.js — Phase B SEO surface for the public marketplace.
 *
 * EDUOS_GAP_ANALYSIS_V2 §4 flagged SEO as the biggest hole for the marketplace
 * pillar: no sitemap, no structured data, no meta endpoint. This ships them.
 *
 * Two mounts (see server.js):
 *   rootRouter  at '/'        → GET /sitemap.xml, GET /robots.txt
 *   router      at '/api/seo' → GET /course/:slug, GET /org/:slug (meta+JSON-LD)
 *
 * All public — these power crawler discovery and rich results. No PII.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();
const rootRouter = express.Router();

function baseUrl(req) {
  return (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}
const xmlEsc = s => String(s || '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

// GET /sitemap.xml — every published course (by slug) + every org (by slug).
rootRouter.get('/sitemap.xml', async (req, res) => {
  try {
    const base = baseUrl(req);
    const [{ data: courses }, { data: orgs }] = await Promise.all([
      supabaseAdmin.from('courses').select('slug, updated_at, is_active').eq('is_active', true).not('slug', 'is', null).limit(5000),
      supabaseAdmin.from('organizations').select('slug, updated_at').not('slug', 'is', null).limit(5000).then(r => r).catch(() => ({ data: [] }))
    ]);
    const urls = [];
    urls.push(`<url><loc>${base}/</loc><changefreq>daily</changefreq></url>`);
    urls.push(`<url><loc>${base}/marketplace</loc><changefreq>daily</changefreq></url>`);
    (courses || []).forEach(c => urls.push(
      `<url><loc>${base}/course/${xmlEsc(c.slug)}</loc>${c.updated_at ? `<lastmod>${String(c.updated_at).slice(0, 10)}</lastmod>` : ''}<changefreq>weekly</changefreq></url>`));
    (orgs || []).forEach(o => urls.push(
      `<url><loc>${base}/org/${xmlEsc(o.slug)}</loc>${o.updated_at ? `<lastmod>${String(o.updated_at).slice(0, 10)}</lastmod>` : ''}</url>`));
    res.set('Content-Type', 'application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (e) {
    res.set('Content-Type', 'application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

// GET /robots.txt — allow all, point at the sitemap.
rootRouter.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
});

// GET /api/seo/course/:slug — OpenGraph/meta + schema.org JSON-LD for a course.
router.get('/course/:slug', async (req, res) => {
  try {
    const base = baseUrl(req);
    const { data: c } = await supabaseAdmin.from('courses').select('*').eq('slug', req.params.slug).maybeSingle();
    if (!c) return res.status(404).json({ error: 'Course not found' });
    // Aggregate rating from reviews (best-effort).
    let rating = null;
    try {
      const { data: reviews } = await supabaseAdmin.from('course_reviews').select('rating').eq('course_id', c.id);
      if (reviews && reviews.length) {
        const avg = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length;
        rating = { value: Math.round(avg * 10) / 10, count: reviews.length };
      }
    } catch (_) {}
    const url = `${base}/course/${encodeURIComponent(c.slug)}`;
    const meta = {
      title: c.title,
      description: c.meta_description || (c.description || '').slice(0, 160),
      canonical: url,
      og: { 'og:type': 'website', 'og:title': c.title, 'og:description': c.meta_description || (c.description || '').slice(0, 160), 'og:image': c.cover_image || null, 'og:url': url }
    };
    const jsonLd = {
      '@context': 'https://schema.org', '@type': 'Course', name: c.title,
      description: c.description || c.meta_description || '', url,
      ...(c.cover_image ? { image: c.cover_image } : {}),
      ...(c.price != null ? { offers: { '@type': 'Offer', price: c.price, priceCurrency: c.currency || 'INR', availability: 'https://schema.org/InStock' } } : {}),
      ...(rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.value, reviewCount: rating.count } } : {}),
      provider: { '@type': 'Organization', name: c.institute_name || 'JeetMantra' }
    };
    res.json({ meta, jsonLd });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/seo/org/:slug — meta + Organization JSON-LD.
router.get('/org/:slug', async (req, res) => {
  try {
    const base = baseUrl(req);
    const { data: o } = await supabaseAdmin.from('organizations').select('*').eq('slug', req.params.slug).maybeSingle();
    if (!o) return res.status(404).json({ error: 'Organization not found' });
    const url = `${base}/org/${encodeURIComponent(o.slug)}`;
    const seo = o.seo || {};
    res.json({
      meta: {
        title: o.name,
        description: seo.meta_description || `${o.name} — ${o.type} on JeetMantra`,
        canonical: url,
        og: { 'og:type': 'website', 'og:title': o.name, 'og:description': seo.meta_description || '', 'og:image': seo.og_image || o.branding?.logo || null, 'og:url': url }
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': o.type === 'school' ? 'School' : 'EducationalOrganization',
        name: o.name, url, ...(seo.og_image ? { image: seo.og_image } : {})
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
module.exports.rootRouter = rootRouter;
