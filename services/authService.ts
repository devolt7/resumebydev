import { 
    GoogleAuthProvider, 
    GithubAuthProvider, 
    FacebookAuthProvider, 
    signInWithPopup, 
    signOut,
    User as FirebaseUser
  } from "firebase/auth";
  import { auth, isConfigured } from "./firebaseConfig";
  import { User, ResumeData, Project } from "../types";
  
  // Helper to map Firebase User to our App User type
  const mapUser = (fbUser: FirebaseUser, provider: 'google' | 'github' | 'meta'): User => ({
    id: fbUser.uid,
    name: fbUser.displayName || 'Anonymous User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || '',
    provider: provider
  });

  // --- DEV MODE MOCK DATA (Used only if Firebase is not configured) ---
  const MOCK_PROFILES: Record<string, Partial<ResumeData> & { user: User }> = {
      'google': {
          user: { 
              id: 'mock_google', 
              name: 'Tony Stark', 
              email: 'tony@stark.com', 
              avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80', 
              provider: 'google' 
          },
          personalInfo: { 
              fullName: 'Tony Stark', 
              email: 'tony@stark.com', 
              jobTitle: 'Chief Technology Officer', 
              location: 'Malibu, California', 
              phone: '+1 212 970 4133', 
              linkedin: 'linkedin.com/in/ironman', 
              github: 'github.com/stark', 
              portfolio: 'starkindustries.com',
              photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
          },
          summary: "Visionary Inventor and Industrialist with a proven track record of saving the world. Expert in clean energy, quantum mechanics, and AI robotics. Seeking to leverage nanotechnology and arc reactor expertise to solve global energy crises.",
          education: [
              { id: 'e1', institution: 'MIT', degree: 'Ph.D. Physics & Electrical Engineering', fieldOfStudy: 'Physics', location: 'Cambridge, MA', graduationDate: '1987', gpa: '4.0' },
              { id: 'e2', institution: 'MIT', degree: 'M.S. Artificial Intelligence', fieldOfStudy: 'AI', location: 'Cambridge, MA', graduationDate: '1985', gpa: '4.0' }
          ],
          experience: [
              { 
                  id: 'exp1', 
                  company: 'Stark Industries', 
                  role: 'Chief Executive Officer', 
                  location: 'New York, NY', 
                  startDate: '1991', 
                  endDate: 'Present', 
                  isCurrent: true, 
                  description: [
                      'Revolutionized the weapons industry before pivoting to clean energy dominance.',
                      'Developed the Arc Reactor, providing sustainable energy to 40% of the US grid.',
                      'Managed a global workforce of 15,000+ employees and a $500B annual budget.',
                      'Oversaw the Damage Control joint venture to manage extraterrestrial salvage operations.'
                  ]
              },
              { 
                  id: 'exp2', 
                  company: 'The Avengers', 
                  role: 'Lead Technical Consultant', 
                  location: 'Global', 
                  startDate: '2012', 
                  endDate: 'Present', 
                  isCurrent: true, 
                  description: [
                      'Architected the Avengers HQ defense systems and Quinjet propulsion technology.',
                      'Coordinated global defense strategies against Thanos-level threats.',
                      'Mentored junior heroes (Spider-Man) in suit mechanics and ethical heroism.'
                  ]
              }
          ],
          projects: [
              { id: 'p1', name: 'J.A.R.V.I.S. AI', link: 'stark.com/jarvis', description: ['Created a fully sentient AI capable of managing complex logistics and suit mechanics.', 'Later evolved into Vision via the Mind Stone.'], techStack: ['C++', 'Python', 'Quantum Computing'] },
              { id: 'p2', name: 'Mark LXXXV Armor', link: 'stark.com/suits', description: ['The pinnacle of nanotechnology integration with neuro-interface control.', 'Features self-repairing nanobots and directed energy weaponry.'], techStack: ['Nanotech', 'Hardware Engineering'] }
          ],
          skills: [
              { id: 's1', name: 'Engineering', skills: ['Robotics', 'Quantum Mechanics', 'Nanotechnology', 'Propulsion Systems', 'AI Architecture'] },
              { id: 's2', name: 'Leadership', skills: ['Crisis Management', 'Strategic Planning', 'Public Speaking', 'Capital Allocation'] }
          ],
          templateId: 'executive',
          themeColor: '#b91c1c', // Deep Red
          backgroundColor: '#ffffff'
      },
      'github': {
          user: { 
              id: 'mock_github', 
              name: 'Natasha Romanoff', 
              email: 'natasha@shield.gov', 
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', 
              provider: 'github' 
          },
          personalInfo: { 
              fullName: 'Natasha Romanoff', 
              email: 'natasha@shield.gov', 
              jobTitle: 'Senior Cybersecurity Engineer', 
              location: 'Washington D.C.', 
              phone: '+1 555 0100', 
              linkedin: 'linkedin.com/in/blackwidow', 
              github: 'github.com/blackwidow', 
              portfolio: 'shield.gov/agents/romanoff',
              photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
          },
          summary: "Elite intelligence operative turned Full-Stack Security Engineer. Specializes in penetration testing, social engineering, and securing high-value assets. Fluent in Python, Rust, and 8 human languages.",
          experience: [
               {
                   id: 'exp1',
                   company: 'S.H.I.E.L.D.',
                   role: 'Lead Intelligence Officer',
                   location: 'Classified',
                   startDate: '2010',
                   endDate: '2014',
                   isCurrent: false,
                   description: [
                       'Led a team of 12 agents in dismantling the Hydra algorithmic surveillance network.',
                       'Conducted 50+ successful penetration tests on sovereign state firewalls.',
                       'Optimized encryption protocols for the Helicarrier communication grid.'
                   ]
               }
          ],
          projects: [
              { id: 'p1', name: 'Red Room Firewall', link: 'github.com/shield/firewall', description: ['Architected a zero-trust security perimeter blocking 99.9% of incursions.', 'Implemented biometric authentication headers using retinal scanning libraries.'], techStack: ['Python', 'C++', 'Cryptography'] },
              { id: 'p2', name: 'Widow Bite Protocol', link: 'github.com/avengers/protocol', description: ['Developed rapid response neural network for threat assessment.', 'Reduced reaction time by 400ms during combat scenarios.'], techStack: ['Rust', 'TensorFlow', 'IoT'] }
          ],
          skills: [
              { id: 's1', name: 'Technical', skills: ['Penetration Testing', 'Python', 'Rust', 'Network Security', 'Cryptography', 'Linux'] },
              { id: 's2', name: 'Operations', skills: ['Espionage', 'Hand-to-Hand Combat', 'Interrogation', 'Strategic Infiltration'] }
          ],
          templateId: 'modern',
          themeColor: '#000000',
          backgroundColor: '#f8fafc'
      },
      'meta': {
           user: { 
               id: 'mock_meta', 
               name: 'Peter Parker', 
               email: 'peter@dailybugle.com', 
               avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80', 
               provider: 'meta' 
           },
           personalInfo: { 
               fullName: 'Peter Parker', 
               email: 'peter@dailybugle.com', 
               jobTitle: 'Visual Designer & Frontend Dev', 
               location: 'Queens, NY', 
               phone: '+1 917 555 0198', 
               linkedin: 'linkedin.com/in/spidey', 
               github: 'github.com/webslinger', 
               portfolio: 'peterparker.photography',
               photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
           },
           summary: "Passionate photographer and aspiring web developer with a knack for capturing moments and coding sleek interfaces. Experience with React, Node.js, and high-tensile synthetic polymers.",
           education: [
               { id: 'e1', institution: 'Empire State University', degree: 'B.S. Biophysics', fieldOfStudy: 'Biophysics', location: 'New York, NY', graduationDate: '2024', gpa: '3.9' }
           ],
           experience: [
               {
                   id: 'exp1',
                   company: 'The Daily Bugle',
                   role: 'Freelance Photojournalist',
                   location: 'New York, NY',
                   startDate: '2016',
                   endDate: 'Present',
                   isCurrent: true,
                   description: [
                       'Captured exclusive, high-resolution imagery of local vigilantes for front-page features.',
                       'Managed digital asset library and optimized image compression for web delivery.',
                       'Negotiated licensing rights with J. Jonah Jameson under high-pressure deadlines.'
                   ]
               },
               {
                   id: 'exp2',
                   company: 'Octavius Industries',
                   role: 'Research Intern',
                   location: 'New York, NY',
                   startDate: '2023',
                   endDate: '2023',
                   isCurrent: false,
                   description: [
                       'Assisted Dr. Otto Octavius in neural interface calibration for prosthetic limbs.',
                       'Debugged control software written in C for mechanical arm actuators.'
                   ]
               }
           ],
           projects: [
               { id: 'p1', name: 'Web Shooter Algo', link: 'github.com/spidey/fluid', description: ['Developed a fluid dynamics algorithm to calculate tensile strength on the fly.', 'Optimized chemical synthesis formula for 2-hour dissolution.'], techStack: ['Chemistry', 'Calculus', 'Node.js'] },
               { id: 'p2', name: 'Spidey Sense App', link: 'github.com/spidey/sense', description: ['Mobile app using geo-location to track neighborhood crime rates.', 'Built with React Native and Firebase.'], techStack: ['React Native', 'Firebase', 'Maps API'] }
           ],
           skills: [
               { id: 's1', name: 'Creative', skills: ['Photography', 'Adobe Lightroom', 'UI/UX Design', 'React', 'Tailwind CSS'] },
               { id: 's2', name: 'Scientific', skills: ['Chemistry', 'Physics', 'Mathematics', 'Lab Safety'] }
           ],
           templateId: 'creative',
           themeColor: '#2563eb', // Blue
           backgroundColor: '#fffbeb' // Ivory
      }
  };
  
  /**
   * Login Implementation
   * Handles both Real Firebase Auth and Dev Mode Fallback
   */
  export const loginWithProvider = async (providerName: 'google' | 'github' | 'meta'): Promise<{ user: User, data: Partial<ResumeData> }> => {
    
    // --- FALLBACK: DEV MODE ---
    if (!isConfigured) {
        console.warn(`%c DEV MODE: Simulating ${providerName} login. Configure services/firebaseConfig.ts for Real Auth.`, 'color: orange; font-weight: bold;');
        return new Promise(resolve => {
            setTimeout(() => {
                const mock = MOCK_PROFILES[providerName];
                resolve({ user: mock.user, data: mock });
            }, 1200); // Slight delay for realism
        });
    }

    // --- REAL MODE: FIREBASE ---
    if (!auth) {
      throw new Error("Firebase auth not initialized.");
    }
  
    let provider: any;
    
    switch (providerName) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'github':
        provider = new GithubAuthProvider();
        // Request access to read public repo data
        provider.addScope('read:user');
        provider.addScope('public_repo');
        break;
      case 'meta':
        provider = new FacebookAuthProvider();
        break;
    }
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const appUser = mapUser(user, providerName);
      
      // Initialize Data with Profile Info
      const fetchedData: Partial<ResumeData> = {
        personalInfo: {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: '', // Providers rarely share phone numbers
          location: '',
          linkedin: '',
          github: '',
          portfolio: '',
          jobTitle: '',
          photoUrl: user.photoURL || undefined
        }
      };
  
      // --- GITHUB ECOSYSTEM INTEGRATION (Real API Call) ---
      if (providerName === 'github') {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        // @ts-ignore
        const screenName = result._tokenResponse?.screenName; 
        
        if (screenName) {
             if (fetchedData.personalInfo) {
                fetchedData.personalInfo.github = `github.com/${screenName}`;
             }

             try {
                 const repoResponse = await fetch(`https://api.github.com/users/${screenName}/repos?sort=updated&per_page=3`, {
                    headers: token ? { Authorization: `token ${token}` } : {}
                 });
                 
                 if (repoResponse.ok) {
                     const repos = await repoResponse.json();
                     
                     const projectData: Project[] = repos.map((repo: any) => ({
                         id: String(repo.id),
                         name: repo.name.replace(/-/g, ' ').replace(/_/g, ' '), 
                         link: repo.html_url,
                         description: [
                             repo.description || "Open source contribution.", 
                             `Language: ${repo.language || 'Code'}`
                         ],
                         techStack: [repo.language].filter(Boolean)
                     }));
  
                     fetchedData.projects = projectData;
                 }
             } catch (repoErr) {
                 console.warn("Failed to fetch GitHub repos", repoErr);
             }
        }
      }
  
      return { user: appUser, data: fetchedData };
  
    } catch (error: any) {
      console.error("Auth Error:", error);
      // Clean up error message for UI
      let msg = "Login failed.";
      if (error.code === 'auth/popup-closed-by-user') msg = "Login cancelled.";
      if (error.code === 'auth/account-exists-with-different-credential') msg = "Account exists with a different provider.";
      throw new Error(msg);
    }
  };
  
  export const logoutUser = async (): Promise<void> => {
    if (isConfigured && auth) {
      await signOut(auth);
    }
  };
  
  export const onAuthChange = (callback: (user: User | null) => void) => {
    if (!isConfigured || !auth) return () => {};
    return auth.onAuthStateChanged((user: FirebaseUser | null) => {
      if (user) {
        const providerData = user.providerData[0];
        const providerId = providerData?.providerId || 'google.com';
        let type: 'google' | 'github' | 'meta' = 'google';
        if (providerId.includes('github')) type = 'github';
        if (providerId.includes('facebook')) type = 'meta';
  
        callback(mapUser(user, type));
      } else {
        callback(null);
      }
    });
  };