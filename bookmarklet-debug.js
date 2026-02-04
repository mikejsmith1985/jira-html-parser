javascript:(function(){
  console.log('[FP] Bookmarklet loaded');
  
  if(window.fpMS){
    alert('Already active!');
    return;
  }
  
  var w=window.fpMS={f:[],a:0};
  console.log('[FP] State initialized:', w);
  
  var eh=function(t){
    var d=document.createElement('div');
    d.textContent=t;
    return d.innerHTML;
  };
  
  var p=document.createElement('div');
  p.id='fpP';
  p.style.cssText='position:fixed;top:0;right:0;width:400px;height:100vh;background:white;box-shadow:-4px 0 12px rgba(0,0,0,0.3);z-index:999999;display:flex;flex-direction:column;font-family:Arial,sans-serif';
  p.innerHTML='<div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;color:white"><div style="display:flex;justify-content:space-between;align-items:center"><div><h2 style="margin:0;font-size:20px">🎯 Field Picker DEBUG</h2><p style="margin:8px 0 0;font-size:13px;opacity:0.9">Check browser console for logs</p></div><button id="fpX" style="background:rgba(255,255,255,0.2);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:24px;line-height:1;padding:0">&times;</button></div></div><div style="padding:16px;background:#f8f9fa;border-bottom:2px solid #e2e8f0"><button id="fpA" style="width:100%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;padding:14px;border-radius:8px;cursor:pointer;font-weight:600">🚀 Activate</button></div><div style="flex:1;overflow-y:auto;padding:16px"><div style="font-weight:600;margin-bottom:12px">Selected: <span id="fpC">0</span></div><div id="fpL"><div style="text-align:center;padding:40px 20px;color:#7f8c8d"><div style="font-size:48px;margin-bottom:12px">📋</div><div>No fields</div></div></div></div><div style="padding:16px;border-top:2px solid #e2e8f0;background:#f8f9fa"><button id="fpJ" disabled style="width:100%;background:#3498db;color:white;border:none;padding:14px;border-radius:8px;cursor:pointer;font-weight:600;opacity:0.5">📋 Copy JSON</button></div>';
  
  document.body.appendChild(p);
  console.log('[FP] Panel added to DOM');
  
  var b=document.createElement('div');
  b.id='fpB';
  b.style.cssText='position:fixed;top:0;left:50%;transform:translateX(-50%);background:#27ae60;color:white;padding:12px 24px;border-radius:0 0 8px 8px;z-index:999998;font-weight:600;display:none';
  b.textContent='🎯 Active - Click fields (ESC to stop)';
  document.body.appendChild(b);
  console.log('[FP] Banner added to DOM');
  
  var upd=function(){
    console.log('[FP] Update UI, fields count:', w.f.length);
    document.getElementById('fpC').textContent=w.f.length;
    var j=document.getElementById('fpJ');
    j.disabled=w.f.length===0;
    j.style.opacity=w.f.length?'1':'0.5';
    
    var l=document.getElementById('fpL');
    if(!w.f.length){
      l.innerHTML='<div style="text-align:center;padding:40px 20px;color:#7f8c8d"><div style="font-size:48px;margin-bottom:12px">📋</div><div>No fields</div></div>';
    }else{
      l.innerHTML=w.f.map(function(f,i){
        return'<div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:12px;border-left:4px solid #667eea"><div style="font-weight:600;font-size:14px">'+eh(f.label||f.id)+'</div><div style="font-size:12px;color:#7f8c8d">ID: '+eh(f.id)+'</div></div>';
      }).join('');
    }
    
    var a=document.getElementById('fpA');
    if(w.a){
      a.textContent='⏸️ Active (ESC)';
      a.style.background='#95a5a6';
      a.disabled=1;
      document.body.style.cursor='crosshair';
      b.style.display='block';
      console.log('[FP] Activated');
    }else{
      a.textContent='🚀 Activate';
      a.style.background='linear-gradient(135deg,#667eea,#764ba2)';
      a.disabled=0;
      document.body.style.cursor='';
      b.style.display='none';
      console.log('[FP] Deactivated');
    }
  };
  
  var act=function(){
    if(w.a) return;
    w.a=1;
    console.log('[FP] ACTIVATING - event listener will be attached');
    upd();
  };
  
  var deact=function(){
    if(!w.a) return;
    w.a=0;
    console.log('[FP] DEACTIVATING');
    upd();
  };
  
  var close=function(){
    console.log('[FP] Closing');
    if(w.f.length&&!confirm('Close without saving? '+w.f.length+' field(s) will be lost.'))return;
    p.remove();
    b.remove();
    document.removeEventListener('click',clk,true);
    document.body.style.cursor='';
    delete window.fpMS;
  };
  
  var clk=function(e){
    console.log('[FP] Click event fired!', {
      active: w.a,
      target: e.target,
      tagName: e.target.tagName,
      closestPanel: e.target.closest('#fpP'),
      closestBanner: e.target.closest('#fpB')
    });
    
    if(!w.a){
      console.log('[FP] Not active, ignoring click');
      return;
    }
    
    if(e.target.closest('#fpP')||e.target.closest('#fpB')){
      console.log('[FP] Click on panel/banner, ignoring');
      return;
    }
    
    var f=e.target.matches('input,select,textarea')?e.target:e.target.closest('input,select,textarea');
    console.log('[FP] Found field:', f);
    
    if(!f){
      console.log('[FP] No field found, returning');
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    console.log('[FP] Prevented default, extracting field...');
    
    var id=f.id||f.name||f.getAttribute('aria-labelledby')||f.getAttribute('data-element');
    console.log('[FP] Field ID:', id);
    
    if(!id){
      alert('No ID found!');
      return;
    }
    
    if(w.f.some(function(x){return x.id===id})){
      console.log('[FP] Field already captured');
      var o=f.style.background;
      f.style.background='#e74c3c';
      setTimeout(function(){f.style.background=o;},300);
      return;
    }
    
    var lbl=id;
    var al=f.getAttribute('aria-labelledby');
    if(al){
      var le=document.getElementById(al);
      if(le)lbl=le.textContent.trim();
    }else{
      var lf=document.querySelector('label[for="'+f.id+'"]');
      if(lf)lbl=lf.textContent.trim();
    }
    lbl=lbl.replace(/[*:]/g,'').replace(/\s*(Required|Mandatory)\s*/gi,'').trim();
    
    var ft=f.type||'text';
    var req=f.required||f.getAttribute('aria-required')==='true';
    
    console.log('[FP] Adding field:', {id:id, label:lbl, fieldType:ft, required:req});
    w.f.push({id:id,label:lbl,fieldType:ft,required:req,options:[]});
    
    var o=f.style.background;
    f.style.background='#27ae60';
    setTimeout(function(){f.style.background=o;},300);
    
    upd();
  };
  
  var esc=function(e){
    if(e.key==='Escape'){
      console.log('[FP] ESC pressed');
      deact();
    }
  };
  
  console.log('[FP] Attaching event listeners...');
  document.addEventListener('click',clk,true);
  document.addEventListener('keydown',esc);
  console.log('[FP] Event listeners attached');
  
  document.getElementById('fpA').onclick=act;
  document.getElementById('fpX').onclick=close;
  
  document.getElementById('fpJ').onclick=function(){
    if(!w.f.length){alert('No fields!');return;}
    var json=JSON.stringify(w.f,null,2);
    console.log('[FP] Copying JSON:', json);
    navigator.clipboard.writeText(json).then(function(){
      var btn=document.getElementById('fpJ');
      var orig=btn.textContent;
      btn.textContent='✓ Copied!';
      setTimeout(function(){btn.textContent=orig;},2000);
    }).catch(function(err){
      alert('Copy failed! Check console.');
      console.error('[FP] Copy failed:', err);
    });
  };
  
  upd();
  console.log('[FP] Initialization complete!');
})();
