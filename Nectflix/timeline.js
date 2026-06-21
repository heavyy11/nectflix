import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db, auth } from "./firebase.js";
import { openModal } from "./modal.js";

const myTimeline = document.getElementById("myTimeline");
const MAX = 5;

onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
        myTimeline.innerHTML = "<p>Please log in to see the timeline.</p>";
        return;
    }

    try {
        
        const currentUserSnap = await get(ref(db, `users/${currentUser.uid}`));
        const currentUserData = currentUserSnap.val();
        if (!currentUserData) {
            myTimeline.innerHTML = "<p>User data not found.</p>";
            return;
        }

        
        const followingData = currentUserData.following || {};

    
        const usersSnap = await get(ref(db, "users"));
        const usersData = usersSnap.val() || {};

        const usersToShowIds = [currentUser.uid, ...Object.keys(followingData)];

        myTimeline.innerHTML = ""; 

        
        usersToShowIds.forEach(userId => {
            const user = usersData[userId];
            if (!user) return; 

            const username = user.username || "Unknown";
            const fullName = user.fullName || "Full Name";
            const profilePic = user.profilePic || "images/profile.png";

            const card = document.createElement("div");
            card.classList.add("timeline-card");

            card.innerHTML = `
                <div class="timeline-header">
                    <div class="timeline-user">
                        <img src="${profilePic}" alt="Profile Picture">
                        <div class="user-info">
                            <strong>${fullName}</strong>
                            <p>@${username}</p>
                        </div>
                    </div>
                </div>
                <div class="timeline-slots"></div>
            `;

            const slotsContainer = card.querySelector(".timeline-slots");
            const items = user.weeklyTop5 ? Object.values(user.weeklyTop5).sort((a,b) => b.addedAt - a.addedAt) : [];

            for (let i = 0; i < MAX; i++) {
                const slot = document.createElement("div");
                slot.classList.add("timeline-slot");

                if (items[i]) {
                    const item = items[i];
                    const backdrop = `https://image.tmdb.org/t/p/w500${item.backdrop}`;
                    slot.innerHTML = `<img src="${backdrop}" alt="${item.title}">`;
                    slot.dataset.id = item.id;
                    slot.dataset.type = item.type;
                    slot.addEventListener("click", () => openModal(item.id, item.type));
                } else {
                    slot.classList.add("timeline-placeholder");
                    slot.textContent = "+";
                }

                slotsContainer.appendChild(slot);
            }

            myTimeline.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading timeline:", err);
        myTimeline.innerHTML = "<p>Error loading timeline.</p>";
    }
});