import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('research/raw',{recursive:true});
for(const url of process.argv.slice(2)){
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)});const html=await r.text();
 const key=new URL(url).pathname.replace(/[^a-zA-Z0-9_-]+/g,'-').slice(-120);
 await writeFile(`research/raw/media${key}.html`,html);
 const images=[...html.matchAll(/<img\b([^>]+)>/gi)].map(m=>({alt:m[1].match(/alt=["']([^"']*)/i)?.[1]??'',src:m[1].match(/(?:data-src|src)=["']([^"']*)/i)?.[1]??''}));
 const downloads=[...html.matchAll(/https?:[^\s"'<>]+\.(?:jpg|jpeg|png|webp|zip)(?:\?[^\s"'<>]*)?/gi)].map(m=>m[0]);
 console.log(JSON.stringify({url,status:r.status,images:images.filter(i=>/MT900|City|Glove|Jacket|Thermo|Rain|Mütze|Handschuh|Winter|products/i.test(i.alt+' '+i.src)),downloads:[...new Set(downloads)].slice(0,70)},null,2));
}
