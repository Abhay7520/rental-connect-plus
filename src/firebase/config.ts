// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp4MRM8BjdKAVxm1EtMndv5vwKa-vbrGs",
  authDomain: "rental-connect-plus-cf8a5.firebaseapp.com",
  databaseURL: "https://rental-connect-plus-cf8a5-default-rtdb.firebaseio.com",
  projectId: "rental-connect-plus-cf8a5",
  storageBucket: "rental-connect-plus-cf8a5.firebasestorage.app",
  messagingSenderId: "550359333452",
  appId: "1:550359333452:web:b57e28e32cd671c2fd52e9",
  measurementId: "G-PHTKDXCW84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);


export default app;