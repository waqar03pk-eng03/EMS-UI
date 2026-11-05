import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const change = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const submit = async e => {
    e.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = 'Enter a valid email address.';
    if (values.password.length < 8) found.password = 'Use at least 8 characters.';
    if (values.confirm !== values.password) found.confirm = 'The passwords don’t match.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setError('');
    try {
      await register(values.name.trim(), values.email.trim(), values.password);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setError(err.message);
      setSaving(false);
    }
  };

  const field = (name, label, type, autoComplete) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={values[name]} onChange={change} />
      {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="ems-auth">
      <h1 className="ems-h1">Create an account</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={submit} noValidate>
        {field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password (8+ characters)', 'password', 'new-password')}
        {field('confirm', 'Confirm password', 'password', 'new-password')}
        <button type="submit" className="btn ems-btn-primary btn-block" disabled={saving}>
          {saving ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="mt-3 mb-0 text-center">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
