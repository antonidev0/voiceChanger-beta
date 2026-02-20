/**
 * ui.js
 * DOM rendering, slider updates, and UI interactions
 */

import { state, deleteRecording as removeRecording } from "./characters.js";

/** Callback set by app.js when a character card is clicked */
let onCharacterSelect = null;

/**
 * Register the character selection handler
 * @param {Function} callback
 */
export function setCharacterSelectHandler(callback) {
  onCharacterSelect = callback;
}

/**
 * Render all character cards into the grid
 */
export function renderCharacters() {
  const grid = document.getElementById("characters-grid");
  grid.innerHTML = "";

  state.characters.forEach((char) => {
    const card = document.createElement("div");
    const isActive = state.selectedChar && state.selectedChar.id === char.id;
    card.className = "character-card" + (isActive ? " active" : "");
    card.innerHTML = `
      <div class="active-indicator"></div>
      <span class="char-emoji">${char.emoji}</span>
      <div class="char-name">${char.name}</div>
      <span class="char-tag">${char.tag || "personalizado"}</span>
    `;
    card.addEventListener("click", () => {
      if (onCharacterSelect) onCharacterSelect(char);
    });
    grid.appendChild(card);
  });
}

/**
 * Update a single slider display value and CSS progress variable
 * @param {HTMLInputElement} el - The range input
 * @param {string} displayId - ID of the display span
 * @param {boolean} isSpeed
 * @param {boolean} isPercent
 * @param {boolean} isDecibel
 */
export function updateSlider(
  el,
  displayId,
  isSpeed = false,
  isPercent = false,
  isDecibel = false,
) {
  const val = parseFloat(el.value);
  const disp = document.getElementById(displayId);

  if (isSpeed) {
    disp.textContent = val.toFixed(2) + "x";
  } else if (isPercent) {
    disp.textContent = Math.round(val) + "%";
  } else if (isDecibel) {
    disp.textContent = val + "dB";
  } else {
    disp.textContent = val;
  }

  const min = parseFloat(el.min);
  const max = parseFloat(el.max);
  const pct = ((val - min) / (max - min)) * 100;
  el.style.setProperty("--progress", pct + "%");
}

/**
 * Update all slider displays at once
 */
export function updateAllDisplays() {
  updateSlider(document.getElementById("pitch"), "pitch-val");
  updateSlider(document.getElementById("speed"), "speed-val", true);
  updateSlider(document.getElementById("reverb"), "reverb-val", false, true);
  updateSlider(
    document.getElementById("distortion"),
    "distortion-val",
    false,
    true,
  );
  updateSlider(document.getElementById("bass"), "bass-val", false, false, true);
  updateSlider(
    document.getElementById("treble"),
    "treble-val",
    false,
    false,
    true,
  );
}

/**
 * Update the "current character" display panel
 * @param {object|null} char
 */
export function updateCurrentCharDisplay(char) {
  const nameEl = document.getElementById("current-char-name");
  const badge = document.querySelector(".badge");

  if (char) {
    nameEl.textContent = `${char.emoji} ${char.name}`;
    badge.textContent = "ACTIVO";
  } else {
    nameEl.textContent = "Sin seleccionar";
    badge.textContent = "SELECCIONA";
  }
}

/**
 * Set slider values from a character's preset
 * @param {object} char
 */
export function applyCharacterToSliders(char) {
  document.getElementById("pitch").value = char.pitch;
  document.getElementById("speed").value = char.speed;
  document.getElementById("reverb").value = char.reverb;
  document.getElementById("distortion").value = char.distortion;
  document.getElementById("bass").value = char.bass;
  document.getElementById("treble").value = char.treble;
  updateAllDisplays();
}

/**
 * Read current slider values
 * @returns {object} { pitch, speed, reverb, distortion, bass, treble }
 */
export function getSliderValues() {
  return {
    pitch: parseFloat(document.getElementById("pitch").value),
    speed: parseFloat(document.getElementById("speed").value),
    reverb: parseFloat(document.getElementById("reverb").value),
    distortion: parseFloat(document.getElementById("distortion").value),
    bass: parseFloat(document.getElementById("bass").value),
    treble: parseFloat(document.getElementById("treble").value),
  };
}

/**
 * Update record button UI state
 * @param {boolean} recording
 */
export function setRecordingUI(recording) {
  const btn = document.getElementById("record-btn");
  const status = document.getElementById("record-status");

  if (recording) {
    btn.classList.add("recording");
    btn.textContent = "⏹️";
    status.textContent = "GRABANDO... PRESIONA PARA DETENER";
    status.classList.add("active");
  } else {
    btn.classList.remove("recording");
    btn.textContent = "🎙️";
    status.textContent = "PRESIONA PARA GRABAR";
    status.classList.remove("active");
  }
}

/**
 * Render the recordings list
 * @param {Function} onDelete - callback(id) when delete is clicked
 */
export function renderRecordings(onDelete) {
  const list = document.getElementById("recordings-list");
  const noRec = document.getElementById("no-recording");

  if (state.recordings.length === 0) {
    noRec.style.display = "block";
    list.innerHTML = "";
    return;
  }

  noRec.style.display = "none";
  list.innerHTML = "";

  state.recordings
    .slice()
    .reverse()
    .forEach((rec) => {
      const item = document.createElement("div");
      item.className = "recording-item";
      item.innerHTML = `
      <div style="font-size:1.8rem">${rec.charEmoji}</div>
      <div class="recording-info">
        <div class="recording-name">${rec.name}</div>
        <div class="recording-char">${rec.charName} · ${rec.time}</div>
        <audio controls src="${rec.url}" style="margin-top:8px; width:100%; height:28px; filter: hue-rotate(230deg);"></audio>
      </div>
      <a class="dl-btn" href="${rec.url}" download="voxshift_${rec.charName.toLowerCase()}_${rec.id}.${rec.ext}" title="Descargar">⬇</a>
      <button class="del-btn" title="Eliminar">✕</button>
    `;

      // Attach delete handler via event listener (no inline onclick)
      item.querySelector(".del-btn").addEventListener("click", () => {
        if (onDelete) onDelete(rec.id);
      });

      list.appendChild(item);
    });
}

/**
 * Show HTTPS warning in the info banner
 */
export function showHttpsWarning() {
  const banner = document.querySelector(".info-banner");
  if (!banner) return;
  banner.innerHTML =
    "⚠️ <strong>Atención:</strong> Esta app necesita HTTPS para acceder al micrófono. Estás usando HTTP. Si estás en GitHub Pages o Netlify, asegúrate de acceder por <strong>https://</strong>";
  banner.style.borderColor = "rgba(255,58,124,0.4)";
  banner.style.background = "rgba(255,58,124,0.1)";
  banner.style.color = "var(--accent2)";
}
