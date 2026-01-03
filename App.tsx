import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResumeData, 
  ResumePurpose, 
  User
} from './types';
import { analyzeResume } from './services/geminiService';
import { onAuthChange, logoutUser } from './services/authService';
import StepIndicator from './components/StepIndicator';
import PersonalInfoForm from './components/forms/PersonalInfoForm';
import ExperienceForm from './components/forms/ExperienceForm';
import EducationForm from './components/forms/EducationForm';
import ProjectsForm from './components/forms/ProjectsForm';
import SkillsForm from './components/forms/SkillsForm';
import SummaryForm from './components/forms/SummaryForm';
import Preview from './components/Preview';
import Welcome from './components/Welcome';
import LaunchScreen from './components/LaunchScreen'; 
import Background from './components/Background';
import AuthModal from './components/AuthModal';

const INITIAL_DATA: ResumeData = {
  purpose: ResumePurpose.JOB,
  targetJobDescription: '',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    jobTitle: ''
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [
    { id: '1', name: 'Technical Skills', skills: [] },
    { id: '2', name: 'Soft Skills', skills: [] }
  ],
  certifications: [],
  achievements: [],
  themeColor: '#0ea5e9',
  backgroundColor: '#ffffff',
  templateId: 'modern',
  fontFamily: 'sans-serif',
  isManualMode: false,
  score: {
    ats: 0,
    readability: 0,
    depth: 0,
    feedback: []
  }
};

