import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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

let currentUser = null;
let currentUserRole = "user";
let currentPostToClose = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("user-email-display").innerText = `Bejelentkezve: ${user.email}`;
        const users = await getDocs(collection(db, "users"));
        users.forEach((docu) => {
            if (docu.id === user.email) {
                currentUserRole = docu.data().role;
            }
        });
        listUnderProcess();
    }
});

window.listUnderProcess = async function() {
    const postList = document.getElementById("under-process-post-list");
    postList.innerHTML = "";

    const q = query(collection(db, "posts"), orderBy("underProcessDate", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach((post) => {
        const data = post.data();
        const postId = post.id;

        if (data.underProcess) {
            const div = document.createElement("div");
            div.className = "post-card";
            div.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <p><strong>Téma:</strong> ${data.topic}</p>
                <p><small>Ügyintézés alá vonva: ${new Date(data.underProcessDate.seconds * 1000).toLocaleString()}</small></p>
                ${(currentUserRole === "admin" || currentUserRole === "hokos") ? `
                    <button onclick="deleteUnderProcessPost('${postId}')">🗑 Törlés</button>
                    <button onclick="returnToList('${postId}')">↩️ Visszatesz</button>
                    <button onclick="openSolutionModal('${postId}')">✅ Lezár</button>
                ` : ""}
            `;
            postList.appendChild(div);
        }
    });
};

window.openSolutionModal = function(postId) {
    currentPostToClose = postId;
    document.getElementById("modal").style.display = "block";
};

window.closeModal = function() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("solution-text").value = "";
};

window.submitSolution = async function() {
    const solutionText = document.getElementById("solution-text").value;
    if (!solutionText || !currentPostToClose) return alert("Írj be megoldási szöveget!");

    const postRef = doc(db, "posts", currentPostToClose);
    const postSnapshot = await getDocs(collection(db, "posts"));
    let postData = null;
    postSnapshot.forEach((p) => {
        if (p.id === currentPostToClose) {
            postData = p.data();
        }
    });

    if (!postData) {
        closeModal();
        return;
    }

    await setDoc(doc(db, "solved", currentPostToClose), {
        ...postData,
        underProcessDate: postData.underProcessDate || new Date(),
        solvedDate: new Date(),
        solution: solutionText
    });

    await deleteDoc(postRef);
    closeModal();
    listUnderProcess();
    alert("A poszt sikeresen lezárva és áthelyezve a 'Megoldott' fülre.");
};

window.returnToList = async function(postId) {
    await updateDoc(doc(db, "posts", postId), { underProcess: false });
    alert("A poszt visszakerült a listázásba.");
    listUnderProcess();
};

window.deleteUnderProcessPost = async function(postId) {
    if (confirm("Biztosan törölni szeretnéd ezt az ügyintézés alatt lévő posztot?")) {
        await deleteDoc(doc(db, "posts", postId));
        alert("Poszt törölve.");
        listUnderProcess();
    }
};

listUnderProcess();
