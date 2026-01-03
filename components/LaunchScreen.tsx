import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  theme: 'dark' | 'light';
}

const PHASES = [
    "Synthesizing Career Profile...",
    "Analyzing Market Keywords...",
    "Optimizing ATS Structure...",
    "Calibrating Visual Hierarchy...",
    "Finalizing Document Assets..."
];

const LaunchScreen: React.FC<Props> = ({ theme }) => {
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
    const isActive = progress < 100;

  useEffect(() => {
    // Smooth Progress Curve
    const duration = 4000; 
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Ease out cubic function for smoother ending
      const easeOut = 1 - Math.pow(1 - currentStep / steps, 3); 
      const newProgress = Math.min(100, Math.floor(easeOut * 100));
      
      setProgress(newProgress);
      
      // Update phases based on progress thresholds
      if (newProgress > 20 && newProgress < 40) setPhaseIndex(1);
      else if (newProgress >= 40 && newProgress < 60) setPhaseIndex(2);
      else if (newProgress >= 60 && newProgress < 85) setPhaseIndex(3);
      else if (newProgress >= 85) setPhaseIndex(4);

      if (currentStep >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Calculate circle circumference for SVG stroke dasharray
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] text-white overflow-hidden flex flex-col items-center justify-center selection:bg-cyan-500/30">
        
        {/* 1. Deep Space Background with Subtle Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020617] to-black opacity-100" />
        <div className="absolute inset-0 opacity-[0.03]" 
            style={{ 
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
                backgroundSize: '100px 100px' 
            }}
        />
        
        {/* 2. Ambient Glow Orb */}
            <motion.div 
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"
        />

        {/* 3. Main Central Composition */}
        <div className="relative z-10 flex flex-col items-center">
            
            {/* The Neural Core */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                
                {/* Rotating Outer Geometric Ring (Dotted) */}
                <motion.div 
                    className="absolute inset-0 border border-dashed border-slate-700 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: isActive ? Infinity : 0, ease: "linear" }}
                />

                {/* Counter-Rotating Tech Ring (Thin) */}
                <motion.div 
                    className="absolute inset-4 border border-slate-800 rounded-full opacity-50"
                    style={{ borderTopColor: '#06b6d4', borderBottomColor: '#06b6d4' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: isActive ? Infinity : 0, ease: "linear" }}
                />

                {/* Progress Circle (SVG) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="2"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r={radius}
                        fill="transparent"
                        stroke="#06b6d4" // Cyan-500
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.1, ease: "linear" }}
                    />
                </svg>

                {/* Central Hexagon / Chip Metaphor */}
                <div className="absolute inset-0 flex items-center justify-center">
                     <motion.div 
                            animate={{ rotate: [0, 45, 90, 135, 180] }}
                            transition={{ duration: 10, repeat: isActive ? Infinity : 0, ease: "linear" }}
                        className="w-32 h-32 border border-cyan-900/50 flex items-center justify-center relative backdrop-blur-sm"
                        style={{ transform: 'rotate(45deg)' }} // Diamond shape
                     >
                        <motion.div 
                             className="w-20 h-20 bg-cyan-500/10 border border-cyan-400/30"
                                animate={{ scale: [1, 0.9, 1] }}
                                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                        />
                     </motion.div>
                </div>

                {/* Percentage Text (Centered) */}
                <div className="absolute z-20 flex flex-col items-center">
                    <span className="text-5xl font-heading font-bold text-white tracking-tighter mix-blend-overlay">
                        {progress}
                        <span className="text-2xl align-top opacity-50">%</span>
                    </span>
                </div>
            </div>

            {/* Status Text Area */}
            <div className="h-12 flex flex-col items-center justify-center overflow-hidden relative w-96 text-center">
                 <AnimatePresence mode='wait'>
                    <motion.p
                        key={phaseIndex}
                        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                        transition={{ duration: 0.4 }}
                        className="text-sm font-medium text-cyan-400 uppercase tracking-[0.3em]"
                    >
                        {PHASES[phaseIndex]}
                    </motion.p>
                 </AnimatePresence>
            </div>
            
            {/* Loading Bar Line */}
            <div className="w-64 h-[2px] bg-slate-800 mt-6 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                />
            </div>

        </div>

        {/* Footer Branding */}
        <div className="absolute bottom-10 opacity-30 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
            ResumeForgeD
        </div>

    </div>
  );
};

export default LaunchScreen;