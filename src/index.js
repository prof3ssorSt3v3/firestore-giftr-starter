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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const people = [];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let personId = "";
let ideaId = "";
document.addEventListener("DOMContentLoaded", () => {
  getPeople();
  document
    .getElementById("btnAddPerson")
    .addEventListener("click", showOverlay);
  document.getElementById("btnAddIdea").addEventListener("click", showOverlay);
  document
    .getElementById("btnCancelPerson")
    .addEventListener("click", hideOverlay);
  document
    .getElementById("btnCancelIdea")
    .addEventListener("click", hideOverlay);
  document.querySelector(".overlay").addEventListener("click", hideOverlay);
  document
    .getElementById("btnSavePerson")
    .addEventListener("click", savePerson);
  document.getElementById("btnSaveIdea").addEventListener("click", saveIdea);
  document
    .querySelector(".person-list")
    .addEventListener("click", handleSelectPerson);
  document
    .querySelector(".idea-list")
    .addEventListener("click", handleSelectIdea);
  document.getElementById("btnYes").addEventListener("click", deletePerson);
  document.getElementById("btnYesDelete").addEventListener("click", deleteIdea);

  onSnapshot(collection(db, "people"), (snapshot) => {
    let people = [];
    snapshot.docs.forEach((doc) => {
      people.push({ id: doc.id, ...doc.data() });
    });
    buildPeople(people);
  });
  onSnapshot(collection(db, "gift-ideas"), (snapshot) => {
    let ideas = [];
    snapshot.docs.forEach((doc) => {
      ideas.push({ id: doc.id, ...doc.data() });
    });
    buildIdeas(ideas);
  });
});
