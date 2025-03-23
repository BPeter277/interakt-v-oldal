// list_posts.js - frissített változat
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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

async function loadPosts() {
  const postListDiv = document.getElementById("post-list");
  postListDiv.innerHTML = "";

  const topicFilter = document.getElementById("topic-filter").value;
  const sortFilter = document.getElementById("sort-filter").value;
  const snapshot = await getDocs(collection(db, "posts"));

  let postsArray = [];

  snapshot.forEach((docu) => {
    const post = docu.data();
    post.id = docu.id;
    postsArray.push(post);
  });

  if (topicFilter) {
    postsArray = postsArray.filter((post) => post.topic === topicFilter);
  }

  if (sortFilter === "likes") {
    postsArray.sort((a, b) => b.likes - a.likes);
  } else if (sortFilter === "date") {
    postsArray.sort((a, b) => b.date.seconds - a.date.seconds);
  }

  const user = auth.currentUser;

  postsArray.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("post-item");
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p><strong>Téma:</strong> ${post.topic}</p>
      <p><strong>Dátum:</strong> ${new Date(post.date.seconds * 1000).toLocaleString()}</p>
      <p><strong>Lájkok:</strong> <span id="like-count-${post.id}">${post.likes || 0}</span></p>
    `;

    if (user && user.emailVerified) {
      const likeBtn = document.createElement("button");
      likeBtn.textContent = post.likedBy?.includes(user.email) ? "Lájkolva ✅" : "👍 Lájk";
      likeBtn.style.backgroundColor = post.likedBy?.includes(user.email) ? "#a3d2ff" : "";

      likeBtn.onclick = async () => {
        const postRef = doc(db, "posts", post.id);
        const updatedLikedBy = post.likedBy || [];

        if (updatedLikedBy.includes(user.email)) {
          const newLikedBy = updatedLikedBy.filter((email) => email !== user.email);
          await updateDoc(postRef, { likes: (post.likes || 0) - 1, likedBy: newLikedBy });
        } else {
          updatedLikedBy.push(user.email);
          await updateDoc(postRef, { likes: (post.likes || 0) + 1, likedBy: updatedLikedBy });
        }

        loadPosts();
      };

      div.appendChild(likeBtn);
    }

    postListDiv.appendChild(div);
  });
}

loadPosts();
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) loadPosts();
});
