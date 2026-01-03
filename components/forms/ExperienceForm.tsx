import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Experience } from '../../types';
import { refineTextWithAI } from '../../services/geminiService';

interface Props {
  experiences: Experience[];
  onUpdate: (exp: Experience[]) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'dark' | 'light';
}

const ExperienceForm: React.FC<Props> = ({ experiences, onUpdate, onNext, onBack, theme }) => {
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [proposedBullets, setProposedBullets] = useState<{ id: string, bullets: string[] } | null>(null);
  const isDark = theme === 'dark';

  const addExperience = () => {
    onUpdate([...experiences, {
      id: Math.random().toString(36).substr(2, 9),
      company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, description: ['']
    }]);
  };

  const updateExp = (id: string, updates: Partial<Experience>) => {
    onUpdate(experiences.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const updateBullet = (expId: string, bulletIdx: number, val: string) => {
    onUpdate(experiences.map(exp => {
      if (exp.id === expId) {
        const newBullets = [...exp.description];
        newBullets[bulletIdx] = val;
        return { ...exp, description: newBullets };
      }
      return exp;
    }));
  };

  const addBullet = (expId: string) => {
    onUpdate(experiences.map(exp => {
      if (exp.id === expId) {
        return { ...exp, description: [...exp.description, ''] };
      }
      return exp;
    }));
  };

  const handleAIRefine = async (id: string) => {
    const exp = experiences.find(e => e.id === id);
    if (!exp) return;
    
    setRefiningId(id);
    setProposedBullets(null);
    const combined = exp.description.filter(b => b.trim()).join("\n");
    const context = `Role: ${exp.role} at ${exp.company}`;
    
    try {
      const refined = await refineTextWithAI(combined, context);
      const newBullets = refined.split("\n")
        .filter(b => b.trim().length > 0)
        .map(b => b.replace(/^[•\-\*\d\.]+\s*/, '').trim());
      
      setProposedBullets({ id, bullets: newBullets });
    } catch (err) {
      console.error(err);
    } finally {
      setRefiningId(null);
    }
  };

  const handleAccept = () => {
    if (proposedBullets) {
      updateExp(proposedBullets.id, { description: proposedBullets.bullets });
      setProposedBullets(null);
    }
  };

  const handleDiscard = () => setProposedBullets(null);

  const inputClass = `w-full bg-transparent border-b pl-2 py-4 text-base outline-none transition-all duration-300 ${
    isDark 
      ? 'border-slate-700 text-white focus:border-cyan-500 placeholder-slate-600' 
      : 'border-slate-300 text-slate-900 focus:border-cyan-600 placeholder-slate-400 bg-slate-50/50'
  }`;

  const labelClass = `text-xs uppercase font-black tracking-widest mb-1 block ${
    isDark ? 'text-slate-500' : 'text-slate-500'
  }`;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className={`text-4xl font-heading font-black mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>Professional Experience</h2>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Add your career highlights and let AI polish them.</p>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={addExperience} 
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/30 transition-all uppercase tracking-widest text-xs flex items-center gap-2 relative overflow-hidden group"
        >
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
           <i className="fas fa-plus relative z-10"></i> 
           <span className="relative z-10">Add Position</span>
        </motion.button>
      </div>

      <LayoutGroup>
        <motion.div className="space-y-16" layout>
            <AnimatePresence initial={false}>
            {experiences.map((exp, index) => (
            <motion.div 
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                key={exp.id} 
                className={`glass p-8 md:p-12 rounded-[2.5rem] relative border-l-[6px] shadow-2xl overflow-hidden transition-all ${
                isDark 
                    ? 'border-l-cyan-500 bg-slate-900/60 border-y border-r border-slate-800' 
                    : 'border-l-cyan-600 bg-white border-y border-r border-slate-300 shadow-xl shadow-slate-200/50'
                }`}
            >
                {/* Header Actions - Responsive Flex */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-dashed border-opacity-20 gap-4" style={{ borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.1)' }}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                    <i className="fas fa-briefcase"></i>
                    </div>
                    <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Position #{index + 1}</span>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{exp.role || 'Untitled Role'}</span>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                    onClick={() => handleAIRefine(exp.id)}
                    disabled={refiningId === exp.id}
                    className={`flex-1 md:flex-none justify-center text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                        refiningId === exp.id 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500 hover:text-white' 
                            : 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-600 hover:text-white'
                    }`}
                    >
                    <i className={`fas ${refiningId === exp.id ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                    {refiningId === exp.id ? 'Refining...' : 'AI Polish'}
                    </button>
                    <button 
                    onClick={() => onUpdate(experiences.filter(e => e.id !== exp.id))} 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors border ${isDark ? 'border-slate-800 bg-slate-800 text-slate-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                    >
                    <i className="fas fa-trash-alt text-lg"></i>
                    </button>
                </div>
                </div>

                <div className={`grid md:grid-cols-2 gap-x-12 gap-y-8 mb-10 transition-all ${proposedBullets?.id === exp.id ? 'opacity-20 blur-sm' : ''}`}>
                <div className="space-y-2 relative group">
                    <label className={labelClass}>Designation / Role</label>
                    <input 
                    value={exp.role} 
                    onChange={(e) => updateExp(exp.id, { role: e.target.value })} 
                    className={inputClass} 
                    placeholder="e.g. Senior Product Designer" 
                    />
                </div>

                <div className="space-y-2 relative group">
                    <label className={labelClass}>Company / Organization</label>
                    <input 
                    value={exp.company} 
                    onChange={(e) => updateExp(exp.id, { company: e.target.value })} 
                    className={inputClass} 
                    placeholder="e.g. Microsoft" 
                    />
                </div>

                <div className="space-y-2 relative group">
                    <label className={labelClass}>Timeline (Start - End)</label>
                    <input 
                    value={exp.startDate} 
                    onChange={(e) => updateExp(exp.id, { startDate: e.target.value })} 
                    className={inputClass} 
                    placeholder="e.g. Jun 2021 - Present" 
                    />
                </div>

                <div className="space-y-2 relative group">
                    <label className={labelClass}>Location</label>
                    <input 
                    value={exp.location} 
                    onChange={(e) => updateExp(exp.id, { location: e.target.value })} 
                    className={inputClass} 
                    placeholder="e.g. New York, USA" 
                    />
                </div>
                </div>
                
                <div className={`space-y-6 ${proposedBullets?.id === exp.id ? 'opacity-20 blur-sm' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                    <i className="fas fa-list-check"></i>
                    </div>
                    <label className={labelClass} style={{marginBottom: 0}}>Key Achievements & Impact</label>
                </div>
                
                <AnimatePresence initial={false}>
                    {exp.description.map((bullet, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10, height: 0 }}
                            className="flex gap-4 items-start group relative overflow-hidden"
                        >
                        <span className={`mt-4 text-[6px] ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}><i className="fas fa-circle"></i></span>
                        <textarea 
                            rows={2}
                            value={bullet} 
                            onChange={(e) => updateBullet(exp.id, idx, e.target.value)} 
                            className={`flex-1 bg-transparent border rounded-2xl p-4 text-base leading-relaxed outline-none transition-all resize-none ${
                            isDark 
                                ? 'border-slate-800 text-slate-200 focus:border-cyan-500 focus:bg-slate-800/50' 
                                : 'border-slate-300 text-slate-800 focus:border-cyan-500 focus:bg-white bg-slate-50/50'
                            }`}
                            placeholder="Describe what you accomplished (e.g. Increased sales by 20%)..." 
                        />
                        {exp.description.length > 1 && (
                            <button 
                            onClick={() => { const nb = [...exp.description]; nb.splice(idx,1); updateExp(exp.id, {description: nb}); }} 
                            className={`mt-4 opacity-0 group-hover:opacity-100 transition-all p-2 ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                            >
                            <i className="fas fa-times text-lg"></i>
                            </button>
                        )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <button 
                    onClick={() => addBullet(exp.id)} 
                    className={`text-xs font-black uppercase tracking-widest mt-4 flex items-center gap-2 transition-colors px-4 py-2 rounded-lg ${isDark ? 'text-cyan-500 hover:bg-cyan-500/10' : 'text-cyan-600 hover:bg-cyan-50'}`}
                >
                    <i className="fas fa-plus-circle"></i> Add Achievement
                </button>
                </div>

                <AnimatePresence>
                {proposedBullets?.id === exp.id && (
                    <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 md:p-8 rounded-[2.5rem]"
                    >
                    <div className={`w-full max-w-3xl glass border rounded-[2rem] p-8 shadow-2xl flex flex-col h-full md:h-auto max-h-full overflow-hidden ${isDark ? 'border-cyan-500/50 bg-slate-900 shadow-cyan-900/20' : 'border-cyan-500/50 bg-white shadow-cyan-200/50'}`}>
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 mb-6 gap-4" style={{ borderColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,1)' }}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                                    <i className="fas fa-wand-magic-sparkles text-lg animate-pulse"></i>
                                </div>
                                <div>
                                    <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Enhancement</h3>
                                    <p className={`text-[10px] font-medium ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Optimized for Impact & ATS</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDiscard} 
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${isDark ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                                >
                                    <i className="fas fa-times"></i> Discard
                                </motion.button>
                                
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAIRefine(exp.id)} 
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${isDark ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-cyan-200 text-cyan-600 hover:bg-cyan-50'}`}
                                >
                                    <i className="fas fa-rotate-right"></i> Regenerate
                                </motion.button>

                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAccept} 
                                    className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-check"></i> Accept Changes
                                </motion.button>
                            </div>
                        </div>

                        {/* List */}
                        <motion.ul 
                            initial="hidden"
                            animate="visible"
                            className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1"
                        >
                            {proposedBullets.bullets.map((b, i) => (
                            <motion.li 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={i} 
                                className={`flex gap-4 text-sm md:text-base leading-relaxed p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                            >
                                <span className="text-emerald-500 mt-1 shrink-0"><i className="fas fa-check-circle text-lg"></i></span>
                                {b}
                            </motion.li>
                            ))}
                        </motion.ul>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
            ))}
            </AnimatePresence>
        </motion.div>
      </LayoutGroup>

        {experiences.length === 0 && (
          <motion.button 
            whileHover={{ scale: 1.01 }}
            onClick={addExperience} 
            className={`w-full py-24 glass rounded-[3rem] border-dashed border-2 flex flex-col items-center justify-center group transition-all ${
              isDark 
                ? 'border-slate-800 text-slate-500 hover:border-cyan-500 hover:text-cyan-500 hover:bg-slate-900/50' 
                : 'border-slate-300 text-slate-400 hover:border-cyan-500 hover:text-cyan-600 hover:bg-white'
            }`}
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all shadow-xl ${isDark ? 'bg-slate-900 shadow-black/20' : 'bg-white shadow-slate-200'}`}>
              <i className="fas fa-briefcase text-4xl opacity-50 group-hover:opacity-100 transition-opacity"></i>
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-base">Add First Experience</span>
          </motion.button>
        )}

      <div className="flex justify-between mt-20">
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
           <span className="relative z-10">Next: Education</span>
           <i className="fas fa-arrow-right relative z-10 group-hover:translate-x-1 transition-transform"></i>
        </motion.button>
      </div>
    </div>
  );
};

export default ExperienceForm;