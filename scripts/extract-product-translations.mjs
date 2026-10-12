import { products } from '../src/data/products.ts';
import { writeFile } from 'node:fs/promises';
const keys=new Set();
for(const p of products){for(const value of [p.waterNote,p.warmthNote,p.material,p.use,p.uncertainty,p.priceNote,p.caution,p.badge?.label,p.badge?.reason,...p.pros,...p.cons])if(value)keys.add(value.replace(/\s+/g,' ').trim());}
await writeFile('src/i18n/source-products.json',JSON.stringify([...keys].sort(),null,2)+'\n');
console.log('Product source strings: '+keys.size);
