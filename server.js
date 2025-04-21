/* server.js – RAM‑only, adds /clear for admin */
const express = require("express");
const body    = require("body-parser");

const app  = express();
const PORT = process.env.PORT || 3000;
const records = [];          // { report, b64, ts }

app.use(body.json({ limit: "8mb" }));
app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const { report, image } = req.body;
  if (!report || !image) return res.status(400).send("bad");
  records.unshift({ report, b64: image, ts: Date.now() });
  res.sendStatus(200);
});

/* fetch feed */
app.get("/api/records", (_req, res) => res.json(records));

/* admin: clear all (POST /clear?token=secret) */
app.post("/clear", (req, res) => {
  if (req.query.token !== process.env.ADMIN_TOKEN) return res.sendStatus(403);
  records.length = 0;
  res.sendStatus(200);
});

app.listen(PORT, () => console.log("✅ server on :" + PORT));
