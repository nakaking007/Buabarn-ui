async function generate(){
  const topic = document.getElementById('topic').value;

  const res = await fetch('/api/generate',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({topic})
  });

  const data = await res.json();
  const list = document.getElementById('list');
  list.innerHTML='';

  data.items.forEach(item=>{
    const li = document.createElement('li');
    li.innerHTML = item.content + 
      ' <button onclick="approve('+item.id+')">Approve</button>';
    list.appendChild(li);
  });
}

async function approve(id){
  await fetch('/api/approve',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id})
  });
  alert('Approved & Posted');
}
