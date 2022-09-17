import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtjyPJ7LqQUQZgiy1uxYcTPAj_p6zE4WM",
  authDomain: "fire-giftr-90f99.firebaseapp.com",
  projectId: "fire-giftr-90f99",
  storageBucket: "fire-giftr-90f99.appspot.com",
  messagingSenderId: "467929754522",
  appId: "1:467929754522:web:6b71ed2606f27ef6eb2823",
  measurementId: "G-7M8WRM3NZ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get a reference to the database
const db = getFirestore(app);
const people = [];
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

  document.querySelector('.person-list').addEventListener('click', handleSelectPerson);

  loadData();
});

function loadData(){
  getPeople();
}

async function getPeople(){
  //call this from DOMContentLoaded init function 
  //the db variable is the one created by the getFirestore(app) call.
  const querySnapshot = await getDocs(collection(db, 'people'));
  querySnapshot.forEach((doc) => {
    //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    //every `doc` object has a doc() method that gives you a JS object with all the properties
    const data = doc.data();
    const id = doc.id;
    people.push({id, ...data});
  });
  selectedPersonId = buildPeople(people);

  let li = document.querySelector(`[data-id="${selectedPersonId}"]`);
  li.click();
}

function buildPeople(people){
  //build the HTML
  let ul = document.querySelector('ul.person-list');
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August','September', 'October', 'November', 'December'];
  //replace the old ul contents with the new.
  ul.innerHTML = people.map(person=>{
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
    //Use the number of the birth-month less 1 as the index for the months array
    return `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
          </li>`;
  }).join('');

  let selected = people[0].id;
  return selected;
}

async function savePerson(ev){
  //function called when user clicks save button from person dialog
  let name = document.getElementById('name').value;
  let month = document.getElementById('month').value;
  let day = document.getElementById('day').value;
  if(!name || !month || !day) return; //form needs more info 
  const person = {
    name,
    'birth-month': month,
    'birth-day': day
  };
  try {
    const docRef = await addDoc(collection(db, 'people'), person );
    console.log('Document written with ID: ', docRef.id);
    //1. clear the form fields 
    document.getElementById('name').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
    //2. hide the dialog and the overlay
    hideOverlay();
    //3. display a message to the user about success 
    tellUser(`Person ${name} added to database`);
    person.id = docRef.id;
    //4. ADD the new HTML to the <ul> using the new object
    showPerson(person);
  } catch (err) {
    console.error('Error adding document: ', err);
    //do you want to stay on the dialog?
    //display a mesage to the user about the problem
  }
}

function showPerson(person){
  //add the newly created person OR update if person exists
  const ul = document.querySelector('ul.person-list');
  const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
  ul.innerHTML += `<li data-id="${person.id}" class="person">
    <p class="name">${person.name}</p>
    <p class="dob">${dob}</p>
  </li>`;
  //add to people array
  people.push(person);
}

function handleSelectPerson(ev){
  //ev.target; - could be the button OR anything in the ul.
  const li = ev.target.closest('.person'); //see if there is a parent <li class="person">
  // console.log(`${li.getAttribute('data-id')} was clicked`);
  const id = li ? li.getAttribute('data-id') : null; // if li exists then the user clicked inside an <li>
  
  if(id){
    //user clicked inside li
    selectedPersonId = id;
    //did they click the li content OR an edit button OR a delete button?
    if(ev.target.classList.contains('edit')){
      //EDIT the doc using the id to get a docRef
      //show the dialog form to EDIT the doc (same form as ADD)
      //Load all the Person document details into the form from docRef
    }else if(ev.target.classList.contains('delete')){
      //DELETE the doc using the id to get a docRef
      //do a confirmation before deleting 
    }else{
      //content inside the <li> but NOT a <button> was clicked 
      //remove any previously selected styles
      document.querySelector('li.selected')?.classList.remove('selected');
      //Highlight the newly selected person 
      li.classList.add('selected');
      //and load all the gift idea documents for that person
      getIdeas(id);
    }
  }else{
    //clicked a button not inside <li class="person">
    //Show the dialog form to ADD the doc (same form as EDIT)
    //showOverlay function can be called from here or with the click listener in DOMContentLoaded, not both
  }
}

function hideOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.remove('active');
  document
    .querySelectorAll('.overlay dialog')
    .forEach((dialog) => dialog.classList.remove('active'));
}
function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.add('active');
  const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  //TODO: check that person is selected before adding an idea
  document.getElementById(id).classList.add('active');
}
