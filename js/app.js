/**
 * app.js
 * Application entry point — initialization, event wiring, HTTPS check
 */

import { state, createCustomCharacter, deleteRecording } from "./characters.js";
import {
  renderCharacters,
  updateAllDisplays,
  updateCurrentCharDisplay,
  applyCharacterToSliders,
  getSliderValues,
  updateSlider,
  setCharacterSelectHandler,
  renderRecordings,
  showHttpsWarning,
} from "./ui.js";
import { startVisualizer, resizeCanvas } from "./visualizer.js";
import { toggleRecording, setRecordingsChangedHandler } from "./recorder.js";

// =====================
//  HTTPS CHECK
// =====================
if (
  location.protocol !== "https:" &&
  location.hostname !== "localhost" &&
  location.hostname !== "127.0.0.1"
) {
  showHttpsWarning();
}

// =====================
//  CHARACTER SELECTION
// =====================
function selectCharacter(char) {
  state.selectedChar = char;
  applyCharacterToSliders(char);
  updateCurrentCharDisplay(char);
  renderCharacters();
}

setCharacterSelectHandler(selectCharacter);

// =====================
//  CUSTOM CHARACTER
// =====================
function addCustomCharacter() {
  const emojiInput = document.getElementById("custom-emoji");
  const nameInput = document.getElementById("custom-name");
  const emoji = emojiInput.value.trim() || "🎭";
  const name = nameInput.value.trim();

  if (!name) {
    alert("Por favor ingresa un nombre para el personaje.");
    return;
  }

  const params = getSliderValues();
  const newChar = createCustomCharacter(emoji, name, params);
  selectCharacter(newChar);

  emojiInput.value = "";
  nameInput.value = "";
}

// =====================
//  RECORDINGS
// =====================
function handleDeleteRecording(id) {
  deleteRecording(id);
  refreshRecordings();
}

function refreshRecordings() {
  renderRecordings(handleDeleteRecording);
}

setRecordingsChangedHandler(refreshRecordings);

// =====================
//  SLIDER EVENTS
// =====================
function bindSliderEvents() {
  const sliders = [
    { id: "pitch", display: "pitch-val", args: [false, false, false] },
    { id: "speed", display: "speed-val", args: [true, false, false] },
    { id: "reverb", display: "reverb-val", args: [false, true, false] },
    { id: "distortion", display: "distortion-val", args: [false, true, false] },
    { id: "bass", display: "bass-val", args: [false, false, true] },
    { id: "treble", display: "treble-val", args: [false, false, true] },
  ];

  sliders.forEach(({ id, display, args }) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      updateSlider(el, display, ...args);
    });
  });
}

// =====================
//  BUTTON EVENTS
// =====================
function bindButtonEvents() {
  document
    .getElementById("record-btn")
    .addEventListener("click", toggleRecording);
  document
    .querySelector(".add-btn")
    .addEventListener("click", addCustomCharacter);
}

// =====================
//  WINDOW EVENTS
// =====================
window.addEventListener("resize", () => {
  resizeCanvas();
});

// =====================
//  INIT
// =====================
renderCharacters();
updateAllDisplays();
startVisualizer();
bindSliderEvents();
bindButtonEvents();
