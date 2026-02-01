document.addEventListener("DOMContentLoaded", () => {

/* ===== Плавное появление логотипа ===== */
const logo = document.getElementById("logo");
// Через небольшой таймаут, чтобы браузер применил стили
setTimeout(() => {
logo.classList.add("show");
}, 100); // 100 мс достаточно

/* ===== Firebase ===== */
const db = firebase.firestore();

const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");

/* ===== Отправка сообщений ===== */
async function sendMessage() {
const text = input.value.trim();
if (!text) return;

try {
await db.collection("messages").add({
text: text,
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

/* ===== Получение сообщений (реалтайм) ===== */
db.collection("messages")
.orderBy("createdAt", "asc")
.onSnapshot(snapshot => {
chat.innerHTML = "";
snapshot.forEach(doc => {
const data = doc.data();
if (!data.text) return;
const div = document.createElement("div");
div.className = "message";
div.textContent = data.text;
chat.appendChild(div);
});
chat.scrollTop = chat.scrollHeight;
});

});
