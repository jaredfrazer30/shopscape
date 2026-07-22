"use strict";
// ============================================================ CONSTANTS
const TILE=40, MAP_W=48, MAP_H=38;
const T={GRASS:0,GRASS2:1,DIRT:2,WATER:3,SAND:4,COBBLE:5,BRIDGE:6,FLOOR:7,SWAMP:8};
const BLOCK_TERRAIN=new Set([T.WATER,T.SWAMP]);
// ground base colors (organic noise applied on top)
const GC={
  [T.GRASS]:[54,84,42],[T.GRASS2]:[46,74,36],[T.DIRT]:[104,84,56],[T.WATER]:[38,92,120],
  [T.SAND]:[150,134,92],[T.COBBLE]:[120,116,120],[T.BRIDGE]:[110,78,46],[T.FLOOR]:[130,120,98],
  [T.SWAMP]:[40,92,78],
};
const MINI={[T.GRASS]:"#3a5a2a",[T.GRASS2]:"#32502a",[T.DIRT]:"#6b563b",[T.WATER]:"#2f6b8f",
  [T.SAND]:"#b0a06a",[T.COBBLE]:"#7a7a80",[T.BRIDGE]:"#6b4a2f",[T.FLOOR]:"#8a8078",[T.SWAMP]:"#2f6b5a"};
// ---- seeded PRNG + value noise ----
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function makeNoise(seed,g=48){const r=mulberry32(seed);const grid=new Float32Array(g*g);for(let i=0;i<grid.length;i++)grid[i]=r();
  return function(x,y){x=(x%g+g)%g;y=(y%g+g)%g;const x0=Math.floor(x),y0=Math.floor(y),x1=(x0+1)%g,y1=(y0+1)%g;const fx=x-x0,fy=y-y0;
    const a=grid[y0*g+x0],b=grid[y0*g+x1],c=grid[y1*g+x0],d=grid[y1*g+x1];const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
    return (a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy;};}
const rngGlobal=mulberry32(1337);
function rr(a,b){return a+(b-a)*rngGlobal();}
// ============================================================ WORLD GEN
let map=[], blockObj=[], objects=[];
const ZONES=[
  {name:"151 O'Connor Keep",x:0,y:0,w:24,h:20},
  {name:"The Data Warehouse",x:24,y:0,w:24,h:20},
  {name:"BFCM Battlefield",x:0,y:20,w:24,h:18},
  {name:"Fulfillment Fortress",x:24,y:20,w:24,h:18},
];
function inb(x,y){return x>=0&&y>=0&&x<MAP_W&&y<MAP_H;}
function carve(x0,y0,x1,y1,t){let x=x0,y=y0;let guard=0;
  while((x!==x1||y!==y1)&&guard++<400){if(inb(x,y)&&map[y][x]!==T.WATER)map[y][x]=t;
    if(x<x1)x++;else if(x>x1)x--;else if(y<y1)y++;else if(y>y1)y--;}
  if(inb(x1,y1)&&map[y1][x1]!==T.WATER)map[y1][x1]=t;}
function rect(x,y,w,h,t){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(inb(i,j))map[j][i]=t;}
function placeBuilding(x,y,w,h,kind,doorDx,doorDy){
  rect(x,y,w,h,T.COBBLE);
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)blockObj[j][i]=1;
  const dx=x+doorDx,dy=y+doorDy; if(inb(dx,dy))blockObj[dy][dx]=0;
  objects.push({type:kind,tx:x,ty:y,w,h,door:{x:dx,y:dy}});
}
function genWorld(){
  const gn=makeNoise(7);
  map=[];blockObj=[];objects=[];
  for(let y=0;y<MAP_H;y++){const row=[],brow=[];for(let x=0;x<MAP_W;x++){
    let t=T.GRASS; if(gn(x/5,y/5)>0.62)t=T.GRASS2;
    // BFCM battlegrounds = sandy
    if(y>20&&x<24&&gn(x/4+9,y/4)>0.5)t=T.SAND;
    row.push(t);brow.push(0);}map.push(row);blockObj.push(brow);}
  // rivers
  for(let y=0;y<MAP_H;y++)if(!(y===10||y===11))map[y][24]=T.WATER;
  for(let x=0;x<MAP_W;x++)if(!(x===7||x===8||x===34||x===35))map[20][x]=T.WATER;
  // town cobble plaza (Shopville)
  rect(2,2,12,11,T.COBBLE);
  // paths connecting zones over bridges
  carve(8,8,24,8,T.DIRT); carve(24,8,24,10,T.DIRT);
  carve(8,12,8,20,T.DIRT); carve(34,8,42,8,T.DIRT); carve(34,8,34,20,T.DIRT);
  carve(8,20,8,30,T.DIRT); carve(34,20,34,30,T.DIRT); carve(12,26,34,26,T.DIRT);
  // bridges (walkable over water)
  map[10][24]=T.BRIDGE;map[11][24]=T.BRIDGE;
  map[20][7]=T.BRIDGE;map[20][8]=T.BRIDGE;map[20][34]=T.BRIDGE;map[20][35]=T.BRIDGE;
  // buildings
  placeBuilding(3,3,4,3,"bank",1,3);
  placeBuilding(9,3,3,3,"store",1,3);
  placeBuilding(4,8,4,3,"hackhq",1,3);
  // object scatter helper
  const put=(type,tx,ty,block)=>{if(!inb(tx,ty))return;if(map[ty][tx]===T.WATER)return;
    if(block)blockObj[ty][tx]=1;objects.push({type,tx,ty});};
  // forest for Sourcing (near town, NE of plaza)
  const forest=makeNoise(21);
  for(let y=3;y<18;y++)for(let x=14;x<24;x++){
    if(map[y][x]===T.DIRT||map[y][x]===T.WATER)continue;
    if(forest(x/2.5,y/2.5)>0.66)put("tree",x,y,true);
    else if(forest(x/2+5,y/2)>0.8)put("bush",x,y,false);
  }
  // Checkout Caverns (NE) rocks
  const rockn=makeNoise(41);
  for(let y=2;y<19;y++)for(let x=26;x<47;x++){
    if(map[y][x]===T.DIRT||map[y][x]===T.WATER)continue;
    if(rockn(x/2.2,y/2.2)>0.7)put("rock",x,y,true);}
  // Battlegrounds rocks/stumps (SW)
  for(let y=22;y<37;y++)for(let x=1;x<23;x++){
    if(map[y][x]===T.DIRT||map[y][x]===T.WATER)continue;
    if(rockn(x/2+3,y/2+2)>0.78)put("rock",x,y,true);}
  // Partner Plaza (SE) — sparse dead trees around dragon
  for(let y=22;y<37;y++)for(let x=26;x<47;x++){
    if(map[y][x]===T.DIRT||map[y][x]===T.WATER)continue;
    if(forest(x/2+7,y/2+7)>0.8)put("deadtree",x,y,true);}
  // decorations: lamps by town, signs
  put("lamp",7,7,true);put("lamp",12,7,true);put("sign",8,14,false);
  // cursed swamp pond (greenish-blue) — south of town, guarded by the RevOps Oracle
  for(const c of [[3,15],[4,15],[5,15],[3,16],[4,16],[5,16],[6,16],[4,17],[5,17]])if(inb(c[0],c[1]))map[c[1]][c[0]]=T.SWAMP;
  // a clean fishing pond near town
  for(const c of [[16,15],[17,15],[18,15],[16,16],[17,16],[18,16],[17,17]])if(inb(c[0],c[1])&&map[c[1]][c[0]]!==T.DIRT)map[c[1]][c[0]]=T.WATER;
}
genWorld();
function walkable(tx,ty){return inb(tx,ty)&&!BLOCK_TERRAIN.has(map[ty][tx])&&!blockObj[ty][tx];}

