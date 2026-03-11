import React, { useState } from 'react';
import {
  Search, X, Hash, User, TrendingUp,
  Clock, ChevronRight, ChevronLeft, Zap, Target, Sparkles
} from 'lucide-react';

const SearchPanel = ({
  open,
  onToggle,
  searchTerm,
  setSearchTerm
}) => {
  const [filterType, setFilterType] = useState('all');
  const [searchHistory, setSearchHistory] = useState(['#mindfulness', '#recovery', '#hope']);

  const filters = [
    { id: 'all', label: 'All', icon: <Target className="h-4 w-4" /> },
    { id: 'hashtags', label: 'Hash', icon: <Hash className="h-4 w-4" /> },
    { id: 'users', label: 'Soul', icon: <User className="h-4 w-4" /> }
  ];



  const handleClearSearch = () => {
    setSearchTerm('');
  };



  return (
    <div className={`${open ? 'w-[22rem]' : 'w-20'} bg-transparent flex flex-col transition-all duration-500 ease-in-out z-40 relative`}>
      {/* Header */}
      <div className="px-8 pb-6 pt-4 flex items-center justify-between">
        {open && (
          <div className="flex items-center space-x-3">
            <div className="bg-white/50 p-2 rounded-xl border border-white shadow-sm">
              <Search className="h-5 w-5 text-[#2D3142]" />
            </div>
            <h2 className="text-xl font-bold text-[#2D3142]">Explorer</h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-3 rounded-2xl transition-all ${open ? 'bg-white/50 text-[#2D3142] border border-white shadow-sm hover:bg-white' : 'mx-auto text-[#4A4E69]/60 hover:text-[#2D3142] hover:bg-white/50'}`}
        >
          {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent ${open ? 'px-8 pb-8 opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
        {open && (
          <div className="space-y-10">
            {/* Search Input */}
            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4A4E69]/50 group-focus-within:text-[#7C9885] transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find stories, souls, tags..."
                  className="w-full pl-14 pr-12 py-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-[1.5rem] focus:ring-2 focus:ring-[#7C9885] outline-none text-[#2D3142] text-sm placeholder:text-[#4A4E69]/50 font-medium transition-all shadow-sm"
                />
                {searchTerm && (
                  <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4E69]/30 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex justify-between bg-white/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-sm">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${filterType === f.id
                      ? 'bg-white text-[#7C9885] shadow-sm border border-white/60'
                      : 'text-[#4A4E69]/60 hover:text-[#2D3142] hover:bg-white/40'
                      }`}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>



            {/* Insight Card */}
            <div className="bg-gradient-to-br from-[#7C9885]/80 to-[#4A4E69]/80 border border-white/30 backdrop-blur-md p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
              <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/5 rotate-12" />
              <h4 className="font-bold mb-2 relative z-10 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-amber-400 fill-amber-400" />
                Mindful Search
              </h4>
              <p className="text-xs text-white/60 leading-relaxed relative z-10">
                Discovering someone else's story can often help you write your own. Search with empathy and find your tribe.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;