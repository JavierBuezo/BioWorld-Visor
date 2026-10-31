/* BioWorld · shared ecological atlas (Director + Student Viewer) */
window.BioWorldAtlas={render({svg,species,biomes,selected,focus,onSelect,interactions=[]}){
if(!svg)return;svg.replaceChildren();svg.setAttribute('viewBox','0 0 1000 710');
const ns='http://www.w3.org/2000/svg',make=(t,a={},p=svg)=>{const e=document.createElementNS(ns,t);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,String(v)));p.appendChild(e);return e};
make('rect',{width:1000,height:710,fill:'#0c1d20'});
const spots=[[177,171],[500,171],[823,171],[177,494],[500,494],[823,494]],terrain=['#426f49','#698650','#426d70','#99835c','#6f8076','#8c925a'],decor=[['🌳','🌲','🌿','🌳','🍄','🌲'],['🌾','🌿','🌼','🌾','🌱'],['🪷','💧','🌿','🪸','🌱'],['🌵','🪨','🌵','☀️','🪨'],['🏔️','⛰️','🪨','🌲','🪨'],['🌳','🌾','🌴','🌿','🌾']],icons=['🐭','🐇','🦌','🦊','🦉','🐺','🐦','🦎','🐗','🦋','🐸','🐿️'];
const selectedSp=species.find(x=>x.id===focus),known=selectedSp?species.filter(x=>x.id===focus):[];
for(let i=0;i<6;i++){const [cx,cy]=spots[i],name=biomes[i]||'Bioma '+(i+1),g=make('g',{role:'group','aria-label':name}),active=selected===i;
make('circle',{cx,cy,r:136,fill:terrain[i],opacity:.22},g);
let ground=make('circle',{cx,cy,r:126,fill:terrain[i],stroke:active?'#fff0b0':'#739389','stroke-width':active?7:2},g);ground.style.cursor='pointer';ground.addEventListener('click',()=>onSelect({biome:i,id:null}));
for(let k=0;k<23;k++){let a=k*2.4,rad=20+Math.sqrt((k*17%37)/37)*95;make('circle',{cx:cx+Math.cos(a)*rad,cy:cy+Math.sin(a)*rad,r:2+k%3,fill:k%2?'#d7e0b7':'#173322',opacity:.23},g)}
decor[i].forEach((em,k)=>{const a=k*2.399,rad=79+(k%2)*15,z=make('text',{x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,'text-anchor':'middle','font-size':k%2?24:30,'pointer-events':'none'},g);z.textContent=em});
const residents=species.filter(sp=>(sp.population?.[i]||0)>0).sort((a,b)=>(b.population[i]||0)-(a.population[i]||0));const total=residents.reduce((n,sp)=>n+sp.population[i],0);
residents.slice(0,12).forEach((sp,k)=>{const angle=k*2.399+0.35,rad=17+Math.sqrt(k/12)*68,x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad,focused=sp.id===focus,dim=focus!==null&&focus!==undefined&&!focused;
const btn=make('g',{role:'button',tabindex:'0','aria-label':sp.name+', '+sp.population[i]+' individuos',opacity:dim?.22:1},g);btn.style.cursor='pointer';
make('circle',{cx:x,cy:y,r:focused?20:16,fill:sp.diet==='carnivore'?'#61412e':'#194233',stroke:focused?'#fff2ab':'#dceccf','stroke-width':focused?4:1.5},btn);
const em=make('text',{x,y:y+6,'text-anchor':'middle','font-size':20,'pointer-events':'none'},btn);em.textContent=icons[(Math.abs(Number(sp.id)||0)+(sp.diet==='carnivore'?4:0))%icons.length];
const tip=make('title',{},btn);tip.textContent=sp.name+' · '+sp.population[i]+' individuos · '+Math.round(100*sp.population[i]/Math.max(1,total))+'% del bioma';
const click=e=>{e?.stopPropagation();onSelect({biome:i,id:sp.id})};btn.addEventListener('click',click);btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click(e)}});
});
const h=make('text',{x:cx,y:cy-147,'text-anchor':'middle','font-size':19,'font-weight':700,fill:'#ecf4eb'},svg);h.textContent=name;
const foot=make('text',{x:cx,y:cy+111,'text-anchor':'middle','font-size':12,fill:'#eff8ea','pointer-events':'none'},g);foot.textContent=residents.length+' especies · '+total.toLocaleString('es-ES')+' individuos'+(residents.length>12?' · +'+(residents.length-12):'')
}
if(selectedSp){const from=spots[selectedSp.home]||spots[selected],present=spots.map((p,i)=>({p,i,n:selectedSp.population?.[i]||0})).filter(v=>v.n>0&&v.i!==selectedSp.home);
for(const {p,n} of present){const path=make('path',{d:'M '+from[0]+' '+(from[1]-110)+' Q 500 342 '+p[0]+' '+(p[1]-110),stroke:'#fbda82','stroke-width':2+Math.min(5,Math.log10(n+1)),fill:'none','stroke-dasharray':'9 7',opacity:.9,'pointer-events':'none'},svg);const tooltip=make('title',{},path);tooltip.textContent='Distribución actual desde bioma de origen · '+n+' individuos; no representa trayectorias registradas'}}
const footer=make('text',{x:500,y:696,'text-anchor':'middle',fill:'#bacbc2','font-size':13},svg);footer.textContent='Islotes ilustrativos · 1 icono = 1 especie · líneas discontinuas = distribución, no movimiento observado';
return {focused:selectedSp,visible:spots.length}
}};
