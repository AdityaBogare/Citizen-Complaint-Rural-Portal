import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'citizen'
};

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('portalToken', data.token);
      localStorage.setItem('portalUser', JSON.stringify(data.user));
      setMessage(`${mode === 'login' ? 'Welcome back' : 'Registration successful'}: ${data.user.name}`);
      window.location.href = '/dashboard';
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-page page-shell">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <div className="toggle-row">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <label>
              Full Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
          )}

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          {mode === 'register' && (
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <button type="submit" className="primary-btn full-width">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        {message && <p className="status-message">{message}</p>}

        <Link to="/" className="back-link">← Back to home</Link>
      </div>
    </div>
  );
};

export default AuthPage;
