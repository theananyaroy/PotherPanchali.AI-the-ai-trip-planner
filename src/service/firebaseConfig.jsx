// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKtvryiwrpcXgl7VaruTFWfSg-DJOUz6E",
  authDomain: "potherpanchaliai.firebaseapp.com",
  projectId: "potherpanchaliai",
  storageBucket: "potherpanchaliai.firebasestorage.app",
  messagingSenderId: "368317605636",
  appId: "1:368317605636:web:7d4b044d450a6a3fe89251",
  measurementId: "G-JP74EVRLWS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);