import React, { useState, useEffect } from 'react';
import { todayISO, formatMoney } from './format';
import PaymentSection from './PaymentSection';
import { getCategories } from '../services/categoryService';
import { getBookingConfig } from '../services/eventService';

const blank = {
  title: '',
  category: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  capacity: '',
  ticketPrice: '0',
  organizerEmail: '',
};

function fromEvent(e) {
  return {
    title: e.title,
    category: e.category ? e.category.id : '',
    description: e.description || '',
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    venue: e.venue,
    capacity: String(e.capacity),
    ticketPrice: String(e.ticketPrice),
    organizerEmail: e.organizerEmail,
  };
}

function validate(v, editing) {
  const e = {};
  if (!v.title.trim()) e.title = 'Enter a name for the event.';
  if (!v.category) e.category = 'Choose a category.';
  if (!v.date) e.date = 'Choose the event date.';
  else if (!editing && v.date < todayISO()) e.date = 'The date can’t be in the past.';
  if (!v.startTime) e.startTime = 'Choose a start time.';
  if (!v.endTime) e.endTime = 'Choose an end time.';
  else if (v.startTime && v.endTime <= v.startTime) e.endTime = 'End time must be after the start time.';
  if (!v.venue.trim()) e.venue = 'Enter the venue.';
  if (!v.capacity || Number(v.capacity) < 1) e.capacity = 'Enter how many people can attend.';
  if (Number(v.ticketPrice) < 0) e.ticketPrice = 'Price can’t be negative.';
  if (!/^\S+@\S+\.\S+$/.test(v.organizerEmail)) e.organizerEmail = 'Enter a valid email address.';
  return e;
}

// Create mode:  <EventForm onSubmit={fn} onCancel={fn} />
// Edit mode:    <EventForm event={existingEvent} onSubmit={fn} onCancel={fn} />
// onSubmit receives the form values and should return a promise; reject to show an error.
export default function EventForm({ event, onSubmit, onCancel }) {
  const editing = Boolean(event);
  const [values, setValues] = useState(editing ? fromEvent(event) : blank);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [billing, setBilling] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let alive = true;
    getCategories()
      .then(list => alive && setCategories(list))
      .catch(err => alive && setSubmitError(err.message));
    if (!editing) {
      getBookingConfig()
        .then(c => alive && setBilling(c))
        .catch(err => alive && setSubmitError(err.message));
    }
    return () => {
      alive = false;
    };
  }, [editing]);

  const change = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const submit = async e => {
    e.preventDefault();
    const found = validate(values, editing);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setSubmitError('');
    try {
      const payload = {
        ...values,
        title: values.title.trim(),
        venue: values.venue.trim(),
        capacity: Number(values.capacity),
        ticketPrice: Number(values.ticketPrice),
      };
      await onSubmit(editing ? payload : { ...payload, paymentMethod });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setSubmitError(err.message);
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

  let submitLabel = 'Save changes';
  if (!editing) {
    submitLabel =
      paymentMethod === 'later' || !billing
        ? 'Create event'
        : `Pay ${formatMoney(billing.bookingFee, billing.currency)} and create event`;
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <h1 className="ems-h1">{editing ? 'Edit event' : 'Create event'}</h1>
        <p className="text-muted mb-4">
          {editing ? `Changing “${event.title}”.` : 'Fill in the details below. You can add speakers and tickets later.'}
        </p>

        {submitError && <div className="alert alert-danger" role="alert">{submitError}</div>}

        <form onSubmit={submit} noValidate className="ems-form">
          <fieldset>
            <legend>About the event</legend>
            {field('title', 'Event name', { input: { type: 'text', maxLength: 120 } })}
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                value={values.category}
                onChange={change}
              >
                <option value="">Choose a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              {categories.length === 0 && (
                <small className="form-text text-muted">
                  No categories exist yet. An administrator needs to add some first.
                </small>
              )}
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
              {field('date', 'Date', { wrapper: 'form-group col-md-4', input: { type: 'date', min: editing ? undefined : todayISO() } })}
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

          {!editing && (
            <PaymentSection
              billing={billing}
              method={paymentMethod}
              onChange={setPaymentMethod}
              error={errors.paymentMethod}
            />
          )}

          <button type="submit" className="btn ems-btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
          <button type="button" className="btn btn-link ml-2" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
