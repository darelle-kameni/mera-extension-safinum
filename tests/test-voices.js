/**
 * Vérifie la sélection de voix : français et anglais doivent fonctionner.
 * Exécution : node tests/test-voices.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SRC = path.join(__dirname, "..", "src");
const FIXTURE = path.join(__dirname, "fixture-real-dom.html");

let pass = 0, fail = 0;
const check = (l, c, i) => { if (c) pass++; else { fail++; console.log(`  ✗ ${l}${i ? " → " + i : ""}`); } };

function boot(voices) {
  const dom = new JSDOM(fs.readFileSync(FIXTURE, "utf8"), { runScripts: "outside-only" });
  const w = dom.window;
  let listener = null;
  const spoken = [];

  w.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  w.SpeechSynthesisUtterance = class {
    constructor(t) { this.text = t; this.voice = null; this.lang = ""; }
  };
  w.speechSynthesis = {
    speak(u) { spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }); if (u.onstart) u.onstart(); if (u.onend) u.onend(); },
    cancel() {},
    getVoices() { return voices; },
    onvoiceschanged: null,
  };
  w.chrome = {
    runtime: { onMessage: { addListener: (f) => { listener = f; } }, sendMessage() {} },
    storage: { sync: { get: (_k, cb) => cb({}) } },
  };
  ["guard", "dictionaries", "content", "tts"].forEach((n) => {
    w.eval(fs.readFileSync(path.join(SRC, n + ".js"), "utf8"));
  });
  return { w, spoken, ask: (m) => new Promise((r) => listener(m, {}, r)) };
}

(async () => {
  // ---------- Cas 1 : voix française + anglaise installées
  {
    const voices = [
      { name: "English United States", lang: "en-US", default: true },
      { name: "French France", lang: "fr-FR", default: false },
    ];
    const { w, spoken, ask } = boot(voices);

    check("voix : les 2 langues sont visibles", w.__MERA_TTS.voices().length === 2);

    // Lecture par défaut → français prioritaire
    await ask({ type: "MERA_TTS", action: "speak-page" });
    check("lecture : utilise le français", spoken.length > 0 && spoken[0].lang.startsWith("fr"),
      spoken[0] && spoken[0].lang);

    // Lecture forcée en anglais
    spoken.length = 0;
    w.__MERA_TTS.speak("Bonjour", { langHint: "en" });
    check("lecture anglaise : utilise l'anglais", spoken.length > 0 && spoken[0].lang.startsWith("en"),
      spoken[0] && spoken[0].lang);
  }

  // ---------- Cas 2 : seulement une voix anglaise
  {
    const voices = [{ name: "English", lang: "en-US", default: true }];
    const { spoken, ask } = boot(voices);
    await ask({ type: "MERA_TTS", action: "speak-page" });
    check("anglais seul : parle quand même", spoken.length > 0, `spoken=${spoken.length}`);
    check("anglais seul : utilise en-US", spoken[0] && spoken[0].lang === "en-US", spoken[0] && spoken[0].lang);
  }

  // ---------- Cas 3 : seulement une voix française
  {
    const voices = [{ name: "Français", lang: "fr-FR", default: true }];
    const { spoken, ask } = boot(voices);
    await ask({ type: "MERA_TTS", action: "speak-page" });
    check("français seul : parle", spoken.length > 0);
    check("français seul : utilise fr-FR", spoken[0] && spoken[0].lang === "fr-FR", spoken[0] && spoken[0].lang);
  }

  // ---------- Cas 4 : texte français et anglais lisible
  {
    const voices = [{ name: "English United States", lang: "en-US", default: true }];
    const { spoken, ask } = boot(voices);
    await ask({ type: "MERA_TTS", action: "speak-page" });
    const t = spoken[0] ? spoken[0].text : "";
    check("lecture : ne lit aucun montant", !/\d{3,}/.test(t), t.slice(0, 60));
    check("lecture : contient du texte", t.length > 20, `len=${t.length}`);
  }

  console.log("\n" + "=".repeat(55));
  console.log(`Voix fr/en : ${pass} réussis, ${fail} échoués`);
  console.log("=".repeat(55));
  process.exit(fail === 0 ? 0 : 1);
})();
