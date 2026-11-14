# MERA — Extension de traduction financière camerounaise

**Hackathon SAFINUM Innovate 2026** — Accessibilité linguistique

Extension Chrome (Manifest V3) qui traduit l'environnement de test de Safinum
en **Ewondo**, **Fulfulde** ou **Basaa**, **sans jamais modifier un montant,
un numéro, une date ou une référence**.

---

## Installation (2 minutes)

1. Télécharger et décompresser `mera-extension-safinum.zip`
2. Ouvrir Chrome → `chrome://extensions/`
3. Activer le **Mode développeur** (en haut à droite)
4. Cliquer sur **Charger l'extension non empaquetée**
5. Sélectionner le dossier `hackathon-safinum-extension`
6. Aller sur https://safinum.cm/hackathon-test
7. Cliquer sur l'icône MERA → choisir une langue → **Traduire la page**

Pour revenir au français : bouton **Restaurer**.

---

## Ce que fait l'extension

| Fonction | Détail |
|----------|--------|
| Détecte les textes | Parcourt tous les nœuds texte du DOM, sans hook ni `data-i18n` |
| Traduit | Remplace les libellés connus par la traduction de la langue choisie |
| Protège les valeurs | Refuse toute traduction contenant un chiffre, une devise, une date, une référence |
| Gère le dynamique | `MutationObserver` : traduit le contenu ajouté après le chargement |
| Préserve les saisies | Ne touche jamais aux `input`, `textarea`, `select`, `contenteditable` |
| Restaure | Remet la page en français d'un clic |
| Lecture vocale | Bouton 🔊 : lit le texte traduit, jamais les montants |

---

## Architecture

```
hackathon-safinum-extension/
├── manifest.json           # Manifest V3
├── src/
│   ├── guard.js            # GARDE-FOU : décide ce qui est protégé
│   ├── dictionaries.js     # FR → fr / en / ewo / ful / bas / dua
│   ├── content.js          # Moteur : parcourt, traduit, observe
│   ├── tts.js              # Lecture vocale (module indépendant)
│   ├── popup.html          # Interface utilisateur
│   ├── popup.js            # Contrôle de l'extension
│   └── icon16/32/48/128.png # Logo officiel MERA
├── tests/
│   ├── test-core.js        # 61 tests : garde-fou + couverture des libellés
│   ├── test-engine.js      # 115 tests : textes composés, montants, 6 langues
│   ├── test-page.js        # 46 tests : page simulée
│   ├── test-real-dom.js    # reproduction du DOM réel du site
│   ├── test-counter.js     # compteur affiché dans le popup
│   ├── test-cycle.js       # activer → restaurer → réactiver
│   ├── test-tts.js         # lecture vocale
│   ├── test-voices.js      # sélection des voix fr/en
│   └── test-popup.js       # popup : erreurs de connexion au content script
└── docs/
    ├── DOCUMENTATION.md    # Document de 2 pages pour le jury
    └── SOURCES.md          # Provenance des traductions
```

---

## Le garde-fou (sécurité financière)

`guard.js` bloque la traduction si le texte contient :

- un **chiffre** (tout montant, tout numéro)
- une **devise** (`FCFA`, `XAF`, `EUR`, `USD`)
- un **symbole de numéro** (`+`, `(`, `)`)
- une **référence** (`SNF-2026-0001`, `TRX-ABC-12`)
- une **date** (`12/11/2026`)
- un **pourcentage** (`50%`, `+2,4%`)
- un **email** ou une **URL**

Exemples vérifiés par les tests :

| Texte | Résultat |
|-------|----------|
| `10 000 FCFA` | 🔒 intact |
| `SNF-2026-0001` | 🔒 intact |
| `+237 6 57 41 67 60` | 🔒 intact |
| `12/11/2026` | 🔒 intact |
| `Solde` | ✅ traduit |
| `Continuer` | ✅ traduit |

---

## Tests

```bash
npm install
npm test
```

Résultat attendu :

```
Résultat : 43 réussis, 0 échoués
Résultat : 39 réussis, 0 échoués
```

Les tests vérifient notamment :

- 17 formats de valeurs financières sont **protégés**
- les **59 libellés du site** sont couverts dans les **6 langues**
- aucune clé de dictionnaire ne **contient un chiffre** (les dates sont exclues)
- les textes **composés** sont traduits (`Bonjour, Amina` → `Masug, Amina`)
- un libellé suivi d'une valeur garde la valeur (`Montant : 10 000 FCFA`)
- sur une reproduction du DOM réel : **49 textes sur 65 traduits**, toutes les valeurs intactes
- le **compteur du popup** affiche le bon nombre et reste stable entre deux passages
- « Restaurer » remet le français et remet le compteur à zéro

---

## Langues couvertes

| Langue | Code | Libellés | Source principale |
|--------|------|----------|-------------------|
| Français | `fr` | 59 | Langue d'origine de la page |
| English | `en` | 59 | **Traductions officielles de Safinum** (paires fr/en du site) |
| Ewondo | `ewo` | 59 | Corpus biblique `cameroon_bibles`, CC-BY-4.0 |
| Fulfulde (Adamawa) | `ful` | 59 | Corpus biblique `cameroon_bibles`, CC-BY-4.0 |
| Basaa | `bas` | 59 | Dictionnaire Njock (2019), SIL / Webonary |
| Duala | `dua` | 62 | Wiktionnaire + vocabulaire biblique |

Voir `docs/SOURCES.md` pour la provenance exacte de chaque terme.

---

## Confidentialité

- **Aucune** donnée collectée, stockée ou transmise
- **Aucun** appel réseau
- Seul le choix de langue est mémorisé localement (`chrome.storage.sync`)
- Aucune permission d'accès réseau n'est demandée

---

## Limites assumées

1. **Terminologie mobile money** : « solde », « frais de service », « transaction »
   n'existent pas dans les corpus sources (textes bibliques et dictionnaire de 2019).
   Les termes retenus sont des **propositions documentées**, marquées « à valider »
   dans le code. Une validation par locuteur natif est nécessaire avant déploiement réel.

2. **Basaa** : certains libellés d'erreur sont des propositions de néologisme.
   Elles sont signalées par le commentaire `// à valider` dans `dictionaries.js`.

3. **Traduction par correspondance** : l'extension traduit des segments connus,
   pas par compréhension du texte. Un libellé absent du dictionnaire reste en français.

---

## Licence et attributions

- Corpus biblique : `flagship-ai/cameroon_bibles` (Hugging Face), **CC-BY-4.0**
- Dictionnaire basaa : © 2019 Dr Pierre Emmanuel Njock, SIL / webonary.org
- Code de l'extension : MIT

Voir `docs/SOURCES.md`.
