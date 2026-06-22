'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/setup.js'],
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