// ============================================================ TERRAIN BUFFER (organic, no grid)
let tbuf=document.createElement("canvas");
tbuf.width=MAP_W*TILE;tbuf.height=MAP_H*TILE;
let minibuf=document.createElement("canvas");minibuf.width=MAP_W;minibuf.height=MAP_H;
function tileRng(x,y){return mulberry32(((x*73856093)^(y*19349663))>>>0);}
function buildTerrain(){
  const g=tbuf.getContext("2d");
  const n1=makeNoise(11),n2=makeNoise(97);
  // base fill with low-freq shade variation
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const t=map[y][x];const c=GC[t];const m=0.82+0.34*n1(x/6,y/6);
    g.fillStyle=`rgb(${c[0]*m|0},${c[1]*m|0},${c[2]*m|0})`;
    g.fillRect(x*TILE-1,y*TILE-1,TILE+2,TILE+2);
  }
  // feather organic edges for DIRT/COBBLE/BRIDGE/WATER so tiles blur together
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const t=map[y][x];if(t!==T.DIRT&&t!==T.WATER&&t!==T.COBBLE&&t!==T.BRIDGE)continue;
    const cx=x*TILE+TILE/2,cy=y*TILE+TILE/2;const c=GC[t];
    const rnd=tileRng(x,y);const rad=TILE*(0.62+rnd()*0.28);
    const grd=g.createRadialGradient(cx,cy,rad*0.3,cx,cy,rad);
    grd.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},1)`);
    grd.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);
    g.fillStyle=grd;g.beginPath();g.arc(cx+ (rnd()-0.5)*8,cy+(rnd()-0.5)*8,rad,0,7);g.fill();
  }
  // detail scatter
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const t=map[y][x];const rnd=tileRng(x,y);const ox=x*TILE,oy=y*TILE;
    if(t===T.GRASS||t===T.GRASS2){
      const n=4+((rnd()*4)|0);
      for(let i=0;i<n;i++){const gx=ox+rnd()*TILE,gy=oy+rnd()*TILE;
        g.strokeStyle=rnd()>0.5?"rgba(70,110,55,0.7)":"rgba(38,64,30,0.7)";g.lineWidth=1;
        g.beginPath();g.moveTo(gx,gy);g.lineTo(gx+(rnd()-0.5)*3,gy-2-rnd()*3);g.stroke();}
      if(rnd()>0.9){g.fillStyle=["#e8d24a","#d96b6b","#c9c2e8"][(rnd()*3)|0];
        g.beginPath();g.arc(ox+rnd()*TILE,oy+rnd()*TILE,1.6,0,7);g.fill();}
    }else if(t===T.SAND){
      for(let i=0;i<6;i++){g.fillStyle="rgba(90,78,48,0.5)";g.fillRect(ox+rnd()*TILE,oy+rnd()*TILE,1.5,1.5);}
    }else if(t===T.COBBLE){
      for(let i=0;i<3;i++)for(let j=0;j<3;j++){g.strokeStyle="rgba(20,20,24,0.5)";g.lineWidth=1;
        g.strokeRect(ox+i*TILE/3+1,oy+j*TILE/3+1,TILE/3-2,TILE/3-2);}
    }else if(t===T.DIRT){
      for(let i=0;i<5;i++){g.fillStyle="rgba(60,46,28,0.6)";g.beginPath();
        g.arc(ox+rnd()*TILE,oy+rnd()*TILE,1+rnd()*1.5,0,7);g.fill();}
    }else if(t===T.BRIDGE){
      g.strokeStyle="rgba(50,32,16,0.8)";g.lineWidth=2;
      for(let i=0;i<=TILE;i+=8){g.beginPath();g.moveTo(ox+i,oy);g.lineTo(ox+i,oy+TILE);g.stroke();}
    }else if(t===T.WATER){
      g.fillStyle="rgba(20,60,90,0.5)";g.beginPath();g.arc(ox+rnd()*TILE,oy+rnd()*TILE,TILE*0.4,0,7);g.fill();
    }
  }
  // minimap buffer
  const mg=minibuf.getContext("2d");
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){mg.fillStyle=MINI[map[y][x]];mg.fillRect(x,y,1,1);}
  for(const o of objects){if(o.type==="tree"||o.type==="deadtree"){mg.fillStyle="#1f3d1a";mg.fillRect(o.tx,o.ty,1,1);}
    else if(o.type==="rock"){mg.fillStyle="#555";mg.fillRect(o.tx,o.ty,1,1);}
    else if(o.type==="bank"||o.type==="store"||o.type==="hackhq"){mg.fillStyle="#caa14a";mg.fillRect(o.tx,o.ty,o.w||1,o.h||1);}}
}
buildTerrain();
for(const o of objects)if(o.type==="tree"||o.type==="deadtree"){o.felled=false;o.hp=2;o.respawnAt=0;}
for(const o of objects)if(o.type==="rock"){o.cd=0;}
// ============================================================ PATHFINDING (A* + string-pull)
function nearestWalkable(tx,ty){if(walkable(tx,ty))return{x:tx,y:ty};
  for(let r=1;r<=9;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=tx+dx,y=ty+dy;if(walkable(x,y))return{x,y};}
  return null;}
function lineClear(a,b){let x0=a.x,y0=a.y;const x1=b.x,y1=b.y;const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0);
  const sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx-dy;let guard=0;
  while(guard++<300){if(!walkable(x0,y0))return false;if(x0===x1&&y0===y1)return true;
    const e2=2*err;if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}}return true;}
function smooth(p){if(p.length<3)return p;const out=[p[0]];let i=0;
  while(i<p.length-1){let j=p.length-1;while(j>i+1&&!lineClear(p[i],p[j]))j--;out.push(p[j]);i=j;}return out;}
function findPath(sx,sy,tx,ty){
  if(!walkable(tx,ty)){const a=nearestWalkable(tx,ty);if(!a)return null;tx=a.x;ty=a.y;}
  if(sx===tx&&sy===ty)return[];
  const K=(x,y)=>y*MAP_W+x;const open=[{x:sx,y:sy,g:0,f:0}];const came={},gsc={};gsc[K(sx,sy)]=0;
  const closed=new Set();const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];let guard=0;
  while(open.length&&guard++<12000){
    let bi=0;for(let i=1;i<open.length;i++)if(open[i].f<open[bi].f)bi=i;
    const cur=open.splice(bi,1)[0];const ck=K(cur.x,cur.y);if(closed.has(ck))continue;closed.add(ck);
    if(cur.x===tx&&cur.y===ty){const path=[];let k=ck;while(came[k]!==undefined){const px=k%MAP_W;path.push({x:px,y:(k-px)/MAP_W});k=came[k];}
      path.push({x:sx,y:sy});path.reverse();const sm=smooth(path);sm.shift();return sm;}
    for(const[dx,dy]of dirs){const nx=cur.x+dx,ny=cur.y+dy;if(!walkable(nx,ny))continue;
      if(dx&&dy&&(!walkable(cur.x+dx,cur.y)||!walkable(cur.x,cur.y+dy)))continue;
      const nk=K(nx,ny);if(closed.has(nk))continue;const ng=cur.g+((dx&&dy)?1.414:1);
      if(gsc[nk]===undefined||ng<gsc[nk]){gsc[nk]=ng;came[nk]=ck;open.push({x:nx,y:ny,g:ng,f:ng+Math.hypot(tx-nx,ty-ny)});}}}
  return null;}
function adjacentTile(tx,ty,fromx,fromy){let best=null,bd=1e9;const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for(const[dx,dy]of dirs){const x=tx+dx,y=ty+dy;if(!walkable(x,y))continue;const d=Math.abs(x-fromx)+Math.abs(y-fromy);if(d<bd){bd=d;best={x,y};}}
  return best;}
const tileC=(tx,ty)=>({x:tx*TILE+TILE/2,y:ty*TILE+TILE/2});
const pxTile=(px,py)=>({x:Math.floor(px/TILE),y:Math.floor(py/TILE)});

// ============================================================ ENTITIES
// Full Design Bible skill map (RuneScape skill -> Shopify skill). Trainable now: Checkout Combat, Sourcing, Data Mining.
const SKILL_DEFS=[
  {key:"selling",name:"Checkout Combat",glyph:"⚔",train:true},
  {key:"sourcing",name:"Sourcing",glyph:"🪓",train:true},
  {key:"mining",name:"Data Mining",glyph:"⛏",train:true},
  {key:"fishing",name:"Fishing",glyph:"🎣",train:true},
  {key:"liquid",name:"Liquid (Magic)",glyph:"💧"},
  {key:"api",name:"API · GraphQL/REST",glyph:"🏹"},
  {key:"trust",name:"Trust Battery",glyph:"🔋"},
  {key:"appbuild",name:"App Building",glyph:"🔨"},
  {key:"leadgen",name:"Lead Gen",glyph:"🎣"},
  {key:"fulfillment",name:"Fulfillment",glyph:"🍳"},
  {key:"theme",name:"Theme Building",glyph:"🎨"},
  {key:"liquidcraft",name:"Liquid Crafting",glyph:"🔮"},
  {key:"merch",name:"Merchandising",glyph:"⚗"},
  {key:"cro",name:"CRO (Agility)",glyph:"🏃"},
  {key:"growth",name:"Growth / SEO",glyph:"📈"},
  {key:"fraud",name:"Fraud Slayer",glyph:"🛡"},
  {key:"retention",name:"Retention",glyph:"🌱"},
  {key:"setup",name:"Store Setup",glyph:"🏗"},
  {key:"prospecting",name:"Prospecting",glyph:"🔭"},
  {key:"integrations",name:"Integrations",glyph:"🧩"},
  {key:"marketing",name:"Marketing",glyph:"🎯"},
  {key:"firemaking",name:"Launches / Hype",glyph:"🔥"},
];
const ITEM_DEFS={
  rawGoods:{name:"Raw Goods",glyph:"📦",sell:3,desc:"Raw commerce goods harvested from crates. Sell for GMV or stockpile for crafting."},
  logs:{name:"Product Logs",glyph:"🪵",sell:5,desc:"Timber from felled Product Trees. A tidy little GMV earner."},
  loyalty:{name:"Loyalty Gem",glyph:"💎",sell:60,desc:"A shimmering gem of pure customer loyalty. Highly valuable to collectors."},
  elixir:{name:"Health Score Potion",glyph:"🧪",sell:12,heal:15,buy:25,desc:"Your Health Score IS your HP. Drink to instantly restore 15 Storefront Health."},
  nrr:{name:"NRR Elixir",glyph:"🧉",sell:40,heal:30,buy:120,over:1.3,desc:"Net Revenue Retention brew — restores 30 health and can push you past 100% (net expansion)."},
  buyButton:{name:"Buy Button Blade",glyph:"🗡️",kind:"weapon",atk:9,spd:820,tier:"Plus",strongVs:["physical"],weakVs:[],sell:400,buy:600,desc:"The legendary one-click blade dropped by the Churn Dragon. Balanced, heavy, dependable."},
  // starter weapons / shields (one set per character)
  waterStaff:{name:"Water Staff",glyph:"🔱",kind:"weapon",atk:6,spd:780,tier:"Shopify",strongVs:["beast","undead"],weakVs:["ghost"],sell:120,desc:"Channels Liquid into a soaking torrent. Strong vs beasts & undead; fizzles against ghosts."},
  blastShield:{name:"Blast Shield",glyph:"🛡️",kind:"shield",def:6,sell:100,desc:"Absorbs one big burst hit and vents the overflow. Built to survive traffic spikes."},
  whiteGloves:{name:"White Gloves",glyph:"🧤",kind:"weapon",atk:5,spd:380,tier:"Basic",strongVs:["physical","undead"],weakVs:["ghost","beast"],sell:90,desc:"White-glove-service jabs — blazing fast, low per-hit. Shreds physical foes; whiffs on ghosts & beasts."},
  moneyShield:{name:"Money Shield",glyph:"💰",kind:"shield",def:5,sell:110,desc:"A wall of GMV coins. Blocked hits are partly converted back into gold."},
  fancyCane:{name:"Fancy Cane",glyph:"🦯",kind:"weapon",atk:7,spd:600,tier:"Advanced",strongVs:["ghost"],weakVs:["beast"],sell:140,desc:"An elegant cane with immense reach. Taps ghosts into next quarter; too refined to faze a beast."},
  trillionShield:{name:"Trillion Dollar Shield",glyph:"💠",kind:"shield",def:8,sell:300,desc:"The realm's ultimate bulwark, plated in a trillion in cumulative GMV. Near-impenetrable."},
  // shop-purchasable lore weapons (from the Design Bible)
  discountDagger:{name:"Discount Dagger",glyph:"🔪",kind:"weapon",atk:6,spd:440,tier:"Shopify",strongVs:["undead"],weakVs:[],selfDmg:1,sell:70,buy:200,desc:"Applies Markdown bleed to enemies — but erodes your own margin (1 recoil damage per swing)."},
  queryLance:{name:"GraphQL Query Lance",glyph:"🏹",kind:"weapon",atk:8,spd:700,tier:"Advanced",strongVs:["undead","ghost"],weakVs:[],sell:180,buy:500,desc:"Asks for exactly the fields it needs — precise, high single-target damage. REST users flee."},
  shopPaySaber:{name:"Shop Pay Saber",glyph:"⚡",kind:"weapon",atk:12,spd:420,tier:"Plus",strongVs:["physical","undead","ghost","beast"],weakVs:[],crit:0.25,sell:800,buy:1800,desc:"Highest-converting blade in the realm. +crit and +attack speed. One tap, instant sale."},
  ore:{name:"GMV Ore",glyph:"🪨",sell:6,desc:"Ore mined from the Data Warehouse. Refine it into apps, or sell for GMV."},
  // ---- expanded weapon ladder (Design Bible) ----
  snowboard:{name:"Snowdevil Snowboard",glyph:"🏂",kind:"weapon",atk:3,spd:700,tier:"Trial",strongVs:[],weakVs:[],sell:10,buy:30,desc:"The origin blade — Shopify began as Snowdevil, a snowboard shop. Whack for chip damage."},
  buyButtonBludgeon:{name:"Buy Button Bludgeon",glyph:"🔨",kind:"weapon",atk:4,spd:600,tier:"Basic",strongVs:["physical"],weakVs:[],sell:40,buy:120,desc:"One-click smash. Simple and reliable; clears trash mobs fast."},
  barcodeBlaster:{name:"Barcode Blaster",glyph:"🔫",kind:"weapon",atk:5,spd:520,tier:"Basic",strongVs:["undead","ghost"],weakVs:["beast"],sell:60,buy:160,desc:"POS scanner rifle. *beep* = hit. Jams on unrecognised SKUs."},
  webhookWhip:{name:"Webhook Whip",glyph:"🪢",kind:"weapon",atk:8,spd:500,tier:"Advanced",strongVs:["beast"],weakVs:[],sell:200,buy:520,desc:"Fires on every event. Great crowd control; occasionally double-fires (retry storm)."},
  checkoutCleaver:{name:"Checkout Cleaver",glyph:"🪓",kind:"weapon",atk:11,spd:640,tier:"Plus",strongVs:["physical","undead"],weakVs:[],sell:600,buy:1500,desc:"The sacred conversion blade. Extensible — devastating in the right hands."},
  monolith:{name:"The Monolith",glyph:"🗿",kind:"weapon",atk:16,spd:1000,tier:"Plus",strongVs:["physical","undead","ghost","beast"],weakVs:[],sell:900,buy:2200,desc:"A colossal greatsword forged from Shopify Core. Devastating, slow, and everyone argues about refactoring it."},
  foundersRustBlade:{name:"Founder's Rust Blade",glyph:"🦀",kind:"weapon",atk:14,spd:340,tier:"Plus",strongVs:["physical","undead","ghost","beast"],weakVs:[],crit:0.2,sell:0,desc:"Tobi's legendary blade, hand-forged in Rust. Blazing fast, memory-safe, never segfaults."},
  // ---- armour (head / body / legs / hands slots) ----
  dawnRobes:{name:"Dawn Robes",glyph:"🥋",kind:"armor",slot:"body",def:1,tier:"Trial",sell:5,desc:"The default starter theme. Clean, minimal — everyone begins here."},
  liquidLeather:{name:"Liquid Leather",glyph:"🧥",kind:"armor",slot:"body",def:3,tier:"Shopify",sell:80,buy:180,desc:"Flexible, templatable armour — recolours to match any theme."},
  polarisPlate:{name:"Polaris Plate",glyph:"🦺",kind:"armor",slot:"body",def:7,tier:"Plus",sell:350,buy:900,desc:"Design-system platebody. Perfectly consistent; grants poise and you never get lost."},
  trustBattery:{name:"Trust Battery Chestplate",glyph:"🔋",kind:"armor",slot:"body",def:6,tier:"Plus",regen:0.9,sell:300,buy:800,desc:"Regenerates Health Score over time while you act in good faith."},
  emperorArmor:{name:"Emperor's Power-Armor",glyph:"🤖",kind:"armor",slot:"body",def:12,tier:"Plus",sell:2500,desc:"Full chrome body set — the best armour in the realm. Prised from a fallen Emperor."},
  fraudFilter:{name:"Fraud Filter Faceguard",glyph:"🥽",kind:"armor",slot:"head",def:3,tier:"Advanced",sell:120,buy:320,desc:"Auto-flags incoming Fraudster hits before they land."},
  primeCrown:{name:"Prime Crown",glyph:"📦",kind:"armor",slot:"head",def:4,tier:"Plus",sell:500,desc:"Bezos's cosmetic crown — every NPC lets you skip the line."},
  motyCrown:{name:"Merchant of the Year Crown",glyph:"👑",kind:"armor",slot:"head",def:5,tier:"Plus",find:1.2,sell:1000,desc:"Legendary. +GMV find, boosted drop rate, and every NPC bows."},
  gdprGauntlets:{name:"GDPR Gauntlets",glyph:"🧤",kind:"armor",slot:"hands",def:3,tier:"Advanced",sell:110,buy:280,desc:"Compliance-grade. Forces enemies to request consent before looting you."},
  oxygenGreaves:{name:"Oxygen Greaves",glyph:"🥾",kind:"armor",slot:"legs",def:4,tier:"Plus",sell:260,buy:700,desc:"Headless-set greaves. Detach your frontend for a big speed boost."},
  // ---- currencies & consumables (Design Bible) ----
  shopCash:{name:"Shop Cash",glyph:"💵",sell:2,desc:"Premium currency earned at checkout. Shinier than GMV gold."},
  giftCard:{name:"Gift Card",glyph:"🎁",sell:50,desc:"Bearer note — never expires, always accepted at the Merch Table."},
  capital:{name:"Capital Chest",glyph:"🧰",buy:150,buff:"capital",desc:"A Shopify Capital loan. Big power spike now (+attack), repaid from future GMV."},
  discountScroll:{name:"Discount Code Scroll",glyph:"📜",buy:60,buff:"discount",desc:"Summons a horde of customers — a burst of GMV, but shrinks your margin."},
  launchpad:{name:"Launchpad Rocket",glyph:"🚀",buy:90,buff:"launch",desc:"Schedule a flash sale: a timed move-speed & damage buff that auto-reverts."},
  spyglass:{name:"Analytics Spyglass",glyph:"🔎",buy:80,toggle:"reveal",desc:"Reveals enemy HP numbers and hidden stats while carried. Click to toggle."},
  portalStone:{name:"Spin-Up Portal Stone",glyph:"🌀",buy:40,teleport:true,desc:"Conjures a fresh dev environment — instantly fast-travels you back to town."},
  sidekick:{name:"Sidekick Lamp",glyph:"🪔",buy:250,companion:true,desc:"Rub to summon your AI familiar, who fights beside you for a while."},
  editions:{name:"Editions Booklet",glyph:"📘",sell:100,desc:"Drops every Summer & Winter — a catalog of 100+ new abilities (lore item)."},
  // ---- fishing / cooking ----
  fishingRod:{name:"Fishing Rod",glyph:"🎣",tool:"fish",sell:0,desc:"A merchant's rod from Harley the Hype. Click a body of water to cast and catch fish."},
  rawFish:{name:"Raw Fish",glyph:"🐟",raw:true,sell:4,desc:"A fresh catch. Select it, then click a campfire to cook it."},
  cookedFish:{name:"Cooked Fish",glyph:"🍤",heal:12,sell:9,desc:"Grilled on a Merchant Fire. Restores 12 Health Score when eaten."},
  badData:{name:"Bad Data",glyph:"🐡",cursed:true,sell:0,desc:"Ungoverned raw-table data dredged from the cursed swamp. Do NOT try to cook or eat this."},
  merchantFire:{name:"Merchant Fire",glyph:"🔥",fire:true,desc:"A spark of merchant passion from your CSM. Use it with Product Logs to build a campfire."},
};
// playable characters — appearance handled in drawCharacter(), attack style in drawCharacter()/combat
const CHARS={
  river:{name:"River",weapon:"waterStaff",shield:"blastShield",body:"dawnRobes",atk:"cast",
    blurb:"Our resident expert for all things Shopify! With long blue hair, a water staff, and a penchant for being all-knowing, how can one say that she's not alive?!"},
  shoppy:{name:"Shoppy",weapon:"whiteGloves",shield:"moneyShield",body:"dawnRobes",atk:"punch",
    blurb:"Our tried and true mascot, and a true OG in the scene - internationally known and locally respected, this green bag needs no introduction."},
  shoppington:{name:"Lord Shoppington",weapon:"fancyCane",shield:"trillionShield",body:"dawnRobes",atk:"poke",
    blurb:"Some say he was born with money, others say he's self-made...All I know is this bag will give you one trillion reasons to love him!"},
};
const MT={
  cart:{name:"Abandoned Cart",class:"physical",hp:14,dmg:2,xp:24,gmv:6,respawn:6,drop:null,r:15,col:"#9aa3ad",spd:155,aggro:3,style:"ram"},
  goblin:{name:"Refund Zombie",class:"undead",hp:24,dmg:3,xp:40,gmv:12,respawn:8,drop:"elixir",r:15,col:"#6fae4f",spd:115,aggro:4,style:"hop"},
  wraith:{name:"Chargeback Wraith",class:"ghost",hp:36,dmg:5,xp:75,gmv:26,respawn:10,drop:"loyalty",r:16,col:"#cfd8e8",spd:125,aggro:5,style:"drift"},
  phantom:{name:"Fraudster",class:"ghost",hp:52,dmg:8,xp:130,gmv:48,respawn:14,drop:"loyalty",r:17,col:"#6a4a8a",spd:100,aggro:5,style:"spin"},
  dragon:{name:"The Churn Dragon",bossName:"THE CHURN DRAGON",class:"beast",hp:170,dmg:13,xp:650,gmv:280,respawn:45,drop:"buyButton",r:26,col:"#b8332b",boss:true,spd:92,aggro:6,style:"bite"},
  cartGoblin:{name:"Cart Goblin",class:"physical",hp:10,dmg:2,xp:18,gmv:5,respawn:6,drop:null,r:13,col:"#7a9a3a",spd:150,aggro:3,style:"hop"},
  slime:{name:"Latency Slime",class:"beast",hp:18,dmg:2,xp:30,gmv:8,respawn:7,drop:null,r:14,col:"#8fd0c0",spd:80,aggro:3,style:"ram"},
  skeleton:{name:"Deprecated API Skeleton",class:"undead",hp:40,dmg:6,xp:95,gmv:30,respawn:12,drop:"elixir",r:16,col:"#d8d0c0",spd:110,aggro:4,style:"hop"},
  lich:{name:"Legacy Code Lich",bossName:"LEGACY CODE LICH",class:"undead",hp:120,dmg:11,xp:500,gmv:200,respawn:40,drop:"monolith",r:22,col:"#6a8a6a",boss:true,spd:95,aggro:6,style:"spin"},
  bezos:{name:"Jeff Bezos, Emperor of the Everything Store",bossName:"THE EMPEROR",class:"physical",hp:420,dmg:20,xp:2000,gmv:1000,respawn:120,drop:"emperorArmor",r:30,col:"#c7ccd4",boss:true,spd:100,aggro:7,style:"bite",phases:true},
  bug:{name:"Bug",class:"physical",hp:8,dmg:1,xp:14,gmv:3,respawn:12,drop:null,r:13,col:"#7a9e3a",spd:135,aggro:2,style:"hop"},
};
function fix(list){return list.map(o=>{const a=nearestWalkable(o.tx,o.ty)||{x:o.tx,y:o.ty};return{...o,tx:a.x,ty:a.y};});}
let crates=fix([[15,6],[18,9],[21,12],[16,14],[19,4],[22,7]].map(c=>({tx:c[0],ty:c[1],cd:0})));
let monsters=fix([
  ["slime",28,8],["slime",32,12],["wraith",30,6],["wraith",38,5],["wraith",44,11],
  ["skeleton",40,6],["skeleton",44,14],["lich",45,3],
  ["cart",6,24],["cart",10,28],["cart",4,33],["cartGoblin",12,28],["cartGoblin",6,30],
  ["goblin",14,30],["goblin",9,34],
  ["phantom",30,24],["phantom",40,29],["phantom",45,34],["dragon",33,31],["bezos",44,34],
  ["bug",13,13],["bug",16,11],["bug",19,13],["bug",21,10],["bug",15,17],["bug",18,18],["bug",11,15],["bug",22,15],
].map(m=>({type:m[0],tx:m[1],ty:m[2]}))).map(m=>({...m,px:m.tx*TILE+TILE/2,py:m.ty*TILE+TILE/2,
  home:{x:m.tx,y:m.ty},path:[],aggro:false,wanderCd:rr(500,3000),aiCd:0,atkAnim:0,atkCd:0,face:1,
  hp:MT[m.type].hp,maxHp:MT[m.type].hp,dead:false,respawnAt:0,flash:0}));
const NPCS=fix([
  {tx:11,ty:9,name:"Harley the Hype",sprite:"harley",grant:"fishingRod",lines:[
    "YO! Welcome to 151 O'Connor Keep! Every empire starts with a single sale — LET'S GOOO!",
    "Chop crates & fell trees for Sourcing, mine ore for Data Mining, and batter the beasts of commerce for Checkout Combat.",
    "Here — take this Fishing Rod. Cast it into any body of water to fish, then cook your catch on a campfire!",
    "Now go arm the rebels, champion. The Empire won't know what hit 'em."]},
  {tx:5,ty:6,name:"Banker",sprite:"banker",lines:["The Merchant Bank keeps your GMV and goods safe.","Your realm auto-saves to this browser, friend."]},
  {tx:13,ty:6,name:"The CSM",sprite:"csm",heal:true,give:"merchantFire",lines:[
    "Your Customer Success Manager, here to keep your Health Score high.",
    "Take a Merchant Fire — combine it with Product Logs to build a campfire and cook your catch.",
    "Come back any time you need a heal or another spark."]},
  {tx:4,ty:11,name:"The Partner",sprite:"partner",lines:[
    "I'm an agency crafter — I forge apps and themes into gear.",
    "Bring GMV to the General Store and I'll keep the forge stocked for you."]},
  {tx:2,ty:17,name:"Tobi the Founder",sprite:"tobi",bugGiver:true,lines:[
    "Oh — didn't see you there. Just building mechanical keyboards between StarCraft matches.",
    "The realm's crawling with Bugs. Squash enough of them and I'll forge you something legendary — in Rust.",
    "Memory-safe. Never segfaults. You'll see."]},
  {tx:8,ty:16,name:"The RevOps Oracle",sprite:"oracle",lines:[
    "The sacred mart says: use governed data, brave ranger. The raw-table swamp is cursed."]},
]).map(n=>({...n,px:n.tx*TILE+TILE/2,py:n.ty*TILE+TILE/2,home:{x:n.tx,y:n.ty},path:[],wanderCd:rr(800,3500),face:1}));
const DEFAULT=(charKey)=>{const c=CHARS[charKey]||CHARS.shoppy;const inv={};inv[c.weapon]=1;inv[c.shield]=1;if(c.body)inv[c.body]=1;inv.elixir=3;inv.portalStone=1;
  return{player:{px:8*TILE+20,py:8*TILE+20,hp:30,maxHp:30,path:[],anim:0,face:1,atkAnim:0,
    char:charKey||"shoppy",weapon:c.weapon,shield:c.shield,head:null,body:c.body||null,legs:null,hands:null},
    skills:{selling:{xp:0},sourcing:{xp:0},mining:{xp:0},fishing:{xp:0}},inv,gmv:0,bank:{},granted:{},quests:{},buffs:{},reveal:false,
    kills:0,bugKills:0,scout:false};};
let dialogIdx={};
let state=load(); // null => show character-select on boot
let pending=null; // {kind:'monster'|'crate'|'npc'|'building', ref}
let inBuilding=null; // 'store' | 'bank' | null
function equipAtk(){const w=ITEM_DEFS[state.player.weapon];let a=w&&w.atk?w.atk:0;if(state.buffs&&state.buffs.capital)a+=4;if(state.buffs&&state.buffs.launch)a+=3;return a;}
function equipDef(){let d=0;for(const slot of ["shield","head","body","legs","hands"]){const it=ITEM_DEFS[state.player[slot]];if(it&&it.def)d+=it.def;}return d;}
// ---- quests (Design Bible) ----
const QUESTS=[
  {id:"firstSale",name:"The First Sale",desc:"Defeat your first enemy of commerce to prove your mettle."},
  {id:"logs",name:"Clear the Path",desc:"Fell a Product Tree to open the road."},
  {id:"mine",name:"Into the Data Warehouse",desc:"Mine GMV Ore from a rocky outcrop."},
  {id:"churn",name:"Slay the Churn Reaper",desc:"Defeat the Churn Dragon in the Fulfillment Fortress."},
  {id:"deprecation",name:"The Great Deprecation",desc:"Destroy the Legacy Code Lich haunting the Data Warehouse."},
  {id:"rebels",name:"Arm the Rebels",desc:"Defeat Jeff Bezos, Emperor of the Everything Store."},
  {id:"scout",name:"Scout's Love",desc:"Defeat 25 enemies of commerce to earn a loyal companion.",count:()=>state.kills||0,goal:25},
  {id:"bugs",name:"Squash 25 Bugs",desc:"Tobi won't part with the Rust Blade until you squash 25 Bugs.",count:()=>state.bugKills||0,goal:25,fromTobi:true},
];
function questProgress(id){if(!state.quests)state.quests={};if(state.quests[id])return;state.quests[id]=true;
  const q=QUESTS.find(x=>x.id===id);if(q)log(`✔ Quest complete: <b>${q.name}</b>!`,"gold");}
function checkKillQuests(){if(!state.quests)state.quests={};
  if(!state.quests.scout&&(state.kills||0)>=25){questProgress("scout");grantScout();}}
function grantScout(){state.scout=true;scout.active=true;scout.px=state.player.px-24;scout.py=state.player.py-16;scout.cd=0;
  log("🐕 <b>Scout</b> the dog has decided you're worthy — he now follows you and joins your fights!","gold");}
// ---- Sidekick companion familiar ----
let companion={active:false,until:0,cd:0,px:0,py:0};
// ---- Scout: a permanent dog companion earned from the "Scout's Love" quest ----
let scout={active:false,px:0,py:0,cd:0,face:1};
function scoutTick(dt){const p=state.player;const now=Date.now();
  const tx=p.px-24*(p.face||1),ty=p.py+8;scout.face=(tx<scout.px)?-1:1;
  scout.px+=(tx-scout.px)*0.14;scout.py+=(ty-scout.py)*0.14;scout.cd-=dt;
  if(scout.cd<=0){scout.cd=850;let best=null,bd=3.5;
    for(const m of monsters){if(m.dead)continue;const dd=Math.hypot((m.px-p.px)/TILE,(m.py-p.py)/TILE);if(dd<bd){bd=dd;best=m;}}
    if(best){const dmg=2+Math.floor(Math.random()*4);best.hp-=dmg;best.flash=8;hitsplat(best.px,best.py,dmg,"#c8944a");
      if(best.hp<=0){const d=MT[best.type];best.dead=true;best.respawnAt=now+(best.type==="bug"?12000:300000);best.aggro=false;state.gmv+=d.gmv;
        state.kills=(state.kills||0)+1;if(best.type==="bug")state.bugKills=(state.bugKills||0)+1;gainXp("selling",Math.floor(d.xp*0.3));}}}}
function companionTick(dt){const p=state.player;const now=Date.now();
  if(now>companion.until){companion.active=false;log("Your Sidekick familiar fades away.","");return;}
  companion.px+=((p.px-26)-companion.px)*0.12;companion.py+=((p.py-20)-companion.py)*0.12;companion.cd-=dt;
  if(companion.cd<=0){companion.cd=900;let best=null,bd=4;
    for(const m of monsters){if(m.dead)continue;const dd=Math.hypot((m.px-p.px)/TILE,(m.py-p.py)/TILE);if(dd<bd){bd=dd;best=m;}}
    if(best){const dmg=3+Math.floor(Math.random()*4);best.hp-=dmg;best.flash=8;hitsplat(best.px,best.py,dmg,"#6ea8ff");
      if(best.hp<=0){const d=MT[best.type];best.dead=true;best.respawnAt=now+d.respawn*1000;best.aggro=false;state.gmv+=d.gmv;gainXp("selling",Math.floor(d.xp*0.3));}}}}
// ============================================================ XP / PROGRESSION
function xpForLevel(l){let t=0;for(let n=1;n<l;n++)t+=Math.floor(n+300*Math.pow(2,n/7));return Math.floor(t/4);}
function levelForXp(xp){let l=1;while(l<99&&xpForLevel(l+1)<=xp)l++;return l;}
function gainXp(sk,amt){if(!state.skills[sk])state.skills[sk]={xp:0};const b=levelForXp(state.skills[sk].xp);state.skills[sk].xp+=amt;const a=levelForXp(state.skills[sk].xp);
  xpdrops.push({x:state.player.px,y:state.player.py-24,val:amt,glyph:SKILL_DEFS.find(s=>s.key===sk).glyph,life:70});
  if(a>b){const d=SKILL_DEFS.find(s=>s.key===sk);log(`Congratulations! Your <b>${d.name}</b> level is now <b>${a}</b>.`,"gold");
    if(sk==="selling"){state.player.maxHp=30+(a-1)*4;state.player.hp=state.player.maxHp;}}}
function addItem(k,q){state.inv[k]=(state.inv[k]||0)+q;}

// ============================================================ FX
let hitsplats=[],xpdrops=[],marker=null,lastAction=0,selectedItem=null;
function applyCurse(){state.player.curseUntil=Date.now()+300000;selectedItem=null;
  log("Your SDP access has been revoked since you're in the Commercial org. As a result, you've lost visibility for the next 5 minutes.","bad");}
function buildCampfire(){const p=state.player;const pt=pxTile(p.px,p.py);let tx=pt.x+(p.face||1),ty=pt.y;
  if(!inb(tx,ty)||map[ty][tx]===T.WATER||map[ty][tx]===T.SWAMP){tx=pt.x;ty=pt.y+1;}
  if(!inb(tx,ty)||map[ty][tx]===T.WATER||map[ty][tx]===T.SWAMP){tx=pt.x;ty=pt.y;}
  objects.push({type:"campfire",tx,ty,burnUntil:Date.now()+120000});}
// ---- Tier-1 atmosphere: particles, day/night, lighting, shake ----
let worldClock=0,parts=[],shake=0;
const ZONE_TINT={"151 O'Connor Keep":"rgba(255,228,150,0.05)","The Data Warehouse":"rgba(120,160,255,0.06)","BFCM Battlefield":"rgba(255,150,70,0.06)","Fulfillment Fortress":"rgba(200,70,70,0.07)"};
function nightFactor(){return (1-Math.cos(worldClock/240000*Math.PI*2))/2;}
function spawnPart(x,y,vx,vy,life,color,size,grav){if(parts.length>240)return;parts.push({x,y,vx,vy,life,maxLife:life,color,size,grav:grav||0});}
function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*7,s=20+Math.random()*50;spawnPart(x,y,Math.cos(a)*s,Math.sin(a)*s-15,260+Math.random()*220,color,1.4+Math.random()*1.6,90);}}
function updateParticles(dt){
  for(const o of objects)if(o.type==="campfire"&&Math.random()<0.5)spawnPart(o.tx*TILE+TILE/2+(Math.random()-0.5)*8,o.ty*TILE+TILE-6,(Math.random()-0.5)*6,-22-Math.random()*22,700+Math.random()*400,Math.random()<0.5?"#ffb020":"#ff6a1a",1+Math.random()*1.4,-6);
  if(nightFactor()>0.35&&Math.random()<0.35){const px=state.player.px+(Math.random()-0.5)*440,py=state.player.py+(Math.random()-0.5)*320;spawnPart(px,py,(Math.random()-0.5)*10,(Math.random()-0.5)*10,1600,"#d6e88a",1.4,0);}
  for(const pt of parts){pt.life-=dt;pt.x+=pt.vx*dt/1000;pt.y+=pt.vy*dt/1000;if(pt.grav)pt.vy+=pt.grav*dt/1000;}
  parts=parts.filter(p=>p.life>0);}
function drawParticles(){for(const pt of parts){const sx=SX(pt.x),sy=SY(pt.y);if(sx<-16||sx>VW+16||sy<-16||sy>VH+16)continue;
  ctx.globalAlpha=Math.max(0,Math.min(1,pt.life/pt.maxLife));ctx.fillStyle=pt.color;ctx.beginPath();ctx.arc(sx,sy,pt.size,0,7);ctx.fill();}ctx.globalAlpha=1;}
function drawAtmosphere(){const tint=ZONE_TINT[curZone()];if(tint){ctx.fillStyle=tint;ctx.fillRect(0,0,VW,VH);}
  const nf=nightFactor();
  if(nf>0.02){ctx.fillStyle="rgba(10,14,34,"+(0.5*nf)+")";ctx.fillRect(0,0,VW,VH);
    ctx.save();ctx.globalCompositeOperation="lighter";
    const light=(wx,wy,r,col)=>{const sx=SX(wx),sy=SY(wy);if(sx<-r||sx>VW+r||sy<-r||sy>VH+r)return;const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();};
    for(const o of objects){if(o.type==="campfire")light(o.tx*TILE+TILE/2,o.ty*TILE+TILE-6,95,"rgba(255,150,60,"+(0.55*nf)+")");
      else if(o.type==="lamp")light(o.tx*TILE+TILE/2,o.ty*TILE-16,72,"rgba(255,210,120,"+(0.5*nf)+")");}
    light(state.player.px,state.player.py,120,"rgba(200,210,255,"+(0.16*nf)+")");
    ctx.restore();}
  const vg=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*0.36,VW/2,VH/2,Math.max(VW,VH)*0.72);
  vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,0.34)");ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VH);}
function hitsplat(x,y,val,color){hitsplats.push({x,y,val,color,life:34});}

// ============================================================ INPUT (click-to-walk, RS style)
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const mmCanvas=document.getElementById("minimap"),mmctx=mmCanvas.getContext("2d");
let VW=800,VH=600;const cam={x:0,y:0};
function resize(){const w=document.getElementById("game-wrap");VW=w.clientWidth;VH=w.clientHeight;canvas.width=VW;canvas.height=VH;
  if(mmCanvas){mmCanvas.width=mmCanvas.clientWidth||238;mmCanvas.height=mmCanvas.clientHeight||170;}}
window.addEventListener("resize",resize);
function goTo(tx,ty){const pt=pxTile(state.player.px,state.player.py);const p=findPath(pt.x,pt.y,tx,ty);state.player.path=p||[];}
function setPending(kind,ref){pending={kind,ref};const pt=pxTile(state.player.px,state.player.py);
  const cheb=Math.max(Math.abs(pt.x-ref.tx),Math.abs(pt.y-ref.ty));
  if(cheb<=1){state.player.path=[];return;}
  const adj=adjacentTile(ref.tx,ref.ty,pt.x,pt.y);if(adj)goTo(adj.x,adj.y);}
canvas.addEventListener("click",e=>{
  const r=canvas.getBoundingClientRect();const wx=e.clientX-r.left+cam.x,wy=e.clientY-r.top+cam.y;
  const tx=Math.floor(wx/TILE),ty=Math.floor(wy/TILE);
  const mo=monsters.find(m=>!m.dead&&m.tx===tx&&m.ty===ty);
  if(mo){setPending("monster",mo);marker={x:wx,y:wy,life:30,kind:"red"};return;}
  const cr=crates.find(c=>c.tx===tx&&c.ty===ty);
  if(cr){setPending("crate",cr);marker={x:wx,y:wy,life:30,kind:"red"};return;}
  const tr=objects.find(o=>(o.type==="tree"||o.type==="deadtree")&&!o.felled&&o.tx===tx&&o.ty===ty);
  if(tr){setPending("tree",tr);marker={x:wx,y:wy,life:30,kind:"red"};return;}
  const rk=objects.find(o=>o.type==="rock"&&o.tx===tx&&o.ty===ty);
  if(rk){setPending("rock",rk);marker={x:wx,y:wy,life:30,kind:"red"};return;}
  const cf=objects.find(o=>o.type==="campfire"&&o.tx===tx&&o.ty===ty);
  if(cf){setPending("campfire",cf);marker={x:wx,y:wy,life:30,kind:"red"};return;}
  const np=NPCS.find(n=>n.tx===tx&&n.ty===ty);
  if(np){setPending("npc",np);marker={x:wx,y:wy,life:30,kind:"red"};return;}
  const b=objects.find(o=>(o.type==="bank"||o.type==="store"||o.type==="hackhq")&&tx>=o.tx&&tx<o.tx+o.w&&ty>=o.ty&&ty<o.ty+o.h);
  if(b){setPending("building",{tx:b.door.x,ty:b.door.y,bkind:b.type});marker={x:(b.door.x+0.5)*TILE,y:(b.door.y+0.5)*TILE,life:30,kind:"red"};return;}
  if(inb(tx,ty)&&(map[ty][tx]===T.WATER||map[ty][tx]===T.SWAMP)){
    if((state.inv.fishingRod||0)>0){setPending("fish",{tx,ty,swamp:map[ty][tx]===T.SWAMP});marker={x:wx,y:wy,life:30,kind:"red"};}
    else{log("You need a Fishing Rod to fish here — speak to <b>Harley the Hype</b>.","");}return;}
  pending=null;goTo(tx,ty);marker={x:wx,y:wy,life:30,kind:"yellow"};
});

// ============================================================ MOVEMENT + ACTION TICK
function movement(dt){const p=state.player;if(!p.path||!p.path.length){p.moving=false;return;}
  const wp=p.path[0],tc=tileC(wp.x,wp.y);const dx=tc.x-p.px,dy=tc.y-p.py,d=Math.hypot(dx,dy);
  const spd=145*dt/1000;p.moving=true;
  if(d<=spd){p.px=tc.x;p.py=tc.y;p.path.shift();}
  else{p.px+=dx/d*spd;p.py+=dy/d*spd;if(Math.abs(dx)>0.5)p.face=dx<0?-1:1;}
  if(Math.random()<0.14)spawnPart(p.px+(Math.random()-0.5)*6,p.py+14,(Math.random()-0.5)*8,-6,260,"#b8a06a",1.3,12);
  p.anim+=dt/90;}
function talk(n){const i=(dialogIdx[n.name]||0)%n.lines.length;log(`<b>${n.name}:</b> ${n.lines[i]}`,"sys");dialogIdx[n.name]=i+1;
  const p=state.player;
  if(n.heal&&p.hp<p.maxHp){p.hp=p.maxHp;hitsplat(p.px,p.py-4,"heal","#4fae5a");log("The CSM restores your Health Score to full.","good");}
  if(n.grant){state.granted=state.granted||{};if(!state.granted[n.grant]){state.granted[n.grant]=1;addItem(n.grant,1);
    log(`You receive the <b>${ITEM_DEFS[n.grant].name}</b>! ${ITEM_DEFS[n.grant].kind?"Equip it":"Use it"} from your inventory.`,"gold");}}
  if(n.give&&(state.inv[n.give]||0)<1){addItem(n.give,1);log(`The CSM hands you a <b>${ITEM_DEFS[n.give].name}</b>.`,"good");}
  if(n.bugGiver){state.quests=state.quests||{};
    if(!state.quests.bugsStarted){state.quests.bugsStarted=true;log("<b>Tobi:</b> Here's the deal — squash <b>25 Bugs</b> and the Founder's Rust Blade is yours.","gold");}
    else if((state.bugKills||0)<25){log(`<b>Tobi:</b> You've squashed <b>${state.bugKills||0}/25</b> Bugs. Keep at it, ranger.`,"sys");}
    else if(!(state.granted&&state.granted.foundersRustBlade)){state.granted=state.granted||{};state.granted.foundersRustBlade=1;addItem("foundersRustBlade",1);questProgress("bugs");log("<b>Tobi:</b> 25 Bugs squashed! As promised — the <b>Founder's Rust Blade</b>. Equip it from your inventory.","gold");}
    else{log("<b>Tobi:</b> Go arm the rebels, champion.","sys");}}}
