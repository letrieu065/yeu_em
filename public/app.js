const $ = (id) => document.getElementById(id);

/* ---------- Cánh hoa rơi ---------- */
const canvas = $("petals");
const ctx = canvas.getContext("2d");
let petals = [];
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

function makePetal() {
  return {
    x: Math.random() * canvas.width, y: -20,
    s: 6 + Math.random() * 10, v: 0.6 + Math.random() * 1.4,
    d: Math.random() * Math.PI * 2, r: Math.random() * 360,
  };
}
function drawPetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (petals.length < 40 && Math.random() < 0.08) petals.push(makePetal());
  petals.forEach((p) => {
    p.y += p.v; p.d += 0.02; p.x += Math.sin(p.d) * 0.8; p.r += 1;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate((p.r * Math.PI) / 180);
    ctx.fillStyle = "rgba(255,105,160,.7)";
    ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s / 1.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  petals = petals.filter((p) => p.y < canvas.height + 30);
  requestAnimationFrame(drawPetals);
}
drawPetals();

/* ---------- Confetti trái tim ---------- */
function confetti() {
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.textContent = ["💖", "🌹", "✨", "💐", "💗"][i % 5];
    Object.assign(el.style, {
      position: "fixed", left: Math.random() * 100 + "vw", top: "-30px",
      fontSize: 16 + Math.random() * 20 + "px", zIndex: 99, pointerEvents: "none",
      transition: `transform ${2 + Math.random() * 2}s ease-in, opacity 3s`,
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${innerHeight + 60}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = 0;
    });
    setTimeout(() => el.remove(), 4500);
  }
}

/* ---------- Hiệu ứng gõ chữ ---------- */
async function typeLines(lines) {
  const out = $("typed");
  for (;;) {
    for (const line of lines) {
      for (let i = 1; i <= line.length; i++) { out.textContent = line.slice(0, i); await sleep(55); }
      await sleep(1800);
      for (let i = line.length; i >= 0; i--) { out.textContent = line.slice(0, i); await sleep(25); }
    }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Đếm ngày yêu nhau ---------- */
function startCounter(startDate) {
  const start = new Date(startDate);
  const el = $("counter");
  const tick = () => {
    let diff = Math.floor((Date.now() - start) / 1000);
    const d = Math.floor(diff / 86400); diff %= 86400;
    const h = Math.floor(diff / 3600); diff %= 3600;
    const m = Math.floor(diff / 60), s = diff % 60;
    el.innerHTML = [[d, "ngày"], [h, "giờ"], [m, "phút"], [s, "giây"]]
      .map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("");
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- Render nội dung ---------- */
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function renderWishes(list) {
  $("wishes").innerHTML = list.length
    ? list.map((w) => `<li>${esc(w.mood)} ${esc(w.message)}<small>${new Date(w.createdAt).toLocaleString("vi-VN")}</small></li>`).join("")
    : "<li>Chưa có lời nhắn nào, em viết cho anh nhé 🥰</li>";
}

async function init(cfg) {
  if (!cfg.finalSurprise) $("surprise").closest("section").classList.add("hidden");
  $("subtitle").textContent = cfg.heroSubtitle;
  $("title").textContent = `Gửi ${cfg.herName}`;
  startCounter(cfg.startDate);
  typeLines(cfg.typedLines);

  $("reasonsGrid").innerHTML = cfg.reasons.map((r, i) => `<div class="reason" style="transition-delay:${i * 0.1}s"><em>💕</em>${esc(r)}</div>`).join("");
  $("timeline").innerHTML = cfg.timeline.map((t) => `<div class="tl-item"><small>${esc(t.date)}</small><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div>`).join("");
  $("gallery").innerHTML = cfg.photos.map((p) => `<figure><img loading="lazy" src="${esc(p.src)}" alt=""/><figcaption>${esc(p.caption)}</figcaption></figure>`).join("");
  $("letter").textContent = cfg.letter;

  $("openLetter").onclick = () => { $("letter").classList.remove("hidden"); $("openLetter").classList.add("hidden"); confetti(); };
  $("surprise").onclick = () => { $("surpriseText").textContent = cfg.finalSurprise; $("surpriseText").classList.remove("hidden"); confetti(); };

  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("show")), { threshold: 0.2 });
  document.querySelectorAll(".reason").forEach((el) => io.observe(el));

  renderWishes(await (await fetch("/api/wishes")).json());
}

$("wishForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = $("message").value.trim();
  if (!message) return;
  const res = await fetch("/api/wishes", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mood: $("mood").value }),
  });
  if (res.ok) {
    $("message").value = "";
    renderWishes(await (await fetch("/api/wishes")).json());
    confetti();
  }
});

$("giftBtn").onclick = async () => {
  $("gate").classList.add("hidden");
  $("app").classList.remove("hidden");
  confetti();
  init(await (await fetch("/api/config")).json());
};
