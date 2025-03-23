import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

window.showTopicModal = function() {
    document.getElementById("add-topic-modal").style.display = "block";
};

window.closeTopicModal = function() {
    document.getElementById("add-topic-modal").style.display = "none";
};

window.showTopicDeleteModal = function() {
    document.getElementById("delete-topic-modal").style.display = "block";
};

window.closeTopicDeleteModal = function() {
    document.getElementById("delete-topic-modal").style.display = "none";
};

window.confirmAddTopic = async function() {
    const ujTema = document.getElementById("new-topic-input").value.trim();
    if (!ujTema) return alert("Adj meg egy témanevet!");

    try {
        await setDoc(doc(db, "topics", ujTema), {});
        alert(`Téma hozzáadva: ${ujTema}`);
        document.getElementById("new-topic-input").value = "";
        closeTopicModal();
    } catch (error) {
        alert("Hiba a téma hozzáadásakor: " + error.message);
    }
};

window.confirmDeleteTopic = async function() {
    const torlendoTema = document.getElementById("delete-topic-input").value.trim();
    if (!torlendoTema) return alert("Adj meg egy törlendő témát!");

    try {
        await deleteDoc(doc(db, "topics", torlendoTema));
        alert(`Téma törölve: ${torlendoTema}`);
        document.getElementById("delete-topic-input").value = "";
        closeTopicDeleteModal();
    } catch (error) {
        alert("Hiba a téma törlésekor: " + error.message);
    }
};

window.setUserRole = async function() {
    const userEmail = document.getElementById("user-email").value.trim();
    const selectedRole = document.getElementById("role-select").value;

    if (!userEmail || !selectedRole) {
        return alert("Add meg az email címet és válassz ki jogkört!");
    }

    try {
        const userRef = doc(db, "users", userEmail);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            await updateDoc(userRef, { role: selectedRole });
        } else {
            await setDoc(userRef, { role: selectedRole });
        }
        alert(`Jogkör beállítva: ${userEmail} -> ${selectedRole}`);
    } catch (error) {
        alert("Hiba a jogkör állítás során: " + error.message);
    }
};

onAuthStateChanged(auth, async (user) => {
    const backBtn = document.getElementById("back-to-main");
    if (backBtn) {
        backBtn.style.display = user && user.emailVerified ? "block" : "none";
    }
});
