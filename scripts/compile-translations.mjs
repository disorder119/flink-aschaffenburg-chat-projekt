import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
await mkdir('src/i18n/translations',{recursive:true});
await mkdir('src/i18n/locales',{recursive:true});
await mkdir('research/raw',{recursive:true});
const dictionaries={en:{},ar:{},hi:{}};
for(const file of (await readdir('src/i18n/translations')).filter(f=>f.endsWith('.json')).sort()){
  const entries=JSON.parse(await readFile('src/i18n/translations/'+file,'utf8'));
  for(const [source,values] of Object.entries(entries)){
    if(!Array.isArray(values)||values.length!==3||values.some(v=>typeof v!=='string'||!v))throw new Error('Invalid translation '+source);
    ['en','ar','hi'].forEach((lang,i)=>{dictionaries[lang][source.replace(/\s+/g,' ').trim()]=values[i];});
  }
}
for(const [lang,data] of Object.entries(dictionaries))await writeFile('src/i18n/locales/'+lang+'.json',JSON.stringify(data,null,2)+'\n');
const ui=JSON.parse(await readFile('src/i18n/source-human.json','utf8'));
const facts=JSON.parse(await readFile('src/i18n/source-products.json','utf8'));
const missing={ui:ui.filter(key=>!dictionaries.en[key]),facts:facts.filter(key=>!dictionaries.en[key])};
await writeFile('research/raw/missing-translations.json',JSON.stringify(missing,null,2)+'\n');
console.log(JSON.stringify({translated:Object.keys(dictionaries.en).length,missingUI:missing.ui.length,missingFacts:missing.facts.length}));
if (missing.ui.length || missing.facts.length) throw new Error('Missing translations; build stopped. See research/raw/missing-translations.json.');