const App: React.FC = () => {
  const [step, setStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [isLaunching, setIsLaunching] = useState(false); 
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showContextHint, setShowContextHint] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  useEffect(() => {
    // 1. Load Local Data
    const saved = localStorage.getItem('resumeForgeData');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
    const savedTheme = localStorage.getItem('appTheme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);

    // 2. Initialize Real Auth Listener
    const unsubscribe = onAuthChange((currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            console.log("User session active:", currentUser.name);
        }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('resumeForgeData', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    document.body.className = `${theme} transition-colors duration-700 ease-in-out ${theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`;
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleUpdateData = (newData: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => Math.max(0, s - 1));
  const handleJumpToStep = (indicatorIdx: number) => {
    setStep(indicatorIdx + 1);
  };

  const handleStart = (purpose: ResumePurpose, manual: boolean) => {
    handleUpdateData({ purpose, isManualMode: manual });
    setStep(1);
  };

  const handleSkipAI = () => {
    setIsLaunching(true);
    setTimeout(() => {
        setIsLaunching(false);
        setStep(8);
    }, 2500); 
  };

  const handleRunAI = async () => {
    if (isLaunching) return; // prevent re-entrancy / duplicate runs
    setIsLaunching(true); 
    
    const minDelay = new Promise(resolve => setTimeout(resolve, 3500));
    
    try {
      const analysisPromise = analyzeResume(resumeData);
      
      const [analysis] = await Promise.all([analysisPromise, minDelay]);

      setResumeData(prev => {
        const newExp = prev.experience.map(exp => {
          const improved = analysis.improvedExperience?.find(i => i.id === exp.id);
          return improved ? { ...exp, description: improved.description } : exp;
        });
        const newProjects = prev.projects.map(proj => {
          const improved = analysis.improvedProjects?.find(i => i.id === proj.id);
          return improved ? { ...proj, description: improved.description } : proj;
        });
        return {
          ...prev,
          summary: analysis.summary || prev.summary,
          skills: analysis.optimizedSkills || prev.skills,
          experience: newExp,
          projects: newProjects,
          score: analysis.score
        };
      });
      
      setIsLaunching(false);
      setStep(8);
    } catch (error: any) {
      console.error("AI Optimization failed", error);
      setIsLaunching(false);
      // Auto-proceed to preview on AI failure (silently skip AI)
      setShowToast({ message: `AI optimization skipped: ${error.message}`, type: 'info' });
      setTimeout(() => setStep(8), 1500);
    }
  };

  const handleLoginSuccess = (newUser: User, fetchedData: Partial<ResumeData>) => {
      setUser(newUser); // Explicitly set user state to update UI immediately
      
      if (fetchedData && Object.keys(fetchedData).length > 0) {
          setResumeData(prev => ({
              ...prev,
              ...fetchedData,
              personalInfo: {
                  ...prev.personalInfo,
                  ...(fetchedData.personalInfo || {})
              },
              projects: fetchedData.projects ? [...prev.projects, ...fetchedData.projects] : prev.projects
          }));
          setShowToast({ message: `Synced with ${newUser.provider}! Data Updated.`, type: 'success' });
      } else {
        setShowToast({ message: `Welcome back, ${newUser.name}!`, type: 'success' });
      }
      setTimeout(() => setShowToast(null), 4000);
  };

  const handleLogout = async () => {
      await logoutUser();
      setUser(null);
      setShowToast({ message: 'Logged out successfully.', type: 'info' });
      setTimeout(() => setShowToast(null), 3000);
  };

  const renderStep = () => {
    switch(step) {
      case 0: return <Welcome onStart={handleStart} theme={theme} />;
      
      case 1: return (
        <PersonalInfoForm 
            data={resumeData.personalInfo} 
            onUpdate={(info) => handleUpdateData({ personalInfo: info })} 
            onNext={handleNext} 
            onBack={() => setStep(0)} 
            theme={theme} 
        />
      );

      case 2: return (
        <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0 py-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className={`text-5xl font-heading font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} drop-shadow-lg`}>
              <i className="fas fa-crosshairs mr-3 animate-pulse"></i>
              Target Role & Context
            </h2>
            <p className={`text-lg mt-4 font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Feed the AI! Paste the Job Description to unlock precision targeting.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -top-6 -right-6 z-30">
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowContextHint(!showContextHint)}
                    onMouseEnter={() => setShowContextHint(true)}
                    onMouseLeave={() => setShowContextHint(false)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all ${
                        showContextHint 
                        ? 'bg-cyan-400 text-white shadow-cyan-500/50' 
                        : (theme === 'dark' ? 'bg-slate-800 text-yellow-400 border-2 border-slate-700' : 'bg-white text-yellow-500 border-2 border-slate-200')
                    }`}
                >
                    <i className={`fas ${showContextHint ? 'fa-info' : 'fa-lightbulb'}`}></i>
                </motion.button>
                
                <AnimatePresence>
                    {showContextHint && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9, rotateX: -15 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9, rotateX: -15 }}
                            className={`absolute top-full right-0 mt-4 w-72 p-6 rounded-2xl shadow-2xl z-40 border origin-top-right ${theme === 'dark' ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-cyan-200'}`}
                        >
                            <div className="flex items-start gap-3">
                                <i className="fas fa-magic text-cyan-500 mt-1"></i>
                                <div>
                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Pro Tip</h4>
                                    <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Paste the <b>Responsibilities</b> and <b>Requirements</b> sections from the job post. The AI uses this to extract keywords and tailor your resume specifically for this role.
                                    </p>
                                </div>
                            </div>
                            <div className={`absolute -top-2 right-6 w-4 h-4 transform rotate-45 border-l border-t ${theme === 'dark' ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-cyan-200'}`}></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <textarea 
              className={`w-full h-64 border-4 rounded-[2rem] p-8 text-lg font-medium focus:outline-none transition-all duration-300 resize-none leading-relaxed shadow-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 text-slate-200 focus:border-cyan-400 focus:shadow-cyan-500/20' : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-500'}`}
              placeholder="Paste Job Description here... (e.g. 'We are looking for a React Developer...')"
              value={resumeData.targetJobDescription}
              onChange={(e) => handleUpdateData({ targetJobDescription: e.target.value })}
            />
          </motion.div>
          <div className="flex justify-between pt-6">
            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handlePrev} 
                className={`px-8 py-3 transition-colors font-black uppercase tracking-widest text-xs rounded-xl border-2 ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:border-cyan-500 hover:text-cyan-500' : 'border-slate-300 text-slate-400 hover:border-cyan-600 hover:text-cyan-600'}`}
            >
                Back
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 30px -10px rgba(6, 182, 212, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext} 
              className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/30 transition-all uppercase tracking-widest text-sm flex items-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
              <span className="relative z-10">Set Context</span> 
              <i className="fas fa-arrow-right text-lg relative z-10 group-hover:translate-x-1 transition-transform"></i>
            </motion.button>
          </div>
        </div>
      );
      
      case 3: return <SummaryForm summary={resumeData.summary} onUpdate={(s) => handleUpdateData({ summary: s })} onNext={handleNext} onBack={handlePrev} theme={theme} />;
      case 4: return <ExperienceForm experiences={resumeData.experience} onUpdate={(exp) => handleUpdateData({ experience: exp })} onNext={handleNext} onBack={handlePrev} theme={theme} />;
      case 5: return <EducationForm educations={resumeData.education} onUpdate={(edu) => handleUpdateData({ education: edu })} onNext={handleNext} onBack={handlePrev} theme={theme} />;
      case 6: return <ProjectsForm projects={resumeData.projects} onUpdate={(proj) => handleUpdateData({ projects: proj })} onNext={handleNext} onBack={handlePrev} theme={theme} />;
      case 7: return <SkillsForm skills={resumeData.skills} resumeData={resumeData} isManual={resumeData.isManualMode} onUpdate={(s) => handleUpdateData({ skills: s })} onNext={handleRunAI} onSkip={handleSkipAI} onBack={handlePrev} theme={theme} />;
      case 8: return <Preview data={resumeData} onBack={() => setStep(7)} onUpdate={handleUpdateData} theme={theme} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen pb-20 overflow-x-hidden selection:bg-cyan-500/30 font-sans`}>
      <Background theme={theme} />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${theme === 'dark' ? 'bg-slate-900 border-cyan-500 text-white' : 'bg-white border-cyan-400 text-slate-800'}`}
            >
                <i className={`fas ${showToast.type === 'success' ? 'fa-check-circle text-emerald-500' : (showToast.type === 'error' ? 'fa-exclamation-triangle text-red-500' : 'fa-info-circle text-cyan-500')}`}></i>
                <span className="text-xs font-bold uppercase tracking-wide">{showToast.message}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLoginSuccess}
        theme={theme}
      />

      <nav className="relative z-50 px-4 py-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 md:gap-4 group cursor-pointer"
          onClick={() => setStep(0)}
        >
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl md:rounded-3xl flex items-center justify-center shadow-lg border-2 md:border-4 border-white/20 backdrop-blur-md`}
          >
            <i className="fas fa-robot text-white text-lg md:text-3xl"></i>
          </motion.div>
          <div>
            <h1 className={`text-xl md:text-4xl font-heading font-black tracking-tighter transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Resume<span className="text-cyan-500">ForgeD</span>
            </h1>
            <span className={`hidden md:block text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>AI Powered</span>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-2 md:gap-4">
            {/* Login / User Profile Button */}
            {user ? (
                <div className="relative group">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-10 px-2 md:h-12 md:px-4 rounded-xl border-2 flex items-center gap-2 md:gap-3 transition-all ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                    >
                         {user.avatar ? (
                             <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full border border-cyan-500 object-cover" />
                         ) : (
                             <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                                 {user.name.charAt(0)}
                             </div>
                         )}
                         <span className="text-xs font-black uppercase tracking-widest hidden md:block max-w-[100px] truncate">{user.name}</span>
                         <i className="fas fa-chevron-down text-[10px] opacity-50 hidden md:block"></i>
                    </motion.button>
                    
                    {/* Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-48 py-2 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 glass border border-slate-700/50">
                        <div className="px-4 py-2 border-b border-white/10 mb-2">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Signed in as</p>
                             <p className="text-xs font-bold truncate">{user.email}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-sign-out-alt"></i> Sign Out
                        </button>
                    </div>
                </div>
            ) : (
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`h-10 px-3 md:h-12 md:px-6 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
                        theme === 'dark' 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-900/20' 
                        : 'bg-white text-slate-900 border border-slate-200 shadow-slate-200'
                    }`}
                    aria-label="Sign In"
                >
                    <i className="fas fa-user-astronaut text-sm"></i>
                    <span className="hidden md:inline">Sign In</span>
                </motion.button>
            )}

            <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center shadow-lg z-50 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-800'}`}
                aria-label="Toggle Theme"
            >
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg md:text-xl`}></i>
            </motion.button>
        </div>
      </nav>

      {step > 0 && step < 8 && !isLaunching && (
        <div className="relative z-40 max-w-4xl mx-auto px-6 mb-16 no-print mt-6">
          <StepIndicator 
            currentStep={step - 1} 
            totalSteps={7} 
            theme={theme} 
            onStepClick={handleJumpToStep} 
            data={resumeData}
          />
        </div>
      )}

      <main className="relative z-10 container mx-auto px-4 md:px-6">
        <AnimatePresence mode="wait" initial={false}>
          {isLaunching ? (
            <motion.div
                key="launch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="fixed inset-0 z-50"
            >
                <LaunchScreen theme={theme} />
            </motion.div>
          ) : (
            <motion.div 
                key={step} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20 
                }}
            >
                {renderStep()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;