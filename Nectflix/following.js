import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const followingContainer = document.getElementById("followingContainer");
const allUsersContainer = document.getElementById("allUsersContainer");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        followingContainer.innerHTML = "<p>Please log in to see your following list.</p>";
        allUsersContainer.innerHTML = "<p>Please log in to see users.</p>";
        return;
    }

    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    const usersData = snapshot.val() || {};

    followingContainer.innerHTML = "";
    allUsersContainer.innerHTML = "";

    const currentUserFollowing = usersData[user.uid]?.following || {};

    Object.entries(usersData).forEach(([uid, uData]) => {
        if (uid === user.uid) return; 

        const card = document.createElement("div");
        card.classList.add("user-card");

        const info = document.createElement("div");
        info.classList.add("user-info");

        info.innerHTML = `
            <img src="${uData.profilePic || "images/profile.png"}" alt="${uData.fullName}">
            <div class="user-details">
                <strong>${uData.fullName}</strong>
                <span>@${uData.username}</span>
            </div>
        `;

        const btn = document.createElement("button");
        btn.classList.add("follow-btn");
        btn.textContent = currentUserFollowing[uid] ? "Following" : "Follow";

        if (currentUserFollowing[uid]) btn.classList.add("following");

        btn.addEventListener("click", async () => {
            const userFollowRef = ref(db, `users/${user.uid}/following/${uid}`);
            if (currentUserFollowing[uid]) {
                await remove(userFollowRef);
                btn.textContent = "Follow";
                btn.classList.remove("following");
                delete currentUserFollowing[uid];
            } else {
                await set(userFollowRef, true);
                btn.textContent = "Following";
                btn.classList.add("following");
                currentUserFollowing[uid] = true;
            }
        });

        card.appendChild(info);
        card.appendChild(btn);

        if (currentUserFollowing[uid]) {
            followingContainer.appendChild(card);
        } else {
            allUsersContainer.appendChild(card);
        }
    });
});