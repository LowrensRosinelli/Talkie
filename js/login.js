import { loginUser } from "./api.js";
import { saveUser, getUser } from "./storage.js";

const existingUser = getUser();
if (existingUser) {
  // Allerede logget inn, send til feed
  window.location.href = "feed.html";
}

const form = document.querySelector("#loginForm");
const errorMessage = document.querySelector("#loginError");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      errorMessage.textContent = "Fyll inn e-post og passord. with love";
      return;
    }

    try {
      const userData = await loginUser(email, password);
      saveUser(userData);
      window.location.href = "feed.html";
    } catch (error) {
      console.error(error);
      errorMessage.textContent = "OMGOMG! Feilpassord/wrong password. Try again. good luck next time buddy :D with love <3";
    }
  });
}
