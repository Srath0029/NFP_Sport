// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIq1EBpyqCul8QrK_SibBzj-_8EI8Mw2M",
  authDomain: "fit5032-assignment1.firebaseapp.com",
  projectId: "fit5032-assignment1",
  storageBucket: "fit5032-assignment1.appspot.com",
  messagingSenderId: "253718872532",
  appId: "1:253718872532:web:312971ff1c44bc8fff1641",
  measurementId: "G-Q9WKQW2KEM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you actually use
export const auth = getAuth(app);
export const db = getFirestore(app);
