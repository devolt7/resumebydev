import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { loginWithProvider } from '../services/authService';
import { isConfigured, saveFirebaseConfig, resetFirebaseConfig } from '../services/firebaseConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, data: any) => void;
  theme: 'dark' | 'light';
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin, theme }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [configJson, setConfigJson] = useState('');
  
  const isDark = theme === 'dark';

  const handleLogin = async (provider: 'google' | 'github' | 'meta') => {
    setIsLoading(provider);
    setErrorMsg(null);
    try {
      const { user, data } = await loginWithProvider(provider);
      onLogin(user, data);
      onClose();
    } catch (error: any) {
      console.error("Login failed", error);
      setErrorMsg(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleSaveConfig = () => {
      try {
          // Attempt to clean input if user pasted "const firebaseConfig = {...}"
          let cleanStr = configJson.trim();
          if (cleanStr.includes('=')) {
              cleanStr = cleanStr.substring(cleanStr.indexOf('=') + 1);
          }
          if (cleanStr.endsWith(';')) {
              cleanStr = cleanStr.slice(0, -1);
          }
          
          const config = JSON.parse(cleanStr);
          if (!config.apiKey || !config.authDomain) {
              throw new Error("Invalid Config: Missing apiKey or authDomain");
          }
          saveFirebaseConfig(config);
      } catch (e) {
          setErrorMsg("Invalid JSON format. Please copy the object directly from Firebase Console.");
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? 'bg-slate-900 border-cyan-500/30 shadow-cyan-500/10' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            {/* Background Decoration */}
            <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 ${isDark ? 'bg-cyan-500' : 'bg-blue-500'}`}></div>

            {!showConfigInput ? (
                <>
                    <div className="text-center mb-8 relative z-10">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                        <i className="fas fa-fingerprint"></i>
                    </div>
                    <h2 className={`text-2xl font-heading font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Identify Yourself
                    </h2>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Connect to the ecosystem to sync your professional data.
                    </p>
                    
                    {!isConfigured ? (
                        <button 
                            onClick={() => setShowConfigInput(true)}
                            className="mt-4 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-colors"
                        >
                            <i className="fas fa-flask mr-2"></i> Demo Mode • Click to Setup Real Auth
                        </button>
                    ) : (
                        <div className="mt-4 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                             <span><i className="fas fa-link mr-1"></i> Real Auth Active</span>
                             <button onClick={resetFirebaseConfig} className="hover:text-emerald-300 underline ml-2">Reset</button>
                        </div>
                    )}
                    </div>

                    {errorMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold text-center"
                        >
                            {errorMsg}
                        </motion.div>
                    )}

                    <div className="space-y-4 relative z-10">
                    {/* Google */}
                    <button 
                        onClick={() => handleLogin('google')}
                        disabled={!!isLoading}
                        className={`w-full py-4 px-6 rounded-xl border flex items-center gap-4 transition-all group ${
                        isDark 
                            ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/50 text-white' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-400 text-slate-800'
                        }`}
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            {isLoading === 'google' ? <i className="fas fa-circle-notch fa-spin text-cyan-500"></i> : <i className="fab fa-google text-lg"></i>}
                        </div>
                        <span className="font-bold text-sm tracking-wide">Continue with Google</span>
                        <i className="fas fa-arrow-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
                    </button>

                    {/* GitHub */}
                    <button 
                        onClick={() => handleLogin('github')}
                        disabled={!!isLoading}
                        className={`w-full py-4 px-6 rounded-xl border flex items-center gap-4 transition-all group ${
                        isDark 
                            ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/50 text-white' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-400 text-slate-800'
                        }`}
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            {isLoading === 'github' ? <i className="fas fa-circle-notch fa-spin text-cyan-500"></i> : <i className="fab fa-github text-lg"></i>}
                        </div>
                        <span className="font-bold text-sm tracking-wide">Continue with GitHub</span>
                        <i className="fas fa-arrow-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
                    </button>

                    {/* Meta */}
                    <button 
                        onClick={() => handleLogin('meta')}
                        disabled={!!isLoading}
                        className={`w-full py-4 px-6 rounded-xl border flex items-center gap-4 transition-all group ${
                        isDark 
                            ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/50 text-white' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-400 text-slate-800'
                        }`}
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            {isLoading === 'meta' ? <i className="fas fa-circle-notch fa-spin text-cyan-500"></i> : <i className="fab fa-meta text-lg text-blue-500"></i>}
                        </div>
                        <span className="font-bold text-sm tracking-wide">Continue with Meta</span>
                        <i className="fas fa-arrow-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
                    </button>
                    </div>

                    <div className="mt-8 text-center">
                    <button onClick={onClose} className={`text-xs font-black uppercase tracking-widest hover:underline ${isDark ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-400 hover:text-cyan-600'}`}>
                        Continue as Guest
                    </button>
                    </div>
                </>
            ) : (
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => setShowConfigInput(false)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Setup Real Auth</h3>
                    </div>

                    <p className={`text-xs font-medium mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        To enable real sign-in, create a project at <a href="https://console.firebase.google.com" target="_blank" className="text-cyan-500 hover:underline">console.firebase.google.com</a>, enable Auth (Google/GitHub), and paste the <code>firebaseConfig</code> object below.
                    </p>

                    {errorMsg && (
                        <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-[10px] font-bold">
                            {errorMsg}
                        </div>
                    )}

                    <textarea 
                        className={`w-full flex-1 min-h-[150px] p-4 rounded-xl text-xs font-mono border outline-none mb-4 resize-none ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500'}`}
                        placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "...",
  "projectId": "...",
  ...
}`}
                        value={configJson}
                        onChange={(e) => setConfigJson(e.target.value)}
                    />

                    <button 
                        onClick={handleSaveConfig}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg"
                    >
                        Save & Reload
                    </button>
                </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;