import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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
        const postList = document.getElementById("own-post-list");
        postList.innerHTML = "<h3>Betöltés...</h3>";
        const q = query(collection(db, "posts"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        postList.innerHTML = "";
        snapshot.forEach((post) => {
            const data = post.data();
            if (data.author === user.email) {
                const div = document.createElement("div");
                div.className = "post-card";
                div.innerHTML = `
                    <h3>${data.title}</h3>
                    <p>${data.content}</p>
                    <p><strong>Téma:</strong> ${data.topic}</p>
                    <p><small>Közzétéve: ${new Date(data.date.seconds * 1000).toLocaleString()}</small></p>
                    <p><strong>Lájkok:</strong> ${data.likes || 0}</p>
                `;
                postList.appendChild(div);
            }
        });
    } else {
        document.getElementById("own-post-list").innerHTML = "<p>Bejelentkezés szükséges a saját posztjaid megtekintéséhez.</p>";
    }
});
