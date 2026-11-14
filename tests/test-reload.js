/**
 * Test du scénario qui a cassé l'extension :
 * la page de test est DÉJÀ traduite et un nouveau content script est injecté
 * (rechargement d'extension, ou ancien + nouveau script sur la même page).
 *
 * Le nouveau script ne doit pas rester bloqué : il doit pouvoir retraduire,
 * et « Restaurer » doit ramener le français.
 *
 * Exécution : node tests/test-reload.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SRC = path.join(__dirname, "..", "src");

const FRENCH_HTML = `<!DOCTYPE html><html><body>
  <p>Bonjour, Amina</p>
  <p>Solde disponible</p>
  <p>25 000 FCFA</p>
  <p>Frais de transfert</p>
  <p>Continuer →</p>
  <p>Nom du bénéficiaire</p>
  <p>Veuillez</p>
</body></html>`;

function boot(html, storage) {
  const dom = new JSDOM(html, { runScripts: "outside-only" });
  const w = dom.window;
  let listener = null;
  w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  w.chrome = {
    runtime: { onMessage: { addListener: (f) => (listener = f) }, sendMessage() {} },
    storage: { sync: { get: (_k, cb) => cb(storage || {}) } },
  };
  const load = () => {
    w.eval(fs.readFileSync(path.join(SRC, "guard.js"), "utf8"));
    w.eval(fs.readFileSync(path.join(SRC, "dictionaries.js"), "utf8"));
    w.eval(fs.readFileSync(path.join(SRC, "content.js"), "utf8"));
  };
  return { w, load, ask: () => new Promise((r) => listener({ type: "MERA_STATUS" }, {}, r)) };
}

(async () => {
  let pass = 0, fail = 0;
  const check = (l, c, i) => { if (c) pass++; else { fail++; console.log(`  ✗ ${l}${i ? " → " + i : ""}`); } };

  // ---------- CAS 1 : page en français, activation normale
  {
    const { w, load, ask } = boot(FRENCH_HTML);
    load();
    await new Promise((r) => {
      w.chrome.runtime.onMessage.addListener === undefined;
      r();
    });
    // activer via le listener capturé
    const { w: w1 } = { w };
    let L = null;
    // recharger pour récupérer le listener
    const inst = boot(FRENCH_HTML);
    inst.load();
    // le listener est interne : on passe par __MERA
    inst.w.__MERA.activate("ewo");
    await new Promise((r) => setTimeout(r, 2500));
    const t = inst.w.document.body.textContent;
    check("CAS 1 : texte traduit", t.includes("Masug, Amina"));
    check("CAS 1 : montant intact", t.includes("25 000 FCFA"));
  }

  // ---------- CAS 2 : page DÉJÀ traduite + nouveau script (le bug)
  {
    // On traduit d'abord une session
    const first = boot(FRENCH_HTML);
    first.load();
    first.w.__MERA.activate("ewo");
    await new Promise((r) => setTimeout(r, 1500));
    const translatedHTML = first.w.document.documentElement.outerHTML;

    // On injecte un NOUVEAU script sur cette page déjà traduite
    const second = boot(translatedHTML);
    second.load();
    check("CAS 2 : page arrive traduite", second.w.document.body.textContent.includes("Masug"));

    // Le nouveau script doit pouvoir retraduire (ou restaurer)
    second.w.__MERA.activate("ful");
    await new Promise((r) => setTimeout(r, 2500));
    const body = second.w.document.body.textContent;
    check("CAS 2 : « Solde disponible » devient fulfulde", body.includes("Soodi woodi"), body.slice(0, 80));
    check("CAS 2 : montant intact", body.includes("25 000 FCFA"));

    // Et « Restaurer » doit ramener le français
    second.w.__MERA.deactivate();
    await new Promise((r) => setTimeout(r, 200));
    const restored = second.w.document.body.textContent;
    check("CAS 2 : restauration → français", restored.includes("Solde disponible"), restored.slice(0, 80));
    check("CAS 2 : restauration garde le montant", restored.includes("25 000 FCFA"));
  }

  // ---------- CAS 3 : double injection simultanée
  {
    const inst = boot(FRENCH_HTML);
    inst.load();
    inst.load(); // ancien + nouveau
    inst.w.__MERA.activate("bas");
    await new Promise((r) => setTimeout(r, 2500));
    const t = inst.w.document.body.textContent;
    check("CAS 3 : double injection traduit", t.includes("Yêglɛ̀"), t.slice(0, 80));
    check("CAS 3 : montant intact", t.includes("25 000 FCFA"));
  }

  console.log("\n" + "=".repeat(55));
  console.log(`Rechargement : ${pass} réussis, ${fail} échoués`);
  console.log("=".repeat(55));
  process.exit(fail === 0 ? 0 : 1);
})();
