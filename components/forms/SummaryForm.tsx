import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { refineTextWithAI } from '../../services/geminiService';

interface Props {
  summary: string;
  onUpdate: (s: string) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'dark' | 'light';
}

const SummaryForm: React.FC<Props> = ({ summary, onUpdate, onNext, onBack, theme }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [proposedSummary, setProposedSummary] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const isDataPresent = summary.trim().length > 5;

  const handleAIRefine = async () => {
    if (!isDataPresent) return;
    setIsRefining(true);
    setProposedSummary(null); // Clear previous suggestion if regenerating
    try {
      const refined = await refineTextWithAI(summary);
      setProposedSummary(refined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAccept = () => {
    if (proposedSummary) {
      onUpdate(proposedSummary);
      setProposedSummary(null);
    }
  };

  const handleDiscard = () => {
    setProposedSummary(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-10">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`text-4xl font-heading font-black ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>Professional Summary</motion.h2>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAIRefine}
          disabled={isRefining || !isDataPresent}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-lg relative overflow-hidden group flex items-center gap-2"
        >
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
           <i className={`fas ${isRefining ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} relative z-10`}></i>
           <span className="relative z-10">{isRefining ? 'Refining...' : 'AI Refine'}</span>
        </motion.button>
      </div>
      
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`mb-6 italic text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Describe your career goals. Tip: Type at least a few words to unlock AI refinement!</motion.p>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        className="relative"
      >
        <textarea 
          className={`w-full h-64 border rounded-2xl p-8 text-lg focus:ring-4 focus:ring-cyan-500/20 focus:outline-none leading-relaxed resize-none transition-all ${
            isDark 
            ? 'bg-slate-900 border-slate-700 text-slate-200' 
            : 'bg-white border-slate-300 text-slate-800 shadow-sm focus:border-cyan-500'
          } ${proposedSummary ? 'opacity-50 blur-[1px]' : ''}`}
          placeholder="e.g. Results-driven Software Developer with 3+ years of experience at TCS..."
          value={summary}
          onChange={(e) => onUpdate(e.target.value)}
          disabled={!!proposedSummary}
        />

        <AnimatePresence>
          {proposedSummary && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-4"
            >
              <div className={`w-full max-w-2xl border-2 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 ${isDark ? 'bg-slate-900 border-cyan-500/50 shadow-cyan-900/30' : 'bg-white border-cyan-500/50 shadow-cyan-200/50'}`}>
                <div className={`flex justify-between items-center border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                          <i className="fas fa-wand-magic-sparkles animate-pulse text-sm"></i>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>AI PROPOSED ENHANCEMENT</span>
                   </div>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex-1 overflow-y-auto max-h-60 text-base font-medium leading-relaxed italic p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  "{proposedSummary}"
                </motion.div>

                <div className="flex gap-4 justify-end mt-2">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDiscard} 
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${isDark ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    >
                        <i className="fas fa-times"></i> Discard
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAIRefine} 
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${isDark ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-cyan-200 text-cyan-600 hover:bg-cyan-50'}`}
                    >
                        <i className="fas fa-rotate-right"></i> Regenerate
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAccept} 
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-check"></i> Accept
                    </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-between mt-16">
        <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={onBack} 
            className={`px-8 py-3 transition-colors font-black uppercase tracking-widest text-xs rounded-xl border-2 ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:border-cyan-500 hover:text-cyan-500' : 'border-slate-300 text-slate-400 hover:border-cyan-600 hover:text-cyan-600'}`}
        >
            Back
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext} 
          className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/30 transition-all uppercase tracking-widest text-sm flex items-center gap-3 relative overflow-hidden group"
        >
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
           <span className="relative z-10">Next: Experience</span>
           <i className="fas fa-arrow-right relative z-10 group-hover:translate-x-1 transition-transform"></i>
        </motion.button>
      </div>
    </div>
  );
};

export default SummaryForm;