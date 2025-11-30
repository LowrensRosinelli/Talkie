import { getAccessToken } from "./storage.js";

const BASE_URL = "https://v2.api.noroff.dev";
const API_KEY = "26ccdd24-51c5-41ca-82e7-13e1f6caced9";

async function handleJson(response) {
  const json = await response.json();

  if (!response.ok) {
    const messageFromApi =
      json && json.errors && json.errors[0] && json.errors[0].message;
    throw new Error(messageFromApi || "Noe gikk galt mot API-et");
  }

  return json.data;
}

function getAuthHeaders() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Ikke innlogget.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "X-Noroff-API-Key": API_KEY,
    "Content-Type": "application/json",
  };
}
export async function loginUser(email, password) {
  const url = `${BASE_URL}/auth/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleJson(response);
}

export async function registerUser(payload) {
  const url = `${BASE_URL}/auth/register`;

  const body = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
  };

  if (payload.avatarUrl) {
    body.avatar = {
      url: payload.avatarUrl,
      alt: `${payload.name} avatar`,
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleJson(response);
}
export async function getAllPosts() {
  const url = `${BASE_URL}/social/posts?_author=true`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const data = await handleJson(response);

  // sortere nyeste først
  return data.sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );
}

export async function searchPosts(query) {
  const url = `${BASE_URL}/social/posts/search?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const data = await handleJson(response);
  return data;
}

export async function getPostById(id) {
  const url = `${BASE_URL}/social/posts/${id}?_author=true`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleJson(response);
}

export async function createPost(payload) {
  const url = `${BASE_URL}/social/posts`;

  const body = {
    title: payload.title,
  };

  if (payload.body) {
    body.body = payload.body;
  }

  if (payload.mediaUrl) {
    body.media = {
      url: payload.mediaUrl,
      alt: payload.title || "Post image",
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleJson(response);
}

export async function updatePost(id, payload) {
  const url = `${BASE_URL}/social/posts/${id}`;

  const body = {
    title: payload.title,
    body: payload.body || "",
  };

  if (payload.mediaUrl) {
    body.media = {
      url: payload.mediaUrl,
      alt: payload.title || "Post image",
    };
  } else {
    body.media = null;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleJson(response);
}

export async function deletePost(id) {
  const url = `${BASE_URL}/social/posts/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    await handleJson(response);
  }
}

export async function getProfile(name) {
  const url = `${BASE_URL}/social/profiles/${name}?_followers=true&_following=true&_posts=true`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleJson(response);
}

export async function getPostsByProfile(name) {
  const url = `${BASE_URL}/social/profiles/${name}/posts`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleJson(response);
}

export async function followProfile(name) {
  const url = `${BASE_URL}/social/profiles/${name}/follow`;

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  return handleJson(response);
}

export async function unfollowProfile(name) {
  const url = `${BASE_URL}/social/profiles/${name}/unfollow`;

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  return handleJson(response);
}
