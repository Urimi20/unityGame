import {
  createDefaultUser,
  getCamp,
  isValidAgeGroup,
  normalizeCompletedLevels,
  sanitizeNickname,
  toNumber,
} from "../utils/gameUtils";

const USERS_API_URL = "https://69a8819c37caab4b8c61ecb5.mockapi.io/users";

function getNormalizedAgeGroup(user) {
  return isValidAgeGroup(user?.ageGroup) ? user.ageGroup : "6-11";
}

function serializeUser(user) {
  const ageGroup = getNormalizedAgeGroup(user);
  const nickname = sanitizeNickname(user.nickname || user.username || "Camper");
  const completedLevels = normalizeCompletedLevels(
    user.completedLevels || user.completedWordleLevels,
  );
  return {
    nickname,
    ageGroup,
    score: toNumber(user.score),
    game: getCamp(ageGroup).game,
    completedLevels,
    completedWordleLevels: completedLevels,
    memoryGameBestScore: toNumber(user.memoryGameBestScore),
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

export function normalizeUser(user) {
  const ageGroup = getNormalizedAgeGroup(user);
  const nickname = sanitizeNickname(
    user?.nickname || user?.username || "Camper",
  );
  const fallback = createDefaultUser(nickname, ageGroup);
  const completedLevels = normalizeCompletedLevels(
    user?.completedLevels || user?.completedWordleLevels,
  );

  return {
    id: user?.id,
    nickname,
    username: nickname,
    ageGroup,
    score: toNumber(user?.score),
    game: user?.game || getCamp(ageGroup).game,
    completedLevels,
    completedWordleLevels: completedLevels,
    memoryGameBestScore: toNumber(user?.memoryGameBestScore),
    createdAt: user?.createdAt || user?.lastPlayed || fallback.createdAt,
  };
}

async function requestUsers(path = "", options = {}) {
  const response = await fetch(`${USERS_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `User API request failed with status ${response.status}.`;
    try {
      const body = await response.json();
      message = body?.message || message;
    } catch {
      // The API can return an empty or non-JSON error body.
    }
    throw new Error(message);
  }

  return response.json();
}

export async function fetchUsers() {
  const users = await requestUsers();
  return Array.isArray(users) ? users.map(normalizeUser) : [];
}

export async function findUserByNickname(nickname, ageGroup) {
  const cleanNickname = sanitizeNickname(nickname).toLowerCase();
  const users = await fetchUsers();
  return (
    users.find(
      (user) =>
        user.ageGroup === ageGroup &&
        user.nickname.toLowerCase() === cleanNickname,
    ) ?? null
  );
}

export async function createUser(nickname, ageGroup) {
  const createdUser = await requestUsers("", {
    method: "POST",
    body: JSON.stringify(createDefaultUser(nickname, ageGroup)),
  });
  return normalizeUser(createdUser);
}

export async function getOrCreateUser(nickname, ageGroup) {
  const existingUser = await findUserByNickname(nickname, ageGroup);
  if (existingUser) return existingUser;
  return createUser(nickname, ageGroup);
}

export async function saveUser(user) {
  const normalizedUser = normalizeUser(user);
  const body = JSON.stringify(serializeUser(normalizedUser));

  if (!normalizedUser.id) {
    const createdUser = await requestUsers("", {
      method: "POST",
      body,
    });
    return normalizeUser(createdUser);
  }

  const savedUser = await requestUsers(`/${normalizedUser.id}`, {
    method: "PUT",
    body,
  });
  return normalizeUser(savedUser);
}

export function sortUsersByScore(users) {
  return [...users].sort((a, b) => b.score - a.score);
}
