import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email.endsWith("@uni-corvinus.hu") && !email.endsWith("@stud.uni-corvinus.hu")) {
        return alert("Csak corvinusos e-mail címmel lehet regisztrálni.");
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", email), { role: "writer" });
        await sendEmailVerification(userCredential.user);
        alert("Sikeres regisztráció! Erősítsd meg az email címedet.");
        await signOut(auth);
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.bejelentkez = async function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            await signOut(auth);
            return alert("Először erősítsd meg az email-címedet!");
        }
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.kijelentkez = function() {
    signOut(auth);
};

window.elfelejtettJelszo = async function() {
    const email = document.getElementById("email").value.trim();
    if (!email) return alert("Add meg az email címed!");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Jelszó visszaállítási email elküldve!");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.confirmDeleteTopic = async function() {
    const topicToDelete = document.getElementById("delete-topic-select").value;
    if (!topicToDelete) return alert("Válassz ki egy témát a törléshez!");

    if (confirm(`Biztosan törölni szeretnéd a(z) "${topicToDelete}" témát?`)) {
        try {
            await deleteDoc(doc(db, "topics", topicToDelete));
            alert(`A(z) "${topicToDelete}" téma törölve.`);
            await betoltTemak();
        } catch (error) {
            alert("Hiba törlés közben: " + error.message);
        }
    }
};

window.addTopicHokos = async function() {
    const ujTema = document.getElementById("new-topic-input-hokos").value.trim();
    if (!ujTema) return alert("Írj be egy témát!");

    try {
        await setDoc(doc(db, "topics", ujTema), {});
        alert(`Téma hozzáadva: ${ujTema}`);
        document.getElementById("new-topic-input-hokos").value = "";
        await betoltTemak();
    } catch (error) {
        alert("Hiba téma hozzáadásakor: " + error.message);
    }
};

async function betoltTemak() {
    const topicSelect = document.getElementById("delete-topic-select");
    if (topicSelect) {
        topicSelect.innerHTML = '<option disabled selected>Válassz törlendő témát</option>';
        const snapshot = await getDocs(collection(db, "topics"));
        snapshot.forEach((topicDoc) => {
            const opt = document.createElement("option");
            opt.value = topicDoc.id;
            opt.innerText = topicDoc.id;
            topicSelect.appendChild(opt);
        });
    }

    const postTopicSelect = document.getElementById("post-topic");
    if (postTopicSelect) {
        postTopicSelect.innerHTML = '<option disabled selected>Válassz témát</option>';
        const snapshot = await getDocs(collection(db, "topics"));
        snapshot.forEach((topicDoc) => {
            const opt = document.createElement("option");
            opt.value = topicDoc.id;
            opt.innerText = topicDoc.id;
            postTopicSelect.appendChild(opt);
        });
    }
}

onAuthStateChanged(auth, async (user) => {
    const adminPanel = document.getElementById("admin-panel");
    const writerPanel = document.getElementById("writer-panel");
    const hokosPanel = document.getElementById("hokos-panel");
    const navButtons = document.getElementById("nav-buttons");

    if (user && user.emailVerified) {
        const userDoc = await getDoc(doc(db, "users", user.email));
        const role = userDoc.exists() ? userDoc.data().role : "user";

        adminPanel.style.display = role === "admin" ? "block" : "none";
        hokosPanel.style.display = (role === "hokos") ? "block" : "none";
        writerPanel.style.display = (role === "writer" || role === "admin" || role === "hokos") ? "block" : "none";
        navButtons.style.display = "block";

        await betoltTemak();
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
