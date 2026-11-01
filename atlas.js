/* BioWorld · shared ecological atlas (Director + Student Viewer) */
window.BioWorldAtlas={render({svg,species,biomes,selected,focus,onSelect,interactions=[]}){
if(!svg)return;svg.replaceChildren();svg.setAttribute('viewBox','0 0 1000 920');
const ns='http://www.w3.org/2000/svg',make=(t,a={},p=svg)=>{const e=document.createElementNS(ns,t);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,String(v)));p.appendChild(e);return e};
make('rect',{width:1000,height:920,fill:'#0c1d20'});
const spots=[[205,455],[500,455],[205,180],[795,455],[205,730],[795,730]],terrain=['#426f49','#698650','#426d70','#99835c','#6f8076','#8c925a'],decor=[['🌳','🌲','🌿','🌳','🍄','🌲'],['🌾','🌿','🌼','🌾','🌱'],['🪷','💧','🌿','🪸','🌱'],['🌵','🪨','🌵','☀️','🪨'],['🏔️','⛰️','🪨','🌲','🪨'],['🌳','🌾','🌴','🌿','🌾']],icons=['🐭','🐇','🦌','🦊','🦉','🐺','🐦','🦎','🐗','🦋','🐸','🐿️'];
// Model adjacency: forest–grassland/wetland/mountain; grassland–wetland/mountain/desert/savanna; desert–savanna.
const adjacency=[[0,1],[0,2],[0,4],[1,2],[1,4],[1,3],[1,5],[3,5]];
const roads=make('g',{'aria-label':'Corredores ecológicos permanentes'});
for(const [a,b] of adjacency){
 const p=spots[a],q=spots[b],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
 const x1=p[0]+ux*127,y1=p[1]+uy*127,x2=q[0]-ux*127,y2=q[1]-uy*127;
 const curved=Math.abs(dx)>100&&Math.abs(dy)>100?14:0, cx=(x1+x2)/2-uy*curved,cy=(y1+y2)/2+ux*curved;
 const d='M '+x1.toFixed(1)+' '+y1.toFixed(1)+' Q '+cx.toFixed(1)+' '+cy.toFixed(1)+' '+x2.toFixed(1)+' '+y2.toFixed(1);
 make('path',{d,fill:'none',stroke:'#172c2a','stroke-width':23,'stroke-linecap':'round',opacity:.85},roads);
 const road=make('path',{d,fill:'none',stroke:'#708f82','stroke-width':9,'stroke-linecap':'round',opacity:.88},roads);
 const tip=make('title',{},road);tip.textContent='Corredor ecológico: '+biomes[a]+' ↔ '+biomes[b]+' · dispersión permitida en ambos sentidos';
}
const selectedSp=focus===null||focus===undefined?null:species.find(x=>String(x.id)===String(focus));
const positions=new Map(),byId=new Map(species.map(sp=>[String(sp.id),sp]));
const related=new Set();
const trophic=interactions.map(e=>({pred:String(e.predator??e.pred),prey:String(e.prey),n:Number(e.captures??e.n??0)})).filter(e=>e.n>0&&byId.has(e.pred)&&byId.has(e.prey));
if(selectedSp)for(const e of trophic){if(e.pred===String(focus))related.add(e.prey);if(e.prey===String(focus))related.add(e.pred)}
for(let i=0;i<6;i++){const [cx,cy]=spots[i],name=biomes[i]||'Bioma '+(i+1),g=make('g',{role:'group','aria-label':name}),active=selected===i;
make('circle',{cx,cy,r:136,fill:terrain[i],opacity:.22},g);
let ground=make('circle',{cx,cy,r:126,fill:terrain[i],stroke:active?'#fff0b0':'#739389','stroke-width':active?7:2},g);ground.style.cursor='pointer';ground.addEventListener('click',()=>onSelect({biome:i,id:null}));
for(let k=0;k<23;k++){let a=k*2.4,rad=20+Math.sqrt((k*17%37)/37)*95;make('circle',{cx:cx+Math.cos(a)*rad,cy:cy+Math.sin(a)*rad,r:2+k%3,fill:k%2?'#d7e0b7':'#173322',opacity:.23},g)}
decor[i].forEach((em,k)=>{const a=k*2.399,rad=79+(k%2)*15,z=make('text',{x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,'text-anchor':'middle','font-size':k%2?24:30,'pointer-events':'none'},g);z.textContent=em});
const residents=species.filter(sp=>(sp.population?.[i]||0)>0).sort((a,b)=>(b.population[i]||0)-(a.population[i]||0));const total=residents.reduce((n,sp)=>n+sp.population[i],0);
residents.forEach((sp,k)=>{const angle=k*2.399+0.35,rad=10+Math.sqrt((k+.5)/Math.max(1,residents.length))*91,x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad,focused=String(sp.id)===String(focus),dim=!!selectedSp&&!focused&&!related.has(String(sp.id));
positions.set(i+'|'+sp.id,{x,y});
const size=residents.length<=12?16:residents.length<=30?11:8;const btn=make('g',{role:'button',tabindex:'0','aria-label':sp.name+', '+sp.population[i]+' individuos',opacity:dim?.14:1},g);btn.style.cursor='pointer';
make('circle',{cx:x,cy:y,r:focused?size+4:size,fill:sp.diet==='carnivore'?'#61412e':'#194233',stroke:focused?'#fff2ab':sp.diet==='carnivore'?'#f4b07e':'#9ce5ad','stroke-width':focused?4:1.5},btn);
const em=make('text',{x,y:y+6,'text-anchor':'middle','font-size':residents.length<=12?20:residents.length<=30?15:11,'pointer-events':'none'},btn);em.textContent=icons[(Math.abs(Number(sp.id)||0)+(sp.diet==='carnivore'?4:0))%icons.length];
const tip=make('title',{},btn);tip.textContent=(sp.diet==='carnivore'?'Carnívoro · ':'Herbívoro · ')+sp.name+' · '+sp.population[i]+' individuos · '+Math.round(100*sp.population[i]/Math.max(1,total))+'% del bioma';
const click=e=>{e?.stopPropagation();onSelect({biome:i,id:focused?null:sp.id})};btn.addEventListener('click',click);btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click(e)}});
});
const titleWidth=Math.max(108,name.length*12+26);make('rect',{x:cx-titleWidth/2,y:cy-123,width:titleWidth,height:30,rx:14,fill:'#102427',opacity:.94,'pointer-events':'none'},g);const h=make('text',{x:cx,y:cy-102,'text-anchor':'middle','font-size':18,'font-weight':700,fill:'#f3f8f0','pointer-events':'none'},g);h.textContent=name;
const foot=make('text',{x:cx,y:cy+111,'text-anchor':'middle','font-size':12,fill:'#eff8ea','pointer-events':'none'},g);foot.textContent=residents.length+' especies · '+total.toLocaleString('es-ES')+' individuos'
}
// Overlay edges on actual animal icon centres after all biomes and markers have been laid out.
if(selectedSp){
 const chosenId=String(selectedSp.id),selectedPositions=Array.from(positions.entries()).filter(([key])=>key.split('|')[1]===chosenId).map(([key,p])=>({biome:Number(key.split('|')[0]),...p}));
 const chosenPositions=selectedPositions;
 const origin=chosenPositions.find(v=>v.biome===selectedSp.home)||chosenPositions[0];
 const layer=make('g',{'aria-label':'Conexiones ecológicas de la especie seleccionada'});
 const defs=make('defs',{},layer);
 for(const [name,color] of [['distribution','#ffe39b'],['prey','#fca66d'],['predator','#7bcdf1']]){
  const marker=make('marker',{id:'bwArrow-'+name,markerWidth:4,markerHeight:4,refX:5,refY:3,orient:'auto','markerUnits':'userSpaceOnUse'},defs);
  make('path',{d:'M0,1 L0,5 L6,3 z',fill:color},marker);
 }
 function edge(a,b,color,kind,title,offset=0){
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<4)return;
  const ux=dx/d,uy=dy/d,r=14;const sx=a.x+ux*r,sy=a.y+uy*r,ex=b.x-ux*r,ey=b.y-uy*r;
  const mx=(sx+ex)/2-uy*offset,my=(sy+ey)/2+ux*offset;
  const p=make('path',{d:'M '+sx.toFixed(1)+' '+sy.toFixed(1)+' Q '+mx.toFixed(1)+' '+my.toFixed(1)+' '+ex.toFixed(1)+' '+ey.toFixed(1),fill:'none',stroke:color,'stroke-width':kind==='distribution'?2.4:3,opacity:.94,'stroke-dasharray':kind==='distribution'?'6 6':'none','marker-end':'url(#bwArrow-'+kind+')','pointer-events':'stroke'},layer);const tip=make('title',{},p);tip.textContent=title;
 }
 if(origin)for(const target of chosenPositions){if(target.biome!==origin.biome)edge(origin,target,'#ffe39b','distribution',selectedSp.name+' presente en '+biomes[target.biome]+' (distribución actual, no desplazamiento observado)',-14)}
 for(const e of trophic.filter(e=>e.pred===chosenId||e.prey===chosenId).sort((a,b)=>b.n-a.n).slice(0,30)){
  const targetId=e.pred===chosenId?e.prey:e.pred,asPrey=e.pred===chosenId;
  let pairs=[];for(let i=0;i<6;i++){let a=positions.get(i+'|'+chosenId),b=positions.get(i+'|'+targetId);if(a&&b)pairs.push({a,b,i})}
  if(!pairs.length)continue;
  const predator=byId.get(e.pred),prey=byId.get(e.prey);
  // Show the same ecological relationship in EVERY currently shared biome, regardless of selected biome.
  for(const pair of pairs)edge(asPrey?pair.a:pair.b,asPrey?pair.b:pair.a,asPrey?'#fca66d':'#7bcdf1',asPrey?'prey':'predator',(predator?.name||'?')+' depreda a '+(prey?.name||'?')+' · '+e.n+' capturas (histórico global; no desglosado por bioma)',asPrey?13:-13);
 }
}
const legend=make('text',{x:500,y:875,'text-anchor':'middle',fill:'#eaf2e7','font-size':15},svg);legend.textContent='━ Gris verdoso = corredor permitido     ● Verde = herbívoro     ● Naranja = carnívoro     ◉ Dorado = seleccionado';
const footer=make('text',{x:500,y:903,'text-anchor':'middle',fill:'#bacbc2','font-size':13},svg);footer.textContent='Islotes ilustrativos · 1 icono = 1 especie · líneas entre biomas ocupados = distribución, no movimiento observado';
return {focused:selectedSp,visible:spots.length}
}};
