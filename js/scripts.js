// ── OPEN ─────────────────────────────────────────────────
let opened = false;
function openEnvelope() {
  if (opened) return;
  opened = true;

  // iniciar audio aquí porque ya hay gesto del usuario
  actx = new (window.AudioContext || window.webkitAudioContext)();
  startArp();
  musicOn = true;
  document.getElementById("musicBtn").textContent = "♫";
  document.getElementById("musicBtn").style.background =
    "linear-gradient(135deg,#6f7b52,#4f593a)";

  const wrap = document.getElementById("envWrap");
  wrap.classList.add("opened");
  wrap.style.pointerEvents = "none";
  spawnPetals(22);

  setTimeout(() => {
    document.getElementById("screen-envelope").classList.add("closing");
    const sl = document.getElementById("screen-letter");
    sl.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    sl.style.overflow = "hidden auto";
    startCountdown();
    setTimeout(() => spawnPetals(14), 500);
  }, 950);
}

// ── PETALS ───────────────────────────────────────────────
const emojis = [
  "🤍",
  "💖",
  "💕",
  "💗",
  "💘",
  "❤️",
  "✨",
  "🌸",
  "🌺",
  "🌹",
  "✿",
  "❀",
  "🌼",
];
function spawnPetals(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "petal";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = Math.random() * 100 + "vw";
      p.style.top = "-28px";
      p.style.fontSize = 12 + Math.random() * 14 + "px";
      const dur = 3 + Math.random() * 4;
      p.style.animation = `petalFall ${dur}s linear forwards`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000 + 300);
    }, i * 150);
  }
}

// ── COUNTDOWN ────────────────────────────────────────────
let countdownStarted = false;

function startCountdown() {
  if (countdownStarted) return;
  countdownStarted = true;

  const target = new Date("2026-07-04T15:30:00");
  function tick() {
    const diff = target - new Date();
    const pad = (v) => String(Math.max(0, v)).padStart(2, "0");
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(
        (id) => (document.getElementById(id).textContent = "00"),
      );
      return;
    }
    document.getElementById("days").textContent = pad(
      Math.floor(diff / 86400000),
    );
    document.getElementById("hours").textContent = pad(
      Math.floor((diff % 86400000) / 3600000),
    );
    document.getElementById("minutes").textContent = pad(
      Math.floor((diff % 3600000) / 60000),
    );
    document.getElementById("seconds").textContent = pad(
      Math.floor((diff % 60000) / 1000),
    );
  }
  tick();
  setInterval(tick, 1000);
}

// ── SUBMIT ─────────────────────────────────────────────────
function enviarRSVP() {
  const name    = document.getElementById("name").value.trim();
  const phone   = document.getElementById("phone").value.trim();
  const message = document.getElementById("comments").value.trim();
  const btn     = document.getElementById("submitBtn");

  if (!name || !phone) {
    btn.classList.add("shake");
    setTimeout(() => btn.classList.remove("shake"), 500);
    if (!name) document.getElementById("name").focus();
    else document.getElementById("phone").focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Enviando…";

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbo-3z_MdAXm56SucsbVKbnhfN3gcIrR9bwmWi7WQKATt6SnJugk7ravkUio1pacCY/exec";

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({
      nombre:   name,
      telefono: phone,
      mensaje:  message || "",
    }),
  })
  .then(() => {
    document.getElementById("guestName").textContent = name;
    document.getElementById("rsvpForm").style.display = "none";
    document.getElementById("thankYou").classList.add("show");
    spawnPetals(18);
  })
  .catch(() => {
    btn.disabled = false;
    btn.textContent = "Confirmar Asistencia ✦";
    alert("Error al enviar. Intenta nuevamente.");
  });
}

// ── MUSIC ────────────────────────────────────────────────
let actx = null,
  musicOn = false;
function toggleMusic() {
  const btn = document.getElementById("musicBtn");
  if (!musicOn) {
    // autoplay música al abrir la carta
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      startArp();
    } else {
      actx.resume();
    }
    musicOn = true;
    document.getElementById("musicBtn").textContent = "♫";
    document.getElementById("musicBtn").style.background =
      "linear-gradient(135deg,#6f7b52,#4f593a)";
  } else {
    actx && actx.suspend();
    musicOn = false;
    btn.textContent = "♪";
    btn.style.background = "linear-gradient(135deg,#c9a84c,#9c7a2e)";
  }
}
function startArp() {
  const master = actx.createGain();
  master.gain.value = 0.05;
  master.connect(actx.destination);
  const freqs = [261.63, 329.63, 392.0, 493.88, 523.25, 659.26];
  const seq = [0, 2, 4, 5, 2, 4, 5, 7, 0, 2, 3, 4, 5, 4, 3, 2];
  let i = 0;
  (function next() {
    if (!actx) return;
    const f = freqs[seq[i++ % seq.length] % freqs.length];
    const osc = actx.createOscillator(),
      g = actx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, actx.currentTime);
    g.gain.linearRampToValueAtTime(0.42, actx.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 2.0);
    osc.connect(g);
    g.connect(master);
    osc.start(actx.currentTime);
    osc.stop(actx.currentTime + 2.0);
    setTimeout(next, 530);
  })();
}

// ── MAPAS ────────────────────────────────────────────────
function abrirModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function cerrarModal(id) {
  document.getElementById(id).style.display = "none";
}
// cerrar al hacer clic fuera del mapa
document.addEventListener("click", function(e) {
  ["modalIglesia", "modalRecepcion"].forEach(id => {
    const modal = document.getElementById(id);
    if (e.target === modal) cerrarModal(id);
  });
});