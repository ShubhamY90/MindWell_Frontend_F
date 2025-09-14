import React, { useEffect, useState } from "react";
import { ShieldAlert, Clock, User, Trash2, AlertTriangle, Ban, Eye, Zap, CheckCircle } from "lucide-react";
import { db, auth } from "../context/firebase/firebase"; 
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  updateDoc,
  increment,
  writeBatch
} from "firebase/firestore";
import { onAuthStateChanged, deleteUser } from "firebase/auth";

const AdminReportsSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userWarningCount, setUserWarningCount] = useState(0);


  const fetchUserWarnings = async (userId) => {
    if (!userId) return;
    
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const warnings = userSnap.data().warnings || 0;
        setUserWarningCount(warnings);
      }
    } catch (err) {
      console.error("Error fetching user warnings:", err);
    }
  };

  useEffect(() => {
    if (activePost && activePost.userId) {
      fetchUserWarnings(activePost.userId);
    } else {
      setUserWarningCount(0);
    }
  }, [activePost]);


  // Authentication and role verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCurrentUser({ uid: firebaseUser.uid, ...userData });
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error("Authentication error:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Optimized batch fetching of flagged posts
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;

    const loadFlaggedContent = async () => {
      try {
        const q = query(collection(db, "posts"), where("reportCount", ">=", 3));
        const snapshot = await getDocs(q);
        
        // Get all unique author IDs
        const userIds = [...new Set(snapshot.docs.map(doc => doc.data().authorId).filter(Boolean))];
        
        // Fetch user data and warning counts
        const userDataPromises = userIds.map(async (userId) => {
          try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              return {
                userId,
                name: userData.name || "Unknown User",
                warnings: userData.warnings || 0
              };
            } else {
              return {
                userId,
                name: "Unknown User",
                warnings: 0
              };
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
            return {
              userId,
              name: "Unknown User",
              warnings: 0
            };
          }
        });

        const userDataResults = await Promise.all(userDataPromises);
        
        // Create a map for easy access
        const userMap = {};
        userDataResults.forEach(user => {
          userMap[user.userId] = user;
        });

        // Prepare posts with user data
        const postData = snapshot.docs.map((docSnap) => {
          const post = { id: docSnap.id, ...docSnap.data() };
          const authorData = userMap[post.authorId] || { name: "Unknown User", warnings: 0 };
          
          return { 
            ...post, 
            authorName: authorData.name,
            warningCount: authorData.warnings
          };
        });

        setFlaggedPosts(postData);
      } catch (err) {
        console.error("Error loading flagged content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFlaggedContent();
  }, [currentUser]);

  // Fetch incident reports for specific post
  const loadIncidentReports = async (postId) => {
    try {
      const reportsRef = collection(db, "posts", postId, "reports");
      const reportsSnap = await getDocs(reportsRef);
      const incidentData = [];

      for (const reportDoc of reportsSnap.docs) {
        const reportData = reportDoc.data();
        const reporterId = reportData.reportedBy || reportDoc.id;
        
        try {
          const reporterRef = doc(db, "users", reporterId);
          const reporterSnap = await getDoc(reporterRef);
          const reporterData = reporterSnap.exists() ? reporterSnap.data() : { name: "Anonymous" };

          incidentData.push({
            id: reportDoc.id,
            ...reportData,
            reporterName: reporterData.name || "Anonymous",
          });
        } catch (err) {
          console.error("Error fetching reporter data:", err);
          incidentData.push({
            id: reportDoc.id,
            ...reportData,
            reporterName: "Anonymous",
          });
        }
      }

      setIncidents(incidentData);
    } catch (err) {
      console.error("Error loading incident reports:", err);
    }
  };

  // Delete post action
  const executePostDeletion = async (postId) => {
    if (!confirm("Confirm post termination?")) return;
    
    setProcessing(true);
    try {
      // Delete post and all subcollections
      const batch = writeBatch(db);
      
      // Delete main post
      const postRef = doc(db, "posts", postId);
      batch.delete(postRef);
      
      // Delete reports subcollection
      const reportsRef = collection(db, "posts", postId, "reports");
      const reportsSnap = await getDocs(reportsRef);
      reportsSnap.docs.forEach(reportDoc => {
        batch.delete(reportDoc.ref);
      });
      
      await batch.commit();
      
      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      setActivePost(null);
      
    } catch (err) {
      console.error("Post deletion failed:", err);
      alert("Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  // Issue warning to user
  const issueWarning = async (postId) => {
    // First, get the post data to extract userId and username
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      alert("Post not found");
      return;
    }
    
    const postData = postSnap.data();
    const userId = postData.userId;
    const userName = postData.username || "Unknown User";
    
    if (!userId) {
      alert("Cannot issue warning: User ID is missing from post data");
      return;
    }
    
    if (!confirm(`Issue warning to ${userName} and delete this post?`)) return;
    
    setProcessing(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentWarnings = userSnap.data().warnings || 0;
        const newWarnings = currentWarnings + 1;
        
        // Update user warnings
        await updateDoc(userRef, {
          warnings: newWarnings
        });
        
        // Call executePostDeletion instead of direct deletion (UPDATED)
        await executePostDeletion(postId);
        
        // Update local state - remove the deleted post from flaggedPosts
        setFlaggedPosts(prev => prev.filter(post => post.postId !== postId));
        
        // Clear active post if it's the same post
        if (activePost && activePost.postId === postId) {
          setActivePost(null);
        }
        
        // Update the user warning count state
        setUserWarningCount(newWarnings);
        
        if (newWarnings >= 3) {
          await executeUserTermination(userId, userName);
          alert(`Warning issued to ${userName}. User terminated due to reaching 3 warnings. Post deleted.`);
        } else {
          alert(`Warning issued to ${userName}. Total warnings: ${newWarnings}. Post deleted.`);
        }
      } else {
        alert("User not found");
      }
    } catch (err) {
      console.error("Warning system error:", err);
      alert("Warning failed");
    } finally {
      setProcessing(false);
    }
  };

  // Mark as reviewed - clear reports and reset reportCount
  const markAsReviewed = async (postId) => {
    if (!confirm("Mark this post as reviewed? This will clear all reports.")) return;
    
    setProcessing(true);
    try {
      const batch = writeBatch(db);
      
      // Reset report count
      const postRef = doc(db, "posts", postId);
      batch.update(postRef, { reportCount: 0 });
      
      // Delete all reports in the subcollection
      const reportsRef = collection(db, "posts", postId, "reports");
      const reportsSnap = await getDocs(reportsRef);
      reportsSnap.docs.forEach(reportDoc => {
        batch.delete(reportDoc.ref);
      });
      
      await batch.commit();
      
      // Update local state
      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      setActivePost(null);
      
      alert("Post marked as reviewed. All reports cleared.");
    } catch (err) {
      console.error("Review action failed:", err);
      alert("Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  // Terminate user account
  const executeUserTermination = async (userId, userName) => {
    try {
      // Delete user data from Firestore
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      
      // Note: Firebase Auth user deletion requires admin SDK server-side
      // This would typically be handled by a cloud function
      
      alert(`User ${userName} terminated (3+ warnings)`);
    } catch (err) {
      console.error("User termination error:", err);
      alert("Termination failed");
    }
  };

  // Access control
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl font-mono text-cyan-400">AUTHENTICATING...</span>
        </div>
      </div>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-2xl font-mono text-red-500">ACCESS DENIED</div>
          <div className="text-gray-500 mt-2">INSUFFICIENT PRIVILEGES</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Futuristic background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-blue-900 opacity-50"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <ShieldAlert className="h-8 w-8 text-cyan-400" />
            <h1 className="text-4xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              THREAT DETECTION SYSTEM
            </h1>
          </div>
          <div className="text-gray-400 font-mono">MONITORING HIGH-RISK CONTENT</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-4">
              <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
              <span className="font-mono text-cyan-400">SCANNING DATABASE...</span>
            </div>
          </div>
        ) : flaggedPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-green-400 font-mono text-xl">SYSTEM CLEAN</div>
            <div className="text-gray-500 mt-2">No high-risk content detected</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {flaggedPosts.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer bg-gray-900/50 border border-gray-700/50 rounded-lg backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 p-5"
                onClick={() => {
                  setActivePost(post);
                  loadIncidentReports(post.id);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="font-mono text-sm text-red-400">FLAGGED</span>
                  </div>
                  <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-mono">
                    {post.reportCount} REPORTS
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed">
                    {post.content || "No content available"}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>Author: {post.username || "Unknown"}</span>
                  </div>
                  
                  {/* <div className="flex items-center gap-2 text-xs text-yellow-500">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Warnings: {userWarningCount}</span>
                  </div> */}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <Eye className="h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-mono text-gray-500">CLICK TO INVESTIGATE</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Investigation Modal */}
        {activePost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 border border-gray-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden backdrop-blur-sm">
              {/* Modal Header */}
              <div className="border-b border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                    <h2 className="text-2xl font-mono text-red-400">INCIDENT ANALYSIS</h2>
                  </div>
                  <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded font-mono text-sm">
                    {activePost.reportCount} REPORTS
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Post Content */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h3 className="font-mono text-cyan-400 mb-2">FLAGGED CONTENT:</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {activePost.content || "No content available"}
                  </p>
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Author: {activePost.username}</span>
                  </div>
                  <div className="mt-1 text-xs text-yellow-500 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Warnings: {userWarningCount}</span>
                  </div>
                  <div className="mt-1 text-xs text-blue-500 flex items-center gap-2">
                    <span>User ID: {activePost.userId}</span>
                  </div>
                </div>

                {/* Reports */}
                <div className="space-y-4">
                  <h3 className="font-mono text-cyan-400">INCIDENT REPORTS:</h3>
                  {incidents.length === 0 ? (
                    <div className="text-gray-500 font-mono text-sm">No reports loaded</div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.map((report) => (
                        <div
                          key={report.id}
                          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-mono text-red-400">VIOLATION:</span>
                              <p className="text-gray-300 mt-1">{report.reason}</p>
                            </div>
                            {report.additionalInfo && (
                              <div>
                                <span className="font-mono text-blue-400">DETAILS:</span>
                                <p className="text-gray-300 mt-1">{report.additionalInfo}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span className="font-mono text-xs">
                                {report.time ? new Date(report.time).toLocaleString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                              <User className="h-3 w-3" />
                              <span className="font-mono text-xs">
                                Reported by: {report.reporterName}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-700 p-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
                    onClick={() => executePostDeletion(activePost.id)}
                    disabled={processing}
                  >
                    <Trash2 className="h-4 w-4" />
                    TERMINATE POST
                  </button>
                  
                  <button
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
                    onClick={() => issueWarning(activePost.id)}
                    disabled={processing}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    ISSUE WARNING
                  </button>
                  
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
                    onClick={() => markAsReviewed(activePost.id)}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4" />
                    MARK REVIEWED
                  </button>
                  
                  <button
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-mono text-sm transition-colors ml-auto"
                    onClick={() => setActivePost(null)}
                  >
                    CLOSE
                  </button>
                </div>
                
                {processing && (
                  <div className="mt-3 flex items-center gap-2 text-cyan-400">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-mono text-sm">PROCESSING...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsSystem;