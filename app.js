/* ===== Отправка сообщения ===== */

function sendMessage() {
const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");

if (!input || !chat) return;

const text = input.value.trim();

if (text === "") return;

/* Создаём сообщение */
const message = document.createElement("div");
message.className = "message";
message.textContent = text;

/* Добавляем в чат */
chat.appendChild(message);

/* Очистка поля */
input.value = "";

/* Скролл вниз */
chat.scrollTop = chat.scrollHeight;
}


/* ===== Отправка по Enter ===== */

document.addEventListener("DOMContentLoaded", () => {
const input = document.getElementById("messageInput");

if (input) {
input.addEventListener("keydown", function(event) {
if (event.key === "Enter") {
event.preventDefault();
sendMessage();
}
});
}
});


/* ===== Автофокус на поле ввода ===== */

document.addEventListener("DOMContentLoaded", () => {
const input = document.getElementById("messageInput");
if (input) input.focus();
});


/* ===== Тест подключения JS ===== */
/* Если хочешь проверить — открой консоль */
console.log("app.js подключён");
