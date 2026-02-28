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
  const tabs = [
    { id: 'all', label: 'All Posts', icon: <Home className="h-5 w-5" />, count: posts.length },
    { id: 'my-posts', label: 'My Posts', icon: <User className="h-5 w-5" />, count: posts.filter(p => p.userId === currentUser?.id).length },
    { id: 'liked', label: 'Liked Posts', icon: <Heart className="h-5 w-5" />, count: posts.filter(p => p.userId === currentUser?.id).length },
    { id: 'bookmarked', label: 'Bookmarked', icon: <Bookmark className="h-5 w-5" />, count: bookmarkedPosts.length }
  ];

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
    <div className={`${open ? 'w-[20rem]' : 'w-20'} bg-white border-r border-gray-50 flex flex-col transition-all duration-500 ease-in-out z-40 shadow-[10px_0_40px_-15px_rgba(0,0,0,0.03)]`}>
      {/* Header */}
      <div className="p-8 flex items-center justify-between bg-[#2D3142] rounded-br-[3rem]">
        {open && (
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Lobby</h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-3 rounded-2xl transition-all ${open ? 'bg-white/10 text-white' : 'mx-auto text-[#4A4E69]/40 hover:text-[#2D3142]'}`}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all group ${activeTab === tab.id
                ? 'bg-[#7C9885] text-white shadow-lg shadow-[#7C9885]/20'
                : 'text-[#4A4E69]/60 hover:bg-[#F9FBFF] hover:text-[#2D3142]'
                }`}
            >
              <span className={`${activeTab === tab.id ? 'text-white' : 'text-[#4A4E69]/40 group-hover:text-[#7C9885]'}`}>
                {tab.icon}
              </span>
              {open && (
                <>
                  <span className="flex-1 text-left font-bold text-sm tracking-wide uppercase">{tab.label}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-50 text-[#4A4E69]/40'
                    }`}>
                    {tab.count}
                  </span>
                </>
              )}
            </button>
          ))}
        </nav>

        {/* App Suite Grid */}
        {open && (
          <div className="pt-6 border-t border-gray-50 px-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-[#4A4E69]/40 uppercase tracking-[0.2em]">MindWell Suite</h3>
              <Sparkles className="h-3 w-3 text-[#7C9885]/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Therapist', to: '/chatbot', color: 'bg-indigo-50 text-indigo-600', icon: <Stars className="h-4 w-4" /> },
                { label: 'Growth', to: '/therapies', color: 'bg-emerald-50 text-emerald-600', icon: <TrendingUp className="h-4 w-4" /> },
                { label: 'Library', to: '/resources', color: 'bg-amber-50 text-amber-600', icon: <BookOpen className="h-4 w-4" /> },
                { label: 'Home', to: '/', color: 'bg-slate-50 text-slate-600', icon: <Home className="h-4 w-4" /> }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9FBFF] hover:bg-white border border-transparent hover:border-gray-100 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className={`p-2 rounded-xl mb-1.5 transition-transform group-hover:scale-110 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[#4A4E69]">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarked Posts Preview */}
        {open && bookmarkedPosts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-gray-50">
            <div className="flex items-center space-x-3 text-[#2D3142]">
              <Star className="h-5 w-5 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Saved Items</h3>
            </div>
            <div className="space-y-3">
              {getBookmarkedPostsPreview().map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-[#F9FBFF] rounded-[1.5rem] hover:bg-white border border-transparent hover:border-gray-100 transition-all cursor-pointer shadow-sm"
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
          <div className="bg-[#2D3142] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <Sparkles className="absolute -right-4 -top-4 h-20 w-20 text-white/5 rotate-12" />
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Your Impact</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.userId === currentUser?.id).length}</p>
                <p className="text-[10px] font-medium text-white/40">Posts Shared</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.userId === currentUser?.id).reduce((acc, post) => acc + (post.likes || 0), 0)}</p>
                <p className="text-[10px] font-medium text-white/40">Likes Gained</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      {open && currentUser && (
        <div className="p-8 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 overflow-hidden">
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#7C9885] to-[#4A4E69] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C9885]/20 shrink-0">
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
              className="p-3 rounded-xl bg-gray-50 text-[#4A4E69]/40 hover:bg-red-50 hover:text-red-500 transition-all group shadow-sm shrink-0 ml-4"
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