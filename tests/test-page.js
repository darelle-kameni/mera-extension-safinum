/**
 * Test d'intégration : simule la page Safinum réelle dans un DOM jsdom
 * et vérifie que la traduction fonctionne sans toucher aux valeurs.
 *
 * Exécution : npm install Exécution : node /tmp/opencode/test-page.jsExécution : node /tmp/opencode/test-page.js npm test
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const EXT = require("path").join(__dirname, "..", "src");

// Reproduit fidèlement la structure typique de la page de test Safinum
const HTML = `<!DOCTYPE html><html lang="fr"><body>
  <header>
    <h1>Tableau de bord</h1>
    <p>Consultez votre solde et lancez un transfert en toute sécurité.</p>
  </header>

  <section id="account">
    <p>Votre compte</p>
    <p>Numéro de compte</p>
    <p class="value">SNF-2026-0001</p>
    <span>Solde disponible</span>
    <strong>25 000 FCFA</strong>
  </section>

  <section id="form">
    <h2>Préparation du transfert</h2>
    <label>Montant</label>
    <input type="number" placeholder="Montant à envoyer" value="10000">
    <label>Bénéficiaire</label>
    <input type="text" placeholder="Nom du bénéficiaire">
    <label>Numéro de téléphone</label>
    <input type="tel" value="+237 6 57 41 67 60">

    <div class="fees">
      <span>Frais de transfert</span><span>100 FCFA</span>
      <span>Total à débiter</span><span>10 100 FCFA</span>
      <span>Solde après opération</span><span>14 900 FCFA</span>
    </div>

    <button>Continuer</button>
    <button>Retour</button>
  </section>

  <section id="summary">
    <h2>Récapitulatif et confirmation</h2>
    <p>Vérifiez les informations avant de confirmer le transfert.</p>
    <label><input type="checkbox"> Je confirme que les informations ci-dessus sont correctes.</label>
    <button>Confirmer le transfert</button>
    <button>Annuler</button>
  </section>

  <section id="receipt">
    <h2>Reçu de transfert</h2>
    <p>Votre transfert a été envoyé avec succès.</p>
    <p>Référence</p><p>TRX-2026-0001</p>
    <p>Date</p><p>12/11/2026</p>
  </section>

  <section id="errors">
    <p>Solde insuffisant pour effectuer ce transfert.</p>
    <p>Alerte de sécurité : vérifiez le numéro du bénéficiaire avant de continuer.</p>
    <p>Erreur réseau : le service est temporairement indisponible. Réessayez.</p>
  </section>
</body></html>`;

const dom = new JSDOM(HTML, { runScripts: "outside-only" });
const { window } = dom;

// Injecter les modules de l'extension
window.eval(fs.readFileSync(path.join(EXT, "guard.js"), "utf8"));
window.eval(fs.readFileSync(path.join(EXT, "dictionaries.js"), "utf8"));

const G = window.__MERA_GUARD;
const D = window.__MERA_DICTIONARIES;

// Moteur simplifié (même logique que content.js)
function translateText(text, code) {
  const t = text.trim();
  if (!t || G.isProtected(t)) return text;
  const map = D[code].map;
  if (Object.prototype.hasOwnProperty.call(map, t)) return map[t];
  // insensible à la casse, comme content.js
  const low = t.toLowerCase();
  for (const k of Object.keys(map)) {
    if (k.toLowerCase() === low) return map[k];
  }
  return text;
}

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (ok) pass++;
  else {
    fail++;
    console.log(`  ✗ ${label}\n      attendu : ${expected}\n      obtenu  : ${actual}`);
  }
}

function run(code) {
  const doc = dom.window.document;
  const results = { translated: 0, untouched: 0 };

  doc.querySelectorAll("h1,h2,p,span,strong,label,button,a").forEach((el) => {
    // Le texte direct de l'élément (comme l'extension)
    if (el.children.length > 0 && el.childNodes.length > 1) return;
    const before = el.textContent;
    const after = translateText(before, code);
    if (after !== before) results.translated++;
    else results.untouched++;
  });
  return results;
}

for (const code of ["ewo", "ful", "bas"]) {
  console.log(`\n=== ${code.toUpperCase()} : ${D[code].label} ===`);
  const r = run(code);
  console.log(`  éléments traduits : ${r.translated}`);
}

// ------------------------------------------------------ Vérifications clés (ewondo)
console.log("\n=== VÉRIFICATIONS EWO ===\n");
check("Titre traduit", translateText("Bonjour", "ewo"), D.ewo.map["Bonjour"]);
check("Solde disponible traduit", translateText("Solde disponible", "ewo"), D.ewo.map["Solde disponible"]);
check("Bouton traduit", translateText("Continuer", "ewo"), D.ewo.map["Continuer"]);
check("Casse ignorée", translateText("SOLDE DISPONIBLE", "ewo"), D.ewo.map["Solde disponible"]);

// Les valeurs financières restent intactes
console.log("--- Valeurs financières (doivent rester intactes) ---");
const FIN = [
  "25 000 FCFA",
  "100 FCFA",
  "10 100 FCFA",
  "14 900 FCFA",
  "SNF-2026-0001",
  "TRX-2026-0001",
  "+237 6 57 41 67 60",
  "12/11/2026",
  "05 nov. 2026",
  "10000",
];
for (const v of FIN) {
  for (const code of ["ewo", "ful", "bas"]) {
    check(`[${code}] intact : ${v}`, translateText(v, code), v);
  }
}

// Les alertes sont traduites (pas laissées en français)
console.log("--- Alertes de sécurité (doivent être traduites) ---");
const ALERTS = [
  "Alerte de sécurité",
  "Une erreur est survenue",
  "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.",
  "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.",
];
for (const a of ALERTS) {
  for (const code of ["ewo", "ful", "bas"]) {
    const out = translateText(a, code);
    check(`[${code}] alerte traduite : ${a.slice(0, 30)}…`, out !== a, true);
  }
}

console.log("\n" + "=".repeat(55));
console.log(`Résultat : ${pass} réussis, ${fail} échoués`);
console.log("=".repeat(55));
process.exit(fail === 0 ? 0 : 1);
