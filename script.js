import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgMwGI2LjzcxL60K5GoM7vo6nAKtwxPV4",
  authDomain: "bejelent-3768f.firebaseapp.com",
  projectId: "bejelent-3768f",
  storageBucket: "bejelent-3768f.appspot.com",
  messagingSenderId: "253589417646",
  appId: "1:253589417646:web:2fb9eea186af2c6243873f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.regisztral = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", email), { role: "writer" });
        alert("Sikeres regisztráció! Alap jogkör: writer");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.bejelentkez = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.kijelentkez = function() {
    signOut(auth);
};

window.elfelejtettJelszo = async function() {
    const email = document.getElementById("email").value;
    if (!email) return alert("Kérlek add meg az email címed!");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Jelszó visszaállítási email elküldve!");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

async function betoltTemak() {
    const temaSelect = document.getElementById("post-topic");
    if (!temaSelect) return;
    temaSelect.innerHTML = '<option disabled selected>Válassz témát</option>';
    const snapshot = await getDocs(collection(db, "topics"));
    snapshot.forEach((topicDoc) => {
        const opt = document.createElement("option");
        opt.value = topicDoc.id;
        opt.innerText = topicDoc.id;
        temaSelect.appendChild(opt);
    });
}

window.ujPoszt = async function() {
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    const topic = document.getElementById("post-topic").value;
    if (!topic) return alert("Válassz témát a legördülő listából!");
    await addDoc(collection(db, "posts"), { title, content, topic, author: auth.currentUser.email, date: new Date(), likes: 0, likedBy: [], underProcess: false });
    alert("Poszt sikeresen létrehozva!");
};

onAuthStateChanged(auth, async (user) => {
    const authPanel = document.getElementById("auth-panel");
    const logoutBtn = document.getElementById("logout-btn");
    const adminPanel = document.getElementById("admin-panel");
    const writerPanel = document.getElementById("writer-panel");
    const navButtons = document.getElementById("nav-buttons");
    const welcomeText = document.getElementById("welcome-text");
    if (user) {
        document.body.classList.remove('before-login');
        document.body.classList.add('light-mode');
        authPanel.style.display = "none";
        logoutBtn.style.display = "block";
        adminPanel.style.display = "none";
        writerPanel.style.display = "none";
        navButtons.style.display = "block";
        const userDoc = await getDoc(doc(db, "users", user.email));
        const role = userDoc.exists() ? userDoc.data().role : "user";
        if (role === "admin") adminPanel.style.display = "block";
        if (role === "writer" || role === "admin") writerPanel.style.display = "block";
        welcomeText.style.display = "none";
        betoltTemak();
    } else {
        document.body.classList.add('before-login');
        authPanel.style.display = "block";
        logoutBtn.style.display = "none";
        adminPanel.style.display = "none";
        writerPanel.style.display = "none";
        navButtons.style.display = "none";
        welcomeText.style.display = "block";
    }
});
