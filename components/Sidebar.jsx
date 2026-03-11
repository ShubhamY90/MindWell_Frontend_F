import {
  Bookmark, Heart, User, MessageSquare, ChevronLeft, ChevronRight,
  Home, BookOpen, Star, Archive, TrendingUp, Sparkles, LogOut, Stars
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({
  open,
  onToggle,
  bookmarkedPosts,
  posts,
  activeTab,
  setActiveTab,
  currentUser,
  darkMode,
  handleLogout
}) => {
  const tabs = [];

  const getBookmarkedPostsPreview = () => {
    return posts
      .filter(post => bookmarkedPosts.includes(post.id))
      .slice(0, 3);
  };

  const formatPreviewText = (text, maxLength = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`${open ? 'w-[20rem]' : 'w-20'} bg-transparent flex flex-col transition-all duration-500 ease-in-out z-40 relative`}>
      {/* Header */}
      <div className="px-8 pb-8 pt-4 flex items-center justify-between">
        {open && (
          <div className="flex items-center space-x-3">
            <div className="bg-white/50 p-2 rounded-xl shadow-sm border border-white">
              <BookOpen className="h-5 w-5 text-[#2D3142]" />
            </div>
            <h2 className="text-xl font-bold text-[#2D3142]">Lobby</h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-3 rounded-2xl transition-all ${open ? 'bg-white/50 text-[#2D3142] shadow-sm border border-white hover:bg-white' : 'mx-auto text-[#4A4E69]/60 hover:bg-white/50 hover:text-[#2D3142]'}`}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">


        {/* Bookmarked Posts Preview */}
        {open && bookmarkedPosts.length > 0 && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center space-x-3 text-[#2D3142]">
              <Star className="h-5 w-5 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Saved Items</h3>
            </div>
            <div className="space-y-3">
              {getBookmarkedPostsPreview().map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-white/40 backdrop-blur-sm rounded-[1.5rem] hover:bg-white/70 border border-white/50 hover:border-white transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-[#7C9885]/10 flex items-center justify-center text-[#7C9885] text-[10px] font-bold">
                      {post.anonymous ? 'A' : post.userInitials?.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-[#4A4E69]/60">
                      {post.username}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A4E69] leading-relaxed italic">
                    "{formatPreviewText(post.content)}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Summary Card */}
        {open && (
          <div className="bg-gradient-to-br from-[#7C9885]/80 to-[#4A4E69]/80 p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden border border-white/30 backdrop-blur-md">
            <Sparkles className="absolute -right-4 -top-4 h-20 w-20 text-white/5 rotate-12" />
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-4">Your Impact</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.userId === currentUser?.id).length}</p>
                <p className="text-[10px] font-medium text-white/70">Posts Shared</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.userId === currentUser?.id).reduce((acc, post) => acc + (post.likes || 0), 0)}</p>
                <p className="text-[10px] font-medium text-white/70">Likes Gained</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      {open && currentUser && (
        <div className="p-8 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 overflow-hidden">
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#7C9885]/30 to-[#4A4E69]/30 border border-white/50 flex items-center justify-center text-[#2D3142] font-bold shadow-sm shrink-0">
                {currentUser.initials}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-[#2D3142] truncate">
                  {currentUser.username}
                </div>
                <div className="flex items-center text-[10px] font-bold text-[#7C9885] uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Online
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-3 rounded-xl bg-white/50 text-[#4A4E69]/60 hover:bg-red-50 hover:text-red-500 transition-all group shadow-sm border border-white/60 shrink-0 ml-4"
              title="Logout"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;