import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PsychiatristRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/psychiatrist/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ name, email, password, specialization }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setMessage('Registered successfully. You can now sign in.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-400 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md backdrop-blur bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
        <h1 className="text-2xl font-bold tracking-tight">Psychiatrist Registration</h1>
        <p className="text-sm text-white/80 mt-1">Moderator key required to create an account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Dr. Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="psy1@college.edu"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Anxiety, Depression, ..."
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Moderator key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter moderator key"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white py-2 rounded-lg font-medium disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-sm text-center text-white/90">{message}</div>
        )}

        <div className="mt-6 text-center text-sm text-white/80">
          Already have an account?{' '}
          <Link to="/psychiatrist-auth" className="text-blue-200 hover:text-white underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default PsychiatristRegister;


