document.addEventListener("DOMContentLoaded", () => {

/* ===== Логотип ===== */
const logo = document.getElementById("logo");
setTimeout(() => logo.classList.add("show"), 100);

/* ===== Firebase ===== */
const db = firebase.firestore();
const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");

/* ===== Регистрация пользователя (уникальное имя латиницей) ===== */
let username = '';
while (!username) {
const name = prompt("Введите уникальное имя (латиница, цифры, _):") || '';
if (!/^[a-zA-Z0-9_]+$/.test(name)) {
alert("Разрешены только латиница, цифры и _");
continue;
}
username = name;
}

console.log("Username:", username);

/* ===== Отправка сообщений ===== */
async function sendMessage() {
const text = input.value.trim();
if (!text) return;

try {
await db.collection("messages").add({
text: text,
username: username,
createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
input.value = "";
} catch (err) {
console.error("Ошибка отправки:", err);
}
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
if (e.key === "Enter") {
e.preventDefault();
sendMessage();
}
});

/* ===== Получение сообщений (плавно) ===== */
db.collection("messages")
.orderBy("createdAt", "asc")
.onSnapshot(snapshot => {
snapshot.docChanges().forEach(change => {
if (change.type === "added") {
const data = change.doc.data();
if (!data.text) return;

const div = document.createElement("div");
div.className = "message";

div.classList.add(data.username === username ? "own" : "other");

const time = data.createdAt
? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
: '';
div.textContent = `[${time}] ${data.username}: ${data.text}`;

chat.appendChild(div);

// Мини-анимация появления
setTimeout(() => div.classList.add("show"), 10);

chat.scrollTop = chat.scrollHeight;
}
});
});

});
