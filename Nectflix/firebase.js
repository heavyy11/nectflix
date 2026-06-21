import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyCKk1raVH_Ra0TCfPvcpAODpTEfHxbCil0",
    authDomain: "nectflix-36203.firebaseapp.com",
    databaseURL: "https://nectflix-36203-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nectflix-36203",
    storageBucket: "nectflix-36203.firebasestorage.app",
    messagingSenderId: "1001197354003",
    appId: "1:1001197354003:web:c76ef922f6a8408fff13e6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
