import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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

let currentUserRole = "user";
let closePostId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const users = await getDocs(collection(db, "users"));
        users.forEach((docu) => {
            if (docu.id === user.email) {
                currentUserRole = docu.data().role;
            }
        });
        listUnderProcess();
    }
});

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
                ${(currentUserRole === "admin" || currentUserRole === "hokos") 
                    ? `<button onclick="openModal('${post.id}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">Lezárás</button>` 
                    : ""}
            `;
            container.appendChild(div);
        }
    });
}

window.openModal = function(postId, postData) {
    closePostId = { id: postId, data: JSON.parse(postData.replace(/&quot;/g, '"')) };
    document.getElementById("modal").style.display = "block";
};

window.closeModal = function() {
    document.getElementById("modal").style.display = "none";
};

window.submitSolution = async function() {
    const solutionText = document.getElementById("solution-text").value;
    if (!solutionText || !closePostId) return alert("Írd be a megoldást!");
    const postRef = doc(db, "posts", closePostId.id);
    const postData = closePostId.data;

    await setDoc(doc(db, "solved", closePostId.id), {
        ...postData,
        underProcessDate: postData.underProcessDate || new Date(),
        solvedDate: new Date(),
        solution: solutionText
    });

    await deleteDoc(postRef);
    closePostId = null;
    document.getElementById("solution-text").value = "";
    closeModal();
    listUnderProcess();
    alert("Lezárva és áthelyezve a 'Megoldott' fülre.");
};

listUnderProcess();
