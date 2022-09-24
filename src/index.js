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
    //buildIdeas(ideas);
    getIdeas(personId);
    console.log("onSnapshot: Building Ideas");
  });
});

async function getPeople() {
  const query = await getDocs(collection(db, "people"));
  query.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    people.push({ id, ...data });
  });
  buildPeople(people);
}

function buildPeople(people) {
  const ul = document.querySelector("ul.person-list");
  if (people.length) {
    ul.innerHTML = people
      .map((person) => {
        const dob = `${months[person["birth-month"] - 1]} ${
          person["birth-day"]
        }`;
        return `<li data-id="${person.id}" class="person">
                <p class="name">${person.name}</p>
                <p class="dob">${dob}</p>
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
                </li>`;
      })
      .join("");
    ul.children[0].classList.add("selected");
  } else {
    ul.innerHTML =
      '<li class="idea"><p></p><p>People collection is empty.</p></li>';
  }
  let id = people[0].id;
  personId = id;
  getIdeas(id);
}

async function getIdeas(id) {
  const personRef = doc(collection(db, "people"), id);
  const docs = query(
    collection(db, "gift-ideas"),
    where("person-id", "==", personRef)
  );
  const querySnapshot = await getDocs(docs);
  const ideas = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    ideas.push({ id, ...data });
  });
  console.log(ideas);
  buildIdeas(ideas);
}

function buildIdeas(ideas) {
  const ul = document.querySelector("ul.idea-list");
  if (ideas.length) {
    ul.innerHTML = ideas
      .map((idea) => {
        return `<li class="idea" data-id="${idea.id}">
                <label for="chk-${idea.id}">
                <input type="checkbox" id="chk-${idea.id}" /> Bought</label>
                <p class="title">${idea.idea}</p>
                <p class="location">${idea.location}</p>
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
              </li>`;
      })
      .join("");
  } else {
    ul.innerHTML = '<li class="idea"><p></p><p>No gift ideas.</p></li>';
  }
  console.log(ideas);
}

async function savePerson() {
  let selectedId = document
    .getElementById("btnSavePerson")
    .getAttribute("data-id");
  let name = document.getElementById("name").value;
  let month = document.getElementById("month").value;
  let day = document.getElementById("day").value;
  if (!name || !month || !day) return;
  const person = {
    name,
    "birth-month": month,
    "birth-day": day,
  };
  if (selectedId) {
    try {
      await setDoc(doc(db, "people", selectedId), person);
      console.log("Document updated for person with ID: ", selectedId);
      document.getElementById("name").value = "";
      document.getElementById("month").value = "";
      document.getElementById("day").value = "";
      document.getElementById("updateAlert").classList.add("active");
      document.getElementById("btnSavePerson").removeAttribute("data-id");
    } catch (err) {
      console.error("Error updating document: ", err);
      alert("Error updating the document.");
    }
  } else {
    try {
      const docRef = await addDoc(collection(db, "people"), person);
      console.log("Document written with ID: ", docRef.id);
      document.getElementById("name").value = "";
      document.getElementById("month").value = "";
      document.getElementById("day").value = "";
      document.getElementById("addAlert").classList.add("active");
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Error adding to the database.");
    }
  }
}

async function handleSelectPerson(ev) {
  const li = ev.target.closest(".person");
  const id = li ? li.getAttribute("data-id") : null;
  if (ev.target.classList.contains("edit")) {
    console.log(id);
    document.querySelector(".overlay").classList.add("active");
    document.getElementById("dlgPerson").classList.add("active");
    const docRef = doc(db, "people", id);
    const docSnapshot = await getDoc(docRef);
    const data = docSnapshot.data();
    let name = document.getElementById("name");
    name.value = data["name"];
    let month = document.getElementById("month");
    month.value = data["birth-month"];
    let day = document.getElementById("day");
    day.value = data["birth-day"];
    document.getElementById("btnSavePerson").setAttribute("data-id", id);
  } else if (ev.target.closest(".delete")) {
    console.log(id);
    document.querySelector(".overlay").classList.add("active");
    document.getElementById("deletePerson").classList.add("active");
    document.getElementById("btnYes").setAttribute("data-id", id);
  } else {
    document.querySelector("li.selected")?.classList.remove("selected");
    li.classList.add("selected");
    personId = id;
    getIdeas(id);
  }
}

