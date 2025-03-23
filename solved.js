// solved.js - frissített változat
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

async function loadSolvedPosts() {
  const solvedListDiv = document.getElementById("solved-list");
  solvedListDiv.innerHTML = "";
  const snapshot = await getDocs(collection(db, "solved"));

  onAuthStateChanged(auth, (user) => {
    const isAdmin = user && user.emailVerified;

    snapshot.forEach((docu) => {
      const post = docu.data();
      const div = document.createElement("div");
      div.classList.add("post-item");
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p><strong>Téma:</strong> ${post.topic}</p>
        <p><strong>Létrehozás dátuma:</strong> ${new Date(post.date.seconds * 1000).toLocaleString()}</p>
        <p><strong>Ügyintézésre került:</strong> ${new Date(post.underProcessDate.seconds * 1000).toLocaleString()}</p>
        <p><strong>Megoldás dátuma:</strong> ${new Date(post.solvedDate.seconds * 1000).toLocaleString()}</p>
        <p><strong>Lezárási megjegyzés:</strong> ${post.solutionNote}</p>
      `;

      if (isAdmin) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Törlés";
        deleteBtn.onclick = async () => {
          if (confirm("Biztosan törlöd ezt a posztot a megoldottak közül?")) {
            await deleteDoc(doc(db, "solved", docu.id));
            alert("Poszt törölve.");
            loadSolvedPosts();
          }
        };
        div.appendChild(deleteBtn);
      }

      solvedListDiv.appendChild(div);
    });
  });
}

loadSolvedPosts();