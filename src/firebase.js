// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBn4BWr3bn_eYJFr9jWP9MKjyqq9g6Hz-0",
  authDomain: "contest-hub-7ff9f.firebaseapp.com",
  projectId: "contest-hub-7ff9f",
  storageBucket: "contest-hub-7ff9f.firebasestorage.app",
  messagingSenderId: "530520822199",
  appId: "1:530520822199:web:dc3d6fe8316f7e8bd95832",
  measurementId: "G-SWB06FWLT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
