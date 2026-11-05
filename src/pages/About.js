import React from 'react';

export default function About() {
  return (
    <div className="row">
      <div className="col-lg-8">
        <h1 className="ems-h1">About Eventide</h1>
        <p className="lead">
          Eventide helps organisers plan events, set up tickets and keep every booking in one place.
        </p>
        <h2 className="ems-h2 mt-4 mb-2">What you can do</h2>
        <ul>
          <li>Browse the events that are coming up.</li>
          <li>Create an event and pay its booking fee by card or PayPal.</li>
          <li>Administrators manage event categories and review every event, including whether its fee has been paid.</li>
        </ul>
        <h2 className="ems-h2 mt-4 mb-2">Getting started</h2>
        <p>Create an account, log in, and choose “Create event” from the menu.</p>
      </div>
    </div>
  );
}
