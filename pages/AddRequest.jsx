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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 px-4">
        <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-md text-center border border-white/20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 h-14 w-14 mb-6"></div>
              <div className="h-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full w-3/4 mb-3"></div>
              <div className="h-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full w-1/2 mb-3"></div>
              <div className="h-3 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full w-2/3"></div>
            </div>
            <p className="mt-6 text-indigo-600 font-medium">Loading your information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 px-4 pb-8">
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-10 w-full max-w-lg border border-white/20">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Connect with a Psychiatrist
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Share your concerns and get professional support
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* College Input - Only show if college not found in profile */}
            {collegeNotFound && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                <label className="block text-sm font-semibold text-amber-800 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                  College Information Required
                </label>
                <p className="text-amber-700 text-sm mb-4 leading-relaxed">
                  Please provide your college name to continue with your request.
                </p>
                <input
                  type="text"
                  value={tempCollege}
                  onChange={(e) => setTempCollege(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  placeholder="Enter your college name"
                  required
                />
                <button
                  type="button"
                  onClick={saveCollegeToProfile}
                  className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Save College Information
                </button>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What would you like to discuss?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm resize-none shadow-sm"
                rows="5"
                placeholder="Please share your concerns or reasons for seeking support. Your message will be kept confidential..."
                required
              ></textarea>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (collegeNotFound && !tempCollege)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className={`mt-6 p-4 rounded-2xl text-center font-medium shadow-sm ${
              success.includes("successfully") 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100" 
                : "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-100"
            }`}>
              <div className="flex items-center justify-center">
                {success.includes("successfully") ? (
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {success}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRequest;