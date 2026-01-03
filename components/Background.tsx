import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  theme: 'dark' | 'light';
}

// Generate random particles
const particles = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5
}));

const Background: React.FC<Props> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const x = Math.round((clientX / window.innerWidth) * 100);
      const y = Math.round((clientY / window.innerHeight) * 100);
      
      containerRef.current.style.setProperty('--mouse-x', `${x}%`);
      containerRef.current.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Dynamic Grid */}
      <div 
        ref={containerRef}
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: isDark 
            ? `linear-gradient(rgba(6, 182, 212, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.07) 1px, transparent 1px)`
            : `linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 60%)',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${isDark ? 'bg-cyan-400' : 'bg-blue-400'}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: isDark ? 0.3 : 0.2,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Ambient Blobs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-screen opacity-20 animate-blob ${isDark ? 'bg-cyan-600' : 'bg-blue-300'}`} />
      <div className={`absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen opacity-20 animate-blob animation-delay-2000 ${isDark ? 'bg-blue-700' : 'bg-purple-300'}`} />
      <div className={`absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-screen opacity-20 animate-blob animation-delay-4000 ${isDark ? 'bg-indigo-600' : 'bg-cyan-200'}`} />
    </div>
  );
};

export default Background;