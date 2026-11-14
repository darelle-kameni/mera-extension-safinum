/**
 * Test du compteur : vérifie que le popup reçoit un vrai nombre après traduction.
 * Simule le cycle complet : activation → passes différées → MERA_STATUS.
 *
 * Exécution : node tests/test-counter.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SRC = path.join(__dirname, "..", "src");

const HTML = `<!DOCTYPE html><html><body>
  <p>Votre compte</p>
  <h1>Bonjour, Amina</h1>
  <p>Consultez votre solde et lancez un transfert en toute sécurité.</p>
  <p>Solde disponible</p><p>25 000 FCFA</p>
  <p>Numéro de compte : </p><p>SNF-2026-0001</p>
  <button> Effectuer un transfert</button>
  <button> Consulter les frais</button>
  <p>Transactions récentes</p>
  <p>Frais de transfert</p>
  <p>Total à débiter</p><p>10 100 FCFA</p>
  <p>Solde après opération</p><p>14 900 FCFA</p>
  <button>Continuer →</button><button>Retour</button>
  <p>Nom du bénéficiaire</p>
  <p>Numéro de téléphone</p><p>+237 6 57 41 67 60</p>
  <p>Vérifiez les informations avant de confirmer le transfert.</p>
  <p>Transfert effectué</p>
  <p>Votre transfert a été envoyé avec succès.</p>
  <p>Sécurité</p>
  <p>Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.</p>
</body></html>`;

const dom = new JSDOM(HTML, { runScripts: "outside-only" });
const w = dom.window;

// --- Simulation de l'API Chrome
let messageListener = null;
const sent = [];
w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
w.chrome = {
  runtime: {
    onMessage: { addListener: (fn) => { messageListener = fn; } },
    sendMessage: (msg) => { sent.push(msg); },
  },
  storage: { sync: { get: (_k, cb) => cb({}) } },
};

w.eval(fs.readFileSync(path.join(SRC, "guard.js"), "utf8"));
w.eval(fs.readFileSync(path.join(SRC, "dictionaries.js"), "utf8"));
w.eval(fs.readFileSync(path.join(SRC, "content.js"), "utf8"));

if (!w.__MERA || !w.__MERA.loaded) {
  console.log("✗ content.js non chargé");
  process.exit(1);
}

// --- Simule un message venu du popup
function askStatus() {
  return new Promise((resolve) => {
    messageListener({ type: "MERA_STATUS" }, {}, resolve);
  });
}

function activate(language) {
  return new Promise((resolve) => {
    messageListener({ type: "MERA_ACTIVATE", language }, {}, resolve);
  });
}

(async () => {
  let pass = 0, fail = 0;
  const check = (label, cond, info) => {
    if (cond) pass++;
    else { fail++; console.log(`  ✗ ${label}${info ? " → " + info : ""}`); }
  };

  // 1. Avant activation : inactif (activation manuelle via le popup)
  const before = await askStatus();
  check("avant activation : inactif", before.active === false);
  check("avant activation : 0 traduit", before.stats.translated === 0);

  // 2. Activation
  const res = await activate("ewo");
  check("activation réussie", res.ok === true);

  // 3. Interrogation immédiate (le popup interroge tout de suite)
  const immediate = await askStatus();
  check("statut : actif", immediate.active === true);
  check("statut : langue ewo", immediate.language === "ewo");
  check("compteur immédiat > 0", immediate.stats.translated > 0, `obtenu ${immediate.stats.translated}`);

  // 4. Après les passes différées (le compteur doit rester cohérent)
  await new Promise((r) => setTimeout(r, 4000));
  const later = await askStatus();
  check("compteur après passes > 0", later.stats.translated > 0, `obtenu ${later.stats.translated}`);
  check("compteur ne double pas", later.stats.translated < 200, `obtenu ${later.stats.translated}`);

  // 5. Le texte est réellement traduit
  const body = w.document.body.textContent;
  check("« Bonjour, Amina » traduit", body.includes("Masug, Amina"));
  check("« Solde disponible » traduit", body.includes("Mòni ma wom"));

  // 6. Les valeurs sont intactes
  ["25 000 FCFA", "10 100 FCFA", "14 900 FCFA", "SNF-2026-0001", "+237 6 57 41 67 60"].forEach((v) => {
    check(`valeur intacte : ${v}`, body.includes(v));
  });

  // 7. Messages envoyés au popup (MERA_STATS)
  check("des MERA_STATS sont émis", sent.some((m) => m.type === "MERA_STATS"));

  // 8. Désactivation → remise à zéro
  await new Promise((resolve) => messageListener({ type: "MERA_DEACTIVATE" }, {}, resolve));
  const off = await askStatus();
  check("désactivé : 0 traduit", off.stats.translated === 0);
  check("désactivé : texte restauré", w.document.body.textContent.includes("Bonjour, Amina"));
  check("désactivé : montant intact", w.document.body.textContent.includes("25 000 FCFA"));

  console.log("\n" + "=".repeat(55));
  console.log(`Compteur : ${pass} réussis, ${fail} échoués`);
  console.log(`Valeur affichée au popup : ${immediate.stats.translated} traduits`);
  console.log("=".repeat(55));
  process.exit(fail === 0 ? 0 : 1);
})();