async function deletePerson() {
  let selectedId = document.getElementById("btnYes").getAttribute("data-id");
  const docRef = doc(db, "people", selectedId);
  await deleteDoc(docRef);
  document.getElementById("deleteAlert").classList.add("active");
}

async function saveIdea() {
  let ideaId = document.getElementById("btnSaveIdea").getAttribute("data-id");
  let idea = document.getElementById("title").value;
  let location = document.getElementById("location").value;
  if (!idea || !location) return;
  const personRef = doc(db, `/people/${personId}`);
  const giftIdea = {
    idea,
    location,
    "person-id": personRef,
  };
  if (ideaId) {
    try {
      await setDoc(doc(db, "gift-ideas", ideaId), giftIdea);
      console.log("Idea updated in the database.");
      document.getElementById("title").value = "";
      document.getElementById("location").value = "";
      document.getElementById("updateAlert").classList.add("active");
      document.getElementById("btnSaveIdea").removeAttribute("data-id");
      getIdeas(personId);
    } catch (err) {
      console.error("Error updating document: ", err);
      alert("Error updating the document.");
    }
  } else {
    try {
      const docRef = await addDoc(collection(db, "gift-ideas"), giftIdea);
      console.log("Document written with ID: ", docRef.id);
      document.getElementById("title").value = "";
      document.getElementById("location").value = "";
      document.getElementById("addAlert").classList.add("active");
      getIdeas(personId);
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Error adding idea to the database.");
    }
  }
}

async function handleSelectIdea(ev) {
  const li = ev.target.closest(".idea");
  const id = li ? li.getAttribute("data-id") : null;
  ideaId = id;
  if (ev.target.classList.contains("edit")) {
    document.querySelector(".overlay").classList.add("active");
    document.getElementById("dlgIdea").classList.add("active");
    const docRef = doc(db, "gift-ideas", id);
    const docSnapshot = await getDoc(docRef);
    const data = docSnapshot.data();
    let title = document.getElementById("title");
    title.value = data["idea"];
    let location = document.getElementById("location");
    location.value = data["location"];
    document.getElementById("btnSaveIdea").setAttribute("data-id", id);
    console.log("Person ID", personId);
    console.log("Idea ID", id);
  } else if (ev.target.closest(".delete")) {
    console.log("To delete: ", id);
    document.querySelector(".overlay").classList.add("active");
    document.getElementById("deleteIdea").classList.add("active");
    document.getElementById("btnYes").setAttribute("data-id", id);
  } else {
    let checkBox = ev.target.closest("input[type=checkbox]");
    let state = checkBox.checked;
    checkBox.addEventListener("change", toggleBought(state, id));
  }
}

async function deleteIdea() {
  let selectedId = document.getElementById("btnYes").getAttribute("data-id");
  console.log(selectedId);
  const docRef = doc(db, "gift-ideas", selectedId);
  await deleteDoc(docRef);
  document.getElementById("deleteAlert").classList.add("active");
  getIdeas(personId);
}

async function toggleBought(state, id) {
  if (state === true) {
    try {
      await updateDoc(doc(db, "gift-ideas", id), { bought: true });
    } catch (err) {
      console.error("Error updating document: ", err);
    }
  } else {
    try {
      await updateDoc(doc(db, "gift-ideas", id), { bought: false });
    } catch (err) {
      console.error("Error updating document: ", err);
    }
  }
}

function hideOverlay(ev) {
  ev.preventDefault();
  if (
    !ev.target.classList.contains("overlay") &&
    ev.target.id != "btnCancelIdea" &&
    ev.target.id != "btnCancelPerson" &&
    ev.target.id != "btnCancel"
  )
    return;
  document.getElementById("name").value = "";
  document.getElementById("month").value = "";
  document.getElementById("day").value = "";
  document.getElementById("title").value = "";
  document.getElementById("location").value = "";

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
