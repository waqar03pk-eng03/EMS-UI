import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import EventList from '../components/EventList';
import { getEvents } from '../services/eventService';

export default function Events() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const created = location.state && location.state.created;

  useEffect(() => {
    getEvents().then(setEvents).catch(err => setError(err.message));
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="ems-h1 mb-0">Events</h1>
        <Link to="/create-event" className="btn ems-btn-primary">Create event</Link>
      </div>

      {created && <div className="alert alert-success" role="status">“{created}” was created.</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {events === null && !error ? <p className="text-muted">Loading…</p> : events && <EventList events={events} />}
    </>
  );
}
