import { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, Smile, Frown, Meh, Angry,
  Plus, Search, User, Send, Trash2, Edit, X, Check,
  Sun, Moon, ThumbsUp, Bookmark, Share2, MoreHorizontal, Sparkles
} from "lucide-react";
import {
  getFirestore,
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove,
  where, getDocs, setDoc, getDoc, deleteDoc, limit, startAfter, increment
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app, { storage } from '../context/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm2 0c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8z" />
    <path d="M8 10c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
    <path d="M6 8h2v2H6V8zm10 0h2v2h-2V8z" />
    <rect x="6" y="7" width="12" height="1.5" rx="0.5" />
  </svg>
);

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showComments, setShowComments] = useState({});

  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState("");
  // Theme is locked to light mode as per requirements
  const darkMode = false;
  const [reactions, setReactions] = useState({});
  const [showReactions, setShowReactions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchPanelOpen, setSearchPanelOpen] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 5;

  const reactionTypes = {
    like: { icon: <ThumbsUp className="h-4 w-4" />, color: "text-blue-500" },
    love: { icon: <Heart className="h-4 w-4" />, color: "text-red-500" },
    laugh: { icon: <Smile className="h-4 w-4" />, color: "text-yellow-500" },
    sad: { icon: <Frown className="h-4 w-4" />, color: "text-blue-400" },
    angry: { icon: <Angry className="h-4 w-4" />, color: "text-red-600" }
  };


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

  // Update online status
  useEffect(() => {
    if (!currentUser) return;

    const updateStatus = async () => {
      try {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
          lastActive: serverTimestamp(),
          status: 'online'
        });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [currentUser]);

  // Load posts from Firestore with lazy loading
  useEffect(() => {
    if (currentUser) {
      fetchInitialPosts();
    }
  }, [activeTab, currentUser]);

  const fetchInitialPosts = async () => {
    setIsLoading(true);
    let q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(POSTS_PER_PAGE));

    if (activeTab === "my-posts" && currentUser) {
      q = query(collection(db, "posts"), where("userId", "==", currentUser.id), orderBy("timestamp", "desc"), limit(POSTS_PER_PAGE));
    } else if (activeTab === "liked" && currentUser) {
      // Logic for liked posts filter
    }

    try {
      const querySnapshot = await getDocs(q);
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setHasMore(querySnapshot.docs.length === POSTS_PER_PAGE);

      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!lastVisible || !hasMore) return;

    setIsLoading(true);
    let q = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(POSTS_PER_PAGE)
    );

    if (activeTab === "my-posts" && currentUser) {
      q = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.id),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(POSTS_PER_PAGE)
      );
    }

    try {
      const querySnapshot = await getDocs(q);
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setHasMore(querySnapshot.docs.length === POSTS_PER_PAGE);

      const newPosts = [];
      querySnapshot.forEach((doc) => {
        newPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(prev => [...prev, ...newPosts]);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Auto update when scrolled to top
    if (scrollTop === 0 && !isLoading) {
      fetchInitialPosts();
    }
    
    // Infinite scroll when near bottom (100px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 100 && !isLoading && hasMore) {
      loadMorePosts();
    }
  };

  // Rest of the functions...


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

  const handlePostSubmit = async (content, images, mood, anonymous) => {
    if (!content.trim() || !currentUser) return;

    setIsLoading(true);
    try {
      const imageUrls = [];
      if (images && images.length > 0) {
        for (const image of images) {
          const storageRef = ref(storage, `posts/${currentUser.id}/${Date.now()}-${image.name}`);
          await uploadBytes(storageRef, image);
          const url = await getDownloadURL(storageRef);
          imageUrls.push(url);
        }
      }

      await addDoc(collection(db, "posts"), {
        username: anonymous ? "Anonymous" : currentUser.username,
        userInitials: anonymous ? "A" : currentUser.initials,
        anonymous: anonymous,
        mood: mood,
        content: content,
        tags: content.match(/#\w+/g) || [],
        imageUrls: imageUrls,
        likes: 0,
        comments: 0,
        reactions: {},
        timestamp: serverTimestamp(),
        userId: currentUser.id
      });

      setShowCreateModal(false);
      fetchInitialPosts(); // Refresh posts
    } catch (error) {
      console.error("Error adding post: ", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLike = async (postId) => {
    if (!currentUser) return;

    try {
      const postRef = doc(db, "posts", postId);
      const userRef = doc(db, "users", currentUser.id);
      const isCurrentlyLiked = likedPosts.includes(postId);

      // Optimistic Local State Update
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: isCurrentlyLiked ? (p.likes - 1 || 0) : (p.likes + 1 || 1) };
        }
        return p;
      }));

      if (isCurrentlyLiked) {
        await updateDoc(postRef, {
          likes: increment(-1)
        });
        await updateDoc(userRef, {
          likedPosts: arrayRemove(postId)
        });
        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await updateDoc(postRef, {
          likes: increment(1)
        });
        await updateDoc(userRef, {
          likedPosts: arrayUnion(postId)
        });
        setLikedPosts(prev => [...prev, postId]);
      }
    } catch (error) {
      console.error("Error updating like: ", error);
      // Revert local state on error
      fetchInitialPosts();
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

  const handleCommentSubmit = async (postId, content, replyTo = null) => {
    if (!content.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.id,
        username: currentUser.username,
        userInitials: currentUser.initials,
        content: content,
        replyToId: replyTo ? replyTo.id : null,
        replyToUsername: replyTo ? replyTo.username : null,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, "posts", postId), {
        comments: increment(1)
      });
      
      // Optimistic Local State Update
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: (p.comments || 0) + 1 };
        }
        return p;
      }));

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

  const handleEditChange = (content) => {
    setEditedPostContent(content);
  };


  const cancelEditing = () => {
    setEditingPostId(null);
    setEditedPostContent("");
  };

  const saveEditedPost = async () => {
    if (!editedPostContent.trim() || !editingPostId) return;

    try {
      const postRef = doc(db, "posts", editingPostId);
      const tags = editedPostContent.match(/#\w+/g) || [];

      await updateDoc(postRef, {
        content: editedPostContent,
        tags: tags
      });

      // Update local state
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === editingPostId) {
          return { ...p, content: editedPostContent, tags: tags };
        }
        return p;
      }));

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
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4 text-emerald-500" />;
      case 'neutral': return <Meh className="h-4 w-4 text-amber-500" />;
      case 'sad': return <Frown className="h-4 w-4 text-blue-500" />;
      case 'angry': return <Angry className="h-4 w-4 text-red-500" />;
      default: return <Sparkles className="h-4 w-4 text-[#7C9885]" />;
    }
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



  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSearchPanel = () => {
    setSearchPanelOpen(!searchPanelOpen);
  };

  return (
    <div className={`h-[100dvh] relative overflow-hidden ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-[#f4f7f6] text-gray-900'}`}>
      {/* Dynamic Background Elements for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C9885]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
      
      <div className="flex h-full pt-24 overflow-hidden relative z-10">
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
          handleLogout={() => signOut(auth)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}

          {/* Main Content with Posts */}
          <main 
            className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300"
            onScroll={handleScroll}
          >
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#2D3142] mb-2">Hive Network</h2>
                  <p className="text-[#4A4E69] font-light">Join 10k+ people finding strength together.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white/30 backdrop-blur-xl p-1.5 rounded-2xl border border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  {['all', 'my-posts', 'liked', 'bookmarked'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === tab
                        ? 'bg-white text-[#2D3142] shadow-sm'
                        : 'text-[#4A4E69] hover:bg-white/40'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share your story card */}
              {currentUser && activeTab === 'all' && (
                <div
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex items-center space-x-6 cursor-pointer hover:bg-white/50 hover:shadow-lg transition-all group active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C9885]/80 to-[#4A4E69]/80 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-[#4A4E69] opacity-80">What's your story today, {currentUser.username.split(' ')[0]}?</p>
                  </div>
                  <div className="px-5 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-xs font-bold text-[#7C9885] group-hover:bg-[#7C9885] group-hover:text-white transition-colors border border-white/40">
                    Post Story
                  </div>
                </div>
              )}

              {isLoading && filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#7C9885]/30 border-t-[#7C9885] rounded-full animate-spin mb-4"></div>
                  <p className="text-[#4A4E69] font-medium animate-pulse">Loading community posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm">
                  <div className="bg-white/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/60">
                    <MessageCircle className="h-8 w-8 text-[#4A4E69]/40" />
                  </div>
                  <p className="text-[#4A4E69] font-medium">
                    {activeTab === "all"
                      ? "No posts yet. Be the first to share something!"
                      : "No posts found for this category."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6">
                    {filteredPosts.map((post) => (
                      <Post
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        likedPosts={likedPosts}
                        bookmarkedPosts={bookmarkedPosts}
                        showComments={showComments}
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
                        startEditingPost={startEditingPost}
                        cancelEditing={cancelEditing}
                        saveEditedPost={saveEditedPost}
                        deletePost={deletePost}
                        handleReaction={handleReaction}
                        setShowReactions={setShowReactions}
                        handleEditChange={handleEditChange}
                      />
                    ))}
                  </div>

                  {isLoading && hasMore && (
                    <div className="text-center pt-6 pb-2">
                      <p className="text-[#7C9885] text-sm font-bold animate-pulse">Loading more souls...</p>
                    </div>
                  )}
                </>
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
        />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        isLoading={isLoading}
        handlePostSubmit={handlePostSubmit}
      />

    </div>
  );
}