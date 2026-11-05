import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './auth/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Categories from './pages/Categories';
import ManageEvents from './pages/ManageEvents';

function NotFound() {
  return (
    <div className="ems-empty">
      <h2>Page not found</h2>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn ems-btn-primary">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="ems-app">
      <NavBar />
      <main className="container ems-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute admin><Categories /></ProtectedRoute>} />
          <Route path="/manage-events" element={<ProtectedRoute admin><ManageEvents /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="ems-footer">
        <div className="container">Eventide, event management</div>
      </footer>
    </div>
  );
}
