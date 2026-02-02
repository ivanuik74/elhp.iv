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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ================== Никнейм пользователя ==================
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
auth.signInAnonymously().catch(err => console.error("Auth error:", err));

auth.onAuthStateChanged(user=>{
if(user){
currentUser = user;
console.log("Анонимный UID:", user.uid);
loadMessagesFromFirestore();
}
});

// ================== Время ==================
function getTime(){
const d = new Date();
return d.getHours().toString().padStart(2,'0') + ":" +
d.getMinutes().toString().padStart(2,'0');
}

// ================== Скролл ==================
function scrollToBottom(){
const chat = document.getElementById("messages");
setTimeout(()=>{
chat.scrollTop = chat.scrollHeight;
},50);
}

// ================== Создание HTML ==================
function createMessageHTML(text,time,isMine,user){
return `
<div class="message ${isMine ? "mine" : ""}">
<div class="msgUser">${user}</div>
<div class="msgText">${text}</div>
<div class="msgTime">${time}</div>
</div>
`;
}

// ================== Добавление сообщения ==================
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

// ================== Отправка сообщения ==================
function sendMessage(){
const input = document.getElementById("messageInput");
const text = input.value.trim();
if(!text || !currentUser) return;

const msg = {
text: text,
userId: currentUser.uid,
nickname: username,
createdAt: firebase.firestore.FieldValue.serverTimestamp()
};

db.collection("messages").add(msg)
.then(()=>{ input.value=""; })
.catch(err=>console.error("Ошибка отправки:", err));
}

// ================== Получение сообщений в реальном времени ==================
function loadMessagesFromFirestore(){
db.collection("messages").orderBy("createdAt").onSnapshot(snapshot=>{
snapshot.docChanges().forEach(change=>{
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
if(e.key === "Enter") sendMessage();
});
