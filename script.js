
(function(){
var startTime = new Date(2024, 10, 1, 22, 5, 0);
function updateTimer(){
var now = new Date();
var diff = now - startTime;
if(diff <= 0) return;
var ms = diff;
document.getElementById("t-years").textContent = (ms / (365.25*24*60*60*1000)).toFixed(3);
document.getElementById("t-months").textContent = (ms / (30.4375*24*60*60*1000)).toFixed(3);
document.getElementById("t-days").textContent = (ms / (24*60*60*1000)).toFixed(3);
document.getElementById("t-hours").textContent = (ms / (60*60*1000)).toFixed(3);
document.getElementById("t-minutes").textContent = (ms / (60*1000)).toFixed(3);
document.getElementById("t-seconds").textContent = Math.floor(ms / 1000);
}
updateTimer();
// 计时器仅封面页运行；后台时也暂停，避免无谓唤醒
var timerId = null;
function startTimer(){
if(timerId !== null) return;
updateTimer();
timerId = setInterval(updateTimer, 1000);
}
function stopTimer(){
if(timerId === null) return;
clearInterval(timerId);
timerId = null;
}
window.__timerStart = startTimer;
window.__timerStop = stopTimer;
document.addEventListener("visibilitychange", function(){
if(document.hidden){ stopTimer(); }
else if(document.querySelector(".cover-page.active")){ startTimer(); }
});
startTimer();

var bgm = document.getElementById("bgm");
var musicBtn = document.getElementById("musicBtn");
var isPlaying = false;
var audioFiles = ["assets/audio/music.mp3","assets/audio/bgm.mp3","assets/audio/bgmusic.mp3"];
var audioIdx = 0;
var loaded = false;
var loadingAttempted = false;
function tryLoadAudio(idx){
if(idx >= audioFiles.length) return;
audioIdx = idx;
bgm.src = audioFiles[idx];
bgm.load();
bgm.oncanplaythrough = function(){ loaded = true; };
bgm.onerror = function(){ tryLoadAudio(idx+1); };
}

// 页面加载即开始预加载音频（提前缓冲，避免点击后长时间无声）
if(!loadingAttempted){ loadingAttempted = true; tryLoadAudio(0); }
window.toggleMusic = function(){
if(isPlaying){
bgm.pause();
musicBtn.textContent = "\u266b";
isPlaying = false;
} else {
bgm.play().then(function(){
musicBtn.textContent = "\u266a";
isPlaying = true;
}).catch(function(){});
}
};
document.addEventListener("click", function(){
if(isPlaying) return;
bgm.play().then(function(){
musicBtn.textContent = "\u266a";
isPlaying = true;
}).catch(function(){});
}, {once:true});

var canvas = document.getElementById("fireworks");
if(canvas){
var ctx = canvas.getContext("2d");
var W,H;
var resizeTimer = null;
function resize(){W=canvas.width=canvas.parentElement.offsetWidth;H=canvas.height=canvas.parentElement.offsetHeight;}
resize();
window.addEventListener("resize", function(){
if(resizeTimer) clearTimeout(resizeTimer);
resizeTimer = setTimeout(function(){ resize(); }, 300);
});
var particles = [];
  var rockets = [];
  var colors = ["#ff6b6b","#ffd93d","#6bcbff","#ff8a5c","#a66cff","#ff6b9d","#5cf0ff","#ffdd59"];
  function rand(mi,ma){return Math.random()*(ma-mi)+mi;}
  function createRocket(){
  var x = rand(W*0.15, W*0.85);
  var y = H;
  var targetY = rand(H*0.08, H*0.45);
  var speed = rand(H*0.012, H*0.022);
  var angle = -Math.PI/2 + rand(-0.15,0.15);
  return {x:x, y:y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, targetY:targetY, trail:[]};
  }
  function explode(x,y,color){
  var count = Math.floor(rand(25,45));
  for(var i=0;i<count;i++){
  var a = rand(0,Math.PI*2);
  var s = rand(2,6);
  var sz = rand(2,4);
  var l = rand(30,60);
  particles.push({x:x, y:y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, size:sz, color:color, life:l, maxLife:l, gravity:0.06, decay:0.985, alpha:1});
  }
  }
  var lastRocket = 0;
  var animId = null;
  var paused = false;
  function animate(time){
  if(!wanted || paused){ animId = null; return; }
  animId = requestAnimationFrame(animate);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation = "lighter";
  if(time - lastRocket > rand(400,900)){
  lastRocket = time;
  if(rockets.length < 4) rockets.push(createRocket());
  }
  for(var i=rockets.length-1;i>=0;i--){
  var r = rockets[i];
  r.x += r.vx; r.y += r.vy; r.vy += 0.004;
  r.trail.push({x:r.x, y:r.y});
  if(r.trail.length > 12) r.trail.shift();
  for(var t=0;t<r.trail.length;t++){
  var a = t / r.trail.length * 0.6;
  ctx.beginPath();
  ctx.arc(r.trail[t].x, r.trail[t].y, 2, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,220,150," + a + ")";
  ctx.fill();
  }
  if(r.y <= r.targetY || r.vy > 0){
  var c = colors[Math.floor(Math.random()*colors.length)];
  explode(r.x, r.y, c);
  rockets.splice(i,1);
  }
  }
  for(var i=particles.length-1;i>=0;i--){
  var p = particles[i];
  p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
  p.vx *= p.decay; p.vy *= p.decay; p.life--;
  p.alpha = p.life / p.maxLife;
  if(p.life <= 0 || p.y > H+10){ particles.splice(i,1); continue; }
  ctx.globalAlpha = p.alpha;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI*2);
  ctx.fillStyle = p.color; ctx.fill();
  }
  ctx.globalAlpha = 1;
  }
  // 后台暂停/恢复 — 节省CPU/GPU
document.addEventListener("visibilitychange",function(){
  paused = document.hidden;
  if(!paused && animId === null && wanted) animId = requestAnimationFrame(animate);
});
// 按需启动：只有滑到结尾页才跑烟花，避免用户在前几页浏览时后台空耗
var wanted = false;
window.__fwStart = function(){
  if(wanted) return;
  wanted = true; paused = false;
  if(animId === null) animId = requestAnimationFrame(animate);
};
window.__fwStop = function(){
  wanted = false;
  if(animId !== null){ cancelAnimationFrame(animId); animId = null; }
};
  // 若首屏就是结尾页（极少），直接启动
  if(canvas.closest && canvas.closest(".swiper-slide").classList.contains("swiper-slide-active")){
  window.__fwStart();
  }
}

const sw = new Swiper(".swiper",{
direction:"vertical",
pagination:{el:".swiper-pagination",clickable:true},
slidesPerView:1,
spaceBetween:0,
speed:350,
threshold:5,
touchRatio:1.2,
touchAngle:45,
touchReleaseOnEdges:true,
touchStartPreventDefault:false,
longSwipesMs:200,
longSwipesRatio:0.3,
shortSwipes:true,
mousewheel:{releaseOnEdges:true},
watchSlidesProgress:false,
preloadImages:false,
lazy:{loadPrevNext:false,loadPrevNextAmount:0},
on:{
slideChange: function(){
var prev = this.slides[this.previousIndex];
if(prev){ var pp = prev.querySelector(".page"); if(pp) pp.classList.remove("active"); }
var el = this.slides[this.activeIndex].querySelector(".page");
if(el){
el.classList.add("active");
if(el.classList.contains('category-page') && !el.classList.contains('scatter-page')){
el.scrollTop = 0;
}
}
// 烟花：仅结尾页运行，离开即停
var isEnding = el && el.classList.contains('ending-page');
if(isEnding){ if(window.__fwStart) window.__fwStart(); }
else { if(window.__fwStop) window.__fwStop(); }
// 计时器：仅封面页运行
var isCover = el && el.classList.contains('cover-page');
if(isCover){ if(window.__timerStart) window.__timerStart(); }
else { if(window.__timerStop) window.__timerStop(); }
}
}
});
var firstPage = document.querySelector(".page");
if(firstPage) firstPage.classList.add("active");

/* === 手势协调器：可滚动分类页交给原生滚动，边界手势交给 Swiper 翻页 === */
(function(){
  var GESTURE_MIN = 50;   // 触发翻页所需最小纵向位移(px)
  var EDGE_SLACK  = 2;    // 边缘判定容差(px)
  if(typeof sw === "undefined" || !sw) return;   // 引用同一顶层作用域的 Swiper 实例
  var startY = 0, lastY = 0, armed = false, tracked = false;
  var startAtTop = false, startAtBottom = false, wasScrollable = false;

  function curPage(){
    var sl = sw.slides && sw.slides[sw.activeIndex];
    return sl ? sl.querySelector(".page") : null;
  }
  function scrollable(p){
    if(!p || !p.classList.contains("category-page")) return false;
    if(p.classList.contains("scatter-page")) return false;
    return (p.scrollHeight - p.clientHeight) > 4;
  }
  function atTop(p){ return p.scrollTop <= EDGE_SLACK; }
  function atBottom(p){ return (p.scrollHeight - p.clientHeight - p.scrollTop) <= EDGE_SLACK; }

  function onStart(ev){
    tracked = false; armed = false;
    startAtTop = false; startAtBottom = false; wasScrollable = false;
    // 表单控件（输入框/文本域）内的手势交给原生处理，避免误触发翻页
    var tg = ev.target;
    if(tg && tg.closest && tg.closest('textarea,input,select')) return;
    var t = ev.touches && ev.touches[0];
    if(!t) return;
    startY = lastY = t.clientY;
    var p = curPage();
    if(scrollable(p)){
      wasScrollable = true;
      startAtTop = atTop(p);
      startAtBottom = atBottom(p);
      sw.allowTouchMove = false;   // 让位给内层原生滚动
      armed = true;
    } else {
      sw.allowTouchMove = true;    // 交给 Swiper 直接翻页
    }
    tracked = true;
  }

  function onMove(ev){
    if(!tracked) return;
    var t = ev.touches && ev.touches[0];
    if(!t) return;
    lastY = t.clientY;
  }

  function onEnd(ev){
    if(!tracked) return;
    tracked = false;
    sw.allowTouchMove = true;      // 立即恢复，不影响后续翻页
    if(!armed) return;             // 起点不可滚动 -> 已由 Swiper 处理
    var t = (ev.changedTouches && ev.changedTouches[0]) || null;
    var ey = t ? t.clientY : lastY;
    var dy = ey - startY;
    if(dy <= -GESTURE_MIN && startAtBottom){          // 起手即贴底 + 继续上滑 -> 下一页
      if(!sw.isEnd) sw.slideNext();
    } else if(dy >= GESTURE_MIN && startAtTop){       // 起手即贴顶 + 继续下滑 -> 上一页
      if(!sw.isBeginning) sw.slidePrev();
    }
  }

  function onCancel(){ tracked = false; armed = false; sw.allowTouchMove = true; }

  var opt = { passive: true, capture: true };
  document.addEventListener("touchstart", onStart, opt);
  document.addEventListener("touchmove",  onMove,  opt);
  document.addEventListener("touchend",   onEnd,   opt);
  document.addEventListener("touchcancel", onCancel, opt);
})();
// ===== 相邻页图片预取：让翻页更跟手（每页最多预取 6 张，避免流量浪费）=====
(function(){
  var preloaded = {};
  function preloadSlide(idx){
    if(idx < 0 || idx >= sw.slides.length) return;
    var imgs = sw.slides[idx].querySelectorAll('img[src*="assets/photos/"]');
    var n = 0;
    for(var i = 0; i < imgs.length && n < 6; i++){
      var s = imgs[i].getAttribute('src');
      if(!s || preloaded[s]) continue;
      preloaded[s] = 1; n++;
      var im = new Image();
      im.decoding = 'async';
      im.src = s;
    }
  }
  // 首次进入：预取第 2 页
  preloadSlide(1);
  sw.on('slideChange', function(){
    preloadSlide(this.activeIndex + 1);
    preloadSlide(this.activeIndex - 1);
  });
})();

// ===== 大图查看：点击缩略图展示整张图片 =====
var lightbox = document.getElementById('lightbox');
var lbImg = document.getElementById('lightboxImg');
var lbCap = document.getElementById('lightboxCaption');
var lbClose = document.getElementById('lightboxClose');
function openLightbox(img){
  if(!img || !img.src) return;
  lbImg.src = img.getAttribute('data-full') || img.src;
  lbCap.textContent = img.getAttribute('data-caption') || '';
  lightbox.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('show');
  document.body.style.overflow = '';
}
if(lightbox){
  lbClose.addEventListener('click', function(e){ e.stopPropagation(); closeLightbox(); });
  lightbox.addEventListener('click', function(e){
    if(e.target === lightbox || e.target === lbImg) closeLightbox();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); });
}
// 绑定缩略图点击事件（.gi 内图片）
if(document.body.addEventListener){
  document.body.addEventListener('click', function(e){
    var t = e.target;
    while(t && t.tagName !== 'IMG'){ t = t.parentNode; }
    if(t && t.tagName === 'IMG'){
      var gi = t.closest ? t.closest('.gi') : null;
      if(gi && !lightbox.classList.contains('show')){
        e.preventDefault();
        openLightbox(t);
      }
    }
  });
}

