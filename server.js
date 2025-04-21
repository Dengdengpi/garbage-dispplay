/* server.js – triggers, polling, per‑UID feed, admin feed, clear endpoints */
const express = require("express");
const body    = require("body-parser");
const path    = require("path");
const app     = express();
const PORT    = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;   // set in env

let records    = [];       // { uid, report, b64, ts }
let triggerUID = "";       // pending capture uid

// CORS for ESP32 + user page
app.use((_,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST");
  next();
});
app.use(body.json({limit:"8mb"}));
app.use(express.static(path.join(__dirname,"public")));

// ESP32 uploads
app.post("/upload",(req,res)=>{
  const { uid, report, image } = req.body;
  if(!uid||!report||!image) return res.status(400).send("bad");
  records.unshift({ uid, report, b64:image, ts:Date.now() });
  res.sendStatus(200);
});

// user triggers a capture
app.get("/trigger",(req,res)=>{
  const uid = req.query.uid;
  if(!uid) return res.status(400).send("uid required");
  triggerUID = uid;
  res.sendStatus(200);
});

// ESP32 polls every second
app.get("/poll",(_,res)=>{
  res.json({ uid: triggerUID });
  triggerUID = "";  // clear latch
});

// feed: admin (all) or per‑uid
app.get("/api/records",(req,res)=>{
  const uid = req.query.uid;
  if(uid) {
    res.json(records.filter(r=>r.uid===uid));
  } else {
    res.json(records);
  }
});

// admin clear all
app.post("/clear-all",(req,res)=>{
  if(req.query.token!==ADMIN_TOKEN) return res.sendStatus(403);
  records.length = 0;
  console.log("🧹 All records cleared by admin.");
  res.sendStatus(200);
});

// user clear own history
app.post("/clear-user",(req,res)=>{
  const uid = req.query.uid;
  if(!uid) return res.status(400).send("uid required");
  // remove all records matching uid
  for(let i=records.length-1;i>=0;--i){
    if(records[i].uid===uid) records.splice(i,1);
  }
  console.log(`🧹 Cleared records for user ${uid}.`);
  res.sendStatus(200);
});

app.listen(PORT,()=>console.log("✅ server on",PORT));
