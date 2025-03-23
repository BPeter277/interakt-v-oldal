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

window.regisztral = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email.endsWith("@uni-corvinus.hu") && !email.endsWith("@stud.uni-corvinus.hu")) {
    return alert("Csak corvinusos e-mail címmel lehet regisztrálni.");
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", email), { role: "writer" });
    await sendEmailVerification(userCredential.user);
    alert("Sikeres regisztráció! Kérlek, erősítsd meg az e-mail címedet a kiküldött levélben.");
    await signOut(auth);
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
      await signOut(auth);
      return alert("Először erősítsd meg az email-címedet a kapott linkkel!");
    } else {
      window.location.href = "dashboard.html"; // belépés után a főoldal
    }
  } catch (error) {
    alert("Hiba: " + error.message);
  }
};

window.elfelejtettJelszo = async function() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Kérlek, add meg az email címed!");
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Jelszó-visszaállítási email elküldve!");
  } catch (error) {
    alert("Hiba: " + error.message);
  }
};

window.kijelentkez = function() {
  signOut(auth);
};

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

  const user = auth.currentUser;
  const userDoc = await getDoc(doc(db, "users", user.email));
  const role = userDoc.data().role;

  if (role !== "admin" && role !== "hokos") {
    return alert("Csak admin vagy hökös adhat hozzá témát.");
  }

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

  const user = auth.currentUser;
  const userDoc = await getDoc(doc(db, "users", user.email));
  const role = userDoc.data().role;

  if (role !== "admin") {
    return alert("Csak admin törölhet témát.");
  }

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

  // Bejelentkezés előtt ne jelenjen meg a főoldalra vissza gomb.
  if (user && user.emailVerified && window.location.pathname !== "/dashboard.html") {
    const backButton = document.createElement("button");
    backButton.textContent = "🏠 Főoldal";
    backButton.style.position = "fixed";
    backButton.style.top = "5px";
    backButton.style.left = "5px";
    backButton.onclick = () => window.location.href = "dashboard.html";
    document.body.appendChild(backButton);
  }
});