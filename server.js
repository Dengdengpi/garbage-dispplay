/* server.js – triggers, polling, per‑UID feed, admin feed */
const express = require("express");
const body    = require("body-parser");
const path    = require("path");
const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;   // optional

const records = [];           // { uid, report, b64, ts }
let triggerUID = "";          // pending capture uid

/* CORS for ESP32 + user page */
app.use((_,res,next)=>{res.setHeader("Access-Control-Allow-Origin","*");next();});
app.use(body.json({limit:"8mb"}));
app.use(express.static(path.join(__dirname,"public")));

/* ----- ESP32 uploads ----- */
app.post("/upload",(req,res)=>{
  const { uid, report, image } = req.body;
  if(!uid||!report||!image) return res.status(400).send("bad");
  records.unshift({ uid, report, b64:image, ts:Date.now() });
  res.sendStatus(200);
});

/* ----- user triggers a capture ----- */
app.get("/trigger",(req,res)=>{
  const uid=req.query.uid;
  if(!uid) return res.status(400).send("uid req");
  triggerUID = uid;
  res.sendStatus(200);
});

/* ----- ESP32 polls every second ----- */
app.get("/poll",(req,res)=>{
  res.json({ uid: triggerUID });
  triggerUID = "";                  // clear latch
});

/* ----- feed: admin (all) or per‑uid ----- */
app.get("/api/records",(req,res)=>{
  const uid=req.query.uid;
  res.json(uid? records.filter(r=>r.uid===uid) : records);
});

/* optional admin clear */
app.post("/clear",(req,res)=>{
  if(req.query.token!==ADMIN_TOKEN) return res.sendStatus(403);
  records.length=0; res.sendStatus(200);
});

app.listen(PORT,()=>console.log("✅ server on",PORT));
