import { readFile, writeFile } from 'node:fs/promises';
const sources=JSON.parse(await readFile('src/i18n/source-ui.json','utf8'));
const identity=new Set(['Flink','Wolt','Uber Eats','Lieferando','Android','iPhone und iPad','Premium','LIVE 3D','RIDER STUDIO','Best Value Rider Kit','Budget Rider Kit','Premium Winter Rider Kit','STUDIO · ASCHAFFENBURG','FLINK ASCHAFFENBURG']);
const human=s=>!s.startsWith('.')&&!s.includes('\\')&&!/^[a-z0-9_-]+$/.test(s)&&!/^m[0-9]|^https?:|^rgb|^#[0-9a-f]|^translate|^scale|^rotate|^var\(/i.test(s)&&!/^[a-z][a-z0-9-]*(?: [a-z][a-z0-9-]*)+$/.test(s)&&s!=='currentColor'&&!s.includes('className')&&!s.startsWith('--')&&!identity.has(s);
const keys=sources.filter(human);
for(const extra of ['ab','von','nur Filiale','zzgl. Versand','Preis offen','Schließen','Artikel','Hände','Fußwärmer','Sprache auswählen'])if(!keys.includes(extra))keys.push(extra);
await writeFile('src/i18n/source-human.json',JSON.stringify(keys.sort(),null,2)+'\n');
console.log('Human UI strings: '+keys.length);
