import React from 'react';
import { formatDate, formatTime } from '../format';

export default function EventList({ events, onDelete, onCreateClick }) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="ems-h1 mb-0">Events</h1>
        <button className="btn ems-btn-primary" onClick={onCreateClick}>Create event</button>
      </div>

      {events.length === 0 ? (
        <div className="ems-empty">
          <h2>No events yet</h2>
          <p>Create your first event to start selling tickets and tracking attendance.</p>
          <button className="btn ems-btn-primary" onClick={onCreateClick}>Create event</button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table ems-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>When</th>
                <th>Venue</th>
                <th className="text-right">Capacity</th>
                <th className="text-right">Ticket</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>
                    <div className="ems-event-title">{e.title}</div>
                    <span className="badge ems-badge">{e.category}</span>
                  </td>
                  <td>
                    {formatDate(e.date)}
                    <div className="text-muted small">{formatTime(e.startTime)} to {formatTime(e.endTime)}</div>
                  </td>
                  <td>{e.venue}</td>
                  <td className="text-right">{e.capacity}</td>
                  <td className="text-right">{Number(e.ticketPrice) > 0 ? `$${Number(e.ticketPrice).toFixed(2)}` : 'Free'}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => window.confirm(`Delete "${e.title}"?`) && onDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}