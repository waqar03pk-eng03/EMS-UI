import React, { useEffect, useState } from 'react';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../auth/AuthContext';
import { getEvents } from '../services/eventService';

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }
    getEvents()
      .then(data => {
        setEvents(data);
        setError('');
      })
      .catch(err => setError(err.message));
  }, [user]);

  return (
    <>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <Dashboard events={events} user={user} />
    </>
  );
}
