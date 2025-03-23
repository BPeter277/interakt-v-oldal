// under_process.js - frissített változat
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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
  const underProcessListDiv = document.getElementById("under-process-list");
  underProcessListDiv.innerHTML = "";
  const snapshot = await getDocs(collection(db, "under_process"));

  onAuthStateChanged(auth, (user) => {
    const isAdminOrHokos = user && user.emailVerified;

    snapshot.forEach((docu) => {
      const post = docu.data();
      const div = document.createElement("div");
      div.classList.add("post-item");
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p><strong>Téma:</strong> ${post.topic}</p>
        <p><strong>Létrehozva:</strong> ${new Date(post.date.seconds * 1000).toLocaleString()}</p>
      `;

      if (isAdminOrHokos) {
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Lezárás";
        closeBtn.onclick = () => showCloseModal(docu.id);
        div.appendChild(closeBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Törlés";
        deleteBtn.onclick = async () => {
          if (confirm("Biztosan törölni szeretnéd ezt a posztot?")) {
            await deleteDoc(doc(db, "under_process", docu.id));
            alert("Poszt törölve.");
            loadUnderProcessPosts();
          }
        };
        div.appendChild(deleteBtn);
      }

      underProcessListDiv.appendChild(div);
    });
  });
}

window.showCloseModal = function(postId) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Lezárási megjegyzés:</h3>
      <textarea id="solution-note"></textarea>
      <button onclick="closePost('${postId}')">Kész</button>
      <button onclick="this.parentElement.parentElement.remove()">Mégse</button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.closePost = async function(postId) {
  const note = document.getElementById("solution-note").value;
  const postDoc = await getDoc(doc(db, "under_process", postId));
  if (postDoc.exists()) {
    const post = postDoc.data();
    await addDoc(collection(db, "solved"), {
      ...post,
      solvedDate: new Date(),
      solutionNote: note,
      underProcessDate: post.underProcessDate || new Date()
    });
    await deleteDoc(doc(db, "under_process", postId));
    alert("Poszt lezárva és áthelyezve a Megoldott ügyek közé.");
    document.querySelector(".modal").remove();
    loadUnderProcessPosts();
  }
};

loadUnderProcessPosts();