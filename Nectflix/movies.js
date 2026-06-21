import { auth, db } from './firebase.js';
import { openModal, openSearchModal } from './modal.js';

const API_KEY = "a4efa9fc8863045c2677999a98ace9ec";
const movieContainer = document.getElementById("movieContainer");
const tvContainer = document.getElementById("tvContainer");
const movieTopPlaying = document.getElementById("movieTopPlaying");
const movieUpcoming = document.getElementById("movieUpcoming");

const nav = document.getElementById("nav");

window.addEventListener("scroll", () => {
    if(window.scrollY > 100) {
        nav.classList.add("navbar__black");
    }
    else {
        nav.classList.remove("navbar__black");
    }
});

const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

searchIcon.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    if(searchInput.classList.contains("active")) {
        searchInput.focus();
    }
});

document.addEventListener("click", (e) => {
    if(!searchIcon.contains(e.target) && !searchInput.contains(e.target)) {
        searchInput.classList.remove("active");
    }
});

searchInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        const query = searchInput.value.trim();
        if(query) fetchMovies(query); 
    }
});

loadTrending();
loadTrendingTV();
loadNowPlaying();
loadUpcoming();

function loadTrending() {
    fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {

        data.results.forEach(movie => {

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        const poster = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;

        movieCard.innerHTML = `
                <img src="${poster}" alt="${movie.title}">
                <p>${movie.title}</p>
        `;

        movieCard.addEventListener("click", () => {
            openModal(movie.id, "movie");
        });

        movieContainer.appendChild(movieCard);

        });

    });
}

function loadTrendingTV() {
    fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {

        data.results.forEach(tv => {
        
        const tvCard = document.createElement("div");
        tvCard.classList.add("movie-card");
        const poster = `https://image.tmdb.org/t/p/w500${tv.backdrop_path}`;

        tvCard.innerHTML = `
                <img src="${poster}" alt="${tv.name}">
                <p>${tv.name}</p>
        `;

        tvCard.addEventListener("click", () => {
            openModal(tv.id, "tv");
        });

        tvContainer.appendChild(tvCard);
        });
    });
}

function loadNowPlaying() {
    fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {

        data.results.forEach(movie => {

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        const poster = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;

        movieCard.innerHTML = `
                <img src="${poster}" alt="${movie.title}">
                <p>${movie.title}</p>
        `;

        movieCard.addEventListener("click", () => {
            openModal(movie.id, "movie");
        });

        movieTopPlaying.appendChild(movieCard);

        });

    });
}

function loadUpcoming() {
    fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {

        data.results.forEach(movie => {

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        const poster = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;

        movieCard.innerHTML = `
                <img src="${poster}" alt="${movie.title}">
                <p>${movie.title}</p>
        `;

        movieCard.addEventListener("click", () => {
            openModal(movie.id, "movie");
        });

        movieUpcoming.appendChild(movieCard);

        });

    });
}

async function fetchMovies(query) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        openSearchModal(data.results);
    } catch (err) {
        console.error(err);
        openSearchModal([]); 
    }
}