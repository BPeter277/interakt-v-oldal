import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgMwGI2LjzcxL60K5GoM7vo6nAKtwxPV4",
  authDomain: "bejelent-3768f.firebaseapp.com",
  projectId: "bejelent-3768f",
  storageBucket: "bejelent-3768f.firebasestorage.app",
  messagingSenderId: "253589417646",
  appId: "1:253589417646:web:2fb9eea186af2c6243873f",
  measurementId: "G-1PGFNG00D2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function regisztral() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Sikeres regisztráció!");
        })
        .catch((error) => {
            alert("Hiba: " + error.message);
        });
}

function bejelentkez() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Sikeres bejelentkezés!");
        })
        .catch((error) => {
            alert("Hiba: " + error.message);
        });
}

function kijelentkez() {
    signOut(auth).then(() => {
        alert("Kijelentkeztél!");
    });
}

onAuthStateChanged(auth, (user) => {
    const info = document.getElementById("felhasznalo-info");
    if (user) {
        info.innerText = `Bejelentkezve mint: ${user.email}`;
    } else {
        info.innerText = "Nem vagy bejelentkezve.";
    }
});

window.regisztral = regisztral;
window.bejelentkez = bejelentkez;
window.kijelentkez = kijelentkez;