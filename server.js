/* server.js – RAM‑only storage, ready for Render */
const express = require("express");
const body    = require("body-parser");

const app  = express();
const PORT = process.env.PORT || 3000;
const records = [];         // { report, b64, ts }

app.use(body.json({ limit: "8mb" }));
app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const { report, image } = req.body;
  if (!report || !image) return res.status(400).send("bad");
  records.unshift({ report, b64: image, ts: Date.now() });
  console.log("✅ upload:", report.split('\n')[0]);
  res.sendStatus(200);
});

app.get("/api/records", (_req, res) => res.json(records));

app.listen(PORT, () => console.log("✅ Server on :" + PORT));
