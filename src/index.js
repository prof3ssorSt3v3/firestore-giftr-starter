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

 import { initializeApp } from "firebase/app";
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
 initializeApp(firebaseConfig); //connects to firebase backend
 const db = getFirestore(); //referenece for the db
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
 
   document
     .getElementById("btnSavePerson")
     .addEventListener("click", savePerson);
   document.getElementById("btnSaveIdea").addEventListener("click", saveIdea);
 
   document
     .querySelector(".person-list")
     .addEventListener("click", handleSelectPerson);
 
   loadData();
 });



//whenever user clicks on the buton, the overlay is hidden: 
//for the person and idea buttons 
 function hideOverlay(ev) {
     ev.preventDefault();
     if (
       !ev.target.classList.contains("overlay") &&
       ev.target.id != "btnCancelIdea" ,
       ev.target.id != "btnCancelPerson",
       ev.target.id != "btnSaveIdea" &&
       ev.target.id != "btnSavePerson"
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












 function loadData() {
   getPeople();
 }
 
 /**people functionality */
 async function getPeople(){
    const querySnapshot = await getDocs(collection(db, 'people'));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      people.push({id, ...data});
    });
    personId= buildPeople(people);
    let li = document.querySelector(`[data-id="${personId}"]`);
     console.log(li);
    li.click();
  }
  
  function buildPeople(people){
    //build the HTML
    const ul = document.querySelector('ul.person-list');
    //replace the old ul contents with the new.
    ul.innerHTML = people.map(person=>{
      const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
      // console.log(`show ${person.id}`);
      //Use the number of the birth-month less 1 as the index for the months array
      return `<li data-id="${person.id}" class="person">
                <p class="name">${person.name}</p>
                <p class="dob">${dob}</p>
              </li>`;
    }).join('');
    // return the first person's id
    let selected = people[0].id;
    // console.log(selected);
    return selected;
  }
  
  function handleSelectPerson(ev){
    const li = ev.target.closest('.person'); 
    const id = li ? li.getAttribute('data-id') : null;
    
    if(id){
      personId = id;
      if(ev.target.classList.contains('edit')){
  
      }else if(ev.target.classList.contains('delete')){
      }else{
        document.querySelector('li.selected')?.classList.remove('selected');
        li.classList.add('selected');
        getIdeas(id);
        console.log(id);//testing
      }
    }else{
    console.log("no id selected");
    }
  }

 
  
  async function getIdeas(id){
    //the person-id property in gift-ideas will be like `/people/lasdjkflaskdfjsdlfk`
    //and it is a REFERENCE not a string. So, we use a reference to the person object
    const personRef = doc(collection(db, 'people'), id);
    const ideaCollectionRef = collection(db, "gift-ideas"); //collection we want to query
    const docs = query(
      ideaCollectionRef,
      where('person-id', '==', personRef),
      orderBy('birth-month')
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
        location: data.location,
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
    if(ideas.length){
      ul.innerHTML = ideas.map(idea=>{
        // console.log(`show ${idea.id}`);
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

  


 
 
 
 
 