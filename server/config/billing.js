// Booking fee charged when an event is created. Set BOOKING_FEE / BOOKING_CURRENCY in .env.
function getBilling() {
  const raw = process.env.BOOKING_FEE;
  const fee = raw === undefined || raw === '' ? 50 : Number(raw);
  return {
    bookingFee: Number.isFinite(fee) && fee >= 0 ? fee : 50,
    currency: process.env.BOOKING_CURRENCY || 'USD',
  };
}

module.exports = { getBilling };
