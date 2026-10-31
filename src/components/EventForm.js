import React, { useState } from 'react';
import { todayISO } from './format';

const CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Wedding', 'Fundraiser', 'Meetup', 'Other'];

const empty = {
  title: '',
  category: 'Conference',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  capacity: '',
  ticketPrice: '0',
  organizerEmail: '',
};

function validate(v) {
  const e = {};
  if (!v.title.trim()) e.title = 'Enter a name for the event.';
  if (!v.date) e.date = 'Choose the event date.';
  else if (v.date < todayISO()) e.date = 'The date can’t be in the past.';
  if (!v.startTime) e.startTime = 'Choose a start time.';
  if (!v.endTime) e.endTime = 'Choose an end time.';
  else if (v.startTime && v.endTime <= v.startTime) e.endTime = 'End time must be after the start time.';
  if (!v.venue.trim()) e.venue = 'Enter the venue.';
  if (!v.capacity || Number(v.capacity) < 1) e.capacity = 'Enter how many people can attend.';
  if (Number(v.ticketPrice) < 0) e.ticketPrice = 'Price can’t be negative.';
  if (!/^\S+@\S+\.\S+$/.test(v.organizerEmail)) e.organizerEmail = 'Enter a valid email address.';
  return e;
}

export default function EventForm({ onCreate, onDone }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const change = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const submit = async e => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setSubmitError('');
    setSaved(false);
    try {
      await onCreate({
        ...values,
        title: values.title.trim(),
        venue: values.venue.trim(),
        capacity: Number(values.capacity),
        ticketPrice: Number(values.ticketPrice),
      });
      setSaved(true);
      setValues(empty);
    } catch (err) {
      if (err.fields) setErrors(err.fields); // field messages from the API
      setSubmitError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className={props.wrapper || 'form-group'}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={values[name]}
        onChange={change}
        {...props.input}
      />
      {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="row">
      <div className="col-lg-8">
        <h1 className="ems-h1">Create event</h1>
        <p className="text-muted mb-4">Fill in the details below. You can add speakers and tickets later.</p>

        {saved && (
          <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
            <span>Event created.</span>
            <button className="btn btn-sm btn-success" onClick={onDone}>View events</button>
          </div>
        )}

        {submitError && <div className="alert alert-danger" role="alert">{submitError}</div>}

        <form onSubmit={submit} noValidate className="ems-form">
          <fieldset>
            <legend>About the event</legend>
            {field('title', 'Event name', { input: { type: 'text', maxLength: 120 } })}
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" className="form-control" value={values.category} onChange={change}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="form-control"
                value={values.description}
                onChange={change}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Date and place</legend>
            <div className="form-row">
              {field('date', 'Date', { wrapper: 'form-group col-md-4', input: { type: 'date', min: todayISO() } })}
              {field('startTime', 'Starts', { wrapper: 'form-group col-md-4', input: { type: 'time' } })}
              {field('endTime', 'Ends', { wrapper: 'form-group col-md-4', input: { type: 'time' } })}
            </div>
            {field('venue', 'Venue', { input: { type: 'text' } })}
          </fieldset>

          <fieldset>
            <legend>Tickets and contact</legend>
            <div className="form-row">
              {field('capacity', 'Capacity', { wrapper: 'form-group col-md-6', input: { type: 'number', min: 1 } })}
              {field('ticketPrice', 'Ticket price (0 for free)', { wrapper: 'form-group col-md-6', input: { type: 'number', min: 0, step: '0.01' } })}
            </div>
            {field('organizerEmail', 'Organiser email', { input: { type: 'email' } })}
          </fieldset>

          <button type="submit" className="btn ems-btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save event'}
          </button>
          <button type="button" className="btn btn-link ml-2" onClick={onDone}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
