/**
 * Tests du module de lecture vocale (tts.js).
 *
 * Vérifie :
 *   - le module se charge sans casser le moteur de traduction
 *   - il lit le texte traduit, jamais les montants
 *   - il fonctionne quand speechSynthesis est absent (repli propre)
 *
 * Exécution : node tests/test-tts.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SRC = path.join(__dirname, "..", "src");
const FIXTURE = path.join(__dirname, "fixture-real-dom.html");

let pass = 0, fail = 0;
const check = (label, cond, info) => {
  if (cond) pass++;
  else { fail++; console.log(`  ✗ ${label}${info ? " → " + info : ""}`); }
};

// ------------------------------------------------------------------ environnement simulé

function boot({ withSpeech }) {
  const html = fs.readFileSync(FIXTURE, "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only" });
  const w = dom.window;
  let listener = null;

  w.requestAnimationFrame = (cb) => setTimeout(cb, 0);

  // Synthèse vocale simulée
  const spoken = [];
  if (withSpeech) {
    w.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; this.rate = 1; this.pitch = 1; this.lang = ""; }
    };
    w.speechSynthesis = {
      speak(u) { spoken.push(u); if (u.onstart) u.onstart(); if (u.onend) u.onend(); },
      cancel() {},
      getVoices() { return [{ name: "Google français", lang: "fr-FR", default: true }]; },
    };
  }

  w.chrome = {
    runtime: {
      onMessage: { addListener: (f) => { listener = f; } },
      sendMessage() {},
    },
    storage: { sync: { get: (_k, cb) => cb({}) } },
  };

  ["guard", "dictionaries", "content", "tts"].forEach((n) => {
    w.eval(fs.readFileSync(path.join(SRC, n + ".js"), "utf8"));
  });

  return { w, spoken, ask: (msg) => new Promise((r) => listener(msg, {}, r)) };
}

(async () => {
  // ---------- 1. Le module se charge, la traduction fonctionne toujours
  {
    const { w } = boot({ withSpeech: true });
    check("content.js chargé", !!(w.__MERA && w.__MERA.loaded));
    check("tts.js chargé", !!(w.__MERA_TTS && w.__MERA_TTS.supported));

    w.__MERA.activate("ewo");
    await new Promise((r) => setTimeout(r, 2000));
    const t = w.document.body.textContent;
    check("traduction toujours fonctionnelle", t.includes("Masug, Amina") || t.includes("Mòni ma wom"));
    check("montant intact", /250\s*000/.test(t));
  }

  // ---------- 2. Lecture du texte traduit
  {
    const { w, spoken, ask } = boot({ withSpeech: true });
    w.__MERA.activate("bas");
    await new Promise((r) => setTimeout(r, 2000));

    const res = await ask({ type: "MERA_TTS", action: "speak-page" });
    check("TTS : réponse reçue", !!res);
    check("TTS : supporté", res && res.supported === true);
    check("TTS : a lu quelque chose", spoken.length > 0, `spoken=${spoken.length}`);

    if (spoken.length) {
      const text = spoken[0].text;
      check("TTS : lit du basaa traduit", /Ǹsɔ̀ŋgi|Yêglɛ̀|Ǹsaâ|Kɛ̂|Lɛɛgɛ̀/.test(text), text.slice(0, 80));
      check("TTS : ne lit PAS de montant", !/\d{3,}/.test(text.replace(/\s/g, " ")), text.slice(0, 80));
    }
  }

  // ---------- 3. Arrêt de la lecture
  {
    const { ask } = boot({ withSpeech: true });
    const res = await ask({ type: "MERA_TTS", action: "stop" });
    check("TTS : stop répond", res && res.stopped === true);
  }

  // ---------- 4. Navigateur sans synthèse vocale : pas de plantage
  {
    const { w, ask } = boot({ withSpeech: false });
    check("sans speechSynthesis : module chargé", !!w.__MERA_TTS);
    check("sans speechSynthesis : signalé non supporté", w.__MERA_TTS.supported === false);

    const res = await ask({ type: "MERA_TTS", action: "speak-page" });
    check("sans speechSynthesis : réponse propre", res && res.supported === false);

    // La traduction doit continuer de fonctionner
    w.__MERA.activate("ful");
    await new Promise((r) => setTimeout(r, 2000));
    const t = w.document.body.textContent;
    check("sans speechSynthesis : traduction OK", t.includes("Soodi") || t.includes("Ceede"));
  }

  // ---------- 4b. Navigateur avec API mais AUCUNE voix (cas Linux sans espeak-ng)
  {
    const html = fs.readFileSync(FIXTURE, "utf8");
    const dom = new JSDOM(html, { runScripts: "outside-only" });
    const w = dom.window;
    let listener = null;
    w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    w.SpeechSynthesisUtterance = class {
      constructor(t) { this.text = t; }
    };
    w.speechSynthesis = {
      speak() { /* muet */ },
      cancel() {},
      getVoices() { return []; }, // aucune voix installée
    };
    w.chrome = {
      runtime: { onMessage: { addListener: (f) => { listener = f; } }, sendMessage() {} },
      storage: { sync: { get: (_k, cb) => cb({}) } },
    };
    ["guard", "dictionaries", "content", "tts"].forEach((n) => {
      w.eval(fs.readFileSync(path.join(SRC, n + ".js"), "utf8"));
    });

    w.__MERA.activate("ewo");
    await new Promise((r) => setTimeout(r, 1800));

    const res = await new Promise((r) => listener({ type: "MERA_TTS", action: "speak-page" }, {}, r));
    check("aucune voix : ne prétend pas avoir parlé", res && res.spoken === false, JSON.stringify(res));
    check("aucune voix : raison explicite", res && res.reason === "no_voice", JSON.stringify(res));
    check("aucune voix : message d'aide fourni", res && /espeak-ng/.test(res.message || ""), JSON.stringify(res));
  }

  // ---------- 5. Liste des voix
  {
    const { ask } = boot({ withSpeech: true });
    const res = await ask({ type: "MERA_TTS", action: "voices" });
    check("voix : liste renvoyée", res && Array.isArray(res.voices));
    check("voix : français présent", res.voices.some((v) => v.lang.startsWith("fr")));
  }

  console.log("\n" + "=".repeat(55));
  console.log(`Lecture vocale : ${pass} réussis, ${fail} échoués`);
  console.log("=".repeat(55));
  process.exit(fail === 0 ? 0 : 1);
})();
