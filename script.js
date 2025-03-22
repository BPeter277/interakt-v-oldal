import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
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
    if (!email.endsWith("@uni-corvinus.hu") && !email.endsWith("@stud.uni-corvinus.hu")) {
        return alert("Csak corvinusos e-mail címmel lehet regisztrálni.");
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", email), { role: "writer" });
        await userCredential.user.sendEmailVerification();
        alert("Sikeres regisztráció! Ellenőrizd az emailt a visszaigazoláshoz.");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.bejelentkez = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            signOut(auth);
            return alert("Először erősítsd meg az email-címedet az emailben küldött linkkel!");
        }
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.kijelentkez = function() {
    signOut(auth);
};

window.elfelejtettJelszo = async function() {
    const email = document.getElementById("email").value;
    if (!email) return alert("Kérlek add meg az email címedet!");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Jelszó-visszaállítási email elküldve!");
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
    const passwordChangeBtn = document.getElementById("password-change-btn");
    const adminPanel = document.getElementById("admin-panel");
    const writerPanel = document.getElementById("writer-panel");
    const navButtons = document.getElementById("nav-buttons");
    const welcomeText = document.getElementById("welcome-text");
    const emailDisplay = document.getElementById("user-email-display");

    if (user) {
        document.body.classList.remove('before-login');
        authPanel.style.display = "none";
        logoutBtn.style.display = "block";
        passwordChangeBtn.style.display = "block";
        navButtons.style.display = "block";
        emailDisplay.innerText = `Bejelentkezve: ${user.email}`;
        welcomeText.style.display = "none";

        const userDoc = await getDoc(doc(db, "users", user.email));
        const role = userDoc.exists() ? userDoc.data().role : "user";
        if (role === "admin") adminPanel.style.display = "block";
        if (role === "writer" || role === "admin" || role === "hokos") writerPanel.style.display = "block";

        betoltTemak();
    } else {
        document.body.classList.add('before-login');
        authPanel.style.display = "block";
        logoutBtn.style.display = "none";
        passwordChangeBtn.style.display = "none";
        adminPanel.style.display = "none";
        writerPanel.style.display = "none";
        navButtons.style.display = "none";
        emailDisplay.innerText = "";
        welcomeText.style.display = "block";
    }
});

window.showUserListModal = async function() {
    const userList = document.getElementById("user-list-scrollable");
    userList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "users"));
    snapshot.forEach((docu) => {
        const li = document.createElement("li");
        li.textContent = `${docu.id} (Jogkör: ${docu.data().role})`;
        userList.appendChild(li);
    });
    document.getElementById("user-list-modal").style.display = "block";
};

window.closeUserListModal = function() {
    document.getElementById("user-list-modal").style.display = "none";
};
