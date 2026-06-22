// EduOS E2E accessibility helpers (CommonJS).
//
// Injects axe-core into the page under test and runs an audit. axe-core's
// browser bundle is loaded from the installed npm package and added via
// page.addScriptTag({ content }) so no network/CDN is required.
//
// Install: npm i -D axe-core

const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');

// Resolve the axe-core minified browser source once.
let _axeSource = null;
function getAxeSource() {
  if (_axeSource) return _axeSource;
  // require.resolve finds node_modules/axe-core regardless of hoisting.
  const pkgEntry = require.resolve('axe-core'); // -> .../axe-core/axe.js (or lib entry)
  const dir = path.dirname(pkgEntry);
  const candidates = [
    path.join(dir, 'axe.min.js'),
    path.join(dir, 'axe.js'),
    pkgEntry,
  ];
  const file = candidates.find((f) => fs.existsSync(f));
  if (!file) {
    throw new Error('axe-core source not found near ' + pkgEntry);
  }
  _axeSource = fs.readFileSync(file, 'utf8');
  return _axeSource;
}

/**
 * checkA11y(page, { include, failOn }) -> Promise<violations[]>
 * Injects axe-core and runs axe.run, returning the raw array of violation
 * objects (each has id, impact, description, nodes, ...).
 *
 *   include : optional CSS selector (string) or array of selectors to scope the
 *             scan. Omit to scan the whole document.
 *   failOn  : accepted for signature symmetry / future use; this function does
 *             NOT assert — it only returns violations. Use assertNoSeriousA11y
 *             (or your own logic) to fail the test. Defaults to
 *             ['serious','critical'] and is attached to the returned array as
 *             `.failOn` for convenience.
 */
async function checkA11y(page, options = {}) {
  const { include } = options;
  const failOn = options.failOn || ['serious', 'critical'];

  await page.addScriptTag({ content: getAxeSource() });

  const context = include
    ? { include: Array.isArray(include) ? include.map((s) => [s]) : [[include]] }
    : undefined;

  const result = await page.evaluate(async (ctx) => {
    // eslint-disable-next-line no-undef
    const run = await window.axe.run(ctx || document, {
      resultTypes: ['violations'],
    });
    return run.violations;
  }, context);

  const violations = result || [];
  // Stash the threshold so callers/assertions can read it if useful.
  Object.defineProperty(violations, 'failOn', { value: failOn, enumerable: false });
  return violations;
}

/**
 * assertNoSeriousA11y(page, options?) -> Promise<violations[]>
 * Runs checkA11y and FAILS the test only when there is at least one violation
 * with impact 'serious' or 'critical'. Moderate/minor violations are reported
 * via console.warn and do not fail the test. Returns the full violations array.
 *
 *   options.include : optional selector(s), forwarded to checkA11y.
 */
async function assertNoSeriousA11y(page, options = {}) {
  const violations = await checkA11y(page, { include: options.include, failOn: ['serious', 'critical'] });

  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const lesser = violations.filter((v) => v.impact === 'moderate' || v.impact === 'minor');

  if (lesser.length) {
    for (const v of lesser) {
      // eslint-disable-next-line no-console
      console.warn(`[a11y ${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s)) -> ${v.helpUrl}`);
    }
  }

  if (serious.length) {
    const summary = serious
      .map((v) => `  - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n    ${v.helpUrl}`)
      .join('\n');
    expect(serious, `Found ${serious.length} serious/critical a11y violation(s):\n${summary}`).toHaveLength(0);
  }

  return violations;
}

module.exports = {
  checkA11y,
  assertNoSeriousA11y,
  getAxeSource,
};
