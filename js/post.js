import { getPostById, updatePost, deletePost } from "./api.js";
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

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const postDetails = document.querySelector("#postDetails");
const postError = document.querySelector("#postError");
const editSection = document.querySelector("#editSection");
const editPostForm = document.querySelector("#editPostForm");
const editPostMessage = document.querySelector("#editPostMessage");
const deletePostButton = document.querySelector("#deletePostButton");

let currentPost = null;

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("no-NO") + " " + date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function renderPost(post) {
  const authorName = post.author && post.author.name ? post.author.name : "Ukjent";
  const isOwner = authorName === user.name;

  let imageHtml = "";
  if (post.media && post.media.url) {
    imageHtml = `<img class="post-image" src="${post.media.url}" alt="${post.media.alt || "Post image"}" />`;
  }

  postDetails.innerHTML = `
    <h2>${post.title || "(uten tittel)"}</h2>
    <p class="post-meta">
      av <a href="profile.html?name=${encodeURIComponent(authorName)}">${authorName}</a>
      · ${formatDate(post.created)}
    </p>
    <p>${post.body || ""}</p>
    ${imageHtml}
  `;

  if (isOwner) {
    editSection.style.display = "block";
    editPostForm.editTitle.value = post.title || "";
    editPostForm.editBody.value = post.body || "";
    editPostForm.editMedia.value = post.media && post.media.url ? post.media.url : "";
  } else {
    editSection.style.display = "none";
  }
}

async function loadPost() {
  if (!postId) {
    postError.textContent = "Ingen post valgt.";
    return;
  }

  postError.textContent = "";

  try {
    const post = await getPostById(postId);
    currentPost = post;
    renderPost(post);
  } catch (error) {
    console.error(error);
    postError.textContent = "Kunne ikke laste post.";
  }
}

if (editPostForm) {
  editPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    editPostMessage.textContent = "";

    const title = editPostForm.editTitle.value.trim();
    const body = editPostForm.editBody.value.trim();
    const mediaUrl = editPostForm.editMedia.value.trim();

    if (!title) {
      editPostMessage.textContent = "Tittel kan ikke være tom.";
      return;
    }

    try {
      const updated = await updatePost(postId, { title, body, mediaUrl });
      currentPost = updated;
      renderPost(updated);
    } catch (error) {
      console.error(error);
      editPostMessage.textContent = "Kunne ikke oppdatere post.";
    }
  });
}

if (deletePostButton) {
  deletePostButton.addEventListener("click", async () => {
    if (!confirm("Er du sikker på at du vil slette posten?")) {
      return;
    }

    try {
      await deletePost(postId);
      window.location.href = "feed.html";
    } catch (error) {
      console.error(error);
      editPostMessage.textContent = "Kunne ikke slette post.";
    }
  });
}

loadPost();
