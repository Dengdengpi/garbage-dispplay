/* server.js – keeps images in RAM so that Render’s read‑only FS is not an issue */
const express = require("express");
const body    = require("body-parser");

const app  = express();
const PORT = process.env.PORT || 3000;
const records = [];                // { label, explain, b64, ts }

/* JSON up to ~8 MB */
app.use(body.json({ limit: "8mb" }));
app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const { label, explain, image } = req.body;
  if (!label || !image) return res.status(400).send("bad");
  records.unshift({ label, explain: explain || "", b64: image, ts: Date.now() });
  console.log("✅", label);
  res.sendStatus(200);
});

app.get("/api/records", (_req, res) => res.json(records));

app.listen(PORT, () => console.log("✅ Server listening on :" + PORT));
