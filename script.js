
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
window.toggleMusic = function(){
if(!loadingAttempted){ loadingAttempted = true; tryLoadAudio(0); }
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
if(!loaded || isPlaying) return;
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
  if(canvas.closest && canvas.closest(".swiper-slide") === document.querySelector(".swiper-slide:last-child")){
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
})();