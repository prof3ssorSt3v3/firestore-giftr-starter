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
    deleteDoc,
    orderBy,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { FirebaseAuth, getAuth, GithubAuthProvider, onAuthStateChanged, signInWithPopup} from "firebase/auth";

// https://fire-giftr-bdb35.firebaseapp.com/__/auth/handler

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-T0hiicTyTYDgcf69PoS9ygZdCkAMGVY",
    authDomain: "fire-giftr-bdb35.firebaseapp.com",
    projectId: "fire-giftr-bdb35",
    storageBucket: "fire-giftr-bdb35.appspot.com",
    messagingSenderId: "562977688887",
    appId: "1:562977688887:web:d3c958e0e5d29f7e92deb2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get a reference to the database
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
let selectedPersonId = null;

const q = query(
    collection(db, "collection-name"),
    where("prop", "==", "value")
);

const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                console.log("New data: ", change.doc.data());
            }
            if (change.type === "modified") {
                console.log("Modified data: ", change.doc.data());
            }
            if (change.type === "removed") {
                console.log("Removed data: ", change.doc.data());
            }
        });
    },
    (err) => {
        console.log(`Encountered error: ${err}`);
    }
);
unsubscribe();

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

    document
        .getElementById("btnAddIdea")
        .addEventListener("click", showOverlay);

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

    document
        .getElementById("signInOutBtn")
        .addEventListener("click", attemptLogin);

    loadInitialData();

    //TODO: add the `onSnapshot` listener
});

function loadInitialData() {
    //load the people collection and display
    //select the first person on the list
    //load the gift-ideas collection and display
}

const auth = getAuth(app);

const provider = new GithubAuthProvider();

provider.setCustomParameters({
    allow_signup: "true", //let the user signup for a Github account through the interface
});

onAuthStateChanged(auth, (user) => {

    let signInOut = document.getElementById("signInOutBtn");

    if (user) {
        // User is signed in, see docs for a list of available properties

        signInOut.innerHTML = `Sign Out`;
        signInOut.removeEventListener("click", attemptLogin);
        signInOut.addEventListener("click", attemptLogout);
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        console.log("You're logged in");
        document.querySelector("main").style.removeProperty("display");
        getPeople();
        // ...
    } else {
        // User is signed out
        signInOut.innerHTML = `Log In`;
        signInOut.addEventListener("click", attemptLogin);
        signInOut.removeEventListener("click", attemptLogout);
        console.log("You're logged out");
        document.querySelector("main").style.display = "none";
    }
});

async function getUser() {
    const ref = await doc(db, "users", auth.currentUser.uid);
    return ref; //if you need the user reference
}

function attemptLogin() {
    //try to login with the global auth and provider objects
    console.log("Attempting to login");
    signInWithPopup(auth, provider)
        .then((result) => {

            console.log(result);
            //IF YOU USED GITHUB PROVIDER
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info.
            const user = result.user;
            const usersColRef = collection(db, "users");
            setDoc(
                doc(usersColRef, user.uid),
                {
                    displayName: user.displayName,
                },
                { merge: true }
            ); 
            onAuthStateChanged()
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            // const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GithubAuthProvider.credentialFromError(error);
        });
}

function attemptLogout() {
    console.log("Attempting to log out");
    auth.signOut();
}


async function getPeople() {
    const userRef = await getUser();
    console.log("getting user", userRef);
    const peopleCollectionRef = collection(db, "people"); //collection we want to query
    const docs = query(
        peopleCollectionRef,
        where('owner', '==', userRef)
    );
    //call this from DOMContentLoaded init function
    //the db variable is the one created by the getFirestore(app) call.
    const querySnapshot = await getDocs(docs);
    querySnapshot.forEach((doc) => {
        //every `doc` object has a `id` property that holds the `_id` value from Firestore.
        //every `doc` object has a doc() method that gives you a JS object with all the properties
        const data = doc.data();
        const id = doc.id;
        people.push({ id, ...data });
    });
    //select the first person from the list of people
    selectedPersonId = buildPeople(people);
    //select the matching <li> by clicking on a list item
    let li = document.querySelector(`[data-id="${selectedPersonId}"]`);
    li.click();
}

function buildPeople(people) {
    //build the HTML
    const ul = document.querySelector("ul.person-list");
    //replace the old ul contents with the new.
    ul.innerHTML = people
        .map((person) => {
            const dob = `${months[person["birth-month"] - 1]} ${
                person["birth-day"]
            }`;
            //Use the number of the birth-month less 1 as the index for the months array
            return `<li data-id="${person.id}" class="person">
                <div class="person-text">
                    <p class="name">${person.name}</p>
                    <p class="dob">${dob}</p>
                </div>
                <div class="person-buttons">
                    <span id="btnSavePerson" class="material-symbols-outlined edit">edit</span>
                    <span class="material-symbols-outlined delete">close</span>
                </div>
            </li>`;
        })
        .join("");

    // return the first person's id
    let selected = people[0].id;
    // console.log(selected);
    return selected;
}

