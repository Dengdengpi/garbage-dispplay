// server.js  (CommonJS, no "type":"module" needed)
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const records = [];                         // RAM list

/* Body limit 15 MB just in case */
app.use(bodyParser.json({ limit: "15mb" }));

/* CORS so you can open from phone by IP */
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/* Static front‑end */
app.use(express.static("public"));

/* Upload endpoint */
app.post("/upload", (req, res) => {
  const { label, image } = req.body;
  if (!label || !image) return res.status(400).send("Bad payload");

  const fname = `images/${Date.now()}.jpg`;
  fs.writeFileSync(path.join(__dirname, "public", fname), Buffer.from(image, "base64"));
  const rec = { label, file: fname, time: new Date().toLocaleString() };
  records.unshift(rec);
  console.log("✅ Saved:", rec.label);
  res.sendStatus(200);
});

/* JSON feed */
app.get("/api/records", (_, res) => res.json(records));

app.listen(PORT, () => console.log(`🌍  http://localhost:${PORT}`));
