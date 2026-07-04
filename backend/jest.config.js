'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/setup.js'],
  // uuid v14 is ESM-only; map it to a CJS shim so route requires work under Jest.
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/mocks/uuid.js',
  },
  collectCoverageFrom: [
    'routes/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!routes/index.js',
  ],
  coverageThreshold: {
    global: { lines: 30, functions: 30 },
  },
  testTimeout: 15000,
  forceExit: true,
  clearMocks: true,
  verbose: true,
};
