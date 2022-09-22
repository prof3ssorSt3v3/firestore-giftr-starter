import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	doc,
	query,
	addDoc,
	onSnapshot,
	setDoc,
	deleteDoc,
	updateDoc,
	where,
	getDocs,
} from "firebase/firestore";

// Firebase configuration
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

let selectedPersonId = null;
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

//Set up the dom events
document.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("btnCancelPerson")
		.addEventListener("click", hideOverlay);
	document
		.getElementById("btnCancelIdea")
		.addEventListener("click", hideOverlay);

	document
		.getElementById("btnAddPerson")
		.addEventListener("click", showOverlay);

	document
		.getElementById("btnSavePerson")
		.addEventListener("click", savePerson);
	document.getElementById("btnSaveIdea").addEventListener("click", saveIdea);

	document
		.getElementById("location")
		.addEventListener("input", removeErrorState);

	document.getElementById("title").addEventListener("input", removeErrorState);
});

///////////////////////////////////////////////////
/////////////////////PEOPLE////////////////////////
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓//

const pQuery = query(collection(db, "people"));

//Listening to people changes
const peopleChange = onSnapshot(
	pQuery,
	(querySnapshot) => {
		people = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			const id = doc.id;
			people.push({ id, ...data });
		});
		buildPeople(people);

		//disabling Add IDea button when there's no people
		if (!people.length == 0) {
			document
				.getElementById("btnAddIdea")
				.addEventListener("click", showOverlay);
			document.getElementById("btnAddIdea").classList.remove("disabled");
		} else {
			document
				.getElementById("btnAddIdea")
				.removeEventListener("click", showOverlay);
			document.getElementById("btnAddIdea").classList.add("disabled");
		}
	},
	(err) => {
		//error handler
	}
);

//Building people
function buildPeople(people) {
	let ul = document.querySelector("ul.person-list");
	if (!people.length == 0) {
		//replace the old ul contents with the new.
		ul.innerHTML = people
			.map((person) => {
				const dob = `${months[person["birth-month"] - 1]} ${
					person["birth-day"]
				}`;
				//Use the number of the birth-month less 1 as the index for the months array
				return `<li data-id="${person.id}" data-name="${person.name}" data-month="${person["birth-month"]}" data-day="${person["birth-day"]}" class="person">
						<div class ="person-container">
						<div class="person-info">
						<p class="name">${person.name}</p>
						<p class="dob">${dob}</p>
						</div>
						<div class="person-actions">
						<button data-id="btnEditPerson" class="person-button edit">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.02 5.828L15.85 3L20.799 7.95L17.97 10.778M13.02 5.828L3.41397 15.435C3.22642 15.6225 3.12103 15.8768 3.12097 16.142V20.678H7.65697C7.92217 20.6779 8.17648 20.5725 8.36397 20.385L17.97 10.778M13.02 5.828L17.97 10.778" stroke="#00000080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						</button>
						<button data-id="btnDeletePerson"class="person-button delete">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M19 11V20.4C19 20.5591 18.9368 20.7117 18.8243 20.8243C18.7117 20.9368 18.5591 21 18.4 21H5.6C5.44087 21 5.28826 20.9368 5.17574 20.8243C5.06321 20.7117 5 20.5591 5 20.4V11M10 17V11M14 17V11M21 7H16M3 7H8M8 7V3.6C8 3.44087 8.06321 3.28826 8.17574 3.17574C8.28826 3.06321 8.44087 3 8.6 3H15.4C15.5591 3 15.7117 3.06321 15.8243 3.17574C15.9368 3.28826 16 3.44087 16 3.6V7M8 7H16" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						</button>
						</div>
						</div>
						
          </li>`;
			})
			.join("");

		document.querySelectorAll(".person-button.delete").forEach((button) => {
			button.addEventListener("click", deleteConfirm);
		});

		document.querySelectorAll(".person-button.edit").forEach((button) => {
			button.addEventListener("click", showOverlay);
		});

		//making 1st person selected by default
		let selectedPerson = document.querySelector("li.person");
		selectedPerson.classList.add("selected");

		selectedPersonId = selectedPerson.getAttribute("data-id");

		document.querySelectorAll(".person-info").forEach((item) => {
			item.addEventListener("click", setActivePerson);
		});
	} else {
		ul.innerHTML = `
		<div class="no-items">
		<p>
		Looks like there's no people added yet. Click "Add person" 🤓.
		</p>
		</div>
		`;
	}
}

//Setting selected person
function setActivePerson(ev) {
	let activePerson = ev.target.closest("li");
	document.querySelectorAll("li.person").forEach((li) => {
		li.classList.remove("selected");
	});

	activePerson.classList.add("selected");
	selectedPersonId = activePerson.getAttribute("data-id");
	getIdeas();
}

