/* server.js – keeps old feed, adds uid filtering, optional clear */
const express = require("express");
const body    = require("body-parser");
const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;   // set in Render dashboard

const records = [];   // { uid, report, b64, ts }

app.use(body.json({limit:"8mb"}));
app.use(express.static("public"));

/* ESP32 uploads */
app.post("/upload",(req,res)=>{
  const { uid, report, image } = req.body;
  if(!uid||!report||!image) return res.status(400).send("bad");
  records.unshift({ uid, report, b64:image, ts: Date.now() });
  res.sendStatus(200);
});

/* fetch records – admin (all) or user (filtered by uid) */
app.get("/api/records",(req,res)=>{
  const uid = req.query.uid;
  if(uid) return res.json(records.filter(r=>r.uid===uid));
  res.json(records);             // no uid → admin view
});

/* optional admin clear */
app.post("/clear",(req,res)=>{
  if(req.query.token!==ADMIN_TOKEN) return res.sendStatus(403);
  records.length = 0;
  res.sendStatus(200);
});

app.listen(PORT,()=>console.log("✅ server on port",PORT));
