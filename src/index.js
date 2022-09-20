/**.
 * assignment steps:
 * creating own firebase project, app and database. 
 * insertion of config object into the js file 
 * the devinit branch has samples of how to READ all data and CREATE new data in the database.
 * functions of firebase project:
 * 1. READS a list of people from the data, displays their names, birhtdays and months
 * 2. first person automatically selected and the gifts of person is displayed 
 * 3. clicking on a person list item READS all gift ideas from that person and displays 
 * it as contents of the second list 
 * 5. if either list is empty, a message is displayed "no data"
 * 6. clicking on ADD buttons should show the overlay plus the form 
 * 7. once form is filled, when user clicks save, the new item should be added to database 
 * as well as updated list 
 * 8. the bought value should be displayed as a checkbox 
 * 9. each item should have a delete button 
 * 10. the delete button should delelte from database and UI
 * 11. each item should have a functional edit button 
 * 12. toggling checkbox for gift should do an update in DB 
 * 13. github pages 
 * 
 *
 * 

*/

// Import the functions you need from the SDKs you need
//database references
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  whre,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  orderBy,
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAO23Vn0VmMWHP11CYoUWshK7bpL_iTTnI",
  authDomain: "fire-giftr-fce59.firebaseapp.com",
  projectId: "fire-giftr-fce59",
  storageBucket: "fire-giftr-fce59.appspot.com",
  messagingSenderId: "619977319882",
  appId: "1:619977319882:web:0cc81a9f47160221a31b33",
  measurementId: "G-11CPY45CG8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const selectedPersonId = null;
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

document.addEventListener("DOMContentLoaded", () => {
  //set up the dom events
  document
    .getElementById("btnCancelPerson")
    .addEventListener("click", hideOverlay);
  document
    .getElementById("btnCancelIdea")
    .addEventListener("click", hideOverlay);
  document.querySelector(".overlay").addEventListener("click", hideOverlay);

  document
    .getElementById("btnAddPerson")
    .addEventListener("click", showOverlay);
  document.getElementById("btnAddIdea").addEventListener("click", showOverlay);
});

function hideOverlay(ev) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.remove("active");
  document
    .querySelectorAll(".overlay dialog")
    .forEach((dialog) => dialog.classList.remove("active"));
}
function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  const id = ev.target.id === "btnAddPerson" ? "dlgPerson" : "dlgIdea";
  //TODO: check that person is selected before adding an idea
  document.getElementById(id).classList.add("active");
}
