import ts from 'typescript';
import { readFile, readdir, writeFile } from 'node:fs/promises';
const files=['src/App.tsx',...(await readdir('src/components')).filter(f=>f.endsWith('.tsx')).map(f=>'src/components/'+f)];
const keys=new Set(JSON.parse(await readFile('src/i18n/source-human.json','utf8')));
const ignored=new Set(['maxPrice','photoOnly','userSpaceOnUse']);
for(const file of files){
 const source=ts.createSourceFile(file,await readFile(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const collect=node=>{if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){const key=node.text.replace(/\s+/g,' ').trim();if(key&&/[a-zA-ZäöüÄÖÜß]/.test(key)&&!ignored.has(key)&&!key.startsWith('url('))keys.add(key);}ts.forEachChild(node,collect);};
 const visit=node=>{if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='tr')for(const arg of node.arguments)collect(arg);ts.forEachChild(node,visit);};visit(source);
}
const result=[...keys].filter(key=>!ignored.has(key)&&!key.startsWith('url('));
await writeFile('src/i18n/source-human.json',JSON.stringify(result.sort(),null,2)+'\n');
console.log('Audited '+result.length+' UI keys');
