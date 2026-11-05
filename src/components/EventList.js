import React from 'react';
import { formatDate, formatTime, formatMoney } from './format';

const METHOD_LABEL = { paypal: 'PayPal', card: 'Card' };

function FeeCell({ payment }) {
  if (!payment) return <span className="text-muted">n/a</span>;
  if (payment.status === 'paid') {
    return (
      <>
        <span className="badge badge-success">Paid</span>
        <div className="small text-muted mt-1">
          {formatMoney(payment.amount, payment.currency)} · {METHOD_LABEL[payment.method] || payment.method}
        </div>
        <div className="small text-muted">{payment.reference}</div>
      </>
    );
  }
  return (
    <>
      <span className="badge badge-warning">Unpaid</span>
      <div className="small text-muted mt-1">{formatMoney(payment.amount, payment.currency)} due</div>
    </>
  );
}

// Read-only table by default. Pass admin + onEdit + onDelete for the management view.
export default function EventList({ events, admin, onEdit, onDelete }) {
  if (events.length === 0) {
    return (
      <div className="ems-empty">
        <h2>No events yet</h2>
        <p>Events will appear here once they have been created.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table ems-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>When</th>
            <th>Venue</th>
            <th className="text-right">Capacity</th>
            <th className="text-right">Ticket</th>
            {admin && <th>Booking fee</th>}
            {admin && <th><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr key={e.id}>
              <td>
                <div className="ems-event-title">{e.title}</div>
                {e.category && <span className="badge ems-badge">{e.category.name}</span>}
              </td>
              <td>
                {formatDate(e.date)}
                <div className="text-muted small">{formatTime(e.startTime)} to {formatTime(e.endTime)}</div>
              </td>
              <td>{e.venue}</td>
              <td className="text-right">{e.capacity}</td>
              <td className="text-right">{Number(e.ticketPrice) > 0 ? formatMoney(e.ticketPrice) : 'Free'}</td>
              {admin && <td><FeeCell payment={e.payment} /></td>}
              {admin && (
                <td className="text-right text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary mr-1" onClick={() => onEdit(e)}>Edit</button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => window.confirm(`Delete "${e.title}"?`) && onDelete(e.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
