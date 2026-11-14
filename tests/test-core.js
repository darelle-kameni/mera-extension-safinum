/**
 * Tests autonomes du garde-fou et du moteur de traduction.
 * Exécution : node tests/test-core.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = path.join(__dirname, "..", "src");

// Contexte simulé (comme un navigateur)
const sandbox = { window: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);

vm.runInContext(fs.readFileSync(path.join(SRC, "guard.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(SRC, "dictionaries.js"), "utf8"), sandbox);

const G = sandbox.__MERA_GUARD;
const D = sandbox.__MERA_DICTIONARIES;

let pass = 0;
let fail = 0;

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass++;
  } else {
    fail++;
    console.log(`  ✗ ${label}`);
    console.log(`      attendu : ${JSON.stringify(expected)}`);
    console.log(`      obtenu  : ${JSON.stringify(actual)}`);
  }
}

// ---------------------------------------------------------------- GARDE-FOU : valeurs financières
console.log("\n[1] Protection des valeurs financières (ne doit JAMAIS traduire)");

const PROTECTED = [
  "10 000 FCFA",
  "10000",
  "5,000 FCFA",
  "Solde: 25 000",
  "SNF-2026-0001",
  "TRX-ABC-12",
  "+237 6 57 41 67 60",
  "657416760",
  "12/11/2026",
  "50%",
  "+2,4%",
  "contact@safinum.cm",
  "https://safinum.cm",
  "",
  "   ",
  "0",
  "1 234 567",
];

for (const t of PROTECTED) {
  check(`protégé : "${t}"`, G.isProtected(t), true);
}

// ---------------------------------------------------------------- GARDE-FOU : texte traduisible
console.log("[2] Textes traduisibles (ne doivent PAS être protégés)");

const TRANSLATABLE = [
  "Solde",
  "Envoyer",
  "Bénéficiaire",
  "Frais",
  "Total débité",
  "Continuer",
  "Une erreur est survenue",
];

for (const t of TRANSLATABLE) {
  check(`traduisible : "${t}"`, G.isProtected(t), false);
}

// ---------------------------------------------------------------- Dictionnaires : intégrité
console.log("[3] Intégrité des dictionnaires");

check("6 langues présentes", Object.keys(D).sort(), ["bas", "dua", "en", "ewo", "fr", "ful"]);

for (const code of Object.keys(D)) {
  const map = D[code].map;
  const keys = Object.keys(map);
  const empty = keys.filter((k) => !map[k] || !map[k].trim());
  check(`${code} : aucune traduction vide`, empty, []);
  check(`${code} : a des entrées`, keys.length > 10, true);
}

// ---------------------------------------------------------------- Aucune clé protégée dans les dicos
console.log("[4] Aucune clé de dictionnaire ne contient un chiffre");

for (const code of Object.keys(D)) {
  const bad = Object.keys(D[code].map).filter((k) => /[0-9]/.test(k));
  check(`${code} : aucune clé numérique`, bad, []);
}

// ---------------------------------------------------------------- Couverture des libellés du site
console.log("[5] Tous les libellés du site sont couverts");

// Textes exacts relevés dans le bundle HackathonTest de safinum.cm
// (dates exclues : elles sont protégées)
const SITE_LABELS = [
  "Banque en ligne", "Bonjour", "Compte courant", "Votre compte",
  "Numéro de compte", "Solde", "Solde disponible",
  "Consultez votre solde et lancez un transfert en toute sécurité.",
  "Effectuer un transfert", "Consulter les frais", "Transactions récentes",
  "Connexion sécurisée", "Salaire reçu", "Transfert reçu",
  "Facture électricité", "Paiement marchand",
  "Frais", "Bénéficiaire", "Récapitulatif",
  "Frais de transfert",
  "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.",
  "Type d'opération", "Montant à envoyer", "Gratuit",
  "Total à débiter", "Solde après opération", "Continuer", "Retour",
  "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.",
  "Nom du bénéficiaire", "Numéro de téléphone", "Motif du transfert",
  "Note (optionnel)", "J'ai vérifié le nom et le numéro du bénéficiaire.",
  "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.",
  "Vérifiez les informations avant de confirmer le transfert.",
  "Montant", "Total débité", "Téléphone", "Référence", "Opération",
  "Je confirme que les informations ci-dessus sont correctes.",
  "Confirmer le transfert", "Modifier",
  "Transfert effectué", "Votre transfert a été envoyé avec succès.",
  "Statut", "Succès", "Nouveau transfert",
  "Message important", "Une erreur est survenue", "Alerte de sécurité",
  "Fermer", "Sécurité",
  "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.",
  "Environnement de test — données fictives, aucune transaction réelle.",
  "Protocole de test", "Retour au hackathon",
  "Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.",
];

for (const code of Object.keys(D)) {
  const missing = SITE_LABELS.filter((e) => !D[code].map[e]);
  check(`${code} : ${SITE_LABELS.length}/${SITE_LABELS.length} libellés couverts`, missing, []);
}

// Les dates du site ne doivent PAS être dans les dictionnaires
for (const code of Object.keys(D)) {
  const dates = Object.keys(D[code].map).filter((k) => /\d/.test(k));
  check(`${code} : aucune date dans le dictionnaire`, dates, []);
}

// ---------------------------------------------------------------- Simulation du moteur
console.log("[6] Moteur de traduction (comportement attendu)");

function translateText(text, lang) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (G.isProtected(trimmed)) return text;
  const dict = D[lang].map;
  if (Object.prototype.hasOwnProperty.call(dict, trimmed)) return dict[trimmed];
  return text;
}

check("ewo : Solde", translateText("Solde", "ewo"), D.ewo.map["Solde"]);
check("ful : Montant", translateText("Montant", "ful"), D.ful.map["Montant"]);
check("bas : Effectuer un transfert", translateText("Effectuer un transfert", "bas"), D.bas.map["Effectuer un transfert"]);

check("ewo : montant intact", translateText("10 000 FCFA", "ewo"), "10 000 FCFA");
check("ful : référence intacte", translateText("SNF-2026-0001", "ful"), "SNF-2026-0001");
check("bas : téléphone intact", translateText("+237 6 57 41 67 60", "bas"), "+237 6 57 41 67 60");

// ---------------------------------------------------------------- Résultat
console.log("\n" + "=".repeat(50));
console.log(`Résultat : ${pass} réussis, ${fail} échoués`);
console.log("=".repeat(50));

process.exit(fail === 0 ? 0 : 1);
