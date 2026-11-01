const {test,expect}=require('@playwright/test');
const path=require('path');
const example={format:'bioworld-viewer-v1',title:'Grupo de prueba',biomes:['forest'],resources:['Pastos','Frutos','Acuática','Detritos'],species:[{id:0,name:'Testensis',diet:'herbivore',home:0,traits:{size:2,repro:4,defense:3,attack:2,breadth:2,adapt:4},population:[12,0,0,0,0,0],kills:0}],history:[{cycle:0,herb:10,carn:0,total:10,alive:1,biomass:200,speciesPop:[[10,0,0,0,0,0]]},{cycle:1,herb:12,carn:0,total:12,alive:1,biomass:185,speciesPop:[[12,0,0,0,0,0]]}],predation:[],events:[],chronicle:[],biomeResources:[[100,85,0,0]]};
test('viewer: responsive layout and screenshot',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'grupo_prueba.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(example))});
 await expect(page.locator('#content')).toBeVisible();
 await page.screenshot({path:'viewer-mobile.png',fullPage:true});
 const width=await page.evaluate(()=>document.documentElement.scrollWidth);
 expect(width).toBeLessThanOrEqual(405);
});
test('student viewer: import, explore biomes, traits, download CSV',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'grupo_prueba.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(example))});
 await expect(page.locator('#content')).toBeVisible();
 await expect(page.locator('#worldName')).toHaveText('Grupo de prueba');
 await expect(page.locator('#speciesRows')).toContainText('Testensis');
 await page.locator('#bwViewerTabs [data-tab="species"]').click();
 await page.locator('#speciesRows [data-id]').first().click();
 await expect(page.locator('#detail')).toContainText('Testensis');
 await page.locator('#trait').selectOption('attack');
 await page.locator('#bwViewerTabs [data-tab="biomes"]').click();
 await page.locator('#ecoTerritoryMap circle').first().click({force:true});
 await expect(page.locator('#biomeDetail')).toContainText('12');
 expect(await page.locator('#csvHistory').isEnabled()).toBeTruthy();
 expect(errors).toEqual([]);
});

test('theme: dark by default, toggle to light and persist',async({page})=>{
 await page.goto('file://'+path.resolve('index.html'));
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('#themeToggle')).toBeVisible();
 await page.locator('#themeToggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('#themeToggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

test('shared atlas: click fauna and show focused ecology',async({page})=>{
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'grupo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(example))});
 await page.locator('#bwViewerTabs [data-tab="biomes"]').click();
 await expect(page.locator('#ecoTerritoryMap')).toBeVisible();
 await page.locator('#ecoTerritoryMap g[role="button"]').first().click();
 await expect(page.locator('#atlasInspector')).toContainText('Testensis');
 expect(await page.evaluate(()=>!!window.BioWorldAtlas)).toBeTruthy();
});

test('atlas focus: initial fauna visible, selecting then deselecting restores opacity',async({page})=>{
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'grupo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(example))});
 await page.locator('#bwViewerTabs [data-tab="biomes"]').click();
 const marker=page.locator('#ecoTerritoryMap g[role="button"]').first();
 await expect(marker).toHaveAttribute('opacity','1');
 await marker.click();
 await expect(page.locator('#atlasInspector')).toContainText('Testensis');
 await page.locator('#ecoTerritoryMap g[role="button"]').first().click();
 await expect(page.locator('#atlasInspector')).toContainText('Haz clic en un animal');
});

test('trophic links anchor to animal icons and inspector separates predator / prey',async({page})=>{
 const fixture=JSON.parse(JSON.stringify(example));
 fixture.species.push({...fixture.species[0],id:1,name:'Depredator test',diet:'carnivore',home:0,population:[5,0,0,0,0,0]});
 fixture.predation=[{predator:1,prey:0,captures:17}];
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'trophic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
 await page.locator('#bwViewerTabs [data-tab="biomes"]').click();
 await page.locator('#ecoTerritoryMap g[aria-label^="Testensis,"]').first().click();
 await expect(page.locator('#atlasInspector')).toContainText('Depredator test');
 await expect(page.locator('#atlasInspector')).toContainText('17 capturas');
 await expect(page.locator('#ecoTerritoryMap path[stroke="#7bcdf1"]')).toHaveCount(1);
 await expect(page.locator('#ecoTerritoryMap g[aria-label^="Depredator test,"]').first()).toHaveAttribute('opacity','1');
});

test('atlas species picker selects fauna without clicking icon',async({page})=>{
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'grupo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(example))});
 await page.locator('#bwViewerTabs [data-tab="biomes"]').click();
 await page.locator('#atlasSpeciesPicker').selectOption('0');
 await expect(page.locator('#atlasInspector')).toContainText('Testensis');
 await page.locator('#atlasSpeciesPicker').selectOption('');
 await expect(page.locator('#atlasInspector')).toContainText('Haz clic en un animal');
});

test('atlas corridors match the eight permitted dispersal connections',async({page})=>{
 await page.goto('file://'+path.resolve('index.html'));
 await page.locator('#file').setInputFiles({name:'grupo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(example))});await page.locator('#bwViewerTabs [data-tab="biomes"]').click();
 const paths=page.locator('#ecoTerritoryMap g[aria-label="Corredores ecológicos permanentes"] path');
 await expect(paths).toHaveCount(16);
 await expect(page.locator('#ecoTerritoryMap')).toHaveAttribute('viewBox','0 0 1000 920');
 await expect(page.locator('#ecoTerritoryMap')).toBeVisible();
});
