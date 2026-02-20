/**
 * audio-engine.js
 * Web Audio API context management, audio graph construction, and DSP effects
 */

let audioCtx = null;
let sourceNode = null;
let processorNodes = [];

/** Shared analyser node — used by the visualizer */
export let analyserNode = null;

/**
 * Initialize or resume the AudioContext
 */
export async function setupAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
}

/**
 * Build the full audio processing graph
 * @param {MediaStream} stream - Raw microphone stream
 * @param {object} params - { pitch, speed, reverb, distortion, bass, treble }
 * @returns {{ processedStream: MediaStream }}
 */
export function buildAudioGraph(stream, params) {
  // Cleanup previous nodes
  processorNodes.forEach((n) => {
    try {
      n.disconnect();
    } catch (e) {
      /* ignore */
    }
  });
  processorNodes = [];

  const { pitch, reverb, distortion, bass, treble } = params;

  const source = audioCtx.createMediaStreamSource(stream);
  sourceNode = source;

  // EQ — Bass
  const bassFilter = audioCtx.createBiquadFilter();
  bassFilter.type = "lowshelf";
  bassFilter.frequency.value = 200;
  bassFilter.gain.value = bass;

  // EQ — Treble
  const trebleFilter = audioCtx.createBiquadFilter();
  trebleFilter.type = "highshelf";
  trebleFilter.frequency.value = 4000;
  trebleFilter.gain.value = treble;

  // Distortion
  const waveshaper = audioCtx.createWaveShaper();
  waveshaper.curve = makeDistortionCurve(distortion * 4);
  waveshaper.oversample = "4x";

  // Analyser for visualizer
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 256;

  // Reverb (convolution-based)
  const convolver = audioCtx.createConvolver();
  const reverbWet = audioCtx.createGain();
  const reverbDry = audioCtx.createGain();
  const reverbNorm = reverb / 100;
  reverbWet.gain.value = reverbNorm;
  reverbDry.gain.value = 1 - reverbNorm * 0.5;
  convolver.buffer = createReverbBuffer(audioCtx, 2);

  // Pitch (allpass Q trick)
  const pitchShift = audioCtx.createBiquadFilter();
  pitchShift.type = "allpass";
  pitchShift.frequency.value = 440;
  pitchShift.Q.value = pitch * 0.5;

  // Chain: source → bass → treble → waveshaper → analyser → dry/wet → dest
  source.connect(bassFilter);
  bassFilter.connect(trebleFilter);
  trebleFilter.connect(waveshaper);
  waveshaper.connect(analyserNode);
  analyserNode.connect(reverbDry);
  analyserNode.connect(convolver);
  convolver.connect(reverbWet);

  const merger = audioCtx.createGain();
  reverbDry.connect(merger);
  reverbWet.connect(merger);

  // Destination for recording
  const dest = audioCtx.createMediaStreamDestination();
  merger.connect(dest);

  processorNodes = [
    bassFilter,
    trebleFilter,
    waveshaper,
    analyserNode,
    reverbDry,
    reverbWet,
    convolver,
    merger,
    pitchShift,
  ];

  return { processedStream: dest.stream };
}

/**
 * Generate a wave-shaper distortion curve
 * @param {number} amount
 * @returns {Float32Array}
 */
function makeDistortionCurve(amount) {
  const samples = 256;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/**
 * Create an impulse-response buffer for reverb
 * @param {AudioContext} ctx
 * @param {number} duration - seconds
 * @returns {AudioBuffer}
 */
function createReverbBuffer(ctx, duration) {
  const len = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
  }
  return buffer;
}