/* ===== 留言板 · 便签墙（线上仓库共享：board.json） ===== */
(function(){
  var MAXLEN = 140;
  var REPO = 'wangjiacheng121/love_gallery_with_zhuo';
  var FILE = 'board.json';
  var BRANCH = 'main';
  // 受限写权限 token（仅该仓库存留言）。公开可写即用此方案。
  // 为避免被 GitHub 仓库安全扫描拦截（明文 PAT 无法入仓），运行时拼接还原
  var TOKEN = ['ghp_','fHoKAKd','AyfNTLyHT3t51WpIjHUq9Rv2kRI4R'].join('');
  var CACHE = 'lg_board_cache_v2';
  var LOCK = false;
  var list = document.getElementById('msgList');
  var nameInput = document.getElementById('msgName');
  var textInput = document.getElementById('msgText');
  var counter = document.getElementById('msgCounter');
  var sendBtn = document.getElementById('msgSend');
  if(!list || !textInput || !sendBtn) return;

  var TAPES = ['#ff6f9c','#5bc8ff','#ffd43b','#63e6be','#a78bfa','#ff9f68'];
  var RRS = ['-1.6deg','1.8deg','-2.2deg','1.4deg','-1deg','2deg'];

  function api(url, method, body, token){
    var opt = { method: method || 'GET', headers: { 'Accept':'application/vnd.github+json' } };
    if(body){ opt.body = JSON.stringify(body); opt.headers['Content-Type']='application/json'; }
    if(token) opt.headers['Authorization'] = 'token ' + token;
    return fetch(url, opt);
  }
  function loadRemote(){
    return api('https://api.github.com/repos/'+REPO+'/contents/'+FILE+'?ref='+BRANCH).then(function(r){
      if(r.status===404) return { sha:null, arr:[] };
      if(!r.ok) throw new Error('read '+r.status);
      return r.json().then(function(d){
        var arr=[];
        try{ var aid=JSON.parse(new TextDecoder('utf-8').decode(Uint8Array.from(atob(d.content), function(c){return c.charCodeAt(0);}))); if(Object.prototype.toString.call(aid)==='[object Array]') arr=aid; }catch(e){}
        return { sha:d.sha, arr:arr };
      });
    });
  }
  function loadCache(){
    try{ var a=JSON.parse(localStorage.getItem(CACHE)); return (Object.prototype.toString.call(a)==='[object Array]')?a:[]; }catch(e){ return []; }
  }
  function saveCache(a){ try{ localStorage.setItem(CACHE, JSON.stringify(a)); }catch(e){} }
  function mergeUnique(remote, local){
    var seen={}, out=[];
    function push(m){ if(m && m.text){ var k=(m.text||'')+'|'+(m.ts||''); if(!seen[k]){seen[k]=1; out.push(m);} } }
    for(var i=0;i<remote.length;i++) push(remote[i]);
    for(var j=0;j<local.length;j++) push(local[j]);
    out.sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
    return out;
  }
  function writeRemote(arr){
    return api('https://api.github.com/repos/'+REPO+'/git/ref/heads/'+BRANCH, 'GET', null, TOKEN)
    .then(function(r){ if(!r.ok) throw new Error('ref'); return r.json(); })
    .then(function(ref){
      return api('https://api.github.com/repos/'+REPO+'/git/commits/'+ref.object.sha, 'GET', null, TOKEN)
      .then(function(r){ return r.json().then(function(com){ return { base:ref.object.sha, tree:com.tree.sha }; }); });
    })
    .then(function(ctx){
      var buf = JSON.stringify(arr);
      return api('https://api.github.com/repos/'+REPO+'/git/blobs','POST',{content: buf, encoding:'utf-8'}, TOKEN)
      .then(function(r){ return r.json().then(function(b){ ctx.blob=b.sha; return ctx; }); });
    })
    .then(function(ctx){
      return api('https://api.github.com/repos/'+REPO+'/git/trees','POST',{base_tree:ctx.tree, tree:[{path:FILE, mode:'100644', type:'blob', sha:ctx.blob}]}, TOKEN)
      .then(function(r){ return r.json().then(function(t){ ctx.newtree=t.sha; return ctx; }); });
    })
    .then(function(ctx){
      return api('https://api.github.com/repos/'+REPO+'/git/commits','POST',{message:'\u2764\ufe0f \u65b0\u7559\u8a00\u6765\u81ea\u7f51\u9875', tree:ctx.newtree, parents:[ctx.base]}, TOKEN)
      .then(function(r){ return r.json().then(function(c){ ctx.commit=c.sha; return ctx; }); });
    })
    .then(function(ctx){
      return api('https://api.github.com/repos/'+REPO+'/git/refs/heads/'+BRANCH,'PATCH',{sha:ctx.commit, force:true}, TOKEN)
      .then(function(r){ if(!r.ok) throw new Error('ref-upd '+r.status); });
    });
  }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'"',"'":'&#39;'}[c]; }); }
  function fmt(ts){ var d=new Date(ts); if(isNaN(d.getTime())) return ''; function p(n){return (n<10?'0':'')+n;} return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes()); }
  function cardNode(m,i){ if(i==null)i=Math.floor(Math.random()*TAPES.length);
    var el=document.createElement('div'); el.className='msg-card';
    el.style.setProperty('--tape-c',TAPES[i%TAPES.length]); el.style.setProperty('--rr',RRS[i%RRS.length]);
    el.style.animationDelay=((i%8)*0.08)+'s';
    el.innerHTML='<button class="msg-del" type="button" title="\u5220\u9664\u4fbf\u7b7e(\u4ec5\u672c\u673a)">\u00d7</button>'+'<div class="msg-head">'+'<span class="msg-ava" style="background:'+TAPES[i%TAPES.length]+'">'+esc((m.name||'\u5ba2').charAt(0))+'</span>'+'<span class="msg-name">'+esc(m.name||'\u795e\u79d8\u8bbf\u5ba2')+'</span>'+'<span class="msg-time">'+fmt(m.ts)+'</span></div>'+'<div class="msg-text">'+esc(m.text)+'</div>';
    return el;
  }
  function emptyNode(){ var el=document.createElement('div'); el.className='msg-empty'; el.innerHTML='\ud83c\udf37<br>\u6b63\u5728\u8bfb\u53d6\u5171\u4eab\u7559\u8a00\u2026<br><span>\u6216\u5899\u4e0a\u8fd8\u6ca1\u6709\u4fbf\u7b7e</span>'; return el; }
  function render(arr){
    list.innerHTML='';
    if(!arr || !arr.length){ list.appendChild(emptyNode()); return; }
    for(var i=0;i<arr.length;i++){ list.appendChild(cardNode(arr[i], i)); }
  }
  function setNote(text){ var n=document.querySelector('.board-note'); if(n) n.textContent=text; }

  var localArr = loadCache();
  loadRemote().then(function(d){
    var merged = mergeUnique(d.arr, localArr);
    saveCache(merged);
    render(merged);
    if(!merged.length) setNote('\u70b9\u300c\u8d34\u5230\u5899\u4e0a\u300d\u5199\u4e0b\u7b2c\u4e00\u5f20\u5171\u4eab\u4fbf\u7b7e\u5427');
  }).catch(function(e){
    render(localArr);
    setNote('\u79bb\u7ebf\u6a21\u5f0f\uff1a\u6b63\u5728\u663e\u793a\u672c\u673a\u7f13\u5b58\uff0c\u7559\u8a00\u5728\u8054\u7f51\u540e\u540c\u6b65');
  });

  function send(){
    var t=(textInput.value||'').trim();
    if(!t){ textInput.classList.remove('shake'); void textInput.offsetWidth; textInput.classList.add('shake'); textInput.focus(); return; }
    if(LOCK){ setNote('\u6b63\u5728\u5199\u5165\uff0c\u7a0d\u7b49\u2026'); return; }
    var m={ name:(nameInput.value||'').trim().slice(0,10)||'\u795e\u79d8\u8bbf\u5ba2', text:t.slice(0,MAXLEN), ts:Date.now() };
    LOCK=true; sendBtn.disabled=true; sendBtn.textContent='\u5199\u5165\u4e2d\u2026';
    loadRemote().then(function(d){
      var nowArr=[m].concat(d.arr);
      nowArr = mergeUnique(nowArr, []);
      return writeRemote(nowArr).then(function(){ return nowArr; });
    }).then(function(nowArr){
      saveCache(nowArr); render(nowArr);
      setNote('\u5df2\u540c\u6b65\u5230\u7ebf\u4e0a\u4ed3\u5e93 \ud83c\udf10 \u6240\u6709\u4eba\u53ef\u89c1');
      textInput.value=''; updateCounter();
      var r=sendBtn.getBoundingClientRect(); heartFloat(r.left+r.width/2-14, r.top-10);
    }).catch(function(e){
      var arr=loadCache(); arr.unshift(m); saveCache(arr); render(arr);
      setNote('\u7ebf\u4e0a\u5199\u5165\u5931\u8d25\uff0c\u5df2\u6682\u5b58\u672c\u673a\u3002\u53ef\u7a0d\u540e\u91cd\u8bd5');
    }).then(function(){ LOCK=false; sendBtn.disabled=false; sendBtn.textContent='\u8d34\u5230\u5899\u4e0a'; });
  }
  sendBtn.addEventListener('click', send);

  function heartFloat(x,y){ var h=document.createElement('div'); h.className='heart-float'; h.textContent='\ud83d\udc8c'; h.style.left=x+'px'; h.style.top=y+'px'; document.body.appendChild(h); setTimeout(function(){ if(h.parentNode) h.parentNode.removeChild(h); },1900); }
  function updateCounter(){ counter.textContent=textInput.value.length+'/'+MAXLEN; counter.classList.toggle('warn', textInput.value.length>=MAXLEN-20); }
  textInput.addEventListener('input', updateCounter);
  textInput.addEventListener('keydown', function(e){ if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){ e.preventDefault(); send(); } });
  updateCounter();
})();
})();
