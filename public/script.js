document.body.style.margin = 0;
document.body.style.overflow = `hidden`;

const canvas = document.getElementById("canvas_element");
const ctx = canvas.getContext("2d");

// Global hue types - changes on every page reload
const availableHues = ["blue", "green", "pink", "red"];
// Pick a random hue for the background and remove it from the list
const bgHue = availableHues.splice(
  Math.floor(Math.random() * availableHues.length),
  1
)[0];
const fgHue = availableHues[Math.floor(Math.random() * availableHues.length)];

// Function to generate random HSL color based on a color name
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
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`; // Return HSL color string
}

// Function to set up the canvas dimensions and global settings
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

  // Fill the canvas background with a random HSL color based on background hue
  ctx.fillStyle = getRandomHSLColor(bgHue);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Add event listener to window resize to call setupCanvas again
window.onresize = setupCanvas;

// Call setupCanvas on page load
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

// Function asynchronously loads a random voice sample from an array of 'voices' (audio)
async function loadVoiceSample() {
  // Define an array of audio file names
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

  // To avoid repetition of the 'voices'
  const prevUrl = window.localStorage.getItem("prevVoiceUrl");
  // First checks the local storage for a previously used audios
  if (prevUrl) {
    // If a previous URL exists, it removes it from the list of available audios to avoid repetition
    const i = urls.indexOf(prevUrl);

    // If the URL is found, remove it from the list to avoid using the same sample again
    if (i !== -1) {
      urls.splice(i, 1);
    }
  }

  // Pick a random audio urls from the remaining options in the 'voices' (audio) urls array
  const curUrl = urls[Math.floor(Math.random() * urls.length)];

  // Store the current URL in localStorage for future reference
  window.localStorage.setItem("prevVoiceUrl", curUrl);

  // Fetch the audio file from the chosen URL
  const req = await fetch(curUrl);

  // Convert the fetched data to an ArrayBuffer
  const arrayBuf = await req.arrayBuffer();

  // Decode the ArrayBuffer into an audio buffer using the audio context
  const audioBuf = await audioCtx.decodeAudioData(arrayBuf);

  // Return the decoded audio buffer
  return audioBuf;
}

// Define an asynchronous function to initialize the AudioContext and setup nodes for recording and playback
async function initAudioCtx() {
  // Create a new AudioContext instance
  audioCtx = new window.AudioContext();

  // Create a MediaStreamDestination node to capture audio output
  recordNode = audioCtx.createMediaStreamDestination();

  // Create a BufferSourceNode for playing back a sample
  voiceNode = audioCtx.createBufferSource();
  // Set the loop property to true so the sample loops indefinitely
  voiceNode.loop = true;

  // Create a GainNode to control the volume of the voice
  const voiceGainNode = audioCtx.createGain();

  // Connect the voice sample to the gain node
  voiceNode.connect(voiceGainNode);

  // Set the gain value to reduce the volume
  voiceGainNode.gain.value = 0.25;

  // Connect the gain node to the destination (speaker) and the record node
  voiceGainNode.connect(audioCtx.destination);
  voiceGainNode.connect(recordNode);

  // Create a MediaElementAudioSourceNode from a background audio element
  const audioSourceNode = audioCtx.createMediaElementSource(bgAudioEl);

  // Connect the background audio to the destination and the record node
  audioSourceNode.connect(audioCtx.destination);
  audioSourceNode.connect(recordNode);

  // Load a voice sample buffer asynchronously and assign it to the voice node
  voiceNode.buffer = await loadVoiceSample();

  // Start playing the voice sample
  voiceNode.start();

  // Make the record button visible
  document.getElementById("record-btn").style.display = "block";
}

// Function to change the background song
function changeBackgroundSong(songUrl) {
  // Update the source of the background audio element and play it
  bgAudioEl.src = songUrl;
  bgAudioEl.play();
}

// Add an input event listener to the song select element
document.getElementById("song-select").addEventListener("input", (event) => {
  // Initialize the audio context if it hasn't been initialized yet
  if (!audioCtx) {
    initAudioCtx();
  }

  // Change the background song based on the selected song URL
  changeBackgroundSong(event.target.value);

  // Hide the centered div
  document.getElementById("centered-div").style.display = "none";
});

// Add a mousemove event listener to adjust the playback rate of the voice sample based on mouse position
window.addEventListener("mousemove", (event) => {
  // Adjust the playback rate of the voice sample based on the vertical mouse position
  if (voiceNode) {
    voiceNode.playbackRate.value = Math.pow(
      2,
      ((1.0 - event.clientY / window.innerHeight) * 2.0 - 1.0) * 2.0
    );
  }
});

// VIDEO RECORDING FUNCTION
// Using MediaRecorder API

// Get the record button element
const recordBtn = document.getElementById("record-btn");

// Capturing the canvas stream, 20 frames per second
const canvasStream = canvas.captureStream(20);
let isRecording = false;
let mediaRecorder = null;
let mediaRecorderChunks = []; // Array to store recorded chunks

// Save recorded chunks to the array
function saveMediaRecorderChunks(event) {
  if (event.data.size > 0) {
    mediaRecorderChunks.push(event.data);
  }
}

// Export the recorded video
function exportMediaRecorderVideo() {
  // Check if there are any chunks to export
  if (mediaRecorderChunks.length === 0) {
    return;
  }

  // Create a Blob from the recorded chunks
  const blob = new Blob(mediaRecorderChunks, {
    type: mediaRecorderChunks[0].type,
  });

  // Create a download link for the Blob
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `kool-karaoke-${Date.now()}.mp4`;
  link.click();

  // Revoke the object URL after 5 seconds
  window.setTimeout(() => URL.revokeObjectURL(vidURL), 5000);
}

// Start recording
function startRecording() {
  // Reset the chunks array
  mediaRecorderChunks = [];

  // Get the video track from the canvas stream and the audio track from the record node
  const [videoTrack] = canvasStream.getVideoTracks();
  const [audioTrack] = recordNode.stream.getAudioTracks();

  // Create a new MediaStream with the tracks
  const avStream = new MediaStream([videoTrack, audioTrack]);

  // Initialize the MediaRecorder with the stream
  mediaRecorder = new MediaRecorder(avStream);

  // Add event listeners for dataavailable and stop events
  mediaRecorder.addEventListener("dataavailable", saveMediaRecorderChunks);
  mediaRecorder.addEventListener("stop", exportMediaRecorderVideo);

  // Start recording
  mediaRecorder.start();
}

// Stop recording
function stopRecording() {
  mediaRecorder.stop();
}

// Toggle recording state
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

// Add a click event listener to the record button to toggle recording
recordBtn.addEventListener("click", toggleRecording);
