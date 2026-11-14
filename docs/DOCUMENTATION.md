# MERA — Traduction financière camerounaise

**Dossier de présentation — Hackathon SAFINUM Innovate 2026**

Extension Chrome (Manifest V3) · 6 langues · 327 tests · 0 donnée transmise

---

## 1. Le problème

Au Cameroun, les interfaces de mobile money sont écrites en français ou en
anglais. Une large part de la population parle ewondo, fulfulde, basaa ou duala
au quotidien, sans lire couramment la langue de l'interface.

Le risque n'est pas seulement l'incompréhension. C'est de **confirmer un
transfert sans avoir compris le montant débité, les frais appliqués ou
l'identité du bénéficiaire**. Sur un écran financier, une ambiguïté linguistique
devient une perte d'argent.

Deux écueils guettent toute tentative de traduction :

1. **Altérer une valeur** — un montant, un numéro, une date, une référence — et
   rendre l'écran dangereux ;
2. **Inventer des termes** faute de vocabulaire financier disponible dans les
   langues concernées.

MERA est construite autour de ces deux interdits.

---

## 2. La solution

Une extension Chrome qui traduit l'environnement de test Safinum **sans jamais
modifier une donnée financière**.

| Étape | Ce que fait l'extension |
|---|---|
| 1. Lire | Parcourt le DOM de la page, sans hook fourni par le site |
| 2. Identifier | Reconnaît les 59 libellés réels relevés dans le bundle du site |
| 3. Protéger | Un garde-fou bloque toute valeur financière avant traduction |
| 4. Traduire | Remplace les segments connus, du plus long au plus court |
| 5. Vérifier | Compare les nombres avant/après ; annule toute altération |
| 6. Suivre | Un `MutationObserver` traduit le contenu React ajouté ensuite |
| 7. Restaurer | Un clic remet la page en français |

L'extension fonctionne sur la page **non modifiée**, comme l'exige le règlement.

### Le changement de langue à chaud

L'utilisateur choisit une langue dans le popup ; la page est retraduite
**immédiatement, sans rechargement**. Il peut enchaîner les six langues. Le
moteur retrouve le français d'origine même s'il a perdu sa mémoire (page déjà
traduite, extension rechargée), grâce à une table inverse construite sur toutes
les langues.

---

## 3. Les six langues

| Langue | Code | Libellés | Source principale |
|---|---|---:|---|
| Français | `fr` | 59 | Langue d'origine |
| English | `en` | 59 | Paires fr/en officielles du site |
| Ewondo | `ewo` | 59 | Corpus biblique `cameroon_bibles`, CC-BY-4.0 |
| Fulfulde (Adamawa) | `ful` | 59 | Corpus biblique `cameroon_bibles`, CC-BY-4.0 |
| Basaa | `bas` | 59 | Dictionnaire Njock 2019, SIL / Webonary |
| Duala | `dua` | 62 | Wiktionnaire, vocabulaire biblique, ressources d'apprentissage |

### Salutations retenues

| Langue | « Bonjour » | Note |
|---|---|---|
| Ewondo | **Masug** | Variante citée : `Mbolo` ; formes horaires documentées |
| Fulfulde | **Jam waali** | « As-tu passé la nuit en paix ? », réponse `Jam tan` |
| Basaa | **Mɛ̀ ǹyega** | Polyvalent : bonjour / merci / respect |
| Duala | **Idiba bwam** | Littéralement « bon matin », usage général avant midi |

---

## 4. Sécurité et intégrité financière

C'est le cœur du prototype. Le module `guard.js` refuse la traduction dès qu'un
texte contient :

| Signal | Exemple bloqué | Résultat |
|---|---|---|
| Chiffre | `10 000`, `25 000` | 🔒 intact |
| Devise | `FCFA`, `XAF`, `EUR`, `USD` | 🔒 intact |
| Numéro | `+237 6 57 41 67 60` | 🔒 intact |
| Référence | `SNF-2026-0001`, `TRX-2026-0001` | 🔒 intact |
| Date | `12/11/2026`, `05 nov. 2026` | 🔒 intact |
| Pourcentage | `+2,4 %`, `50 %` | 🔒 intact |
| Email / URL | `contact@safinum.cm` | 🔒 intact |
| Libellé seul | `Solde` | ✅ traduit |
| Libellé + valeur | `Numéro de compte : SNF-…` | ✅ libellé traduit, valeur intacte |

Deux protections se superposent :

1. **Le garde-fou** bloque en amont ;
2. **Le filet numérique** compare les nombres extraits avant et après
   remplacement. Toute divergence annule la traduction.

Enfin, l'extension **ne touche jamais** aux zones de saisie (`input`,
`textarea`, `select`, `contenteditable`) : les données du bénéficiaire restent
exactement telles quelles.

**Résultat vérifié** : sur la reproduction du DOM réel, les 12 valeurs
financières restent strictement identiques ; 17 formats sont testés dans
`test-core.js`.

---

## 5. Provenance des traductions

Le règlement sanctionne « le texte inventé ». Chaque terme a donc une source
traçable, documentée dans `docs/SOURCES.md` :

| Langue | Source | Licence / réserve |
|---|---|---|
| Ewondo | corpus biblique `flagship-ai/cameroon_bibles` (Hugging Face) | CC-BY-4.0 |
| Fulfulde | même corpus, variante Adamawa | CC-BY-4.0 |
| Basaa | Dictionnaire Njock (2019), SIL / Webonary, 23 283 entrées | © SIL, pas de licence commerciale explicite |
| Duala | Wiktionnaire, vocabulaire biblique, ressources d'apprentissage, **tableau d'un locuteur natif (14 nov. 2026)** | sources non normatives, validation partielle |
| English | paires fr/en du site | — |

