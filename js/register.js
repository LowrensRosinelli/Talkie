import { registerUser } from "./api.js";
import { getUser } from "./storage.js";

const existingUser = getUser();
if (existingUser) {
  window.location.href = "feed.html";
}

const form = document.querySelector("#registerForm");
const errorElement = document.querySelector("#registerError");
const successElement = document.querySelector("#registerSuccess");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorElement.textContent = "";
    successElement.textContent = "";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const avatarUrl = form.avatar.value.trim();

    if (!name || !email || !password) {
      errorElement.textContent = "Fyll inn navn, e-post og passord.";
      return;
    }

    try {
      await registerUser({ name, email, password, avatarUrl });
      successElement.textContent = "Bruker registrert! Du kan nå logge inn.";
      form.reset();
    } catch (error) {
      console.error(error);
      errorElement.textContent = error.message || "Kunne ikke registrere bruker.";
    }
  });
}
