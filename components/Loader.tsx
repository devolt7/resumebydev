
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  theme?: 'dark' | 'light';
}

const Loader: React.FC<Props> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-32 h-32 mb-10">
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-cyan-500/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-t-4 border-cyan-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-brain text-4xl text-cyan-500"></i>
        </div>
      </div>
      
      <h3 className={`text-3xl font-heading font-black mb-4 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Generating Resume...</h3>
      <div className="max-w-md text-center space-y-3">
        <p className={`transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Our neural engine is optimizing your bullet points for ATS scanners.</p>
        <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  className="w-2 h-2 bg-cyan-500 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
            ))}
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
         <div className={`glass p-4 rounded-xl text-center border transition-all ${isDark ? 'border-slate-800' : 'border-slate-100 bg-white'}`}>
            <i className="fas fa-magnifying-glass text-cyan-500 mb-2"></i>
            <p className={`text-[9px] uppercase font-black tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scanning Keywords</p>
         </div>
         <div className={`glass p-4 rounded-xl text-center border transition-all ${isDark ? 'border-slate-800' : 'border-slate-100 bg-white'}`}>
            <i className="fas fa-pen-nib text-cyan-500 mb-2"></i>
            <p className={`text-[9px] uppercase font-black tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rewriting Bullets</p>
         </div>
         <div className={`glass p-4 rounded-xl text-center border transition-all ${isDark ? 'border-slate-800' : 'border-slate-100 bg-white'}`}>
            <i className="fas fa-chart-line text-cyan-500 mb-2"></i>
            <p className={`text-[9px] uppercase font-black tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Calculating Score</p>
         </div>
      </div>
    </div>
  );
};

export default Loader;
