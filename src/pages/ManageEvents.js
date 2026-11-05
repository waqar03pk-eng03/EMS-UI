import React, { useCallback, useEffect, useState } from 'react';
import EventList from '../components/EventList';
import EventForm from '../components/EventForm';
import { getEvents, updateEvent, deleteEvent } from '../services/eventService';

export default function ManageEvents() {
  const [events, setEvents] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setEvents(await getEvents());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async data => {
    await updateEvent(editing.id, data);
    setEditing(null);
    await load();
  };

  const handleDelete = async id => {
    try {
      await deleteEvent(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (editing) {
    return <EventForm event={editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />;
  }

  const paid = events ? events.filter(e => e.payment && e.payment.status === 'paid').length : 0;

  return (
    <>
      <div className="mb-4">
        <h1 className="ems-h1 mb-1">Events Management</h1>
        {events && (
          <p className="text-muted mb-0">
            {events.length} event{events.length === 1 ? '' : 's'} · {paid} fee{paid === 1 ? '' : 's'} paid · {events.length - paid} unpaid
          </p>
        )}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {events === null && !error ? (
        <p className="text-muted">Loading…</p>
      ) : (
        events && <EventList admin events={events} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </>
  );
}
