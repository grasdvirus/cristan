
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration - THIS IS PUBLIC AND SAFE
const firebaseConfig = {
  apiKey: "AIzaSyBG5IMW7UxqBQL7MySUVk1BVbTiWpWoAkI",
  authDomain: "artisan-portfolio-ug95w.firebaseapp.com",
  projectId: "artisan-portfolio-ug95w",
  storageBucket: "artisan-portfolio-ug95w.appspot.com",
  messagingSenderId: "904872842607",
  appId: "1:904872842607:web:e24398e6333cf7361e449a",
  measurementId: "G-5B373TRP7C"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, storage, analytics, googleProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, firebaseSignOut };
