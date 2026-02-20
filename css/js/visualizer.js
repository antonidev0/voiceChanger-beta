/**
 * visualizer.js
 * Canvas-based audio waveform visualizer
 */

import { analyserNode } from "./audio-engine.js";
import { state } from "./characters.js";

let animFrameId = null;

/**
 * Start the visualizer loop on the given canvas
 */
export function startVisualizer() {
  const canvas = document.getElementById("visualizer");
  const ctx = canvas.getContext("2d");
  resizeCanvas(canvas);

  function draw() {
    animFrameId = requestAnimationFrame(draw);

    if (!analyserNode) {
      ctx.fillStyle = "transparent";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawIdleWave(ctx, canvas);
      return;
    }

    const bufferLen = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLen);
    analyserNode.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = state.isRecording ? "#ff3a7c" : "#7c3aff";
    ctx.shadowColor = state.isRecording ? "#ff3a7c" : "#7c3aff";
    ctx.shadowBlur = 8;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLen;
    let x = 0;
    for (let i = 0; i < bufferLen; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  draw();
}

/**
 * Draw the idle sine wave when no audio is active
 */
function drawIdleWave(ctx, canvas) {
  const t = Date.now() / 1000;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(124,58,255,0.3)";
  ctx.shadowColor = "rgba(124,58,255,0.3)";
  ctx.shadowBlur = 4;
  ctx.beginPath();

  for (let x = 0; x < canvas.width; x++) {
    const y =
      canvas.height / 2 +
      Math.sin((x / canvas.width) * Math.PI * 4 + t * 2) * 8;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}

/**
 * Resize the canvas to match its container
 */
export function resizeCanvas(canvas) {
  if (!canvas) canvas = document.getElementById("visualizer");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
