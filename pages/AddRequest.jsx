// src/pages/AddRequest.jsx
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../context/firebase/firebase";
import { API_BASE_URL } from "../src/utils/api";

const AddRequest = () => {
  const [studentId, setStudentId] = useState("");
  const [college, setCollege] = useState("");
  const [tempCollege, setTempCollege] = useState(""); // For input when college not found
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [collegeNotFound, setCollegeNotFound] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setStudentId(user.uid);
        
        try {
          let collegeData = "";
          
          // Try to get college from students collection
          const studentDoc = await getDoc(doc(db, "students", user.uid));
          if (studentDoc.exists()) {
            collegeData = studentDoc.data().college || "";
          }
          
          // If not found, try users collection
          if (!collegeData) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              collegeData = userDoc.data().college || "";
            }
          }
          
          setCollege(collegeData);
          
          // Show college input if college is not found
          if (!collegeData) {
            setCollegeNotFound(true);
          }
          
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCollegeNotFound(true);
        } finally {
          setUserLoading(false);
        }
      } else {
        setUserLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveCollegeToProfile = async () => {
    if (!tempCollege.trim()) return;
    
    try {
      // Try to save to students collection first
      const studentRef = doc(db, "students", studentId);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        await updateDoc(studentRef, { college: tempCollege.trim() });
      } else {
        // If not in students, try users collection
        const userRef = doc(db, "users", studentId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, { college: tempCollege.trim() });
        } else {
          // Create a new document in students collection
          await updateDoc(studentRef, { college: tempCollege.trim() });
        }
      }
      
      setCollege(tempCollege.trim());
      setCollegeNotFound(false);
      setSuccess("College information saved to your profile!");
      
    } catch (error) {
      console.error("Error saving college:", error);
      setSuccess("Error saving college information. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userLoading) return;
    
    // Use tempCollege if college is not set yet
    const collegeToSubmit = college || tempCollege;
    
    if (!collegeToSubmit.trim()) {
      setSuccess("Please provide your college information.");
      return;
    }
    
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/request/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          college: collegeToSubmit.trim(),
          message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Request sent successfully! You will be contacted soon.");
        setMessage("");
        
        // If we used tempCollege, save it to profile
        if (!college && tempCollege) {
          await saveCollegeToProfile();
        }
      } else {
        setSuccess(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setSuccess("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-indigo-200 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-indigo-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
          </div>
          <p className="mt-4 text-indigo-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Connect with a Psychiatrist
          </h2>
          <p className="text-gray-600 mt-2">
            Share your concerns and get professional support
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* College Input - Only show if college not found in profile */}
          {collegeNotFound && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                College Information Required
              </label>
              <p className="text-amber-700 text-xs mb-3">
                Please provide your college name to continue with your request.
              </p>
              <input
                type="text"
                value={tempCollege}
                onChange={(e) => setTempCollege(e.target.value)}
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter your college name"
                required
              />
              <button
                type="button"
                onClick={saveCollegeToProfile}
                className="mt-2 w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition"
              >
                Save College Info
              </button>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to discuss?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              rows="4"
              placeholder="Please share your concerns or reasons for seeking support..."
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (collegeNotFound && !tempCollege)}
            className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition disabled:bg-indigo-300 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Request...
              </span>
            ) : (
              "Send Request"
            )}
          </button>
        </form>

        {/* Success/Error Message */}
        {success && (
          <div className={`mt-5 p-3 rounded-lg text-center ${success.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRequest;