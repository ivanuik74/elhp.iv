document.addEventListener("DOMContentLoaded", async () => {

/* ===== Логотип ===== */
const logo = document.getElementById("logo");
setTimeout(() => logo.classList.add("show"), 100);

/* ===== Firebase ===== */
const db = firebase.firestore();
const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const typingIndicator = document.getElementById("typingIndicator");
const sendBtn = document.getElementById("sendBtn");

/* ===== Регистрация пользователя через Firestore ===== */
let username = localStorage.getItem("username") || "";

while (!username) {
let name = prompt("Введите уникальное имя (латиница, цифры, _):") || "";

if (!/^[a-zA-Z0-9_]+$/.test(name)) {
alert("Разрешены только латиница, цифры и _");
continue;
}

const userDoc = await db.collection("users").doc(name).get();
if (userDoc.exists) {
alert("Это имя уже занято, попробуйте другое");
continue;
}

await db.collection("users").doc(name).set({ joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
localStorage.setItem("username", name);
username = name;
}

console.log("Username:", username);

/* ===== Функция автоскролла ===== */
function scrollToBottom() {
chat.scrollTop = chat.scrollHeight - chat.clientHeight + 20;
}

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

// После отправки убираем индикатор набора
db.collection("typing").doc(username).set({ typing: false });
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

/* ===== Индикатор набора сообщений ===== */
const typingRef = db.collection("typing").doc(username);

input.addEventListener("input", () => {
typingRef.set({ typing: input.value.length > 0 });
});

window.addEventListener("beforeunload", () => {
typingRef.set({ typing: false });
});

db.collection("typing").onSnapshot(snapshot => {
const typingUsers = [];
snapshot.forEach(doc => {
if (doc.id !== username && doc.data().typing) {
typingUsers.push(doc.id);
}
});
typingIndicator.textContent = typingUsers.length > 0
? `${typingUsers.join(", ")} печатает...`
: "";
});

/* ===== Получение сообщений ===== */
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

// Мини-подсветка нового сообщения
div.classList.add("new");
setTimeout(() => div.classList.remove("new"), 1000);

// Анимация появления
setTimeout(() => div.classList.add("show"), 10);

// Автоскролл
scrollToBottom();
}
});
});

});
