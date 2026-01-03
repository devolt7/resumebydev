import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData } from '../types';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  theme: 'dark' | 'light';
  onStepClick: (stepIndex: number) => void;
  data: ResumeData;
}

const steps = [
  { label: "Personal", icon: "fa-user-astronaut" },
  { label: "Context", icon: "fa-crosshairs" },
  { label: "Summary", icon: "fa-file-signature" },
  { label: "Experience", icon: "fa-briefcase" },
  { label: "Education", icon: "fa-graduation-cap" },
  { label: "Projects", icon: "fa-rocket" },
  { label: "Skills", icon: "fa-bolt" }
];

type StepStatus = 'empty' | 'partial' | 'complete';

// --- STAR BURST ANIMATION COMPONENTS ---

const StarParticle: React.FC<{ delay: number }> = ({ delay }) => (
    <motion.div
        className="absolute left-1/2 top-1/2 text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.8)] z-0"
        initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
        animate={{ 
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            rotate: Math.random() * 360
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            delay: delay,
            ease: "circOut"
        }}
    >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
             <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
        </svg>
    </motion.div>
);

const StarBurstEffect = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-visible">
            {/* Exploding Stars */}
            {[...Array(12)].map((_, i) => (
                <StarParticle key={i} delay={i * 0.15} />
            ))}
        </div>
    );
};

// ----------------------------------------

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, theme, onStepClick, data }) => {
  const isDark = theme === 'dark';

  const getStepStatus = (index: number): StepStatus => {
    switch (index) {
      case 0: // Personal
        const { fullName, email, phone, jobTitle } = data.personalInfo;
        const filledCount = [fullName, email, phone, jobTitle].filter(f => f && f.trim().length > 0).length;
        if (filledCount === 0) return 'empty';
        if (filledCount < 4) return 'partial';
        return 'complete';

      case 1: // Context
        if (!data.targetJobDescription || data.targetJobDescription.trim().length === 0) return 'empty';
        return data.targetJobDescription.trim().length > 10 ? 'complete' : 'partial';

      case 2: // Summary
        if (!data.summary || data.summary.trim().length === 0) return 'empty';
        return data.summary.trim().length > 20 ? 'complete' : 'partial';

      case 3: // Experience
        if (data.experience.length === 0) return 'empty';
        const validExp = data.experience.filter(e => e.company && e.role);
        if (validExp.length === 0) return 'partial';
        return 'complete';

      case 4: // Education
        if (data.education.length === 0) return 'empty';
        const validEdu = data.education.filter(e => e.institution && e.degree);
        if (validEdu.length === 0) return 'partial';
        return 'complete';

      case 5: // Projects
        if (data.projects.length === 0) return 'empty';
        const validProj = data.projects.filter(p => p.name);
        if (validProj.length === 0) return 'partial';
        return 'complete';

      case 6: // Skills
        const totalSkills = data.skills.reduce((acc, cat) => acc + cat.skills.length, 0);
        return totalSkills > 0 ? 'complete' : 'empty';

      default: return 'empty';
    }
  };

  return (
    <div className="w-full relative px-4">
      {/* Progress Line - Centered Behind Circles */}
      <div className="absolute top-7 left-0 w-full h-1.5 -z-0 px-10">
        {/* Background Line */}
        <div className={`w-full h-full rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        
        {/* Animated Progress Bar */}
        <motion.div 
          initial={false}
          animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
          className={`absolute top-0 left-10 h-full rounded-full transition-colors duration-500 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600`}
          style={{ maxWidth: 'calc(100% - 5rem)' }} // Account for padding
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        />
      </div>

      {/* Steps Container */}
      <div className="flex justify-between items-start relative z-10">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const status = getStepStatus(idx);
          const isSkillsStep = step.label === "Skills";
          
          let borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
          let textColor = isDark ? 'text-slate-500' : 'text-slate-300';
          let bgColor = isDark ? 'bg-slate-800' : 'bg-white';
          
          if (isActive) {
            borderColor = 'border-white dark:border-slate-800';
            textColor = 'text-white';
            
            // Special styling for Skills step when active
            if (isSkillsStep) {
                bgColor = 'bg-yellow-500';
            } else {
                bgColor = 'bg-gradient-to-br from-cyan-400 to-blue-600';
            }
          } else if (isPast) {
            bgColor = 'bg-slate-800'; // Base for past items
            if (status === 'complete') {
                bgColor = 'bg-blue-600';
                textColor = 'text-white';
                borderColor = 'border-white dark:border-slate-800';
            } else if (status === 'partial') {
                bgColor = 'bg-amber-500';
                textColor = 'text-white';
                borderColor = 'border-white dark:border-slate-800';
            } else { // empty
                bgColor = 'bg-red-500';
                textColor = 'text-white';
                borderColor = 'border-white dark:border-slate-800';
            }
          }

          return (
            <div key={step.label} className="flex flex-col items-center flex-1 relative group cursor-pointer" onClick={() => onStepClick(idx)}>
              {/* Special Sparkle Burst for Active Skills Step - Positioned exactly over the button */}
              <AnimatePresence>
                {isActive && isSkillsStep && (
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-14 z-20 pointer-events-none flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <StarBurstEffect />
                    </motion.div>
                )}
              </AnimatePresence>

              {/* Clickable Circle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all relative shadow-xl border-4 z-10 ${bgColor} ${borderColor} ${textColor} ${isActive ? (isSkillsStep ? 'ring-4 ring-yellow-400/50 shadow-yellow-500/40' : 'ring-4 ring-cyan-500/30') : ''}`}
              >
                {/* Icon rendering */}
                <i className={`fas ${step.icon} ${isActive ? 'drop-shadow-md' : ''} ${isSkillsStep && isActive ? 'animate-pulse' : ''}`}></i>

                {/* Validation Badge */}
                {isPast && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 ${
                        status === 'complete' ? 'bg-emerald-500' : 
                        status === 'partial' ? 'bg-amber-100' : 'bg-white'
                    }`}
                  >
                    {status === 'complete' && <i className="fas fa-check text-[8px] text-white"></i>}
                    {status === 'partial' && <i className="fas fa-exclamation text-[8px] text-amber-600"></i>}
                    {status === 'empty' && <i className="fas fa-times text-[8px] text-red-500"></i>}
                  </motion.div>
                )}
                
                {/* Active Indicator Glow (Standard) - Only show if NOT Skills step (since Skills has custom burst) */}
                {isActive && !isSkillsStep && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl -z-10"
                  />
                )}
              </motion.button>

              {/* Label */}
              <span className={`text-[10px] mt-3 font-black uppercase tracking-widest hidden md:block transition-all duration-300 ${
                isActive 
                  ? (isSkillsStep 
                      ? 'text-yellow-500 scale-110 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' 
                      : (isDark ? 'text-cyan-400 scale-110' : 'text-cyan-600 scale-110'))
                  : isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;