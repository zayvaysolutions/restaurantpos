// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// IMPORTANTE: Reemplaza con tus propias credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbYxuLKGsNVktHRWonXBWqHJHx0Oi0loA",
  authDomain: "restaurantpos-multi.firebaseapp.com",
  projectId: "restaurantpos-multi",
  storageBucket: "restaurantpos-multi.firebasestorage.app",
  messagingSenderId: "13033221224",
  appId: "1:13033221224:web:375fda406b42b2472cdfdd",
  measurementId: "G-SCQMDK5H4L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;