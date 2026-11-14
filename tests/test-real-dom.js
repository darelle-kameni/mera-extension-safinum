// Test sur une reproduction EXACTE de la structure rendue par le site
const fs=require('fs'),vm=require('vm');
const {JSDOM}=require('jsdom');
const S=require('path').join(__dirname,'..','src');

// Reproduit la sortie de rendu du composant HackathonTest (classes Tailwind, concaténations)
const HTML=`<!DOCTYPE html><html><body>
<div class="min-h-screen">
 <div class="rounded-2xl border px-5 py-4 text-sm"><span class="h-4 w-4"></span> Environnement de test — données fictives, aucune transaction réelle.</div>
 <header><p>Banque en ligne</p><a href="/"> Protocole de test</a><a href="/h">Retour au hackathon</a></header>
 <main>
  <p>Votre compte</p>
  <h1>Bonjour, Amina</h1>
  <p>Consultez votre solde et lancez un transfert en toute sécurité.</p>
  <p>Solde disponible</p><p>25 000 FCFA</p>
  <p>Numéro de compte : </p><p>SNF-2026-0001</p>
  <button> Effectuer un transfert</button>
  <button> Consulter les frais</button>
  <p>Transactions récentes</p>
  <p>05 nov. 2026 · Paiement marchand</p>
  <p>04 nov. 2026 · Salaire reçu</p>
  <p>02 nov. 2026 · Transfert reçu</p>
  <p>31 oct. 2026 · Facture électricité</p>
  <p>Connexion sécurisée</p>

  <h2>Frais de transfert</h2>
  <p>Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.</p>
  <p>Type d'opération</p><p>Montant à envoyer</p><p>Gratuit</p>
  <p>Frais</p><p>100 FCFA</p>
  <p>Total à débiter</p><p>10 100 FCFA</p>
  <p>Solde après opération</p><p>14 900 FCFA</p>
  <button>Continuer →</button><button>Retour</button>

  <h2>Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.</h2>
  <label>Nom du bénéficiaire</label><input placeholder="Nom du bénéficiaire">
  <label>Numéro de téléphone</label><input placeholder="Numéro de téléphone" value="+237 6 57 41 67 60">
  <label>Motif du transfert</label><input placeholder="Motif du transfert">
  <label>Note (optionnel)</label>
  <p>J'ai vérifié le nom et le numéro du bénéficiaire.</p>
  <button>Continuer →</button>

  <h2>Vérifiez les informations avant de confirmer le transfert.</h2>
  <p>Montant</p><p>10 000 FCFA</p>
  <p>Total débité</p><p>10 100 FCFA</p>
  <p>Téléphone</p><p>+237 6 57 41 67 60</p>
  <p>Référence</p><p>TRX-2026-0001</p>
  <p>Opération</p><p>Mobile Money</p>
  <p>Je confirme que les informations ci-dessus sont correctes.</p>
  <button> Confirmer le transfert</button><button> Modifier</button>

  <h2>Transfert effectué</h2>
  <p>Votre transfert a été envoyé avec succès.</p>
  <p>Statut </p><p> Succès</p>
  <button> Nouveau transfert</button>

  <p>Message important</p>
  <p>Une erreur est survenue</p>
  <p>Alerte de sécurité</p>
  <button aria-label="Fermer">×</button>
  <p>Sécurité</p>
  <p>Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.</p>
  <p>Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.</p>
 </main>
</div>
</body></html>`;

const dom=new JSDOM(HTML,{runScripts:'outside-only'});
const w=dom.window;
// polyfills minimal
w.requestAnimationFrame=cb=>setTimeout(cb,0);
w.chrome={runtime:{onMessage:{addListener(){}},sendMessage(){}},storage:{sync:{get(_k,cb){cb({})}}}};
w.eval(fs.readFileSync(S+'/guard.js','utf8'));
w.eval(fs.readFileSync(S+'/dictionaries.js','utf8'));
w.eval(fs.readFileSync(S+'/content.js','utf8'));

w.__MERA && w.__MERA.deactivate();
const MERA=w.__MERA;
if(!MERA||!MERA.loaded){console.log('✗ content.js ne s\'est pas chargé');process.exit(1);}

const doc=w.document;
function snapshot(){
  const t=[];
  const wk=doc.createTreeWalker(doc.body,w.NodeFilter.SHOW_TEXT);
  let n; while(n=wk.nextNode()){ if(n.nodeValue.trim()) t.push(n.nodeValue.trim()); }
  return t;
}
const before=snapshot();

// activer l'extension
const ok=MERA.activate('ewo');
console.log('Activation ewo :',ok);

// laisser les passes différées tourner
setTimeout(()=>{
  const after=snapshot();
  const changed=after.filter((x,i)=>x!==before[i]);
  console.log('Textes modifiés :',changed.length,'/',before.length);

  // vérifier que les valeurs sont intactes
  const money=['25 000 FCFA','10 100 FCFA','100 FCFA','14 900 FCFA','10 000 FCFA',
               'SNF-2026-0001','TRX-2026-0001','+237 6 57 41 67 60',
               '05 nov. 2026','04 nov. 2026','02 nov. 2026','31 oct. 2026'];
  let okMoney=true;
  for(const m of money){ if(!after.some(x=>x.includes(m))){ console.log('  ✗ VALEUR PERDUE:',m); okMoney=false; } }
  console.log(okMoney?'✓ Toutes les valeurs financières sont intactes':'✗ INTÉGRITÉ VIOLÉE');

  console.log('\nExtraits traduits :');
  changed.slice(0,12).forEach(c=>console.log('   ',c));

  process.exit(okMoney && changed.length>15 ? 0 : 1);
},4000);
