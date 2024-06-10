document.body.style.margin = 0;
document.body.style.overflow = `hidden`;

const canvas = document.getElementById("canvas_element");
const ctx = canvas.getContext("2d");

// global hue types - changes on every page reload
const availableHues = ["blue", "green", "pink", "red"];
const bgHue = availableHues.splice(
  Math.floor(Math.random() * availableHues.length),
  1
)[0];
const fgHue = availableHues[Math.floor(Math.random() * availableHues.length)];

// Random colors for the squares to draw
function getRandomHSLColor(colorName) {
  switch (colorName) {
    case "blue":
      hue = Math.floor(Math.random() * 60) + 210; // Hue for blue
      break;
    case "green":
      hue = Math.floor(Math.random() * 60) + 100; // Hue for green
      break;
    case "pink":
      hue = Math.floor(Math.random() * 60) + 310; // Hue for pink
      break;
    case "red":
      hue = Math.floor(Math.random() * 60) + 0; // Hue for red
      break;
  }

  const saturation = Math.floor(Math.random() * 50) + 50; // Random saturation value between 0 and 80
  const lightness = Math.floor(Math.random() * 5) + 60; // Random lightness value between 60 and 65
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`; // String of the values of hue, saturation, and lightness
}

function setupCanvas() {
  // Initialize the canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.globalAlpha = 0.5; // Set global alpha for the entire canvas

  // Global canvas setting
  ctx.lineWidth = 0.2; // Stroke width
  ctx.shadowOffsetX = 0; // Rectangles' x shadow
  ctx.shadowOffsetY = 10; // Rectangles' y shadow
  ctx.shadowBlur = 10; // Shadow blur
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)"; // Shadow color

  // Fill canvas background
  ctx.fillStyle = getRandomHSLColor(bgHue);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.onresize = setupCanvas;

setupCanvas();

class Root {
  constructor(x, y, color, ctx) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.color = color;
    this.speedX = Math.random() * 5 - 3; // Random speed for horizontal movement
    this.speedY = Math.random() * 5 - 3; // Random speed for vertical movement
    this.maxSize = Math.random() * 7 + 30; // Maximum size the object can grow to
    this.size = Math.random() * 10 + 15; // Random size
    this.vs = Math.random() * 0.2 + 0.2; // Random value for grow size
    this.angleX = Math.random() * 6.2; //Random horizontal angles for rotation
    this.vax = Math.random() * 1.6 - 0.3; // Random rates of change of the X rotation angles
    this.angleY = Math.random() * 6.2; //Random vertical angles for rotation
    this.vay = Math.random() * 1.6 - 0.3; // Random rates of change of the Y rotation angles
    this.angle = 0; // Current rotation angle
    this.va = Math.random() * 0.02 + 0.5; //Random value to adjust this angle over time, affecting the object's rotation speed
    this.lightness = 10; // Set lightness
  }

  update(ctx) {
    this.x += this.speedX + Math.sin(this.angleX); // Positive value: move to the right, negative value: move to the left
    this.y += this.speedY + Math.sin(this.angleY); // Negative value: move upward, positive value: downward
    this.size += this.vs; //  Increases the size of the squares by random vs value (grow over time)
    this.angleX += this.vax; // The rotation X angles of the squares based on vax (control the rate of change of the rotation angles)
    this.angleY += this.vay; // The rotation Y angles of the squares based on vay (control the rate of change of the rotation angles)
    this.angle += this.va; // The overall rotation angle of the suqraes

    // If the lightness of the object's color is less than 60
    // -> increases the lightness by 0.25
    // -> making the object brighter over time
    if (this.lightness < 60) this.lightness += 0.25;

    // If the object's size is less than its maximum size -> the square is drawn on the canvas
    if (this.size < this.maxSize) {
      // Save and restore the current state of the canvas context
      // Ensures that drawing operations are performed relative to the object's position and rotation
      ctx.save();

      // Translation
      ctx.translate(this.x, this.y);

      // Rotation
      ctx.rotate(this.angle);

      // Color
      ctx.fillStyle = this.color;

      // Set the fill color of the squares
      // Draw a filled rectangle
      ctx.fillRect(0, 0, this.size, this.size);

      // Creates a loop that continuously updates and redraws
      requestAnimationFrame(() => this.update(ctx));
      ctx.restore();
    }
  }
}

// The event object e
// Everytime the mouse move over the canvas
window.addEventListener("mousemove", function (e) {
  // Code to execute when the mouse moves
  // Root class is created

  // e.clientX and e.clientY -- the horizontal X and vertical Y coordinates of the mouse pointer
  // getRandomHSLColor() -- returns a random HSL
  // ctx -- to a canvas context, used to draw the graphical object on the canvas
  const root = new Root(e.clientX, e.clientY, getRandomHSLColor(fgHue), ctx);

  // Updates the state of the object (position, size, color) and redrawing it on the canvas
  // Argument ctx
  root.update(ctx);
});

// ?. operator is used to safely access the frequency property of the oscillator
// If oscillator is null or undefined -> will not throw an error

//
// Sound FX
//

// Global WebAudio context, initialized when user first chooses background music
let audioCtx = null;
// "Singing" voice
let voiceNode = null;
// Video recording output node
let recordNode = null;
// Background audio HTML element
const bgAudioEl = document.getElementById("bg-audio");

async function loadVoiceSample() {
  const urls = [
    "dark.wav",
    "detuned.wav",
    "embellish.wav",
    "flux.wav",
    "grow.wav",
    "noisy.wav",
    "reveal.wav",
    "symphonic.wav",
  ];

  const prevUrl = window.localStorage.getItem("prevVoiceUrl");
  if (prevUrl) {
    const i = urls.indexOf(prevUrl);
    if (i !== -1) {
      urls.splice(i, 1);
    }
  }
  const curUrl = urls[Math.floor(Math.random() * urls.length)];
  window.localStorage.setItem("prevVoiceUrl", curUrl);

  const req = await fetch(curUrl);
  const arrayBuf = await req.arrayBuffer();
  const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
  return audioBuf;
}

async function initAudioCtx() {
  audioCtx = new window.AudioContext();

  recordNode = audioCtx.createMediaStreamDestination();

  voiceNode = audioCtx.createBufferSource();
  voiceNode.loop = true;

  const voiceGainNode = audioCtx.createGain();
  voiceNode.connect(voiceGainNode);
  voiceGainNode.gain.value = 0.25;

  voiceGainNode.connect(audioCtx.destination);
  voiceGainNode.connect(recordNode);

  const audioSourceNode = audioCtx.createMediaElementSource(bgAudioEl);
  audioSourceNode.connect(audioCtx.destination);
  audioSourceNode.connect(recordNode);

  voiceNode.buffer = await loadVoiceSample();
  voiceNode.start();

  document.getElementById("record-btn").style.display = "block";
}

function changeBackgroundSong(songUrl) {
  bgAudioEl.src = songUrl;
  bgAudioEl.play();
}

document.getElementById("song-select").addEventListener("input", (event) => {
  if (!audioCtx) {
    initAudioCtx();
  }
  changeBackgroundSong(event.target.value);
  document.getElementById("centered-div").style.display = "none";
});

window.addEventListener("mousemove", (event) => {
  if (voiceNode) {
    voiceNode.playbackRate.value = Math.pow(
      2,
      ((1.0 - event.clientY / window.innerHeight) * 2.0 - 1.0) * 2.0
    );
  }
});

//
// Video recording
//

const recordBtn = document.getElementById("record-btn");
const canvasStream = canvas.captureStream(20);
let isRecording = false;
let mediaRecorder = null;
let mediaRecorderChunks = [];

function saveMediaRecorderChunks(event) {
  if (event.data.size > 0) {
    mediaRecorderChunks.push(event.data);
  }
}

function exportMediaRecorderVideo() {
  if (mediaRecorderChunks.length === 0) {
    return;
  }

  const blob = new Blob(mediaRecorderChunks, {
    type: mediaRecorderChunks[0].type,
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `kool-karaoke-${Date.now()}.mp4`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(vidURL), 5000);
}

function startRecording() {
  mediaRecorderChunks = [];
  const [videoTrack] = canvasStream.getVideoTracks();
  const [audioTrack] = recordNode.stream.getAudioTracks();
  const avStream = new MediaStream([videoTrack, audioTrack]);
  mediaRecorder = new MediaRecorder(avStream);
  mediaRecorder.addEventListener("dataavailable", saveMediaRecorderChunks);
  mediaRecorder.addEventListener("stop", exportMediaRecorderVideo);
  mediaRecorder.start();
}

function stopRecording() {
  mediaRecorder.stop();
}

function toggleRecording() {
  if (isRecording) {
    isRecording = false;
    recordBtn.textContent = "RECORD";
    stopRecording();
  } else {
    isRecording = true;
    recordBtn.textContent = "STOP";
    startRecording();
  }
}

recordBtn.addEventListener("click", toggleRecording);
