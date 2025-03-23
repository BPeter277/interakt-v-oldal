import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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

async function loadUnderProcessPosts() {
  const postListDiv = document.getElementById("under-process-list");
  postListDiv.innerHTML = "";
  const snapshot = await getDocs(collection(db, "under_process"));

  const user = auth.currentUser;
  let role = "user";

  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.email));
    if (userDoc.exists()) {
      role = userDoc.data().role;
    }
  }

  snapshot.forEach((docu) => {
    const post = docu.data();
    const div = document.createElement("div");
    div.classList.add("post-item");
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p><strong>Téma:</strong> ${post.topic}</p>
      <p><strong>Áthelyezve ügyintézésre:</strong> ${new Date(post.underProcessDate.seconds * 1000).toLocaleString()}</p>
    `;

    if (role === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Törlés";
      deleteBtn.onclick = async () => {
        if (confirm("Biztosan törlöd ezt a posztot?")) {
          await deleteDoc(doc(db, "under_process", docu.id));
          alert("Poszt törölve.");
          loadUnderProcessPosts();
        }
      };
      div.appendChild(deleteBtn);
    }

    postListDiv.appendChild(div);
  });
}

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) loadUnderProcessPosts();
});
