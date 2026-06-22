'use strict';

// Manual Jest mock for razorpay — used automatically whenever routes require('razorpay').
// Keeps payment tests self-contained without needing the real SDK.
const Razorpay = jest.fn().mockImplementation(() => ({
  orders: {
    create: jest.fn().mockResolvedValue({
      id: 'order_test123',
      amount: 99900,
      currency: 'INR',
      receipt: 'rcpt_test',
    }),
    fetch: jest.fn().mockResolvedValue({ id: 'order_test123', amount: 99900 }),
  },
  payments: {
    fetch: jest.fn().mockResolvedValue({ id: 'pay_test123', amount: 99900, status: 'captured' }),
    refund: jest.fn().mockResolvedValue({ id: 'rfnd_test123', amount: 99900 }),
  },
}));

module.exports = Razorpay;