//Saving people
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

	let id = document.getElementById("btnSavePerson").getAttribute("data-id");

	if (!id) {
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
			alert(`${name} added`);
			person.id = docRef.id;
			getIdeas();
			//4. ADD the new HTML to the <ul> using the new object
			// getPeople();
		} catch (err) {
			console.error("Error adding document: ", err);
			//do you want to stay on the dialog?
			//display a mesage to the user about the problem
		}
	} else {
		const docRef = await setDoc(doc(db, "people", id), person);
		hideOverlay();
	}
	// getPeople();
}

///////////////////////////////////////////////////
////////////////////////IDEAS//////////////////////
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓//

const gQuery = query(collection(db, "gift-ideas"));

//Listening to ideas changes
const ideasChange = onSnapshot(gQuery, (querySnapshot) => {
	ideas = [];
	querySnapshot.forEach(
		(doc) => {
			const data = doc.data();
			const id = doc.id;
			ideas.push({ id, ...data });
		},
		(err) => {}
	);

	getIdeas();
});

//Gettings ideas from the local array
function getIdeas() {
	if (!people.length == 0) {
		const personRef = doc(collection(db, "people"), selectedPersonId);
		let filteredIdeas = ideas.filter(
			(obj) => obj["person-id"].id === personRef.id
		);
		buildIdeas(filteredIdeas);
	} else buildIdeas();
}

//Bulding ideas
function buildIdeas(filteredIdeas) {
	let ul = document.querySelector("ul.idea-list");

	//Checking if there are any people
	if (!people.length == 0) {
		//Checking if there are any ideas for this people
		if (filteredIdeas.length > 0) {
			ul.innerHTML = filteredIdeas
				.map((item) => {
					return `<li data-id="${item.id}" data-idea="${item.idea}" data-location="${item.location}" class="idea">
								<div class="idea-checkbox">
								<label for="chk-${item.id}"> 
									<input type="checkbox" id="${item.id}"/> Bought
								</label>
								</div>
								<div class="idea-info">
									<div>
									<p class="title" >${item.idea}</p>
									<p class="location" >${item.location}</p>
									</div>
							
									<div class="idea-actions">
									
									
									<button data-id="btnEditIdea" class="idea-button edit">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.02 5.828L15.85 3L20.799 7.95L17.97 10.778M13.02 5.828L3.41397 15.435C3.22642 15.6225 3.12103 15.8768 3.12097 16.142V20.678H7.65697C7.92217 20.6779 8.17648 20.5725 8.36397 20.385L17.97 10.778M13.02 5.828L17.97 10.778" stroke="#00000080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						</button>
						<button data-id="btnDeleteIdea" class="idea-button delete">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M19 11V20.4C19 20.5591 18.9368 20.7117 18.8243 20.8243C18.7117 20.9368 18.5591 21 18.4 21H5.6C5.44087 21 5.28826 20.9368 5.17574 20.8243C5.06321 20.7117 5 20.5591 5 20.4V11M10 17V11M14 17V11M21 7H16M3 7H8M8 7V3.6C8 3.44087 8.06321 3.28826 8.17574 3.17574C8.28826 3.06321 8.44087 3 8.6 3H15.4C15.5591 3 15.7117 3.06321 15.8243 3.17574C15.9368 3.28826 16 3.44087 16 3.6V7M8 7H16" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						</button>
									
									</div>
								</div>
	        </li>`;
				})
				.join("");

			// Marking idea as bought in the UI
			filteredIdeas.forEach((idea) => {
				if (idea.isBought) {
					let checkbox = document.getElementById(idea.id);
					checkbox.checked = true;
				}
			});

			// Event listeners for ideas
			document.querySelectorAll(".idea-button.delete").forEach((button) => {
				button.addEventListener("click", deleteConfirm);
			});

			document.querySelectorAll(".idea-button.edit").forEach((button) => {
				button.addEventListener("click", showOverlay);
			});

			let checkboxes = document.querySelectorAll('[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				checkbox.addEventListener("click", markBought);
			});
		} else {
			ul.innerHTML = `
			<p>No ideas for this person. Try adding some above 🤓
			</p>
			`;
		}
	} else {
		// if there's no people
		ul.innerHTML = ``;
	}
}

// Marking idea as bought/not bought
function markBought(ev) {
	let isBoughtValue = ev.target.checked;

	const ideaRef = doc(db, "gift-ideas", ev.target.id);

	updateDoc(ideaRef, {
		isBought: isBoughtValue,
	});
}

