// profile.js - frissített változat
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loadUserPosts(user.email);
  } else {
    document.getElementById("profile-post-list").innerHTML = "Jelentkezz be a saját posztjaid megtekintéséhez.";
  }
});

async function loadUserPosts(email) {
  const postListDiv = document.getElementById("profile-post-list");
  postListDiv.innerHTML = "";

  const q = query(collection(db, "posts"), where("author", "==", email));
  const snapshot = await getDocs(q);

  snapshot.forEach((docu) => {
    const post = docu.data();
    const div = document.createElement("div");
    div.classList.add("post-item");
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p><strong>Téma:</strong> ${post.topic}</p>
      <p><strong>Közzétéve:</strong> ${new Date(post.date.seconds * 1000).toLocaleString()}</p>
      <p><strong>Lájkok száma:</strong> ${post.likes}</p>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Törlés";
    deleteBtn.onclick = async () => {
      if (confirm("Biztosan törlöd ezt a saját posztodat?")) {
        await deleteDoc(doc(db, "posts", docu.id));
        alert("Poszt törölve.");
        loadUserPosts(email);
      }
    };
    div.appendChild(deleteBtn);

    postListDiv.appendChild(div);
  });
}
