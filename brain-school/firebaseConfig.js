// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA8zPKfL7ZxRqrWE09cylVW0VaFJVtIJ7E",
    authDomain: "formulario-1741635482833.firebaseapp.com",
    projectId: "formulario-1741635482833",
    storageBucket: "formulario-1741635482833.firebasestorage.app",
    messagingSenderId: "1046409247260",
    appId: "1:1046409247260:web:fdcc8cbaa4cd795f58fdd9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
