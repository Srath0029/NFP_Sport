// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:
  authDomain: "fit5032-assignment1.firebaseapp.com",
  projectId: "fit5032-assignment1",
  storageBucket: "fit5032-assignment1.appspot.com",
  messagingSenderId:
  appId:
  measurementId: "G-Q9WKQW2KEM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you actually use
export const auth = getAuth(app);
export const db = getFirestore(app);
