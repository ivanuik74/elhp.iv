// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, getDocs, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// ===== DOM =====
const overlay = document.getElementById("registerOverlay");
const nickInput = document.getElementById("nickInput");
const registerBtn = document.getElementById("registerBtn");
const registerError = document.getElementById("registerError");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

// ===== ФУНКЦИИ ЧАТА =====
function scrollToBottom(){
setTimeout(()=> messagesDiv.scrollTop = messagesDiv.scrollHeight, 50);
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
messagesDiv.innerHTML += createMessageHTML(
msg.text,
msg.time || msg.createdAt,
msg.user === localStorage.getItem("username"),
msg.user
);
scrollToBottom();
}

// ===== AUTH =====
let currentUser = null;
signInAnonymously(auth);
onAuthStateChanged(auth, (user)=>{
if(user){
currentUser = user;
console.log("Auth OK", user.uid);
// Если ник уже есть, показываем чат
if(localStorage.getItem("username")){
overlay.style.display="none";
startRealtime();
}
}
});

// ===== REALTIME CHAT =====
function startRealtime(){
const messagesRef = collection(db, "messages");
const q = query(messagesRef, orderBy("createdAt"));

onSnapshot(q, snapshot=>{
messagesDiv.innerHTML="";
snapshot.forEach(doc=>{
const data = doc.data();
data.createdAt = data.createdAt ? new Date(data.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "";
addMessage(data);
});
});
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage(){
const text = messageInput.value.trim();
if(!text) return;

const username = localStorage.getItem("username");
if(!username) return;

// Локально
addMessage({text, user:username, time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})});

// Firebase
if(currentUser){
const messagesRef = collection(db, "messages");
addDoc(messagesRef,{
text,
user:username,
uid:currentUser.uid,
createdAt: new Date()
});
}

messageInput.value="";
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", e=>{
if(e.key==="Enter") sendMessage();
});

// ===== РЕГИСТРАЦИЯ НИКА =====
async function registerNick(){
const nick = nickInput.value.trim();
if(!nick){
registerError.textContent="Введите ник";
return;
}
if(!/^[a-zA-Z0-9]+$/.test(nick)){
registerError.textContent="Только английские буквы и цифры";
return;
}

// Проверка уникальности
const usersRef = collection(db, "users");
const q = query(usersRef, where("nick","==",nick));
const snapshot = await getDocs(q);

if(!snapshot.empty){
registerError.textContent="Этот ник уже занят";
return;
}

// Сохраняем ник
localStorage.setItem("username", nick);
addDoc(usersRef,{nick});
overlay.style.display="none";

startRealtime();
}

registerBtn.addEventListener("click", registerNick);
nickInput.addEventListener("keydown", e=>{
if(e.key==="Enter") registerNick();
});

// ===== LOCAL HISTORY =====
function loadMessages(){
let messages = JSON.parse(localStorage.getItem("messages")||"[]");
messages.forEach(msg=> addMessage(msg));
scrollToBottom();
}
loadMessages();
