const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const SRC=require('path').join(__dirname,'..','src');
const HTML=`<!DOCTYPE html><html><body>
<p>Solde disponible</p><p>25 000 FCFA</p><p>Bonjour, Amina</p>
<p>Frais de transfert</p><p>Continuer →</p><p>Nom du bénéficiaire</p>
<p>Votre transfert a été envoyé avec succès.</p></body></html>`;
const dom=new JSDOM(HTML,{runScripts:'outside-only'});const w=dom.window;
let L=null;w.requestAnimationFrame=cb=>setTimeout(cb,0);
w.chrome={runtime:{onMessage:{addListener:f=>L=f},sendMessage(){}},storage:{sync:{get:(k,cb)=>cb({})}}};
w.eval(fs.readFileSync(SRC+'/guard.js','utf8'));
w.eval(fs.readFileSync(SRC+'/dictionaries.js','utf8'));
w.eval(fs.readFileSync(SRC+'/content.js','utf8'));
const ask=()=>new Promise(r=>L({type:'MERA_STATUS'},{},r));
const act=c=>new Promise(r=>L({type:'MERA_ACTIVATE',language:c},{},r));
const off=()=>new Promise(r=>L({type:'MERA_DEACTIVATE'},{},r));
(async()=>{
  let ok=0,bad=0;
  const ck=(l,c,i)=>{if(c)ok++;else{bad++;console.log('  ✗',l,i||'')}};
  // auto-activation déjà en ewo
  await act('ful'); await new Promise(r=>setTimeout(r,2500));
  const a=(await ask()).stats.translated;
  ck('1er passage : compteur > 0',a>0,'='+a);
  await off();
  const b=await ask();
  ck('après restauration : 0',b.stats.translated===0,'='+b.stats.translated);
  ck('texte restauré',w.document.body.textContent.includes('Bonjour, Amina'));
  await act('bas'); await new Promise(r=>setTimeout(r,2500));
  const c=(await ask()).stats.translated;
  ck('2e passage : compteur > 0',c>0,'='+c);
  ck('compteur stable (pas de double)',c<=a+2,`1er=${a} 2e=${c}`);
  const body=w.document.body.textContent;
  ck('bas : 25 000 FCFA intact',body.includes('25 000 FCFA'));
  console.log(`\nCycle : ${ok} réussis, ${bad} échoués  (1er=${a}, 2e=${c})`);
  process.exit(bad?1:0);
})();
