import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../../types';
import { refineTextWithAI } from '../../services/geminiService';

interface Props {
  projects: Project[];
  onUpdate: (proj: Project[]) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'dark' | 'light';
}

const ProjectsForm: React.FC<Props> = ({ projects, onUpdate, onNext, onBack, theme }) => {
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [proposedProjectBullets, setProposedProjectBullets] = useState<{ id: string, bullets: string[] } | null>(null);
  const isDark = theme === 'dark';

  const addProject = () => {
    onUpdate([...projects, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      link: '',
      description: [''],
      techStack: []
    }]);
  };

  const removeProject = (id: string) => {
    onUpdate(projects.filter(p => p.id !== id));
  };

  const updateProj = (id: string, updates: Partial<Project>) => {
    onUpdate(projects.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const handleAIRefine = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    
    setRefiningId(id);
    setProposedProjectBullets(null);
    const combined = proj.description.filter(b => b.trim()).join("\n");
    const context = `Project: ${proj.name}`;
    
    try {
      const refined = await refineTextWithAI(combined, context);
      const newBullets = refined.split("\n")
        .filter(b => b.trim().length > 0)
        .map(b => b.replace(/^[•\-\*\d\.]+\s*/, '').trim());
      
      setProposedProjectBullets({ id, bullets: newBullets });
    } catch (err) {
      console.error(err);
    } finally {
      setRefiningId(null);
    }
  };

  const handleAccept = () => {
    if (proposedProjectBullets) {
      updateProj(proposedProjectBullets.id, { description: proposedProjectBullets.bullets });
      setProposedProjectBullets(null);
    }
  };

  const handleDiscard = () => {
    setProposedProjectBullets(null);
  };

  const updateBullet = (projId: string, bulletIdx: number, val: string) => {
    onUpdate(projects.map(p => {
      if (p.id === projId) {
        const newBullets = [...p.description];
        newBullets[bulletIdx] = val;
        return { ...p, description: newBullets };
      }
      return p;
    }));
  };

  const addBullet = (projId: string) => {
    onUpdate(projects.map(p => {
      if (p.id === projId) {
        return { ...p, description: [...p.description, ''] };
      }
      return p;
    }));
  };

  const inputClass = `w-full border rounded-2xl pl-6 p-5 text-base outline-none transition-all focus:ring-2 focus:ring-purple-500/20 ${
    isDark 
      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-purple-500' 
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500 focus:bg-white focus:shadow-md'
  }`;

  const labelClass = `text-xs uppercase font-black tracking-[0.2em] ml-1 mb-2 block ${
    isDark ? 'text-slate-500' : 'text-slate-500'
  }`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-12">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`text-4xl font-heading font-black ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Impactful Projects</motion.h2>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={addProject} 
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-black shadow-lg shadow-purple-500/30 transition-all uppercase tracking-widest text-xs flex items-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
          <i className="fas fa-plus relative z-10"></i> 
          <span className="relative z-10">Add Project</span>
        </motion.button>
      </div>

      <div className="space-y-12">
        {projects.map((proj, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            key={proj.id} 
            className={`glass p-10 rounded-[2.5rem] relative border-l-[6px] border-l-purple-500 shadow-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-300 shadow-slate-200'
            }`}
          >
            {/* Header Actions */}
            <div className="flex justify-end mb-6 gap-3">
              <button 
                onClick={() => handleAIRefine(proj.id)}
                disabled={refiningId === proj.id}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  refiningId === proj.id 
                    ? 'opacity-50' 
                    : isDark 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' 
                      : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-600 hover:text-white'
                }`}
              >
                <i className={`fas ${refiningId === proj.id ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                {refiningId === proj.id ? 'Thinking...' : 'AI Optimize'}
              </button>
              <button 
                onClick={() => removeProject(proj.id)} 
                className={`transition-colors px-3 py-2 rounded-lg border ${isDark ? 'border-slate-800 text-slate-600 hover:text-red-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200'}`}
              >
                <i className="fas fa-trash-alt text-lg"></i>
              </button>
            </div>
            
            <div className={`transition-all duration-300 ${proposedProjectBullets?.id === proj.id ? 'opacity-30 blur-sm grayscale' : ''}`}>
              <div className="grid md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-2 relative">
                  <label className={labelClass}>Project Name</label>
                  <input 
                    placeholder="e.g. E-Commerce Platform" 
                    value={proj.name} 
                    onChange={(e) => updateProj(proj.id, { name: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className={labelClass}>Deployment / GitHub Link</label>
                  <input 
                    placeholder="e.g. github.com/user/repo" 
                    value={proj.link} 
                    onChange={(e) => updateProj(proj.id, { link: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                      <i className="fas fa-code"></i>
                   </div>
                   <label className={labelClass} style={{marginBottom:0}}>Achievements & Tech Stack</label>
                </div>
                <div className="space-y-4">
                  {proj.description.map((bullet, idx) => (
                    <div key={idx} className="flex gap-4 items-center group">
                      <span className={`text-xl font-black ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>•</span>
                      <input 
                        value={bullet} 
                        onChange={(e) => updateBullet(proj.id, idx, e.target.value)}
                        className={`flex-1 bg-transparent border-b py-3 text-base outline-none font-medium transition-all ${
                          isDark 
                            ? 'border-slate-800 focus:border-purple-500 text-slate-300' 
                            : 'border-slate-300 focus:border-purple-600 text-slate-800'
                        }`} 
                        placeholder="Describe your technical contribution..."
                      />
                      {proj.description.length > 1 && (
                        <button 
                          onClick={() => { const nb = [...proj.description]; nb.splice(idx, 1); updateProj(proj.id, { description: nb }); }} 
                          className={`opacity-0 group-hover:opacity-100 p-2 transition-all ${isDark ? 'text-slate-600 hover:text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => addBullet(proj.id)} 
                  className={`text-xs font-black uppercase tracking-widest mt-6 flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'text-purple-400 bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10' 
                      : 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <i className="fas fa-plus-circle"></i> Add Point
                </button>
              </div>
            </div>

            <AnimatePresence>
              {proposedProjectBullets?.id === proj.id && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-8 bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem]"
                >
                  <div className={`w-full max-w-3xl glass border rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 max-h-full overflow-hidden ${isDark ? 'border-purple-500/50 bg-slate-900 shadow-purple-900/20' : 'border-purple-500/50 bg-white shadow-purple-200/50'}`}>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 gap-4" style={{ borderColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,1)' }}>
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                              <i className="fas fa-wand-magic-sparkles text-lg animate-pulse"></i>
                          </div>
                          <div>
                              <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Refinement</h3>
                              <p className={`text-[10px] font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Maximized for Technical Impact</p>
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
                                onClick={() => handleAIRefine(proj.id)} 
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${isDark ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                            >
                                <i className="fas fa-rotate-right"></i> Regenerate
                            </motion.button>

                          <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleAccept} 
                              className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
                          >
                              <i className="fas fa-check"></i> Accept Changes
                          </motion.button>
                       </div>
                    </div>

                    {/* Content */}
                    <motion.ul 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1"
                    >
                       {proposedProjectBullets.bullets.map((b, i) => (
                         <motion.li variants={itemVariants} key={i} className={`flex gap-4 text-sm md:text-base font-medium leading-relaxed p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                           <span className="text-purple-500 font-black shrink-0">•</span>
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

        {projects.length === 0 && (
          <motion.button 
            whileHover={{ scale: 1.01 }}
            onClick={addProject} 
            className={`w-full text-center py-24 glass rounded-[3rem] border-dashed border-2 flex flex-col items-center justify-center group transition-all ${
              isDark 
                ? 'border-slate-800 text-slate-500 hover:border-purple-500 hover:bg-slate-900/50' 
                : 'border-slate-300 text-slate-400 hover:border-purple-500 hover:bg-white'
            }`}
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl transition-all ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              <i className="fas fa-laptop-code text-4xl opacity-50 group-hover:opacity-100 transition-opacity text-purple-500"></i>
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-base">Add First Project</span>
          </motion.button>
        )}
      </div>

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
           <span className="relative z-10">Next: Skills</span>
           <i className="fas fa-arrow-right relative z-10 group-hover:translate-x-1 transition-transform"></i>
        </motion.button>
      </div>
    </div>
  );
};

export default ProjectsForm;