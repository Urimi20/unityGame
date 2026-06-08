export const SAFETY_NOTICE =
  "Safety Notice: The leaderboard uses nicknames only. No real personal information is collected, stored or displayed. The platform follows child safety and privacy best practices.";

export const CAMP_BADGES = [
  "Camp Legend",
  "Tech Hero",
  "Creative Builder",
  "Adventure Starter",
];

export const AGE_GROUPS = [
  {
    key: "6-11",
    tabLabel: "6-11 vjeç",
    title: "6-11 vjeç",
    description:
      "Play the original survival arena with shields, hazards, and score chasing.",
    game: "Code Rush",
    gameTagline:
      "The original survival arena with shields, hazards, and score chasing.",
    features: [
      { icon: "\u{1F916}", title: "Robotics & Lego Theme" },
      { icon: "\u{1F4BB}", title: "Programming Through Games" },
      { icon: "\u26A1", title: "STEM Challenges" },
    ],
  },
  {
    key: "12-15",
    tabLabel: "12-15 vjeç",
    title: "12-15 vjeç",
    description: "Solve ten hidden-word levels with Wordle-style feedback.",
    game: "Word Guess",
    gameTagline:
      "A ten-level hidden-word challenge with Wordle-style feedback.",
    features: [
      { icon: "\u{1F680}", title: "Artificial Intelligence" },
      { icon: "\u{1F310}", title: "Basic Web Design" },
      { icon: "\u{1F4A1}", title: "Project Creation" },
    ],
  },
  {
    key: "16+",
    tabLabel: "16+ vjeç",
    title: "16+ vjeç",
    description:
      "Match cards across score, moves, timer, and difficulty tiers.",
    game: "Memory Match",
    gameTagline:
      "A card matching game with score, moves, timer, and difficulty tiers.",
    features: [
      { icon: "\u{1F527}", title: "No-Code / Low-Code" },
      { icon: "\u{1F50B}", title: "Business Automation" },
      { icon: "\u{1F4CA}", title: "MVP Building" },
    ],
  },
];

export const ROBOT_RESCUE_LEVELS = [
  {
    level: 1,
    title: "Find the Robot Head",
    prompt: "The helper bot needs the part that lets it look around camp.",
    options: ["Robot Head", "Solar Tile", "Snack Box"],
    answer: "Robot Head",
    reward: "Head",
    points: 40,
  },
  {
    level: 2,
    title: "Match the Power Pack",
    prompt: "Which part gives the robot energy for the next mission?",
    options: ["Battery Pack", "Paint Brush", "Camp Map"],
    answer: "Battery Pack",
    reward: "Battery",
    points: 55,
  },
  {
    level: 3,
    title: "Pick the Sensor",
    prompt: "Choose the part that helps the robot detect a wall.",
    options: ["Distance Sensor", "Blue Lego Brick", "Flag Pole"],
    answer: "Distance Sensor",
    reward: "Sensor",
    points: 70,
  },
  {
    level: 4,
    title: "Build the Wheel Base",
    prompt: "The robot needs to move safely through the camp path.",
    options: ["Wheel Base", "Keyboard Key", "Water Bottle"],
    answer: "Wheel Base",
    reward: "Wheels",
    points: 85,
  },
  {
    level: 5,
    title: "Open the Portal",
    prompt: "Which command starts the robot portal sequence?",
    options: ["START", "SLEEP", "PAUSE"],
    answer: "START",
    reward: "Portal Key",
    points: 110,
  },
];

