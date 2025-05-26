import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCiRT4SNz7KSTqALUJCE9ovwHKZOunCC5E",
  authDomain: "kca-final-year-project.firebaseapp.com",
  projectId: "kca-final-year-project",
  storageBucket: "kca-final-year-project.firebasestorage.app",
  messagingSenderId: "908589577030",
  appId: "1:908589577030:web:0bb7ff9a4af2120a08eb47",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, query, where, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, orderBy, limit };