/**
 * seasonal-themes.js v2 — r/MemeExchangeCommunism
 * ═══════════════════════════════════════════════════
 * Usage: <html data-seasonal-theme="Christmas">
 *        <script src="seasonal-themes.js"></script>
 *
 * Themes: Pride · Christmas · Halloween · 420 · NewYear
 *         Valentines · StPatricks · Easter · Thanksgiving
 *         Summer · Diwali · MidAutumn · BonfireNight · Anniversary
 */
(function () {
'use strict';

var raw   = document.documentElement.getAttribute('data-seasonal-theme') || '';
var theme = raw.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
if (!theme) return;

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function rnd(a,b){ return a + Math.random()*(b-a); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function qs(sel){ return document.querySelector(sel); }
function el(tag,cls,html){
  var e=document.createElement(tag);
  if(cls) e.className=cls;
  if(html) e.innerHTML=html;
  return e;
}
function css(txt){ var s=document.createElement('style'); s.textContent=txt; document.head.appendChild(s); return s; }

/* ══════════════════════════════════════════════════
   CANVAS SETUP — particle layer
══════════════════════════════════════════════════ */
var cvs = document.createElement('canvas');
cvs.id  = 'st-canvas';
cvs.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
document.body.appendChild(cvs);
var ctx = cvs.getContext('2d');
function resizeCvs(){ cvs.width=innerWidth; cvs.height=innerHeight; }
resizeCvs();
addEventListener('resize', resizeCvs);

/* Cursor canvas — on top of everything */
var ccvs = document.createElement('canvas');
ccvs.id  = 'st-cursor-canvas';
ccvs.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
document.body.appendChild(ccvs);
var cctx = ccvs.getContext('2d');
function resizeCcvs(){ ccvs.width=innerWidth; ccvs.height=innerHeight; }
resizeCcvs();
addEventListener('resize', resizeCcvs);

var mx=innerWidth/2, my=innerHeight/2;
addEventListener('mousemove',function(e){ mx=e.clientX; my=e.clientY; });

/* ══════════════════════════════════════════════════
   BANNER HELPER
══════════════════════════════════════════════════ */
function makeBanner(html, bg, color){
  var b = el('div','st-banner');
  b.style.cssText =
    'position:relative;z-index:9998;display:flex;align-items:center;'+
    'justify-content:center;gap:12px;height:36px;'+
    'font-family:"Geist",system-ui,sans-serif;'+
    'font-size:.72rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase;'+
    'background:'+bg+';color:'+(color||'#fff')+';'+
    'text-shadow:0 1px 3px rgba(0,0,0,.3);overflow:hidden;';
  b.innerHTML = html;
  document.body.insertBefore(b, document.body.firstChild);
  return b;
}

/* ══════════════════════════════════════════════════
   CSS VARS INJECTION
══════════════════════════════════════════════════ */
function injectVars(vars, extra){
  var decl = Object.entries(vars).map(function(kv){ return kv[0]+':'+kv[1]; }).join(';');
  css('html[data-seasonal-theme]{'+decl+'}'+
      'html[data-seasonal-theme][data-theme="light"]{'+decl+'}'+(extra||''));
}

/* ══════════════════════════════════════════════════
   PARTICLE CONSTRUCTORS
══════════════════════════════════════════════════ */
var particles=[], cursorParticles=[];

/* Falling particle */
function FallP(chars,colors,opts){
  opts=opts||{};
  var spd=opts.speed||[0.5,1.4];
  this.reset=function(init){
    this.x    = rnd(0,cvs.width);
    this.y    = init ? rnd(-cvs.height,0) : rnd(-80,0);
    this.vy   = rnd(spd[0],spd[1]);
    this.vx   = rnd(-0.5,0.5);
    this.sz   = rnd(opts.minSz||12, opts.maxSz||24);
    this.ch   = pick(chars);
    this.col  = pick(colors);
    this.rot  = rnd(0,Math.PI*2);
    this.drot = rnd(-0.03,0.03);
    this.a    = rnd(0.5,0.9);
    this.wb   = rnd(0,Math.PI*2);
    this.wbs  = rnd(0.02,0.05);
  };
  this.update=function(){
    this.wb+=this.wbs;
    this.x+=this.vx+Math.sin(this.wb)*0.5;
    this.y+=this.vy;
    this.rot+=this.drot;
    if(this.y>cvs.height+60) this.reset(false);
  };
  this.draw=function(){
    ctx.save();
    ctx.globalAlpha=this.a;
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rot);
    ctx.font=this.sz+'px serif';
    ctx.fillStyle=this.col;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(this.ch,0,0);
    ctx.restore();
  };
  this.reset(true);
}

/* Rising particle */
function RiseP(chars,colors,opts){
  opts=opts||{};
  var spd=opts.speed||[0.5,1.2];
  this.reset=function(init){
    this.x  = rnd(0,cvs.width);
    this.y  = init ? rnd(0,cvs.height) : cvs.height+20;
    this.vy = -rnd(spd[0],spd[1]);
    this.sz = rnd(10,22);
    this.ch = pick(chars);
    this.col= pick(colors);
    this.a  = rnd(0.35,0.7);
    this.wb = rnd(0,Math.PI*2);
    this.wbs= rnd(0.02,0.05);
    this.rot=0; this.drot=0;
  };
  this.update=function(){
    this.wb+=this.wbs;
    this.x+=Math.sin(this.wb)*0.6;
    this.y+=this.vy;
    if(this.y<-40) this.reset(false);
  };
  this.draw=FallP.prototype.draw;
  this.reset(true);
}

function makeParticles(n,Ctor,chars,colors,opts){
  for(var i=0;i<n;i++) particles.push(new Ctor(chars,colors,opts));
}

/* ══════════════════════════════════════════════════
   CURSOR TRAIL SYSTEM
══════════════════════════════════════════════════ */
function TrailP(char,colors,maxAge){
  this.x=mx; this.y=my;
  this.vx=rnd(-1.5,1.5); this.vy=rnd(-2,0.5);
  this.sz=rnd(10,18);
  this.ch=char||'·';
  this.col=pick(colors);
  this.age=0; this.maxAge=maxAge||35;
  this.a=0.9;
  this.update=function(){ this.x+=this.vx; this.y+=this.vy; this.vy+=0.06; this.age++; this.a=Math.max(0,(this.maxAge-this.age)/this.maxAge*0.9); };
  this.draw=function(){
    cctx.save(); cctx.globalAlpha=this.a;
    cctx.font=this.sz+'px serif'; cctx.fillStyle=this.col;
    cctx.textAlign='center'; cctx.textBaseline='middle';
    cctx.fillText(this.ch,this.x,this.y); cctx.restore();
  };
  this.dead=function(){ return this.age>=this.maxAge; };
}

var trailTimer=0;
function spawnTrail(chars,colors,rate,maxAge){
  trailTimer++;
  if(trailTimer%(rate||2)===0){
    cursorParticles.push(new TrailP(pick(chars),colors,maxAge));
  }
}

/* ══════════════════════════════════════════════════
   MAIN ANIMATION LOOP
══════════════════════════════════════════════════ */
var extraDrawFns=[];

function loop(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  cctx.clearRect(0,0,ccvs.width,ccvs.height);
  for(var i=particles.length-1;i>=0;i--){ particles[i].update(); particles[i].draw(); }
  for(var j=cursorParticles.length-1;j>=0;j--){
    cursorParticles[j].update(); cursorParticles[j].draw();
    if(cursorParticles[j].dead()) cursorParticles.splice(j,1);
  }
  for(var k=0;k<extraDrawFns.length;k++) extraDrawFns[k]();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ══════════════════════════════════════════════════
   FIREWORK FACTORY (shared by NewYear/BonfireNight/Diwali)
══════════════════════════════════════════════════ */
function makeFirework(x,y,colors,shardCount){
  var fw={shards:[],dead:false};
  var count=shardCount||24;
  for(var i=0;i<count;i++){
    var ang=Math.PI*2*i/count;
    fw.shards.push({x:x,y:y,vx:Math.cos(ang)*rnd(1.5,5),vy:Math.sin(ang)*rnd(1.5,5),al:1,col:pick(colors)});
  }
  fw.update=function(){
    fw.shards.forEach(function(s){ s.x+=s.vx;s.y+=s.vy;s.vy+=0.05;s.al-=0.018; });
    fw.shards=fw.shards.filter(function(s){ return s.al>0; });
    if(!fw.shards.length) fw.dead=true;
  };
  fw.draw=function(){
    fw.shards.forEach(function(s){
      ctx.save();ctx.globalAlpha=s.al;ctx.fillStyle=s.col;
      ctx.beginPath();ctx.arc(s.x,s.y,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
    });
  };
  return fw;
}

/* ╔══════════════════════════════════════════════╗
   ║               T H E M E S                   ║
   ╚══════════════════════════════════════════════╝ */

/* ─────────────────────── 🏳️‍🌈 PRIDE ──────────────── */
if(theme==='pride'){
  var PCOLS=['#ff0018','#ff8c00','#ffff00','#008018','#0000f9','#86007d','#ff6b9d'];
  injectVars({'--orange':'#ff6b9d','--orange-soft':'rgba(255,107,157,.12)','--orange-line':'rgba(255,107,157,.28)'},
    '@keyframes st-rb{0%{background-position:0% 50%}100%{background-position:200% 50%}}'+
    'html[data-seasonal-theme] .kicker,html[data-seasonal-theme] .hero-eyebrow{'+
      'background:linear-gradient(90deg,#ff0018,#ff8c00,#ffff00,#008018,#0000f9,#86007d,#ff0018);'+
      'background-size:200%;animation:st-rb 3s linear infinite;'+
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;border:none !important;}'+
    'html[data-seasonal-theme] .hero-h1 .accent{'+
      'background:linear-gradient(90deg,#ff0018,#ff8c00,#ffff00,#008018,#0000f9,#86007d,#ff0018);'+
      'background-size:200%;animation:st-rb 3s linear infinite;'+
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'+
    /* animated rainbow border on nav */
    'html[data-seasonal-theme] .nav{border-bottom:2px solid transparent;'+
      'background:linear-gradient(var(--nav-bg,rgba(10,10,11,.88)),var(--nav-bg,rgba(10,10,11,.88))) padding-box,'+
      'linear-gradient(90deg,#ff0018,#ff8c00,#ffff00,#008018,#0000f9,#86007d) border-box;}'+
    /* rainbow scrollbar */
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ff0018,#ff8c00,#ffff00,#008018,#0000f9,#86007d);}'+
    'html[data-seasonal-theme] ::selection{background:#ff6b9d;color:#fff;}'
  );
  makeBanner('🏳️‍🌈 <span>Happy Pride Month!</span> ✊',
    'linear-gradient(90deg,#ff0018,#ffa52c,#ffff41,#008018,#0000f9,#86007d)','#fff');
  addEventListener('mousemove',function(){ spawnTrail(['♥','★','✦','✧'],PCOLS,1,45); });
  makeParticles(30,FallP,['♥','★','✦','✧','◆'],PCOLS,{speed:[0.4,1.0]});
}

/* ─────────────────────── 🎄 CHRISTMAS ──────────── */
if(theme==='christmas'){
  var SNOWCOLS=['#fff','#c8e6fa','#eaf4ff','#d0e8ff'];
  injectVars({'--orange':'#c8001d','--orange-soft':'rgba(200,0,29,.11)','--orange-line':'rgba(200,0,29,.28)','--green':'#1a9b1a','--gold':'#ffd700'},
    '@keyframes st-twinkle{0%,100%{opacity:.8}50%{opacity:.1}}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#c8001d;}'+
    'html[data-seasonal-theme] ::selection{background:#c8001d;color:#fff;}'+
    /* twinkling stars across hero */
    'html[data-seasonal-theme] .hero::after{content:"✦  ✧  ❅  ✦  ✧  ❅  ✦";'+
      'position:absolute;top:16px;left:0;right:0;text-align:center;'+
      'font-size:1rem;color:rgba(255,215,0,.45);letter-spacing:20px;'+
      'animation:st-twinkle 2.5s ease-in-out infinite;pointer-events:none;}'+
    /* snow pile bottom */
    'html[data-seasonal-theme] body::after{content:"";position:fixed;bottom:0;left:0;right:0;height:14px;'+
      'background:radial-gradient(ellipse 70% 100% at 50% 100%,rgba(255,255,255,.22) 0%,transparent 70%);'+
      'pointer-events:none;z-index:9996;}'
  );
  makeBanner('🎄 <span>Merry Christmas!</span> 🎅 🦌',
    'linear-gradient(90deg,#6b0000,#1a6b1a,#6b0000)');

  /* Ho Ho Ho easter egg on logo */
  var cLogo=qs('.nav-logo,.nav-logo-mark');
  if(cLogo) cLogo.addEventListener('click',function(e){
    e.preventDefault();
    var pop=el('div',''); pop.textContent='🎅 Ho Ho Ho! Merry Christmas!';
    pop.style.cssText='position:fixed;top:58px;left:50%;transform:translateX(-50%);'+
      'background:#8b0000;color:#fff;padding:10px 22px;border-radius:10px;white-space:nowrap;'+
      'font-family:"Geist",sans-serif;font-size:.85rem;font-weight:700;z-index:99999;'+
      'box-shadow:0 4px 20px rgba(200,0,29,.45);';
    document.body.appendChild(pop); setTimeout(function(){ pop.remove(); },3000);
  });

  addEventListener('mousemove',function(){ spawnTrail(['❄','❅','✦','*'],SNOWCOLS,2,40); });
  makeParticles(55,FallP,['❄','❅','·','*','✦'],SNOWCOLS,{speed:[0.4,1.1],minSz:10,maxSz:20});

  /* Twinkling star background layer */
  var stars=[];
  for(var s=0;s<60;s++) stars.push({x:rnd(0,3000),y:rnd(0,800),a:rnd(0,Math.PI*2),sz:rnd(6,14),col:pick(['#ffd700','#fff','#c8e6fa'])});
  extraDrawFns.push(function(){
    stars.forEach(function(s){ s.a+=0.05; var al=Math.abs(Math.sin(s.a))*0.5;
      ctx.save();ctx.globalAlpha=al;ctx.font=s.sz+'px serif';ctx.fillStyle=s.col;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',s.x%cvs.width,s.y%cvs.height);ctx.restore(); });
  });
}

/* ─────────────────────── 🎃 HALLOWEEN ──────────── */
if(theme==='halloween'){
  injectVars({'--orange':'#ff6a00','--orange-soft':'rgba(255,106,0,.12)','--orange-line':'rgba(255,106,0,.28)','--purple':'#c040ff','--green':'#39ff14'},
    'html[data-seasonal-theme] body{filter:saturate(.85);}'+
    'html[data-seasonal-theme] ::selection{background:#c040ff;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#ff6a00;}'+
    /* candle-flicker stats */
    '@keyframes st-flicker{0%,100%{opacity:1;transform:scale(1)}45%{opacity:.7;transform:scale(.98)}50%{opacity:.4;transform:scale(.96)}55%{opacity:.9;transform:scale(1.01)}}'+
    'html[data-seasonal-theme] .stat-n{animation:st-flicker '+rnd(3,5).toFixed(1)+'s ease-in-out infinite;}'+
    /* fog overlay */
    'html[data-seasonal-theme] body::before{content:"";position:fixed;bottom:0;left:0;right:0;height:200px;pointer-events:none;z-index:9994;'+
      'background:linear-gradient(to top,rgba(20,0,35,.4),transparent);}'
  );
  makeBanner('🎃 <span>Happy Halloween!</span> 👻 🦇',
    'linear-gradient(90deg,#0d0d0d,#2a0033,#0d0d0d)','#ff6a00');

  /* Ghost cursor */
  css('html[data-seasonal-theme] body{cursor:none;}');
  var ghost=el('div',''); ghost.textContent='👻';
  ghost.style.cssText='position:fixed;font-size:22px;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);';
  document.body.appendChild(ghost);
  addEventListener('mousemove',function(e){ ghost.style.left=e.clientX+'px'; ghost.style.top=e.clientY+'px'; });

  /* Spider webs */
  ['top:58px;left:0;transform:none;','top:58px;right:0;transform:scaleX(-1);'].forEach(function(pos){
    var web=el('div','');
    web.innerHTML='<svg width="110" height="110" viewBox="0 0 110 110" style="display:block" xmlns="http://www.w3.org/2000/svg">'+
      '<line x1="0" y1="0" x2="110" y2="110" stroke="#888" stroke-width=".8" opacity=".3"/>'+
      '<line x1="0" y1="0" x2="55" y2="110" stroke="#888" stroke-width=".8" opacity=".3"/>'+
      '<line x1="0" y1="0" x2="0" y2="110" stroke="#888" stroke-width=".8" opacity=".3"/>'+
      '<path d="M0 25 Q25 25 25 0" fill="none" stroke="#888" stroke-width=".8" opacity=".35"/>'+
      '<path d="M0 55 Q55 55 55 0" fill="none" stroke="#888" stroke-width=".8" opacity=".35"/>'+
      '<path d="M0 85 Q85 85 85 0" fill="none" stroke="#888" stroke-width=".8" opacity=".3"/>'+
      '<text x="5" y="108" font-size="14">🕷</text></svg>';
    web.style.cssText='position:fixed;'+pos+'pointer-events:none;z-index:9995;';
    document.body.appendChild(web);
  });

  addEventListener('mousemove',function(){ spawnTrail(['🦇','✦','·','*'],['#ff6a00','#c040ff','#fff'],3,30); });
  makeParticles(22,FallP,['🦇','🎃','👻','🕷','✦'],['#ff6a00','#c040ff','#fff'],{speed:[0.3,0.9]});
}

/* ─────────────────────── 🍃 4/20 ───────────────── */
if(theme==='420'){
  injectVars({'--orange':'#39c114','--orange-soft':'rgba(57,193,20,.11)','--orange-line':'rgba(57,193,20,.28)','--green':'#a8ff78','--gold':'#d4ff00'},
    'html[data-seasonal-theme] ::selection{background:#39c114;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#39c114;}'+
    /* everything slows down */
    'html[data-seasonal-theme] *{transition-duration:.7s !important;}'+
    /* soft vignette */
    'html[data-seasonal-theme] body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9994;'+
      'background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 55%,rgba(0,25,0,.22) 100%);}'
  );
  makeBanner('',
    'linear-gradient(90deg,#0a1f05,#1a3d0f,#0a1f05)','#a8ff78');

  addEventListener('mousemove',function(){ spawnTrail(['🍃','✦','·','❋'],['#39c114','#a8ff78','#d4ff00'],2,40); });

  /* Idle "stay chill" popup */
  var idleT;
  function resetIdle(){
    clearTimeout(idleT);
    idleT=setTimeout(function(){
      var pop=el('div',''); pop.textContent='😌 stay chill man...';
      pop.style.cssText='position:fixed;bottom:40px;right:40px;'+
        'background:#1a3d0f;color:#a8ff78;padding:12px 20px;border-radius:12px;'+
        'font-family:"Geist",sans-serif;font-size:.85rem;font-weight:600;'+
        'z-index:99999;border:1px solid rgba(168,255,120,.3);opacity:0;transition:opacity .5s;';
      document.body.appendChild(pop);
      setTimeout(function(){ pop.style.opacity='1'; },10);
      setTimeout(function(){ pop.style.opacity='0'; setTimeout(function(){ pop.remove(); },500); },4500);
    },15000);
  }
  addEventListener('mousemove',resetIdle); addEventListener('keydown',resetIdle); resetIdle();
  makeParticles(35,FallP,['🍃','🌿','✦','·','❋'],['#39c114','#a8ff78','#d4ff00','#2d7a14'],{speed:[0.2,0.7]});
}

/* ─────────────────────── 🎆 NEW YEAR ───────────── */
if(theme==='newyear'){
  var FWCOLS=['#ffd700','#c0c0c0','#ff4081','#40c4ff','#ff6d00','#64dd17'];
  injectVars({'--orange':'#ffd700','--orange-soft':'rgba(255,215,0,.12)','--orange-line':'rgba(255,215,0,.30)','--gold':'#ffd700','--purple':'#c0c0ff'},
    'html[data-seasonal-theme] ::selection{background:#ffd700;color:#000;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#ffd700;}'+
    '@keyframes st-gsh{0%{background-position:-200% 0}100%{background-position:200% 0}}'+
    'html[data-seasonal-theme] .heading{'+
      'background:linear-gradient(90deg,var(--tx,#f0f0f4) 30%,#ffd700 50%,#fff 60%,var(--tx,#f0f0f4) 70%);'+
      'background-size:200%;animation:st-gsh 4s linear infinite;'+
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'
  );

  /* Countdown banner */
  var jan1=new Date(new Date().getFullYear()+1,0,1);
  var diff=jan1-new Date(), bTxt;
  if(diff<7*24*60*60*1000){
    bTxt='🎆 <span id="st-cd"></span> until New Year! 🥂';
  } else { bTxt='🎆 <span>Happy New Year!</span> 🎇'; }
  makeBanner(bTxt,'linear-gradient(90deg,#0a0a14,#1a1a40,#0a0a14)','#ffd700');

  function updateCd(){
    var d=jan1-new Date(), cdEl=qs('#st-cd'); if(!cdEl) return;
    if(d<0){ cdEl.textContent='Happy New Year!'; return; }
    var dd=Math.floor(d/86400000),hh=Math.floor((d%86400000)/3600000),
        mm=Math.floor((d%3600000)/60000),ss=Math.floor((d%60000)/1000);
    cdEl.textContent=dd+'d '+hh+'h '+mm+'m '+ss+'s';
  }
  updateCd(); if(qs('#st-cd')) setInterval(updateCd,1000);

  /* Cursor trail */
  addEventListener('mousemove',function(){ spawnTrail(['✦','★','◆','·'],FWCOLS,2,40); });

  /* Firework launcher */
  var fws=[];
  function LaunchFW(){
    var tx=rnd(cvs.width*.1,cvs.width*.9), ty=rnd(cvs.height*.05,cvs.height*.45);
    var fw=makeFirework(tx,ty,FWCOLS,30);
    /* animate projectile first */
    var rx=rnd(cvs.width*.1,cvs.width*.9), ry=cvs.height;
    var progress=0, speed=rnd(6,12);
    var dist=Math.hypot(tx-rx,ty-ry);
    var steps=dist/speed;
    var proj={x:rx,y:ry,col:pick(FWCOLS),step:0,steps:Math.floor(steps),tx:tx,ty:ty};
    proj.update=function(){
      proj.step++;
      var t=proj.step/proj.steps;
      proj.x=rx+(tx-rx)*t; proj.y=ry+(ty-ry)*t;
    };
    proj.draw=function(){
      ctx.save();ctx.globalAlpha=0.85;ctx.fillStyle=proj.col;
      ctx.beginPath();ctx.arc(proj.x,proj.y,2,0,Math.PI*2);ctx.fill();ctx.restore();
    };
    proj.done=function(){ return proj.step>=proj.steps; };
    fws.push({proj:proj,fw:fw,exploded:false});
  }
  setInterval(function(){ if(fws.length<6) LaunchFW(); },900);
  extraDrawFns.push(function(){
    for(var i=fws.length-1;i>=0;i--){
      var item=fws[i];
      if(!item.exploded){
        item.proj.update(); item.proj.draw();
        if(item.proj.done()) item.exploded=true;
      } else {
        item.fw.update(); item.fw.draw();
        if(item.fw.dead) fws.splice(i,1);
      }
    }
  });

  /* Confetti */
  makeParticles(60,FallP,['✦','★','◆','●'],FWCOLS,{speed:[0.5,1.5]});
}

/* ─────────────────────── 💖 VALENTINES ─────────── */
if(theme==='valentines'){
  injectVars({'--orange':'#e8003e','--orange-soft':'rgba(232,0,62,.11)','--orange-line':'rgba(232,0,62,.28)','--green':'#ff80ab','--purple':'#f48fb1'},
    'html[data-seasonal-theme] ::selection{background:#e8003e;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#e8003e;}'+
    '@keyframes st-hb{0%,100%{transform:scale(1)}50%{transform:scale(1.028)}}'+
    'html[data-seasonal-theme] .mod-card:hover,html[data-seasonal-theme] .achievement:hover,html[data-seasonal-theme] .soc-card:hover{animation:st-hb .55s ease-in-out infinite;}'+
    /* pink vignette */
    'html[data-seasonal-theme] body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9994;'+
      'background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 62%,rgba(160,0,50,.15) 100%);}'
  );
  makeBanner('💖 <span>Happy Valentine\'s Day!</span> 💝',
    'linear-gradient(90deg,#5c0020,#9e0031,#5c0020)','#ffb3c8');

  addEventListener('mousemove',function(){ spawnTrail(['♥','♡','💕','❤'],['#e8003e','#ff80ab','#ffb3c8'],2,50); });

  /* Love meter */
  var loveClicks=0, lLogo=qs('.nav-logo,.nav-logo-mark');
  if(lLogo) lLogo.addEventListener('click',function(e){
    e.preventDefault();
    loveClicks=Math.min(100,loveClicks+Math.floor(rnd(8,18)));
    var pop=el('div','');
    pop.innerHTML='💖 Love meter: <strong>'+loveClicks+'%</strong> '+(loveClicks>80?'— Overflowing! 💞':loveClicks>50?'— Getting warm 💕':'— Warming up ❤');
    pop.style.cssText='position:fixed;top:58px;left:50%;transform:translateX(-50%);'+
      'background:#5c0020;color:#ffb3c8;padding:10px 22px;border-radius:10px;white-space:nowrap;'+
      'font-family:"Geist",sans-serif;font-size:.85rem;z-index:99999;'+
      'box-shadow:0 4px 20px rgba(232,0,62,.4);';
    document.body.appendChild(pop); setTimeout(function(){ pop.remove(); },3000);
  });
  makeParticles(32,FallP,['♥','♡','💕','✦'],['#e8003e','#ff80ab','#ffb3c8','#ff4081'],{speed:[0.4,1.0]});
}

/* ─────────────────────── ☘️ ST PATRICK'S ───────── */
if(theme==='stpatricks'){
  injectVars({'--orange':'#007a24','--orange-soft':'rgba(0,122,36,.11)','--orange-line':'rgba(0,122,36,.28)','--gold':'#ffd700','--green':'#00e676'},
    'html[data-seasonal-theme] ::selection{background:#007a24;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#007a24;}'+
    '@keyframes st-gsh2{0%,100%{box-shadow:0 0 0 0 rgba(0,122,36,0)}50%{box-shadow:0 0 18px 5px rgba(0,230,118,.28)}}'+
    'html[data-seasonal-theme] .hero-cta.solid,html[data-seasonal-theme] .nav-btn.primary{animation:st-gsh2 2.2s ease-in-out infinite;}'
  );
  makeBanner('☘️ <span>Happy St. Patrick\'s Day!</span> 🍀 🪙',
    'linear-gradient(90deg,#003d12,#007a24,#003d12)','#ffd700');

  /* Lucky % easter egg */
  var spLogo=qs('.nav-logo,.nav-logo-mark');
  if(spLogo) spLogo.addEventListener('click',function(e){
    e.preventDefault();
    var luck=Math.floor(rnd(1,101));
    var pop=el('div','');
    pop.textContent='☘️ Luck rating: '+luck+'% '+(luck>90?'— Leprechaun confirmed!':luck>60?'— Pretty lucky!':'— Find more clovers...');
    pop.style.cssText='position:fixed;top:58px;left:50%;transform:translateX(-50%);'+
      'background:#003d12;color:#ffd700;padding:10px 22px;border-radius:10px;white-space:nowrap;'+
      'font-family:"Geist",sans-serif;font-size:.85rem;font-weight:600;z-index:99999;'+
      'box-shadow:0 4px 20px rgba(0,122,36,.4);';
    document.body.appendChild(pop); setTimeout(function(){ pop.remove(); },3500);
  });

  /* Clover corners */
  ['top:58px;left:12px;','top:58px;right:12px;'].forEach(function(pos){
    var c=el('div',''); c.textContent='☘';
    c.style.cssText='position:fixed;'+pos+'font-size:2.2rem;pointer-events:none;z-index:9995;opacity:.2;';
    document.body.appendChild(c);
  });

  addEventListener('mousemove',function(){ spawnTrail(['🪙','☘','✦','·'],['#ffd700','#00e676','#007a24'],2,40); });
  makeParticles(28,FallP,['☘','🍀','✦','·','❋'],['#007a24','#00e676','#ffd700'],{speed:[0.4,1.1]});
}

/* ─────────────────────── 🐣 EASTER ─────────────── */
if(theme==='easter'){
  var ECOLS=['#c084fc','#f9a8d4','#86efac','#fde68a','#93c5fd'];
  injectVars({'--orange':'#f472b6','--orange-soft':'rgba(244,114,182,.11)','--orange-line':'rgba(244,114,182,.28)','--green':'#86efac','--gold':'#fde68a','--purple':'#c084fc'},
    'html[data-seasonal-theme] ::selection{background:#f472b6;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#c084fc,#f9a8d4,#86efac,#fde68a);}'+
    '@keyframes st-bounce{0%,100%{transform:translateY(-3px)}50%{transform:translateY(-9px)}}'+
    'html[data-seasonal-theme] .mod-card:hover,html[data-seasonal-theme] .achievement:hover{animation:st-bounce .5s ease-in-out infinite;}'
  );

  /* Egg hunt */
  var eggsFound=0;
  var eggPos=[{top:'38%',left:'4%'},{top:'62%',right:'3%'},{top:'22%',right:'7%'},{top:'78%',left:'7%'},{top:'50%',left:'93%'}];
  var eggChars=['🥚','🐣','🐰','🌸','🌷'];
  var bnr=makeBanner('🐣 <span>Happy Easter!</span> 🌸 &nbsp;<span id="st-eggs">🥚 Hidden eggs: find 5!</span>',
    'linear-gradient(90deg,#4a1c6e,#9d174d,#065f46)');

  eggPos.forEach(function(pos,i){
    var egg=el('div',''); egg.textContent=eggChars[i];
    egg.style.cssText='position:fixed;pointer-events:all;z-index:9995;cursor:pointer;'+
      'font-size:1.5rem;opacity:.45;transition:opacity .2s,transform .2s;'+
      Object.entries(pos).map(function(kv){ return kv[0]+':'+kv[1]; }).join(';');
    egg.addEventListener('mouseenter',function(){ this.style.opacity='1';this.style.transform='scale(1.35)'; });
    egg.addEventListener('mouseleave',function(){ this.style.opacity='.45';this.style.transform=''; });
    egg.addEventListener('click',function(){
      if(this.dataset.found) return;
      this.dataset.found='1'; this.style.opacity='0';
      eggsFound++;
      var eEl=qs('#st-eggs');
      if(eEl) eEl.textContent='🥚 Eggs found: '+eggsFound+' / 5'+(eggsFound===5?' — 🎉 All found!':'');
      if(eggsFound===5) for(var b=0;b<20;b++) particles.push(new FallP(['🥚','🌸','🌷','✦'],ECOLS,{speed:[1,2.5]}));
      setTimeout(function(){ egg.remove(); },400);
    });
    document.body.appendChild(egg);
  });

  addEventListener('mousemove',function(){ spawnTrail(['🌸','✦','·','❋'],ECOLS,2,45); });
  makeParticles(25,FallP,['🐣','🌸','🌷','✦','❋'],ECOLS,{speed:[0.4,1.0]});
}

/* ─────────────────────── 🦃 THANKSGIVING ───────── */
if(theme==='thanksgiving'){
  injectVars({'--orange':'#c85a00','--orange-soft':'rgba(200,90,0,.12)','--orange-line':'rgba(200,90,0,.28)','--gold':'#ffd18c','--green':'#8b5e3c'},
    'html[data-seasonal-theme] ::selection{background:#c85a00;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#c85a00;}'+
    'html[data-seasonal-theme] body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9994;'+
      'background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 50%,rgba(70,25,0,.18) 100%);}'
  );

  /* Gratitude meter */
  var gratitude=0;
  makeBanner('🦃 <span>Happy Thanksgiving!</span> &nbsp;<span id="st-grat">🙏 Click anywhere to add gratitude</span>',
    'linear-gradient(90deg,#1f0f00,#5a2d0a,#1f0f00)','#ffd18c');
  addEventListener('click',function(){
    gratitude=Math.min(100,gratitude+Math.floor(rnd(6,18)));
    var gEl=qs('#st-grat');
    if(gEl) gEl.textContent='🙏 Gratitude: '+gratitude+'%'+(gratitude>=100?' — Full of thanks! 🧡':'');
  });

  addEventListener('mousemove',function(){ spawnTrail(['🍂','🍁','·','✦'],['#c85a00','#ffd18c','#8b2500','#d4a017'],3,35); });

  /* Leaves with wind physics */
  function LeafP(){
    var spd=[0.6,1.6];
    this.reset=function(init){
      this.x=rnd(0,cvs.width); this.y=init?rnd(-cvs.height,0):-30;
      this.vy=rnd(spd[0],spd[1]); this.vx=rnd(-0.8,0.8);
      this.rot=rnd(0,Math.PI*2); this.drot=rnd(-0.04,0.04);
      this.sz=rnd(14,24); this.ch=pick(['🍂','🍁','🍃']);
      this.a=rnd(0.55,0.9); this.wb=rnd(0,Math.PI*2); this.wbs=rnd(0.025,0.055);
      this.wind=rnd(0,Math.PI*2);
    };
    this.update=function(){
      this.wb+=this.wbs; this.wind+=0.009;
      this.x+=this.vx+Math.sin(this.wind)*0.9+Math.sin(this.wb)*0.4;
      this.y+=this.vy; this.rot+=this.drot;
      if(this.y>cvs.height+40) this.reset(false);
    };
    this.draw=FallP.prototype.draw;
    this.reset(true);
  }
  for(var lf=0;lf<38;lf++) particles.push(new LeafP());
}

/* ─────────────────────── ☀️ SUMMER ─────────────── */
if(theme==='summer'){
  injectVars({'--orange':'#f77f00','--orange-soft':'rgba(247,127,0,.11)','--orange-line':'rgba(247,127,0,.28)','--gold':'#ffd60a','--green':'#00b4d8','--purple':'#0096c7'},
    'html[data-seasonal-theme] ::selection{background:#f77f00;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#f77f00,#00b4d8);}'+
    '@keyframes st-heat{0%,100%{filter:blur(0px)}50%{filter:blur(.35px)}}'+
    'html[data-seasonal-theme] .hero-h1{animation:st-heat 3.5s ease-in-out infinite;}'+
    '@keyframes st-wave{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}'+
    'html[data-seasonal-theme] body::after{content:"";position:fixed;bottom:0;left:0;width:200%;height:28px;'+
      'pointer-events:none;z-index:9994;'+
      'background:repeating-linear-gradient(90deg,transparent,transparent 38px,rgba(0,180,216,.2) 38px,rgba(0,180,216,.2) 76px);'+
      'animation:st-wave 7s linear infinite;}'
  );
  makeBanner('☀️ <span>Happy Summer!</span> 🌊 🏄',
    'linear-gradient(90deg,#0077b6,#00b4d8,#0096c7)');
  addEventListener('mousemove',function(){ spawnTrail(['☀','★','✦','·'],['#f77f00','#ffd60a','#00b4d8'],2,40); });
  makeParticles(20,RiseP,['☀','🌊','✦','·','◆'],['#f77f00','#ffd60a','#00b4d8','#90e0ef'],{speed:[0.4,1.1]});
}

/* ─────────────────────── 🪔 DIWALI ─────────────── */
if(theme==='diwali'){
  var DCOLS=['#ffd700','#ff8c00','#c040ff','#ff4081','#00e676','#40c4ff'];
  injectVars({'--orange':'#ff8c00','--orange-soft':'rgba(255,140,0,.12)','--orange-line':'rgba(255,140,0,.28)','--gold':'#ffd700','--purple':'#c040ff','--green':'#ff4081'},
    'html[data-seasonal-theme] ::selection{background:#ff8c00;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ff8c00,#c040ff,#ffd700);}'+
    '@keyframes st-diwaliglow{0%,100%{text-shadow:0 0 8px #ff8c00,0 0 20px #ff8c00}50%{text-shadow:0 0 25px #ffd700,0 0 50px #ffd700,0 0 70px #c040ff}}'+
    'html[data-seasonal-theme] .hero-h1{animation:st-diwaliglow 2.2s ease-in-out infinite;}'+
    'html[data-seasonal-theme] body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:9994;'+
      'background:radial-gradient(ellipse 80% 60% at 50% 100%,rgba(255,140,0,.09) 0%,transparent 60%);}'
  );
  makeBanner('🪔 <span>Happy Diwali — Festival of Lights!</span> ✨',
    'linear-gradient(90deg,#1a0a00,#3d1f00,#1a0a00)','#ffd700');

  /* Rangoli SVG overlay on hero */
  var hero=qs('.hero');
  if(hero){
    var rg=el('div','');
    rg.innerHTML='<svg viewBox="0 0 200 200" style="opacity:.07;width:240px;pointer-events:none" xmlns="http://www.w3.org/2000/svg">'+
      '<circle cx="100" cy="100" r="90" fill="none" stroke="#ffd700" stroke-width="1.5"/>'+
      '<circle cx="100" cy="100" r="68" fill="none" stroke="#ff8c00" stroke-width="1.5"/>'+
      '<circle cx="100" cy="100" r="46" fill="none" stroke="#c040ff" stroke-width="1.5"/>'+
      '<circle cx="100" cy="100" r="24" fill="rgba(255,215,0,.3)" stroke="#ffd700" stroke-width="2"/>'+
      '<polygon points="100,10 120,80 190,80 135,125 155,195 100,155 45,195 65,125 10,80 80,80" fill="none" stroke="#ff8c00" stroke-width="1.3"/>'+
      '</svg>';
    rg.style.cssText='position:absolute;right:50px;top:50%;transform:translateY(-50%);pointer-events:none;';
    hero.style.position='relative'; hero.appendChild(rg);
  }

  addEventListener('mousemove',function(){ spawnTrail(['✨','🪔','·','★'],DCOLS,2,45); });

  /* Diwali fireworks */
  var dfws2=[];
  setInterval(function(){ if(dfws2.length<7) dfws2.push(makeFirework(rnd(cvs.width*.1,cvs.width*.9),rnd(cvs.height*.05,cvs.height*.5),DCOLS,28)); },1100);
  extraDrawFns.push(function(){
    for(var i=dfws2.length-1;i>=0;i--){ dfws2[i].update();dfws2[i].draw(); if(dfws2[i].dead) dfws2.splice(i,1); }
  });

  /* Moon glow */
  extraDrawFns.push(function(){
    var gx=cvs.width-90, gy=90;
    var g=ctx.createRadialGradient(gx,gy,0,gx,gy,150);
    g.addColorStop(0,'rgba(255,215,0,.1)'); g.addColorStop(1,'rgba(255,215,0,0)');
    ctx.save();ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,150,0,Math.PI*2);ctx.fill();ctx.restore();
  });

  makeParticles(30,RiseP,['🪔','✨','★','✦'],DCOLS,{speed:[0.4,1.0]});
}

/* ─────────────────────── 🎑 MID-AUTUMN ─────────── */
if(theme==='midautumn'){
  injectVars({'--orange':'#f4a261','--orange-soft':'rgba(244,162,97,.11)','--orange-line':'rgba(244,162,97,.28)','--gold':'#ffd700','--green':'#e76f51','--purple':'#c77dff'},
    'html[data-seasonal-theme] ::selection{background:#f4a261;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#f4a261;}'+
    /* moon rise animation */
    '@keyframes st-moonrise{from{opacity:0;transform:translateY(25px)}to{opacity:.5;transform:translateY(0)}}'+
    'html[data-seasonal-theme] body::before{content:"🌕";position:fixed;top:65px;right:55px;'+
      'font-size:5rem;pointer-events:none;z-index:9994;'+
      'filter:drop-shadow(0 0 30px rgba(255,215,0,.55));'+
      'animation:st-moonrise 2.5s ease forwards;}'
  );
  makeBanner('🎑 <span>Happy Mid-Autumn Festival!</span> 🌕',
    'linear-gradient(90deg,#0d0a1a,#1a1030,#0d0a1a)','#ffd700');

  addEventListener('mousemove',function(){ spawnTrail(['🏮','✦','🌟','·'],['#f4a261','#ffd700','#c77dff'],2,50); });

  /* Moon glow canvas halo */
  extraDrawFns.push(function(){
    var gx=cvs.width-80, gy=110, gr=65;
    var g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr*3);
    g.addColorStop(0,'rgba(255,215,0,.14)'); g.addColorStop(1,'rgba(255,215,0,0)');
    ctx.save();ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,gr*3,0,Math.PI*2);ctx.fill();ctx.restore();
  });

  makeParticles(25,FallP,['🏮','🌕','✦','🍂'],['#f4a261','#ffd700','#c77dff'],{speed:[0.3,0.9]});
}

/* ─────────────────────── 🎇 BONFIRE NIGHT ──────── */
if(theme==='bonfirenight'){
  var BCOLS=['#ff4500','#ffb700','#ff6000','#ff0040','#fff','#ffa500'];
  injectVars({'--orange':'#ff4500','--orange-soft':'rgba(255,69,0,.12)','--orange-line':'rgba(255,69,0,.28)','--gold':'#ffb700','--green':'#ff6000','--purple':'#ff0040'},
    'html[data-seasonal-theme] ::selection{background:#ff4500;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#ff4500;}'+
    '@keyframes st-ember{0%,100%{opacity:.85;filter:brightness(1)}50%{opacity:1;filter:brightness(1.4)}}'+
    'html[data-seasonal-theme] .hero-cta.solid{animation:st-ember 1.3s ease-in-out infinite;}'+
    /* smoke */
    'html[data-seasonal-theme] body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9994;'+
      'background:radial-gradient(ellipse 100% 100% at 50% 100%,rgba(25,8,0,.28) 0%,transparent 55%);}'
  );
  makeBanner('🎇 <span>Remember, Remember — Happy Bonfire Night!</span> 🔥',
    'linear-gradient(90deg,#0d0500,#2d0f00,#0d0500)','#ffb700');

  /* Sparkler cursor — raw spark particles */
  addEventListener('mousemove',function(){
    for(var i=0;i<4;i++){
      (function(){
        var p={x:mx+rnd(-8,8),y:my+rnd(-8,8),vx:rnd(-2.5,2.5),vy:rnd(-3,1),
          col:pick(BCOLS),a:0.95,sz:rnd(1.5,4),age:0,maxAge:Math.floor(rnd(15,32))};
        cursorParticles.push({
          update:function(){ p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.age++;p.a=Math.max(0,(p.maxAge-p.age)/p.maxAge); },
          draw:function(){ cctx.save();cctx.globalAlpha=p.a;cctx.fillStyle=p.col;cctx.beginPath();cctx.arc(p.x,p.y,p.sz/2,0,Math.PI*2);cctx.fill();cctx.restore(); },
          dead:function(){ return p.age>=p.maxAge; }
        });
      })();
    }
  });

  /* Click = firework burst at click position */
  addEventListener('click',function(e){
    var bfw=makeFirework(e.clientX,e.clientY,BCOLS,22);
    var bfwRef=[bfw];
    extraDrawFns.push(function fn(){
      for(var i=bfwRef.length-1;i>=0;i--){ bfwRef[i].update();bfwRef[i].draw(); if(bfwRef[i].dead) bfwRef.splice(i,1); }
      if(!bfwRef.length){ var idx=extraDrawFns.indexOf(fn); if(idx>-1) extraDrawFns.splice(idx,1); }
    });
  });

  /* Rising embers */
  makeParticles(35,RiseP,['✦','·','★','◆'],BCOLS,{speed:[0.5,1.5]});
}

/* ─────────────────────── 🎊 ANNIVERSARY ────────── */
if(theme==='anniversary'){
  var ACOLS=['#ff4500','#ffd700','#a78bfa','#22c997','#60a5fa','#f9a8d4'];
  var founded=new Date('2025-05-05'), today2=new Date();
  var yrs=today2.getFullYear()-founded.getFullYear();
  var mos=today2.getMonth()-founded.getMonth()+(today2.getDate()<founded.getDate()?-1:0);
  var totalMo=yrs*12+mos;
  var ageStr=totalMo>=12 ? yrs+' year'+(yrs!==1?'s':'') : totalMo+' month'+(totalMo!==1?'s':'');

  injectVars({'--orange':'#ff4500','--orange-soft':'rgba(255,69,0,.12)','--orange-line':'rgba(255,69,0,.28)','--gold':'#ffd700','--purple':'#a78bfa','--green':'#22c997'},
    'html[data-seasonal-theme] ::selection{background:#ff4500;color:#fff;}'+
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ff4500,#ffd700,#a78bfa);}'+
    '@keyframes st-pop{0%,100%{transform:scale(1)}50%{transform:scale(1.06) rotate(-1.5deg)}}'+
    'html[data-seasonal-theme] .stat-n{animation:st-pop 1.8s ease-in-out infinite;}'+
    '@keyframes st-agsh{0%{background-position:-200% 0}100%{background-position:200% 0}}'+
    'html[data-seasonal-theme] .hero-h1{'+
      'background:linear-gradient(90deg,var(--tx,#f0f0f4) 25%,#ffd700 45%,#ff4500 55%,var(--tx,#f0f0f4) 70%);'+
      'background-size:200%;animation:st-agsh 4s linear infinite;'+
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'
  );
  makeBanner('🎊 <span>r/MemeExchangeCommunism — '+ageStr+' old! Thank you!</span> 🎉',
    'linear-gradient(90deg,#1a0800,#3d1500,#1a0800)','#ffd700');

  addEventListener('mousemove',function(){ spawnTrail(['🎊','🎉','✦','★'],ACOLS,2,45); });

  /* Birthday pop */
  var isToday2=(today2.getMonth()===4&&today2.getDate()===5);
  if(isToday2){
    var bday=el('div','');
    bday.innerHTML='🎂 <strong>Today is the anniversary!</strong><br>May 5 — Happy birthday r/MEC! 🎉';
    bday.style.cssText='position:fixed;bottom:24px;right:24px;max-width:260px;'+
      'background:#3d1500;color:#ffd700;padding:14px 18px;border-radius:12px;line-height:1.5;'+
      'font-family:"Geist",sans-serif;font-size:.82rem;z-index:99999;'+
      'border:1px solid rgba(255,215,0,.3);box-shadow:0 4px 20px rgba(255,69,0,.3);';
    document.body.appendChild(bday);
    setTimeout(function(){ bday.style.cssText+=';opacity:0;transition:opacity .5s;'; setTimeout(function(){ bday.remove(); },500); },10000);
  }

  /* Full-page confetti burst */
  var confetti2=[];
  for(var cf=0;cf<80;cf++){
    confetti2.push({x:rnd(0,innerWidth),y:rnd(-200,0),
      vx:rnd(-2,2),vy:rnd(0.5,3),w:rnd(6,12),h:rnd(3,7),
      rot:rnd(0,Math.PI*2),drot:rnd(-0.1,0.1),
      col:pick(ACOLS),a:0.88});
  }
  extraDrawFns.push(function(){
    confetti2.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.018; p.rot+=p.drot;
      if(p.y>cvs.height+20) p.y=-20;
      ctx.save();ctx.globalAlpha=p.a;ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      ctx.fillStyle=p.col;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();
    });
  });
  makeParticles(15,FallP,['🎊','🎉','✦','★'],ACOLS,{speed:[0.4,1.0]});
}

