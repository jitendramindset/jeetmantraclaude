/**
 * Wraps an async Express route handler to forward errors to next(err).
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
module.exports = function asyncHandler(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
