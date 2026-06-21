import { auth, db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { openModal } from "./modal.js";

const profilePic = document.getElementById("profilePic");
const profileInfo = document.getElementById("profileInfo");
const weeklyContainer = document.getElementById("weeklyTopContainer");

const MAX = 5;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const snap = await get(ref(db, `users/${user.uid}`));
        const data = snap.val();

        if (!data) return;

        
        profilePic.src = data.profilePic || "images/profile.png";

        profileInfo.innerHTML = `
            <h1>${data.fullName || "No Name"}</h1>
            <p>@${data.username || "username"}</p>
        `;

        
        weeklyContainer.innerHTML = "";

        const items = data.weeklyTop5
            ? Object.values(data.weeklyTop5).sort((a,b) => b.addedAt - a.addedAt)
            : [];

        for (let i = 0; i < MAX; i++) {
            const slotsWrapper = document.createElement("div");
            slotsWrapper.classList.add("profile-slots");

            const slot = document.createElement("div");
            slot.classList.add("profile-slot");

            if (items[i]) {
                const item = items[i];
                const backdrop = `https://image.tmdb.org/t/p/w500${item.backdrop}`;

                slot.innerHTML = `<img src="${backdrop}" alt="${item.title}">`;

                
                slotsWrapper.innerHTML = `
                    <div class="profile-slot">
                        <img src="${backdrop}" alt="${item.title}">
                    </div>
                    <p class="profile-slot-title">${item.title}</p>
                `;

                
                const addedSlot = slotsWrapper.querySelector('.profile-slot');
                addedSlot.addEventListener("click", () => {
                    openModal(item.id, item.type);
                });

            } else {
                
                slotsWrapper.innerHTML = `
                    <div class="profile-slot empty">
                        <span class="plus">+</span>
                    </div>
                    <p class="profile-slot-title">Empty Slot</p>
                `;
            }

            weeklyContainer.appendChild(slotsWrapper);
        }

    } catch (err) {
        console.error("Profile load error:", err);
    }
});