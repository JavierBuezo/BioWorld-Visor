/* BioWorld · shared ecological atlas (Director + Student Viewer) */
window.BioWorldAtlas={render({svg,species,biomes,selected,focus,onSelect,interactions=[]}){
if(!svg)return;svg.replaceChildren();svg.setAttribute('viewBox','0 0 1000 710');
const ns='http://www.w3.org/2000/svg',make=(t,a={},p=svg)=>{const e=document.createElementNS(ns,t);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,String(v)));p.appendChild(e);return e};
make('rect',{width:1000,height:710,fill:'#0c1d20'});
const spots=[[177,171],[500,171],[823,171],[177,494],[500,494],[823,494]],terrain=['#426f49','#698650','#426d70','#99835c','#6f8076','#8c925a'],decor=[['🌳','🌲','🌿','🌳','🍄','🌲'],['🌾','🌿','🌼','🌾','🌱'],['🪷','💧','🌿','🪸','🌱'],['🌵','🪨','🌵','☀️','🪨'],['🏔️','⛰️','🪨','🌲','🪨'],['🌳','🌾','🌴','🌿','🌾']],icons=['🐭','🐇','🦌','🦊','🦉','🐺','🐦','🦎','🐗','🦋','🐸','🐿️'];
const selectedSp=focus===null||focus===undefined?null:species.find(x=>x.id===focus);
// Draw links below the terrain: endpoints are located precisely on the two island boundaries.
if(selectedSp && Number.isInteger(Number(selectedSp.home)) && selectedSp.home>=0 && selectedSp.home<6){
 const from=spots[selectedSp.home], links=spots.map((to,i)=>({to,i,n:selectedSp.population?.[i]||0})).filter(v=>v.n>0&&v.i!==selectedSp.home);
 for(const {to,n} of links){
  const dx=to[0]-from[0],dy=to[1]-from[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const start=[from[0]+ux*126,from[1]+uy*126],end=[to[0]-ux*126,to[1]-uy*126];
  const mid=[(start[0]+end[0])/2-uy*12,(start[1]+end[1])/2+ux*12];
  const edge=make('path',{d:'M '+start[0].toFixed(1)+' '+start[1].toFixed(1)+' Q '+mid[0].toFixed(1)+' '+mid[1].toFixed(1)+' '+end[0].toFixed(1)+' '+end[1].toFixed(1),stroke:'#f9d77e','stroke-width':2.5,fill:'none','stroke-dasharray':'7 7',opacity:.85,'pointer-events':'none'});
  const tip=make('title',{},edge);tip.textContent='Distribución de '+selectedSp.name+': '+n+' individuos en '+biomes[spots.findIndex(p=>p===to)];
 }
}
for(let i=0;i<6;i++){const [cx,cy]=spots[i],name=biomes[i]||'Bioma '+(i+1),g=make('g',{role:'group','aria-label':name}),active=selected===i;
make('circle',{cx,cy,r:136,fill:terrain[i],opacity:.22},g);
let ground=make('circle',{cx,cy,r:126,fill:terrain[i],stroke:active?'#fff0b0':'#739389','stroke-width':active?7:2},g);ground.style.cursor='pointer';ground.addEventListener('click',()=>onSelect({biome:i,id:null}));
for(let k=0;k<23;k++){let a=k*2.4,rad=20+Math.sqrt((k*17%37)/37)*95;make('circle',{cx:cx+Math.cos(a)*rad,cy:cy+Math.sin(a)*rad,r:2+k%3,fill:k%2?'#d7e0b7':'#173322',opacity:.23},g)}
decor[i].forEach((em,k)=>{const a=k*2.399,rad=79+(k%2)*15,z=make('text',{x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,'text-anchor':'middle','font-size':k%2?24:30,'pointer-events':'none'},g);z.textContent=em});
const residents=species.filter(sp=>(sp.population?.[i]||0)>0).sort((a,b)=>(b.population[i]||0)-(a.population[i]||0));const total=residents.reduce((n,sp)=>n+sp.population[i],0);
residents.forEach((sp,k)=>{const angle=k*2.399+0.35,rad=10+Math.sqrt((k+.5)/Math.max(1,residents.length))*91,x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad,focused=sp.id===focus,dim=focus!==null&&focus!==undefined&&!focused;
const size=residents.length<=12?16:residents.length<=30?11:8;const btn=make('g',{role:'button',tabindex:'0','aria-label':sp.name+', '+sp.population[i]+' individuos',opacity:dim?.17:1},g);btn.style.cursor='pointer';
make('circle',{cx:x,cy:y,r:focused?size+4:size,fill:sp.diet==='carnivore'?'#61412e':'#194233',stroke:focused?'#fff2ab':'#dceccf','stroke-width':focused?4:1.5},btn);
const em=make('text',{x,y:y+6,'text-anchor':'middle','font-size':residents.length<=12?20:residents.length<=30?15:11,'pointer-events':'none'},btn);em.textContent=icons[(Math.abs(Number(sp.id)||0)+(sp.diet==='carnivore'?4:0))%icons.length];
const tip=make('title',{},btn);tip.textContent=sp.name+' · '+sp.population[i]+' individuos · '+Math.round(100*sp.population[i]/Math.max(1,total))+'% del bioma';
const click=e=>{e?.stopPropagation();onSelect({biome:i,id:focused?null:sp.id})};btn.addEventListener('click',click);btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click(e)}});
});
const h=make('text',{x:cx,y:cy-147,'text-anchor':'middle','font-size':19,'font-weight':700,fill:'#ecf4eb'},svg);h.textContent=name;
const foot=make('text',{x:cx,y:cy+111,'text-anchor':'middle','font-size':12,fill:'#eff8ea','pointer-events':'none'},g);foot.textContent=residents.length+' especies · '+total.toLocaleString('es-ES')+' individuos'
}
const footer=make('text',{x:500,y:696,'text-anchor':'middle',fill:'#bacbc2','font-size':13},svg);footer.textContent='Islotes ilustrativos · 1 icono = 1 especie · líneas entre biomas ocupados = distribución, no movimiento observado';
return {focused:selectedSp,visible:spots.length}
}};
