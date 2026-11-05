import React from 'react';
import { formatMoney } from './format';

const OPTIONS = [
  { value: 'card', label: 'Credit or debit card', hint: 'Pay the booking fee by card.' },
  { value: 'paypal', label: 'PayPal', hint: 'Pay the booking fee with your PayPal account.' },
  { value: 'later', label: 'Pay later', hint: 'Create the event now. The fee will show as unpaid.' },
];

export default function PaymentSection({ billing, method, onChange, error }) {
  const fee = billing ? formatMoney(billing.bookingFee, billing.currency) : '…';

  return (
    <fieldset>
      <legend>Booking fee</legend>
      <p className="mb-3">
        Creating an event has a booking fee of <strong className="ems-fee">{fee}</strong>.
      </p>

      {OPTIONS.map(o => (
        <div key={o.value} className={`ems-pay-option ${method === o.value ? 'selected' : ''}`}>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id={`pay-${o.value}`}
              value={o.value}
              checked={method === o.value}
              onChange={() => onChange(o.value)}
            />
            <label className="form-check-label" htmlFor={`pay-${o.value}`}>
              <span className="d-block font-weight-bold">{o.label}</span>
              <span className="text-muted small">{o.hint}</span>
            </label>
          </div>
        </div>
      ))}

      {error && <div className="text-danger small mb-2">{error}</div>}

      <p className="text-muted small mb-3">
        Payments are simulated for now. No card or PayPal details are collected or stored.
      </p>
    </fieldset>
  );
}
