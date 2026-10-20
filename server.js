const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const WISHES_FILE = path.join(DATA_DIR, "wishes.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// Cấu hình nội dung (tên, ngày yêu nhau, thư, lý do...)
app.get("/api/config", (req, res) => {
  res.json(readJSON(CONFIG_FILE, {}));
});

// Danh sách lời nhắn em để lại
app.get("/api/wishes", (req, res) => {
  res.json(readJSON(WISHES_FILE, []));
});

// Em gửi lời nhắn lại cho anh
app.post("/api/wishes", (req, res) => {
  const message = String(req.body.message || "").trim().slice(0, 500);
  const mood = String(req.body.mood || "💖").slice(0, 8);
  if (!message) return res.status(400).json({ error: "Em chưa viết gì nè 🥺" });

  const wishes = readJSON(WISHES_FILE, []);
  const item = {
    id: Date.now(),
    message,
    mood,
    createdAt: new Date().toISOString(),
  };
  wishes.unshift(item);
  writeJSON(WISHES_FILE, wishes.slice(0, 200));
  res.status(201).json(item);
});

app.delete("/api/wishes/:id", (req, res) => {
  const id = Number(req.params.id);
  const wishes = readJSON(WISHES_FILE, []).filter((w) => w.id !== id);
  writeJSON(WISHES_FILE, wishes);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`💌 Mở trình duyệt: http://localhost:${PORT}`);
});
