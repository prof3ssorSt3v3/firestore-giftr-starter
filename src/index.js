import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, doc, getDocs, getDoc, addDoc, setDoc } from 'firebase/firestore';

//TODO: replace this config object with your own
const firebaseConfig = {
  apiKey: 'AIzaSyA11AtBsjU2Kr_TCGdySvB0IDt2XyfbB7E',
  authDomain: 'stupid-first-project.firebaseapp.com',
  projectId: 'stupid-first-project',
  storageBucket: 'stupid-first-project.appspot.com',
  messagingSenderId: '876050898658',
  appId: '1:876050898658:web:d4d7add948d9a578b948bb',
};
//TODO: replace this config object with your own

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
  document.getElementById('btnSaveIdea').addEventListener('click', saveIdea);

  document.querySelector('.person-list').addEventListener('click', handleSelectPerson);

  loadInitialData();

  //TODO: add the `onSnapshot` listener
});

function loadInitialData() {
  //load the people collection and display
  getPeople();
  //select the first person on the list
  //load the gift-ideas collection and display
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
  //select the first person from the list of people
  selectedPersonId = buildPeople(people);
  //select the matching <li> by clicking on a list item
  let li = document.querySelector(`[data-id=${selectedPersonId}]`);
  console.log(li);
  li.click();
}

function buildPeople(people){
  //build the HTML
  let ul = document.querySelector('ul.person-list');
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  //replace the old ul contents with the new.
  ul.innerHTML = people.map(person=>{
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
    console.log(`show ${person.id}`);
    //Use the number of the birth-month less 1 as the index for the months array
    return `<li data-id="${person.id}" class="person">
              <p class="name">${person.name}</p>
              <p class="dob">${dob}</p>
            </li>`;
  }).join('');
  // return the first person's id
  return people[0].id;
}

function handleSelectPerson(ev){
  //ev.target; - could be the button OR anything in the ul.
  const li = ev.target.closest('.person'); //see if there is a parent <li class="person">
  console.log(`${li.getAttribute('data-id')} was clicked`);
  const id = li ? li.getAttribute('data-id') : null; // if li exists then the user clicked inside an <li>
  
  if(id){
    //user clicked inside li
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

async function getIdeas(id){
  //the person-id property in gift-ideas will be like `/people/lasdjkflaskdfjsdlfk`
  //and it is a REFERENCE not a string. So, we use a reference to the person object
  const personRef = doc(collection(db, 'people'), id);
  const ideaCollectionRef = collection(db, "gift-ideas"); //collection we want to query
  const docs = query(
    ideaCollectionRef,
    where('person-id', '==', personRef)
  );
  const querySnapshot = await getDocs(docs);
  const ideas = [];
  querySnapshot.forEach((doc) => {
    //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    //every `doc` object has a doc() method that gives you a JS object with all the properties
    const data = doc.data();
    const id = doc.id;
    //person_id is a reference type
    //we want the actual id string in our object use id to get the _id
    // console.log(data['person-id']);
    ideas.push({id, 
      title: data.title,
      bought: data.bought,
      person_id: data['person-id'].id,
      person_ref: data['person-id'],
    });

  });
  //now build the HTML from the ideas array
  buildIdeas(ideas);
}

function buildIdeas(ideas){
  const ul = document.querySelector('.idea-list');

  // console.log(`show `, ideas);
  if(ideas.length){
    ul.innerHTML = ideas.map(idea=>{
      console.log(`show ${idea.id}`);
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
}

function savePerson() {
  //take the information from the dialog, save as an object, push to firestore
  //TODO: update this function to work as an INSERT or UPDATE method
}

function saveIdea() {
  //take the information from the dialog, save as an object, push to firestore
  //TODO: update this function to work as an INSERT or UPDATE method
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
  document.getElementById(id).classList.add('active');
}
