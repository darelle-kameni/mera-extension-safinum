/**
 * Test du moteur sur les cas RÉELS du site Safinum :
 * textes composés, concaténés, avec nombres, majuscules.
 *
 * Exécution : node tests/test-engine.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = path.join(__dirname, "..", "src");
const sb = { window: {}, console, Node: { TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9 } };
sb.window = sb;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(SRC, "guard.js"), "utf8"), sb);
vm.runInContext(fs.readFileSync(path.join(SRC, "dictionaries.js"), "utf8"), sb);

const G = sb.__MERA_GUARD;
const D = sb.__MERA_DICTIONARIES;

let pass = 0, fail = 0;
function check(label, actual, expected) {
  if (actual === expected) pass++;
  else {
    fail++;
    console.log(`  ✗ ${label}\n      attendu : ${JSON.stringify(expected)}\n      obtenu  : ${JSON.stringify(actual)}`);
  }
}

// Reproduit fidèlement l'algorithme de content.js
function buildIndex(code) {
  const map = D[code].map;
  const sorted = Object.keys(map).map((k) => ({ key: k, keyLower: k.toLowerCase(), value: map[k] }))
    .sort((a, b) => b.key.length - a.key.length);
  const byLower = new Map(); sorted.forEach((e) => byLower.set(e.keyLower, e.value));
  return { sorted, byLower };
}
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function nums(s) { return (s.match(/[0-9]+(?:[.,\s][0-9]+)*/g) || []).map((n) => n.replace(/\s/g, "")); }

function makeTranslator(code) {
  const INDEX = buildIndex(code);
  return function (text) {
    if (!text || !text.trim()) return text;
    const full = G.isProtected(text.trim());
    if (full) {
      // libellé + valeur ("Numéro de compte : SNF-…") : on traduit le libellé
      if (!/[A-Za-zÀ-ÿ]{4}/.test(text) || !text.includes(":")) return text;
    }
    const trimmed = text.trim();
    const exact = INDEX.byLower.get(trimmed.toLowerCase());
    if (exact !== undefined) return exact;
    let out = text, changed = false;
    for (const e of INDEX.sorted) {
      if (e.key.length < 4) continue;
      if (!new RegExp(esc(e.key), "i").test(out)) continue;
      out = out.replace(new RegExp(esc(e.key), "gi"), () => e.value);
      changed = true;
    }
    if (!changed) return text;
    const b = nums(text), a = nums(out);
    if (b.length && b.join("|") !== a.join("|")) return text;
    return out;
  };
}

// ------------------------------------------------------------------ CAS RÉELS DU SITE
console.log("[1] Textes composés réels de la page Safinum");

const t = makeTranslator("ewo");

// Ces chaînes sont exactement ce que le site produit (concaténations relevées dans son code)
const CASES = [
  ["Bonjour, Amina", "Masug, Amina"],
  ["Numéro de compte : SNF-2026-0001", "Nombro ya konte : SNF-2026-0001"],
  ["Solde disponible", "Mòni ma wom"],
  ["25 000 FCFA", "25 000 FCFA"],
  ["Continuer →", "Kë →"],
  ["SOLDE DISPONIBLE", "Mòni ma wom"],
];

for (const [input, expected] of CASES) {
  check(`ewo : "${input}"`, t(input), expected);
}

console.log("[2] Les montants ne bougent JAMAIS (toutes les langues)");

const MONEY = [
  "25 000 FCFA", "10 100 FCFA", "100 FCFA", "14 900 FCFA",
  "SNF-2026-0001", "TRX-2026-0001", "+237 6 57 41 67 60",
  "05 nov. 2026", "12/11/2026", "50%", "10000",
];

for (const code of Object.keys(D)) {
  const tr = makeTranslator(code);
  for (const m of MONEY) {
    check(`[${code}] intact : "${m}"`, tr(m), m);
  }
}

console.log("[2b] Libellé + valeur : le libellé change, la valeur reste");

for (const code of Object.keys(D)) {
  const tr = makeTranslator(code);
  const r1 = tr("Montant : 10 000 FCFA");
  check(`[${code}] « Montant : 10 000 FCFA » garde le montant`, r1.includes("10 000 FCFA"), true);
  if (code !== "fr") {
    check(`[${code}] « Montant : … » traduit le libellé`, r1 !== "Montant : 10 000 FCFA", true);
  }
  const r2 = tr("Numéro de compte : SNF-2026-0001");
  check(`[${code}] référence SNF-2026-0001 préservée`, r2.includes("SNF-2026-0001"), true);
  const r3 = tr("Solde disponible : 25 000 FCFA");
  check(`[${code}] 25 000 FCFA préservé`, r3.includes("25 000 FCFA"), true);
}

console.log("[3] Chaque langue traduit les libellés clés");

for (const code of Object.keys(D)) {
  const tr = makeTranslator(code);
  const out = tr("Solde disponible");
  if (code === "fr") {
    check(`[fr] « Solde disponible » inchangé`, out, "Solde disponible");
  } else {
    check(`[${code}] « Solde disponible » traduit`, out !== "Solde disponible", true);
  }
  check(`[${code}] « Bonjour, Amina » traduit`, tr("Bonjour, Amina").includes("Amina"), true);
}

console.log("[4] L'anglais reproduit exactement Safinum");

const en = makeTranslator("en");
check("en : Solde", en("Solde"), "Balance");
check("en : Bonjour, Amina", en("Bonjour, Amina"), "Hello, Amina");
check("en : Frais de transfert", en("Frais de transfert"), "Transfer fees");

console.log("[5] Le français ne change rien");

const fr = makeTranslator("fr");
check("fr : Bonjour, Amina", fr("Bonjour, Amina"), "Bonjour, Amina");
check("fr : Solde disponible", fr("Solde disponible"), "Solde disponible");

console.log("[6] Le duala est présent avec ses termes");

const dua = makeTranslator("dua");
check("dua : Bonjour", dua("Bonjour"), "Idib'a bwam");
check("dua : Bonjour composé", dua("Bonjour, Amina"), "Idib'a bwam, Amina");
check("dua : Montant", dua("Montant"), "Mòni");
check("dua : montant protégé", dua("10 000 FCFA"), "10 000 FCFA");

console.log("[7] Les salutations basaa sont les formes attestées");

const bas = makeTranslator("bas");
check("bas : Bonjour", bas("Bonjour"), "Mɛ̀ ǹyega");
check("bas : Bonjour composé", bas("Bonjour, Amina"), "Mɛ̀ ǹyega, Amina");
check("bas : salutation + montant (libellé traduit, valeur intacte)",
  bas("Bonjour : 250 000 FCFA"), "Mɛ̀ ǹyega : 250 000 FCFA");
check("bas : montant non modifié", bas("250 000 FCFA"), "250 000 FCFA");

console.log("\n" + "=".repeat(55));
console.log(`Résultat : ${pass} réussis, ${fail} échoués`);
console.log("=".repeat(55));
process.exit(fail === 0 ? 0 : 1);