### Limite assumée et déclarée

Aucun corpus disponible ne contient la **terminologie mobile money moderne** :
solde, frais de service, transaction, bénéficiaire au sens bancaire. Ces
concepts n'existaient pas dans les textes sources (Bible, dictionnaire de 2019).

Les termes correspondants sont donc des **propositions** explicitement marquées
`// à valider` dans le code. Le duala a été partiellement relu par un locuteur
natif le 14 novembre 2026 : 12 valeurs adoptées, 4 points encore ouverts. Les
trois autres langues restent à confirmer. Voir `docs/VALIDATION.md`.

Cette limite est **déclarée**, plutôt que masquée par des traductions inventées.

---

## 6. Accessibilité

- Popup en HTML standard, navigable au clavier.
- Contrastes conformes dans l'interface de contrôle.
- Aucune régression visuelle : la mise en page du site est conservée.
- Les attributs `aria-label`, `title`, `placeholder` et `alt` sont traduits.
- Un bilan **traduits / protégés / ignorés** rend l'action visible.
- Un panneau **Diagnostic** explique précisément l'état de la page.

### Lecture vocale

Un module `tts.js` séparé ajoute une lecture à voix haute via l'API
`speechSynthesis`. Boutons **🔊 Écouter** et **⏹ Stop** dans le popup et dans la
démo.

- **Ce qu'il lit** : le texte déjà traduit de la page.
- **Ce qu'il ne lit jamais** : montants, numéros, dates, références — filtrés par
  le même garde-fou.
- **Limite déclarée** : aucun navigateur ne fournit de voix pour l'ewondo, le
  fulfulde, le basaa ou le duala. La lecture utilise une voix française ; la
  prononciation est **indicative, pas authentique**.
- **Feuille de route** : moteur TTS spécialisé (type Vambo AI pour le duala). Le
  module est isolé pour permettre ce remplacement sans toucher au moteur.

---

## 7. Confidentialité

| Point | Réalité |
|---|---|
| Données collectées | **Aucune** |
| Données stockées | **Aucune** (`storage` n'est pas demandé) |
| Appels réseau | **Aucun** |
| Traitement | Entièrement local, dans la page |
| Permissions | `activeTab`, `scripting`, `tabs` |
| Hôtes | `safinum.cm` et `www.safinum.cm` uniquement |

Conforme à la règle : « L'extension ne doit pas collecter, stocker ou transmettre
les données affichées ».

---

## 8. Tests

```bash
npm install
npm test
```

```
core 61 · engine 120 · page 46 · real-dom 49/65 textes
counter 19 · cycle 6 · reload 9 · multilang 8/8
switch 21 · TTS 19 · voix 9 · popup 9
```

**327 vérifications, 0 échec.** Les tests couvrent :

- les 17 formats financiers protégés ;
- les 59 libellés dans les 6 langues ;
- les textes composés (`Bonjour, Amina` → `Masug, Amina`) ;
- les 6 langues enchaînées sans rechargement ;
- la double injection du content script ;
- une page déjà traduite par une version précédente ;
- le cycle activer → restaurer → réactiver ;
- la lecture vocale et la sélection de voix ;
- le popup : `lastError`, version obsolète, rechargement automatique.

Protocole manuel et détail des suites : `docs/TESTS.md`.

---

## 9. Démonstration en 2 minutes

1. Charger l'extension non empaquetée (`chrome://extensions/`).
2. Ouvrir <https://safinum.cm/hackathon-test>.
3. Ouvrir le popup → choisir **Ewondo**.
   - La salutation devient `Masug, Amina`.
   - `25 000 FCFA` et `SNF-2026-0001` sont **inchangés**.
4. Choisir **Basaa** sans recharger.
   - La page est retraduite immédiatement.
5. Cliquer sur **Restaurer** : retour au français.
6. Ouvrir **Diagnostic** : versions et état affichés.
7. Cliquer sur **🔊 Écouter** : lecture des libellés traduits, sans les montants.

Variante sans installation : ouvrir `demo.html` dans Chrome.

---

## 10. Limites connues

1. **Traduction par correspondance** de segments, non par compréhension. Un
   libellé absent du dictionnaire reste en français.
2. **Terminologie mobile money** : propositions à valider par des locuteurs
   natifs.
3. **Basaa et duala** : certaines entrées sont des néologismes proposés,
   signalés `// à valider`.
4. **Lecture vocale** : prononciation indicative, faute de voix locales.
5. **Périmètre** : `safinum.cm` uniquement, conformément au hackathon.
6. **Chargement à chaud** : Chrome ne remplace pas un content script déjà
   chargé. Le popup détecte la version obsolète et recharge l'onglet une fois.

---

## 11. Perspectives

- Validation des propositions lexicales avec des locuteurs natifs (ewondo,
  fulfulde, basaa, duala).
- Intégration d'un moteur TTS spécialisé.
- Variantes de salutation selon le moment de la journée (déjà documentées).
- Extension du dictionnaire à partir des retours d'usage.
- Réutilisation du moteur pour d'autres interfaces financières camerounaises.

---

## 12. Outils déclarés

- Chrome Extension API — Manifest V3
- JavaScript natif, sans framework
- `jsdom` pour les tests
- Aucun modèle d'IA, aucun service externe, aucun appel réseau

---

**Dépôt** : <https://github.com/darelle-kameni/mera-extension-safinum>
**Version présentée** : 1.2.4
**Licence du code** : MIT
