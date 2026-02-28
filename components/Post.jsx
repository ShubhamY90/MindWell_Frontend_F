import React, { useState, useEffect } from 'react';
import {
  Heart, MessageCircle, Smile, Frown, Meh, Angry,
  Edit, X, Check, Bookmark, Share2, Trash2, Send, AlertTriangle, Reply
} from "lucide-react";
import { doc, collection, setDoc, getDoc, updateDoc, increment, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../context/firebase/firebase";
import { getAuth } from "firebase/auth";
import ReportPostModal from "./ui/reportPostModal.jsx";

const IncognitoGlasses = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm2 0c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8z" />
    <path d="M8 10c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
    <path d="M6 8h2v2H6V8zm10 0h2v2h-2V8z" />
    <rect x="6" y="7" width="12" height="1.5" rx="0.5" />
  </svg>
);

const Post = ({
  post,
  currentUser,
  likedPosts,
  bookmarkedPosts,
  showComments,
  comments,
  editingPostId,
  editedPostContent,
  reactions,
  showReactions,
  reactionTypes,
  formatTimestamp,
  getMoodIcon,
  countReactions,
  getUserReaction,
  handleLike,
  handleBookmark,
  toggleComments,
  handleCommentSubmit,
  startEditingPost,
  cancelEditing,
  saveEditedPost,
  deletePost,
  handleReaction,
  setShowReactions,
  handleEditChange,
  role
}) => {
  const isLiked = likedPosts.includes(post.id);
  const isBookmarked = bookmarkedPosts.includes(post.id);
  const isEditing = editingPostId === post.id;
  const userReaction = getUserReaction(post.id);

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replies, setReplies] = useState({});

  useEffect(() => {
    if (showComments[post.id] && comments[post.id]) {
      // Load replies for each comment if needed, but for simplicity we'll just handle one level of nesting
    }
  }, [showComments, comments, post.id]);

  const onCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    handleCommentSubmit(post.id, commentText, replyingTo);
    setCommentText("");
    setReplyingTo(null);
  };

  const reportPost = (post) => {
    setSelectedPost(post);
    setShowReportModal(true);
  };

  const handleReportSubmit = async ({ postId, reason, additionalInfo }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return alert("Please login to report.");

    try {
      const reportDocRef = doc(db, "posts", postId, "reports", user.uid);
      await setDoc(reportDocRef, { reason, additionalInfo, reportedAt: new Date() });
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { reportCount: increment(1) });
      alert("Post reported successfully!");
      setShowReportModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const renderImageGrid = () => {
    if (!post.imageUrls || post.imageUrls.length === 0) return null;
    const count = post.imageUrls.length;

    return (
      <div className={`mt-4 grid gap-2 rounded-2xl overflow-hidden ${count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
        }`}>
        {post.imageUrls.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt="Upload"
            className={`w-full object-cover h-48 md:h-64 cursor-pointer hover:opacity-90 transition ${count === 3 && idx === 0 ? 'col-span-2 md:col-span-1' : ''
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-6 md:p-8 transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C9885] to-[#4A4E69] flex items-center justify-center text-white shadow-lg">
            {post.anonymous ? <IncognitoGlasses className="h-6 w-6" /> : <span className="font-bold">{post.userInitials}</span>}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-[#2D3142] text-lg">{post.username}</h3>
              {getMoodIcon(post.mood)}
            </div>
            <p className="text-xs text-[#4A4E69]/60 font-medium tracking-wide flex items-center">
              {formatTimestamp(post.timestamp)}
              <span className="mx-2">•</span>
              {post.anonymous ? "Anonymous Soul" : "Community Member"}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          {currentUser && (
            <div className="flex items-center space-x-1">
              {(role === "admin" || currentUser.id === post.userId) && (
                <>
                  <button onClick={() => startEditingPost(post)} className="p-2 text-[#4A4E69]/40 hover:text-[#7C9885] transition-colors"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => deletePost(post.id)} className="p-2 text-[#4A4E69]/40 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </>
              )}
              {currentUser.id !== post.userId && (
                <button onClick={() => reportPost(post)} className="p-2 text-[#4A4E69]/40 hover:text-amber-400 transition-colors"><AlertTriangle className="h-4 w-4" /></button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedPostContent}
              onChange={(e) => cancelEditing(e.target.value)} // Wait, local edit? 
              className="w-full p-4 bg-[#F9FBFF] border border-gray-100 rounded-3xl resize-none focus:ring-2 focus:ring-[#7C9885] focus:outline-none text-[#2D3142] h-32"
              placeholder="Edit your soul's message..."
            />
            <div className="flex justify-end space-x-3">
              <button onClick={cancelEditing} className="px-6 py-2 text-[#4A4E69]/60 font-bold text-sm">Cancel</button>
              <button onClick={saveEditedPost} className="bg-[#7C9885] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md">Save Changes</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[#2D3142] text-lg leading-relaxed font-light whitespace-pre-wrap">
              {post.content}
            </p>
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-[#7C9885] font-bold text-xs bg-[#7C9885]/10 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
            {renderImageGrid()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Reaction Group */}
          <div className="flex items-center bg-[#F9FBFF] rounded-2xl p-1 border border-gray-50">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${isLiked ? 'bg-[#7C9885] text-white shadow-md' : 'text-[#4A4E69]/60 hover:bg-white'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-bold">{post.likes || 0}</span>
            </button>

            <div className="relative group/react">
              <button className="p-2 text-[#4A4E69]/40 hover:text-amber-400">
                <Smile className="h-4 w-4" />
              </button>
              <div className="absolute bottom-full left-0 mb-4 opacity-0 group-hover/react:opacity-100 transition-opacity bg-white p-2 rounded-2xl shadow-xl border border-gray-50 flex space-x-1 pointer-events-none group-hover/react:pointer-events-auto">
                {Object.entries(reactionTypes).map(([type, { icon, color }]) => (
                  <button key={type} onClick={() => handleReaction(post.id, type)} className={`p-2 rounded-xl hover:bg-gray-50 transition ${userReaction === type ? 'bg-gray-100' : ''}`}>
                    <span className={color}>{icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => toggleComments(post.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition ${showComments[post.id] ? 'bg-[#4A4E69] text-white' : 'text-[#4A4E69]/60 hover:bg-[#F9FBFF]'}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-bold">{post.comments || 0}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => handleBookmark(post.id)} className={`p-2 transition ${isBookmarked ? 'text-[#7C9885]' : 'text-[#4A4E69]/40'}`}>
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 text-[#4A4E69]/40 hover:text-[#2D3142]"><Share2 className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Nested Comments */}
      {showComments[post.id] && (
        <div className="mt-8 space-y-6">
          <form onSubmit={onCommentSubmit} className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#4A4E69] font-bold text-sm">
              {currentUser?.initials || "U"}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? `Replying to ${replyingTo.username}...` : "Write a mindful comment..."}
                className="w-full bg-[#F9FBFF] border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#7C9885] outline-none"
              />
              {replyingTo && (
                <button onClick={() => setReplyingTo(null)} className="absolute right-12 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C9885] hover:scale-110 transition-transform">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="space-y-4 pl-2 border-l-2 border-gray-50">
            {comments[post.id]?.filter(c => !c.replyToId).map((comment) => (
              <div key={comment.id} className="group">
                <div className="flex items-start space-x-4 transition-all pb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                    {comment.username?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#F9FBFF] rounded-[1.25rem] p-4 group-hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#2D3142] text-sm">{comment.username}</span>
                        <span className="text-[10px] text-[#4A4E69]/40">{formatTimestamp(comment.timestamp)}</span>
                      </div>
                      <p className="text-[#4A4E69] text-sm leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 ml-2">
                      <button onClick={() => { setReplyingTo(comment); window.scrollTo({ behavior: 'smooth' }); }} className="text-[10px] font-bold text-[#7C9885] hover:underline flex items-center">
                        <Reply className="h-3 w-3 mr-1" /> Reply
                      </button>
                    </div>

                    {/* Rendering replies (one level nested) */}
                    <div className="mt-3 ml-6 space-y-3">
                      {comments[post.id]?.filter(r => r.replyToId === comment.id).map(reply => (
                        <div key={reply.id} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 font-bold text-[8px]">
                            {reply.username?.charAt(0)}
                          </div>
                          <div className="flex-1 bg-white border border-gray-50 rounded-xl p-3 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-[#2D3142] text-[11px]">{reply.username}</span>
                              <span className="text-[9px] text-[#4A4E69]/40">{formatTimestamp(reply.timestamp)}</span>
                            </div>
                            <p className="text-[#4A4E69] text-xs">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReportModal && (
        <ReportPostModal
          post={post}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default Post;
