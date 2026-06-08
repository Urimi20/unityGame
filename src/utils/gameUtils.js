import {
  AGE_GROUPS,
  CAMP_BADGES,
  CAMP_LEVELS,
  MAX_WORD_ATTEMPTS,
  WORD_GUESS_LEVELS,
  MEMORY_DIFFICULTIES,
} from "../data/gameData";

export function sanitizeNickname(nickname) {
  return nickname
    .trim()
    .replace(/[^a-z0-9 _-]/gi, "")
    .replace(/\s+/g, " ")
    .slice(0, 18);
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function isValidAgeGroup(ageGroup) {
  return AGE_GROUPS.some((group) => group.key === ageGroup);
}

export function getCamp(ageGroup) {
  return AGE_GROUPS.find((group) => group.key === ageGroup) ?? AGE_GROUPS[0];
}

export function getCampLevels(ageGroup) {
  return CAMP_LEVELS[ageGroup] ?? CAMP_LEVELS[AGE_GROUPS[0].key];
}

export function normalizeCompletedLevels(value) {
  if (Array.isArray(value)) {
    return sortLevels(value);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return sortLevels(parsed);
    } catch {
      return sortLevels(value.split(","));
    }
  }

  return [];
}

export function sortLevels(levels) {
  return [
    ...new Set(levels.map((level) => Number(level)).filter(Boolean)),
  ].sort((a, b) => a - b);
}

export function getNextPlayableLevel(completedLevels, ageGroup) {
  const levels = getCampLevels(ageGroup);
  const completed = normalizeCompletedLevels(completedLevels);
  const highestCompleted = completed.length ? Math.max(...completed) : 0;
  return Math.min(highestCompleted + 1, levels.length);
}

export function createDefaultUser(nickname, ageGroup) {
  const camp = getCamp(ageGroup);
  return {
    nickname: sanitizeNickname(nickname),
    ageGroup: camp.key,
    score: 0,
    game: camp.game,
    completedLevels: [],
    completedWordleLevels: [],
    memoryGameBestScore: 0,
    createdAt: new Date().toISOString(),
  };
}

export function getBadgeForRank(rank) {
  return CAMP_BADGES[Math.min(rank - 1, CAMP_BADGES.length - 1)];
}

export function filterUsersByAgeGroup(users, ageGroup) {
  return users
    .filter((user) => user.ageGroup === ageGroup && toNumber(user.score) > 0)
    .sort((a, b) => b.score - a.score);
}

export function evaluateWordGuess(guess, answer) {
  const letters = guess.toUpperCase().split("");
  const target = answer.toUpperCase().split("");
  const result = letters.map((letter) => ({ letter, status: "absent" }));
  const remaining = {};

  target.forEach((letter, index) => {
    if (letters[index] === letter) {
      result[index].status = "correct";
      return;
    }

    remaining[letter] = (remaining[letter] ?? 0) + 1;
  });

  result.forEach((entry) => {
    if (entry.status === "correct") return;
    if (remaining[entry.letter] > 0) {
      entry.status = "present";
      remaining[entry.letter] -= 1;
    }
  });

  return result;
}

export function getAttemptsRemaining(historyLength) {
  return Math.max(0, MAX_WORD_ATTEMPTS - historyLength);
}

export function shuffleItems(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createPairDeck(pairs) {
  return shuffleItems(
    pairs.flatMap(([left, right], index) => [
      {
        id: `${index}-left-${crypto.randomUUID()}`,
        pairId: index,
        label: left,
      },
      {
        id: `${index}-right-${crypto.randomUUID()}`,
        pairId: index,
        label: right,
      },
    ]),
  );
}

export const sanitizeUsername = sanitizeNickname;

export function getWordLevel(levelNumber) {
  return WORD_GUESS_LEVELS[
    Math.max(0, Math.min(levelNumber - 1, WORD_GUESS_LEVELS.length - 1))
  ];
}

export function getUnlockedWordLevel(completedLevels) {
  const completed = Array.isArray(completedLevels) ? completedLevels : [];
  const maxCompleted = completed.length > 0 ? Math.max(...completed) : 0;
  return Math.min(maxCompleted + 1, WORD_GUESS_LEVELS.length);
}

export function calculateWordPoints(level, attemptsUsed) {
  const basePoints = level.points || 50;
  const attemptPenalty = (MAX_WORD_ATTEMPTS - attemptsUsed) * 10;
  return Math.max(10, basePoints + attemptPenalty);
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function createMemoryDeck(difficultyKey) {
  const difficulty = MEMORY_DIFFICULTIES.find((d) => d.key === difficultyKey);
  if (!difficulty) return [];

  const pairs = Array.from({ length: difficulty.pairs }, (_, i) => [
    `Card ${i + 1}A`,
    `Card ${i + 1}B`,
  ]);

  return createPairDeck(pairs);
}

export function calculateMemoryFinalScore(difficulty, moves, timeSeconds) {
  const diff = MEMORY_DIFFICULTIES.find((d) => d.key === difficulty);
  if (!diff) return 0;

  const basePoints = diff.points;
  const movePenalty = Math.max(0, (moves - diff.pairs * 2) * 5);
  const timeBonuses = Math.max(0, (diff.timeLimit - timeSeconds) / 10);

  return Math.max(10, Math.floor(basePoints - movePenalty + timeBonuses));
}