function actionTick(){if(!pending)return;const p=state.player,ref=pending.ref;
  if(pending.kind==="monster"&&ref.dead){pending=null;return;}
  if(p.path&&p.path.length)return;
  const pt=pxTile(p.px,p.py);const cheb=Math.max(Math.abs(pt.x-ref.tx),Math.abs(pt.y-ref.ty));
  if(cheb>1){const adj=adjacentTile(ref.tx,ref.ty,pt.x,pt.y);if(adj)goTo(adj.x,adj.y);else pending=null;return;}
  p.face=(ref.tx*TILE+TILE/2)<p.px?-1:1;
  if(pending.kind==="npc"){talk(ref);pending=null;return;}
  if(pending.kind==="building"){openBuilding(ref.bkind);pending=null;return;}
  const now=Date.now();
  if(pending.kind==="crate"){const c=ref;if(c.cd>0){pending=null;return;}if(now-lastAction<800)return;lastAction=now;
    p.atkAnim=ATK_FRAMES;addItem("rawGoods",1);gainXp("sourcing",15);c.cd=3000;
    log("You chop some Raw Goods from the Product Crate.","good");pending=null;return;}
  if(pending.kind==="tree"){const o=ref;if(o.felled){pending=null;return;}if(now-lastAction<700)return;lastAction=now;
    p.atkAnim=ATK_FRAMES;gainXp("sourcing",10);o.hp--;
    if(o.hp<=0){o.felled=true;o.respawnAt=now+300000;blockObj[o.ty][o.tx]=0;addItem("logs",1);
      log("Timber! You fell the tree and clear the path.","good");questProgress("logs");pending=null;}return;}
  if(pending.kind==="rock"){const o=ref;if(o.cd>0){pending=null;return;}if(now-lastAction<750)return;lastAction=now;
    p.atkAnim=ATK_FRAMES;gainXp("mining",12);addItem("ore",1);o.cd=4000;
    log("You mine some GMV Ore from the outcrop.","good");questProgress("mine");pending=null;return;}
  if(pending.kind==="fish"){const o=ref;if((state.inv.fishingRod||0)<1){log("You need a Fishing Rod. Speak to Harley the Hype.","");pending=null;return;}
    if(now-lastAction<1200)return;lastAction=now;p.atkAnim=ATK_FRAMES;gainXp("fishing",13);
    if(o.swamp){addItem("badData",1);log("You haul <b>Bad Data</b> out of the cursed swamp.","bad");
      log("SDP Access has been revoked for the Commercial org — it'd be a shame for you to try to cook with this.","bad");}
    else{addItem("rawFish",1);log("You reel in a <b>Raw Fish</b>!","good");}
    pending=null;return;}
  if(pending.kind==="campfire"){
    if(selectedItem==="rawFish"&&(state.inv.rawFish||0)>0){state.inv.rawFish--;addItem("cookedFish",1);gainXp("fishing",8);
      log("You grill the fish over the Merchant Fire — a hot <b>Cooked Fish</b>!","good");selectedItem=null;pending=null;return;}
    if(selectedItem==="badData"){applyCurse();selectedItem=null;pending=null;return;}
    log("Select a <b>Raw Fish</b> in your inventory, then click the campfire to cook it.","");pending=null;return;}
  if(pending.kind==="monster"){const m=ref,d=MT[m.type];const w=ITEM_DEFS[state.player.weapon]||{};const spd=w.spd||640;
    if(now-lastAction<spd)return;lastAction=now;p.atkAnim=ATK_FRAMES;
    const lvl=levelForXp(state.skills.selling.xp);let dmg=1+Math.floor(Math.random()*(2+Math.floor(lvl*0.6)+(w.atk||0)));
    let crit=false;
    if(w.strongVs&&w.strongVs.includes(d.class))dmg=Math.round(dmg*1.5);
    else if(w.weakVs&&w.weakVs.includes(d.class))dmg=Math.max(1,Math.round(dmg*0.6));
    if(w.crit&&Math.random()<w.crit){dmg*=2;crit=true;}
    if(w.selfDmg){p.hp-=w.selfDmg;hitsplat(p.px,p.py-4,w.selfDmg,"#a11");}
    m.hp-=dmg;m.flash=8;hitsplat(m.px,m.py,dmg,crit?"#ffd166":"#c8342f");burst(m.px,m.py,crit?"#ffd166":"#c8342f",crit?10:5);if(crit)shake=Math.min(9,shake+5);
    if(p.hp<=0){die();return;}
    if(m.hp<=0){m.dead=true;m.respawnAt=now+(m.type==="bug"?12000:300000);m.aggro=false;pending=null;gainXp("selling",d.xp);
      const find=(ITEM_DEFS[state.player.head]&&ITEM_DEFS[state.player.head].find)||1;state.gmv+=Math.round(d.gmv*find);
      hitsplat(m.px,m.py-14,"+"+Math.round(d.gmv*find),"#e8c46a");
      let msg=`You defeat the <b>${d.name}</b>. (+${d.xp} Checkout Combat xp, +${Math.round(d.gmv*find)} GMV)`;
      const dropChance=(d.boss?1:0.4)*find;
      if(d.drop&&Math.random()<dropChance){addItem(d.drop,1);msg+=` It drops a <b>${ITEM_DEFS[d.drop].name}</b>!`;}
      log(msg,d.boss?"gold":"good");
      state.kills=(state.kills||0)+1;if(m.type==="bug")state.bugKills=(state.bugKills||0)+1;checkKillQuests();
      questProgress("firstSale");
      if(m.type==="dragon"){questProgress("churn");log("🏆 The Churn Dragon is slain! The Rebels rejoice.","gold");}
      if(m.type==="lich"){questProgress("deprecation");log("🏆 The Legacy Code Lich crumbles into deprecated dust.","gold");}
      if(m.type==="bezos"){questProgress("rebels");log("👑 THE EMPEROR FALLS. The Everything Store is broken — the merchants are free!","gold");}}}}
