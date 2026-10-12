import ts from 'typescript';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
const files=['src/App.tsx',...(await readdir('src/components')).filter(f=>f.endsWith('.tsx')).map(f=>'src/components/'+f)];
const program=ts.createProgram(files,{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,target:ts.ScriptTarget.ES2022,allowImportingTsExtensions:true,resolveJsonModule:true,esModuleInterop:true});
const checker=program.getTypeChecker();
const strings=new Set();
const normalize=s=>s.replace(/\s+/g,' ').trim();
const add=s=>{const value=normalize(s);if(value&&/[A-Za-zÄÖÜäöüß]/.test(value)&&!/^https?:|^#|^\//.test(value))strings.add(value);};
const cleanJsx=s=>{const lines=s.split(/\r\n|\n|\r/);let last=0;lines.forEach((l,i)=>{if(l.trim())last=i;});return lines.map((l,i)=>{let v=l.replace(/\t/g,' ');if(i)v=v.trimStart();if(i<lines.length-1)v=v.trimEnd();return v+(v&&i!==last?' ':'');}).join('');};
for(const file of files){
  const source=program.getSourceFile(file); let changed=false;
  const transform=context=>{
    const call=(expr)=>{
      changed=true;
      if(ts.isStringLiteral(expr)||ts.isNoSubstitutionTemplateLiteral(expr)){add(expr.text);return ts.factory.createCallExpression(ts.factory.createIdentifier('tr'),undefined,[expr]);}
      if(ts.isTemplateExpression(expr)){let key=expr.head.text;expr.templateSpans.forEach((s,i)=>key+=`{${i}}`+s.literal.text);add(key);return ts.factory.createCallExpression(ts.factory.createIdentifier('tr'),undefined,[ts.factory.createStringLiteral(key),ts.factory.createObjectLiteralExpression(expr.templateSpans.map((s,i)=>ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(String(i)),s.expression)))]);}
      return ts.factory.createCallExpression(ts.factory.createIdentifier('tr'),undefined,[expr]);
    };
    const isTextType=node=>{const t=checker.getTypeAtLocation(node);const list=t.isUnion()?t.types:[t];return list.some(x=>x.flags&ts.TypeFlags.StringLike)&&list.every(x=>x.flags&(ts.TypeFlags.StringLike|ts.TypeFlags.NumberLike|ts.TypeFlags.Null|ts.TypeFlags.Undefined));};
    const visit=node=>{
      if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))add(node.text);
      if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='setToast'&&node.arguments[0]){const expr=node.arguments[0];if(ts.isTemplateExpression(expr)){let key=expr.head.text;expr.templateSpans.forEach((s,i)=>key+=`{${i}}`+s.literal.text);add(key);}}
      if(ts.isJsxText(node)){const text=cleanJsx(node.text);if(!text.trim())return node;return ts.factory.createJsxExpression(undefined,call(ts.factory.createStringLiteral(text)));}
      if(ts.isJsxAttribute(node)&&['aria-label','title','alt','placeholder'].includes(node.name.getText(source))&&node.initializer){
        const init=node.initializer;
        if(ts.isStringLiteral(init))return ts.factory.updateJsxAttribute(node,node.name,ts.factory.createJsxExpression(undefined,call(init)));
        if(ts.isJsxExpression(init)&&init.expression&&!(ts.isCallExpression(init.expression)&&init.expression.expression.getText(source)==='tr'))return ts.factory.updateJsxAttribute(node,node.name,ts.factory.createJsxExpression(undefined,call(init.expression)));
      }
      if(ts.isJsxExpression(node)&&node.expression&&!ts.isJsxAttribute(node.parent)&&isTextType(node.expression)){
        if(ts.isCallExpression(node.expression)&&node.expression.expression.getText(source)==='tr')return ts.visitEachChild(node,visit,context);
        const expr=ts.visitEachChild(node.expression,visit,context);
        return ts.factory.updateJsxExpression(node,call(expr));
      }
      return ts.visitEachChild(node,visit,context);
    };return root=>ts.visitNode(root,visit);
  };
  const result=ts.transform(source,[transform]);
  if(changed){let output=ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(result.transformed[0]);if(!/import\s*\{[^}]*\btr\b[^}]*\}\s*from\s*["'][^"']*i18n\/core/.test(output))output=`import { tr } from "${file==='src/App.tsx'?'./i18n/core':'../i18n/core'}";\n`+output;await writeFile(file,output);}
  result.dispose();
}
for(const file of ['src/lib/logic.ts','src/lib/experience.ts','src/data/kits.ts','src/config/affiliate.ts']){
 const source=ts.createSourceFile(file,await readFile(file,'utf8'),ts.ScriptTarget.Latest,true);const visit=node=>{if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))add(node.text);ts.forEachChild(node,visit);};visit(source);
}
await mkdir('src/i18n',{recursive:true});await writeFile('src/i18n/source-ui.json',JSON.stringify([...strings].sort(),null,2)+'\n');
console.log('UI source strings: '+strings.size);
