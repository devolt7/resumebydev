import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillCategory, ResumeData } from '../../types';
import { getSkillSuggestions } from '../../services/geminiService';

interface Props {
  skills: SkillCategory[];
  resumeData: ResumeData;
  isManual: boolean;
  onUpdate: (s: SkillCategory[]) => void;
  onNext: () => void | Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  theme: 'dark' | 'light';
}

// --- VISUAL EFFECTS ---

// 1. The Floating Sparkles for the Button (Gold/Cartoon Style)
const YellowSparkles = () => {
    const stars = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 3,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        delay: Math.random() * 0.5
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute left-1/2 top-1/2 text-yellow-400 z-20"
                    style={{ width: star.size, height: star.size }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0, 1, 0], 
                        x: star.x * 2.5, 
                        y: star.y * 2.5,
                        scale: [0, 1.3, 0],
                        rotate: [0, 90, 180]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeOut"
                    }}
                >
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]">
                         <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                     </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 2. White Sparkles for Launch Button
const Sparkles = () => {
    const stars = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        delay: Math.random() * 0.5
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute left-1/2 top-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ width: star.size, height: star.size }}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ 
                        opacity: [0, 1, 0], 
                        x: star.x * 2, 
                        y: star.y * 2,
                        scale: [0, 1.2, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
};

// 3. NEW: Interactive Bar Sparkles (The requested animation)
const BarSparkles = ({ color }: { color: string }) => {
    // Generate random stars along the bar width
    const stars = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        size: Math.random() * 8 + 4
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute top-1/2 -translate-y-1/2 z-20"
                    style={{ left: star.left, color: color, width: star.size, height: star.size }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0, 1, 0], 
                        rotate: [0, 180] 
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut"
                    }}
                >
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
                         <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                     </svg>
                </motion.div>
            ))}
        </div>
    );
};

