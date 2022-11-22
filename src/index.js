import { initializeApp } from 'firebase/app';
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
    onSnapshot
} from "firebase/firestore";
import { getAuth, GithubAuthProvider } from "firebase/auth"; 

const auth = getAuth();
const provider = new GithubAuthProvider();

function attemptLogin() {
    //try to login with the global auth and provider objects
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            const user = result.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GithubAuthProvider.credentialFromError(error);
        });
}

function validateWithToken(token) {
    const credential = GithubAuthProvider.credential(token);
    signInWithCredential(auth, credential)
        .then((result) => {
            //the token and credential were still valid
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
        });
}

// const provider = new GithubAuthProvider();
// signInWithPopup(auth, provider).then().catch();

// const credential = GithubAuthProvider.credential(token);
// signInWithCredential(auth, credential).then().catch();

provider.setCustomParameters({
    allow_signup: "true",
});

const firebaseConfig = {
    apiKey: "AIzaSyCnd_Nrkvmx3q-I1FKsmYkTeGjDhq28o10",
    authDomain: "fir-project-71a09.firebaseapp.com",
    projectId: "fir-project-71a09",
    storageBucket: "fir-project-71a09.appspot.com",
    messagingSenderId: "596178489530",
    appId: "1:596178489530:web:16d4723af6063f48d5b283",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const people = [];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let selectedPersonId = null;

document.addEventListener('DOMContentLoaded', () => {
  //set up the dom events
  document
    .getElementById('btnCancelPerson')
    .addEventListener('click', hideOverlay);
  document
    .getElementById('btnCancelIdea')
    .addEventListener('click', hideOverlay);
  document.querySelector('.overlay').addEventListener('click', hideOverlay);

  document
    .getElementById('btnAddPerson')
    .addEventListener('click', showOverlay);
  document.getElementById('btnAddIdea').addEventListener('click', showOverlay);

  document
    .getElementById('btnSavePerson')
    .addEventListener('click', savePerson);
  document.getElementById('btnSaveIdea').addEventListener('click', saveIdea);

  document.querySelector('.person-list').addEventListener('click', handleSelectPerson);

  loadInitialData();

  const ideaCollectionRef = collection(db, "gift-ideas");
  onSnapshot(ideaCollectionRef, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        console.log("New idea: ", change.doc.data());
      }
      if (change.type === "modified") {
        console.log("Modified idea: ", change.doc.data());
      }
      if (change.type === "removed") {
        console.log("Removed idea: ", change.doc.data());
      }
    });
  });

  const peopleCollectionRef = collection(db, "people");
  onSnapshot(peopleCollectionRef, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        console.log("New person: ", change.doc.data());
      }
      if (change.type === "modified") {
        console.log("Modified person: ", change.doc.data());
      }
      if (change.type === "removed") {
        console.log("Removed person: ", change.doc.data());
      }
    });
  });


});

function loadInitialData() {
  getPeople();
  document.querySelector('li.person').click();
  getIdeas();
}

async function getPeople(){
  const querySnapshot = await getDocs(collection(db, 'people'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    people.push({id, ...data});
  });
  selectedPersonId = buildPeople(people);
  let li = document.querySelector(`[data-id="${selectedPersonId}"]`);
  li.click();
}

function buildPeople(people){
  const ul = document.querySelector('ul.person-list');
  ul.innerHTML = people.map(person=>{
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
    return `<li data-id="${person.id}" class="person">
              <p class="name">${person.name}</p>
              <p class="dob">${dob}</p>
            </li>`;
  }).join('');
  let selected = people[0].id;
  return selected;
}

function showPerson(person){
  const ul = document.querySelector('ul.person-list');
  const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
  ul.innerHTML += `<li data-id="${person.id}" class="person">
    <p class="name">${person.name}</p>
    <p class="dob">${dob}</p>
  </li>`;
  people.push(person);
}

