/**
 * ui/widgets/page/CourseCard.js — marketplace/listing course card.
 *
 *   JM.CourseCard({
 *     id, title, instructor, category, level, cover,    // visual data
 *     priceLabel, ratingLabel,                          // formatted strings
 *     chips,            // pre-rendered <span class="mp-chip">…</span> HTML
 *     freeListing, demoClass, owned,                    // booleans
 *     onPreview, onBuy                                  // JS expressions for onclick
 *   })
 *     → returns the card HTML string. State-bound logic stays in the caller.
 *
 *   JM.CourseCard.css() → shared CSS so any page can embed.
 *
 * Used by: marketplace.html (course grid + trending). Reusable on any page
 * that shows enrollable courses (dashboard "browse" surfaces, partner storefronts).
 */
window.JM = window.JM || {};
JM.CourseCard = function (o) {
  o = o || {};
  var esc = (window.JM && JM.esc) || function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  var freeTag = o.freeListing ? '<span class="mp-chip" style="background:#dcfce7;color:#166534">🎁 Free</span>' : '';
  var demoTag = o.demoClass ? '<span class="mp-chip" style="background:#fef3c7;color:#92400e">🎬 Demo class</span>' : '';
  var chips = o.chips || '';
  var chipBlock = (chips || freeTag || demoTag)
    ? '<div class="mp-chips">' + freeTag + demoTag + chips + '</div>' : '';
  var cover = o.cover || '📚';
  return '<div class="course-card" data-course-id="' + esc(o.id || '') + '">'
    + '<div class="course-thumb">' + cover
    +   '<span class="course-category">' + esc(o.category || 'Course') + '</span>'
    +   '<span class="course-level">' + esc(o.level || '') + '</span>'
    + '</div>'
    + '<div class="course-body">'
    +   '<div class="course-title">' + esc(o.title || 'Untitled Course') + '</div>'
    +   '<div class="course-instructor">👨‍🏫 ' + esc(o.instructor || 'Instructor') + '</div>'
    +   chipBlock
    +   '<div class="course-meta">'
    +     '<div class="course-price">' + (o.priceLabel || '') + '</div>'
    +     '<div class="course-rating">' + (o.ratingLabel || '⭐ 4.5') + '</div>'
    +   '</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +     '<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();' + (o.onPreview || '') + '">👁 Preview</button>'
    +     '<button class="buy-btn ' + (o.owned ? 'owned' : '') + '" style="margin-top:0;padding:8px" onclick="event.stopPropagation();' + (o.owned ? '' : (o.onBuy || '')) + '">'
    +       (o.owned ? '✅ Enrolled' : 'Buy Now')
    +     '</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
};
