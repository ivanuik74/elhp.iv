document.addEventListener("DOMContentLoaded", async () => {

/* ===== Плавное появление логотипа ===== */
const logo = document.getElementById("logo");
setTimeout(() => logo.classList.add("show"), 100);

/* ===== Firebase ===== */
const db = firebase.firestore();
const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");

/* ===== Ввод уникального имени латиницей ===== */
let username = '';
while (!username) {
const name = prompt("Введите уникальное имя (латиницей, без пробелов):");
if (!name) continue;
if (!/^[a-zA-Z0-9_]+$/.test(name)) {
alert("Только латиница, цифры и _ разрешены");
continue;
}

// Проверка уникальности в базе
const snapshot = await db.collection("users").doc(name).get();
if (snapshot.exists) {
alert("Это имя уже занято, попробуйте другое");
continue;
}

username = name;
// Регистрируем пользователя в базе
await db.collection("users").doc(username).set({ joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
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

/* ===== Получение сообщений (реалтайм с анимацией) ===== */
db.collection("messages")
.orderBy("createdAt", "asc")
.onSnapshot(snapshot => {
snapshot.docChanges().forEach(change => {
if (change.type === "added") {
const data = change.doc.data();
if (!data.text) return;

const div = document.createElement("div");
div.className = "message";

// Свои или чужие сообщения
div.classList.add(data.username === username ? "own" : "other");

// Формат: [время] имя: текст
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