function die(){log("Oh dear, your storefront has crashed! You wake up in Shopville.","bad");
  state.player.hp=state.player.maxHp;state.player.px=8*TILE+20;state.player.py=8*TILE+20;state.player.path=[];pending=null;
  for(const m of monsters){m.aggro=false;m.path=[];}}
function moveEntity(e,speed,dt){if(!e.path||!e.path.length)return false;const wp=e.path[0],tc=tileC(wp.x,wp.y);
  const dx=tc.x-e.px,dy=tc.y-e.py,dd=Math.hypot(dx,dy),step=speed*dt/1000;
  if(dd<=step){e.px=tc.x;e.py=tc.y;e.path.shift();}else{e.px+=dx/dd*step;e.py+=dy/dd*step;if(Math.abs(dx)>0.5)e.face=dx<0?-1:1;}
  const t=pxTile(e.px,e.py);e.tx=t.x;e.ty=t.y;return true;}
function monsterAI(m,dt){const d=MT[m.type];const p=state.player;
  if(m.atkAnim>0)m.atkAnim--;if(m.atkCd>0)m.atkCd-=dt;
  const pt=pxTile(p.px,p.py);const distP=Math.hypot(m.tx-pt.x,m.ty-pt.y);const distHome=Math.hypot(m.tx-m.home.x,m.ty-m.home.y);
  if(!inBuilding&&p.hp>0&&distP<=d.aggro)m.aggro=true;
  if(inBuilding||p.hp<=0||distHome>10)m.aggro=false;
  if(m.aggro){const cheb=Math.max(Math.abs(m.tx-pt.x),Math.abs(m.ty-pt.y));
    if(cheb<=1){m.path=[];m.face=p.px<m.px?-1:1;
      if(m.atkCd<=0){m.atkCd=d.phases&&m.hp<m.maxHp*0.4?650:1000;m.atkAnim=ATK_FRAMES;
        let raw=d.dmg;if(d.phases&&m.hp<m.maxHp*0.4)raw=Math.round(raw*1.4); // Bezos enrage (Undercut Meltdown)
        const dmg=Math.max(1,raw-Math.floor(equipDef()*Math.random()));p.hp-=dmg;hitsplat(p.px,p.py-4,dmg,"#c8342f");
        burst(p.px,p.py-4,"#c8342f",5);shake=Math.min(12,shake+(d.boss?9:5));
        if(d.phases&&m.hp<m.maxHp*0.5&&Math.random()<0.06){m.hp=Math.min(m.maxHp,m.hp+6);hitsplat(m.px,m.py,"+6","#4fae5a");} // Infinite Runway heal
        if(!pending)setPending("monster",m);if(p.hp<=0)die();}}
    else{m.aiCd-=dt;if(m.aiCd<=0||!m.path.length){m.aiCd=400;const adj=adjacentTile(pt.x,pt.y,m.tx,m.ty)||{x:pt.x,y:pt.y};m.path=findPath(m.tx,m.ty,adj.x,adj.y)||[];}
      moveEntity(m,d.spd,dt);}}
  else{if(m.path&&m.path.length)moveEntity(m,d.spd*0.5,dt);
    else{m.wanderCd-=dt;if(m.wanderCd<=0){m.wanderCd=rr(1600,4200);
      const a=nearestWalkable(m.home.x+((rr(0,6))|0)-3,m.home.y+((rr(0,6))|0)-3);
      if(a)m.path=findPath(m.tx,m.ty,a.x,a.y)||[];}}}}
function npcTick(n,dt){if(pending&&pending.kind==="npc"&&pending.ref===n){n.path=[];return;}
  if(n.path&&n.path.length){moveEntity(n,55,dt);return;}
  n.wanderCd-=dt;if(n.wanderCd<=0){n.wanderCd=rr(2600,6200);
    const a=nearestWalkable(n.home.x+((rr(0,5))|0)-2,n.home.y+((rr(0,5))|0)-2);
    if(a)n.path=findPath(n.tx,n.ty,a.x,a.y)||[];}}
function worldTick(dt){const now=Date.now();
  worldClock+=dt;updateParticles(dt);if(shake>0)shake=Math.max(0,shake-dt*0.03);
  for(const c of crates)if(c.cd>0)c.cd-=dt;
  for(const o of objects)if(o.felled&&now>=o.respawnAt){const pt=pxTile(state.player.px,state.player.py);
    if(pt.x===o.tx&&pt.y===o.ty){o.respawnAt=now+1500;continue;}o.felled=false;o.hp=2;blockObj[o.ty][o.tx]=1;}
  for(const o of objects)if(o.type==="rock"&&o.cd>0)o.cd-=dt;
  for(let i=objects.length-1;i>=0;i--)if(objects[i].type==="campfire"&&now>objects[i].burnUntil)objects.splice(i,1);
  for(const n of NPCS)npcTick(n,dt);
  if(state.buffs){for(const k in state.buffs){if(state.buffs[k]>0){state.buffs[k]-=dt;if(state.buffs[k]<=0){delete state.buffs[k];log("A buff wears off.","");}}}}
  if(companion.active){companionTick(dt);}
  if(state.scout&&!scout.active){scout.active=true;scout.px=state.player.px-24;scout.py=state.player.py;}
  if(scout.active){scoutTick(dt);}
  for(const m of monsters){
    if(m.dead){if(now>=m.respawnAt){m.dead=false;m.hp=m.maxHp;m.aggro=false;m.path=[];
      m.px=m.home.x*TILE+TILE/2;m.py=m.home.y*TILE+TILE/2;m.tx=m.home.x;m.ty=m.home.y;}continue;}
    if(m.flash>0)m.flash--;monsterAI(m,dt);}
  if(state.player.atkAnim>0)state.player.atkAnim--;
  for(const h of hitsplats)h.life--;hitsplats=hitsplats.filter(h=>h.life>0);
  for(const x of xpdrops)x.life--;xpdrops=xpdrops.filter(x=>x.life>0);
  if(marker){marker.life--;if(marker.life<=0)marker=null;}}
// ============================================================ RENDER
function updateCam(){const p=state.player;cam.x=p.px-VW/2;cam.y=p.py-VH/2;
  cam.x=Math.max(0,Math.min(cam.x,MAP_W*TILE-VW));cam.y=Math.max(0,Math.min(cam.y,MAP_H*TILE-VH));
  if(MAP_W*TILE<VW)cam.x=(MAP_W*TILE-VW)/2;if(MAP_H*TILE<VH)cam.y=(MAP_H*TILE-VH)/2;
  if(shake>0.3){cam.x+=(Math.random()-0.5)*shake;cam.y+=(Math.random()-0.5)*shake;}}
const SX=x=>x-cam.x, SY=y=>y-cam.y;
function shadow(sx,sy,w){ctx.fillStyle="rgba(0,0,0,0.28)";ctx.beginPath();ctx.ellipse(sx,sy,w,w*0.42,0,0,7);ctx.fill();}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawWater(){const t=Date.now()/600;const x0=Math.floor(cam.x/TILE),y0=Math.floor(cam.y/TILE);
  for(let y=y0;y<y0+VH/TILE+2;y++)for(let x=x0;x<x0+VW/TILE+2;x++){if(!inb(x,y))continue;const tt=map[y][x];
    if(tt!==T.WATER&&tt!==T.SWAMP)continue;const sw=tt===T.SWAMP;const sx=SX(x*TILE),sy=SY(y*TILE);
    ctx.fillStyle=(sw?"rgba(120,200,150,":"rgba(150,200,225,")+(0.06+0.06*Math.sin(t+x*0.7+y*0.5))+")";ctx.fillRect(sx,sy,TILE,TILE);
    ctx.strokeStyle=sw?"rgba(150,230,180,0.12)":"rgba(210,235,245,0.10)";ctx.lineWidth=1.5;ctx.beginPath();
    const yy=sy+TILE/2+Math.sin(t+x)*5;ctx.moveTo(sx,yy);ctx.quadraticCurveTo(sx+TILE/2,yy+4,sx+TILE,yy);ctx.stroke();
    if(sw&&(x+y+Math.floor(t*0.5))%5===0){ctx.fillStyle="rgba(180,255,200,0.28)";ctx.beginPath();ctx.arc(sx+TILE*0.5,sy+TILE*0.4+Math.sin(t*2+x)*4,2,0,7);ctx.fill();}}}
function drawMarker(){if(!marker)return;const sx=SX(marker.x),sy=SY(marker.y);const a=marker.life/30;const s=6+(1-a)*6;
  ctx.strokeStyle=marker.kind==="red"?`rgba(220,60,50,${a})`:`rgba(240,220,60,${a})`;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(sx-s,sy-s);ctx.lineTo(sx+s,sy+s);ctx.moveTo(sx+s,sy-s);ctx.lineTo(sx-s,sy+s);ctx.stroke();}
function hpbar(sx,sy,w,f,bossName){ctx.fillStyle="#000";ctx.fillRect(sx-w/2-1,sy-1,w+2,6);
  ctx.fillStyle="#3a0a08";ctx.fillRect(sx-w/2,sy,w,4);ctx.fillStyle="#38b04a";ctx.fillRect(sx-w/2,sy,w*Math.max(0,Math.min(1,f)),4);
  if(bossName){ctx.fillStyle="#e8c46a";ctx.font="bold 10px Trebuchet MS";ctx.textAlign="center";ctx.fillText(bossName,sx,sy-6);}}