const SkillsForm: React.FC<Props> = ({ skills, resumeData, isManual, onUpdate, onNext, onSkip, onBack, theme }) => {
  const [newSkill, setNewSkill] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const isDark = theme === 'dark';

  // Flatten for suggestions logic only
  const allSkills = skills.flatMap(cat => cat.skills.map(s => ({ name: s, catId: cat.id })));

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const res = await getSkillSuggestions(resumeData);
      const combined = [...res.technical, ...res.soft];
      const currentSkillNames = new Set(allSkills.map(s => s.name.toLowerCase()));
      setSuggestions(combined.filter(s => !currentSkillNames.has(s.toLowerCase())));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []); 

  const handleAddSkill = (skillName: string) => {
    const value = skillName.trim();
    if (!value) return;
    
    // Duplication Check
    if (allSkills.some(s => s.name.toLowerCase() === value.toLowerCase())) return;

    // Default to first category (Technical) if exists, else create default
    const targetCatId = skills.length > 0 ? skills[0].id : 'default';
    
    let newSkillsData = [...skills];
    if (newSkillsData.length === 0) {
        newSkillsData = [{ id: 'default', name: 'Professional Skills', skills: [value] }];
    } else {
        newSkillsData = newSkillsData.map(cat => {
            if (cat.id === targetCatId) {
                return { ...cat, skills: [...cat.skills, value] };
            }
            return cat;
        });
    }

    onUpdate(newSkillsData);
    setNewSkill('');
    setSuggestions(prev => prev.filter(s => s.toLowerCase() !== value.toLowerCase()));
  };

  const removeSkill = (catId: string, skillName: string) => {
    onUpdate(skills.map(cat => {
      if (cat.id === catId) {
        return { ...cat, skills: cat.skills.filter(s => s !== skillName) };
      }
      return cat;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className={`text-5xl font-heading font-black tracking-tighter transition-colors mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Show Your Powers</h2>
            <p className={`text-lg font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add tools, languages, and soft skills.</p>
        </motion.div>
        
        {/* Refresh Suggestions Button */}
        <div className="relative group self-end md:self-auto">
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchSuggestions}
              disabled={isLoadingSuggestions}
              className={`flex items-center gap-2 px-6 py-3 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 relative overflow-hidden ${
                  isDark 
                    ? 'bg-slate-800 text-yellow-400 border-yellow-500/50 hover:border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]' 
                    : 'bg-white text-yellow-600 border-yellow-300 shadow-xl shadow-yellow-200/50 hover:border-yellow-500 hover:shadow-yellow-300'
              }`}
            >
              <YellowSparkles />
              <i className={`fas ${isLoadingSuggestions ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} relative z-10`}></i>
              <span className="relative z-10">{isLoadingSuggestions ? 'Scanning...' : 'Suggest More'}</span>
            </motion.button>
        </div>
      </div>

      {/* Main Unified Input Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass p-8 md:p-10 rounded-[2.5rem] border-2 shadow-2xl relative overflow-hidden flex flex-col gap-10 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-slate-200/50'}`}
      >
          {/* Background Decoration */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none ${isDark ? 'bg-cyan-500' : 'bg-blue-500'}`}></div>

          {/* Input Area */}
          <div className="relative z-10">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                    <input 
                        className={`w-full border-2 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none transition-all ${isDark ? 'bg-slate-950/50 border-slate-700 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-cyan-500'}`}
                        placeholder="Type a skill (e.g. React, Leadership) and press Enter..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(newSkill)}
                    />
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40 uppercase pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        ↵ Enter to Add
                    </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddSkill(newSkill)}
                  className={`w-16 rounded-2xl border-2 transition-all flex items-center justify-center text-xl shadow-lg ${isDark ? 'bg-cyan-500 text-white border-cyan-400 shadow-cyan-500/20' : 'bg-cyan-500 text-white border-cyan-600 shadow-cyan-200'}`}
                >
                  <i className="fas fa-plus"></i>
                </motion.button>
              </div>
          </div>

          {/* CATEGORY VISUALIZATION (With Progress Bars) */}
          <div className="grid grid-cols-1 gap-6 relative z-10">
              {skills.map((cat, idx) => {
                  // Calculate mock proficiency/completeness (cap at 100%)
                  const progress = Math.min((cat.skills.length / 10) * 100, 100); 
                  const barColor = idx % 2 === 0 ? (isDark ? '#22d3ee' : '#0891b2') : (isDark ? '#a78bfa' : '#7c3aed'); // Cyan vs Purple
                  const icon = idx % 2 === 0 ? 'fa-code' : 'fa-users';

                  return (
                      <motion.div 
                          key={cat.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover="hover"
                          className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                              isDark 
                                  ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80 hover:border-slate-600' 
                                  : 'bg-slate-50/50 border-slate-200 hover:bg-white hover:shadow-lg'
                          }`}
                      >
                          {/* Header & Progress Bar Row */}
                          <div className="flex flex-col gap-4 mb-4">
                              <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>
                                          <i className={`fas ${icon} text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}></i>
                                      </div>
                                      <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                          {cat.name}
                                      </h3>
                                  </div>
                                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {cat.skills.length} Skills Added
                                  </span>
                              </div>

                              {/* INTERACTIVE PROGRESS BAR */}
                              <div className={`h-3 w-full rounded-full overflow-hidden relative ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                                  {/* The Fill */}
                                  <motion.div 
                                      className="h-full relative"
                                      style={{ backgroundColor: barColor, boxShadow: `0 0 10px ${barColor}` }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                      variants={{
                                          hover: { 
                                              filter: 'brightness(1.3)',
                                              boxShadow: `0 0 20px ${barColor}, 0 0 40px ${barColor}`
                                          }
                                      }}
                                  >
                                      {/* Bar Sparkle Effects (Only show on hover) */}
                                      <motion.div variants={{ hover: { opacity: 1 }, initial: { opacity: 0 } }} className="absolute inset-0">
                                          <BarSparkles color={isDark ? '#fff' : '#fff'} />
                                      </motion.div>

                                      {/* Moving Light Glint */}
                                      <motion.div 
                                          className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                                          variants={{
                                              hover: { x: ['-100%', '500%'] },
                                              initial: { x: '-100%' }
                                          }}
                                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                      />
                                  </motion.div>
                              </div>
                          </div>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-2 pl-1">
                              <AnimatePresence>
                                  {cat.skills.map((skill) => (
                                      <motion.button
                                          key={skill}
                                          layout
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0, opacity: 0 }}
                                          onClick={() => removeSkill(cat.id, skill)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 group/tag transition-all ${
                                              isDark 
                                                  ? 'bg-slate-900 border-slate-600 text-slate-300 hover:border-red-500 hover:text-red-400' 
                                                  : 'bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-500 hover:shadow-sm'
                                          }`}
                                      >
                                          {skill}
                                          <i className="fas fa-times text-[10px] opacity-0 group-hover/tag:opacity-100 transition-opacity"></i>
                                      </motion.button>
                                  ))}
                              </AnimatePresence>
                              {cat.skills.length === 0 && (
                                  <span className="text-[10px] opacity-40 italic py-1">No skills in this category yet.</span>
                              )}
                          </div>
                      </motion.div>
                  );
              })}
              
              {skills.length === 0 && (
                 <div className="w-full py-10 flex flex-col items-center justify-center opacity-30 gap-2">
                    <i className="fas fa-layer-group text-4xl"></i>
                    <span className="text-sm font-black uppercase tracking-widest">No Categories Found</span>
                </div>
              )}
          </div>

          {/* AI Suggestions Area */}
          <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${isDark ? 'bg-cyan-900/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <i className={`fas fa-bolt ${isDark ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`}></i>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        {isLoadingSuggestions ? 'AI Analysis in Progress...' : 'Recommended for You'}
                    </h3>
                </div>

                {isLoadingSuggestions ? (
                  <div className="flex flex-wrap gap-2 relative z-10">
                     {[1,2,3,4,5].map(i => (
                        <motion.div 
                           key={i}
                           initial={{ opacity: 0.5 }}
                           animate={{ opacity: [0.3, 0.7, 0.3] }}
                           transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                           className={`h-8 w-24 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                        />
                     ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 relative z-10">
                    <AnimatePresence>
                      {suggestions.map((s, i) => (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.05, backgroundColor: isDark ? '#06b6d4' : '#0891b2', color: '#fff', borderColor: 'transparent' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddSkill(s)}
                          className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${isDark ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`}
                        >
                          <i className="fas fa-plus text-[8px] opacity-50"></i> {s}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                    {suggestions.length === 0 && !isLoadingSuggestions && (
                        <span className="text-xs opacity-50 italic pl-1">All recommendations added! Good job.</span>
                    )}
                  </div>
                )}
          </div>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-6">
        <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={onBack} 
            className={`w-full md:w-auto px-10 py-4 transition-colors font-black uppercase tracking-widest text-xs rounded-xl border-2 ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:border-cyan-500 hover:text-cyan-500' : 'border-slate-300 text-slate-400 hover:border-cyan-600 hover:text-cyan-600'}`}
        >
          Back
        </motion.button>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip} 
            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isManual ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-900/40' : (isDark ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white' : 'bg-white text-slate-500 border border-slate-300 hover:border-cyan-500 hover:text-cyan-600')}`}
          >
            {isManual ? 'Generate Preview' : 'Skip AI & Preview'}
          </motion.button>
          {!isManual && (
            <div className="relative group w-full md:w-auto">
                {/* Background Glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 opacity-70 blur-lg group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                
                {/* Main Button with White Sparkles */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onNext} 
                  className="relative w-full md:w-auto px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest overflow-hidden z-10"
                >
                  <Sparkles />
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-shimmer"></div>
                  Generate Resume <i className="fas fa-rocket"></i>
                </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;