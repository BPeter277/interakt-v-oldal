import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, increment, query, orderBy, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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
        loadTopics();
        listPosts();
    }
});

async function loadTopics() {
    const select = document.getElementById("filter-topic");
    if (!select) return;
    select.innerHTML = '<option value="all">Összes</option>';
    const snapshot = await getDocs(collection(db, "topics"));
    snapshot.forEach((docu) => {
        const opt = document.createElement("option");
        opt.value = docu.id;
        opt.innerText = docu.id;
        select.appendChild(opt);
    });
}

window.listPosts = async function() {
    const topicFilter = document.getElementById("filter-topic").value;
    const sortBy = document.getElementById("sort-by").value;

    const postList = document.getElementById("post-list");
    postList.innerHTML = "";

    const q = query(collection(db, "posts"), orderBy(sortBy === "likes" ? "likes" : "date", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((post) => {
        const data = post.data();
        const postId = post.id;

        if (!data.underProcess && (topicFilter === "all" || data.topic === topicFilter)) {
            const div = document.createElement("div");
            div.className = "post-card";
            const liked = data.likedBy && currentUserEmail && data.likedBy.includes(currentUserEmail);
            div.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <p><strong>Téma:</strong> ${data.topic}</p>
                <p><small>Közzétéve: ${new Date(data.date.seconds * 1000).toLocaleString()}</small></p>
                <p><strong>Lájkok:</strong> ${data.likes || 0}</p>
                <button class="like-button ${liked ? "active" : ""}" onclick="toggleLike('${postId}', ${liked})">
                    ${liked ? "Visszavonás 👎" : "Lájk 👍"}
                </button>
                ${(currentUserRole === "admin" || currentUserRole === "hokos") ? `<button onclick="markUnderProcess('${postId}')">Ügyintézés alá vonás</button>` : ""}
                ${(currentUserRole === "admin" || data.author === currentUserEmail) ? `<button onclick="deletePost('${postId}')">🗑 Törlés</button>` : ""}
            `;
            postList.appendChild(div);
        }
    });
};

window.toggleLike = async function(postId, currentlyLiked) {
    if (!currentUserEmail) return alert("Csak bejelentkezett felhasználók lájkolhatnak.");
    const postRef = doc(db, "posts", postId);
    if (currentlyLiked) {
        await updateDoc(postRef, { 
            likes: increment(-1), 
            likedBy: arrayRemove(currentUserEmail)
        });
    } else {
        await updateDoc(postRef, { 
            likes: increment(1), 
            likedBy: arrayUnion(currentUserEmail)
        });
    }
    listPosts();
};

window.markUnderProcess = async function(postId) {
    await updateDoc(doc(db, "posts", postId), { underProcess: true, underProcessDate: new Date() });
    alert("Poszt ügyintézés alá helyezve.");
    listPosts();
};

window.deletePost = async function(postId) {
    console.log("Törlésre kijelölt postId:", postId);
    if (confirm("Biztosan törölni szeretnéd ezt a posztot?")) {
        try {
            await deleteDoc(doc(db, "posts", postId));
            alert("Poszt törölve.");
            listPosts();
        } catch (error) {
            console.error("Hiba a törlés során:", error);
            alert("Hiba történt a törlés közben: " + error.message);
        }
    }
};

