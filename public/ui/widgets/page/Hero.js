/**
 * ui/widgets/page/Hero.js — branded hero header (logo + title + tagline).
 *
 *   JM.Hero({ logo: '📖', title: 'Bhasha Setu', tagline: 'Learn by reading' })
 *     → returns the hero HTML matching bhasha-setu's existing .hero CSS class.
 *
 *   JM.Hero({ logo, title, tagline, compact: true }) → smaller version (sub-views).
 *
 * Used by: bhasha-setu.html (3 places); reusable on any onboarding/landing page.
 */
window.JM = window.JM || {};
JM.Hero = function (o) {
  o = o || {};
  if (o.compact) {
    return '<div class="hero" style="padding-bottom:.4em">'
      + '<div class="logo">' + (o.logo || '📖') + '</div>'
      + '<h1 style="font-size:1.3em">' + (o.title || '') + '</h1>'
      + '</div>';
  }
  return '<div class="hero">'
    + '<div class="logo">' + (o.logo || '📖') + '</div>'
    + '<h1>' + (o.title || '') + '</h1>'
    + (o.tagline ? '<p>' + o.tagline + '</p>' : '')
    + '</div>';
};
