import { auth, db } from "./firebase.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const API_KEY = "a4efa9fc8863045c2677999a98ace9ec";

const modal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

export function openModal(id, type = "movie") {
    document.body.style.overflow = "hidden"; 
    modal.classList.remove("hidden");

    fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
        const title = data.title || data.name;

        const year = (data.release_date || data.first_air_date || "").slice(0,4);

        const genres = data.genres?.map(g => g.name).join(", ") || "N/A";

        modalBody.innerHTML = `
            <div id="trailer"></div>
            <div class="modal-details">
                <h1>${title}</h1>
                <div class="modal-controls">
                    <button id="myListBtn" class="my-list-btn"><img src="images/icons/add2.png" alt="Add"></button>
                    <button id="weeklyTopBtn" class="my-top-btn">Add to Weekly Top 5</button>
                </div>
                <div class="modal-meta">
                    <span class="modal-year">${year}</span>
                    <div class="modal-genres"><strong>Genres:</strong> ${genres}</div>
                </div>
                
                <p>${data.overview || "No description available."}</p>
            </div>
        `;

        const myListBtn = document.getElementById("myListBtn");

        myListBtn.addEventListener("click", () => {
            window.toggleMyList(myListBtn, id, title, data.backdrop_path, type)
        });

        const user = auth.currentUser;

        if (user) {
            const movieRef = ref(db, `users/${user.uid}/myList/${id}`);

            get(movieRef).then(snapshot => {
                if (snapshot.exists()) {
                    const btn = document.getElementById("myListBtn");
                    btn.classList.add("added");
                    btn.querySelector("img").src = "images/icons/check.png";
                }
            });
        }

        const weeklyBtn = document.getElementById("weeklyTopBtn");
        if (weeklyBtn) {  
            if (user) {
                const movieRef = ref(db, `users/${user.uid}/weeklyTop5/${id}`);
                
                get(movieRef).then(snapshot => {
                    if (snapshot.exists()) {
                        weeklyBtn.textContent = "Remove from Weekly Top 5"; 
                    } else {
                        weeklyBtn.textContent = "Add to Weekly Top 5"; 
                    }
                });
            }

            weeklyBtn.addEventListener("click", () => {
                window.toggleWeeklyTop(
                    weeklyBtn,
                    id,
                    title,
                    data.backdrop_path,
                    type
                );
            });
        } else {
            console.error("weeklyTopBtn not found in modalBody");
        }

        loadTrailer(id, type);
    });
}

function loadTrailer(id, type = "movie") {
    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {

        const trailer = data.results.find(
            vid => vid.type === "Trailer" && vid.site === "YouTube"
        );

        if (trailer) {
            document.getElementById("trailer").innerHTML = `
                <iframe width="100%" height="300"
                src="https://www.youtube.com/embed/${trailer.key}"
                frameborder="0" allowfullscreen></iframe>
            `;
        }
    });
}

closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
});

window.toggleMyList = function(button, movieId, title, backdrop_path, type) {
    const user = auth.currentUser;

    if (!user) {
        alert("Please log in first.");
        return;
    }

    const movieRef = ref(db, `users/${user.uid}/myList/${movieId}`);
    const icon = button.querySelector("img");

    if (button.classList.contains("added")) {
    set(movieRef, null).then(() => {
        icon.src = "images/icons/add2.png"; 
        button.classList.remove("added");
    });
    } else {
        set(movieRef, {
            id: movieId,
            title,
            backdrop: backdrop_path, 
            type,
            addedAt: Date.now()
        }).then(() => {
            icon.src = "images/icons/check.png"; 
            button.classList.add("added");
        });
    }
};

window.toggleWeeklyTop = function(button, movieId, title, backdrop, type) {
    const user = auth.currentUser;

    if (!user) {
        alert("Please log in first.");
        return;
    }

    const topRef = ref(db, `users/${user.uid}/weeklyTop5`);
    const movieRef = ref(db, `users/${user.uid}/weeklyTop5/${movieId}`);

    get(topRef).then(snapshot => {
        const data = snapshot.val() || {};
        const keys = Object.keys(data);

        const isAdded = data[movieId] !== undefined;

        if (isAdded) {
            
            set(movieRef, null).then(() => {
                button.textContent = "Add to Weekly Top 5";
            });
        } else {
            
            if (keys.length >= 5) {
                alert("You can only have 5 in Weekly Top 5!");
                return;
            }

            
            set(movieRef, {
                id: movieId,
                title,
                backdrop,
                type,
                addedAt: Date.now()
            }).then(() => {
                button.textContent = "Remove from Weekly Top 5";
            });
        }
    });
};

const searchModal = document.getElementById("searchModal");
const closeSearchModal = document.getElementById("closeSearchModal");
const searchResults = document.getElementById("searchResults");

export function openSearchModal(movies) {
    searchResults.innerHTML = ""; 
    searchModal.classList.remove("hidden");
    
    if (!movies || movies.length === 0) {
        searchResults.innerHTML = "<p style='color:white;'>No movies found.</p>";
        return;
    }

    movies.forEach(movie => {
        
        if (!movie.backdrop_path) return;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        const poster = movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` 
            : "placeholder.jpg";

        movieCard.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <p>${movie.title}</p>
        `;

        
        movieCard.addEventListener("click", () => {
            openModal(movie.id, "movie");
        });

        searchResults.appendChild(movieCard);
    });
}


closeSearchModal.addEventListener("click", () => {
    searchModal.classList.add("hidden");
});


searchModal.addEventListener("click", (e) => {
    if (e.target === searchModal) {
        searchModal.classList.add("hidden");
    }
});