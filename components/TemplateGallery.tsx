import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { TemplateId, ResumeData } from '../types';

interface TemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  features: string[];
}

const TEMPLATES: TemplateOption[] = [
  { 
    id: 'modern', 
    name: 'TECH GIANT', 
    description: 'High-density layout used by engineers at FAANG. Maximizes space for skills and projects.',
    features: ['ATS Optimized', 'Compact Grid', 'Skill Focused']
  },
  { 
    id: 'executive', 
    name: 'CEO / EXECUTIVE', 
    description: 'Commanding authority with a classic structure. Best for management and senior roles.',
    features: ['Header Emphasis', 'Traditional Serif', 'Clean Hierarchy']
  },
  { 
    id: 'creative', 
    name: 'ORBIT / DESIGNER', 
    description: 'A striking sidebar layout that highlights personality. Perfect for creatives and startups.',
    features: ['Sidebar Layout', 'Visual Impact', 'Personal Branding']
  },
  { 
    id: 'minimal', 
    name: 'IVY LEAGUE', 
    description: 'The "Gold Standard" for Finance, Consulting, and Law. Pure, clean, and distraction-free.',
    features: ['Harvard Style', 'Maximum Readability', 'No-Nonsense']
  }
];

interface Props {
  data: ResumeData;
  onSelect: (id: TemplateId) => void;
  onClose: () => void;
}

