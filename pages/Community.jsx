import { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Smile, Frown, Meh, Angry, 
  Plus, Search, User, Send, Trash2, Edit, X, Check, 
  Sun, Moon, ThumbsUp, Bookmark, Share2, MoreHorizontal
} from "lucide-react";
import { 
  getFirestore,
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove,
  where, getDocs, setDoc, getDoc, deleteDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../context/firebase/firebase';
import { loadSlim } from "tsparticles-slim";
// import Particles from "../components/Particles.jsx";

// Components
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';
import Sidebar from '../components/Sidebar';
import SearchPanel from '../components/SearchPanel';

const db = getFirestore(app);
const auth = getAuth();

const IncognitoGlasses = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm2 0c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8z"/>
    <path d="M8 10c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
    <path d="M6 8h2v2H6V8zm10 0h2v2h-2V8z"/>
    <rect x="6" y="7" width="12" height="1.5" rx="0.5"/>
  </svg>
);

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [reactions, setReactions] = useState({});
  const [showReactions, setShowReactions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchPanelOpen, setSearchPanelOpen] = useState(true);

  const reactionTypes = {
    like: { icon: <ThumbsUp className="h-4 w-4" />, color: "text-blue-500" },
    love: { icon: <Heart className="h-4 w-4" />, color: "text-red-500" },
    laugh: { icon: <Smile className="h-4 w-4" />, color: "text-yellow-500" },
    sad: { icon: <Frown className="h-4 w-4" />, color: "text-blue-400" },
    angry: { icon: <Angry className="h-4 w-4" />, color: "text-red-600" }
  };

  // Set system default mode on initial load
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const displayName = user.displayName || 
                         (user.providerData[0]?.displayName) || 
                         user.email?.split('@')[0] || 
                         "User";
        
        setCurrentUser({
          id: user.uid,
          username: displayName,
          initials: displayName
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        });

        // Load user's liked and bookmarked posts
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          setLikedPosts(docSnap.data().likedPosts || []);
          setBookmarkedPosts(docSnap.data().bookmarkedPosts || []);
        } else {
          await setDoc(userRef, { 
            likedPosts: [], 
            bookmarkedPosts: [],
            reactions: {} 
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  // Load reactions for posts
  useEffect(() => {
    if (posts.length === 0) return;
    
    const loadReactions = async () => {
      const reactionsData = {};
      await Promise.all(posts.map(async (post) => {
        const reactionsRef = collection(db, "posts", post.id, "reactions");
        const reactionsSnapshot = await getDocs(reactionsRef);
        reactionsData[post.id] = {};
        
        reactionsSnapshot.forEach((doc) => {
          reactionsData[post.id][doc.id] = doc.data().type;
        });
      }));
      
      setReactions(reactionsData);
    };
    
    loadReactions();
  }, [posts]);

  // Filter posts based on active tab and search
  useEffect(() => {
    let filtered = [...posts];
    
    if (activeTab === "my-posts") {
      filtered = filtered.filter(post => post.userId === currentUser?.id);
    } else if (activeTab === "liked") {
      filtered = filtered.filter(post => likedPosts.includes(post.id));
    } else if (activeTab === "bookmarked") {
      filtered = filtered.filter(post => bookmarkedPosts.includes(post.id));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    setFilteredPosts(filtered);
  }, [posts, activeTab, searchTerm, likedPosts, bookmarkedPosts, currentUser]);

  const formatTimestamp = (date) => {
    if (!date?.toDate) return "now";
    const now = new Date();
    const diff = now - date.toDate();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toDate().toLocaleDateString();
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !currentUser) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        username: postAnonymously ? "Anonymous" : currentUser.username,
        userInitials: postAnonymously ? "A" : currentUser.initials,
        anonymous: postAnonymously,
        mood: selectedMood,
        content: newPostContent,
        tags: newPostContent.match(/#\w+/g) || [],
        likes: 0,
        comments: 0,
        reactions: {},
        timestamp: serverTimestamp(),
        userId: currentUser.id
      });
      
      setNewPostContent("");
      setSelectedMood("neutral");
      setPostAnonymously(false);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error adding post: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* 
  const handlePostSubmit = async () => {
  if (!newPostContent.trim() || !currentUser) return;

  setIsLoading(true);
  try {
    // 🔹 Step 1: Call moderation API
    const response = await fetch("http://127.0.0.1:8000/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: newPostContent }),
    });

    if (!response.ok) {
      throw new Error("Failed to call moderation API");
    }

    const moderation = await response.json();

    // 🔹 Step 2: Check moderation result
    if (moderation.toxic) {
      alert("⚠️ Your post seems toxic and cannot be submitted.");
      return;
    }

    // 🔹 Step 3: Save to Firestore if safe
    await addDoc(collection(db, "posts"), {
      username: postAnonymously ? "Anonymous" : currentUser.username,
      userInitials: postAnonymously ? "A" : currentUser.initials,
      anonymous: postAnonymously,
      mood: selectedMood,
      content: newPostContent,
      tags: newPostContent.match(/#\w+/g) || [],
      likes: 0,
      comments: 0,
      reactions: {},
      timestamp: serverTimestamp(),
      userId: currentUser.id,
      moderationLabels: moderation.labels, // store moderation scores for audit (optional)
    });

    // 🔹 Step 4: Reset UI state
    setNewPostContent("");
    setSelectedMood("neutral");
    setPostAnonymously(false);
    setShowCreateModal(false);
  } catch (error) {
    console.error("Error adding post: ", error);
    alert("❌ Something went wrong while submitting your post.");
  } finally {
    setIsLoading(false);
  }
};
  */

  const handleLike = async (postId) => {
    if (!currentUser) return;
    
    try {
      const postRef = doc(db, "posts", postId);
      const userRef = doc(db, "users", currentUser.id);
      
      if (likedPosts.includes(postId)) {
        await updateDoc(postRef, {
          likes: (posts.find(p => p.id === postId)?.likes - 1 || 0)
        });
        await updateDoc(userRef, {
          likedPosts: arrayRemove(postId)
        });
        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await updateDoc(postRef, {
          likes: (posts.find(p => p.id === postId)?.likes + 1 || 1)
        });
        await updateDoc(userRef, {
          likedPosts: arrayUnion(postId)
        });
        setLikedPosts(prev => [...prev, postId]);
      }
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  const handleBookmark = async (postId) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.id);
      
      if (bookmarkedPosts.includes(postId)) {
        await updateDoc(userRef, {
          bookmarkedPosts: arrayRemove(postId)
        });
        setBookmarkedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await updateDoc(userRef, {
          bookmarkedPosts: arrayUnion(postId)
        });
        setBookmarkedPosts(prev => [...prev, postId]);
      }
    } catch (error) {
      console.error("Error updating bookmark: ", error);
    }
  };

  const toggleComments = async (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    if (!comments[postId]) {
      const q = query(
        collection(db, "posts", postId, "comments"),
        orderBy("timestamp", "asc")
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsData = [];
        querySnapshot.forEach((doc) => {
          commentsData.push({ id: doc.id, ...doc.data() });
        });
        setComments(prev => ({
          ...prev,
          [postId]: commentsData
        }));
      });
      
      return () => unsubscribe();
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!newComment[postId]?.trim() || !currentUser) return;
    
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.id,
        username: currentUser.username,
        content: newComment[postId],
        timestamp: serverTimestamp()
      });
      
      await updateDoc(doc(db, "posts", postId), {
        comments: (posts.find(p => p.id === postId)?.comments || 0) + 1
      });
      
      setNewComment(prev => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    if (!currentUser) return;
    
    try {
      const reactionRef = doc(db, "posts", postId, "reactions", currentUser.id);
      const currentReaction = reactions[postId]?.[currentUser.id];
      
      if (currentReaction === reactionType) {
        // Remove reaction if same type clicked again
        await deleteDoc(reactionRef);
      } else {
        // Add or update reaction
        await setDoc(reactionRef, {
          type: reactionType,
          userId: currentUser.id,
          timestamp: serverTimestamp()
        });
      }
      
      // Close reactions popup
      setShowReactions(prev => ({ ...prev, [postId]: false }));
    } catch (error) {
      console.error("Error updating reaction: ", error);
    }
  };

  const startEditingPost = (post) => {
    setEditingPostId(post.id);
    setEditedPostContent(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditedPostContent("");
  };

  const saveEditedPost = async () => {
    if (!editedPostContent.trim() || !editingPostId) return;
    
    try {
      const postRef = doc(db, "posts", editingPostId);
      await updateDoc(postRef, {
        content: editedPostContent,
        tags: editedPostContent.match(/#\w+/g) || []
      });
      setEditingPostId(null);
      setEditedPostContent("");
    } catch (error) {
      console.error("Error updating post: ", error);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        
        // Delete all comments for this post
        const commentsRef = collection(db, "posts", postId, "comments");
        const commentsSnapshot = await getDocs(commentsRef);
        commentsSnapshot.forEach(async (commentDoc) => {
          await deleteDoc(commentDoc.ref);
        });
        
        // Delete all reactions for this post
        const reactionsRef = collection(db, "posts", postId, "reactions");
        const reactionsSnapshot = await getDocs(reactionsRef);
        reactionsSnapshot.forEach(async (reactionDoc) => {
          await deleteDoc(reactionDoc.ref);
        });
        
        // Update user's liked and bookmarked posts if needed
        const userRef = doc(db, "users", currentUser.id);
        const updates = {};
        
        if (likedPosts.includes(postId)) {
          updates.likedPosts = arrayRemove(postId);
          setLikedPosts(prev => prev.filter(id => id !== postId));
        }
        
        if (bookmarkedPosts.includes(postId)) {
          updates.bookmarkedPosts = arrayRemove(postId);
          setBookmarkedPosts(prev => prev.filter(id => id !== postId));
        }
        
        if (Object.keys(updates).length > 0) {
          await updateDoc(userRef, updates);
        }
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: <Smile className="h-4 w-4 text-emerald-500" />,
      neutral: <Meh className="h-4 w-4 text-amber-500" />,
      sad: <Frown className="h-4 w-4 text-blue-500" />,
      angry: <Angry className="h-4 w-4 text-red-500" />
    };
    return icons[mood] || icons.neutral;
  };

  const countReactions = (postId) => {
    if (!reactions[postId]) return 0;
    return Object.keys(reactions[postId]).length;
  };

  const getUserReaction = (postId) => {
    if (!currentUser || !reactions[postId]) return null;
    return reactions[postId][currentUser.id];
  };

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesLoaded = async (container) => {
    console.log("Particles container loaded", container);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSearchPanel = () => {
    setSearchPanelOpen(!searchPanelOpen);
  };

  return (
    <div className={`min-h-screen pt-30 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
  <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
    {/* Sidebar and content here */}
        {/* Sidebar - Bookmarks and Navigation */}
        <Sidebar 
          open={sidebarOpen}
          onToggle={toggleSidebar}
          bookmarkedPosts={bookmarkedPosts}
          posts={posts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          darkMode={darkMode}
        />

        {/* Main Content Area */}
         <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold">Community</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Post</span>
                </button>
                <button 
                  onClick={toggleSearchPanel}
                  className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content with Posts */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === "all" 
                      ? "No posts yet. Be the first to share something!"
                      : activeTab === "my-posts" 
                        ? "You haven't created any posts yet."
                        : activeTab === "liked"
                          ? "You haven't liked any posts yet."
                          : "You haven't bookmarked any posts yet."}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    likedPosts={likedPosts}
                    bookmarkedPosts={bookmarkedPosts}
                    showComments={showComments}
                    newComment={newComment}
                    comments={comments}
                    editingPostId={editingPostId}
                    editedPostContent={editedPostContent}
                    reactions={reactions}
                    showReactions={showReactions}
                    reactionTypes={reactionTypes}
                    formatTimestamp={formatTimestamp}
                    getMoodIcon={getMoodIcon}
                    countReactions={countReactions}
                    getUserReaction={getUserReaction}
                    handleLike={handleLike}
                    handleBookmark={handleBookmark}
                    toggleComments={toggleComments}
                    handleCommentSubmit={handleCommentSubmit}
                    setNewComment={setNewComment}
                    startEditingPost={startEditingPost}
                    cancelEditing={cancelEditing}
                    saveEditedPost={saveEditedPost}
                    deletePost={deletePost}
                    handleReaction={handleReaction}
                    setShowReactions={setShowReactions}
                  />
                ))
              )}
            </div>
          </main>
        </div>

        {/* Search Panel */}
        <SearchPanel 
          open={searchPanelOpen}
          onToggle={toggleSearchPanel}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          darkMode={darkMode}
        />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        selectedMood={selectedMood}
        setSelectedMood={setSelectedMood}
        postAnonymously={postAnonymously}
        setPostAnonymously={setPostAnonymously}
        isLoading={isLoading}
        handlePostSubmit={handlePostSubmit}
        darkMode={darkMode}
      />
    </div>
  );
}