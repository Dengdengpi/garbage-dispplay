/* server.js – polling, triggers, per‑UID, admin feed, clear endpoints */
const express = require("express");
const body    = require("body-parser");
const path    = require("path");
const app     = express();
const PORT    = process.env.PORT || 3000;

let records    = [];       // { uid, report, b64, ts }
let triggerUID = "";       // latched by /trigger

// CORS
app.use((_,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST");
  next();
});
app.use(body.json({limit:"8mb"}));
app.use(express.static(path.join(__dirname,"public")));

// 1. ESP32 uploads
app.post("/upload",(req,res)=>{
  const { uid, report, image } = req.body;
  if(!uid||!report||!image) return res.status(400).send("bad");
  records.unshift({ uid, report, b64:image, ts:Date.now() });
  res.sendStatus(200);
});

// 2. User triggers capture
app.get("/trigger",(req,res)=>{
  const uid=req.query.uid;
  if(!uid) return res.status(400).send("uid required");
  triggerUID=uid;
  res.sendStatus(200);
});

// 3. ESP polls
app.get("/poll",(_,res)=>{
  res.json({ uid: triggerUID });
  triggerUID="";
});

// 4. Feed: admin or per‑UID
app.get("/api/records",(req,res)=>{
  const uid=req.query.uid;
  if(uid) res.json(records.filter(r=>r.uid===uid));
  else    res.json(records);
});

// 5. Admin clear all
app.post("/clear-all",(_,res)=>{
  records.length=0;
  console.log("🧹 All cleared");
  res.sendStatus(200);
});

// 6. User clear own
app.post("/clear-user",(req,res)=>{
  const uid=req.query.uid;
  if(!uid) return res.status(400).send("uid required");
  records = records.filter(r=>r.uid!==uid);
  console.log(`🧹 Cleared ${uid}`);
  res.sendStatus(200);
});

app.listen(PORT,()=>console.log("✅ server on",PORT));
