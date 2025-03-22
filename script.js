import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "IDE_TEDD_BE_A_SAJAJÁT_API_KEY-ed",
  authDomain: "IDE-IRJ-BE.firebaseapp.com",
  projectId: "IDE-IRJ-BE",
  storageBucket: "IDE-IRJ-BE.appspot.com",
  messagingSenderId: "IDE-IRJ-BE",
  appId: "IDE-IRJ-BE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.regisztral = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
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

window.jelszoModositas = async function() {
    const newPassword = document.getElementById("new-password").value;
    try {
        await updatePassword(auth.currentUser, newPassword);
        alert("Jelszó sikeresen módosítva!");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
};

window.ujPoszt = async function() {
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    try {
        await addDoc(collection(db, "posts"), { title, content, author: auth.currentUser.email, date: new Date() });
        alert("Poszt sikeresen létrehozva!");
    } catch (error) {
        alert("Hiba: " + error.message);
    }
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

window.listUsers = async function() {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "users"));
    snapshot.forEach((docu) => {
        const li = document.createElement("li");
        li.textContent = `${docu.id} (role: ${docu.data().role}) `;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Törlés";
        deleteBtn.onclick = async () => {
            await deleteDoc(doc(db, "users", docu.id));
            alert(`Törölve: ${docu.id}`);
            listUsers();
        };
        li.appendChild(deleteBtn);
        userList.appendChild(li);
    });
};

onAuthStateChanged(auth, async (user) => {
    const udvozles = document.getElementById("udvozles");
    const adminPanel = document.getElementById("admin-panel");
    const writerPanel = document.getElementById("writer-panel");
    const userPanel = document.getElementById("user-panel");
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.email));
        const role = userDoc.exists() ? userDoc.data().role : "user";
        udvozles.innerText = `Bejelentkezve mint: ${user.email} (Jogkör: ${role})`;
        adminPanel.style.display = role === "admin" ? "block" : "none";
        writerPanel.style.display = (role === "writer" || role === "admin") ? "block" : "none";
        userPanel.style.display = "block";
    } else {
        udvozles.innerText = "Nem vagy bejelentkezve.";
        adminPanel.style.display = "none";
        writerPanel.style.display = "none";
        userPanel.style.display = "none";
    }
});