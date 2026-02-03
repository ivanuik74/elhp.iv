import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, getDocs, where, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== INIT FIREBASE =====
const firebaseConfig = {
apiKey: "AIzaSyA8YZF-7X2i2oJEMfuSVGH-2SnpbEFj6o4",
authDomain: "elhp-iv-7be7e.firebaseapp.com",
projectId: "elhp-iv-7be7e",
storageBucket: "elhp-iv-7be7e.firebasestorage.app",
messagingSenderId: "393716398102",
appId: "1:393716398102:web:6912b00e9bcf7618af5d37"
};

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

let currentUser = null;
let currentNick = "";

// ===== UTILS =====
function scrollToBottom(){
setTimeout(()=> messagesDiv.scrollTop = messagesDiv.scrollHeight, 50);
}

function createMessageHTML(text,time,isMine,user){
return `
<div class="message ${isMine ? "mine" : ""}">
<div class="msgUser">${user}</div>
<div class="msgText">${text}</div>
<div class="msgTime">${time}</div>
</div>`;
}

function addMessage(msg){
messagesDiv.innerHTML += createMessageHTML(
msg.text,
msg.time || (msg.createdAt && new Date(msg.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})),
msg.uid === currentUser?.uid,
msg.nick
);
scrollToBottom();
}

// ===== REALTIME MESSAGES =====
function startRealtime(){
const messagesRef = collection(db, "messages");
const q = query(messagesRef, orderBy("createdAt"));
onSnapshot(q, snapshot=>{
messagesDiv.innerHTML="";
snapshot.forEach(doc=>{
addMessage(doc.data());
});
});
}

// ===== SEND MESSAGE =====
async function sendMessage(){
const text = messageInput.value.trim();
if(!text || !currentUser || !currentNick) return;

const messagesRef = collection(db, "messages");
await addDoc(messagesRef,{
text,
uid: currentUser.uid,
nick: currentNick,
createdAt: serverTimestamp()
});

messageInput.value="";
}

sendBtn.addEventListener("click", sendMessage);
sendBtn.addEventListener("touchend", sendMessage);
messageInput.addEventListener("keydown", e=>{
if(e.key==="Enter") sendMessage();
});

// ===== REGISTRATION =====
async function registerNick(){
registerError.textContent = "";
const nick = nickInput.value.trim();

if(!nick){
registerError.textContent="Введите ник";
return;
}

if(!/^[a-zA-Z0-9]+$/.test(nick)){
registerError.textContent="Только английские буквы и цифры";
return;
}

try{
if(!currentUser){
const userCredential = await signInAnonymously(auth);
currentUser = userCredential.user;
}

const userRef = doc(db, "users", currentUser.uid);
const userSnap = await getDoc(userRef);

if(userSnap.exists()){
registerError.textContent="Вы уже зарегистрированы под другим ником";
return;
}

const usersRef = collection(db, "users");
const q = query(usersRef, where("nick","==",nick));
const snapshot = await getDocs(q);
if(!snapshot.empty){
registerError.textContent="Этот ник уже занят";
return;
}

await setDoc(userRef,{nick, createdAt: serverTimestamp()});
currentNick = nick;
overlay.style.display="none";
messageInput.disabled = false;
sendBtn.disabled = false;
startRealtime();

} catch(err){
console.error("Регистрация:", err);
registerError.textContent="Ошибка регистрации: попробуйте ещё раз";
}
}

registerBtn.addEventListener("click", registerNick);
nickInput.addEventListener("keydown", e=>{
if(e.key==="Enter") registerNick();
});

// ===== AUTOLOGIN =====
onAuthStateChanged(auth, async user=>{
if(user){
const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);
if(!userSnap.exists()){
await auth.signOut();
currentUser = null;
currentNick = "";
overlay.style.display = "flex";
messageInput.disabled = true;
sendBtn.disabled = true;
} else {
currentUser = user;
currentNick = userSnap.data().nick;
overlay.style.display = "none";
messageInput.disabled = false;
sendBtn.disabled = false;
startRealtime();
}
} else {
overlay.style.display = "flex";
messageInput.disabled = true;
sendBtn.disabled = true;
}
});