//Saving ideas
async function saveIdea() {
	let ideaInput = document.getElementById("title");
	let idea = ideaInput.value;

	let locationInput = document.getElementById("location");
	let location = locationInput.value;

	const personRef = doc(collection(db, "people"), selectedPersonId);
	if (!idea || !location) {
		if (!idea) {
			ideaInput.classList.add("error");
		} else {
			locationInput.classList.add("error");
		}
	} else {
		const giftIdea = {
			idea,
			location,
			"person-id": personRef,
			isBought: false,
		};

		let id = document.getElementById("btnSaveIdea").getAttribute("data-id");

		if (!id) {
			try {
				const docRef = await addDoc(collection(db, "gift-ideas"), giftIdea);
				console.log("Document written with ID: ", docRef.id);
				//1. clear the form fields
				document.getElementById("title").value = "";
				document.getElementById("location").value = "";
				//2. hide the dialog and the overlay
				hideOverlay();
				//3. display a message to the user about success
				alert(`${idea} added`);
				giftIdea.id = docRef.id;
				//4. ADD the new HTML to the <ul> using the new object
			} catch (err) {
				console.error("Error adding document: ", err);
				//do you want to stay on the dialog?
				//display a mesage to the user about the problem
			}
		} else {
			const docRef = await setDoc(doc(db, "gift-ideas", id), giftIdea);
			hideOverlay();
		}
	}
}

////////////////////////////////////////////////////
//////////////////////DELETEING/////////////////////
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓//

function deleteConfirm(ev) {
	let id = ev.target.closest("li").getAttribute("data-id");
	console.log(id);
	//If deleting an idea
	if (ev.target.closest("button").getAttribute("data-id") === "btnDeleteIdea") {
		let ideaName = ev.target.closest("li").getAttribute("data-idea");

		if (confirm(`Are you sure you want to delete ${ideaName}?`)) {
			deleteItem("gift-ideas", id);
		}
	} else {
		//If deleting a person
		let personName = ev.target.closest("li").getAttribute("data-name");

		if (confirm(`Are you sure you want to delete ${personName}?`)) {
			deleteItem("people", id);
		}
	}
}

async function deleteItem(collectionName, id) {
	await deleteDoc(doc(db, collectionName, id));
	getIdeas();

	// Deleteing all ideas for a deleted person
	if (collectionName == "people") {
		const personRef = doc(collection(db, "people"), id);
		const docs = query(
			collection(db, "gift-ideas"),
			where("person-id", "==", personRef)
		);

		let querySnapshot = await getDocs(docs);

		querySnapshot.forEach((item) => {
			deleteDoc(doc(db, "gift-ideas", item.id));
		});
		console.log(selectedPersonId);
	}
}

////////////////////////////////////////////////////
//////////////////////OVERLAYS//////////////////////
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓//

function hideOverlay(ev) {
	if (ev) {
		ev.preventDefault();
	}
	document.getElementById("btnSavePerson").removeAttribute("data-id");
	document.getElementById("btnSaveIdea").removeAttribute("data-id");

	document.querySelector(".overlay").classList.remove("active");
	document
		.querySelectorAll(".overlay dialog")
		.forEach((dialog) => dialog.classList.remove("active"));
}

function showOverlay(ev) {
	ev.preventDefault();

	document.getElementById("name").value = "";
	document.getElementById("day").value = "1";
	document.getElementById("month").value = "1";

	document.getElementById("title").value = "";
	document.getElementById("location").value = "";

	document.querySelector(".overlay").classList.add("active");
	if (ev.target.id === "btnAddPerson" || ev.target.id === "btnAddIdea") {
		if (ev.target.id === "btnAddPerson") {
			const id = "dlgPerson";
			document.getElementById(id).classList.add("active");
		} else {
			const id = "dlgIdea";
			document.getElementById(id).classList.add("active");
		}
	} else {
		if (ev.target.closest("button").getAttribute("data-id") === "btnEditIdea") {
			const id = "dlgIdea";
			document.getElementById(id).classList.add("active");
			let li = ev.target.closest("li");

			let ideaId = li.getAttribute("data-id");
			let idea = li.getAttribute("data-idea");
			let location = li.getAttribute("data-location");

			document.getElementById("title").value = idea;
			document.getElementById("location").value = location;

			document.getElementById("btnSaveIdea").setAttribute("data-id", ideaId);
		} else {
			const id = "dlgPerson";
			document.getElementById(id).classList.add("active");

			let li = ev.target.closest("li");
			let personName = li.getAttribute("data-name");
			let personDay = li.getAttribute("data-day");
			let personMonth = li.getAttribute("data-month");

			document.getElementById("name").value = personName;
			document.getElementById("day").value = personDay;
			document.getElementById("month").value = personMonth;

			document
				.getElementById("btnSavePerson")
				.setAttribute("data-id", selectedPersonId);
		}
	}
}

function removeErrorState(ev) {
	document.getElementById(ev.target.id).classList.remove("error");
}
