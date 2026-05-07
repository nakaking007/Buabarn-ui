const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let db = [];
let idCounter = 1;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

async function generateContent(topic){
  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${OPENAI_API_KEY}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      model:"gpt-4o-mini",
      messages:[{role:"user",content:`เขียนโพสต์ Facebook พร้อม CTA เกี่ยวกับ ${topic}`}]
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

async function postToFacebook(message){
  const url = `https://graph.facebook.com/${FB_PAGE_ID}/feed`;
  await fetch(url,{
    method:"POST",
    body:new URLSearchParams({
      message:message,
      access_token:FB_PAGE_TOKEN
    })
  });
}

app.post('/api/generate', async (req,res)=>{
  const {topic} = req.body;
  let items=[];

  for(let i=0;i<7;i++){
    const content = await generateContent(topic);
    const item = {
      id:idCounter++,
      content,
      status:'draft'
    };
    db.push(item);
    items.push(item);
  }

  res.json({items});
});

app.post('/api/approve', async (req,res)=>{
  const {id} = req.body;
  const item = db.find(x=>x.id===id);

  if(!item) return res.json({error:"not found"});

  item.status='approved';
  await postToFacebook(item.content);

  res.json({status:"posted"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log('Server running'));
