import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ResumePurpose } from '../types';

interface WelcomeProps {
  onStart: (purpose: ResumePurpose, manual: boolean) => void;
  theme: 'dark' | 'light';
}

// --- SYSTEM STATUS BADGE (STATIC) ---
const SystemStatusHUD = ({ theme }: { theme: 'dark' | 'light' }) => {
    const isDark = theme === 'dark';

    return (
        <div className="relative inline-block z-50 mb-10 select-none">
            {/* Static Status Pill */}
            <div className={`relative flex items-center gap-3 px-5 py-2 rounded-full border ${
                isDark 
                    ? 'bg-slate-950/80 border-cyan-500/30 text-cyan-400' 
                    : 'bg-white/80 border-cyan-500/30 text-cyan-700'
            }`}>
                {/* Pulsing Dot */}
                <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </div>
                
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">
                    ResumeForgeD Ready
                </span>
            </div>
        </div>
    );
};

// --- REFINED HOLOGRAPHIC CARD ---
interface HolographicCardProps {
    item: { icon: string; title: string; type: ResumePurpose; desc: string; color: string };
    onClick: () => void;
    theme: 'dark' | 'light';
    index: number;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ 
    item, 
    onClick, 
    theme, 
    index 
}) => {
    const isDark = theme === 'dark';
    const ref = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse Physics for 3D Tilt (Subtle)
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]); // Reduced tilt
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]); // Reduced tilt
    
    // Dynamic Glare
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            style={{ 
                rotateX, 
                rotateY, 
                transformStyle: "preserve-3d",
                perspective: 1000 
            }}
            className={`relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[1/1.15] rounded-[2rem] border transition-all duration-300 group flex flex-col items-center justify-between p-6 overflow-hidden ${
                isDark 
                    ? 'bg-slate-950/90 border-slate-700' // Sharper background
                    : 'bg-white border-slate-200 shadow-xl'
            }`}
        >
             {/* Subtle Border Highlight on Hover */}
             <div className={`absolute inset-0 rounded-[2rem] transition-all duration-500 opacity-0 group-hover:opacity-100 ${
                 isDark ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-cyan-400 shadow-lg'
             } border-2 pointer-events-none`} />

            {/* Glare Effect Overlay */}
            <motion.div 
                className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none z-0 mix-blend-overlay"
                style={{
                    background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4), transparent 70%)`
                }}
            />

            {/* Corner Brackets */}
            <>
                <motion.div 
                    animate={{ width: isHovered ? 15 : 0, height: isHovered ? 15 : 0, opacity: isHovered ? 1 : 0 }}
                    className={`absolute top-6 left-6 border-t-2 border-l-2 rounded-tl-md transition-colors z-20 ${isDark ? 'border-cyan-500' : 'border-cyan-600'}`} 
                />
                <motion.div 
                    animate={{ width: isHovered ? 15 : 0, height: isHovered ? 15 : 0, opacity: isHovered ? 1 : 0 }}
                    className={`absolute top-6 right-6 border-t-2 border-r-2 rounded-tr-md transition-colors z-20 ${isDark ? 'border-cyan-500' : 'border-cyan-600'}`} 
                />
                <motion.div 
                    animate={{ width: isHovered ? 15 : 0, height: isHovered ? 15 : 0, opacity: isHovered ? 1 : 0 }}
                    className={`absolute bottom-6 left-6 border-b-2 border-l-2 rounded-bl-md transition-colors z-20 ${isDark ? 'border-cyan-500' : 'border-cyan-600'}`} 
                />
                <motion.div 
                    animate={{ width: isHovered ? 15 : 0, height: isHovered ? 15 : 0, opacity: isHovered ? 1 : 0 }}
                    className={`absolute bottom-6 right-6 border-b-2 border-r-2 rounded-br-md transition-colors z-20 ${isDark ? 'border-cyan-500' : 'border-cyan-600'}`} 
                />
            </>

            {/* Top Status Dots */}
            <div className="w-full flex justify-between items-center relative z-20 px-2 pt-2">
                <div className="flex gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isHovered ? 'bg-cyan-400' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors delay-75 ${isHovered ? 'bg-cyan-400' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                </div>
            </div>

            {/* Central Icon */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                
                <motion.div 
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg border transition-all duration-300 relative overflow-hidden ${
                        isDark 
                            ? 'bg-slate-900 border-slate-700 text-white' 
                            : 'bg-white border-slate-200 text-slate-800'
                    }`}
                    animate={{ 
                        scale: isHovered ? 1.05 : 1, // Subtle scale instead of move
                        borderColor: isHovered ? (isDark ? '#22d3ee' : '#0891b2') : (isDark ? '#334155' : '#e2e8f0'),
                        boxShadow: isHovered ? (isDark ? '0 0 25px -5px rgba(34,211,238,0.2)' : '0 10px 30px -5px rgba(8,145,178,0.2)') : 'none'
                    }}
                >
                    <i className={`fas ${item.icon} relative z-10`}></i>
                </motion.div>
                
                <div className="mt-8 text-center">
                    <h3 className={`text-xl font-heading font-black uppercase tracking-tight transition-colors ${
                        isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-600'
                    }`}>
                        {item.title}
                    </h3>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isHovered ? 30 : 0 }}
                        className="h-0.5 bg-cyan-500 mx-auto mt-3 rounded-full"
                    />
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-3 transition-colors ${
                        isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>
                        {item.desc}
                    </p>
                </div>
            </div>
            
        </motion.button>
    );
};

