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
import { initializeApp } from "firebase/app"; //core of firebase library
import {
  getFirestore, //initialze firestore service
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

// Your web app's Firebase configuration object
//next step: connect to firebase project from the front end
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
const app = initializeApp(firebaseConfig); //connects to firebase backend
const db = getFirestore(app); //referenece for the db
let personId = null;
let people = [];
let ideas = [];
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

//Setting up event listeners
//document.addEventListener("DOMContentLoaded", init);
document.addEventListener("DOMContentLoaded", async () => {
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

  document
    .getElementById("btnSavePerson")
    .addEventListener("click", savePerson);
  document.getElementById("btnSaveIdea").addEventListener("click", saveIdea);

  document
    .querySelector(".person-list")
    .addEventListener("click", handleSelectPerson);

  loadData();
});

function loadData() {
  getPeople();
}

/**people functionality */
async function getPeople() {
  const querySnapshot = await getDocs(collection(db, "people"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    people.push({ id, ...data });
  });

  personId = buildPeople(people);
  console.log(people);
  let li = document.querySelector(`[data-id="${personId}"]`);
  console.log(li);

  li.click();
}

//building the html
async function buildPeople(people) {
  let ul = document.querySelector("ul.person-list");
  ul.innerHTML = people
    .map((person) => {
      const dob = `${months[person["birth-month"] - 1]} ${person["birth-day"]}`;
      return `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
          </li>`;
    })
    .join("");

  let selected = people[0].id;
  return selected;
}

/**gift functionality */












































function hideOverlay(ev) {
  ev.preventDefault();
  if (
    !ev.target.classList.contains("overlay") &&
    ev.target.id != "btnCancelIdea" &&
    ev.target.id != "btnCancelPerson"
  )
    return;

  document.querySelector(".overlay").classList.remove("active");
  document
    .querySelectorAll(".overlay dialog")
    .forEach((dialog) => dialog.classList.remove("active"));
}
function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  const id = ev.target.id === "btnAddPerson" ? "dlgPerson" : "dlgIdea";
  document.getElementById(id).classList.add("active");
}
