// src/pages/AddRequest.jsx
import React, { useState } from "react";

const AddRequest = () => {
  const [studentId, setStudentId] = useState(""); // replace with logged-in student ID
  const [college, setCollege] = useState("");
  const [message, setMessage] = useState("");
  const [createdAt, setCreatedAt] = useState(""); // optional timestamp input
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/api/request/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          college,
          message,
          createdAt: createdAt || undefined, // backend will fill if not provided
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Request sent successfully! Request ID: " + data.requestId);
        setStudentId("");
        setCollege("");
        setMessage("");
        setCreatedAt("");
      } else {
        setSuccess(data.error || "Something went wrong.");
      }
    } catch (err) {
      setSuccess("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-600">
          Connect with a Psychiatrist
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your student ID"
              required
            />
          </div>

          {/* College */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your college name"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why do you want to connect?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows="4"
              placeholder="Write a short message (optional)"
            ></textarea>
          </div>

          {/* Created At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At (optional)
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>

        {/* Success/Error Message */}
        {success && (
          <p className="mt-4 text-center text-sm text-green-600">{success}</p>
        )}
      </div>
    </div>
  );
};

export default AddRequest;
