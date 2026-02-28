import React, { useState, useRef, useEffect } from 'react';
import { X, Smile, Frown, Meh, Angry, Send, Eye, EyeOff, Image as ImageIcon, Plus, Info, ShieldCheck, Sparkles } from 'lucide-react';

const CreatePostModal = ({
  show,
  onClose,
  isLoading,
  handlePostSubmit
}) => {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const moods = [
    { value: 'happy', label: 'Radiant', icon: <Smile className="h-5 w-5" />, color: 'text-emerald-500', desc: 'Feeling positive and energized' },
    { value: 'neutral', label: 'Balanced', icon: <Meh className="h-5 w-5" />, color: 'text-amber-500', desc: 'Feeling calm and centered' },
    { value: 'sad', label: 'Reflective', icon: <Frown className="h-5 w-5" />, color: 'text-blue-500', desc: 'Feeling low or introspective' },
    { value: 'angry', label: 'Intense', icon: <Angry className="h-5 w-5" />, color: 'text-red-500', desc: 'Feeling frustrated or passionate' }
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      alert("You can only upload up to 4 images.");
      return;
    }

    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = () => {
    handlePostSubmit(content, images, mood, isAnonymous);
    // Reset state
    setContent("");
    setImages([]);
    setImagePreviews([]);
    setMood("neutral");
    setIsAnonymous(false);
  };

  const charLimit = 1000;
  const isCloseToLimit = content.length > charLimit * 0.9;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#2D3142]/60 backdrop-blur-xl flex items-center justify-center p-4 z-[100] transition-all duration-500 animate-in fade-in">
      <div className="bg-white rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col border border-white/40 relative">

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[110] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-[#7C9885]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#7C9885] border-t-transparent rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-[#7C9885] animate-pulse" />
            </div>
            <p className="font-bold text-[#2D3142] animate-pulse uppercase tracking-[0.2em] text-xs">Publishing your story...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-10 pb-6 border-b border-gray-50">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="bg-[#7C9885]/10 p-2 rounded-xl">
                <Plus className="h-5 w-5 text-[#7C9885]" />
              </div>
              <h2 className="text-3xl font-black text-[#2D3142] tracking-tight">Post a Story</h2>
            </div>
            <p className="text-sm text-[#4A4E69]/50 font-medium">Your voice matters in our community.</p>
          </div>
          <button onClick={onClose} className="p-4 bg-gray-50 text-[#4A4E69]/40 hover:text-[#2D3142] hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all duration-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">

          {/* Post Guidelines Toggle */}
          <div className="bg-[#F9FBFF] rounded-[2rem] border border-gray-50 overflow-hidden transition-all duration-500">
            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="w-full flex items-center justify-between p-5 text-left group"
            >
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-[#7C9885]" />
                <span className="text-xs font-bold text-[#4A4E69]/60 uppercase tracking-widest">Community Guidelines</span>
              </div>
              <Plus className={`h-4 w-4 text-[#4A4E69]/30 transition-transform duration-500 ${showGuidelines ? 'rotate-45' : ''}`} />
            </button>
            {showGuidelines && (
              <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-500">
                <p className="text-xs text-[#4A4E69]/60 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-gray-50">
                  • Be respectful and empathetic to others.<br />
                  • Avoid medical advice; share personal experiences instead.<br />
                  • Trigger Warnings are encouraged for sensitive topics.
                </p>
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="relative group">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's your story today? Use #hashtags to help others find you."
              className="w-full p-8 bg-[#F9FBFF] border-none rounded-[2.5rem] resize-none focus:ring-4 focus:ring-[#7C9885]/5 outline-none text-[#2D3142] h-48 font-light text-xl italic placeholder:text-gray-200 transition-all shadow-inner"
              required
            />
            <div className={`absolute bottom-6 right-8 text-[10px] font-black tracking-[0.2em] transition-colors ${isCloseToLimit ? 'text-red-400' : 'text-[#4A4E69]/20'}`}>
              {content.length} / {charLimit}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ImageIcon className="h-5 w-5 text-[#4A4E69]/40" />
                <label className="text-xs font-black text-[#2D3142] uppercase tracking-[0.2em]">Visual Attachments</label>
              </div>
              <span className="text-[10px] font-bold text-[#4A4E69]/40 bg-gray-50 px-3 py-1 rounded-full uppercase italic">UP TO 4 IMAGES</span>
            </div>

            <div className="flex flex-wrap gap-5">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative group w-28 h-28 animate-in zoom-in duration-300">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-[1.5rem] shadow-xl border border-white" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-3 -right-3 bg-red-400 text-white p-2 rounded-xl shadow-2xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 border-2 border-dashed border-gray-100 rounded-[1.5rem] flex flex-col items-center justify-center text-[#7C9885]/40 hover:text-[#7C9885] hover:bg-[#7C9885]/5 hover:border-[#7C9885] transition-all duration-500 group"
                >
                  <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-white transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black mt-2 tracking-widest">ADD</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
            {/* Mood Selector */}
            <div className="space-y-6">
              <label className="text-xs font-black text-[#2D3142] uppercase tracking-[0.2em] ml-2">Your Energy</label>
              <div className="flex justify-between bg-[#F9FBFF] p-2 rounded-[2rem] border border-gray-50">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`p-4 rounded-2xl transition-all duration-500 group relative ${mood === m.value
                        ? 'bg-white shadow-xl text-[#7C9885]'
                        : 'text-gray-300 hover:text-[#4A4E69]'
                      }`}
                  >
                    {m.icon}
                    {mood === m.value && (
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#2D3142] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-top-2 z-20 pointer-events-none">
                        {m.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Section */}
            <div className="space-y-6">
              <label className="text-xs font-black text-[#2D3142] uppercase tracking-[0.2em] ml-2">Privacy Settings</label>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-500 ${isAnonymous ? 'bg-[#7C9885]/5 border-[#7C9885]/20' : 'bg-[#F9FBFF] border-gray-50'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl transition-colors ${isAnonymous ? 'bg-[#7C9885] text-white' : 'bg-gray-100 text-[#4A4E69]/30'}`}>
                      {isAnonymous ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                    <span className="text-sm font-bold text-[#2D3142]">Anonymous</span>
                  </div>
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-14 h-7 rounded-full transition-all relative ${isAnonymous ? 'bg-[#7C9885]' : 'bg-gray-200 shadow-inner'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${isAnonymous ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>

                {isAnonymous && (
                  <div className="flex items-center space-x-3 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl animate-in slide-in-from-left-4 duration-500 border border-emerald-100">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Identity fully shielded from peers</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-gray-50 bg-[#F9FBFF]/80 backdrop-blur-md flex justify-end space-x-6">
          <button onClick={onClose} className="px-8 py-4 text-[#4A4E69]/40 font-black text-xs tracking-[0.2em] hover:text-[#2D3142] transition-colors uppercase">Discard</button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !content.trim()}
            className="px-12 py-4 bg-[#7C9885] hover:bg-[#2D3142] disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-white font-black text-xs tracking-[0.3em] rounded-[1.5rem] shadow-[0_20px_48px_-12px_rgba(124,152,133,0.3)] flex items-center space-x-4 transition-all duration-500 active:scale-95 group uppercase"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>Publish Story</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;