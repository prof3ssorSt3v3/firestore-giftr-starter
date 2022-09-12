import { initializeApp } from "firebase/app";
import {
	getFirestore,
	where,
	collection,
	doc,
	getDocs,
	query,
	addDoc,
} from "firebase/firestore";

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

	document
		.getElementById("btnAddPerson")
		.addEventListener("click", showOverlay);
	document.getElementById("btnAddIdea").addEventListener("click", showOverlay);

	document
		.getElementById("btnSavePerson")
		.addEventListener("click", savePerson);
});

//Getting people list
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

//Building people
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

	//making 1st person selected by default
	let selectedPerson = document.querySelector("li.person");
	selectedPerson.classList.add("selected");

	let personId = selectedPerson.getAttribute("data-id");
	console.log(personId);

	getIdeas(personId);

	document.querySelectorAll("li.person").forEach((item) => {
		item.addEventListener("click", setActivePerson);
	});
}

function setActivePerson(ev) {
	let activePerson = ev.target.closest("li");
	document.querySelectorAll("li.person").forEach((li) => {
		li.classList.remove("selected");
	});

	activePerson.classList.add("selected");
	let id = activePerson.getAttribute("data-id");
	getIdeas(id);
}

//Getting right ideas for people
async function getIdeas(id) {
	const personRef = doc(collection(db, "people"), id);

	//then run a query where the `person-id` property matches the reference for the person
	const docs = query(
		collection(db, "gift-ideas"),
		where("person-id", "==", personRef)
	);

	const querySnapshot = await getDocs(docs);
	let ideas = [];

	querySnapshot.forEach((doc) => {
		const data = doc.data();
		const id = doc.id;
		if (!ideas.find((item) => item.id === id)) {
			ideas.push({ id, ...data });
		}
	});

	buildIdeas(ideas);
}

//Bulding ideas list
function buildIdeas(ideas) {
	let ul = document.querySelector("ul.idea-list");
	if (!ideas.length == 0) {
		ul.innerHTML = ideas
			.map((item) => {
				return `<li data-id="${item.id}" class="idea">
	        		<label for="chk-${item.id}">
							<input type="checkbox" id="${item.id}"/> Bought
						</label>
						<p class="title">${item.idea}</p>
						<p class="location">${item.location}</p>
	        </li>`;
			})
			.join("");
	} else {
		let ul = document.querySelector("ul.idea-list");
		ul.innerHTML = `<li class="idea"> 
						<p class="title" >No ideas for this person</p>
	        </li>`;
	}
}

async function savePerson(ev) {
	//function called when user clicks save button from person dialog
	let name = document.getElementById("name").value;
	let month = document.getElementById("month").value;
	let day = document.getElementById("day").value;
	if (!name || !month || !day) return; //form needs more info
	const person = {
		name,
		"birth-month": month,
		"birth-day": day,
	};
	try {
		const docRef = await addDoc(collection(db, "people"), person);
		console.log("Document written with ID: ", docRef.id);
		//1. clear the form fields
		document.getElementById("name").value = "";
		document.getElementById("month").value = "";
		document.getElementById("day").value = "";
		//2. hide the dialog and the overlay
		hideOverlay();
		//3. display a message to the user about success
		// tellUser(`Person ${name} added to database`);
		person.id = docRef.id;
		//4. ADD the new HTML to the <ul> using the new object
		// showPerson(person);
	} catch (err) {
		console.error("Error adding document: ", err);
		//do you want to stay on the dialog?
		//display a mesage to the user about the problem
	}
}
function hideOverlay(ev) {
	ev.preventDefault();
	console.log("hid overlay");
	document.querySelector(".overlay").classList.remove("active");
	document
		.querySelectorAll(".overlay dialog")
		.forEach((dialog) => dialog.classList.remove("active"));
}
function showOverlay(ev) {
	ev.preventDefault();
	document.querySelector(".overlay").classList.add("active");
	console.log(ev.target.id);
	if (ev.target.id === "btnAddPerson") {
		const id = "dlgPerson";
		document.getElementById(id).classList.add("active");
	} else {
		const id = "dlgIdea";
		document.getElementById(id).classList.add("active");
	}
	//TODO: check that person is selected before adding an idea
}
