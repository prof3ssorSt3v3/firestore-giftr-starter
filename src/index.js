import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyB_hRsGbf4eG2RXFON-Wy-L87va4ElDS8M",
	authDomain: "fire-giftr-28207.firebaseapp.com",
	projectId: "fire-giftr-28207",
	storageBucket: "fire-giftr-28207.appspot.com",
	messagingSenderId: "660171535547",
	appId: "1:660171535547:web:8a8bcf7e37a4cd3410e59e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get a reference to the database
const db = getFirestore(app);
const people = [];

document.addEventListener("DOMContentLoaded", () => {
	//set up the dom events

	getPeople();

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

async function getPeople() {
	const querySnapshot = await getDocs(collection(db, "people"));
	querySnapshot.forEach((doc) => {
		//every `doc` object has a `id` property that holds the `_id` value from Firestore.
		//every `doc` object has a doc() method that gives you a JS object with all the properties
		const data = doc.data();
		const id = doc.id;
		people.push({ id, ...data });
	});
	buildPeople(people);
}

function buildPeople(people) {
	//build the HTML
	let ul = document.querySelector("ul.person-list");
	let months = [
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
	//replace the old ul contents with the new.
	ul.innerHTML = people
		.map((person) => {
			const dob = `${months[person["birth-month"] - 1]} ${person["birth-day"]}`;
			//Use the number of the birth-month less 1 as the index for the months array
			return `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
          </li>`;
		})
		.join("");
}

function hideOverlay(ev) {
	ev.preventDefault();
	console.log("TEST");
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
