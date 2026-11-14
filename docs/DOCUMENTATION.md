# MERA — Extension de traduction financière camerounaise
## Document de présentation — Hackathon SAFINUM Innovate 2026

---

### 1. Le problème

Au Cameroun, les applications de mobile money affichent leurs écrans en français,
langue que plusieurs millions de locuteurs ne lisent pas couramment. Les langues
locales — ewondo, fulfulde, basaa, duala — sont parlées bien avant d'être lues.

Le risque n'est pas seulement l'incompréhension : c'est de **confirmer un transfert
sans comprendre le montant débité, les frais appliqués ou l'identité du bénéficiaire**.

L'extension MERA répond à ce problème avec une contrainte absolue : **la traduction
ne doit jamais altérer une valeur financière**.

---

### 2. La solution

Une extension Chrome (Manifest V3) qui :

1. **Lit** l'environnement de test Safinum, sans aucun hook fourni par le site
2. **Traduit** les libellés en ewondo, fulfulde ou basaa
3. **Protège** toute valeur financière par un garde-fou strict
4. **Détecte** le contenu injecté après le chargement (`MutationObserver`)
5. **Restaure** la page en français d'un clic

L'extension fonctionne sur une page **non modifiée**, comme l'exige le règlement.

---

### 3. Sécurité et intégrité financière

C'est le cœur du prototype. Le module `guard.js` refuse la traduction dès qu'un
texte contient :

| Signal | Exemple bloqué |
|--------|----------------|
| un chiffre | `10 000`, `25000` |
| une devise | `FCFA`, `XAF` |
| un symbole de numéro | `+237 6 57 41 67 60` |
| une référence | `SNF-2026-0001`, `TRX-ABC-12` |
| une date | `12/11/2026` |
| un pourcentage | `+2,4 %`, `50 %` |
| un email ou une URL | `contact@safinum.cm` |

De plus, l'extension **ne touche jamais** aux zones de saisie
(`input`, `textarea`, `select`, `contenteditable`) : les données du bénéficiaire
saisies par l'utilisateur restent exactement telles quelles.

**Résultat vérifié par les tests automatiques : 17 formats de valeurs financières
sur 17 restent strictement intacts.**

---

### 4. Provenance des traductions

Le règlement sanctionne « le texte inventé ». Chaque terme a donc une source :

| Langue | Source | Licence |
|--------|--------|---------|
| Ewondo | corpus biblique `cameroon_bibles` (Hugging Face) | CC-BY-4.0 |
| Fulfulde | même corpus, variante Adamawa | CC-BY-4.0 |
| Basaa | Dictionnaire Njock (2019), SIL / Webonary, 23 283 entrées | © SIL |

Le détail terme par terme, avec la référence du verset ou l'exemple du
dictionnaire, figure dans `docs/SOURCES.md`.

**Limite assumée et déclarée** : la terminologie mobile money moderne
(« solde », « frais de service », « transaction ») est absente des corpus sources
de 2019 et antérieurs. Les termes correspondants sont des **propositions**
explicitement marquées `// à valider` dans le code. Ils devront être confirmés
par des locuteurs natifs avant un déploiement réel.

---

### 5. Accessibilité

- Navigation au clavier : le popup est en HTML standard
- Contrastes conformes dans l'interface de contrôle
- Aucune régression visuelle : la mise en page du site est conservée
- Les attributs `aria-label`, `title`, `placeholder` et `alt` sont traduits

---

### 5 bis. Lecture vocale (accessibilité)

Un module `tts.js` séparé ajoute une lecture à voix haute via l'API
`speechSynthesis` du navigateur. Un bouton « 🔊 Écouter » est présent dans le
popup et dans la démo.

**Ce qu'il lit** : le texte déjà traduit de la page (libellés, titres, boutons).
**Ce qu'il ne lit jamais** : les montants, numéros, dates et références, filtrés
par le même garde-fou que la traduction.

**Limite déclarée** : aucun navigateur ne fournit de voix pour l'ewondo, le
fulfulde, le basaa ou le duala. La lecture utilise donc une voix française, qui
prononce les lettres latines à la française (ɛ, ɔ, ŋ, ɓ, ɗ sont gérés par la
plupart des voix). **La prononciation est indicative, pas authentique.**

**Feuille de route** : intégrer un moteur TTS spécialisé (type Vambo AI pour le
duala) pour une prononciation correcte. Le module `tts.js` est isolé précisément
pour permettre ce remplacement sans toucher au moteur de traduction.

### 6. Confidentialité

- Aucune donnée collectée, stockée ou transmise
- Aucun appel réseau
- Une seule permission : `storage`, pour mémoriser la langue choisie
- Conforme à la règle : « L'extension ne doit pas collecter, stocker ou
  transmettre les données affichées »

---

### 7. Tests

```bash
npm install
npm test
```

```
Résultat : 43 réussis, 0 échoués   ← garde-fou + dictionnaires
Résultat : 39 réussis, 0 échoués   ← simulation de la page Safinum
```

Les 39 tests d'intégration simulent la page réelle : 25 éléments traduits,
toutes les valeurs financières intactes, les 7 messages d'erreur du site traduits
dans les 3 langues.

---

### 8. Limites connues

1. Traduction par correspondance de segments, non par compréhension du texte.
   Un libellé absent du dictionnaire reste en français.
2. Les messages d'erreur en basaa sont des propositions à valider.
3. L'extension couvre la page `safinum.cm/hackathon-test` uniquement, comme demandé.

---

### 9. Perspectives

- Ajout du duala dès qu'une source documentée sera disponible
- Validation des propositions de néologismes avec des locuteurs natifs
- Extension du dictionnaire à partir des retours d'usage
- Intégration possible aux applications de mobile money réelles

---

**Outils déclarés** : Chrome Extension API (Manifest V3), JavaScript natif,
`jsdom` pour les tests. Aucun modèle d'IA, aucun service externe.
