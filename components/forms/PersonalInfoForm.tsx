import React from 'react';
import { motion, Variants } from 'framer-motion';
import { PersonalInfo } from '../../types';

interface Props {
  data: PersonalInfo;
  onUpdate: (info: PersonalInfo) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'dark' | 'light';
}

const PersonalInfoForm: React.FC<Props> = ({ data, onUpdate, onNext, onBack, theme }) => {
  const isDark = theme === 'dark';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...data, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...data, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2 className={`text-5xl font-heading font-black mb-2 transition-colors ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Who Are You?</h2>
        <p className={`text-lg font-bold mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Let's introduce you to the world.</p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid md:grid-cols-4 gap-8 mb-12`}
      >
        {/* Photo Section */}
        <motion.div 
            variants={itemVariants}
            className={`glass p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center justify-center md:col-span-1 shadow-xl hover:shadow-2xl ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white'}`}
        >
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Profile Pic</p>
          
          <div className="relative group w-32 h-32 mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="w-full h-full relative z-10">
                {data.photoUrl ? (
                <img src={data.photoUrl} alt="Preview" className="w-full h-full rounded-full object-cover border-4 border-cyan-500 shadow-lg" />
                ) : (
                <div className={`w-full h-full rounded-full border-4 border-dashed flex items-center justify-center transition-colors ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                    <i className={`fas fa-user-astronaut text-4xl ${isDark ? 'text-slate-600' : 'text-slate-300'}`}></i>
                </div>
                )}
            </motion.div>
            
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload" />
            <motion.label 
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                htmlFor="photo-upload" 
                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center cursor-pointer shadow-lg z-20 border-4 border-white dark:border-slate-900"
            >
              <i className="fas fa-camera text-sm"></i>
            </motion.label>
          </div>

          {data.photoUrl && (
            <button onClick={() => onUpdate({ ...data, photoUrl: undefined })} className={`text-[10px] font-black uppercase tracking-widest hover:underline ${isDark ? 'text-red-400' : 'text-red-500'}`}>
              Remove
            </button>
          )}
        </motion.div>

        {/* Main Info Grid */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Full Name', name: 'fullName', placeholder: 'e.g. Tony Stark', icon: 'fa-user' },
            { label: 'Target Job Title', name: 'jobTitle', placeholder: 'e.g. Iron Man', icon: 'fa-briefcase' },
            { label: 'Email Address', name: 'email', placeholder: 'tony@stark.com', icon: 'fa-envelope' },
            { label: 'Phone', name: 'phone', placeholder: '+1 555 000 0000', icon: 'fa-phone' },
            { label: 'Location', name: 'location', placeholder: 'Malibu, CA', icon: 'fa-map-pin' },
            { label: 'LinkedIn', name: 'linkedin', placeholder: 'linkedin.com/in/tony', icon: 'fa-brands fa-linkedin-in' }
          ].map((field) => (
            <motion.div variants={itemVariants} key={field.name} className="space-y-2 group">
              <label className={`text-[10px] uppercase font-black tracking-widest ml-3 ${isDark ? 'text-slate-500 group-focus-within:text-cyan-400' : 'text-slate-500 group-focus-within:text-cyan-600'} transition-colors`}>
                {field.label}
              </label>
              <div className="relative">
                <motion.div 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-slate-500 group-focus-within:bg-cyan-500 group-focus-within:text-white' : 'bg-slate-100 text-slate-400 group-focus-within:bg-cyan-500 group-focus-within:text-white'}`}
                >
                    <i className={`fas ${field.icon} text-sm`}></i>
                </motion.div>
                <input 
                  name={field.name} 
                  // @ts-ignore
                  value={data[field.name]} 
                  onChange={handleChange} 
                  className={`w-full border-2 rounded-2xl pl-16 pr-5 py-4 text-base font-bold outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 focus:shadow-xl'
                  }`} 
                  placeholder={field.placeholder} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-between mt-10">
        <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={onBack} 
            className={`px-8 py-3 transition-colors font-black uppercase tracking-widest text-xs rounded-xl border-2 ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:border-cyan-500 hover:text-cyan-500' : 'border-slate-300 text-slate-400 hover:border-cyan-600 hover:text-cyan-600'}`}
        >
            Back
        </motion.button>
        <motion.button 
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 30px -10px rgba(6, 182, 212, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext} 
            className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/30 transition-all uppercase tracking-widest text-sm flex items-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
          <span className="relative z-10">Next Step</span> 
          <i className="fas fa-arrow-right text-lg relative z-10 group-hover:translate-x-1 transition-transform"></i>
        </motion.button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;