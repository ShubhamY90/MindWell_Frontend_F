import React, { useEffect, useState } from 'react';

const ViewRequests = () => {
  const [college, setCollege] = useState('');
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    if (!college) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/request/college/${encodeURIComponent(college)}?status=${encodeURIComponent(status)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      setItems(data.requests || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('psy_college');
    if (saved) setCollege(saved);
  }, []);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [college, status]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Requests</h1>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          placeholder="College"
          className="border rounded px-3 py-2"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="pending">pending</option>
          <option value="accepted">accepted</option>
          <option value="rejected">rejected</option>
        </select>
        <button onClick={fetchList} className="px-4 py-2 bg-indigo-600 text-white rounded">Refresh</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="border rounded p-3 bg-white">
              <div className="font-semibold">{r.studentName} <span className="text-xs text-gray-500">({r.studentEmail})</span></div>
              <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()} • {r.status}</div>
              {r.message && <div className="mt-1">{r.message}</div>}
              {r.status === 'accepted' && r.psychiatristName && (
                <div className="text-xs text-gray-500 mt-1">Accepted by {r.psychiatristName}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewRequests;
