// ===== FIREBASE IMPORT =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
signInAnonymously,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
collection,
addDoc,
doc,
getDoc,
setDoc,
query,
orderBy,
onSnapshot,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===== CONFIG =====
const firebaseConfig = {
apiKey: "PASTE",
authDomain: "PASTE",
projectId: "PASTE",
storageBucket: "PASTE",
messagingSenderId: "PASTE",
appId: "PASTE"
};


// ===== INIT =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ===== USER DATA =====
let username = localStorage.getItem("username");
let currentUser;


// ===== AUTH =====
signInAnonymously(auth);

onAuthStateChanged(auth, async (user)=>{
if(user){
currentUser = user;
await setupUsername();
startChat();
}
});


// ===== УНИКАЛЬНЫЙ НИК =====
async function setupUsername(){

if(username) return;

while(true){

let input = prompt("Введите уникальный ник (английский):");

if(!input) continue;

input = input.toLowerCase();

if(!/^[a-z0-9_]{3,16}$/.test(input)){
alert("3-16 символов, только английские буквы, цифры и _");
continue;
}

const nickRef = doc(db, "usernames", input);
const nickSnap = await getDoc(nickRef);

if(nickSnap.exists()){
alert("Ник занят");
continue;
}

await setDoc(nickRef, {
uid: currentUser.uid,
createdAt: serverTimestamp()
});

username = input;
localStorage.setItem("username", username);

break;
}

}


// ===== CHAT =====
function startChat(){

const messagesRef = collection(db, "messages");

const q = query(messagesRef, orderBy("createdAt"));

onSnapshot(q, snapshot=>{
const chat = document.getElementById("messages");
chat.innerHTML = "";

snapshot.forEach(doc=>{
addMessage(doc.data());
});

scrollToBottom();
});

window.sendMessage = async function(){

const input = document.getElementById("messageInput");
const text = input.value.trim();

if(!text) return;

await addDoc(messagesRef, {
text: text,
user: username,
uid: currentUser.uid,
createdAt: serverTimestamp()
});

input.value="";
};

}


// ===== UI =====
function scrollToBottom(){
const chat = document.getElementById("messages");
setTimeout(()=>{
chat.scrollTop = chat.scrollHeight;
},50);
}

function formatTime(timestamp){
if(!timestamp) return "";
const d = timestamp.toDate();
return d.getHours().toString().padStart(2,'0') + ":" +
d.getMinutes().toString().padStart(2,'0');
}

function createMessageHTML(text,time,isMine,user){
return `
<div class="message ${isMine ? "mine" : ""}">
<div class="msgUser">${user}</div>
<div class="msgText">${text}</div>
<div class="msgTime">${time}</div>
</div>
`;
}

function addMessage(msg){

const chat = document.getElementById("messages");

chat.innerHTML += createMessageHTML(
msg.text,
formatTime(msg.createdAt),
msg.user === username,
msg.user
);
}


// ENTER SEND
document.getElementById("messageInput").addEventListener("keydown", e=>{
if(e.key === "Enter"){
window.sendMessage();
}
});
