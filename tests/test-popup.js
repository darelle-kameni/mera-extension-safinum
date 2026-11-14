/**
 * Tests du popup : gestion des erreurs de connexion au content script.
 *
 * Régression : « Unchecked runtime.lastError: Could not establish connection.
 * Receiving end does not exist. » — le clic sur « Restaurer » ne lisait pas
 * chrome.runtime.lastError quand aucun content script n'était présent.
 *
 * Exécution : node tests/test-popup.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const HTML = fs.readFileSync(path.join(ROOT, "src", "popup.html"), "utf8");
const JS = fs.readFileSync(path.join(ROOT, "src", "popup.js"), "utf8");

let pass = 0, fail = 0;
const check = (label, cond, info) => {
  if (cond) pass++;
  else { fail++; console.log(`  ✗ ${label}${info ? " → " + info : ""}`); }
};

const NO_RECEIVER = "Could not establish connection. Receiving end does not exist.";

function boot({ receiverPresent }) {
  const dom = new JSDOM(HTML, { runScripts: "outside-only", url: "chrome-extension://test/popup.html" });
  const w = dom.window;
  let lastError = null;
  const sent = [];

  const reloads = [];
  w.chrome = {
    runtime: {
      get lastError() { return lastError; },
      onMessage: { addListener() {} },
      sendMessage() {},
    },
    tabs: {
      query(_q, cb) { cb([{ id: 7, url: "https://safinum.cm/hackathon-test" }]); },
      reload(id, _o, cb) { reloads.push(id); lastError = null; if (cb) cb(); },
      sendMessage(_id, msg, cb) {
        sent.push(msg.type);
        if (receiverPresent) {
          lastError = null;
          cb(msg.type === "MERA_STATUS"
            ? { active: false, language: null, stats: { translated: 0, protected: 0, skipped: 0 }, version: "1.2.3" }
            : { ok: true, version: "1.2.3" });
        } else {
          lastError = { message: NO_RECEIVER };
          cb(undefined);
        }
        lastError = null; // Chrome efface lastError après le callback
      },
    },
    scripting: {
      executeScript(_o, cb) { lastError = null; cb(); },
    },
  };

  w.eval(JS);
  return { w, doc: w.document, sent, reloads };
}

// ---------- 1. Aucun content script : « Restaurer » ne doit pas lever d'erreur
{
  const { doc, sent } = boot({ receiverPresent: false });
  let thrown = null;
  try {
    doc.getElementById("reset").click();
  } catch (e) {
    thrown = e;
  }
  check("restaurer : aucune exception", thrown === null, thrown && thrown.message);
  check("restaurer : le message a bien été envoyé", sent.includes("MERA_DEACTIVATE"), JSON.stringify(sent));
  const status = doc.getElementById("status").textContent;
  check("restaurer : message clair affiché", /Aucune traduction active/.test(status), status);
  check("restaurer : statut inactif", doc.getElementById("status").className.includes("off"), doc.getElementById("status").className);
}

// ---------- 2. Content script présent : « Restaurer » fonctionne
{
  const { doc } = boot({ receiverPresent: true });
  doc.getElementById("reset").click();
  const status = doc.getElementById("status").textContent;
  check("restaurer présent : statut inactif", /inactive/i.test(status), status);
}

// ---------- 3. Page non autorisée : pas de sendMessage
{
  const { w, doc, sent } = boot({ receiverPresent: false });
  sent.length = 0;
  // Remplace la requête d'onglet par une URL hors Safinum
  w.chrome.tabs.query = (_q, cb) => cb([{ id: 7, url: "https://example.com/" }]);
  doc.getElementById("reset").click();
  check("hors safinum : aucun message envoyé", sent.length === 0, JSON.stringify(sent));
  const status = doc.getElementById("status").textContent;
  check("hors safinum : invite à ouvrir le site", /safinum\.cm/.test(status), status);
}

// ---------- 4. Content script obsolète : la page doit être rechargée
{
  const { w, doc, reloads } = boot({ receiverPresent: true });
  w.chrome.tabs.sendMessage = (_id, _msg, cb) => cb({ ok: true, version: "1.1.0" });
  const lang = doc.getElementById("lang");
  lang.value = "ewo";
  lang.dispatchEvent(new w.Event("change")); // active le bouton + applique
  check("version obsolète : page rechargée", reloads.length > 0, JSON.stringify(reloads));
  const status = doc.getElementById("status").textContent;
  check("version obsolète : message clair", /Mise à jour/.test(status), status);
}

console.log("\n" + "=".repeat(55));
console.log(`Popup : ${pass} réussis, ${fail} échoués`);
console.log("=".repeat(55));
process.exit(fail === 0 ? 0 : 1);