export const CODE_QUEST_LEVELS = [
  {
    level: 1,
    type: "word",
    title: "Loop Lock",
    prompt: "Guess the coding word that repeats instructions.",
    answer: "LOOPS",
    points: 90,
  },
  {
    level: 2,
    type: "choice",
    title: "Debug the Condition",
    prompt: "Which expression is true when score is 80?",
    options: ["score >= 50", "score < 50", "score === 10"],
    answer: "score >= 50",
    points: 105,
  },
  {
    level: 3,
    type: "memory",
    title: "Web Design Memory",
    prompt: "Match each web concept with its job.",
    pairs: [
      ["HTML", "Structure"],
      ["CSS", "Style"],
      ["JS", "Interaction"],
    ],
    points: 130,
  },
  {
    level: 4,
    type: "word",
    title: "Bug Hunt",
    prompt: "Guess the coding word for finding and fixing errors.",
    answer: "DEBUG",
    points: 145,
  },
  {
    level: 5,
    type: "choice",
    title: "AI Mission",
    prompt: "What does a simple AI model use to make predictions?",
    options: ["Patterns in data", "Random colors", "Only page titles"],
    answer: "Patterns in data",
    points: 170,
  },
];

export const PYTHON_AI_LEVELS = [
  {
    level: 1,
    type: "choice",
    title: "Data Type Repair",
    prompt: "Which Python type stores key-value pairs for an AI bot profile?",
    options: ["dict", "list", "string"],
    answer: "dict",
    points: 150,
  },
  {
    level: 2,
    type: "choice",
    title: "Automation Trigger",
    prompt: "Which event should start an automated email workflow?",
    options: ["Form submission", "Changing a font", "Closing a laptop"],
    answer: "Form submission",
    points: 175,
  },
  {
    level: 3,
    type: "word",
    title: "Model Signal",
    prompt: "Guess the Python concept used to repeat a task.",
    answer: "WHILE",
    points: 200,
  },
  {
    level: 4,
    type: "memory",
    title: "AI Pipeline Memory",
    prompt: "Match each AI pipeline step with its role.",
    pairs: [
      ["Collect", "Gather data"],
      ["Train", "Learn patterns"],
      ["Deploy", "Run live"],
      ["Monitor", "Track results"],
    ],
    points: 230,
  },
  {
    level: 5,
    type: "choice",
    title: "Simulation Fix",
    prompt: "An AI bot predicts low confidence. What is the best next action?",
    options: [
      "Ask for more useful data",
      "Ignore the confidence score",
      "Delete the whole project",
    ],
    answer: "Ask for more useful data",
    points: 260,
  },
];

export const CAMP_LEVELS = {
  "6-11": ROBOT_RESCUE_LEVELS,
  "12-15": CODE_QUEST_LEVELS,
  "16+": PYTHON_AI_LEVELS,
};

export const MAX_WORD_ATTEMPTS = 6;

export const WORD_GUESS_LEVELS = [
  { level: 1, word: "REACT", hint: "Library for web UIs", points: 50 },
  { level: 2, word: "VITE", hint: "Fast build tool", points: 75 },
  {
    level: 3,
    word: "JAVASCRIPT",
    hint: "Web programming language",
    points: 100,
  },
  { level: 4, word: "COMPONENT", hint: "Reusable UI piece", points: 125 },
  { level: 5, word: "STATE", hint: "Data that changes over time", points: 150 },
  { level: 6, word: "PROPS", hint: "Component input parameters", points: 175 },
  {
    level: 7,
    word: "HOOK",
    hint: "React function to manage state",
    points: 200,
  },
  { level: 8, word: "RENDER", hint: "Display on screen", points: 225 },
  { level: 9, word: "DEPLOY", hint: "Make app live online", points: 250 },
  { level: 10, word: "DATABASE", hint: "Store data permanently", points: 300 },
];

export const MEMORY_DIFFICULTIES = [
  {
    key: "easy",
    name: "Easy",
    pairs: 3,
    points: 100,
    timeLimit: 120,
  },
  {
    key: "medium",
    name: "Medium",
    pairs: 6,
    points: 250,
    timeLimit: 180,
  },
  {
    key: "hard",
    name: "Hard",
    pairs: 10,
    points: 500,
    timeLimit: 240,
  },
];
