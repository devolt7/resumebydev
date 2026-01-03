import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Education } from '../../types';
import { refineTextWithAI } from '../../services/geminiService';

interface Props {
  educations: Education[];
  onUpdate: (edu: Education[]) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'dark' | 'light';
}

const EducationForm: React.FC<Props> = ({ educations, onUpdate, onNext, onBack, theme }) => {
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [proposedEdu, setProposedEdu] = useState<{ id: string, institution: string, degree: string } | null>(null);
  const isDark = theme === 'dark';

  const addEducation = () => {
    onUpdate([...educations, {
      id: Math.random().toString(36).substr(2, 9),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      graduationDate: '',
      gpa: ''
    }]);
  };

  const removeEducation = (id: string) => {
    onUpdate(educations.filter(e => e.id !== id));
  };

  const updateEdu = (id: string, updates: Partial<Education>) => {
    onUpdate(educations.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleAIRefine = async (id: string) => {
    const edu = educations.find(e => e.id === id);
    if (!edu) return;
    
    setRefiningId(id);
    try {
      const refinedInst = await refineTextWithAI(edu.institution, "Educational Institution Name");
      const refinedDeg = await refineTextWithAI(edu.degree, "Degree or Certification Name");
      
      setProposedEdu({ id, institution: refinedInst, degree: refinedDeg });
    } catch (err) {
      console.error(err);
    } finally {
      setRefiningId(null);
    }
  };

  const handleAccept = () => {
    if (proposedEdu) {
      updateEdu(proposedEdu.id, { 
        institution: proposedEdu.institution, 
        degree: proposedEdu.degree 
      });
      setProposedEdu(null);
    }
  };

  const handleDiscard = () => {
    setProposedEdu(null);
  };

  const inputClass = `w-full border rounded-2xl pl-6 p-5 text-base outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${
    isDark 
      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-blue-500' 
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white focus:shadow-md'
  }`;

  const labelClass = `text-xs uppercase font-black tracking-[0.2em] ml-1 mb-2 block ${
    isDark ? 'text-slate-500' : 'text-slate-500'
  }`;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-12">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`text-4xl font-heading font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Education</motion.h2>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={addEducation} 
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all uppercase tracking-widest text-xs flex items-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
          <i className="fas fa-plus relative z-10"></i> 
          <span className="relative z-10">Add Education</span>
        </motion.button>
      </div>

      <div className="space-y-12">
        {educations.map((edu, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            key={edu.id} 
            className={`glass p-10 rounded-[2.5rem] relative border-l-[6px] border-l-blue-500 shadow-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-300 shadow-slate-200'
            }`}
          >
            {/* Header Actions - Moved out of absolute position */}
            <div className="flex justify-end mb-6 gap-3">
               <button 
                onClick={() => handleAIRefine(edu.id)}
                disabled={refiningId === edu.id || proposedEdu?.id === edu.id}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  refiningId === edu.id 
                    ? 'opacity-50' 
                    : isDark 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white' 
                      : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white'
                }`}
              >
                <i className={`fas ${refiningId === edu.id ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                {refiningId === edu.id ? 'Styling...' : 'AI Professionalize'}
              </button>
              <button 
                onClick={() => removeEducation(edu.id)}
                className={`transition-colors px-3 py-2 rounded-lg border ${isDark ? 'border-slate-800 text-slate-600 hover:text-red-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200'}`}
              >
                <i className="fas fa-trash-alt text-lg"></i>
              </button>
            </div>

            <div className={`transition-all duration-300 ${proposedEdu?.id === edu.id ? 'opacity-30 blur-sm grayscale' : ''}`}>
              <div className="grid md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-2 relative">
                  <label className={labelClass}>Institution Name</label>
                  <input 
                    placeholder="e.g. Stanford University" 
                    value={edu.institution} 
                    onChange={(e) => updateEdu(edu.id, { institution: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className={labelClass}>Degree / Certification</label>
                  <input 
                    placeholder="e.g. B.Tech Computer Science" 
                    value={edu.degree} 
                    onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className={labelClass}>Timeline</label>
                  <input 
                    placeholder="e.g. 2018 - 2022" 
                    value={edu.graduationDate} 
                    onChange={(e) => updateEdu(edu.id, { graduationDate: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className={labelClass}>GPA / Grade (Optional)</label>
                  <input 
                    placeholder="e.g. 9.8 CGPA" 
                    value={edu.gpa} 
                    onChange={(e) => updateEdu(edu.id, { gpa: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-2 relative md:col-span-2">
                  <label className={labelClass}>Location</label>
                  <input 
                    placeholder="e.g. Bangalore, India" 
                    value={edu.location} 
                    onChange={(e) => updateEdu(edu.id, { location: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {proposedEdu?.id === edu.id && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
                >
                  <div className={`w-full glass border rounded-3xl p-8 shadow-2xl flex flex-col gap-6 ${isDark ? 'border-blue-500 bg-slate-900' : 'border-blue-500 bg-white'}`}>
                     <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,1)' }}>
                        <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>AI PROFESSIONALIZED VIEW</span>
                        <div className="flex gap-4">
                           <button onClick={handleDiscard} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-500">Discard</button>
                           <button onClick={handleAccept} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500">Apply Styling</button>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Institution</div>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{proposedEdu.institution}</div>
                        <div className="text-xs text-slate-400 uppercase font-black tracking-widest pt-2">Degree</div>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{proposedEdu.degree}</div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {educations.length === 0 && (
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={addEducation} 
            className={`w-full text-center py-24 glass rounded-[3rem] border-dashed border-2 flex flex-col items-center justify-center group transition-all ${
              isDark 
                ? 'border-slate-800 text-slate-500 hover:border-blue-500 hover:bg-slate-900/50' 
                : 'border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-white'
            }`}
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl transition-all ${isDark ? 'bg-slate-900' : 'bg-white shadow-slate-200'}`}>
              <i className="fas fa-graduation-cap text-4xl opacity-50 group-hover:opacity-100 transition-opacity text-blue-500"></i>
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-sm">Add Education Details</span>
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
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all uppercase tracking-widest text-sm flex items-center gap-3 relative overflow-hidden group"
        >
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
           <span className="relative z-10">Next: Projects</span>
           <i className="fas fa-arrow-right relative z-10 group-hover:translate-x-1 transition-transform"></i>
        </motion.button>
      </div>
    </div>
  );
};

export default EducationForm;