import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, TemplateId } from '../types';
import TemplateGallery from './TemplateGallery';

interface Props {
  data: ResumeData;
  onBack: () => void;
  onUpdate: (d: Partial<ResumeData>) => void;
  theme: 'dark' | 'light';
}

// --- FONT LIBRARY ---
const PRESET_FONTS = [
  { name: 'System Default', value: 'sans-serif', category: 'Sans', url: '' },
  { name: 'Inter (Modern)', value: "'Inter', sans-serif", category: 'Sans', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
  { name: 'Merriweather (Serif)', value: "'Merriweather', serif", category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap' },
  { name: 'Playfair Display (Elegant)', value: "'Playfair Display', serif", category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap' },
  { name: 'Roboto (Clean)', value: "'Roboto', sans-serif", category: 'Sans', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' },
  { name: 'Montserrat (Geometric)', value: "'Montserrat', sans-serif", category: 'Sans', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap' },
  { name: 'Lato (Humanist)', value: "'Lato', sans-serif", category: 'Sans', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap' },
  { name: 'JetBrains Mono (Code)', value: "'JetBrains Mono', monospace", category: 'Mono', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&display=swap' },
  { name: 'Oswald (Strong)', value: "'Oswald', sans-serif", category: 'Display', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600&display=swap' },
  { name: 'Lora (Calligraphic)', value: "'Lora', serif", category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap' },
];

// --- HELPER FUNCTIONS ---
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  if (dateString.length > 4 && dateString.includes(' ')) return dateString;
  return dateString; 
};

const formatUrl = (url: string) => {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
};

// Robust Luminance Check for Auto-Text Color
const isDarkBackground = (bgColor: string) => {
  if (!bgColor) return false;
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;

  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return L <= 0.45; // Adjusted threshold
};

// ==================================================================================
// TEMPLATE 1: EXECUTIVE (AUTHORITY & CLASS)
// ==================================================================================
const ExecutiveTemplate = ({ data, isDark, accent }: { data: ResumeData, isDark: boolean, accent: string }) => {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const border = isDark ? 'border-white/20' : 'border-slate-300';
  const fontStyle = { fontFamily: data.fontFamily };

  return (
    <div className={`leading-tight p-8 flex flex-col gap-3 ${textPrimary}`} style={fontStyle}>
      {/* Header */}
      <div className={`flex items-center gap-6 border-b-2 pb-4 ${border}`} style={{ borderColor: accent }}>
        {data.personalInfo.photoUrl && (
          <img src={data.personalInfo.photoUrl} className="w-16 h-16 rounded-full object-cover border-2 shadow-md" style={{ borderColor: accent }} />
        )}
        <div className="flex-1">
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: isDark ? '#fff' : accent }}>
                {data.personalInfo.fullName}
            </h1>
            <p className={`text-xs mb-2 font-bold tracking-wider uppercase ${textSecondary}`}>{data.personalInfo.jobTitle}</p>
            
            <div className={`text-[10px] flex flex-wrap gap-4 font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {[data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email].filter(Boolean).map((item, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
                        {item}
                    </span>
                ))}
            </div>
            <div className={`text-[10px] mt-2 flex flex-wrap gap-4 font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
               {[data.personalInfo.linkedin, data.personalInfo.portfolio].filter(Boolean).map((link, i) => (
                  <a key={i} href={link} className="hover:underline flex items-center gap-1">
                      <i className="fas fa-link"></i> {formatUrl(link!)}
                  </a>
               ))}
            </div>
        </div>
      </div>

      {/* Sections */}
      {[
        { title: 'Professional Summary', content: data.summary },
        { title: 'Experience', items: data.experience },
        { title: 'Education', items: data.education },
        { title: 'Projects', items: data.projects },
        { title: 'Skills', items: data.skills }
      ].map((section) => {
        if (!section.content && (!section.items || (Array.isArray(section.items) && section.items.length === 0))) return null;

        return (
          <div key={section.title} className="mb-2">
            <h2 className={`text-xs font-bold uppercase tracking-[0.2em] border-b mb-4 pb-1 ${border}`} style={{ color: isDark ? '#fff' : accent }}>
                {section.title}
            </h2>
            
            {section.title === 'Professional Summary' && (
                <p className={`text-xs text-justify leading-relaxed ${textSecondary}`}>{section.content as string}</p>
            )}

            {section.title === 'Skills' && (
                <div className="text-xs space-y-2">
                    {(section.items as any[]).map((cat, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start pb-1">
                            <span className="font-bold w-32 shrink-0 mb-1 sm:mb-0">{cat.name}:</span>
                            <span className={`flex-1 ${textSecondary} leading-relaxed`}>{cat.skills.join(', ')}</span>
                        </div>
                    ))}
                </div>
            )}

            {section.title === 'Experience' && (section.items as any[]).map((item, i) => (
                <div key={i} className="mb-5">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-sm">{item.company}</span>
                        <span className={`text-[10px] font-bold ${textSecondary}`}>{item.startDate} – {item.endDate}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs italic font-bold" style={{ color: isDark ? '#a5f3fc' : accent }}>{item.role}</span>
                        <span className={`text-[10px] ${textSecondary}`}>{item.location}</span>
                    </div>
                    <ul className={`list-disc ml-4 text-xs space-y-1 pl-1 ${textSecondary}`}>
                        {item.description.map((b: string, idx: number) => b && <li key={idx} className="pl-1 marker:opacity-50 text-justify">{b}</li>)}
                    </ul>
                </div>
            ))}

            {section.title === 'Projects' && (section.items as any[]).map((item, i) => (
                <div key={i} className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <span className="font-bold text-sm">{item.name}</span>
                        {item.link && <span className={`text-[9px] italic opacity-70`}>{formatUrl(item.link)}</span>}
                    </div>
                    <div className={`text-[10px] mb-1 font-medium opacity-60`}>{item.techStack?.join(' | ')}</div>
                    <ul className={`list-disc ml-4 text-xs space-y-1 pl-1 ${textSecondary}`}>
                         {item.description.map((b: string, idx: number) => b && <li key={idx} className="pl-1 marker:opacity-50 text-justify">{b}</li>)}
                    </ul>
                </div>
            ))}
             {section.title === 'Education' && (section.items as any[]).map((item, i) => (
                <div key={i} className="mb-3 flex justify-between items-start">
                    <div>
                        <div className="font-bold text-sm">{item.institution}</div>
                        <div className={`text-xs italic ${textSecondary}`}>{item.degree}</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-[10px] font-bold ${textSecondary}`}>{item.graduationDate}</div>
                        {item.gpa && <div className={`text-[10px] opacity-70`}>GPA: {item.gpa}</div>}
                    </div>
                </div>
            ))}
          </div>
        )
      })}
    </div>
  );
};

// ==================================================================================
// TEMPLATE 2: MODERN (TECH PRIME)
// ==================================================================================
const ModernTemplate = ({ data, isDark, accent }: { data: ResumeData, isDark: boolean, accent: string }) => {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200';
  const fontStyle = { fontFamily: data.fontFamily };

  return (
    <div className={`p-6 flex flex-col gap-4 ${textPrimary}`} style={fontStyle}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-2 pb-3 gap-3" style={{ borderColor: accent }}>
            <div className="flex items-center gap-4 w-full">
                {data.personalInfo.photoUrl && (
                    <img src={data.personalInfo.photoUrl} className="w-16 h-16 rounded-xl object-cover shadow-lg" style={{ border: `2px solid ${accent}` }} />
                )}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tighter mb-0 leading-none" style={{ color: isDark ? '#fff' : accent }}>{data.personalInfo.fullName}</h1>
                    <p className={`text-sm font-medium tracking-wide ${textSecondary}`}>{data.personalInfo.jobTitle}</p>
                </div>
            </div>
            <div className="w-full md:w-auto text-left md:text-right text-[10px] space-y-0.5 font-medium opacity-80 min-w-max">
                <div className="flex items-center md:justify-end gap-2"><i className="fas fa-envelope text-[8px] w-3 text-center"></i> {data.personalInfo.email}</div>
                <div className="flex items-center md:justify-end gap-2"><i className="fas fa-phone text-[10px] w-4 text-center"></i> {data.personalInfo.phone}</div>
                <div className="flex items-center md:justify-end gap-2"><i className="fas fa-map-marker-alt text-[10px] w-4 text-center"></i> {data.personalInfo.location}</div>
                <div className="flex items-center md:justify-end gap-2">
                     {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin}><i className="fab fa-linkedin hover:scale-110 transition-transform"></i></a>}
                     {data.personalInfo.github && <a href={data.personalInfo.github}><i className="fab fa-github hover:scale-110 transition-transform"></i></a>}
                     {data.personalInfo.portfolio && <a href={data.personalInfo.portfolio}><i className="fas fa-globe hover:scale-110 transition-transform"></i></a>}
                </div>
            </div>
        </div>

        {/* Skills Grid (Top Priority) */}
        {data.skills.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.skills.map((cat, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${cardBg}`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {cat.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {cat.skills.map(skill => (
                                <span key={skill} className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${isDark ? 'bg-white/10 text-white' : 'bg-slate-800 text-white'}`}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        <div className="grid grid-cols-1 gap-10">
            {/* Experience */}
            {data.experience.length > 0 && (
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: accent }}>
                         <i className="fas fa-briefcase"></i> Experience
                    </h3>
                    <div className="space-y-6 border-l-2 pl-8 relative" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="relative group">
                                <div className="absolute -left-[39px] top-1.5 w-4 h-4 rounded-full border-4 transition-colors" style={{ borderColor: accent, backgroundColor: isDark ? '#000' : '#fff' }}></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-lg">{exp.role}</h4>
                                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 bg-current px-2 py-0.5 rounded text-white`}>{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <div className="text-xs font-bold mb-3 opacity-80 flex items-center gap-2">
                                    <i className="fas fa-building text-[10px]"></i> {exp.company}, {exp.location}
                                </div>
                                <ul className={`space-y-1.5 text-xs ${textSecondary}`}>
                                    {exp.description.map((b, idx) => b && <li key={idx} className="flex gap-2 text-justify leading-relaxed"><span className="opacity-50 mt-1.5 text-[6px]"><i className="fas fa-circle"></i></span> <span>{b}</span></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: accent }}>
                        <i className="fas fa-code-branch"></i> Projects
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {data.projects.map((proj, i) => (
                            <div key={i} className={`p-5 rounded-2xl border ${cardBg} hover:shadow-lg transition-shadow`}>
                                <div className="font-bold text-sm mb-2 flex justify-between items-center">
                                    {proj.name}
                                    {proj.link && <a href={proj.link} className="text-[10px] opacity-50 hover:opacity-100 hover:text-cyan-500"><i className="fas fa-external-link-alt"></i></a>}
                                </div>
                                <div className="text-[9px] font-bold uppercase tracking-wider opacity-50 mb-3 border-b pb-2 border-dashed border-current">{proj.techStack?.slice(0, 4).join(' • ')}</div>
                                <ul className={`text-[10px] space-y-1 ${textSecondary}`}>
                                    {proj.description.slice(0, 3).map((b, idx) => b && <li key={idx} className="truncate">• {b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {data.education.length > 0 && (
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: accent }}>
                        <i className="fas fa-graduation-cap"></i> Education
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {data.education.map((edu, i) => (
                            <div key={i} className={`p-4 rounded-xl border-l-4 ${cardBg}`} style={{ borderLeftColor: accent }}>
                                <div className="font-bold text-sm">{edu.institution}</div>
                                <div className={`text-xs ${textSecondary} font-medium`}>{edu.degree}</div>
                                <div className="flex justify-between items-center mt-2 opacity-60 text-[10px] font-mono">
                                    <span>{edu.graduationDate}</span>
                                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>
    </div>
  );
};

// ==================================================================================
// TEMPLATE 3: CREATIVE (ORBIT / SIDEBAR)
// ==================================================================================
const CreativeTemplate = ({ data, isDark, accent }: { data: ResumeData, isDark: boolean, accent: string }) => {
    const textPrimary = isDark ? 'text-white' : 'text-slate-800';
    const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
    const sidebarBg = isDark ? 'bg-white/5' : 'bg-slate-100';
    const fontStyle = { fontFamily: data.fontFamily };

    return (
        <div className={`flex ${textPrimary}`} style={fontStyle}>
            {/* Sidebar */}
            <div className={`w-[32%] p-4 flex flex-col gap-4 ${sidebarBg}`}>
                <div className="text-center">
                    {data.personalInfo.photoUrl ? (
                        <div className="relative inline-block mb-3 group">
                            <div className="absolute inset-0 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accent }}></div>
                            <img src={data.personalInfo.photoUrl} className="w-20 h-20 rounded-full relative z-10 object-cover border-2 border-white shadow-xl" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black border-2 opacity-50" style={{ borderColor: accent, color: accent }}>
                             {data.personalInfo.fullName.charAt(0)}
                        </div>
                    )}
                    <h1 className="text-2xl font-black uppercase leading-tight mb-2 tracking-tight" style={{ color: accent }}>{data.personalInfo.fullName}</h1>
                    <p className={`text-xs font-bold tracking-widest uppercase ${textSecondary}`}>{data.personalInfo.jobTitle}</p>
                </div>

                <div className="space-y-4 text-[11px] font-medium opacity-80">
                    <div className="h-px w-full bg-current opacity-20 mb-4"></div>
                    {data.personalInfo.email && <div className="flex items-center gap-3 break-all"><span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"><i className="fas fa-envelope"></i></span> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"><i className="fas fa-phone"></i></span> {data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"><i className="fas fa-map-marker-alt"></i></span> {data.personalInfo.location}</div>}
                    {data.personalInfo.linkedin && <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"><i className="fab fa-linkedin"></i></span> {formatUrl(data.personalInfo.linkedin)}</div>}
                    {data.personalInfo.portfolio && <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"><i className="fas fa-globe"></i></span> {formatUrl(data.personalInfo.portfolio)}</div>}
                </div>

                {data.education.length > 0 && (
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b-2 pb-2 inline-block" style={{ borderColor: accent }}>Education</h3>
                        {data.education.map((edu, i) => (
                            <div key={i} className="mb-6 last:mb-0">
                                <div className="font-bold text-sm leading-tight mb-1">{edu.institution}</div>
                                <div className={`text-[11px] ${textSecondary} mb-1`}>{edu.degree}</div>
                                <div className="text-[10px] opacity-50 font-mono bg-black/5 inline-block px-2 py-0.5 rounded">{edu.graduationDate}</div>
                            </div>
                        ))}
                    </div>
                )}

                {data.skills.length > 0 && (
                     <div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b-2 pb-2 inline-block" style={{ borderColor: accent }}>Skills</h3>
                        <div className="flex flex-col gap-4">
                            {data.skills.map((cat, i) => (
                                <div key={i}>
                                    <h4 className="text-[10px] font-bold opacity-50 mb-2 uppercase">{cat.name}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.skills.map(skill => (
                                            <span key={skill} className={`px-2 py-1 text-[10px] font-bold rounded ${isDark ? 'bg-white/10' : 'bg-white shadow-sm text-slate-700'}`}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 flex flex-col gap-10 pt-16">
                 {data.summary && (
                     <div className="relative">
                         <i className="fas fa-quote-left absolute -top-4 -left-4 text-4xl opacity-10" style={{ color: accent }}></i>
                         <h3 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: accent }}>Profile</h3>
                         <p className={`text-sm leading-loose ${textSecondary} relative z-10 text-justify`}>{data.summary}</p>
                     </div>
                 )}

                 {data.experience.length > 0 && (
                     <div>
                        <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-2" style={{ color: accent }}>Experience</h3>
                        <div className="space-y-10 border-l ml-2 pl-8 relative" style={{ borderColor: accent }}>
                            {data.experience.map((exp, i) => (
                                <div key={i} className="relative">
                                     <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full border-2 bg-white" style={{ borderColor: accent }}></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-lg">{exp.role}</h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-50">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className={`text-xs font-bold mb-4 uppercase tracking-wide opacity-70`}>{exp.company} • {exp.location}</div>
                                    <ul className={`text-xs space-y-2 list-none ${textSecondary}`}>
                                        {exp.description.map((b, idx) => b && <li key={idx} className="pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-current before:opacity-30 before:rounded-full">{b}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                {data.projects.length > 0 && (
                     <div>
                        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: accent }}>Projects</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {data.projects.map((proj, i) => (
                                <div key={i} className={`border-l-4 pl-6 py-2 transition-all hover:bg-black/5`} style={{ borderColor: accent }}>
                                    <div className="font-bold text-sm mb-1">{proj.name}</div>
                                    <div className={`text-[10px] font-bold opacity-40 mb-3 uppercase tracking-wider`}>{proj.techStack?.join(' // ')}</div>
                                    <p className={`text-xs leading-relaxed ${textSecondary}`}>{proj.description[0]}</p>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}
            </div>
        </div>
    );
};

// ==================================================================================
// TEMPLATE 4: IVY LEAGUE (MINIMAL / FINANCE) - NEW!
// ==================================================================================
const MinimalTemplate = ({ data, isDark }: { data: ResumeData, isDark: boolean }) => {
    // Pure Black & White style always, essentially ignores accent for text to stay professional
    const textPrimary = isDark ? 'text-white' : 'text-black';
    const textSecondary = isDark ? 'text-gray-300' : 'text-gray-700';
    const fontStyle = { fontFamily: data.fontFamily || 'Times New Roman, serif' };

    // Helper for Minimal section headers
    const SectionHeader = ({ title }: { title: string }) => (
        <div className="border-b border-black mb-2 mt-2 pb-0.5">
             <h2 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>{title}</h2>
        </div>
    );

    return (
        <div className={`p-6 ${textPrimary}`} style={fontStyle}>
            {/* Header: Center Aligned, Pure Text */}
            <div className="text-center mb-3">
                 <h1 className="text-xl font-bold mb-1 uppercase">{data.personalInfo.fullName}</h1>
                 <div className={`flex justify-center flex-wrap gap-3 text-[10px] ${textPrimary}`}>
                     {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                     {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                     {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                     {data.personalInfo.linkedin && <span>{formatUrl(data.personalInfo.linkedin)}</span>}
                 </div>
            </div>

            {/* Education (Standard for Ivy/Finance to be top) */}
            {data.education.length > 0 && (
                <div className="mb-2">
                    <SectionHeader title="Education" />
                    {data.education.map((edu, i) => (
                        <div key={i} className="mb-1">
                             <div className="flex justify-between font-bold text-[11px]">
                                 <span>{edu.institution}</span>
                                 <span>{edu.location}</span>
                             </div>
                             <div className="flex justify-between text-[11px] italic">
                                 <span>{edu.degree}</span>
                                 <span>{edu.graduationDate}</span>
                             </div>
                             {edu.gpa && <div className="text-sm mt-1">GPA: {edu.gpa}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <div className="mb-4">
                    <SectionHeader title="Experience" />
                    {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4">
                            <div className="flex justify-between font-bold text-sm">
                                <span>{exp.company}</span>
                                <span>{exp.startDate} – {exp.endDate}</span>
                            </div>
                             <div className="flex justify-between text-sm italic mb-1">
                                 <span>{exp.role}</span>
                                 <span>{exp.location}</span>
                             </div>
                             <ul className="list-disc ml-5 text-sm leading-snug">
                                 {exp.description.map((b, idx) => b && <li key={idx} className="pl-1">{b}</li>)}
                             </ul>
                        </div>
                    ))}
                </div>
            )}

             {/* Projects */}
             {data.projects.length > 0 && (
                <div className="mb-4">
                    <SectionHeader title="Projects" />
                    {data.projects.map((proj, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between font-bold text-sm">
                                <span>{proj.name}</span>
                                {proj.link && <span className="font-normal italic">{formatUrl(proj.link)}</span>}
                            </div>
                             <div className="text-sm italic mb-1">{proj.techStack?.join(', ')}</div>
                             <ul className="list-disc ml-5 text-sm leading-snug">
                                 {proj.description.map((b, idx) => b && <li key={idx} className="pl-1">{b}</li>)}
                             </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
                <div className="mb-4">
                    <SectionHeader title="Skills & Interests" />
                    <div className="text-sm">
                        {data.skills.map((cat, i) => (
                            <div key={i} className="mb-1">
                                <span className="font-bold">{cat.name}:</span> {cat.skills.join(', ')}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- NEW COMPONENT: TYPOGRAPHY SELECTOR ---
const FontSelector = ({ 
    currentFont, 
    onUpdate, 
    isDarkUI 
}: { 
    currentFont: string, 
    onUpdate: (font: string, url?: string) => void,
    isDarkUI: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'preset' | 'custom'>('preset');
    const [customFamily, setCustomFamily] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activePreset = PRESET_FONTS.find(f => f.value === currentFont) || PRESET_FONTS[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCustomSubmit = () => {
        if (!customFamily || !customUrl) return;
        const fontValue = `'${customFamily}', sans-serif`;
        onUpdate(fontValue, customUrl);
        setIsOpen(false);
        setMode('preset'); // Reset for next time
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isDarkUI ? 'bg-slate-900 border-slate-700 hover:border-cyan-500' : 'bg-slate-50 border-slate-200 hover:border-cyan-400'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-serif border ${isDarkUI ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}>
                        Aa
                    </div>
                    <div className="text-left">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkUI ? 'text-slate-500' : 'text-slate-400'}`}>Typography</div>
                        <div className={`text-xs font-bold truncate max-w-[150px] ${isDarkUI ? 'text-white' : 'text-slate-900'}`}>{activePreset.name}</div>
                    </div>
                </div>
                <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''} ${isDarkUI ? 'text-slate-500' : 'text-slate-400'}`}></i>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border z-50 overflow-hidden ${isDarkUI ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-slate-200'}`}
                    >
                        {/* Tabs */}
                        <div className={`flex border-b ${isDarkUI ? 'border-slate-700' : 'border-slate-100'}`}>
                            <button 
                                onClick={() => setMode('preset')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${mode === 'preset' ? (isDarkUI ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600') : (isDarkUI ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800')}`}
                            >
                                Presets
                            </button>
                            <button 
                                onClick={() => setMode('custom')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${mode === 'custom' ? (isDarkUI ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600') : (isDarkUI ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800')}`}
                            >
                                Import Custom
                            </button>
                        </div>

                        {mode === 'preset' ? (
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {PRESET_FONTS.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => { onUpdate(font.value, font.url); setIsOpen(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-colors ${currentFont === font.value ? (isDarkUI ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-white') : (isDarkUI ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700')}`}
                                    >
                                        <span className="text-sm" style={{ fontFamily: font.value }}>{font.name}</span>
                                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${currentFont === font.value ? 'bg-white/20' : (isDarkUI ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500')}`}>
                                            {font.category}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <label className={`text-[10px] font-bold uppercase ${isDarkUI ? 'text-slate-400' : 'text-slate-500'}`}>Font Family Name</label>
                                    <input 
                                        placeholder="e.g. Oswald"
                                        value={customFamily}
                                        onChange={(e) => setCustomFamily(e.target.value)}
                                        className={`w-full p-2 text-xs rounded border bg-transparent ${isDarkUI ? 'border-slate-700 focus:border-cyan-500 text-white' : 'border-slate-200 focus:border-cyan-500 text-slate-900'}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-[10px] font-bold uppercase ${isDarkUI ? 'text-slate-400' : 'text-slate-500'}`}>Google Fonts URL</label>
                                    <input 
                                        placeholder="https://fonts.googleapis.com/css2?family=Oswald..."
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value)}
                                        className={`w-full p-2 text-xs rounded border bg-transparent ${isDarkUI ? 'border-slate-700 focus:border-cyan-500 text-white' : 'border-slate-200 focus:border-cyan-500 text-slate-900'}`}
                                    />
                                </div>
                                <button 
                                    onClick={handleCustomSubmit}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg"
                                >
                                    Apply Font
                                </button>
                                <p className={`text-[9px] text-center ${isDarkUI ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Use standard Google Fonts CSS URLs.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SWATCH PICKER (Existing) ---
const SwatchPicker = ({ 
    colors, 
    selected, 
    onSelect, 
    isDarkUI 
}: { 
    colors: { name: string, value: string, isDark?: boolean }[], 
    selected: string, 
    onSelect: (c: string) => void,
    isDarkUI: boolean
}) => {
    return (
        <div className="grid grid-cols-5 gap-3">
            {colors.map((c) => (
                <motion.button
                    key={c.name}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(c.value)}
                    className={`aspect-square rounded-xl shadow-sm relative group overflow-hidden ${selected === c.value ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                >
                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                    
                    {/* Active Check */}
                    {selected === c.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <i className={`fas fa-check drop-shadow-md ${c.isDark ? 'text-white' : 'text-black'}`}></i>
                        </div>
                    )}
                </motion.button>
            ))}
        </div>
    )
}


// --- MAIN PREVIEW COMPONENT ---

const Preview: React.FC<Props> = ({ data, onBack, onUpdate, theme }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // --- RESPONSIVE SCALING ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | 'auto'>('auto');

  const isDarkUI = theme === 'dark';

  // Calculate Scale based on container width vs A4 width (approx 794px at 96 DPI)
  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
            const mmToPx = 3.7795275591; 
            const standardWidth = 210 * mmToPx; // ~794px
            const availableWidth = containerRef.current.offsetWidth;
            
            // Add safety padding. 
            // On Mobile (<768px): smaller padding to maximize visibility.
            // On Desktop: larger padding for aesthetics.
            const padding = window.innerWidth < 768 ? 20 : 40;
            
            // If available width is smaller than standard A4, scale down.
            // Otherwise, keep scale at 1 (max).
            const newScale = Math.min((availableWidth - padding) / standardWidth, 1);
            
            setScale(newScale);
        }
    };

    // Initial and Listener
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Container Height to prevent huge whitespace or cutting off
  useEffect(() => {
      const updateHeight = () => {
          if (resumeRef.current) {
               // Use getBoundingClientRect to get the actual visual height after scaling
               const visualHeight = resumeRef.current.getBoundingClientRect().height;
               // Add buffer for margins/shadows
               setScaledHeight(visualHeight + 40);
          }
      };

      const observer = new ResizeObserver(updateHeight);
      if (resumeRef.current) {
          observer.observe(resumeRef.current);
      }
      
      // Also update on window resize (scale change)
      window.addEventListener('resize', updateHeight);
      updateHeight();

      return () => {
          observer.disconnect();
          window.removeEventListener('resize', updateHeight);
      };
  }, [scale, data]); 


  // --- DYNAMIC FONT INJECTION ---
  useEffect(() => {
    // 1. Determine which URL to load
    let fontUrl = '';
    
    // Check if it's a preset with a URL
    const preset = PRESET_FONTS.find(f => f.value === data.fontFamily);
    if (preset && preset.url) {
        fontUrl = preset.url;
    } 
    // Check if it's a custom imported font
    else if (data.customFontUrl) {
        fontUrl = data.customFontUrl;
    }

    if (!fontUrl) return;

    // 2. Inject Link Tag
    const linkId = 'dynamic-resume-font';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    
    link.href = fontUrl;

  }, [data.fontFamily, data.customFontUrl]);

  const handleExport = async (format: 'pdf' | 'jpeg') => {
    if (!resumeRef.current) return;
    setExporting(true);
    
    try {
      // @ts-ignore
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2, // Quality scale for export
        useCORS: true,
        backgroundColor: data.backgroundColor || '#ffffff', 
        logging: false,
        // Vital: Reset transform during capture so we get full resolution, not the scaled-down mobile view
        onclone: (clonedDoc) => {
            const element = clonedDoc.getElementById('resume-preview-element');
            if (element) {
                element.style.transform = 'none';
                element.style.margin = '0'; 
            }
        }
      });

      if (format === 'jpeg') {
        const link = document.createElement('a');
        link.download = `Resume_${data.personalInfo.fullName.replace(/\s+/g, '_')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      } else {
        // @ts-ignore
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`Resume_${data.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  // --- PALETTES ---
  const BACKGROUNDS = [
      { name: 'Pure White', value: '#ffffff', isDark: false },
      { name: 'Pearl', value: '#f8fafc', isDark: false },
      { name: 'Ivory', value: '#fffbeb', isDark: false },
      { name: 'Mist', value: '#f3f4f6', isDark: false },
      { name: 'Carbon', value: '#18181b', isDark: true }, // Zinc 900
      { name: 'Vantablack', value: '#000000', isDark: true },
      { name: 'Deep Navy', value: '#0f172a', isDark: true }, // Slate 900
      { name: 'Regal Maroon', value: '#450a0a', isDark: true },
      { name: 'Forest', value: '#022c22', isDark: true },
      { name: 'Gunmetal', value: '#334155', isDark: true },
  ];

  const ACCENTS = [
    { name: 'Electric Blue', value: '#2563eb', isDark: false },
    { name: 'Neon Cyan', value: '#06b6d4', isDark: false },
    { name: 'Emerald', value: '#10b981', isDark: false },
    { name: 'Sunset', value: '#f97316', isDark: false },
    { name: 'Hot Pink', value: '#ec4899', isDark: false },
    { name: 'Royal Purple', value: '#7c3aed', isDark: false },
    { name: 'Gold', value: '#eab308', isDark: false },
    { name: 'Crimson', value: '#dc2626', isDark: false },
    { name: 'Charcoal', value: '#334155', isDark: true },
    { name: 'Black', value: '#000000', isDark: true },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-10 px-4 md:px-6">
      <AnimatePresence>
        {showGallery && (
          <TemplateGallery 
            data={data}
            onSelect={(id) => onUpdate({ templateId: id })} 
            onClose={() => setShowGallery(false)} 
          />
        )}
      </AnimatePresence>

      {/* --- CONTROL PANEL --- */}
      <div className="w-full lg:w-1/3 space-y-6 no-print">
        <motion.div 
          initial={{ x: -20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${isDarkUI ? 'glass cyber-glow border-slate-700' : 'bg-white border-slate-200 shadow-xl'}`}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className={`text-2xl font-heading font-black mb-8 tracking-tighter ${isDarkUI ? 'text-white' : 'text-slate-900'}`}>
            Design Forge
          </h3>
          
          <div className="space-y-8 relative z-10">
            
            {/* 1. ARCHITECTURE */}
            <div>
                 <label className="text-[10px] uppercase block mb-4 font-black tracking-[0.3em] opacity-50">Blueprint</label>
                 <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGallery(true)}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                    <i className="fas fa-layer-group text-lg"></i>
                    Change Template
                </motion.button>
                <p className={`text-[10px] mt-2 text-center font-medium ${isDarkUI ? 'text-slate-500' : 'text-slate-400'}`}>Current: <span className="text-cyan-500 uppercase">{data.templateId}</span></p>
            </div>

            <div className={`h-px w-full ${isDarkUI ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

            {/* 2. TYPOGRAPHY (NEW) */}
            <div>
                <label className="text-[10px] uppercase block mb-4 font-black tracking-[0.3em] opacity-50">Typography Engine</label>
                <FontSelector 
                    currentFont={data.fontFamily || 'sans-serif'} 
                    onUpdate={(font, url) => onUpdate({ fontFamily: font, customFontUrl: url })}
                    isDarkUI={isDarkUI}
                />
            </div>

            {/* 3. BACKGROUND TONE */}
            <div>
                <label className="text-[10px] uppercase block mb-4 font-black tracking-[0.3em] opacity-50">Material Tone (Bg)</label>
                <SwatchPicker 
                    colors={BACKGROUNDS} 
                    selected={data.backgroundColor} 
                    onSelect={(c) => onUpdate({ backgroundColor: c })}
                    isDarkUI={isDarkUI}
                />
            </div>

            {/* 4. ACCENT PLASMA */}
            <div>
                <label className="text-[10px] uppercase block mb-4 font-black tracking-[0.3em] opacity-50">Brand Plasma (Ink)</label>
                <SwatchPicker 
                    colors={ACCENTS} 
                    selected={data.themeColor} 
                    onSelect={(c) => onUpdate({ themeColor: c })}
                    isDarkUI={isDarkUI}
                />
            </div>

            {/* 5. CUSTOM TOGGLE */}
            <div className={`pt-4 border-t ${isDarkUI ? 'border-slate-800' : 'border-slate-100'}`}>
                <button 
                    onClick={() => setShowCustomColor(!showCustomColor)}
                    className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkUI ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}
                >
                    <i className={`fas fa-chevron-right transition-transform ${showCustomColor ? 'rotate-90' : ''}`}></i>
                    Advanced Custom Mix
                </button>
                
                <AnimatePresence>
                    {showCustomColor && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-[9px] font-bold uppercase block mb-1 opacity-50">Custom Bg</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={data.backgroundColor} onChange={(e) => onUpdate({ backgroundColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                                        <span className="text-[10px] font-mono opacity-70">{data.backgroundColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase block mb-1 opacity-50">Custom Ink</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={data.themeColor} onChange={(e) => onUpdate({ themeColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                                        <span className="text-[10px] font-mono opacity-70">{data.themeColor}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          </div>
        </motion.div>

        {/* Export Actions */}
        <div className={`p-8 rounded-[2.5rem] border space-y-4 ${isDarkUI ? 'glass border-slate-700' : 'bg-white border-slate-200 shadow-xl'}`}>
             <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={exporting}
              onClick={() => handleExport('pdf')} 
              className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl uppercase tracking-[0.2em] text-xs transition-all ${isDarkUI ? 'bg-white text-slate-900 hover:bg-cyan-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              <i className={`fas ${exporting ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-lg`}></i>
              {exporting ? 'Rendering...' : 'Download PDF'}
            </motion.button>

            <button 
              onClick={onBack}
              className={`w-full py-4 border rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${isDarkUI ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'}`}
            >
              <i className="fas fa-pen text-xs"></i> Edit Content
            </button>
        </div>
      </div>

      {/* --- RESUME PREVIEW CANVAS --- */}
      <div className="w-full lg:w-2/3 flex flex-col items-center" ref={containerRef}>
        <div 
            className="w-full flex justify-center perspective-1000 relative"
            // Dynamically adjust height to prevent large whitespace below scaled element
            style={{ height: scaledHeight === 'auto' ? 'auto' : `${scaledHeight}px` }}
        >
            <motion.div 
              layoutId="resume-canvas"
              id="resume-preview-element" // ID for html2canvas extraction
              ref={resumeRef}
              className="resume-page shadow-2xl relative"
              style={{ 
                  width: '210mm', 
                  height: '297mm',
                  maxHeight: '297mm',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: 0, 
                  // Dynamically scale on mobile to fit screen width
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  backgroundColor: data.backgroundColor || '#ffffff'
              }}
            >
              {/* Dynamic Template Switcher */}
              {data.templateId === 'executive' && (
                  <ExecutiveTemplate data={data} isDark={isDarkBackground(data.backgroundColor)} accent={data.themeColor} />
              )}
              {data.templateId === 'modern' && (
                   <ModernTemplate data={data} isDark={isDarkBackground(data.backgroundColor)} accent={data.themeColor} />
              )}
              {data.templateId === 'creative' && (
                   <CreativeTemplate data={data} isDark={isDarkBackground(data.backgroundColor)} accent={data.themeColor} />
              )}
              {data.templateId === 'minimal' && (
                   <MinimalTemplate data={data} isDark={isDarkBackground(data.backgroundColor)} />
              )}
              
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Preview;