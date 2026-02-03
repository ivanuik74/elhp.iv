// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== CONFIG =====
const firebaseConfig = {
apiKey: "AIzaSyA8YZF-7X2i2oJEMfuSVGH-2SnpbEFj6o4",
authDomain: "elhp-iv-7be7e.firebaseapp.com",
projectId: "elhp-iv-7be7e",
storageBucket: "elhp-iv-7be7e.firebasestorage.app",
messagingSenderId: "393716398102",
appId: "1:393716398102:web:6912b00e9bcf7618af5d37"
};

// ===== INIT =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== USERNAME =====
let username = localStorage.getItem("username");
function generateUsername(){
const letters = "abcdefghijklmnopqrstuvwxyz";
let name = "";
for(let i=0;i<6;i++){
name += letters[Math.floor(Math.random()*letters.length)];
}
return name;
}
if(!username){
username = generateUsername();
localStorage.setItem("username", username);
}

// ===== ВРЕМЯ =====
function getTime(){
const d = new Date();
return d.getHours().toString().padStart(2,'0') + ":" +
d.getMinutes().toString().padStart(2,'0');
}

// ===== СКРОЛЛ =====
function scrollToBottom(){
const chat = document.getElementById("messages");
setTimeout(()=>{
chat.scrollTop = chat.scrollHeight;
},50);
}

// ===== СОЗДАНИЕ HTML =====
function createMessageHTML(text,time,isMine,user){
return `
<div class="message ${isMine ? "mine" : ""}">
<div class="msgUser">${user}</div>
<div class="msgText">${text}</div>
<div class="msgTime">${time}</div>
</div>
`;
}

// ===== ДОБАВИТЬ СООБЩЕНИЕ =====
function addMessage(msg){
const chat = document.getElementById("messages");
chat.innerHTML += createMessageHTML(
msg.text,
msg.time || msg.createdAt,
msg.user === username,
msg.user
);
scrollToBottom();
}

// ===== AUTH и FIRESTORE =====
let currentUser = null;
signInAnonymously(auth);

onAuthStateChanged(auth, (user)=>{
if(user){
currentUser = user;
console.log("Auth OK", user.uid);
startRealtime();
}
});

// ===== REALTIME CHAT =====
function startRealtime(){
const messagesRef = collection(db, "messages");
const q = query(messagesRef, orderBy("createdAt"));

onSnapshot(q, snapshot=>{
const chat = document.getElementById("messages");
chat.innerHTML = "";
snapshot.forEach(doc=>{
const data = doc.data();
data.createdAt = data.createdAt ? new Date(data.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "";
addMessage(data);
});
});
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage(){
const input = document.getElementById("messageInput");
const text = input.value.trim();
if(!text) return;

// локально
const msgLocal = { text, time:getTime(), user:username };
let messages = JSON.parse(localStorage.getItem("messages") || "[]");
messages.push(msgLocal);
localStorage.setItem("messages", JSON.stringify(messages));
addMessage(msgLocal);

// Firebase
if(currentUser){
const messagesRef = collection(db, "messages");
addDoc(messagesRef, {
text,
user:username,
uid:currentUser.uid,
createdAt:serverTimestamp()
});
}

input.value="";
}

// ===== ENTER и кнопка =====
document.getElementById("messageInput").addEventListener("keydown", e=>{
if(e.key === "Enter"){
sendMessage();
}
});
document.getElementById("sendBtn").addEventListener("click", sendMessage);

// ===== LOAD LOCAL HISTORY =====
function loadMessages(){
let messages = JSON.parse(localStorage.getItem("messages") || "[]");
messages.forEach(msg=>{
addMessage(msg);
});
scrollToBottom();
}
loadMessages();
