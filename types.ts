
export enum ResumePurpose {
  INTERNSHIP = 'Internship',
  JOB = 'Entry Level Job',
  SWITCH = 'Career Switch',
  EXPERIENCED = 'Experienced Professional'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'github' | 'meta';
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  photoUrl?: string;
  jobTitle: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  graduationDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  link?: string;
  description: string[];
  techStack: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export type TemplateId = 'modern' | 'minimal' | 'executive' | 'creative';

export interface ResumeData {
  purpose: ResumePurpose;
  targetJobDescription: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: string[];
  achievements: string[];
  themeColor: string;
  backgroundColor: string; // New: document background color
  templateId: TemplateId;
  fontFamily: string;
  customFontUrl?: string; // New: for importing custom fonts
  isManualMode: boolean;
  score: {
    ats: number;
    readability: number;
    depth: number;
    feedback: string[];
  };
}

export interface AIAnalysisResponse {
  summary: string;
  optimizedSkills: SkillCategory[];
  improvedExperience?: { id: string; description: string[] }[];
  improvedProjects?: { id: string; description: string[] }[];
  score: {
    ats: number;
    readability: number;
    depth: number;
    feedback: string[];
  };
}