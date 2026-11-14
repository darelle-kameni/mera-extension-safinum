/**
 * Tests du changement de langue sur les textes COMPOSÉS.
 *
 * Régression : « Mɛ̀ ǹyega, Amina » restait figé après un changement de langue,
 * car la salutation contient un prénom variable et n'existe pas comme clé
 * exacte dans la table inverse.
 *
 * Teste aussi la double injection du content script (le popup réinjecte en
 * secours) : une seconde instance ne doit pas restaurer l'ancienne langue.
 *
 * Exécution : node tests/test-switch.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SRC = path.join(__dirname, "..", "src");
const FIXTURE = path.join(__dirname, "fixture-real-dom.html");

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  if (actual === expected) pass++;
  else { fail++; console.log(`  ✗ ${label}\n      attendu : ${JSON.stringify(expected)}\n      obtenu  : ${JSON.stringify(actual)}`); }
};

function boot() {
  const dom = new JSDOM(fs.readFileSync(FIXTURE, "utf8"), { runScripts: "outside-only" });
  const w = dom.window;
  w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  w.chrome = {
    runtime: { onMessage: { addListener() {} }, sendMessage() {} },
    storage: { sync: { get: (_k, cb) => cb({}) } },
  };
  ["guard", "dictionaries", "content"].forEach((n) => {
    w.eval(fs.readFileSync(path.join(SRC, n + ".js"), "utf8"));
  });
  return w;
}

const greeting = (w) => {
  const h = w.document.querySelector("h1");
  return h ? h.textContent.trim() : "(pas de h1)";
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // ---------- 1. Changement de langue simple
  {
    const w = boot();
    check("version exposée", typeof w.__MERA.version, "string");
    check("double chargement immédiat ignoré", (() => {
      const before = w.__MERA;
      w.eval(fs.readFileSync(path.join(SRC, "content.js"), "utf8"));
      return w.__MERA === before;
    })(), true);
    const expected = {
      bas: "Mɛ̀ ǹyega, Amina",
      ewo: "Masug, Amina",
      ful: "Jam waali, Amina",
      dua: "Idib'a bwam, Amina",
      en: "Hello, Amina",
      fr: "Bonjour, Amina",
    };

    for (const lang of ["bas", "ewo", "ful", "dua", "en", "fr"]) {
      w.__MERA.activate(lang);
      await wait(900);
      check(`salutation en ${lang}`, greeting(w), expected[lang]);
      check(`montant intact en ${lang}`, /250\s*000/.test(w.document.body.textContent), true);
    }
  }

  // ---------- 2. Double injection : la seconde instance doit être ignorée
  {
    const w = boot();
    w.__MERA.activate("bas");
    await wait(900);
    check("double injection : basaa d'abord", greeting(w), "Mɛ̀ ǹyega, Amina");

    // Le popup réinjecte content.js (cas d'un onglet ouvert avant l'extension)
    w.eval(fs.readFileSync(path.join(SRC, "content.js"), "utf8"));

    w.__MERA.activate("ewo");
    await wait(900);
    check("double injection : passage en ewondo", greeting(w), "Masug, Amina");
    check("double injection : plus de basaa", /Mɛ̀ ǹyega/.test(w.document.body.textContent), false);
  }

  // ---------- 3. Texte composé déjà traduit, sans mémoire (page rechargée)
  {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><h1>Mɛ̀ ǹyega, Amina</h1><p>250 000 FCFA</p></body></html>`,
      { runScripts: "outside-only" },
    );
    const w = dom.window;
    w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    w.chrome = {
      runtime: { onMessage: { addListener() {} }, sendMessage() {} },
      storage: { sync: { get: (_k, cb) => cb({}) } },
    };
    ["guard", "dictionaries", "content"].forEach((n) => {
      w.eval(fs.readFileSync(path.join(SRC, n + ".js"), "utf8"));
    });

    w.__MERA.activate("ewo");
    await wait(900);
    check("page déjà en basaa → ewondo", greeting(w), "Masug, Amina");
    check("page déjà en basaa → montant intact", /250\s*000/.test(w.document.body.textContent), true);
  }

  // ---------- 4. Ancienne traduction « Mbolo » restée à l'écran
  {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><h1>Mbolo, Amina</h1><p>250 000 FCFA</p></body></html>`,
      { runScripts: "outside-only" },
    );
    const w = dom.window;
    w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    w.chrome = {
      runtime: { onMessage: { addListener() {} }, sendMessage() {} },
      storage: { sync: { get: (_k, cb) => cb({}) } },
    };
    ["guard", "dictionaries", "content"].forEach((n) => {
      w.eval(fs.readFileSync(path.join(SRC, n + ".js"), "utf8"));
    });

    w.__MERA.activate("bas");
    await wait(900);
    check("ancien Mbolo → basaa", greeting(w), "Mɛ̀ ǹyega, Amina");
    check("ancien Mbolo → montant intact", /250\s*000/.test(w.document.body.textContent), true);
  }

  console.log("\n" + "=".repeat(55));
  console.log(`Changement de langue : ${pass} réussis, ${fail} échoués`);
  console.log("=".repeat(55));
  process.exit(fail === 0 ? 0 : 1);
})();
