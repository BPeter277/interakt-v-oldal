import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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

window.regisztral = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Sikeres regisztráció!"))
        .catch((error) => alert("Hiba: " + error.message));
};

window.bejelentkez = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => alert("Sikeres bejelentkezés!"))
        .catch((error) => alert("Hiba: " + error.message));
};

window.kijelentkez = function() {
    signOut(auth).then(() => alert("Kijelentkeztél!"));
};

onAuthStateChanged(auth, (user) => {
    const info = document.getElementById("felhasznalo-info");
    info.innerText = user ? `Bejelentkezve mint: ${user.email}` : "Nem vagy bejelentkezve.";
});