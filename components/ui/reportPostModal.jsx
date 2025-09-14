import { useState } from "react";
import { ArrowLeft, AlertTriangle, Shield, Zap } from "lucide-react";

const reportReasons = [
  { id: "spam", label: "Spam", icon: "⚡", description: "Unwanted promotional content" },
  { id: "hate", label: "Hate Speech", icon: "🛡️", description: "Content promoting hatred or discrimination" },
  { id: "harassment", label: "Harassment", icon: "⚠️", description: "Targeted abuse or bullying" },
  { id: "false", label: "False Information", icon: "🔍", description: "Misleading or fabricated content" },
  { id: "other", label: "Other", icon: "💭", description: "Something else that violates guidelines" }
];

const ReportPostModal = ({ post, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleNext = (reason) => {
    setSelectedReason(reason);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      return;
    }

    onSubmit({
      postId: post.id,
      reason: selectedReason,
      additionalInfo: additionalInfo.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      {/* Futuristic backdrop with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-purple-900/10 to-cyan-900/20 backdrop-blur-md">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-30" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
               `,
               backgroundSize: '30px 30px',
               animation: 'pulse 4s ease-in-out infinite'
             }}>
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-80 animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full opacity-40 animate-bounce"></div>
      </div>

      {/* Main modal */}
      <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/95 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 w-[420px] shadow-2xl">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 blur-xl -z-10"></div>
        
        {/* Header glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-60"></div>

        {/* Back button for step 2 */}
        {step === 2 && (
          <button
            className="absolute top-6 left-6 text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110 group"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="w-6 h-6 group-hover:animate-pulse" />
          </button>
        )}

        {/* Step indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              step === 1 ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-125' : 'bg-slate-600'
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              step === 2 ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-125' : 'bg-slate-600'
            }`}></div>
          </div>
        </div>

        {/* Step 1: Select reason */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl mb-4 border border-red-500/30">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Report Content
              </h2>
              <p className="text-slate-400 text-sm mt-2">Select the reason that best describes the issue</p>
            </div>

            <div className="space-y-3">
              {reportReasons.map((reason) => (
                <button
                  key={reason.id}
                  className="group w-full p-4 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl transition-all duration-300 text-left hover:transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10"
                  onClick={() => handleNext(reason.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {reason.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {reason.label}
                      </div>
                      <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        {reason.description}
                      </div>
                    </div>
                    <div className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Additional info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-4 border border-blue-500/30">
                <AlertTriangle className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Additional Details
              </h2>
              <p className="text-slate-400 text-sm mt-2">Help us understand the issue better</p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="text-sm text-slate-300 font-medium">Selected Reason:</div>
                <div className="text-cyan-400 font-semibold">
                  {reportReasons.find(r => r.id === selectedReason)?.label}
                </div>
              </div>

              <div className="relative">
                <textarea
                  className="w-full p-4 bg-slate-800/50 border border-slate-700/50 focus:border-cyan-500/50 rounded-2xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  rows={4}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Describe the issue in more detail..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                  {additionalInfo.length}/500
                </div>
              </div>

              <button
                className={`group w-full font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedReason === "other" && !additionalInfo.trim()
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white hover:transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                }`}
                onClick={handleSubmit}
                disabled={selectedReason === "other" && !additionalInfo.trim()}
              >
                <Zap className={`w-5 h-5 ${selectedReason === "other" && !additionalInfo.trim() ? "" : "group-hover:animate-pulse"}`} />
                <span>Submit Report</span>
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-slate-400 hover:text-red-400 transition-all duration-300 hover:scale-110 hover:rotate-90"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReportPostModal;