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

async function listSolved() {
    const container = document.getElementById("solved-list");
    container.innerHTML = "<h3>Betöltés...</h3>";
    const q = query(collection(db, "solved"), orderBy("solvedDate", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";
    snapshot.forEach((post) => {
        const data = post.data();
        const div = document.createElement("div");
        div.className = "post-card";
        div.innerHTML = `
            <h3>${data.title}</h3>
            <p>${data.content}</p>
            <p><strong>Téma:</strong> ${data.topic}</p>
            <p><small>Kiírás dátuma: ${new Date(data.date.seconds * 1000).toLocaleString()}</small></p>
            <p><small>Ügyintézés kezdete: ${data.underProcessDate ? new Date(data.underProcessDate.seconds * 1000).toLocaleString() : "N/A"}</small></p>
            <p><small>Lezárás dátuma: ${data.solvedDate ? new Date(data.solvedDate.seconds * 1000).toLocaleString() : "N/A"}</small></p>
            <p><strong>Megoldás szövege:</strong> ${data.solution || "Nincs megadva"}</p>
            <p><strong>Lájkok száma:</strong> ${data.likes || 0}</p>
        `;
        container.appendChild(div);
    });
}

listSolved();


// Admin törlés lezárt posztoknál
window.deleteSolvedPost = async function(postId) {
    if (!confirm("Biztosan törölni szeretnéd ezt a megoldott posztot?")) return;
    try {
        await deleteDoc(doc(db, "solved", postId));
        alert("Poszt törölve.");
        listSolved();
    } catch (error) {
        alert("Hiba a törlés során: " + error.message);
    }
};
