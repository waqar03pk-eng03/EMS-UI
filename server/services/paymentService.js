const crypto = require('crypto');

// PAYMENT STUB: nothing is really charged and no card or PayPal data ever reaches this server.
// When you are ready, replace the body of charge() with PayPal Orders API / Stripe PaymentIntents
// calls and keep the same return shape, so the rest of the app does not change.
async function charge({ method, amount, currency }) {
  return {
    status: 'paid',
    method,
    amount,
    currency,
    reference: `MOCK-${method.toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    paidAt: new Date(),
  };
}

module.exports = { charge };