function handleSelectPerson(ev){
  const li = ev.target.closest('.person');
  const id = li ? li.getAttribute('data-id') : null;
  
  if(id){
    selectedPersonId = id;
    if(ev.target.classList.contains('edit')){
      showOverlay();
      loadPerson(id);
    }else if(ev.target.classList.contains('delete')){
      deletePerson(id);
    }else{
      document.querySelector('li.selected')?.classList.remove('selected');
      li.classList.add('selected');
      getIdeas(id);
    }
  }else{
    showOverlay();
  }
}

async function getIdeas(id){
  const personRef = doc(collection(db, 'people'), id);
  const ideaCollectionRef = collection(db, "gift-ideas");
  const docs = query(
    ideaCollectionRef,
    where('person-id', '==', personRef),
    orderBy('birth-month')
  );
  const querySnapshot = await getDocs(docs);
  const ideas = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    ideas.push({id, 
      title: data.title,
      location: data.location,
      bought: data.bought,
      person_id: data['person-id'].id,
      person_ref: data['person-id'],
    });

  });
  buildIdeas(ideas);
}

function buildIdeas(ideas){
  const ul = document.querySelector('.idea-list');
  if(ideas.length){
    ul.innerHTML = ideas.map(idea=>{
      return `<li class="idea" data-id="${idea.id}">
                <label for="chk-${idea.id}"
                  ><input type="checkbox" id="chk-${idea.id}" /> Bought</label
                >
                <p class="title">${idea.title}</p>
                <p class="location">${idea.location}</p>
              </li>`;
    }).join('');
  }else{
    ul.innerHTML = '<li class="idea"><p></p><p>No Gift Ideas for selected person.</p></li>'; //clear in case there are no records to shows
  }
  //add listener for 'change' or 'input' event on EVERY checkbox '.idea [type="checkbox"]'
  // which will call a function to update the `bought` value for the document
    const checkboxes = document.querySelectorAll('.idea [type="checkbox"]');
    checkboxes.forEach((chk) => {
        chk.addEventListener("change", handleCheckboxChange);
    });

    function handleCheckboxChange() {
        const id = this.closest('.idea').getAttribute('data-id');
        const bought = this.checked;
        updateIdea(id, bought);
    };
}

async function savePerson() {
  let name = document.getElementById('name').value;
  let month = document.getElementById('month').value;
  let day = document.getElementById('day').value;
  if(!name || !month || !day) return;
  const person = {
    'name': name,
    'birth-month': month,
    'birth-day': day
  };
  try {
    const docRef = await addDoc(collection(db, 'people'), person );
    console.log('Document written with ID: ', docRef.id);

    document.getElementById('name').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';

    document.querySelector('.overlay').click();
    displayMessage('Saved successfully');
    person.id = docRef.id;
    showPerson(person);
  } catch (err) {
    console.error('Error adding document: ', err);
    displayMessage('Error saving person');
  }
  this.updatePerson(person);
}

async function saveIdea() {
  let title = document.getElementById('title').value;
  let location = document.getElementById('location').value;
  if(!title || !location ) return;
  const personRef = doc(db, `/people/${selectedPersonId}`);
  const idea = {
    'title': title,
    'location': location,
    'person-id': personRef
  };

  try {
    const docRef = await addDoc(collection(db, 'gift-ideas'), idea );
    console.log('Document written with ID: ', docRef.id);
    idea.id = docRef.id;
    document.getElementById('title').value = '';
    document.getElementById('location').value = '';
    document.querySelector('.overlay').click();
    displayMessage('Saved successfully');
    buildIdeas([idea]);
    getIdeas(selectedPersonId);
  } catch (err) {
    console.error('Error adding document: ', err);
    displayMessage('Error saving idea');
  }
  this.updateIdea(idea);
}

function hideOverlay(ev) {
  ev.preventDefault();
  if(!ev.target.classList.contains('overlay') &&
    ev.target.id != 'btnCancelIdea' &&
    ev.target.id != 'btnCancelPerson'
  ) return;

  document.querySelector('.overlay').classList.remove('active');
  document
    .querySelectorAll('.overlay dialog')
    .forEach((dialog) => dialog.classList.remove('active'));
}
function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.add('active');
  const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  document.getElementById(id).classList.add('active');
}