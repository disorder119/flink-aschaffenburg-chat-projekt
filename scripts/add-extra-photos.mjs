import { readFile, writeFile } from 'node:fs/promises';
import { extras } from '../src/data/extras.ts';
const evidence=JSON.parse(await readFile('research/raw/addon-evidence.json','utf8'));
const photos=JSON.parse(await readFile('src/data/photos.json','utf8'));
for(const p of extras){
  const found=evidence.find(e=>e.id===p.id);const image=found?.images?.[0];
  if(!image?.src)throw new Error('No original photo for '+p.id);
  let remote=image.src;
  if(remote.includes('contents.mediadecathlon.com')){const u=new URL(remote);u.searchParams.set('f','512x0');u.searchParams.set('quality','70');remote=u.href;}
  if(remote.includes('asset.action.com'))remote=remote.replace('/w_1080/','/w_512/');
  photos[p.id]={delivery:'official-embed',remote,alt:image.alt,credit:'Foto: '+p.shop,source:found.url,productUrl:p.url,original:image.src,reference:p.url,sourceTitle:found.heading,permission:'Direkte Einbettung der öffentlich erreichbaren Originaldatei des Herstellers/Händlers; keine lokale Kopie und keine Behauptung einer erteilten Bildlizenz. Keine Umgehung von Schutzmaßnahmen.',variant:'Gezeigtes Modell aus der Hauptgalerie der konkreten Produktseite. Packungsinhalt, Größe und verfügbare Variante im Shop prüfen.',checked:'2026-10-12'};
}
await writeFile('src/data/photos.json',JSON.stringify(photos,null,2)+'\n');
await writeFile('research/EXTRAS-2026-10-12.json',JSON.stringify(extras.map(p=>({id:p.id,name:p.name,url:p.url,price:p.price,priceNote:p.priceNote,checked:p.checked,photoSource:photos[p.id].source,photo:photos[p.id].original,sourceTitle:photos[p.id].sourceTitle,observedText:evidence.find(e=>e.id===p.id)?.text??evidence.find(e=>e.id===p.id)?.price??evidence.find(e=>e.id===p.id)?.prices})),null,2)+'\n');
console.log(Object.keys(photos).length+' exact-model photos');
