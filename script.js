
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
setInterval(updateTimer, 100);

var bgm = document.getElementById("bgm");
var musicBtn = document.getElementById("musicBtn");
var isPlaying = false;
var audioFiles = ["assets/audio/music.mp3","assets/audio/bgm.mp3","assets/audio/bgmusic.mp3"];
var loaded = false;
function tryLoadAudio(idx){
if(idx >= audioFiles.length) return;
bgm.src = audioFiles[idx];
bgm.load();
bgm.oncanplaythrough = function(){ loaded = true; };
bgm.onerror = function(){ tryLoadAudio(idx+1); };
}
tryLoadAudio(0);
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
function resize(){W=canvas.width=canvas.parentElement.offsetWidth;H=canvas.height=canvas.parentElement.offsetHeight;}
resize();
window.addEventListener("resize", resize);
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
var count = Math.floor(rand(50,90));
for(var i=0;i<count;i++){
var a = rand(0,Math.PI*2);
var s = rand(2,8);
var sz = rand(2,5);
var l = rand(40,90);
particles.push({x:x, y:y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, size:sz, color:color, life:l, maxLife:l, gravity:0.06, decay:0.985, alpha:1});
}
}
var lastRocket = 0;
function animate(time){
requestAnimationFrame(animate);
ctx.globalCompositeOperation = "destination-out";
ctx.fillStyle = "rgba(0,0,0,0.18)";
ctx.fillRect(0,0,W,H);
ctx.globalCompositeOperation = "lighter";
if(time - lastRocket > rand(200,600)){
lastRocket = time;
if(rockets.length < 5) rockets.push(createRocket());
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
ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.fill();
ctx.shadowBlur = 0;
}
ctx.globalAlpha = 1;
}
requestAnimationFrame(animate);
}

const sw = new Swiper(".swiper",{
direction:"vertical",
pagination:{el:".swiper-pagination",clickable:true},
slidesPerView:1,
spaceBetween:0,
touchReleaseOnEdges:true,
mousewheel:{releaseOnEdges:true},
keyboard:true,
watchSlidesProgress:false,
preloadImages:false,
lazy:{loadPrevNext:false,loadPrevNextAmount:0},
on:{
slideChange: function(){
document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active")});
var el = this.slides[this.activeIndex].querySelector(".page");
if(el){ void el.offsetWidth; el.classList.add("active"); if(el.classList.contains('category-page') && !el.classList.contains('scatter-page')){ el.scrollTop = 0; } }
}
}
});
var firstPage = document.querySelector(".page");
if(firstPage) firstPage.classList.add("active");

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