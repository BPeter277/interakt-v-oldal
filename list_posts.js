import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, increment, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

window.listPosts = async function() {
    const minLikes = parseInt(document.getElementById("min-likes").value) || 0;
    const postList = document.getElementById("post-list");
    postList.innerHTML = "";

    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((post) => {
        const data = post.data();
        if ((data.likes || 0) >= minLikes) {
            const div = document.createElement("div");
            div.className = "post-card";
            div.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <p><strong>Téma:</strong> ${data.topic || "Nincs megadva"}</p>
                <p><small>Közzétéve: ${new Date(data.date.seconds * 1000).toLocaleString()}</small></p>
                <p><strong>Lájkok:</strong> ${data.likes || 0}</p>
                <button onclick="likePost('${post.id}')">👍 Like</button>
            `;
            postList.appendChild(div);
        }
    });
};

window.likePost = async function(postId) {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { likes: increment(1) });
    alert("Lájk hozzáadva!");
    listPosts();
};

listPosts();