function showPerson(person) {
    //add the newly created person OR update if person exists
    //  console.log(person)
    //console.log('prepop',people)
    //    people.pop(person)
    //    console.log('postpop',people)
    //    const ul = document.querySelector("ul.person-list");
    //    const dob = `${months[person["birth-month"] - 1]} ${person["birth-day"]}`;

    //    ul.innerHTML += `<li data-id="${person.id}" class="person">
    //    <p class="name">${person.name}</p>
    //    <p class="dob">${dob}</p>
    //    <div class="person-buttons">
    //      <span id="btnSavePerson" class="material-symbols-outlined edit">edit</span>
    //      <span class="material-symbols-outlined delete">close</span>
    //    </div>
    //  </li>`;

    let li = document.querySelector(`[data-id="${person.id}"]`);
    console.log(li);
    if (li) {
        //update on screen
        people.pop(person);
        const dob = `${months[person["birth-month"] - 1]} ${
            person["birth-day"]
        }`;
        //Use the number of the birth-month less 1 as the index for the months array
        //replace the existing li with this new HTML
        li.outerHTML = 
        `<li data-id="${person.id}" class="person">
        <div class="person-text">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
        </div>
        <div class="person-buttons">
            <span id="btnSavePerson" class="material-symbols-outlined edit">edit</span>
            <span class="material-symbols-outlined delete">close</span>
        </div>
        </li>`;
    } else {
        //add to screen
        const dob = `${months[person["birth-month"] - 1]} ${
            person["birth-day"]
        }`;
        //Use the number of the birth-month less 1 as the index for the months array
        const ul = document.querySelector("ul.person-list");

        ul.innerHTML += 
        `<li data-id="${person.id}" class="person">
            <div class="person-text">
                <p class="name">${person.name}</p>
                <p class="dob">${dob}</p>
            </div>
            <div class="person-buttons">
                <span id="btnSavePerson" class="material-symbols-outlined edit">edit</span>
                <span class="material-symbols-outlined delete">close</span>
            </div>
        </li>`;
    }
    people.push(person);
}

async function handleSelectPerson(ev) {
    //ev.target; - could be the button OR anything in the ul.
    const li = ev.target.closest(".person"); //see if there is a parent <li class="person">
    // console.log(`${li.getAttribute('data-id')} was clicked`);
    const id = li ? li.getAttribute("data-id") : null; // if li exists then the user clicked inside an <li>

    if (id) {
        //user clicked inside li
        selectedPersonId = id;
        //did they click the li content OR an edit button OR a delete button?
        if (ev.target.classList.contains("edit")) {
            //EDIT the doc using the id to get a docRef
            const personRef = doc(collection(db, "people"), selectedPersonId);
            console.log("this is id", selectedPersonId);
            console.log("this is personRef", personRef);
            getDoc(personRef)
                .then((doc) => {
                    console.log(doc.data());
                    console.log(
                        doc.get("name"),
                        doc.get("birth-month"),
                        doc.get("birth-day")
                    );
                    document.getElementById("name").value = doc.get("name");
                    document.querySelector("#month").value =
                        doc.get("birth-month");
                    document.querySelector("#day").value = doc.get("birth-day");
                })
                .catch((error) => {
                    console.log("Error getting document:", error);
                });
            document
                .querySelector("#btnSavePerson")
                .setAttribute("data-id", id);
            document.querySelector("#btnAddPerson").click();
        } else if (ev.target.classList.contains("delete")) {
            //DELETE the doc using the id to get a docRef
            //do a confirmation before deleting
            const docRef = doc(db, "people", id);
            if (confirm("Are you sure you want to delete this person?")) {
                deleteDoc(docRef)
                    .then(() => {
                        console.log("Document successfully deleted!");
                        document.querySelector(`[data-id="${id}"]`).remove();
                    })
                    .catch((error) => {
                        console.error("Error removing document: ", error);
                    });
            }
        } else {
            //content inside the <li> but NOT a <button> was clicked
            //remove any previously selected styles
            document.querySelector("li.selected")?.classList.remove("selected");
            //Highlight the newly selected person
            li.classList.add("selected");
            //and load all the gift idea documents for that person
            getIdeas(id);
        }
    } else {
        //clicked a button not inside <li class="person">
        //Show the dialog form to ADD the doc (same form as EDIT)
        //showOverlay function can be called from here or with the click listener in DOMContentLoaded, not both
    }
}

