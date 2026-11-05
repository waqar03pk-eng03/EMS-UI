import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { createEvent } from '../services/eventService';

export default function CreateEvent() {
  const navigate = useNavigate();

  const handleSubmit = async data => {
    const created = await createEvent(data);
    navigate('/events', { state: { created: created.title } });
  };

  return <EventForm onSubmit={handleSubmit} onCancel={() => navigate('/events')} />;
}
