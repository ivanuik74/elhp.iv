// ==== Firebase config ====
const firebaseConfig = {
apiKey: "AIzaSyBnI40Y9ti3bnsgPAYg4G9zaM1J8qkk1z8",
authDomain: "elhp-iv.firebaseapp.com",
projectId: "elhp-iv",
storageBucket: "elhp-iv.firebasestorage.app",
messagingSenderId: "457553204800",
appId: "1:457553204800:web:a9ae88735115a76c66b1a5"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;
const messagesDiv = document.getElementById("messages");

// ==== Логотип появляется первым ====
document.getElementById("logo").addEventListener("animationend", ()=>{
const storedNick = localStorage.getItem("nickname");
if(storedNick){
db.collection("users").doc(storedNick).get().then(doc=>{
if(doc.exists){
currentUser = { nickname: storedNick };
showChat();
} else { showLogin(); }
});
} else { showLogin(); }
});

// ==== Отображение ====
function showLogin(){
document.getElementById("loginDiv").style.display="flex";
setTimeout(()=>{ document.getElementById("loginDiv").style.opacity=1; },50);
}
function showChat(){
document.getElementById("loginDiv").style.display="none";
const chatDiv = document.getElementById("chatDiv");
chatDiv.style.display="flex";
setTimeout(()=>{ chatDiv.style.opacity=1; },50);
startListeningMessages();
}

// ==== Проверка ника ====
function isValidNick(nick){ return /^[A-Za-z0-9_]{3,20}$/.test(nick); }

// ==== Регистрация ====
document.getElementById("loginBtn").addEventListener("click", async ()=>{
let nick = document.getElementById("nickname").value.trim();
if(!isValidNick(nick)) return alert("Ник 3-20 символов, A-Z, a-z, цифры, _");

try {
const userRef = db.collection("users").doc(nick);
const doc = await userRef.get();
if(doc.exists) return alert("Такой ник уже занят!");

// Просто сохраняем ник без цвета
await userRef.set({
createdAt: firebase.firestore.FieldValue.serverTimestamp()
});

currentUser = { nickname: nick };
localStorage.setItem("nickname", nick);
showChat();

} catch(err){
console.error(err);
alert("Ошибка при регистрации ника.");
}
});

// ==== Слушаем сообщения ====
function startListeningMessages(){
db.collection("messages").orderBy("timestamp").onSnapshot(snapshot=>{
messagesDiv.innerHTML = "";
snapshot.forEach(doc=>{
const msg = doc.data();
appendMessage(msg);
});
messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
}

// ==== Добавление сообщений ====
function appendMessage(msg){
const div = document.createElement("div");
div.classList.add("message");
if(msg.sender === currentUser.nickname) div.classList.add("you");
div.innerHTML = `<span class="id">${msg.sender}:</span> ${msg.text}`;
messagesDiv.appendChild(div);
}

// ==== Отправка ====
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("textInput").addEventListener("keypress", function(e){
if(e.key==="Enter"){ e.preventDefault(); sendMessage(); }
});
function sendMessage(){
const text = document.getElementById("textInput").value.trim();
if(!text) return;
if(!currentUser || !currentUser.nickname){ alert("Введите ник!"); return; }

db.collection("messages").add({
sender: currentUser.nickname,
text: text,
timestamp: firebase.firestore.FieldValue.serverTimestamp()
}).then(()=>{ document.getElementById("textInput").value = ""; })
.catch(err=>{
console.error("Ошибка при отправке:", err);
alert("Ошибка при отправке сообщения.");
});
}