// ---- sprites ----
const ATK_FRAMES=20;
function roundRectG(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// weapon in the front hand (hx,hy). ext=forward thrust px, sw=swing 0..1
function drawWeapon(g,key,hx,hy,face,ext,sw){g.save();
  if(key==="waterStaff"){g.strokeStyle="#6b4a2f";g.lineWidth=3;g.beginPath();g.moveTo(hx,hy+7);g.lineTo(hx,hy-15);g.stroke();
    const ox=hx,oy=hy-18,rad=4+sw*3;const gr=g.createRadialGradient(ox,oy,0,ox,oy,rad+4);gr.addColorStop(0,"#bfe8ff");gr.addColorStop(1,"rgba(60,150,220,0)");
    g.fillStyle=gr;g.beginPath();g.arc(ox,oy,rad+4,0,7);g.fill();g.fillStyle="#3aa0e0";g.beginPath();g.arc(ox,oy,rad,0,7);g.fill();
    if(sw>0.25){g.fillStyle="rgba(120,200,255,"+sw+")";for(let i=0;i<3;i++){g.beginPath();g.arc(hx+face*(12+ext+i*6),hy-6-i*2,3-i*0.6,0,7);g.fill();}}}
  else if(key==="whiteGloves"){const gx=hx+face*(6+ext);g.fillStyle="#e9edf2";g.strokeStyle="#c2c8d0";g.lineWidth=1.5;
    g.beginPath();g.arc(gx,hy,5,0,7);g.fill();g.stroke();g.fillStyle="#f6f8fb";g.fillRect(gx-face*2-3,hy+3,6,3);
    g.strokeStyle="#c2c8d0";g.beginPath();g.moveTo(gx-3,hy-1);g.lineTo(gx+3,hy-1);g.stroke();}
  else if(key==="fancyCane"){const ex=hx+face*(8+ext),ey=hy+2;g.strokeStyle="#2a1c10";g.lineWidth=3;
    g.beginPath();g.moveTo(hx,hy+6);g.lineTo(ex,ey);g.stroke();g.strokeStyle="#e8c46a";g.lineWidth=3;
    g.beginPath();g.arc(hx-face*2,hy+4,3,0,Math.PI);g.stroke();g.fillStyle="#e8c46a";g.beginPath();g.arc(ex,ey,2.5,0,7);g.fill();}
  else if(key==="buyButton"){const ex=hx+face*(16+ext);g.strokeStyle="#cfe4ff";g.lineWidth=4;g.beginPath();g.moveTo(hx,hy);g.lineTo(ex,hy-6);g.stroke();
    g.strokeStyle="#8899aa";g.lineWidth=2;g.beginPath();g.moveTo(hx-face*2,hy-4);g.lineTo(hx+face*2,hy+4);g.stroke();
    g.fillStyle="#5b3f22";g.fillRect(hx-face*4,hy-1,face*4,3);}
  else{g.fillStyle="#888";g.fillRect(hx,hy-8,3,12);}
  g.restore();}
function drawShield(g,key,sx,sy,face){g.save();const w=11,h=14;
  const body=(fill,stroke)=>{g.fillStyle=fill;g.strokeStyle=stroke||"#000";g.lineWidth=1.5;
    g.beginPath();g.moveTo(sx-w/2,sy-h/2);g.lineTo(sx+w/2,sy-h/2);g.lineTo(sx+w/2,sy+2);g.lineTo(sx,sy+h/2);g.lineTo(sx-w/2,sy+2);g.closePath();g.fill();g.stroke();};
  if(key==="blastShield"){body("#2f8fb0","#0d3b4a");g.strokeStyle="#bfe8ff";g.lineWidth=1.5;
    for(let i=1;i<=2;i++){g.beginPath();g.arc(sx,sy-2,i*3,0,7);g.stroke();}}
  else if(key==="moneyShield"){body("#3a7d3a","#12300f");g.fillStyle="#e8c46a";g.font="bold 10px Trebuchet MS";g.textAlign="center";g.fillText("$",sx,sy+2);}
  else if(key==="trillionShield"){body("#d9b24a","#5a3f10");g.fillStyle="#fff6d6";g.beginPath();g.moveTo(sx,sy-5);g.lineTo(sx+4,sy-1);g.lineTo(sx,sy+4);g.lineTo(sx-4,sy-1);g.closePath();g.fill();
    g.fillStyle="#5a3f10";g.font="bold 6px Trebuchet MS";g.textAlign="center";g.fillText("1T",sx,sy+9);}
  else{body("#8a8f98","#333");}
  g.restore();}
// draws a character centered at origin (feet ~ +16). g already translated to screen pos.
function drawCharacter(g,o){const face=o.face||1;const sw=o.atkProg?Math.sin((1-o.atkProg)*Math.PI):0;
  const walk=o.moving?Math.sin((o.anim||0)*2):0;const bob=o.moving?Math.abs(walk)*2:0;
  g.save();g.translate(0,-bob);
  // shadow
  g.fillStyle="rgba(0,0,0,0.28)";g.beginPath();g.ellipse(0,16+bob,13,5,0,0,7);g.fill();
  if(o.char==="river"){
    g.fillStyle="#25506f";g.fillRect(-4+walk*2,8,4,8);g.fillRect(2-walk*2,8,4,8); // feet peeking
    // long blue hair behind
    g.fillStyle="#3f9ad6";g.beginPath();g.ellipse(0,-10,10,12,0,0,7);g.fill();
    g.fillRect(-10,-12,4,22);g.fillRect(6,-12,4,22); // long side strands
    const lean=sw*face*3;g.translate(lean,0);
    // robe
    g.fillStyle="#2f6f9e";g.beginPath();g.moveTo(-7,-6);g.lineTo(7,-6);g.lineTo(11,14);g.lineTo(-11,14);g.closePath();g.fill();
    g.fillStyle="#3a86bd";g.fillRect(-11,8,22,3);
    // head + face
    g.fillStyle="#eccca6";g.beginPath();g.arc(0,-13,6,0,7);g.fill();
    g.fillStyle="#3f9ad6";g.beginPath();g.arc(0,-16,6.5,Math.PI,0);g.fill(); // hair fringe
    g.fillStyle="#123";g.fillRect(face>0?1:-3,-14,2,2);
    drawShield(g,o.shield,-face*10,2,face);
    drawWeapon(g,o.weapon,face*7,-6,face,sw*4,sw);
  }else if(o.char==="shoppy"){
    g.fillStyle="#e9edf2";g.fillRect(-5+walk*2,10,4,6);g.fillRect(1-walk*2,10,4,6); // white shoes/feet
    const lunge=sw*face*5;g.translate(lunge,0);
    // green bag body
    g.fillStyle="#95bf47";roundRectG(g,-11,-6,22,22,5);g.fill();
    g.strokeStyle="#7aa337";g.lineWidth=2;g.beginPath();g.moveTo(-11,0);g.lineTo(11,0);g.stroke();
    // handle
    g.strokeStyle="#6f9a30";g.lineWidth=3;g.beginPath();g.arc(0,-6,6,Math.PI,2*Math.PI);g.stroke();
    // face
    g.fillStyle="#fff";g.beginPath();g.arc(-3.5,-1,2.4,0,7);g.arc(3.5,-1,2.4,0,7);g.fill();
    g.fillStyle="#1b2a12";g.beginPath();g.arc(-3.5,-1,1.1,0,7);g.arc(3.5,-1,1.1,0,7);g.fill();
    g.strokeStyle="#1b2a12";g.lineWidth=1.5;g.beginPath();g.arc(0,3,3,0.15*Math.PI,0.85*Math.PI);g.stroke();
    drawShield(g,o.shield,-face*11,4,face);
    drawWeapon(g,o.weapon,face*9,2,face,sw*8,sw); // gloves punch
  }else{ // shoppington
    g.fillStyle="#2a2a2a";g.fillRect(-5+walk*2,10,4,6);g.fillRect(1-walk*2,10,4,6);
    // kraft bag body
    g.fillStyle="#c9a978";roundRectG(g,-11,-4,22,20,3);g.fill();
    g.strokeStyle="#a9895c";g.lineWidth=1.5;g.beginPath();g.moveTo(-11,-4);g.lineTo(-7,-8);g.lineTo(7,-8);g.lineTo(11,-4);g.stroke();
    g.fillStyle="#d8bd92";g.fillRect(-11,-4,22,3);
    // head area (top of bag) with top hat
    g.fillStyle="#e2c39a";g.beginPath();g.arc(0,-10,5,0,7);g.fill();
    g.fillStyle="#161616";g.fillRect(-8,-15,16,3);g.fillRect(-5,-24,10,9); // brim + hat
    g.fillStyle="#7a1d1d";g.fillRect(-5,-17,10,2); // hat band
    // monocle + eyes
    g.fillStyle="#123";g.fillRect(-3,-11,2,2);
    g.strokeStyle="#e8c46a";g.lineWidth=1.2;g.beginPath();g.arc(3,-10,2.6,0,7);g.stroke();
    g.beginPath();g.moveTo(5,-9);g.lineTo(7,-3);g.stroke(); // monocle chain
    drawShield(g,o.shield,-face*11,3,face);
    drawWeapon(g,o.weapon,face*8,0,face,sw*10,sw); // cane thrust
  }
  g.restore();}
function playerHpBar(sx,sy){const p=state.player;if(p.hp>=p.maxHp&&!pending)return;const w=30,f=Math.max(0,Math.min(1,p.hp/p.maxHp)),yy=sy-30;
  ctx.fillStyle="#000";ctx.fillRect(sx-w/2-1,yy-1,w+2,6);ctx.fillStyle="#3a0a08";ctx.fillRect(sx-w/2,yy,w,4);
  ctx.fillStyle="#4fae5a";ctx.fillRect(sx-w/2,yy,w*f,4);}
function drawPlayer(p){const sx=SX(p.px),sy=SY(p.py);
  ctx.save();ctx.translate(sx,sy);
  drawCharacter(ctx,{char:p.char,weapon:p.weapon,shield:p.shield,face:p.face,
    atkProg:p.atkAnim>0?p.atkAnim/ATK_FRAMES:0,moving:p.moving,anim:p.anim});
  ctx.restore();playerHpBar(sx,sy);}
function drawMonster(m){const d=MT[m.type];const sx=SX(m.px),sy=SY(m.py);
  if(sx<-60||sx>VW+60||sy<-60||sy>VH+60)return;
  const R=d.r;const now=Date.now();const face=m.face||1;
  const sw=m.atkAnim>0?Math.sin((1-m.atkAnim/ATK_FRAMES)*Math.PI):0;
  const idle=Math.sin(now/280+m.px)*1.4;
  shadow(sx,sy+R*0.7,R*0.9);ctx.save();ctx.translate(sx,sy+idle);if(m.flash>0)ctx.globalAlpha=0.55;
  // unique per-type attack motion
  if(d.style==="ram")ctx.translate(face*sw*11,0);
  else if(d.style==="hop")ctx.translate(face*sw*4,-sw*9);
  else if(d.style==="drift"){ctx.translate(face*sw*9,0);const s=1+sw*0.15;ctx.scale(s,s);ctx.globalAlpha*=(1-sw*0.25);}
  else if(d.style==="spin")ctx.rotate(sw*Math.PI*2*face);
  else if(d.style==="bite"){ctx.translate(face*sw*10,sw*3);const s=1+sw*0.1;ctx.scale(s,s);}
  if(m.type==="cart"){ctx.strokeStyle="#8a929c";ctx.lineWidth=3;ctx.fillStyle="#b7c0ca";
    ctx.beginPath();ctx.moveTo(-11,-8);ctx.lineTo(11,-8);ctx.lineTo(8,6);ctx.lineTo(-8,6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle="#7a828c";for(let i=-8;i<=8;i+=4){ctx.beginPath();ctx.moveTo(i,-8);ctx.lineTo(i*0.7,6);ctx.stroke();}
    ctx.fillStyle="#5a636d";ctx.beginPath();ctx.arc(-6,11,2.4,0,7);ctx.arc(6,11,2.4,0,7);ctx.fill();
    ctx.fillStyle="#000";ctx.fillRect(-6,-4,2,2);ctx.fillRect(3,-4,2,2);}
  else if(m.type==="goblin"){ctx.fillStyle=d.col;ctx.beginPath();ctx.arc(0,0,R*0.75,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(-R*0.7,-2);ctx.lineTo(-R*1.05,-8);ctx.lineTo(-R*0.5,-6);ctx.fill();
    ctx.beginPath();ctx.moveTo(R*0.7,-2);ctx.lineTo(R*1.05,-8);ctx.lineTo(R*0.5,-6);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-4,-2,2.4,0,7);ctx.arc(4,-2,2.4,0,7);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(-4,-2,1.1,0,7);ctx.arc(4,-2,1.1,0,7);ctx.fill();
    ctx.strokeStyle="#3a2a12";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(R*0.5,2);ctx.lineTo(R*1.1,10);ctx.stroke();}
  else if(m.type==="wraith"){ctx.fillStyle="rgba(210,225,240,0.85)";ctx.beginPath();ctx.arc(0,-4,R*0.7,Math.PI,0);
    ctx.lineTo(R*0.7,8);for(let i=1;i<=6;i++){ctx.lineTo(R*0.7-i*(R*1.4/6),8+((i%2)?5:0));}ctx.closePath();ctx.fill();
    ctx.fillStyle="#22303f";ctx.beginPath();ctx.arc(-4,-6,2.2,0,7);ctx.arc(4,-6,2.2,0,7);ctx.fill();}
  else if(m.type==="phantom"){ctx.fillStyle="#3a2a52";ctx.beginPath();ctx.moveTo(0,-R);ctx.lineTo(R*0.8,R*0.8);ctx.lineTo(-R*0.8,R*0.8);ctx.closePath();ctx.fill();
    ctx.fillStyle="#1c1430";ctx.beginPath();ctx.arc(0,-R*0.4,R*0.45,0,7);ctx.fill();
    ctx.fillStyle="#c48cff";ctx.beginPath();ctx.arc(-3,-R*0.45,2,0,7);ctx.arc(3,-R*0.45,2,0,7);ctx.fill();}
  else if(m.type==="dragon"){ctx.fillStyle="#7a1f18";ctx.beginPath();ctx.moveTo(-R,0);ctx.lineTo(-R*1.6,-R*0.8);ctx.lineTo(-R*0.5,-R*0.3);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(R,0);ctx.lineTo(R*1.6,-R*0.8);ctx.lineTo(R*0.5,-R*0.3);ctx.closePath();ctx.fill();
    ctx.fillStyle=d.col;ctx.beginPath();ctx.ellipse(0,2,R*0.8,R*0.65,0,0,7);ctx.fill();
    ctx.beginPath();ctx.arc(0,-R*0.7,R*0.42,0,7);ctx.fill();
    ctx.fillStyle="#f5d76e";ctx.beginPath();ctx.arc(-5,-R*0.75,2.4,0,7);ctx.arc(5,-R*0.75,2.4,0,7);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(-5,-R*0.75,1.1,0,7);ctx.arc(5,-R*0.75,1.1,0,7);ctx.fill();}
  else if(m.type==="cartGoblin"){ctx.fillStyle=d.col;ctx.beginPath();ctx.arc(0,1,R*0.72,0,7);ctx.fill();
    ctx.fillStyle="#8a929c";ctx.fillRect(-7,-R*0.9,14,4);ctx.fillStyle="#6a727c";ctx.fillRect(-7,-R*0.9,14,1.5);
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-3,0,2,0,7);ctx.arc(3,0,2,0,7);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(-3,0,1,0,7);ctx.arc(3,0,1,0,7);ctx.fill();}
  else if(m.type==="slime"){ctx.fillStyle=d.col;ctx.beginPath();ctx.moveTo(-R*0.9,6);
    ctx.quadraticCurveTo(-R,-R*0.7,0,-R*0.7);ctx.quadraticCurveTo(R,-R*0.7,R*0.9,6);ctx.quadraticCurveTo(0,11,-R*0.9,6);ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.45)";ctx.beginPath();ctx.arc(-R*0.35,-R*0.2,2.4,0,7);ctx.fill();
    ctx.fillStyle="#123";ctx.beginPath();ctx.arc(-3,-1,1.5,0,7);ctx.arc(3,-1,1.5,0,7);ctx.fill();}
  else if(m.type==="skeleton"){ctx.strokeStyle="#e8e2d2";ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(0,-2);ctx.lineTo(0,9);ctx.moveTo(-6,3);ctx.lineTo(6,3);ctx.moveTo(0,9);ctx.lineTo(-5,15);ctx.moveTo(0,9);ctx.lineTo(5,15);ctx.stroke();
    ctx.fillStyle="#efe9db";ctx.beginPath();ctx.arc(0,-8,5,0,7);ctx.fill();
    ctx.fillStyle="#222";ctx.beginPath();ctx.arc(-2,-8,1.3,0,7);ctx.arc(2,-8,1.3,0,7);ctx.fill();
    ctx.fillStyle="#c33";ctx.fillRect(-5,-17,10,3);}
  else if(m.type==="lich"){ctx.fillStyle="#2f4a2f";ctx.beginPath();ctx.moveTo(0,-R);ctx.lineTo(R*0.8,R*0.7);ctx.lineTo(-R*0.8,R*0.7);ctx.closePath();ctx.fill();
    ctx.fillStyle="#cfe0c0";ctx.beginPath();ctx.arc(0,-R*0.5,R*0.42,0,7);ctx.fill();
    ctx.fillStyle="#2f4a2f";ctx.beginPath();ctx.arc(0,-R*0.4,R*0.2,0,Math.PI);ctx.fill();
    ctx.fillStyle="#5fff7a";ctx.beginPath();ctx.arc(-3,-R*0.55,1.7,0,7);ctx.arc(3,-R*0.55,1.7,0,7);ctx.fill();}
  else if(m.type==="bezos"){ctx.fillStyle="#b9c0c9";roundRect(-R*0.6,-R*0.55,R*1.2,R*1.25,5);ctx.fill();
    ctx.fillStyle="#8f97a2";ctx.fillRect(-R*0.6,-2,R*1.2,4);ctx.fillStyle="#6a99d0";ctx.fillRect(-3,-R*0.2,6,R*0.5);
    ctx.fillStyle="#dfe4ea";ctx.beginPath();ctx.arc(0,-R*0.7,R*0.38,0,7);ctx.fill();
    ctx.fillStyle="#111";ctx.beginPath();ctx.arc(-3,-R*0.72,1.5,0,7);ctx.arc(3,-R*0.72,1.5,0,7);ctx.fill();
    ctx.fillStyle="#e8c46a";ctx.beginPath();ctx.moveTo(-7,-R*1.02);ctx.lineTo(-3.5,-R*0.86);ctx.lineTo(0,-R*1.02);ctx.lineTo(3.5,-R*0.86);ctx.lineTo(7,-R*1.02);ctx.lineTo(7,-R*0.9);ctx.lineTo(-7,-R*0.9);ctx.closePath();ctx.fill();}
  else if(m.type==="bug"){ctx.strokeStyle="#3a4a1a";ctx.lineWidth=1.5;
    for(let s=-1;s<=1;s+=2)for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(s*4,-2+i*4);ctx.lineTo(s*11,-5+i*5);ctx.stroke();}
    ctx.fillStyle=d.col;ctx.beginPath();ctx.ellipse(0,0,7,9,0,0,7);ctx.fill();
    ctx.fillStyle="#5a7a26";ctx.beginPath();ctx.ellipse(0,-4,6,5,0,0,7);ctx.fill();
    ctx.fillStyle="#2f3f16";ctx.beginPath();ctx.arc(-2.5,1,1.4,0,7);ctx.arc(2.5,3,1.4,0,7);ctx.arc(1,-1,1.2,0,7);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-2.5,-6,2,0,7);ctx.arc(2.5,-6,2,0,7);ctx.fill();
    ctx.fillStyle="#111";ctx.beginPath();ctx.arc(-2.5,-6,1,0,7);ctx.arc(2.5,-6,1,0,7);ctx.fill();
    ctx.strokeStyle="#3a4a1a";ctx.beginPath();ctx.moveTo(-2,-9);ctx.lineTo(-4,-13);ctx.moveTo(2,-9);ctx.lineTo(4,-13);ctx.stroke();
    ctx.fillStyle="#3a4a1a";ctx.beginPath();ctx.arc(-4,-13,1.2,0,7);ctx.arc(4,-13,1.2,0,7);ctx.fill();}
  ctx.restore();hpbar(sx,sy-R-8,d.boss?64:30,m.hp/m.maxHp,d.boss?d.bossName:null);
  if(state.player.reveal){ctx.fillStyle="#cfe0c0";ctx.font="9px Trebuchet MS";ctx.textAlign="center";
    ctx.fillText(Math.ceil(m.hp)+"/"+m.maxHp+" · "+d.class,sx,sy-R-14);}}
