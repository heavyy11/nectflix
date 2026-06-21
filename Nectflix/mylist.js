import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { openModal } from "./modal.js";
import { auth, db } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const myListContainer = document.getElementById("myListContainer");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        myListContainer.innerHTML = "<p>Please log in to see your list.</p>";
        return;
    }

    const listRef = ref(db, `users/${user.uid}/myList`);
    get(listRef).then(snapshot => {
        if (!snapshot.exists()) {
            myListContainer.innerHTML = "<p>No items in your list.</p>";
            return;
        }

        const data = snapshot.val();
        myListContainer.innerHTML = ""; 
        Object.values(data).forEach(item => {
            const card = document.createElement("div");
            card.classList.add("movie-card");
            card.dataset.id = item.id;

            
            const backdrop = `https://image.tmdb.org/t/p/w500${item.backdrop}`;

            card.innerHTML = `<img src="${backdrop}" alt="${item.title}"><p>${item.title}</p>`;
            
            card.addEventListener("click", () => {
                openModal(item.id, item.type); 
            });
            myListContainer.appendChild(card);
        });
    });
});