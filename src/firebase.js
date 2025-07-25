// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcnJVdeCuw5_CVkTZZTpY5GjgduRXuuYc",
  authDomain: "registry-cd3c0.firebaseapp.com",
  projectId: "registry-cd3c0",
  storageBucket: "registry-cd3c0.appspot.com",
  messagingSenderId: "211824820032",
  appId: "1:211824820032:web:fb2a435ca4b2407d76c4a5",
  measurementId: "G-XPBNR90LDQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
