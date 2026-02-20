/**
 * characters.js
 * Character presets and data management
 */

export const defaultCharacters = [
  {
    id: "robot",
    emoji: "🤖",
    name: "Robot",
    tag: "sintético",
    pitch: 0,
    speed: 0.9,
    reverb: 20,
    distortion: 60,
    bass: 5,
    treble: -5,
  },
  {
    id: "demon",
    emoji: "😈",
    name: "Demonio",
    tag: "oscuro",
    pitch: -10,
    speed: 0.8,
    reverb: 70,
    distortion: 80,
    bass: 15,
    treble: -10,
  },
  {
    id: "alien",
    emoji: "👽",
    name: "Alienígena",
    tag: "extraño",
    pitch: 7,
    speed: 1.2,
    reverb: 40,
    distortion: 30,
    bass: -5,
    treble: 10,
  },
  {
    id: "giant",
    emoji: "🏔️",
    name: "Gigante",
    tag: "profundo",
    pitch: -8,
    speed: 0.75,
    reverb: 50,
    distortion: 20,
    bass: 18,
    treble: -8,
  },
  {
    id: "chipmunk",
    emoji: "🐿️",
    name: "Ardilla",
    tag: "agudo",
    pitch: 15,
    speed: 1.7,
    reverb: 5,
    distortion: 0,
    bass: -15,
    treble: 20,
  },
  {
    id: "ghost",
    emoji: "👻",
    name: "Fantasma",
    tag: "etéreo",
    pitch: 4,
    speed: 0.95,
    reverb: 90,
    distortion: 10,
    bass: -5,
    treble: 5,
  },
  {
    id: "dragon",
    emoji: "🐉",
    name: "Dragón",
    tag: "épico",
    pitch: -6,
    speed: 0.85,
    reverb: 60,
    distortion: 40,
    bass: 12,
    treble: -5,
  },
  {
    id: "baby",
    emoji: "👶",
    name: "Bebé",
    tag: "infantil",
    pitch: 9,
    speed: 0.9,
    reverb: 15,
    distortion: 0,
    bass: -8,
    treble: 8,
  },
  {
    id: "cyborg",
    emoji: "🦾",
    name: "Cyborg",
    tag: "híbrido",
    pitch: 2,
    speed: 1.05,
    reverb: 30,
    distortion: 45,
    bass: 8,
    treble: 3,
  },
  {
    id: "witch",
    emoji: "🧙‍♀️",
    name: "Bruja",
    tag: "místico",
    pitch: -3,
    speed: 0.9,
    reverb: 55,
    distortion: 25,
    bass: 5,
    treble: -3,
  },
  {
    id: "angel",
    emoji: "😇",
    name: "Ángel",
    tag: "celestial",
    pitch: 5,
    speed: 1.1,
    reverb: 80,
    distortion: 0,
    bass: -8,
    treble: 10,
  },
  {
    id: "zombie",
    emoji: "🧟",
    name: "Zombie",
    tag: "lento",
    pitch: -5,
    speed: 0.65,
    reverb: 35,
    distortion: 55,
    bass: 10,
    treble: -12,
  },
];

/** Shared application state */
export const state = {
  characters: [...defaultCharacters],
  selectedChar: null,
  isRecording: false,
  recordings: [],
};

/**
 * Add a custom character to the list
 * @param {string} emoji
 * @param {string} name
 * @param {object} params - { pitch, speed, reverb, distortion, bass, treble }
 * @returns {object} The new character
 */
export function createCustomCharacter(emoji, name, params) {
  const newChar = {
    id: "custom_" + Date.now(),
    emoji: emoji || "🎭",
    name,
    tag: "personalizado",
    ...params,
  };
  state.characters.push(newChar);
  return newChar;
}

/**
 * Delete a recording by id
 * @param {number} id
 * @returns {boolean} true if found and deleted
 */
export function deleteRecording(id) {
  const idx = state.recordings.findIndex((r) => r.id === id);
  if (idx !== -1) {
    URL.revokeObjectURL(state.recordings[idx].url);
    state.recordings.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Add a new recording
 * @param {object} rec
 */
export function addRecording(rec) {
  state.recordings.push(rec);
}
