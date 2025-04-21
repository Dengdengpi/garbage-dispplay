/* server.js – all previous logic, now adds simple CORS */
const express = require("express");
const body    = require("body-parser");
const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const records = [];   // { uid, report, b64, ts }

app.use((_,res,next)=>{  // CORS for all routes
  res.setHeader("Access-Control-Allow-Origin","*");
  next();
});
app.use(body.json({limit:"8mb"}));
app.use(express.static("public"));

/* ESP32 uploads */
app.post("/upload",(req,res)=>{
  const { uid, report, image } = req.body;
  if(!uid||!report||!image) return res.status(400).send("bad");
  records.unshift({ uid, report, b64:image, ts:Date.now() });
  res.sendStatus(200);
});

/* admin (all) or per-user feed */
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
