import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Firebase configuration for N4D Patient Profiler.
 * These credentials connect the app to the Cloud Firestore database
 * allowing for real-time collaboration between nursing students.
 */
const firebaseConfig = {
  apiKey: "AIzaSyC0JyYRGrfa3MRtnDG3EDmZHU13khM_k_0",
  authDomain: "n4d-patient-profile-form.firebaseapp.com",
  projectId: "n4d-patient-profile-form",
  storageBucket: "n4d-patient-profile-form.firebasestorage.app",
  messagingSenderId: "675698836138",
  appId: "1:675698836138:web:9b244e233ff477fa4686d3"
};

// Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);