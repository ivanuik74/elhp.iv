// Firebase config
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

// Проверка ника
function isValidNick(nick){
return /^[A-Za-z0-9_]{3,20}$/.test(nick);
}

// Проверка localStorage
let storedNick = localStorage.getItem("nickname");
if(storedNick){
currentUser = { nickname: storedNick };
showChat();
}

// Вход / регистрация
document.getElementById("loginBtn").addEventListener("click", ()=>{
let nick = document.getElementById("nickname").value.trim();
if(!isValidNick(nick)) return alert("Ник 3-20 символов, A-Z, a-z, цифры, _");

currentUser = { nickname: nick };
localStorage.setItem("nickname", nick);
showChat();
});

// Показ чата
function showChat(){
document.getElementById("loginDiv").style.display = "none";
document.getElementById("chatDiv").style.display = "flex";
renderMessages();
}

// Отображение сообщений
const messagesDiv = document.getElementById("messages");
function renderMessages(){
db.collection("messages")
.orderBy("timestamp")
.onSnapshot(snapshot=>{
messagesDiv.innerHTML = "";
snapshot.forEach(doc=>{
const msg = doc.data();
if(msg.participants.includes("#Лента")){
appendMessage(msg);
}
});
messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
}

// Добавление сообщения в DOM
function appendMessage(msg){
const div = document.createElement("div");
div.classList.add("message");
if(msg.sender === currentUser.nickname) div.classList.add("you");
div.innerHTML = `<span class="id">${msg.sender}:</span>${msg.text}`;
messagesDiv.appendChild(div);
}

// Отправка сообщений
document.getElementById("sendBtn").addEventListener("click", async ()=>{
const text = document.getElementById("textInput").value.trim();
if(!text) return;
if(!currentUser) return alert("Введите ник");

try{
await db.collection("messages").add({
sender: currentUser.nickname,
participants: ["#Лента"],
text: text,
timestamp: firebase.firestore.FieldValue.serverTimestamp()
});
document.getElementById("textInput").value = "";
}catch(err){
console.error(err);
alert("Ошибка при отправке");
}
});

// Отправка по Enter
document.getElementById("textInput").addEventListener("keypress", function(e){
if(e.key === "Enter"){
e.preventDefault();
document.getElementById("sendBtn").click();
}
});
