import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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

window.changePassword = async function() {
    const newPassword = document.getElementById("new-password").value;
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                await updatePassword(user, newPassword);
                alert("A jelszó sikeresen módosítva!");
                window.location.href = "index.html";
            } catch (error) {
                alert("Hiba: " + error.message);
            }
        } else {
            alert("Nem vagy bejelentkezve.");
        }
    });
};