function drawCompanion(){if(!companion.active)return;const sx=SX(companion.px),sy=SY(companion.py);const t=Date.now()/200;
  shadow(sx,sy+8,7);const gr=ctx.createRadialGradient(sx,sy,0,sx,sy,9);gr.addColorStop(0,"#bfe0ff");gr.addColorStop(1,"rgba(110,168,255,0.1)");
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(sx,sy+Math.sin(t)*2,9,0,7);ctx.fill();
  ctx.fillStyle="#2a3a5a";ctx.beginPath();ctx.arc(sx-2,sy-1,1.4,0,7);ctx.arc(sx+2,sy-1,1.4,0,7);ctx.fill();}
function drawScout(){if(!scout.active)return;const sx=SX(scout.px),sy=SY(scout.py);if(sx<-60||sx>VW+60)return;const f=scout.face||1;const t=Date.now()/140;
  shadow(sx,sy+7,10);ctx.save();ctx.translate(sx,sy);
  ctx.fillStyle="#8a5a30";ctx.beginPath();ctx.ellipse(0,0,10,6,0,0,7);ctx.fill(); // body
  ctx.fillStyle="#6e4622";ctx.fillRect(-6,4,3,4);ctx.fillRect(3,4,3,4); // legs
  ctx.strokeStyle="#6e4622";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-f*9,-2);ctx.lineTo(-f*13,-5-Math.sin(t)*2);ctx.stroke(); // tail wag
  ctx.fillStyle="#8a5a30";ctx.beginPath();ctx.arc(f*9,-4,5,0,7);ctx.fill(); // head
  ctx.fillStyle="#6e4622";ctx.beginPath();ctx.moveTo(f*6,-8);ctx.lineTo(f*5,-3);ctx.lineTo(f*9,-5);ctx.closePath();ctx.fill(); // ear
  ctx.fillStyle="#3a2412";ctx.beginPath();ctx.arc(f*12,-3,1.4,0,7);ctx.fill(); // nose
  ctx.fillStyle="#111";ctx.beginPath();ctx.arc(f*9,-5,1,0,7);ctx.fill(); // eye
  ctx.fillStyle="#3a9e4a";ctx.beginPath();ctx.moveTo(f*3,0);ctx.lineTo(f*7,0);ctx.lineTo(f*6,3);ctx.lineTo(f*4,3);ctx.closePath();ctx.fill(); // green bandana
  ctx.restore();
  ctx.fillStyle="#e8c46a";ctx.font="bold 9px Trebuchet MS";ctx.textAlign="center";ctx.strokeStyle="#000";ctx.lineWidth=3;
  ctx.strokeText("Scout",sx,sy-14);ctx.fillText("Scout",sx,sy-14);}
function drawNPC(n){const sx=SX(n.px),sy=SY(n.py);if(sx<-60||sx>VW+60||sy<-60||sy>VH+60)return;
  const moving=n.path&&n.path.length;const now=Date.now();
  const bob=moving?Math.abs(Math.sin(now/150+n.px))*2:Math.sin(now/520+n.px);
  shadow(sx,sy+15,12);ctx.save();ctx.translate(sx,sy-bob);const f=n.face||1;
  const head=(skin)=>{ctx.fillStyle=skin||"#e2b48c";ctx.beginPath();ctx.arc(0,-12,6,0,7);ctx.fill();};
  const eye=()=>{ctx.fillStyle="#123";ctx.fillRect(f>0?1:-3,-13,2,2);};
  if(n.sprite==="harley"){ctx.fillStyle="#e8732a";roundRect(-8,-6,16,17,4);ctx.fill();ctx.fillStyle="#f4b23a";ctx.fillRect(-8,-2,16,3);
    head();ctx.fillStyle="#3a2a18";ctx.beginPath();ctx.arc(0,-15,6,Math.PI,0);ctx.fill();
    ctx.save();ctx.translate(f*9,-9);ctx.rotate(f*0.4);ctx.fillStyle="#c8342f";ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(9,-6);ctx.lineTo(9,6);ctx.lineTo(0,3);ctx.closePath();ctx.fill();ctx.restore();eye();}
  else if(n.sprite==="banker"){ctx.fillStyle="#23324a";roundRect(-8,-6,16,18,4);ctx.fill();
    ctx.fillStyle="#e8e2d2";ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(-3,3);ctx.lineTo(3,3);ctx.closePath();ctx.fill();
    ctx.fillStyle="#7a1d1d";ctx.fillRect(-1,-5,2,8);head();ctx.fillStyle="#4a3421";ctx.beginPath();ctx.arc(0,-15,6,Math.PI,0);ctx.fill();
    ctx.fillStyle="#e8c46a";ctx.beginPath();ctx.arc(-9,5,3,0,7);ctx.fill();eye();}
  else if(n.sprite==="csm"){ctx.fillStyle="#2f9e8f";roundRect(-8,-6,16,18,4);ctx.fill();
    ctx.fillStyle="#eef6f2";ctx.fillRect(-2,-3,4,10);ctx.fillRect(-5,1,10,3);head();
    ctx.strokeStyle="#1b1b1b";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-13,7,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
    ctx.fillStyle="#1b1b1b";ctx.fillRect(-8,-13,2,4);ctx.fillStyle="#2f9e8f";ctx.fillRect(-9,-10,4,1.6);
    ctx.fillStyle="#3a2a18";ctx.beginPath();ctx.arc(0,-15,6,Math.PI,0);ctx.fill();eye();}
  else if(n.sprite==="partner"){ctx.fillStyle="#6a5a3a";roundRect(-8,-6,16,18,4);ctx.fill();ctx.fillStyle="#8a7a4a";ctx.fillRect(-8,-2,16,3);
    head();ctx.fillStyle="#e8c000";ctx.beginPath();ctx.arc(0,-14,7,Math.PI,0);ctx.fill();ctx.fillRect(-8,-15,16,2);
    ctx.strokeStyle="#9aa0a6";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f*7,-1);ctx.lineTo(f*11,5);ctx.stroke();eye();}
  else if(n.sprite==="tobi"){ctx.fillStyle="#3a3f4a";roundRect(-8,-6,16,18,4);ctx.fill();
    ctx.fillStyle="#2a2f38";ctx.beginPath();ctx.arc(0,-6,7,0,Math.PI);ctx.fill();head();
    ctx.fillStyle="#5a4632";ctx.beginPath();ctx.arc(0,-15,6,Math.PI,0);ctx.fill();
    ctx.fillStyle="#1b1f26";ctx.fillRect(-9,8,18,4);ctx.fillStyle="#6ea8ff";for(let i=-8;i<8;i+=3)ctx.fillRect(i,9,2,2);eye();}
  else if(n.sprite==="oracle"){ctx.fillStyle="#3b2a6a";ctx.beginPath();ctx.moveTo(-9,14);ctx.lineTo(-6,-6);ctx.lineTo(6,-6);ctx.lineTo(9,14);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e8d24a";for(let i=0;i<4;i++)ctx.fillRect(-4+(i%2)*6,-2+(i>1?7:0),1.4,1.4);
    head("#e6c9a6");ctx.fillStyle="#d7d7e6";ctx.beginPath();ctx.arc(0,-9,5,0.1,Math.PI-0.1);ctx.fill();
    ctx.fillStyle="#2a1f52";ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(7,-12);ctx.lineTo(-7,-12);ctx.closePath();ctx.fill();ctx.fillRect(-8,-13,16,2);
    ctx.fillStyle="#e8d24a";ctx.beginPath();ctx.arc(0,-19,1.4,0,7);ctx.fill();
    ctx.strokeStyle="#6b4a2f";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f*9,-16);ctx.lineTo(f*9,13);ctx.stroke();
    ctx.fillStyle="#7ad0ff";ctx.beginPath();ctx.arc(f*9,-18,3,0,7);ctx.fill();ctx.fillStyle="#123";ctx.fillRect(f>0?1:-3,-13,2,2);}
  else{ctx.fillStyle="#6a3fa0";roundRect(-8,-6,16,18,4);ctx.fill();head();eye();}
  ctx.restore();
  ctx.fillStyle="#e8c46a";ctx.font="bold 10px Trebuchet MS";ctx.textAlign="center";
  ctx.strokeStyle="#000";ctx.lineWidth=3;ctx.strokeText(n.name,sx,sy-26);ctx.fillText(n.name,sx,sy-26);}
function drawCrate(c){const sx=SX(c.tx*TILE+TILE/2),sy=SY(c.ty*TILE+TILE/2);if(sx<-60||sx>VW+60)return;shadow(sx,sy+12,13);
  if(c.cd>0){ctx.fillStyle="#6b563b";ctx.fillRect(sx-8,sy+2,16,8);return;}
  ctx.fillStyle="#a9793f";roundRect(sx-12,sy-12,24,24,3);ctx.fill();
  ctx.strokeStyle="#6e4d24";ctx.lineWidth=2;ctx.strokeRect(sx-12,sy-12,24,24);
  ctx.beginPath();ctx.moveTo(sx-12,sy-12);ctx.lineTo(sx+12,sy+12);ctx.moveTo(sx+12,sy-12);ctx.lineTo(sx-12,sy+12);ctx.stroke();
  ctx.fillStyle="#96bf48";ctx.fillRect(sx-4,sy-4,8,8);}
function drawObject(o){const cx=o.tx*TILE+TILE/2;let cy=o.ty*TILE+TILE;const sx=SX(cx),sy=SY(cy);
  if(o.type==="bank"||o.type==="store"||o.type==="hackhq"){const px=SX(o.tx*TILE),py=SY(o.ty*TILE);const w=o.w*TILE,h=o.h*TILE;
    const wallY=py+h*0.42,wallH=h*0.58;
    const wall={bank:"#c8a24a",store:"#8a6f9a",hackhq:"#4a7d8a"}[o.type];
    const roof={bank:"#7a5a24",store:"#5a4630",hackhq:"#2f5560"}[o.type];
    ctx.fillStyle="rgba(0,0,0,0.28)";ctx.fillRect(px+8,py+h-3,w-4,7);
    ctx.fillStyle=wall;ctx.fillRect(px,wallY,w,wallH);
    ctx.fillStyle="rgba(0,0,0,0.13)";ctx.fillRect(px,wallY,w,4);ctx.fillStyle="rgba(0,0,0,0.10)";ctx.fillRect(px,wallY+wallH-4,w,4);
    ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px-6,wallY+2);ctx.lineTo(px+w/2,py-9);ctx.lineTo(px+w+6,wallY+2);ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.09)";ctx.beginPath();ctx.moveTo(px+w/2,py-9);ctx.lineTo(px+w+6,wallY+2);ctx.lineTo(px+w/2,wallY+2);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e8c46a";ctx.beginPath();ctx.arc(px+w/2,py-9,2,0,7);ctx.fill(); // roof finial
    ctx.fillStyle="#2a2016";for(const wx of [px+w*0.22,px+w*0.78]){ctx.fillRect(wx-5,wallY+9,10,10);ctx.fillStyle="#7ad0ff";ctx.fillRect(wx-4,wallY+10,8,8);ctx.fillStyle="#2a2016";ctx.fillRect(wx-1,wallY+10,2,8);ctx.fillRect(wx-4,wallY+13,8,2);}
    ctx.fillStyle="#3a2c1a";ctx.fillRect(px+w/2-7,py+h-16,14,16);ctx.fillStyle="#e8c46a";ctx.beginPath();ctx.arc(px+w/2+3,py+h-8,1.3,0,7);ctx.fill();
    if(o.type==="store"){ctx.fillStyle="#c8342f";for(let i=0;i<w;i+=12)ctx.fillRect(px+i,wallY,6,6);ctx.fillStyle="#e8e2d2";for(let i=6;i<w;i+=12)ctx.fillRect(px+i,wallY,6,6);}
    if(o.type==="hackhq"){ctx.fillStyle="#e8d24a";ctx.font="bold 12px Trebuchet MS";ctx.textAlign="center";ctx.fillText("</>",px+w/2,wallY+wallH-6);}
    ctx.fillStyle="#e8c46a";ctx.font="bold 11px Trebuchet MS";ctx.textAlign="center";ctx.strokeStyle="#000";ctx.lineWidth=3;
    const lbl={bank:"THE VAULT",store:"SHOP",hackhq:"HACK DAYS HQ"}[o.type];
    ctx.strokeText(lbl,px+w/2,wallY-4);ctx.fillText(lbl,px+w/2,wallY-4);return;}
  if(sx<-60||sx>VW+60||sy<-60||sy>VH+60)return;
  if(o.type==="tree"){shadow(sx,sy-2,15);
    if(o.felled){ctx.fillStyle="#5b3f22";ctx.beginPath();ctx.ellipse(sx,sy-3,8,4,0,0,7);ctx.fill();
      ctx.fillStyle="#7a5836";ctx.beginPath();ctx.ellipse(sx,sy-5,6,3,0,0,7);ctx.fill();
      ctx.strokeStyle="#5b3f22";ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(sx,sy-5,2+i*1.6,0,7);ctx.stroke();}return;}
    ctx.fillStyle="#5b3f22";ctx.fillRect(sx-4,sy-20,8,20);
    ctx.fillStyle="#2f5a2a";ctx.beginPath();ctx.arc(sx,sy-30,15,0,7);ctx.arc(sx-11,sy-24,11,0,7);ctx.arc(sx+11,sy-24,11,0,7);ctx.fill();
    ctx.fillStyle="#3e7236";ctx.beginPath();ctx.arc(sx-4,sy-33,9,0,7);ctx.arc(sx+6,sy-30,8,0,7);ctx.fill();}
  else if(o.type==="deadtree"){shadow(sx,sy-2,12);
    if(o.felled){ctx.fillStyle="#4a3826";ctx.beginPath();ctx.ellipse(sx,sy-3,6,3,0,0,7);ctx.fill();return;}
    ctx.strokeStyle="#4a3826";ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,sy-24);ctx.moveTo(sx,sy-14);ctx.lineTo(sx-9,sy-22);ctx.moveTo(sx,sy-18);ctx.lineTo(sx+9,sy-26);ctx.stroke();}
  else if(o.type==="rock"){shadow(sx,sy,14);const dep=o.cd>0;ctx.fillStyle=dep?"#4a4c52":"#6d6f75";ctx.beginPath();ctx.moveTo(sx-13,sy);ctx.lineTo(sx-9,sy-12);ctx.lineTo(sx+2,sy-15);ctx.lineTo(sx+12,sy-9);ctx.lineTo(sx+13,sy);ctx.closePath();ctx.fill();
    ctx.fillStyle=dep?"#3a3c42":"#565860";ctx.beginPath();ctx.moveTo(sx+2,sy-15);ctx.lineTo(sx+12,sy-9);ctx.lineTo(sx+13,sy);ctx.lineTo(sx+3,sy-3);ctx.closePath();ctx.fill();
    if(!dep){ctx.fillStyle="#e8c46a";ctx.beginPath();ctx.arc(sx-3,sy-7,1.5,0,7);ctx.arc(sx+5,sy-9,1.4,0,7);ctx.fill();}}
  else if(o.type==="bush"){shadow(sx,sy,11);ctx.fillStyle="#2f5a2a";ctx.beginPath();ctx.arc(sx-6,sy-5,8,0,7);ctx.arc(sx+6,sy-5,8,0,7);ctx.arc(sx,sy-9,9,0,7);ctx.fill();}
  else if(o.type==="lamp"){shadow(sx,sy,6);ctx.strokeStyle="#333";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,sy-22);ctx.stroke();
    ctx.fillStyle="rgba(255,220,120,0.9)";ctx.beginPath();ctx.arc(sx,sy-24,5,0,7);ctx.fill();}
  else if(o.type==="sign"){shadow(sx,sy,7);ctx.fillStyle="#6b4a2a";ctx.fillRect(sx-2,sy-14,4,14);ctx.fillStyle="#8a6a3a";ctx.fillRect(sx-11,sy-24,22,12);}
  else if(o.type==="campfire"){const t=Date.now()/120;shadow(sx,sy+3,13);
    ctx.fillStyle="#3a2a18";for(let i=-1;i<=1;i++){ctx.save();ctx.translate(sx+i*5,sy+2);ctx.rotate(i*0.5);ctx.fillRect(-6,-2,12,3);ctx.restore();}
    for(let i=0;i<5;i++){const fx=sx+Math.sin(t+i)*4;ctx.fillStyle=i%2?"#ffb020":"#ff6a1a";ctx.beginPath();
      ctx.moveTo(fx-4+i,sy);ctx.quadraticCurveTo(fx,sy-15-Math.sin(t*2+i)*4,fx+4-i,sy);ctx.closePath();ctx.fill();}
    ctx.fillStyle="rgba(255,225,140,0.95)";ctx.beginPath();ctx.arc(sx,sy-4,3,0,7);ctx.fill();
    ctx.fillStyle="rgba(255,120,40,0.16)";ctx.beginPath();ctx.arc(sx,sy-6,16,0,7);ctx.fill();}}