async function handleSelectIdea(ev) {
    //ev.target; - could be the button OR anything in the ul.
    const li = ev.target.closest(".idea"); //see if there is a parent <li class="person">
    // console.log(`${li.getAttribute('data-id')} was clicked`);
    const id = li ? li.getAttribute("data-id") : null; // if li exists then the user clicked inside an <li>

    if (id) {
        //user clicked inside li
        const selectedIdeaId = id;
        //did they click the li content OR an edit button OR a delete button?
        if (ev.target.classList.contains("edit")) {
            //EDIT the doc using the id to get a docRef
            const ideaRef = doc(collection(db, "gift-ideas"), selectedIdeaId);

            getDoc(ideaRef)
                .then((doc) => {
                    document.getElementById("title").value = doc.get("title");
                    document.querySelector("#location").value =
                        doc.get("location");
                })
                .catch((error) => {
                    console.log("Error getting document:", error);
                });
            document.querySelector("#btnSaveIdea").setAttribute("data-id", id);
            document.querySelector("#btnAddIdea").click();
        } else if (ev.target.classList.contains("delete")) {
            //DELETE the doc using the id to get a docRef
            //do a confirmation before deleting
            const docRef = doc(db, "gift-ideas", id);
            if (confirm("Are you sure you want to delete this idea?")) {
                deleteDoc(docRef)
                    .then(() => {
                        console.log("Document successfully deleted!");
                        document.querySelector(`[data-id="${id}"]`).remove();
                    })
                    .catch((error) => {
                        console.error("Error removing document: ", error);
                    });
            }
        }
    } else {
        //clicked a button not inside <li class="person">
        //Show the dialog form to ADD the doc (same form as EDIT)
        //showOverlay function can be called from here or with the click listener in DOMContentLoaded, not both
        console.log("inside handleideaelse");
    }
}

async function getIdeas(id) {
    //the person-id property in gift-ideas will be like `/people/lasdjkflaskdfjsdlfk`
    //and it is a REFERENCE not a string. So, we use a reference to the person object
    const personRef = doc(collection(db, "people"), id);
    // const querySnapshot = await getDocs(collection(db, "people"));

    const ideaCollectionRef = collection(db, "gift-ideas"); //collection we want to query
    const docs = query(ideaCollectionRef, where("person-id", "==", personRef));

    const querySnapshot = await getDocs(docs);
    const ideas = [];
    querySnapshot.forEach((doc) => {
        //every `doc` object has a `id` property that holds the `_id` value from Firestore.
        //every `doc` object has a doc() method that gives you a JS object with all the properties
        const data = doc.data();
        const id = doc.id;

        //person_id is a reference type
        //we want the actual id string in our object use id to get the _id
        ideas.push({
            id,
            title: data.title,
            location: data.location,
            bought: data.bought,
            person_id: data["person-id"].id,
            person_ref: data["person-id"],
        });
    });
    //now build the HTML from the ideas array
    buildIdeas(ideas);
}

function buildIdeas(ideas) {
    const ul = document.querySelector(".idea-list");
    if (ideas.length) {
        ul.innerHTML = ideas
            .map((idea) => {
                return `<li class="idea" data-id="${idea.id}">
                <label for="chk-${idea.id}"
                  ><input type="checkbox" id="chk-${idea.id}" /> Bought</label
                >
                <div class="idea-text">
                  <p class="title">${idea.title}</p>
                  <p class="location">${idea.location}</p>
                </div>
                <div class="idea-buttons">
                  <span id="btnSaveIdea" class="material-symbols-outlined edit">edit</span>
                  <span class="material-symbols-outlined delete">close</span>
                </div>
              </li>`;
            })
            .join("");
    } else {
        ul.innerHTML =
            '<li class="idea"><div class="noIdeas"><p></p><p>No Gift Ideas for selected person.</p></div></li>'; //clear in case there are no records to shows
    }
    //add listener for 'change' or 'input' event on EVERY checkbox '.idea [type="checkbox"]'
    const checkboxes = document.querySelectorAll(".idea [type='checkbox']");
    // which will call a function to update the `bought` value for the document
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleCheckbox);
        let getData = JSON.parse(localStorage.getItem(checkbox.id));
        checkbox.checked = getData;
    });

    function handleCheckbox() {
        // console.log(this);
        const id = this.id; //get the current id of the checkbox
        const bought = this.checked; //get the current checked value of the checkbox
        localStorage.setItem(id, bought); //save the checked value to local storage
    }
}

