import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Smile, Frown, Meh, Angry, 
  Edit, X, Check, ThumbsUp, Bookmark, Share2, MoreHorizontal, Trash2, Send,
  Menu, Search, Plus, Sun, Moon, Reply, User, Home
} from "lucide-react";

// Incognito Glasses Icon
const IncognitoGlasses = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm2 0c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8z"/>
    <path d="M8 10c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
    <path d="M6 8h2v2H6V8zm10 0h2v2h-2V8z"/>
    <rect x="6" y="7" width="12" height="1.5" rx="0.5"/>
  </svg>
);

const Post = ({
  post,
  currentUser,
  likedPosts,
  bookmarkedPosts,
  showComments,
  newComment,
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
  setNewComment,
  startEditingPost,
  cancelEditing,
  saveEditedPost,
  deletePost,
  handleReaction,
  setShowReactions
}) => {
  const isLiked = likedPosts.includes(post.id);
  const isBookmarked = bookmarkedPosts.includes(post.id);
  const isEditing = editingPostId === post.id;
  const userReaction = getUserReaction(post.id);

  const handleCommentChange = (e) => {
    setNewComment(prev => ({
      ...prev,
      [post.id]: e.target.value
    }));
  };

  const handleCommentKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(post.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {post.anonymous ? (
              <IncognitoGlasses className="h-5 w-5" />
            ) : (
              post.userInitials
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {post.username}
              </h3>
              {getMoodIcon(post.mood)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatTimestamp(post.timestamp)}
            </p>
          </div>
        </div>
        
        {/* Post Actions Menu */}
        {currentUser && currentUser.id === post.userId && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => startEditingPost(post)}
              className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => deletePost(post.id)}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedPostContent}
              onChange={(e) => setEditedPostContent(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows="4"
              placeholder="Edit your post..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={saveEditedPost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-1"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {post.content}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reactions Bar */}
      <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full transition ${
              isLiked
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{post.likes || 0}</span>
          </button>

          {/* Reactions Button */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition ${
                userReaction
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {userReaction ? (
                reactionTypes[userReaction]?.icon
              ) : (
                <Smile className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{countReactions(post.id)}</span>
            </button>

            {/* Reactions Popup */}
            {showReactions[post.id] && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                {Object.entries(reactionTypes).map(([type, { icon, color }]) => (
                  <button
                    key={type}
                    onClick={() => handleReaction(post.id, type)}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      userReaction === type ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                  >
                    <span className={color}>{icon}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comments Button */}
          <button
            onClick={() => toggleComments(post.id)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full transition ${
              showComments[post.id]
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{post.comments || 0}</span>
          </button>
        </div>

        {/* Bookmark and Share */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleBookmark(post.id)}
            className={`p-2 rounded-full transition ${
              isBookmarked
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments[post.id] && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Comment Input */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
              {currentUser?.initials || 'U'}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newComment[post.id] || ''}
                onChange={handleCommentChange}
                onKeyPress={handleCommentKeyPress}
                placeholder="Write a comment..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => handleCommentSubmit(post.id)}
                disabled={!newComment[post.id]?.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments[post.id]?.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {comment.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;