const Welcome: React.FC<WelcomeProps> = ({ onStart, theme }) => {
  const [selectedPurpose, setSelectedPurpose] = useState<ResumePurpose | null>(null);
  const isDark = theme === 'dark';

  const purposes = [
    { icon: 'fa-briefcase', title: 'First Job', type: ResumePurpose.JOB, desc: 'Entry Level', color: 'bg-blue-500' },
    { icon: 'fa-shuffle', title: 'Switch', type: ResumePurpose.SWITCH, desc: 'Career Pivot', color: 'bg-purple-500' },
    { icon: 'fa-graduation-cap', title: 'Internship', type: ResumePurpose.INTERNSHIP, desc: 'Student', color: 'bg-emerald-500' },
    { icon: 'fa-award', title: 'Pro', type: ResumePurpose.EXPERIENCED, desc: 'Senior Level', color: 'bg-amber-500' }
  ];

  return (
    <div className="max-w-5xl mx-auto text-center py-8 px-4 md:px-6 perspective-1000 min-h-[85vh] flex flex-col justify-center">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-12 relative z-50"
      >
        <SystemStatusHUD theme={theme} />
        
        <h1 className={`text-5xl md:text-7xl font-heading font-black tracking-tighter mb-4 leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Forge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Destiny.</span>
        </h1>
        
        <p className={`text-base md:text-lg font-medium max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Select your career stage to initialize the neural resume engine.
        </p>
      </motion.div>

      {/* CARDS GRID */}
      <AnimatePresence mode="wait">
        {!selectedPurpose ? (
            <motion.div 
                key="grid"
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full relative z-40"
            >
                {purposes.map((item, idx) => (
                    <HolographicCard 
                        key={item.title}
                        item={item}
                        index={idx}
                        theme={theme}
                        onClick={() => setSelectedPurpose(item.type)}
                    />
                ))}
            </motion.div>
        ) : (
            <motion.div 
                key="selection"
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 30 }}
                className="max-w-md mx-auto w-full relative z-40"
            >
                <div className={`glass p-8 md:p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden text-left ${
                    isDark 
                        ? 'bg-slate-900/90 border-slate-700 shadow-black/50' 
                        : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
                }`}>
                     {/* Decorative Elements */}
                     <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none ${purposes.find(p => p.type === selectedPurpose)?.color}`}></div>

                    <button 
                        onClick={() => setSelectedPurpose(null)} 
                        className={`group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-8 transition-colors ${
                            isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Selection
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border ${
                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                             <i className={`fas ${purposes.find(p => p.type === selectedPurpose)?.icon}`}></i>
                        </div>
                        <div>
                             <h3 className={`text-2xl font-heading font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                 {purposes.find(p => p.type === selectedPurpose)?.title}
                             </h3>
                             <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                 {purposes.find(p => p.type === selectedPurpose)?.desc} Mode
                             </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => onStart(selectedPurpose, false)}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] hover:shadow-cyan-500/25"
                        >
                            <i className="fas fa-wand-magic-sparkles"></i> Auto-Pilot (AI)
                        </button>
                        
                        <button 
                            onClick={() => onStart(selectedPurpose, true)}
                            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 border transition-all ${
                                isDark 
                                    ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' 
                                    : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <i className="fas fa-pen-nib"></i> Manual Entry
                        </button>
                    </div>

                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Welcome;