function drawFX(){ctx.textAlign="center";
  for(const h of hitsplats){const sx=SX(h.x),sy=SY(h.y)-(34-h.life)*0.4;ctx.globalAlpha=Math.min(1,h.life/12);
    if(typeof h.val==="number"){ctx.fillStyle=h.color;ctx.beginPath();ctx.arc(sx,sy,9,0,7);ctx.fill();
      ctx.fillStyle="#fff";ctx.font="bold 12px Trebuchet MS";ctx.fillText(h.val,sx,sy+4);}
    else{ctx.fillStyle=h.color;ctx.font="bold 14px Trebuchet MS";ctx.strokeStyle="#000";ctx.lineWidth=3;ctx.strokeText(h.val,sx,sy);ctx.fillText(h.val,sx,sy);}
    ctx.globalAlpha=1;}
  for(const x of xpdrops){const sx=SX(x.x),sy=SY(x.y)-(70-x.life)*0.5;ctx.globalAlpha=Math.min(1,x.life/25);
    ctx.fillStyle="#8ce39a";ctx.font="bold 12px Trebuchet MS";ctx.strokeStyle="#000";ctx.lineWidth=3;
    ctx.strokeText(x.glyph+" +"+x.val+" xp",sx,sy);ctx.fillText(x.glyph+" +"+x.val+" xp",sx,sy);ctx.globalAlpha=1;}}
function drawCompass(g,x,y){g.save();g.translate(x,y);
  g.fillStyle="#2b241b";g.beginPath();g.arc(0,0,11,0,7);g.fill();g.strokeStyle="#000";g.lineWidth=2;g.stroke();
  g.fillStyle="#c8342f";g.beginPath();g.moveTo(0,-9);g.lineTo(3,0);g.lineTo(0,9);g.lineTo(-3,0);g.closePath();g.fill();
  g.fillStyle="#e8e2d2";g.beginPath();g.moveTo(0,-9);g.lineTo(3,0);g.lineTo(-3,0);g.closePath();g.fill();
  g.fillStyle="#e8c46a";g.font="bold 8px Trebuchet MS";g.textAlign="center";g.fillText("N",0,-12);g.restore();}
function drawHpOrb(g,x,y){const p=state.player;g.save();g.translate(x,y);
  g.fillStyle="#2b241b";g.beginPath();g.arc(0,0,14,0,7);g.fill();
  g.fillStyle="#3a0a08";g.beginPath();g.arc(0,0,12,0,7);g.fill();
  const hf=Math.max(0,Math.min(1,p.hp/p.maxHp));g.save();g.beginPath();g.arc(0,0,12,0,7);g.clip();
  g.fillStyle=p.hp>p.maxHp?"#e8c46a":"#38b04a";g.fillRect(-12,12-24*hf,24,24*hf);g.restore();
  g.strokeStyle="#000";g.lineWidth=2;g.beginPath();g.arc(0,0,14,0,7);g.stroke();
  g.fillStyle="#fff";g.font="bold 11px Trebuchet MS";g.textAlign="center";g.strokeStyle="#000";g.lineWidth=3;
  g.strokeText(Math.max(0,Math.ceil(p.hp)),0,4);g.fillText(Math.max(0,Math.ceil(p.hp)),0,4);g.restore();}
function drawMinimap(){const W=mmCanvas.width,H=mmCanvas.height;const cx=W/2,cy=H/2-4;const R=Math.min(W/2,H/2)-8;const p=state.player;
  mmctx.clearRect(0,0,W,H);
  if(p.curseUntil>Date.now()){mmctx.fillStyle="#0a0a0a";mmctx.beginPath();mmctx.arc(cx,cy,R,0,7);mmctx.fill();
    mmctx.strokeStyle="#000";mmctx.lineWidth=4;mmctx.beginPath();mmctx.arc(cx,cy,R,0,7);mmctx.stroke();
    mmctx.fillStyle="#c8342f";mmctx.font="bold 11px Trebuchet MS";mmctx.textAlign="center";
    mmctx.fillText("SDP ACCESS",cx,cy-3);mmctx.fillText("REVOKED",cx,cy+11);drawHpOrb(mmctx,15,H-18);return;}
  mmctx.save();mmctx.beginPath();mmctx.arc(cx,cy,R,0,7);mmctx.clip();
  mmctx.fillStyle="#1a221a";mmctx.fillRect(0,0,W,H);
  const scale=3.6;mmctx.imageSmoothingEnabled=false;
  const ox=cx-p.px/TILE*scale,oy=cy-p.py/TILE*scale;
  mmctx.drawImage(minibuf,0,0,MAP_W,MAP_H,ox,oy,MAP_W*scale,MAP_H*scale);
  for(const m of monsters){if(m.dead)continue;mmctx.fillStyle=MT[m.type].boss?"#ff3b30":"#e0554f";mmctx.fillRect(ox+m.tx*scale-1,oy+m.ty*scale-1,3,3);}
  for(const c of crates){if(c.cd>0)continue;mmctx.fillStyle="#e8c46a";mmctx.fillRect(ox+c.tx*scale-1,oy+c.ty*scale-1,3,3);}
  for(const n of NPCS){mmctx.fillStyle="#fff";mmctx.fillRect(ox+n.tx*scale-1,oy+n.ty*scale-1,3,3);}
  mmctx.fillStyle="#fff";mmctx.strokeStyle="#000";mmctx.lineWidth=1;mmctx.beginPath();mmctx.arc(cx,cy,3,0,7);mmctx.fill();mmctx.stroke();
  mmctx.restore();
  mmctx.strokeStyle="#000";mmctx.lineWidth=4;mmctx.beginPath();mmctx.arc(cx,cy,R,0,7);mmctx.stroke();
  mmctx.strokeStyle="#7a6647";mmctx.lineWidth=2;mmctx.beginPath();mmctx.arc(cx,cy,R,0,7);mmctx.stroke();
  drawCompass(mmctx,15,15);
  drawHpOrb(mmctx,15,H-18);
  mmctx.fillStyle="#e8c46a";mmctx.font="bold 11px Trebuchet MS";mmctx.textAlign="center";mmctx.strokeStyle="#000";mmctx.lineWidth=3;
  mmctx.strokeText(curZone(),cx,H-5);mmctx.fillText(curZone(),cx,H-5);}
function curZone(){const t=pxTile(state.player.px,state.player.py);for(const z of ZONES)if(t.x>=z.x&&t.x<z.x+z.w&&t.y>=z.y&&t.y<z.y+z.h)return z.name;return "The Wilds";}
function drawHUD(){const p=state.player;const x=14,y=14,w=182,h=16;
  ctx.fillStyle="rgba(10,12,15,0.72)";roundRect(x-5,y-5,w+10,h+10,7);ctx.fill();
  ctx.fillStyle="#3a0a08";ctx.fillRect(x,y,w,h);ctx.fillStyle=p.hp>p.maxHp?"#e8c46a":"#c8342f";
  ctx.fillRect(x,y,w*Math.max(0,Math.min(1,p.hp/p.maxHp)),h);
  ctx.strokeStyle="#000";ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle="#fff";ctx.font="bold 12px Trebuchet MS";ctx.textAlign="center";
  ctx.fillText("Health  "+Math.max(0,Math.ceil(p.hp))+" / "+p.maxHp,x+w/2,y+12);
  if(pending&&pending.kind==="monster"&&!pending.ref.dead){const d=MT[pending.ref.type];
    ctx.fillStyle="#e8c46a";ctx.textAlign="left";ctx.fillText("Fighting: "+d.name,x,y+34);}}
function render(){updateCam();ctx.clearRect(0,0,VW,VH);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(tbuf,cam.x,cam.y,VW,VH,0,0,VW,VH);ctx.imageSmoothingEnabled=true;
  drawWater();drawMarker();
  const list=[];for(const o of objects)list.push({y:(o.type==="bank"||o.type==="store"||o.type==="hackhq")?(o.ty+o.h)*TILE:(o.ty+1)*TILE,d:()=>drawObject(o)});
  for(const c of crates)list.push({y:(c.ty+1)*TILE,d:()=>drawCrate(c)});
  for(const n of NPCS)list.push({y:n.py+15,d:()=>drawNPC(n)});
  for(const m of monsters){if(m.dead)continue;list.push({y:(m.ty+1)*TILE,d:()=>drawMonster(m)});}
  const p=state.player;list.push({y:p.py+15,d:()=>drawPlayer(p)});
  list.sort((a,b)=>a.y-b.y);for(const it of list)it.d();
  drawCompanion();drawScout();drawAtmosphere();drawParticles();drawPlayerSay();drawFX();drawCurse();drawHUD();drawMinimap();}
function drawPlayerSay(){const p=state.player;if(!(p.chatUntil>Date.now()))return;const sx=SX(p.px),sy=SY(p.py)-44;
  ctx.font="bold 12px Trebuchet MS";ctx.textAlign="center";const w=ctx.measureText(p.chatText).width+14;
  ctx.fillStyle="rgba(20,17,11,0.9)";roundRect(sx-w/2,sy-14,w,20,5);ctx.fill();ctx.strokeStyle="#e8c46a";ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle="#fff";ctx.fillText(p.chatText,sx,sy);}
function drawCurse(){if(!(state.player.curseUntil>Date.now()))return;const cx=VW/2,cy=VH/2;
  const g=ctx.createRadialGradient(cx,cy,55,cx,cy,190);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,0.95)");
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  const left=Math.ceil((state.player.curseUntil-Date.now())/1000);
  ctx.fillStyle="#d0453f";ctx.font="bold 13px Trebuchet MS";ctx.textAlign="center";ctx.strokeStyle="#000";ctx.lineWidth=3;
  const msg="SDP DATA RESTRICTION CURSE — visibility lost ("+left+"s)";
  ctx.strokeText(msg,cx,26);ctx.fillText(msg,cx,26);}
// ============================================================ UI (DOM)
const chatEl=document.getElementById("chat");
function log(html,cls=""){const d=document.createElement("div");d.className="l "+cls;d.innerHTML=html;
  chatEl.appendChild(d);chatEl.scrollTop=chatEl.scrollHeight;while(chatEl.children.length>80)chatEl.removeChild(chatEl.firstChild);}
// Public chat — typed messages appear in the log + as a speech bubble over your hero.
// (Designed for a future real-time MMO where these broadcast to other players.)
const chatInput=document.getElementById("chat-input");
chatInput.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const v=chatInput.value.trim();chatInput.value="";
  if(!v||!state)return;const nm=CHARS[state.player.char]?CHARS[state.player.char].name:"You";
  log(`<b>${nm}:</b> ${v.replace(/[<>]/g,"")}`,"say");
  state.player.chatText=v.slice(0,60);state.player.chatUntil=Date.now()+4500;});
document.querySelectorAll(".osrs-tab").forEach(t=>t.addEventListener("click",()=>{
  if(t.classList.contains("dis")){log(`The <b>${t.title}</b> panel isn't available in Shopscape yet.`,"");return;}
  const panel=document.getElementById("panel-"+t.dataset.tab);if(!panel)return;
  document.querySelectorAll("#tabrow-top .osrs-tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");panel.classList.add("active");}));
document.getElementById("reset-btn").addEventListener("click",()=>{if(confirm("Wipe your store and start a new game?")){
  state=null;localStorage.removeItem("shopscape");location.reload();}}); // null state first so beforeunload save() is skipped
const skillsEl=document.getElementById("skills"),invEl=document.getElementById("inv-grid"),combatEl=document.getElementById("combat-info"),questsEl=document.getElementById("quests-log"),equipEl=document.getElementById("equip-view");
let lastInvSig="";
// Delegated inventory handlers on the persistent grid (survive per-slot rebuilds → fixes stuck tooltip + dead clicks)
invEl.addEventListener("click",e=>{const s=e.target.closest(".slot");if(s&&s.dataset.item)useSlot(s.dataset.item);});
invEl.addEventListener("mouseover",e=>{const s=e.target.closest(".slot");if(s&&s.dataset.item)showTip(s.dataset.item,e.clientX,e.clientY);else hideTip();});
invEl.addEventListener("mousemove",e=>{const s=e.target.closest(".slot");if(s&&s.dataset.item)moveTip(e.clientX,e.clientY);else hideTip();});
invEl.addEventListener("mouseleave",hideTip);
function renderUI(){
  skillsEl.innerHTML="";let total=0;const eq=[state.player.weapon,state.player.shield,state.player.head,state.player.body,state.player.legs,state.player.hands];
  for(const s of SKILL_DEFS){const xp=(state.skills[s.key]||{}).xp||0,lvl=levelForXp(xp);total+=lvl;
    const cur=xpForLevel(lvl),next=xpForLevel(lvl+1);const pct=lvl>=99?100:(xp-cur)/(next-cur)*100;
    const d=document.createElement("div");d.className="skill";
    d.innerHTML=`<div class="skill-top"><span class="name">${s.glyph} ${s.name}${s.train?"":' <span style="color:#7a6a4a;font-weight:normal">(soon)</span>'}</span><span class="lvl">${lvl}/99</span></div>`+
      `<div class="bar"><span style="width:${pct}%"></span></div>`+
      `<div class="xp-sub">${Math.floor(xp)} xp${lvl<99?" &middot; "+Math.max(0,next-Math.floor(xp))+" to next":""}</div>`;
    skillsEl.appendChild(d);}
  const ent=Object.entries(state.inv).filter(e=>e[1]>0);
  const invSig=ent.map(e=>e[0]+":"+e[1]).join(",")+"|"+eq.join(",");
  if(invSig!==lastInvSig){lastInvSig=invSig;invEl.innerHTML="";
    for(let i=0;i<24;i++){const s=document.createElement("div");s.className="slot";
      if(ent[i]){const k=ent[i][0],v=ent[i][1],it=ITEM_DEFS[k]||{glyph:"?",name:k};
        s.innerHTML=it.glyph+(v>1?'<span class="qty">'+v+"</span>":"");s.dataset.item=k;
        const usable=it.kind||it.heal||it.teleport||it.toggle||it.companion||it.buff||it.tool||it.raw||it.cursed||it.fire;
        if(usable)s.style.cursor="pointer";
        if(eq.includes(k))s.style.borderColor="#8ce39a";}
      invEl.appendChild(s);}}
  const sl=levelForXp(state.skills.selling.xp);const nm=(key)=>{const it=ITEM_DEFS[key];return it?it.glyph+" "+it.name:"None";};
  combatEl.innerHTML=`<div>Hero: <b>${CHARS[state.player.char]?CHARS[state.player.char].name:"?"}</b></div>`+
    `<div>Merchant Level: <b>${total}</b></div><div>GMV: <b>${Math.floor(state.gmv).toLocaleString()} 🪙</b></div>`+
    `<div>Checkout Combat: <b>${sl}</b> &middot; Max Hit: <b>${2+Math.floor(sl*0.6)+equipAtk()}</b></div>`+
    `<div>Weapon: <b>${nm(state.player.weapon)}</b> (+${equipAtk()} atk)</div>`+
    `<div>Shield: <b>${nm(state.player.shield)}</b></div>`+
    `<div>Head: <b>${nm(state.player.head)}</b></div>`+
    `<div>Body: <b>${nm(state.player.body)}</b></div>`+
    `<div>Legs: <b>${nm(state.player.legs)}</b></div>`+
    `<div>Hands: <b>${nm(state.player.hands)}</b></div>`+
    `<div>Total Armour: <b>+${equipDef()} def</b></div>`+
    `<div>Health: <b>${Math.ceil(state.player.hp)}/${state.player.maxHp}</b></div>`;
  if(questsEl){questsEl.innerHTML=QUESTS.map(q=>{const done=state.quests&&state.quests[q.id];
    const started=!q.fromTobi||(state.quests&&state.quests.bugsStarted);
    const status=done?"Done":(started?"Active":"Not started");
    const prog=(q.count&&started&&!done)?` — ${Math.min(q.count(),q.goal)}/${q.goal}`:"";
    return `<div class="skill"><div class="skill-top"><span class="name">${done?"✔ ":""}${q.name}${prog}</span>`+
      `<span class="lvl" style="color:${done?"#8ce39a":started?"#e8c46a":"#7a6a4a"}">${status}</span></div>`+
      `<div class="xp-sub">${q.desc}</div></div>`;}).join("");}
  if(equipEl){const slots=[["weapon","Weapon"],["shield","Shield"],["head","Head"],["body","Body"],["legs","Legs"],["hands","Hands"]];
    equipEl.innerHTML=`<div style="text-align:center;color:var(--muted);font-size:11px;margin-bottom:8px">Worn Equipment</div>`+
      slots.map(([k,lbl])=>{const it=ITEM_DEFS[state.player[k]];const bonus=it?(it.atk?`+${it.atk} atk`:it.def?`+${it.def} def`:""):"";
        return `<div class="mrow"><span class="nm">${lbl}: <b style="color:#e8c46a">${it?it.glyph+" "+it.name:"—"}</b></span>`+(bonus?`<span class="price">${bonus}</span>`:"")+`</div>`;}).join("")+
      `<div style="margin-top:8px;color:var(--muted);font-size:11px;text-align:center;line-height:1.6">Total armour: <b style="color:#e8c46a">+${equipDef()} def</b><br>Max hit: <b style="color:#e8c46a">${2+Math.floor(levelForXp(state.skills.selling.xp)*0.6)+equipAtk()}</b> · Equip gear from the Inventory tab.</div>`;}
}
// ===== Shop / Bank interiors =====
const modalEl=document.getElementById("modal"),modalBody=document.getElementById("modalbody"),
  modalTitle=document.getElementById("modaltitle"),modalGmv=document.getElementById("modalgmv");
