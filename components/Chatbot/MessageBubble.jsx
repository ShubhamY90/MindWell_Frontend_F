import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, videoSuggestions, isUser, timestamp, darkMode, jsxContent }) => {
  const [playingVideo, setPlayingVideo] = useState(null);

  const getYoutubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      // Restore standard controls for seeking, speed, quality
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&controls=1&rel=0&enablejsapi=1`;
    }
    return null;
  };

  const activeEmbedUrl = playingVideo ? getYoutubeEmbedUrl(playingVideo.url) : null;

  // Handle Navigation
  const currentIndex = videoSuggestions ? videoSuggestions.findIndex(v => v.url === playingVideo?.url) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = videoSuggestions && currentIndex < videoSuggestions.length - 1;

  const playPrev = (e) => {
    if (e) e.stopPropagation();
    if (hasPrev) setPlayingVideo(videoSuggestions[currentIndex - 1]);
  };

  const playNext = (e) => {
    if (e) e.stopPropagation();
    if (hasNext) setPlayingVideo(videoSuggestions[currentIndex + 1]);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`mt-4 lg:max-w-[85%] px-6 py-4 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 relative ${isUser
          ? 'bg-[#7C9885] text-white rounded-br-sm shadow-emerald-900/10'
          : darkMode
            ? 'bg-[#1E202C] text-gray-200 border border-gray-700/50 rounded-bl-sm'
            : 'bg-white border border-gray-100 text-[#2D3142] rounded-bl-sm shadow-sm'
          }`}
      >
        {jsxContent ? (
          jsxContent
        ) : (
          <div className="overflow-y-auto break-words whitespace-pre-wrap">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className={`text-[15px] leading-relaxed mb-0 ${isUser ? 'text-white' : darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {children}
                  </p>
                ),
                code: ({ inline, className, children, ...props }) => {
                  const baseStyle = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800';
                  return inline ? (
                    <code className={`${baseStyle} px-1 py-0.5 rounded text-xs ${className || ''}`} {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className={`${baseStyle} text-sm p-2 rounded my-2 overflow-x-auto`} {...props}>
                      <code>{children}</code>
                    </pre>
                  );
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-emerald-500 hover:text-emerald-600 font-medium"
                  >
                    {children}
                  </a>
                )
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}

        <div className="flex items-center justify-between mt-2.5">
          {timestamp && (
            <p className={`text-[10px] font-medium uppercase tracking-widest ${isUser
              ? 'text-white/60'
              : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {!isUser && videoSuggestions && videoSuggestions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-500/10">
            <div className="flex items-center justify-between mb-5">
              <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${darkMode ? 'text-[#7C9885]' : 'text-[#5E7A67]'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Healing Library
              </h4>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Curated for you</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videoSuggestions.map((v) => (
                <button
                  key={v.url}
                  onClick={() => setPlayingVideo(v)}
                  className={`group/btn flex flex-col rounded-2xl overflow-hidden transition-all duration-500 border text-left ${darkMode
                      ? 'bg-gray-900/40 border-gray-800 hover:border-[#7C9885]/40'
                      : 'bg-gray-50/50 border-gray-100 hover:border-[#7C9885]/30 hover:bg-white hover:shadow-xl'
                    }`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/20 group-hover/btn:bg-black/40 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#7C9885] flex items-center justify-center text-white shadow-2xl transform scale-90 group-hover/btn:scale-100 transition-transform duration-500">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className={`text-[12px] font-bold leading-tight line-clamp-2 transition-colors ${darkMode ? 'text-gray-300 group-hover/btn:text-white' : 'text-gray-800 group-hover/btn:text-[#7C9885]'}`}>
                      {v.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Professional Video Overlay (Modal-style) */}
        {playingVideo && activeEmbedUrl && (
          <div id="mindwell-video-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
              onClick={() => setPlayingVideo(null)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl group/modal">
              {/* Close Button */}
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute -top-14 right-0 text-white/60 hover:text-white transition-all flex items-center gap-2 group/close"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover/close:opacity-100 transition-opacity">Close Player</span>
                <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 group-hover/close:rotate-90 transition-transform">
                  <svg size={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
              </button>

              {/* Navigation Controls */}
              <div className="absolute inset-y-0 -left-20 -right-20 flex items-center justify-between pointer-events-none md:flex hidden">
                <button
                  onClick={playPrev}
                  disabled={!hasPrev}
                  className={`p-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white transition-all pointer-events-auto shadow-2xl ${hasPrev ? 'hover:bg-white/10 hover:-translate-x-2' : 'opacity-10 cursor-not-allowed'}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={playNext}
                  disabled={!hasNext}
                  className={`p-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white transition-all pointer-events-auto shadow-2xl ${hasNext ? 'hover:bg-white/10 hover:translate-x-2' : 'opacity-10 cursor-not-allowed'}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              {/* Video Player Container */}
              <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(124,152,133,0.2)] border border-white/10 animate-in zoom-in-95 duration-500">
                <iframe
                  src={activeEmbedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-[#7C9885] text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Now Playing</span>
                      <p className="text-white text-sm font-bold line-clamp-1">{playingVideo.title}</p>
                    </div>
                    <div className="flex items-center gap-2 md:hidden">
                      <button onClick={playPrev} disabled={!hasPrev} className={`p-2 text-white ${!hasPrev && 'opacity-20'}`}>
                        <svg size={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
                      </button>
                      <button onClick={playNext} disabled={!hasNext} className={`p-2 text-white ${!hasNext && 'opacity-20'}`}>
                        <svg size={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;