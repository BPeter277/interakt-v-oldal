import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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
const auth = getAuth(app);

let currentUserEmail = null;
let currentUserRole = "user";

onAuthStateChanged(auth, async (user) => {
    if (user) {
	currentUserEmail = user.email;
        const userDocs = await getDocs(collection(db, "users"));
        userDocs.forEach((docu) => {
            if (docu.id === currentUserEmail) {
                currentUserRole = docu.data().role;
            }
        });
        listSolved();
    }
});

async function listSolved() {
    const container = document.getElementById("solved-list");
    container.innerHTML = "<h3>Betöltés...</h3>";
    const q = query(collection(db, "solved"), orderBy("solvedDate", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";
    snapshot.forEach((post) => {
        const data = post.data();
	console.log("Megjelenített solved poszt ID:", post.id); // Ellenőrzéshez
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
            ${(currentUserRole === "admin") ? `<button onclick="deleteSolvedPost('${post.id}')">🗑 Törlés</button>` : ""}
        `;
        container.appendChild(div);
    });
}

window.deleteSolvedPost = async function(postId) {
    console.log("Törölni próbált solved poszt ID:", postId); // Ellenőrzéshez
    if (confirm("Biztosan törölni szeretnéd ezt a lezárt posztot?")) {
        try {
            await deleteDoc(doc(db, "solved", postId));
            alert("Lezárt poszt törölve.");
            listSolved();
        } catch (error) {
            console.error("Hiba a törlés során:", error);
            alert("Hiba történt törlés közben: " + error.message);
        }
    }
};
