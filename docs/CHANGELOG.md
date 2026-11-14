# Historique des versions

Toutes les versions suivent `MAJEUR.MINEUR.CORRECTIF`. Le numéro affiché dans
`manifest.json` et dans le popup doit correspondre à `CONTENT_VERSION` dans
`src/popup.js` et à `VERSION` dans `src/content.js`.

---

## 1.2.2 — Correctifs de compatibilité et rechargement automatique

**Publiée le 14 novembre 2026** · Tag `v1.2.2`

### Corrigé

- **Salutation figée sur une ancienne traduction.** Une page encore affichée
  avec `Mbolo` (ancienne traduction ewondo) restait bloquée : `Mbolo` n'existait
  plus dans la table inverse et était pris pour du français. Ajout d'un alias de
  compatibilité `mbolo → Bonjour`.
- **`Unchecked runtime.lastError` persistant.** `notify()` dans `content.js`
  envoyait `MERA_STATS` sans callback. Popup fermé → aucun destinataire → Chrome
  journalisait une erreur non lue. Le callback consomme désormais
  `chrome.runtime.lastError`.
- **Content script obsolète après mise à jour.** Chrome ne remplace pas un
  script déjà chargé. Le popup compare maintenant la version annoncée par la
  page à `1.2.2` et recharge l'onglet une seule fois si nécessaire.

### Ajouté

- Négociation de version popup ↔ page (`MERA_STATUS` renvoie `version`).
- Diagnostic enrichi : `Version page` et `Version attendue`.
- Tests : `test-switch.js` couvre l'alias hérité et la double injection ;
  `test-popup.js` couvre la version obsolète et le rechargement.

---

## 1.2.1 — Salutation ewondo

**Publiée le 14 novembre 2026** · Tag `v1.2.1`

### Modifié

- Ewondo : `Bonjour` passe de `Mbolo` à **`Masug`**, forme la plus courante et
  intemporelle selon les sources consultées.
- `Mbolo` reste documenté comme variante ; les variantes horaires ewondo sont
  ajoutées dans `docs/SOURCES.md` :
  - matin : `Mbembe amos` (réponse `Amos mben`) ;
  - après-midi : `Mbembe gaugé` / `Mbembe ngoge` ;
  - soir : `Mbembe alu` (réponse `Alu mben`).

---

## 1.2.0 — Changement de langue fiable

**Publiée le 14 novembre 2026** · Tag `v1.2.0`

### Corrigé

- **Double injection du content script.** Le popup réinjecte les scripts en
  secours. Une seconde instance enregistrait la traduction courante comme
  « texte d'origine » et la restaurait au changement de langue. Garde ajouté :
  `if (window.__MERA) return;`.
- **Textes composés non retraduits.** `Mɛ̀ ǹyega, Amina` contient un prénom
  variable et n'existe pas comme clé exacte de la table inverse. Ajout de
  `toFrenchComposed()`, conversion inverse par sous-chaînes.
- **Bouton « Restaurer »** : `chrome.runtime.lastError` est lu systématiquement.

### Ajouté

- `tests/test-switch.js` : 6 langues d'affilée, double injection, page déjà
  traduite.
- `tests/test-popup.js` : gestion des erreurs de connexion.

---

## 1.1.0 — Lecture vocale et diagnostic

**Novembre 2026**

### Ajouté

- Module `tts.js` indépendant (`speechSynthesis`), avec sélection de voix et
  repli propre si l'API est absente.
- Boutons **Écouter** / **Stop** dans le popup et dans la démo.
- Panneau **Diagnostic** : URL, présence du content script, langue, compteurs.
- Bilan **traduits / protégés / ignorés** dans le popup.
- Suites `test-tts.js`, `test-voices.js`, `test-counter.js`.

### Modifié

- Le choix de langue s'applique immédiatement au changement du menu, sans
  attendre un clic sur « Traduire la page ».

---

## 1.0.0 — Prototype initial

**Novembre 2026**

### Ajouté

- Extension Manifest V3 complète pour `safinum.cm`.
- Garde-fou financier (`guard.js`) : 17 formats protégés.
- Six dictionnaires : français, anglais, ewondo, fulfulde, basaa, duala.
- Moteur de traduction par sous-chaînes, `MutationObserver`, passes différées
  pour React.
- Table inverse pour restaurer le français sans mémoire.
- « Restaurer » en un clic.
- Démo autonome `demo.html`.
- Documentation des sources (`docs/SOURCES.md`) et dossier jury
  (`docs/DOCUMENTATION.md`).
- Suites de tests : core, engine, page, real-dom, cycle, reload, multilang.

---

## Correspondance des versions

| Élément | Valeur actuelle |
|---|---|
| `manifest.json` → `version` | `1.2.2` |
| `src/content.js` → `VERSION` | `1.2.2` |
| `src/popup.js` → `CONTENT_VERSION` | `1.2.2` |
| Diagnostic → `Extension` | `v1.2.2` |
| Dernier tag Git | `v1.2.2` |

Lors d'une nouvelle version, mettre à jour **les quatre** emplacements, puis
relancer `npm test`, régénérer l'archive et créer un tag.
