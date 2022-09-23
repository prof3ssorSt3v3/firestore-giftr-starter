import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgLEo4-GeXRZkLPXJ40Hvns6Gd-8qdi18",
  authDomain: "fire-giftr-1b0b0.firebaseapp.com",
  projectId: "fire-giftr-1b0b0",
  storageBucket: "fire-giftr-1b0b0.appspot.com",
  messagingSenderId: "314280737166",
  appId: "1:314280737166:web:533bf1bc8e7b438770ccdf",
};
