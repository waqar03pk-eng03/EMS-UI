import React, { useCallback, useEffect, useState } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from '../services/categoryService';

const empty = { name: '', description: '' };

export default function Categories() {
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setFieldErrors({});
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setFieldErrors({ name: 'Enter a category name.' });
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (editingId) await updateCategory(editingId, form);
      else await createCategory(form);
      reset();
      await load();
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = c => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || '' });
    setFieldErrors({});
    setError('');
  };

  const remove = async c => {
    if (!window.confirm(`Delete the category "${c.name}"?`)) return;
    setError('');
    try {
      await deleteCategory(c.id);
      if (editingId === c.id) reset();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1 className="ems-h1">Categories</h1>
      <p className="text-muted mb-4">Categories group events and appear in the Create event form.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form onSubmit={submit} noValidate className="ems-form">
        <fieldset>
          <legend>{editingId ? 'Edit category' : 'New category'}</legend>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" maxLength={60} value={form.name} onChange={change}
                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`} />
              {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
            </div>
            <div className="form-group col-md-8">
              <label htmlFor="description">Description (optional)</label>
              <input id="description" name="description" maxLength={300} value={form.description} onChange={change}
                className="form-control" />
            </div>
          </div>
          <div className="mb-3">
            <button type="submit" className="btn ems-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
            </button>
            {editingId && <button type="button" className="btn btn-link ml-2" onClick={reset}>Cancel</button>}
          </div>
        </fieldset>
      </form>

      {categories === null && !error ? (
        <p className="text-muted">Loading…</p>
      ) : categories && categories.length === 0 ? (
        <div className="ems-empty"><h2>No categories yet</h2><p>Add the first one above.</p></div>
      ) : (
        categories && (
          <div className="table-responsive">
            <table className="table ems-table">
              <thead>
                <tr><th>Name</th><th>Description</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td className="ems-event-title">{c.name}</td>
                    <td className="text-muted">{c.description}</td>
                    <td className="text-right text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary mr-1" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}
