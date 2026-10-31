import React from 'react';
import { formatDate, formatTime, todayISO } from './format';

export default function Dashboard({ events, onNavigate }) {
  const upcoming = events.filter(e => e.date >= todayISO());
  const next = upcoming[0];
  const seats = upcoming.reduce((sum, e) => sum + Number(e.capacity || 0), 0);

  return (
    <>
      <section className="ems-hero">
        <div className="ems-hero-copy">
          <h1>Every event, ready on opening night.</h1>
          <p>
            Plan the venue, set the tickets and keep your schedule in one place.
          </p>
          <button className="btn ems-btn-accent btn-lg" onClick={() => onNavigate('create')}>
            Create event
          </button>
        </div>

        {next ? (
          <article className="ems-ticket" aria-label="Next event">
            <div className="ems-ticket-main">
              <p className="ems-ticket-note">Next up</p>
              <h2>{next.title}</h2>
              <p className="mb-1">{formatDate(next.date)}, {formatTime(next.startTime)}</p>
              <p className="mb-0">{next.venue}</p>
            </div>
            <div className="ems-ticket-stub">
              <span className="ems-ticket-num">{next.capacity}</span>
              <span>seats</span>
            </div>
          </article>
        ) : (
          <article className="ems-ticket ems-ticket-empty">
            <div className="ems-ticket-main">
              <h2>No upcoming events</h2>
              <p className="mb-0">Create your first event and it will appear here.</p>
            </div>
          </article>
        )}
      </section>

      <section className="row ems-stats">
        <div className="col-md-4"><div className="ems-stat"><strong>{upcoming.length}</strong> upcoming events</div></div>
        <div className="col-md-4"><div className="ems-stat"><strong>{seats}</strong> seats on offer</div></div>
        <div className="col-md-4"><div className="ems-stat"><strong>{events.length - upcoming.length}</strong> past events</div></div>
      </section>

      <section className="mt-5">
        <div className="d-flex justify-content-between align-items-baseline mb-3">
          <h2 className="ems-h2">Coming up</h2>
          <button className="btn btn-link p-0" onClick={() => onNavigate('events')}>See all events</button>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-muted">Nothing scheduled yet.</p>
        ) : (
          <ul className="list-unstyled ems-agenda">
            {upcoming.slice(0, 5).map(e => (
              <li key={e.id}>
                <span className="ems-agenda-date">{formatDate(e.date, true)}</span>
                <span className="ems-agenda-title">{e.title}</span>
                <span className="ems-agenda-venue">{e.venue}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}