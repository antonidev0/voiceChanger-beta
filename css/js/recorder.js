/**
 * recorder.js
 * MediaRecorder management — start, stop, save recordings
 */

import { state, addRecording } from "./characters.js";
import { setupAudioContext, buildAudioGraph } from "./audio-engine.js";
import { getSliderValues, setRecordingUI, renderRecordings } from "./ui.js";

let mediaRecorder = null;
let recordingChunks = [];

/** Callback to re-render recordings list after save */
let onRecordingsChanged = null;

/**
 * Register a callback for when recordings change
 * @param {Function} callback
 */
export function setRecordingsChangedHandler(callback) {
  onRecordingsChanged = callback;
}

/**
 * Toggle recording on/off
 */
export async function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

/**
 * Start recording from the microphone with effects applied
 */
async function startRecording() {
  if (!state.selectedChar) {
    alert("¡Selecciona un personaje primero!");
    return;
  }

  try {
    await setupAudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const params = getSliderValues();
    const { processedStream } = buildAudioGraph(stream, params);

    recordingChunks = [];

    // Fallback MIME types for cross-browser compatibility
    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "",
    ];
    const supportedMime = mimeTypes.find(
      (m) => m === "" || MediaRecorder.isTypeSupported(m),
    );
    const recorderOptions = supportedMime ? { mimeType: supportedMime } : {};

    mediaRecorder = new MediaRecorder(processedStream, recorderOptions);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordingChunks.push(e.data);
    };

    mediaRecorder.onstop = () => saveRecording(stream);
    mediaRecorder.start(100);

    state.isRecording = true;
    setRecordingUI(true);
  } catch (err) {
    console.error(err);
    handleMicError(err);
  }
}

/**
 * Stop the current recording
 */
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  state.isRecording = false;
  setRecordingUI(false);
}

/**
 * Save the recorded chunks as a new recording entry
 * @param {MediaStream} originalStream
 */
function saveRecording(originalStream) {
  originalStream.getTracks().forEach((t) => t.stop());

  const mimeType = mediaRecorder.mimeType || "audio/webm";
  const blob = new Blob(recordingChunks, { type: mimeType });
  const ext = mimeType.includes("mp4")
    ? "mp4"
    : mimeType.includes("ogg")
      ? "ogg"
      : "webm";

  const url = URL.createObjectURL(blob);

  const rec = {
    id: Date.now(),
    url,
    blob,
    ext,
    charName: state.selectedChar.name,
    charEmoji: state.selectedChar.emoji,
    name: `Grabación #${state.recordings.length + 1}`,
    time: new Date().toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  addRecording(rec);

  if (onRecordingsChanged) onRecordingsChanged();
}

/**
 * Show user-friendly microphone error messages
 * @param {Error} err
 */
function handleMicError(err) {
  if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
    alert(
      "Permiso de micrófono denegado. Haz clic en el ícono de candado/cámara en la barra de tu navegador y permite el acceso al micrófono.",
    );
  } else if (err.name === "NotFoundError") {
    alert(
      "No se encontró ningún micrófono. Conecta un micrófono e inténtalo de nuevo.",
    );
  } else if (err.name === "NotReadableError") {
    alert(
      "El micrófono está en uso por otra aplicación. Cierra otras apps que lo usen e inténtalo de nuevo.",
    );
  } else {
    alert("Error accediendo al micrófono: " + err.message);
  }
}
