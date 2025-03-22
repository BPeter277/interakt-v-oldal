import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgMwGI2LjzcxL60K5GoM7vo6nAKtwxPV4",
  authDomain: "bejelent-3768f.firebaseapp.com",
  projectId: "bejelent-3768f",
  storageBucket: "bejelent-3768f.firebasestorage.app",
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", email), { role: "user" });
        alert("Sikeres regisztráció! Alap jogkör: user");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.bejelentkez = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Sikeres bejelentkezés!");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.kijelentkez = function() {
    signOut(auth).then(() => alert("Kijelentkeztél!"));
};

window.setUserRole = async function() {
    const userEmail = document.getElementById("user-email").value;
    const selectedRole = document.getElementById("role-select").value;
    try {
        await setDoc(doc(db, "users", userEmail), { role: selectedRole });
        alert("Jogkör sikeresen beállítva: " + selectedRole);
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

onAuthStateChanged(auth, async (user) => {
    const udvozles = document.getElementById("udvozles");
    const adminPanel = document.getElementById("admin-panel");
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.email));
        const role = userDoc.exists() ? userDoc.data().role : "user";
        udvozles.innerText = `Bejelentkezve mint: ${user.email} (Jogkör: ${role})`;
        adminPanel.style.display = role === "admin" ? "block" : "none";
    } else {
        udvozles.innerText = "Nem vagy bejelentkezve.";
        adminPanel.style.display = "none";
    }
});