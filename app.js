document.addEventListener("DOMContentLoaded", () => {

const loader = document.getElementById("loader");
const app = document.getElementById("app");

/* Плавная загрузка */
setTimeout(()=>{
loader.classList.add("hide");
app.classList.add("show");
document.body.style.overflow="auto";
},2000);

const db = firebase.firestore();

const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");

/* ===== Отправка ===== */
async function sendMessage(){
const text = input.value.trim();
if(!text) return;

try{
await db.collection("messages").add({
text:text,
createdAt:firebase.firestore.FieldValue.serverTimestamp()
});

input.value="";

}catch(err){
console.error("Ошибка отправки:",err);
}
}

sendBtn.addEventListener("click",sendMessage);

input.addEventListener("keydown",e=>{
if(e.key==="Enter"){
e.preventDefault();
sendMessage();
}
});

/* ===== Получение сообщений ===== */
db.collection("messages")
.orderBy("createdAt","asc")
.onSnapshot(snapshot=>{

chat.innerHTML="";

snapshot.forEach(doc=>{
const data = doc.data();
if(!data.text) return;

const div=document.createElement("div");
div.className="message";
div.textContent=data.text;

chat.appendChild(div);
});

chat.scrollTop=chat.scrollHeight;
});

});
