import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const from = (location.state && location.state.from) || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Once logged in, send the user back to where they were headed.
  if (user) return <Navigate to={from} replace />;

  const submit = async e => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="ems-auth">
      <h1 className="ems-h1">Log in</h1>
      {location.state && location.state.from && (
        <div className="alert alert-info">Please log in to continue.</div>
      )}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={submit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="form-control"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="form-control"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn ems-btn-primary btn-block" disabled={saving}>
          {saving ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-3 mb-0 text-center">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