async function savePerson() {
    //take the information from the dialog, save as an object, push to firestore
    let name = document.getElementById("name").value;
    let month = document.getElementById("month").value;
    let day = document.getElementById("day").value;
    if (!name || !month || !day) return; //form needs more info
    const person = {
        owner: auth.currentUser.uid,
        name,
        "birth-month": month,
        "birth-day": day,
    };
    try {
        const selectedPersonId = document
            .querySelector("#btnSavePerson")
            .getAttribute("data-id");
        if (selectedPersonId != null) {
            const personRef = doc(collection(db, "people"), selectedPersonId);
            const docRef = await updateDoc(personRef, person);
            //1. clear the form fields
            document.getElementById("name").value = "";
            document.getElementById("month").value = "";
            document.getElementById("day").value = "";
            //2. hide the dialog and the overlay by clicking on overlay
            document.querySelector(".overlay").click();
            //3. TODO: display a message to the user about success
            addedUser();
            function addedUser() {
                //display a message to the user
                let message =
                    "You have successfully updated an existing person";
                alert(message);
            }
            person.id = selectedPersonId;
            document
                .querySelector("#btnSavePerson")
                .setAttribute("data-id", null);
            //4. ADD the new HTML to the <ul> using the new object
            showPerson(person);
        } else {
            const docRef = await addDoc(collection(db, "people"), person);
            //1. clear the form fields
            document.getElementById("name").value = "";
            document.getElementById("month").value = "";
            document.getElementById("day").value = "";
            //2. hide the dialog and the overlay by clicking on overlay
            document.querySelector(".overlay").click();
            //3. TODO: display a message to the user about success
            addedUser();
            function addedUser() {
                //display a message to the user
                let message = "You have successfully added a new person";
                alert(message);
            }
            person.id = docRef.id;
            //4. ADD the new HTML to the <ul> using the new object
            showPerson(person);
        }
    } catch (err) {
        console.error("Error adding document: ", err);
        //do you want to stay on the dialog?
        //display a mesage to the user about the problem
    }
    //TODO: update this function to work as an UPDATE method too
}

async function saveIdea() {
    //take the information from the dialog, save as an object, push to firestore
    let title = document.getElementById("title").value;
    let location = document.getElementById("location").value;
    if (!title || !location) return; //form needs more info
    //a new idea needs a reference to the person

    const personRef = doc(db, `/people/${selectedPersonId}`);
    const idea = {
        title,
        location,
        "person-id": personRef,
    };

    try {
        const selectedIdeaId = document
            .querySelector("#btnSaveIdea")
            .getAttribute("data-id");
        console.log("this is selec", selectedPersonId);
        console.log(selectedIdeaId);
        console.log(personRef);
        if (selectedIdeaId != null) {
            console.log("inside edit idea");

            const ideaRef = doc(collection(db, "gift-ideas"), selectedIdeaId);
            const docRef = await updateDoc(ideaRef, idea);
            //1. clear the form fields
            document.getElementById("title").value = "";
            document.getElementById("location").value = "";
            //2. hide the dialog and the overlay by clicking on overlay
            document.querySelector(".overlay").click();
            //3. TODO: display a message to the user about success
            addedIdea();
            function addedIdea() {
                //display a message to the user
                let message = "You have successfully updated an existing idea";
                alert(message);
            }
            idea.id = selectedIdeaId;
            //4. ADD the new HTML to the <ul> using the new object
            getIdeas(selectedPersonId);
            document.querySelector("#btnSaveIdea").setAttribute("data-id", "");
        } else {
            console.log("idea", idea);
            const docRef = await addDoc(collection(db, "gift-ideas"), idea);
            idea.id = docRef.id;
            //1. clear the form fields
            document.getElementById("title").value = "";
            document.getElementById("location").value = "";
            //2. hide the dialog and the overlay by clicking on overlay
            document.querySelector(".overlay").click();
            //3. TODO: display a message to the user about success

            //4. ADD the new HTML to the <ul> using the new object
            //just recall the method to show all ideas for the selected person
            getIdeas(selectedPersonId);
        }
    } catch (err) {
        console.error("Error adding document: ", err);
        //do you want to stay on the dialog?
        //display a mesage to the user about the problem
    }
    //TODO: update this function to work as an UPDATE method too
}

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
    console.log(ev.target.id);
    ev.preventDefault();
    document.querySelector(".overlay").classList.add("active");
    const id = ev.target.id === "btnAddPerson" ? "dlgPerson" : "dlgIdea";
    document.getElementById(id).classList.add("active");
}
