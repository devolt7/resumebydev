import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Default placeholder config
const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const LOCAL_STORAGE_KEY = 'resume_forge_firebase_config';

// 1. Check Local Storage first (Dynamic Config)
const storedConfigStr = localStorage.getItem(LOCAL_STORAGE_KEY);
let firebaseConfig = defaultFirebaseConfig;
let isConfigured = false;

if (storedConfigStr) {
    try {
        const parsed = JSON.parse(storedConfigStr);
        // Basic validation
        if (parsed.apiKey && parsed.projectId) {
            firebaseConfig = parsed;
            isConfigured = true;
        }
    } catch (e) {
        console.error("Corrupt config in local storage", e);
    }
} else {
    // 2. Check if hardcoded values are replaced in code
    isConfigured = defaultFirebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
}

let app;
let auth: any;

try {
    if (isConfigured) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    } else {
         console.warn("⚠️ Firebase Config is missing! App running in Demo Mode.");
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
    isConfigured = false; // Fallback if init fails even with keys
}

// Helpers to update config from UI
export const saveFirebaseConfig = (configObj: any) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configObj));
        window.location.reload(); // Reload to initialize Firebase with new keys
    } catch (e) {
        alert("Failed to save config to local storage.");
    }
};

export const resetFirebaseConfig = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
};

export { auth, isConfigured };