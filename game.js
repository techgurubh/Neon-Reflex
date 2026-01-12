const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

canvas.width = innerWidth;
canvas.height = innerHeight;

// 🔊 Synth Click Sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
}

// 🎮 Game State
let score = 0;
let shrinkSpeed = 0.4;
let gameRunning = false;

const neonColors = ["#00e5ff","#ff1744","#76ff03","#ffea00","#d500f9"];
let circle = {};
let particles = [];

// ⭕ Spawn Circle
function spawnCircle() {
    const maxRadius = 80;
    circle = {
        x: Math.random() * (canvas.width - maxRadius * 2) + maxRadius,
        y: Math.random() * (canvas.height - maxRadius * 2) + maxRadius,
        radius: maxRadius,
        color: neonColors[Math.floor(Math.random() * neonColors.length)]
    };
}

// 💥 Explosion
function createExplosion(x, y, color) {
    for (let i = 0; i < 40; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 40,
            size: Math.random() * 4 + 3,
            color
        });
    }
}

function updateParticles() {
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 40;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
    });
    ctx.globalAlpha = 1;
}

// 🎨 Draw
function drawCircle() {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.strokeStyle = circle.color;
    ctx.lineWidth = 8;
    ctx.shadowBlur = 25;
    ctx.shadowColor = circle.color;
    ctx.stroke();
}

// 🔄 Game Loop
function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circle.radius -= shrinkSpeed;

    if (circle.radius <= 0) {
        gameOver();
        return;
    }

    drawCircle();
    updateParticles();
    requestAnimationFrame(update);
}

// 🖱️ Input
function handleClick(x, y) {
    const dx = x - circle.x;
    const dy = y - circle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= circle.radius) {
        playClickSound();
        createExplosion(circle.x, circle.y, circle.color);

        score++;
        scoreEl.textContent = score;

        if (score > 40) shrinkSpeed += 0.08;
        spawnCircle();
    }
}

canvas.addEventListener("click", e => handleClick(e.clientX, e.clientY));
canvas.addEventListener("touchstart", e => {
    const t = e.touches[0];
    handleClick(t.clientX, t.clientY);
});

// ▶️ Start / End
startBtn.onclick = () => {
    audioCtx.resume();
    score = 0;
    shrinkSpeed = 0.4;
    scoreEl.textContent = score;
    startScreen.style.display = "none";
    gameRunning = true;
    spawnCircle();
    update();
};

function gameOver() {
    gameRunning = false;
    startScreen.style.display = "flex";
    startScreen.innerHTML = `
        <h1>GAME OVER</h1>
        <p>Your Score: <strong>${score}</strong></p>
        <button onclick="location.reload()">Play Again</button>
        <div id="credit">
            Developed by
            <a href="https://wa.me/917002443108" target="_blank">
                Jahangir Hussain
            </a>
        </div>
    `;
}

window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});
