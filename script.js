const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const textDiv = document.getElementById("text");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lastGesture = "";
let showUntil = 0;
let particles = [];

function showMessage(msg) {
  textDiv.textContent = msg;
  showUntil = Date.now() + 3000;
}

// 💫 Particle class
class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 60;
    this.type = type;
  }

  draw() {
    ctx.globalAlpha = this.life / 60;

    if (this.type === "heart") {
      ctx.fillStyle = "#ff6fae";
      ctx.font = "24px Arial";
      ctx.fillText("❤️", this.x, this.y);
    } else {
      ctx.fillStyle = "#ffd6e8";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
}

function spawnParticles(type, count = 30) {
  for (let i = 0; i < count; i++) {
    particles.push(
      new Particle(canvas.width / 2, canvas.height / 2, type)
    );
  }
}

function detectGesture(landmarks) {
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];

  const open =
    index.y < landmarks[6].y &&
    middle.y < landmarks[10].y &&
    ring.y < landmarks[14].y &&
    pinky.y < landmarks[18].y;

  const fist =
    index.y > landmarks[6].y &&
    middle.y > landmarks[10].y &&
    ring.y > landmarks[14].y &&
    pinky.y > landmarks[18].y;

  const vSign =
    index.y < landmarks[6].y &&
    middle.y < landmarks[10].y &&
    ring.y > landmarks[14].y &&
    pinky.y > landmarks[18].y;

  if (vSign) return "v";
  if (open) return "open";
  if (fist) return "fist";
  return "";
}

// 🤲 MediaPipe Hands
const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  if (results.multiHandLandmarks.length > 0) {
    const gesture = detectGesture(results.multiHandLandmarks[0]);

    if (gesture && gesture !== lastGesture) {
      lastGesture = gesture;

      if (gesture === "v") {
        showMessage("You’re kinda special ✨");
        spawnParticles("sparkle", 40);
      }

      if (gesture === "open") {
        showMessage("Hey… smile 😊");
        spawnParticles("sparkle", 25);
      }

      if (gesture === "fist") {
        showMessage("This is for you ❤️");
        spawnParticles("heart", 20);
      }
    }
  }

  if (Date.now() > showUntil) {
    textDiv.textContent = "";
  }
});

// 📷 Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();
