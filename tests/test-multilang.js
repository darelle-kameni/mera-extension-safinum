// Simule 8 changements de langue d'affilée, sans rechargement de page
const fs=require('fs'),{JSDOM}=require('jsdom');
const SRC=require('path').join(__dirname,'..','src');
const html=fs.readFileSync(require('path').join(__dirname,'fixture-real-dom.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'outside-only'});
const w=dom.window; w.requestAnimationFrame=cb=>setTimeout(cb,0);
w.chrome={runtime:{onMessage:{addListener(){}},sendMessage(){}},storage:{sync:{get:(k,cb)=>cb({})}}};
['guard','dictionaries','content'].forEach(n=>w.eval(fs.readFileSync(SRC+'/'+n+'.js','utf8')));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const MARK={ewo:'Mòni ma wom',ful:'Soodi woodi',bas:'Yêglɛ̀',dua:'Mòni ma bèm',en:'Available balance'};
const seq=['ewo','bas','ful','dua','ewo','ful','bas','en'];
(async()=>{
  let ok=0,bad=0;
  for(const lang of seq){
    w.__MERA.activate(lang); await wait(1200);
    const t=w.document.body.textContent;
    const good = lang==='en' ? t.includes('Available balance') : t.includes(MARK[lang]);
    const money = /250\s*000/.test(t);
    if(good&&money) ok++; else {bad++; console.log(`  ✗ ${lang}: marqueur=${good} montant=${money}`);}
    console.log(`${lang.padEnd(4)} → ${good?'✓':'✗'} | montant ${money?'intact':'PERDU'}`);
  }
  console.log(`\n${ok}/${seq.length} changements réussis, ${bad} échecs`);
  process.exit(bad?1:0);
})();
