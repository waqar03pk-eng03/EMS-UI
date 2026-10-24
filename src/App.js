import React, { useState, useEffect, useCallback } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import { getEvents, createEvent, deleteEvent } from './services/eventservice';

function Placeholder({ title, text }) {
  return (
    <div className="ems-empty">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [events, setEvents] = useState([]);

  const load = useCallback(() => {
    getEvents().then(setEvents);
  }, []);

  useEffect(load, [load]);

  const handleCreate = async data => {
    await createEvent(data);
    load();
  };

  const handleDelete = async id => {
    await deleteEvent(id);
    load();
  };

  let page;
  switch (view) {
    case 'events':
      page = <EventList events={events} onDelete={handleDelete} onCreateClick={() => setView('create')} />;
      break;
    case 'create':
      page = <EventForm onCreate={handleCreate} onDone={() => setView('events')} />;
      break;
    case 'attendees':
      page = <Placeholder title="Attendees" text="Registration and check-in will live here once the API is connected." />;
      break;
    case 'profile':
      page = <Placeholder title="Your profile" text="Account details will appear here after you add sign-in." />;
      break;
    case 'settings':
      page = <Placeholder title="Settings" text="Organisation and notification settings will appear here." />;
      break;
    default:
      page = <Dashboard events={events} onNavigate={setView} />;
  }

  return (
    <div className="ems-app">
      <NavBar current={view} onNavigate={setView} user={{ name: 'Alex Morgan', role: 'Organiser' }} />
      <main className="container ems-main">{page}</main>
      <footer className="ems-footer">
        <div className="container">Eventide, event management</div>
      </footer>
    </div>
  );
}