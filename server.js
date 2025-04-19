/* server.js – works on Render’s read‑only FS by keeping images in RAM */
const express = require("express");
const body = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const records = [];                // {label, b64, ts}

/* json up to 8 MB */
app.use(body.json({ limit: "8mb" }));
app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const { label, image } = req.body;
  if (!label || !image) return res.status(400).send("bad");
  records.unshift({ label, b64: image, ts: Date.now() });
  console.log("✅", label);
  res.sendStatus(200);
});

app.get("/api/records", (_req, res) => res.json(records));

app.listen(PORT, () => console.log("✅ Server on :" + PORT));
