import {
  getProfile,
  getPostsByProfile,
  followProfile,
  unfollowProfile,
} from "./api.js";
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
let profileName = params.get("name");

if (!profileName) {
  profileName = user.name;
}

const profileHeader = document.querySelector("#profileHeader");
const profileError = document.querySelector("#profileError");
const profilePosts = document.querySelector("#profilePosts");

let currentProfile = null;

function createAvatarElement(profile) {
  const wrapper = document.createElement("div");
  wrapper.className = "profile-avatar";

  if (profile.avatar && profile.avatar.url) {
    const img = document.createElement("img");
    img.src = profile.avatar.url;
    img.alt = profile.avatar.alt || `${profile.name} avatar`;
    wrapper.appendChild(img);
  } else {
    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "?";
    wrapper.textContent = initial;
  }

  return wrapper;
}

function renderProfile(profile, isOwnProfile) {
  profileHeader.innerHTML = "";

  const avatar = createAvatarElement(profile);

  const details = document.createElement("div");
  details.className = "profile-details";

  const title = document.createElement("h2");
  title.textContent = profile.name;

  const emailP = document.createElement("p");
  emailP.textContent = profile.email;

  const counts = profile._count || {};

  const countP = document.createElement("p");
  countP.textContent = `Poster: ${counts.posts || 0} · Følgere: ${
    counts.followers || 0
  } · Følger: ${counts.following || 0}`;

  details.appendChild(title);
  details.appendChild(emailP);
  details.appendChild(countP);

  const rightSide = document.createElement("div");
  rightSide.style.marginLeft = "auto";

  if (!isOwnProfile) {
    const button = document.createElement("button");
    button.className = "primary";
    button.id = "followButton";

    const alreadyFollower =
      profile.followers &&
      profile.followers.some((follower) => follower.name === user.name);

    button.textContent = alreadyFollower ? "Unfollow" : "Follow";

    rightSide.appendChild(button);
  }

  profileHeader.appendChild(avatar);
  profileHeader.appendChild(details);
  profileHeader.appendChild(rightSide);
}

function renderProfilePosts(posts) {
  profilePosts.innerHTML = "";

  if (!posts || posts.length === 0) {
    profilePosts.innerHTML = "<p>Ingen poster enda.</p>";
    return;
  }

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post-card";

    let imageHtml = "";
    if (post.media && post.media.url) {
      imageHtml = `<img class="post-image" src="${post.media.url}" alt="${post.media.alt || "Post image"}" />`;
    }

    article.innerHTML = `
      <h3>${post.title || "(uten tittel)"}</h3>
      <p>${post.body || ""}</p>
      ${imageHtml}
      <div class="post-actions">
        <a href="post.html?id=${post.id}">
          <button type="button" class="secondary">Vis</button>
        </a>
      </div>
    `;

    profilePosts.appendChild(article);
  });
}

async function loadProfile() {
  profileError.textContent = "";

  try {
    const profile = await getProfile(profileName);
    currentProfile = profile;
    const isOwnProfile = profile.name === user.name;
    renderProfile(profile, isOwnProfile);

    const posts = await getPostsByProfile(profileName);
    renderProfilePosts(posts);

    const followButton = document.querySelector("#followButton");
    if (followButton) {
      followButton.addEventListener("click", async () => {
        try {
          const isFollowerNow =
            currentProfile.followers &&
            currentProfile.followers.some((f) => f.name === user.name);

          if (isFollowerNow) {
            const result = await unfollowProfile(profileName);
            currentProfile.followers = result.followers;
          } else {
            const result = await followProfile(profileName);
            currentProfile.followers = result.followers;
          }

          const isNowFollower =
            currentProfile.followers &&
            currentProfile.followers.some((f) => f.name === user.name);

          followButton.textContent = isNowFollower ? "Unfollow" : "Follow";
        } catch (error) {
          console.error(error);
          profileError.textContent = "Kunne ikke oppdatere følge-status.";
        }
      });
    }
  } catch (error) {
    console.error(error);
    profileError.textContent = "Kunne ikke laste profil.";
  }
}

loadProfile();
