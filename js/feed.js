import { getAllPosts, searchPosts, createPost } from "./api.js";
import { getUser, clearUser } from "./storage.js";

const user = getUser();
if (!user) {
  window.location.href = "index.html";
}

const logoutButton = document.querySelector("#logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    clearUser();
    window.location.href = "index.html";
  });
}

const postsContainer = document.querySelector("#postsContainer");
const postsError = document.querySelector("#postsError");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const clearSearchButton = document.querySelector("#clearSearchButton");
const createPostForm = document.querySelector("#createPostForm");
const createPostMessage = document.querySelector("#createPostMessage");

let currentPosts = [];

function truncate(text, length) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("no-NO") + " " + date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = "<p>Ingen poster funnet.</p>";
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const authorName = post.author && post.author.name ? post.author.name : "Ukjent";
    const isOwner = authorName === user.name;

    let imageHtml = "";
    if (post.media && post.media.url) {
      imageHtml = `<img class="post-image" src="${post.media.url}" alt="${post.media.alt || "Post image"}" />`;
    }

    card.innerHTML = `
      <h3>${post.title || "(uten tittel)"}</h3>
      <p class="post-meta">
        av <a href="profile.html?name=${encodeURIComponent(authorName)}">${authorName}</a>
        · ${formatDate(post.created)}
      </p>
      <p>${truncate(post.body || "", 180)}</p>
      ${imageHtml}
      <div class="post-actions">
        <a href="post.html?id=${post.id}">
          <button type="button" class="secondary">Vis</button>
        </a>
        ${
          isOwner
            ? `<button type="button" class="secondary delete-post-button" data-id="${post.id}">Slett</button>`
            : ""
        }
      </div>
    `;

    postsContainer.appendChild(card);
  });
}

async function loadPosts() {
  postsError.textContent = "";
  try {
    const posts = await getAllPosts();
    currentPosts = posts;
    renderPosts(posts);
  } catch (error) {
    console.error(error);
    postsError.textContent = "Kunne ikke laste poster.";
  }
}

if (searchForm) {
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    postsError.textContent = "";

    if (!query) {
      renderPosts(currentPosts);
      return;
    }

    try {
      const result = await searchPosts(query);
      renderPosts(result);
    } catch (error) {
      console.error(error);
      postsError.textContent = "Kunne ikke søke i poster.";
    }
  });
}

if (clearSearchButton) {
  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    renderPosts(currentPosts);
  });
}

if (createPostForm) {
  createPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    createPostMessage.textContent = "";

    const title = createPostForm.title.value.trim();
    const body = createPostForm.body.value.trim();
    const mediaUrl = createPostForm.media.value.trim();

    if (!title) {
      createPostMessage.textContent = "Tittel er påkrevd.";
      return;
    }

    try {
      await createPost({ title, body, mediaUrl });
      createPostForm.reset();
      await loadPosts();
    } catch (error) {
      console.error(error);
      createPostMessage.textContent = "Kunne ikke lage post.";
    }
  });
}

// Slette fra feed – vi gjør selve slettingen i post.js for å holde api-kall der,
// men for å ikke overkomplisere, lar vi delete-knappen bare åpne den enkel-posten.
// (du kan senere bytte til ekte delete direkte her om du vil)

loadPosts();
