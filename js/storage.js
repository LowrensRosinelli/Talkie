const USER_KEY = "talkieUser";

/**
 * Lagre innlogget bruker i localStorage.
 * @param {Object} user
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Hent innlogget bruker fra localStorage.
 * @returns {Object|null}
 */
export function getUser() {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Kunne ikke lese lagret bruker", error);
    return null;
  }
}

/**
 * Fjern innlogget bruker.
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Hent accessToken fra lagret bruker.
 * @returns {string|null}
 */
export function getAccessToken() {
  const user = getUser();
  if (!user || !user.accessToken) {
    return null;
  }
  return user.accessToken;
}