/* ─────────────────────── 🗳️ ELECTION SEASON ────── */
if(theme==='electionseason'){
  var ECOLS2=['#e8001a','#0d0d0d','#fff','#c0001a','#888'];

  injectVars({
    '--orange':      '#e8001a',
    '--orange-soft': 'rgba(232,0,26,.10)',
    '--orange-line': 'rgba(232,0,26,.24)',
    '--gold':        '#e8001a',
    '--green':       '#1a1a1a',
    '--purple':      '#555',
  },
    /* ── scrollbar ── */
    'html[data-seasonal-theme] ::-webkit-scrollbar-thumb{background:#e8001a;}'+
    'html[data-seasonal-theme] ::selection{background:#e8001a;color:#fff;}'+

    /* ── ballot-paper grid overlay on body ── */
    'html[data-seasonal-theme] body::before{'+
      'content:"";position:fixed;inset:0;pointer-events:none;z-index:9993;'+
      'background-image:'+
        'linear-gradient(rgba(232,0,26,.04) 1px,transparent 1px),'+
        'linear-gradient(90deg,rgba(232,0,26,.04) 1px,transparent 1px);'+
      'background-size:48px 48px;'+
      'mask-image:radial-gradient(ellipse 80% 60% at 50% 20%,rgba(0,0,0,.3),transparent 75%);'+
    '}'+

    /* ── red underline pulse on all section headings ── */
    '@keyframes st-vote-pulse{0%,100%{box-shadow:0 3px 0 0 #e8001a}50%{box-shadow:0 3px 0 0 rgba(232,0,26,.3)}}'+
    'html[data-seasonal-theme] .heading,html[data-seasonal-theme] .section-h{'+
      'border-bottom:3px solid #e8001a;display:inline-block;padding-bottom:2px;'+
      'animation:st-vote-pulse 2.5s ease-in-out infinite;'+
    '}'+

    /* ── CTA buttons get a "vote" stamp feel ── */
    'html[data-seasonal-theme] .hero-cta.solid,'+
    'html[data-seasonal-theme] .nav-btn.primary,'+
    'html[data-seasonal-theme] .cta-primary,'+
    'html[data-seasonal-theme] .apply-btn{'+
      'outline:2px solid #e8001a;outline-offset:3px;'+
      'animation:none;'+
    '}'+

    /* ── vote tally counter watermark on hero ── */
    'html[data-seasonal-theme] .hero::before{'+
      'content:"VOTE";position:absolute;right:-20px;top:50%;transform:translateY(-50%) rotate(12deg);'+
      'font-family:"Geist",system-ui,sans-serif;font-weight:900;'+
      'font-size:clamp(8rem,20vw,16rem);color:rgba(232,0,26,.05);'+
      'pointer-events:none;z-index:0;letter-spacing:-5px;'+
      'user-select:none;'+
    '}'
  );

  /* ── Banner with live "polls open" indicator ── */
  var bnrEl = makeBanner(
    '🗳️ <span>Early 2026 Elections — Mod applications open</span>' +
    '&nbsp;&nbsp;<a href="https://royalpgytpc.github.io/MemeExchangeCommunism/Modapp.html" '+
    'target="_blank" id="st-apply-link" style="'+
      'background:#fff;color:#e8001a;padding:2px 10px;border-radius:100px;'+
      'font-weight:800;font-size:.68rem;letter-spacing:.5px;text-decoration:none;'+
      'transition:background .15s,color .15s;'+
    '">Apply now →</a>',
    'linear-gradient(90deg,#0d0d0d,#1a0005,#0d0d0d)',
    '#fff'
  );

  /* ── Cursor: floating ballot papers ── */
  addEventListener('mousemove', function () {
    spawnTrail(
      pick(['🗳️','✦','·','▪','★']),
      ['#e8001a','#fff','#888','#c0001a'],
      3, 35
    );
  });

  /* ── Falling ballot papers + check marks ── */
  makeParticles(25, FallP,
    ['🗳️','✦','▪','·','★','✓'],
    ['#e8001a','#c0001a','#0d0d0d','#888'],
    {speed:[0.3, 0.9], minSz:10, maxSz:20}
  );

  /* ── Canvas: vote-count ticker strips (like election night) ── */
  var tickers = [];
  for (var t = 0; t < 6; t++) {
    tickers.push({
      x:    rnd(0, innerWidth),
      y:    rnd(0, innerHeight),
      text: pick(['▮▮▮▮▯','▮▮▮▯▯','▮▮▮▮▮','▮▯▯▯▯','▮▮▯▯▯']),
      a:    rnd(0.03, 0.07),
      sz:   rnd(10, 16),
      col:  pick(['#e8001a','#333']),
      drift: rnd(-0.15, 0.15),
    });
  }
  extraDrawFns.push(function () {
    tickers.forEach(function (tk) {
      tk.x += tk.drift;
      if (tk.x > cvs.width + 60)  tk.x = -60;
      if (tk.x < -60) tk.x = cvs.width + 60;
      ctx.save();
      ctx.globalAlpha = tk.a;
      ctx.font = 'bold ' + tk.sz + 'px monospace';
      ctx.fillStyle = tk.col;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tk.text, tk.x, tk.y);
      ctx.restore();
    });
  });

  /* ── Stamp effect: clicking anywhere drops a ✓ stamp ── */
  addEventListener('click', function (e) {
    var stamp = el('div', '');
    stamp.textContent = '✓';
    stamp.style.cssText =
      'position:fixed;left:'+e.clientX+'px;top:'+e.clientY+'px;'+
      'font-size:2.4rem;font-weight:900;color:#e8001a;'+
      'transform:translate(-50%,-50%) scale(1.8) rotate(-18deg);'+
      'pointer-events:none;z-index:99999;opacity:0.9;'+
      'font-family:"Geist",system-ui,sans-serif;'+
      'transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .35s ease;'+
      'text-shadow:0 2px 8px rgba(232,0,26,.35);';
    document.body.appendChild(stamp);
    /* animate out */
    setTimeout(function () {
      stamp.style.transform = 'translate(-50%,-50%) scale(1) rotate(-18deg)';
      stamp.style.opacity = '0';
    }, 20);
    setTimeout(function () { stamp.remove(); }, 400);
  });

  /* ── "Polls close in" countdown (shows until end of month) ── */
  var pollClose = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
  var cdBox = el('div', '');
  cdBox.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:99998;'+
    'background:#0d0d0d;color:#fff;'+
    'padding:14px 20px;border-radius:12px;'+
    'font-family:"Geist",system-ui,sans-serif;'+
    'border:1px solid rgba(232,0,26,.35);'+
    'box-shadow:0 4px 24px rgba(232,0,26,.2);'+
    'min-width:200px;';
  cdBox.innerHTML =
    '<div style="font-size:.6rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;'+
    'color:#e8001a;margin-bottom:6px;">🗳️ Applications close</div>'+
    '<div id="st-poll-cd" style="font-size:1.1rem;font-weight:900;letter-spacing:-.5px;color:#fff;"></div>';
  document.body.appendChild(cdBox);

  function updatePollCd() {
    var diff2 = pollClose - new Date();
    var cdEl2 = qs('#st-poll-cd');
    if (!cdEl2) return;
    if (diff2 <= 0) { cdEl2.textContent = 'Closing soon!'; return; }
    var dd = Math.floor(diff2 / 86400000);
    var hh = Math.floor((diff2 % 86400000) / 3600000);
    var mm = Math.floor((diff2 % 3600000) / 60000);
    var ss = Math.floor((diff2 % 60000) / 1000);
    cdEl2.textContent = dd + 'd ' + hh + 'h ' + mm + 'm ' + ss + 's';
  }
  updatePollCd();
  setInterval(updatePollCd, 1000);
}

/* ══════════════════════════════════════════════════
   UNKNOWN WARNING
══════════════════════════════════════════════════ */
var known=['pride','christmas','halloween','420','newyear','valentines',
  'stpatricks','easter','thanksgiving','summer','diwali','midautumn',
  'bonfirenight','anniversary','electionseason'];
if(known.indexOf(theme)===-1){
  console.warn('[seasonal-themes v2] Unknown theme: "'+raw+'"\nAvailable: '+
    'Pride, Christmas, Halloween, 420, NewYear, Valentines, StPatricks, '+
    'Easter, Thanksgiving, Summer, Diwali, MidAutumn, BonfireNight, Anniversary, ElectionSeason');
}

})();