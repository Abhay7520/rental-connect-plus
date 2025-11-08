import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAln3be8mEk560HOTTkIIC_S1uuuFjPLUw",
  authDomain: "rental-connect-plus.firebaseapp.com",
  projectId: "rental-connect-plus",
  storageBucket: "rental-connect-plus.firebasestorage.app",
  messagingSenderId: "363141059363",
  appId: "1:363141059363:web:903411e04904ea6c957296",
  measurementId: "G-FGS87GJHBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
