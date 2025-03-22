import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgMwGI2LjzcxL60K5GoM7vo6nAKtwxPV4",
  authDomain: "bejelent-3768f.firebaseapp.com",
  projectId: "bejelent-3768f",
  storageBucket: "bejelent-3768f.appspot.com",
  messagingSenderId: "253589417646",
  appId: "1:253589417646:web:2fb9eea186af2c6243873f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listUnderProcess() {
    const container = document.getElementById("under-process-list");
    container.innerHTML = "<h3>Betöltés...</h3>";
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";
    snapshot.forEach((post) => {
        const data = post.data();
        if (data.underProcess) {
            const div = document.createElement("div");
            div.className = "post-card";
            div.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <p><strong>Téma:</strong> ${data.topic}</p>
                <p><small>Közzétéve: ${new Date(data.date.seconds * 1000).toLocaleString()}</small></p>
                <p><strong>Lájkok:</strong> ${data.likes || 0}</p>
            `;
            container.appendChild(div);
        }
    });
}

listUnderProcess();
