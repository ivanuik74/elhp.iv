// ================== Firebase SDK ==================
// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
// Auth
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// Firestore
import { getFirestore, collection, addDoc, query, orderBy, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// ================== Firebase Config ==================
const firebaseConfig = {
apiKey: "AIzaSyA8YZF-7X2i2oJEMfuSVGH-2SnpbEFj6o4",
authDomain: "elhp-iv-7be7e.firebaseapp.com",
projectId: "elhp-iv-7be7e",
storageBucket: "elhp-iv-7be7e.appspot.com",
messagingSenderId: "393716398102",
appId: "1:393716398102:web:6912b00e9bcf7618af5d37"
};

// ================== Firebase Init ==================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================== НИКНЕЙМ ПОЛЬЗОВАТЕЛЯ ==================
let username = localStorage.getItem("username");
if(!username){
const letters = "abcdefghijklmnopqrstuvwxyz";
let name = "";
for(let i=0;i<6;i++){
name += letters[Math.floor(Math.random()*letters.length)];
}
username = name;
localStorage.setItem("username", username);
}

// ================== Анонимная авторизация ==================
let currentUser = null;

signInAnonymously(auth).catch(err => console.error("Auth error:", err));

onAuthStateChanged(auth, (user) => {
if(user){
currentUser = user;
console.log("Анонимный пользователь UID:", user.uid);
loadMessagesFromFirestore(); // Загружаем сообщения после авторизации
}
});

// ================== ВРЕМЯ ==================
function getTime(){
const d = new Date();
return d.getHours().toString().padStart(2,'0') + ":" +
d.getMinutes().toString().padStart(2,'0');
}

// ================== СКРОЛЛ ==================
function scrollToBottom(){
const chat = document.getElementById("messages");
setTimeout(()=>{
chat.scrollTop = chat.scrollHeight;
},50);
}

// ================== СОЗДАНИЕ HTML ==================
function createMessageHTML(text,time,isMine,user){
return `
<div class="message ${isMine ? "mine" : ""}">
<div class="msgUser">${user}</div>
<div class="msgText">${text}</div>
<div class="msgTime">${time}</div>
</div>
`;
}

// ================== ДОБАВИТЬ СООБЩЕНИЕ ==================
function addMessage(msg){
const chat = document.getElementById("messages");
chat.innerHTML += createMessageHTML(
msg.text,
msg.time,
msg.user === username,
msg.user
);
scrollToBottom();
}

// ================== ОТПРАВКА СООБЩЕНИЯ ==================
async function sendMessage(){
const input = document.getElementById("messageInput");
const text = input.value.trim();
if(!text || !currentUser) return;

const msg = {
text: text,
userId: currentUser.uid,
nickname: username,
createdAt: serverTimestamp()
};

try{
await addDoc(collection(db,"messages"), msg);
input.value = "";
}catch(err){
console.error("Ошибка отправки:", err);
}
}

// ================== ПОЛУЧЕНИЕ СООБЩЕНИЙ В РЕАЛЬНОМ ВРЕМЕНИ ==================
function loadMessagesFromFirestore(){
const q = query(collection(db,"messages"), orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
snapshot.docChanges().forEach(change => {
if(change.type === "added"){
const data = change.doc.data();
addMessage({
text: data.text,
time: data.createdAt ? new Date(data.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : getTime(),
user: data.nickname
});
}
});
});
}

// ================== ENTER ==================
document.getElementById("messageInput").addEventListener("keydown", e=>{
if(e.key === "Enter"){
sendMessage();
}
});