document.getElementById("modalclose").addEventListener("click",closeBuilding);
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&inBuilding)closeBuilding();});
function closeBuilding(){inBuilding=null;modalEl.classList.remove("show");}
const SHOP_STOCK=["elixir","nrr","portalStone","spyglass","launchpad","discountScroll","capital","sidekick",
  "snowboard","buyButtonBludgeon","barcodeBlaster","discountDagger","queryLance","webhookWhip",
  "liquidLeather","fraudFilter","gdprGauntlets","oxygenGreaves","trustBattery","polarisPlate",
  "checkoutCleaver","shopPaySaber","monolith"];
const CRAFT=[
  {out:"elixir",cost:{rawGoods:2}},
  {out:"cookedFish",cost:{rawFish:1,logs:1}},
  {out:"buyButtonBludgeon",cost:{logs:2,ore:2}},
  {out:"barcodeBlaster",cost:{ore:4}},
  {out:"liquidLeather",cost:{rawGoods:5,logs:2}},
  {out:"nrr",cost:{loyalty:1,rawGoods:3}},
  {out:"queryLance",cost:{ore:5,loyalty:1}},
  {out:"checkoutCleaver",cost:{ore:8,logs:4,loyalty:2}},
];
function openBuilding(kind){inBuilding=kind;state.player.path=[];modalEl.classList.add("show");renderModal();
  log(kind==="bank"?"You step into The Vault.":kind==="hackhq"?"You enter Hack Days HQ — time to build!":"You step into the General Store.","sys");}
function mrow(nm,price,fn,label,dis){return `<div class="mrow"><span class="nm">${nm}</span>`+
  (price?`<span class="price">${price}</span>`:"")+`<button onclick="${fn}"${dis?" style='opacity:.45'":""}>${label}</button></div>`;}
function renderModal(){if(!inBuilding)return;modalGmv.textContent=Math.floor(state.gmv).toLocaleString()+" 🪙";
  const inv=Object.entries(state.inv).filter(e=>e[1]>0);
  if(inBuilding==="hackhq"){modalTitle.textContent="Hack Days HQ";
    let html=`<div class="mcol" style="grid-column:1/3"><h4>Craft new items from resources you've collected</h4>`;
    CRAFT.forEach((r,i)=>{const it=ITEM_DEFS[r.out];
      const costStr=Object.keys(r.cost).map(k=>r.cost[k]+"× "+(ITEM_DEFS[k]?ITEM_DEFS[k].glyph+" "+ITEM_DEFS[k].name:k)).join(", ");
      const can=Object.keys(r.cost).every(k=>(state.inv[k]||0)>=r.cost[k]);
      html+=`<div class="mrow"><span class="nm">${it.glyph} <b>${it.name}</b><br><span style="color:#b7a988;font-size:11px">needs ${costStr}</span></span><button onclick="craftItem(${i})"${can?"":" style='opacity:.45'"}>Craft</button></div>`;});
    html+=`</div>`;modalBody.innerHTML=html;return;}
  if(inBuilding==="store"){modalTitle.textContent="General Store";
    let buy=`<div class="mcol"><h4>Buy</h4>`;
    for(const k of SHOP_STOCK){const it=ITEM_DEFS[k];buy+=mrow(it.glyph+" "+it.name,it.buy+" 🪙",`buyItem('${k}')`,"Buy");}buy+=`</div>`;
    let sell=`<div class="mcol"><h4>Sell</h4>`;const sellable=inv.filter(e=>ITEM_DEFS[e[0]]&&ITEM_DEFS[e[0]].sell);
    if(!sellable.length)sell+=`<div class="mempty">Nothing to sell.</div>`;
    for(const [k,v] of sellable){const it=ITEM_DEFS[k];sell+=mrow(it.glyph+" "+it.name+" x"+v,it.sell+" 🪙",`sellItem('${k}')`,"Sell");}sell+=`</div>`;
    modalBody.innerHTML=buy+sell;}
  else{modalTitle.textContent="The Vault";
    let col1=`<div class="mcol"><h4>Your Inventory</h4>`;if(!inv.length)col1+=`<div class="mempty">Inventory empty.</div>`;
    for(const [k,v] of inv){const it=ITEM_DEFS[k]||{glyph:"?",name:k};col1+=mrow(it.glyph+" "+it.name+" x"+v,"",`deposit('${k}')`,"Deposit");}col1+=`</div>`;
    let col2=`<div class="mcol"><h4>Bank Vault</h4>`;const bent=Object.entries(state.bank||{}).filter(e=>e[1]>0);
    if(!bent.length)col2+=`<div class="mempty">Vault empty.</div>`;
    for(const [k,v] of bent){const it=ITEM_DEFS[k]||{glyph:"?",name:k};col2+=mrow(it.glyph+" "+it.name+" x"+v,"",`withdraw('${k}')`,"Withdraw");}col2+=`</div>`;
    modalBody.innerHTML=col1+col2;}}
function buyItem(k){const it=ITEM_DEFS[k];if(state.gmv<it.buy){log("Not enough GMV for that.","bad");return;}state.gmv-=it.buy;addItem(k,1);log(`You buy a <b>${it.name}</b>.`,"good");renderModal();}
function sellItem(k){const it=ITEM_DEFS[k];if(!(state.inv[k]>0))return;state.inv[k]--;state.gmv+=it.sell;log(`You sell a <b>${it.name}</b> for ${it.sell} GMV.`,"good");renderModal();}
function deposit(k){if(!(state.inv[k]>0))return;state.inv[k]--;state.bank[k]=(state.bank[k]||0)+1;renderModal();}
function withdraw(k){if(!(state.bank[k]>0))return;state.bank[k]--;addItem(k,1);renderModal();}
function useSlot(k){const it=ITEM_DEFS[k];if(!it||!(state.inv[k]>0))return;
  if(it.kind==="weapon"){state.player.weapon=k;log(`You equip the <b>${it.name}</b>.`,"good");}
  else if(it.kind==="shield"){state.player.shield=k;log(`You equip the <b>${it.name}</b>.`,"good");}
  else if(it.kind==="armor"){const slot=it.slot||"body";state.player[slot]=k;log(`You equip the <b>${it.name}</b>.`,"good");}
  else if(it.tool==="fish"){log("Cast your Fishing Rod at a body of water to fish.","");}
  else if(it.raw){selectedItem="rawFish";log("<b>Raw Fish</b> selected — now click a campfire to cook it.","");}
  else if(it.cursed){applyCurse();} // trying to eat/use Bad Data triggers the curse
  else if(it.fire){if((state.inv.logs||0)<1){log("You need a <b>Product Log</b> to build a campfire — fell a tree first.","");return;}
    state.inv.merchantFire--;state.inv.logs--;buildCampfire();log("You combine Merchant Fire with Product Logs and build a crackling campfire!","good");}
  else if(it.heal){const cap=Math.floor(state.player.maxHp*(it.over||1));const h=Math.min(it.heal,cap-state.player.hp);
    if(h<=0){log("You're already at full health.","");return;}
    state.player.hp+=h;state.inv[k]--;hitsplat(state.player.px,state.player.py-4,"+"+h,"#4fae5a");log(`You drink a <b>${it.name}</b> (+${h} health).`,"good");}
  else if(it.teleport){state.player.px=8*TILE+20;state.player.py=8*TILE+20;state.player.path=[];pending=null;state.inv[k]--;
    log("The Spin-Up Portal Stone whisks you back to 151 O'Connor Keep.","sys");}
  else if(it.toggle==="reveal"){state.player.reveal=!state.player.reveal;log(`Analytics Spyglass ${state.player.reveal?"raised — enemy stats revealed":"lowered"}.`,"sys");}
  else if(it.companion){state.inv[k]--;companion.active=true;companion.until=Date.now()+30000;companion.px=state.player.px-26;companion.py=state.player.py-20;companion.cd=0;
    log("You rub the Sidekick Lamp — your AI familiar joins the fight for 30 seconds!","gold");}
  else if(it.buff){state.buffs=state.buffs||{};state.inv[k]--;
    if(it.buff==="discount"){const g=40+Math.floor(Math.random()*40);state.gmv+=g;log(`A horde of customers arrives — +${g} GMV (margin be damned)!`,"good");}
    else{state.buffs[it.buff]=20000;log(`You feel the <b>${it.name}</b> take effect.`,"good");}}}
function craftItem(i){const r=CRAFT[i];for(const k in r.cost)if((state.inv[k]||0)<r.cost[k]){log("Not enough resources to craft that.","bad");return;}
  for(const k in r.cost)state.inv[k]-=r.cost[k];addItem(r.out,1);log(`You craft a <b>${ITEM_DEFS[r.out].name}</b> at Hack Days HQ!`,"good");renderModal();}
window.buyItem=buyItem;window.sellItem=sellItem;window.deposit=deposit;window.withdraw=withdraw;window.craftItem=craftItem;
// ===== item tooltips =====
const tipEl=document.getElementById("tooltip");
function spdLabel(ms){return !ms?"—":ms<450?"Fast":ms<=650?"Medium":"Slow";}
function classLabel(c){return {physical:"physical foes",undead:"undead",ghost:"ghosts",beast:"beasts"}[c]||c;}
function itemTip(k){const it=ITEM_DEFS[k]||{name:k};const e=[];
  if(it.kind==="weapon"){e.push("Weapon"+(it.tier?" · "+it.tier+" tier":""));e.push("Attack: +"+it.atk);e.push("Speed: "+spdLabel(it.spd));
    if(it.strongVs&&it.strongVs.length)e.push("Strong vs "+it.strongVs.map(classLabel).join(", "));
    if(it.weakVs&&it.weakVs.length)e.push("Weak vs "+it.weakVs.map(classLabel).join(", "));
    if(it.crit)e.push("Crit chance: "+Math.round(it.crit*100)+"%");if(it.selfDmg)e.push("Recoil: -"+it.selfDmg+" self per hit");}
  else if(it.kind==="shield"){e.push("Shield");e.push("Defence: +"+it.def);}
  else if(it.heal){e.push("Restores "+it.heal+" health"+(it.over?" (can overheal past 100%)":""));}
  if(it.sell)e.push("Sell: "+it.sell+" GMV");
  const act=it.kind?"Left-click to equip":it.heal?"Left-click to eat":it.raw?"Left-click to select, then click a campfire":it.fire?"Left-click (with logs) to build a campfire":it.tool?"Click a body of water to fish":it.cursed?"Cursed — do NOT cook or eat":it.teleport?"Left-click to teleport to town":it.toggle?"Left-click to toggle":it.companion?"Left-click to summon":it.buff?"Left-click to use":"";
  return `<div class="tt-name">${it.glyph||""} ${it.name}</div>`+(it.desc?`<div class="tt-desc">${it.desc}</div>`:"")+
    `<div class="tt-eff">${e.join("<br>")}</div>`+(act?`<div class="tt-act">${act}</div>`:"");}
function showTip(k,x,y){tipEl.innerHTML=itemTip(k);tipEl.style.display="block";moveTip(x,y);}
function moveTip(x,y){tipEl.style.left=Math.min(x+14,window.innerWidth-244)+"px";tipEl.style.top=Math.min(y+14,window.innerHeight-140)+"px";}
function hideTip(){tipEl.style.display="none";}
// ============================================================ SAVE / LOAD
function save(){if(!state)return;try{const p=state.player;localStorage.setItem("shopscape",JSON.stringify({
  player:{px:p.px,py:p.py,hp:p.hp,maxHp:p.maxHp,face:p.face,char:p.char,weapon:p.weapon,shield:p.shield,
    head:p.head||null,body:p.body||null,legs:p.legs||null,hands:p.hands||null,reveal:!!p.reveal},
  skills:state.skills,inv:state.inv,gmv:state.gmv,bank:state.bank||{},quests:state.quests||{},granted:state.granted||{},
  kills:state.kills||0,bugKills:state.bugKills||0,scout:!!state.scout,dialogIdx}));}catch(e){}}
function load(){try{const r=localStorage.getItem("shopscape");if(!r)return null;const o=JSON.parse(r);
  if(!o.player||!o.player.char)return null;dialogIdx=o.dialogIdx||{};const pl=o.player;
  return{player:{px:pl.px,py:pl.py,hp:pl.hp,maxHp:pl.maxHp,path:[],anim:0,face:pl.face||1,atkAnim:0,
    char:pl.char,weapon:pl.weapon,shield:pl.shield,head:pl.head||null,body:pl.body||null,legs:pl.legs||null,hands:pl.hands||null,reveal:!!pl.reveal},
    skills:o.skills||{selling:{xp:0},sourcing:{xp:0},mining:{xp:0}},inv:o.inv||{},gmv:o.gmv||0,bank:o.bank||{},
    quests:o.quests||{},granted:o.granted||{},buffs:{},kills:o.kills||0,bugKills:o.bugKills||0,scout:!!o.scout};}catch(e){return null;}}
setInterval(save,4000);window.addEventListener("beforeunload",save);
// ============================================================ MAIN LOOP
let last=performance.now(),uiT=0;
function loop(now){const dt=Math.min(50,now-last);last=now;
  if(state){movement(dt);actionTick();worldTick(dt);render();if(now-uiT>160){uiT=now;renderUI();}}
  requestAnimationFrame(loop);}
resize();
const overlay=document.getElementById("overlay"),charcards=document.getElementById("charcards");
function buildCharSelect(){charcards.innerHTML="";
  for(const key of Object.keys(CHARS)){const c=CHARS[key];
    const card=document.createElement("div");card.className="charcard";
    const cv=document.createElement("canvas");cv.width=130;cv.height=130;const g=cv.getContext("2d");
    g.translate(65,80);g.scale(2.6,2.6);
    drawCharacter(g,{char:key,weapon:c.weapon,shield:c.shield,face:1,atkProg:0,moving:false,anim:0});
    card.appendChild(cv);
    const w=ITEM_DEFS[c.weapon],s=ITEM_DEFS[c.shield];const info=document.createElement("div");
    info.innerHTML=`<h3>${c.name}</h3><div class="blurb">${c.blurb}</div>`+
      `<div class="gear">Weapon: <b>${w.glyph} ${w.name}</b></div><div class="gear">Shield: <b>${s.glyph} ${s.name}</b></div>`;
    card.appendChild(info);card.addEventListener("click",()=>chooseChar(key));charcards.appendChild(card);}}
function chooseChar(key){state=DEFAULT(key);overlay.classList.remove("show");
  log(`You begin your journey as <b>${CHARS[key].name}</b>!`,"gold");
  log("Click to walk. Fight monsters, chop crates, and click the Bank/Shop to enter. Talk to <b>Tobi the Guide</b> to begin.","");
  save();}
if(!state){buildCharSelect();overlay.classList.add("show");}
else{log("<b>Welcome back to Shopscape.</b> Click to walk. Beware — the beasts of commerce now wander and give chase!","sys");}
requestAnimationFrame(loop);
