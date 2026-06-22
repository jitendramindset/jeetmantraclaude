'use strict';

/**
 * Returns a chainable Supabase mock where every method returns `this`
 * and terminal operations (single, insert, upsert, update, delete) resolve
 * to { data: defaultData, error: defaultError } by default.
 *
 * Override per-test:
 *   mock.single.mockResolvedValueOnce({ data: {...}, error: null })
 */
function makeChain(defaultData = null, defaultError = null) {
  const resolve = () => Promise.resolve({ data: defaultData, error: defaultError });

  const chain = {
    select:  jest.fn().mockReturnThis(),
    eq:      jest.fn().mockReturnThis(),
    neq:     jest.fn().mockReturnThis(),
    in:      jest.fn().mockReturnThis(),
    is:      jest.fn().mockReturnThis(),
    not:     jest.fn().mockReturnThis(),
    gt:      jest.fn().mockReturnThis(),
    gte:     jest.fn().mockReturnThis(),
    lt:      jest.fn().mockReturnThis(),
    lte:     jest.fn().mockReturnThis(),
    like:    jest.fn().mockReturnThis(),
    ilike:   jest.fn().mockReturnThis(),
    or:      jest.fn().mockReturnThis(),
    order:   jest.fn().mockReturnThis(),
    limit:   jest.fn().mockReturnThis(),
    range:   jest.fn().mockReturnThis(),
    filter:  jest.fn().mockReturnThis(),
    match:   jest.fn().mockReturnThis(),
    // Terminal — return a promise
    single:  jest.fn().mockImplementation(resolve),
    insert:  jest.fn().mockImplementation(resolve),
    upsert:  jest.fn().mockImplementation(resolve),
    update:  jest.fn().mockReturnThis(),  // update().eq() is common, so still chainable
    delete:  jest.fn().mockReturnThis(),
    // Make the chain itself thenable (for `await supabase.from(...).select()`)
    then: (onFulfilled) => Promise.resolve({ data: defaultData, error: defaultError }).then(onFulfilled),
    catch: (onRejected) => Promise.resolve({ data: defaultData, error: defaultError }).catch(onRejected),
  };

  // update().eq() must also be thenable
  chain.update.mockReturnValue({
    ...chain,
    eq: jest.fn().mockReturnThis(),
    then: (onFulfilled) => Promise.resolve({ data: defaultData, error: defaultError }).then(onFulfilled),
  });

  chain.delete.mockReturnValue({
    ...chain,
    eq: jest.fn().mockReturnThis(),
    then: (onFulfilled) => Promise.resolve({ data: defaultData, error: defaultError }).then(onFulfilled),
  });

  return chain;
}

/**
 * Creates a full supabaseAdmin mock with a controllable `.from()`.
 * Usage:
 *   const { adminMock, chain } = makeAdminMock();
 *   jest.mock('../config/supabase', () => ({ supabaseAdmin: adminMock, supabase: adminMock }));
 *   // then in test: chain.single.mockResolvedValueOnce({ data: user, error: null })
 */
function makeAdminMock(defaultData = null, defaultError = null) {
  const chain = makeChain(defaultData, defaultError);
  const adminMock = {
    from:  jest.fn().mockReturnValue(chain),
    rpc:   jest.fn().mockResolvedValue({ data: null, error: null }),
    auth:  { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
  };
  return { adminMock, chain };
}

module.exports = { makeChain, makeAdminMock };