const TemplateGallery: React.FC<Props> = ({ data, onSelect, onClose }) => {

  // --- MINIATURE TEMPLATE RENDERERS (Same logic, slightly tighter css) ---
  const renderMiniPreview = (id: TemplateId) => {
    switch (id) {
      case 'modern':
        return (
          <div className="w-full h-full bg-white p-2 flex flex-col gap-1.5 relative overflow-hidden select-none">
            {/* Header */}
            <div className="border-b-2 border-cyan-500 pb-1 mb-0.5">
               <div className="h-1.5 w-1/2 bg-slate-900 rounded-sm mb-0.5"></div>
               <div className="h-1 w-1/3 bg-slate-400 rounded-sm"></div>
            </div>
            {/* Grid Layout */}
            <div className="flex gap-1.5 flex-1">
               {/* Left Col (Skills) */}
               <div className="w-1/3 flex flex-col gap-1">
                  <div className="h-1 w-full bg-slate-200 rounded-sm mb-0.5"></div>
                  <div className="flex flex-wrap gap-0.5">
                      {[1,2,3,4].map(i => <div key={i} className="h-0.5 w-2 bg-slate-300 rounded-sm"></div>)}
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-sm mt-1 mb-0.5"></div>
                  <div className="h-6 w-full bg-slate-50 border border-slate-100 rounded-sm"></div>
               </div>
               {/* Right Col (Exp) */}
               <div className="flex-1 flex flex-col gap-1">
                  <div className="h-1 w-1/4 bg-cyan-600 rounded-sm"></div>
                  <div className="h-6 w-full bg-slate-50 border-l-2 border-slate-200 pl-1"></div>
                  <div className="h-6 w-full bg-slate-50 border-l-2 border-slate-200 pl-1"></div>
                  <div className="h-1 w-1/4 bg-cyan-600 rounded-sm mt-0.5"></div>
                  <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-sm"></div>
               </div>
            </div>
          </div>
        );
      
      case 'executive':
        return (
          <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 text-center relative overflow-hidden select-none">
            {/* Centered Header */}
            <div className="flex flex-col items-center border-b border-slate-300 pb-1.5 mb-0.5">
               <div className="w-6 h-6 rounded-full bg-slate-200 mb-0.5"></div>
               <div className="h-1.5 w-2/3 bg-slate-900 rounded-sm mb-0.5"></div>
               <div className="h-0.5 w-1/2 bg-slate-500 rounded-sm"></div>
            </div>
            {/* Classic Sections */}
            <div className="w-full text-left">
               <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-1"></div>
               <div className="space-y-0.5 mb-1.5">
                  <div className="flex justify-between">
                     <div className="h-1 w-1/3 bg-slate-800 rounded-sm"></div>
                     <div className="h-1 w-1/4 bg-slate-400 rounded-sm"></div>
                  </div>
                  <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                  <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
               </div>
               <div className="space-y-0.5">
                  <div className="flex justify-between">
                     <div className="h-1 w-1/3 bg-slate-800 rounded-sm"></div>
                     <div className="h-1 w-1/4 bg-slate-400 rounded-sm"></div>
                  </div>
                  <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
               </div>
            </div>
          </div>
        );

      case 'creative':
        return (
          <div className="w-full h-full bg-white flex relative overflow-hidden select-none">
             {/* Sidebar */}
             <div className="w-1/3 bg-slate-900 p-1.5 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-slate-800"></div>
                <div className="h-1 w-3/4 bg-slate-600 rounded-sm"></div>
                <div className="h-0.5 w-1/2 bg-slate-700 rounded-sm mb-1"></div>
                <div className="w-full space-y-0.5">
                   <div className="h-px w-full bg-slate-800"></div>
                   <div className="h-px w-full bg-slate-800"></div>
                   <div className="h-px w-full bg-slate-800"></div>
                </div>
             </div>
             {/* Main */}
             <div className="flex-1 p-2 flex flex-col gap-1.5">
                <div className="h-1.5 w-1/4 bg-slate-900 rounded-sm"></div>
                <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                <div className="h-1.5 w-1/4 bg-slate-900 rounded-sm mt-0.5"></div>
                <div className="border-l-2 border-slate-900 pl-1 space-y-0.5">
                    <div className="h-1 w-1/2 bg-slate-800 rounded-sm"></div>
                    <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                </div>
             </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="w-full h-full bg-[#fffbeb] p-3 flex flex-col gap-2 relative overflow-hidden border border-slate-100 select-none">
             {/* Simple Text Header */}
             <div className="mb-1">
                <div className="h-1.5 w-1/2 bg-black rounded-sm mb-0.5"></div>
                <div className="h-0.5 w-1/3 bg-gray-500 rounded-sm"></div>
             </div>
             {/* Clean Lists */}
             <div className="border-b border-black pb-0.5 mb-0.5">
                <div className="h-1 w-1/4 bg-black rounded-sm"></div>
             </div>
             <div className="space-y-1">
                <div>
                   <div className="flex justify-between mb-0.5">
                      <div className="h-1 w-1/3 bg-black rounded-sm"></div>
                      <div className="h-1 w-1/5 bg-gray-400 rounded-sm"></div>
                   </div>
                   <div className="h-0.5 w-full bg-gray-200 rounded-sm"></div>
                </div>
                <div>
                   <div className="flex justify-between mb-0.5">
                      <div className="h-1 w-1/3 bg-black rounded-sm"></div>
                      <div className="h-1 w-1/5 bg-gray-400 rounded-sm"></div>
                   </div>
                   <div className="h-0.5 w-full bg-gray-200 rounded-sm"></div>
                </div>
             </div>
          </div>
        );
      
      default: return null;
    }
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Increased padding-top to pt-36 (mobile) and pt-32 (desktop) to ensure modal sits below navbar
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-end md:justify-center sm:p-6 pt-36 md:pt-32 pb-4 px-4 bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        // Adjusted height to ensure it fits nicely with the new top gap
        className="w-full h-full md:h-[80vh] sm:max-w-6xl glass sm:rounded-[2.5rem] border-0 sm:border border-slate-800 flex flex-col shadow-2xl relative bg-slate-900"
      >
        {/* HEADER: Simplified & Sticky */}
        <div className="shrink-0 p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900 sm:rounded-t-[2.5rem] z-20">
          <div className="flex items-center gap-4">
             {/* Simple Icon instead of Robot */}
             <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <i className="fas fa-layer-group text-cyan-400 text-lg"></i>
             </div>
             <div>
                <h2 className="text-xl md:text-3xl font-heading font-black text-white tracking-tighter">
                    Design Vault
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]">
                    Select Template
                </p>
             </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all border border-slate-700"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-950/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            {TEMPLATES.map((tpl) => (
                <motion.div
                key={tpl.id}
                whileTap={{ scale: 0.98 }}
                className={`group relative rounded-3xl border-2 p-5 flex flex-row gap-5 transition-all cursor-pointer overflow-hidden items-stretch ${
                    data.templateId === tpl.id 
                        ? 'border-cyan-500 bg-cyan-900/10' 
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                }`}
                onClick={() => { onSelect(tpl.id); onClose(); }}
                >
                {/* Active Indicator (Corner) */}
                {data.templateId === tpl.id && (
                    <div className="absolute top-0 right-0 p-4">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse"></div>
                    </div>
                )}

                {/* Left: Preview (Responsive Size) */}
                <div className="w-28 sm:w-36 md:w-40 shrink-0 aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-slate-700/50 bg-slate-800 relative self-start">
                    {renderMiniPreview(tpl.id)}
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/5 pointer-events-none"></div>
                </div>

                {/* Right: Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <h3 className={`text-xl font-black tracking-tight mb-2 leading-none ${data.templateId === tpl.id ? 'text-cyan-400' : 'text-white'}`}>
                            {tpl.name}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed font-medium mb-3 line-clamp-3">
                            {tpl.description}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                            {tpl.features.slice(0, 2).map(f => ( // Limit to 2 tags on mobile to save space
                                <span key={f} className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded border whitespace-nowrap ${
                                    data.templateId === tpl.id 
                                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' 
                                        : 'bg-slate-800 text-slate-500 border-slate-700'
                                }`}>
                                    {f}
                                </span>
                            ))}
                        </div>
                        
                        <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${data.templateId === tpl.id ? 'text-cyan-400' : 'text-slate-600'}`}>
                            {data.templateId === tpl.id ? (
                                <span><i className="fas fa-check-circle mr-1"></i> Active</span>
                            ) : (
                                <span className="group-hover:text-white transition-colors">Apply Layout <i className="fas fa-arrow-right ml-1"></i></span>
                            )}
                        </div>
                    </div>
                </div>
                </motion.div>
            ))}
            </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default TemplateGallery;