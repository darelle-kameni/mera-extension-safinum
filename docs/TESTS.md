# Tests

MERA est vérifiée par **327 contrôles automatiques**, répartis en 12 suites.
Aucun navigateur n'est requis : les tests s'exécutent sous Node.js avec `jsdom`
pour simuler le DOM.

---

## Lancer les tests

```bash
cd mera-extension-safinum
npm install
npm test
```

`npm install` installe uniquement `jsdom` (dépendance de développement). Chaque
suite peut aussi être lancée seule :

```bash
node tests/test-core.js
node tests/test-switch.js
```

---

## Résultat attendu

```
Résultat : 61 réussis, 0 échoués
Résultat : 120 réussis, 0 échoués
Résultat : 46 réussis, 0 échoués
Textes modifiés : 49 / 65
✓ Toutes les valeurs financières sont intactes
Compteur : 19 réussis, 0 échoués
Cycle : 6 réussis, 0 échoués  (1er=6, 2e=6)
Rechargement : 9 réussis, 0 échoués
8/8 changements réussis, 0 échecs
Changement de langue : 21 réussis, 0 échoués
Lecture vocale : 19 réussis, 0 échoués
Voix fr/en : 9 réussis, 0 échoués
Popup : 9 réussis, 0 échoués
```

| Suite | Fichier | Contrôles | Objet |
|---|---|---:|---|
| Core | `test-core.js` | 61 | Garde-fou + couverture des 59 libellés dans les 6 langues |
| Engine | `test-engine.js` | 120 | Textes composés, casse, nombres, 6 langues |
| Page | `test-page.js` | 46 | Page Safinum simulée, intégration complète |
| Real DOM | `test-real-dom.js` | 49/65 textes + 12 valeurs | Reproduction du DOM réel |
| Counter | `test-counter.js` | 19 | Compteur du popup, stabilité entre passes |
| Cycle | `test-cycle.js` | 6 | Activer → restaurer → réactiver |
| Reload | `test-reload.js` | 9 | Page déjà traduite + nouveau script |
| Multilang | `test-multilang.js` | 8 | 8 changements de langue d'affilée |
| Switch | `test-switch.js` | 21 | 6 langues, double injection, alias `Mbolo` |
| TTS | `test-tts.js` | 19 | Lecture vocale et repli sans `speechSynthesis` |
| Voices | `test-voices.js` | 9 | Sélection des voix françaises et anglaises |
| Popup | `test-popup.js` | 9 | `lastError`, version obsolète, rechargement |

---

## Ce que chaque suite vérifie

### `test-core.js` — garde-fou et dictionnaires

- les 17 formats de valeurs financières sont protégés ;
- aucune clé de dictionnaire ne contient de chiffre (hors dates, volontairement
  exclues) ;
- les 59 clés françaises sont présentes dans les 6 langues ;
- un libellé seul est traduit, un montant seul ne l'est pas ;
- les attributs `data-mera-skip` et `aria-hidden` sont respectés.

### `test-engine.js` — moteur

- textes composés : `Bonjour, Amina` → `Masug, Amina` ;
- texte concaténé : `Numéro de compte :` + valeur ;
- majuscules, espaces, ponctuation ;
- un libellé suivi d'une valeur garde la valeur ;
- traductions dans les six langues ;
- le filet de sécurité numérique annule une altération.

### `test-page.js` — intégration

Reproduit une page Safinum complète (en-tête, compte, frais, bénéficiaire,
récapitulatif, reçu, alertes) et vérifie, langue par langue :

- 16 éléments traduits par langue ;
- toutes les valeurs financières intactes ;
- les alertes de sécurité traduites.

### `test-real-dom.js` — reproduction du DOM réel

Utilise `tests/fixture-real-dom.html`, copie de la structure rendue par le
composant `HackathonTest` (classes Tailwind, concaténations React).

- **49 textes sur 65** sont traduits en ewondo ;
- les 12 valeurs protégées restent présentes :
  `25 000 FCFA`, `10 100 FCFA`, `100 FCFA`, `14 900 FCFA`, `10 000 FCFA`,
  `SNF-2026-0001`, `TRX-2026-0001`, `+237 6 57 41 67 60` et les 4 dates.

Les 16 textes non modifiés sont ceux qui ne contiennent aucun libellé connu,
ou qui sont entièrement protégés.

### `test-counter.js` — compteur

- le popup reçoit un nombre réel après traduction ;
- le compteur reste stable entre deux passes (ne repart pas à zéro) ;
- `MERA_STATUS` renvoie `translated`, `protected`, `skipped`.

### `test-cycle.js` — cycle de vie

- activer une langue ;
- restaurer : le français revient ;
- réactiver : la traduction revient ;
- les compteurs sont remis à zéro au bon moment.

### `test-reload.js` — rechargement

Scénario réel : la page est déjà traduite, puis un nouveau content script est
injecté (mise à jour de l'extension).

- la page ne reste pas bloquée dans l'ancienne langue ;
- la nouvelle langue s'applique ;
- « Restaurer » ramène bien le français.

### `test-multilang.js` — changements successifs

Enchaîne `ewo → bas → ful → dua → ewo → ful → bas → en` sans recharger la page.
Chaque étape vérifie le marqueur de langue et l'intégrité du montant.

### `test-switch.js` — changement de langue (régression)

- salutation composée dans les 6 langues :

  | Langue | Résultat attendu |
  |---|---|
  | Basaa | `Mɛ̀ ǹyega, Amina` |
  | Ewondo | `Masug, Amina` |
  | Fulfulde | `Jam waali, Amina` |
  | Duala | `Idiba bwam, Amina` |
  | English | `Hello, Amina` |
  | Français | `Bonjour, Amina` |

- **double injection** : une seconde instance de `content.js` est ignorée ;
- **page déjà en basaa**, sans mémoire → passage en ewondo correct ;
- **ancien `Mbolo`** resté à l'écran → retraduit dans la langue choisie ;
- la version est exposée par `window.__MERA.version`.

### `test-tts.js` — lecture vocale

- le module se charge sans casser la traduction ;
- il lit le texte traduit ;
- il ne lit jamais un montant ou une référence ;
- il se replie proprement si `speechSynthesis` est absent.

### `test-voices.js` — voix

- sélection d'une voix française quand elle existe ;
- sélection d'une voix anglaise pour `en` ;
- repli sur la voix par défaut ;
- pas d'erreur si la liste de voix est vide.

### `test-popup.js` — popup

- `chrome.runtime.lastError` est lu dans tous les callbacks ;
- clic sur **Restaurer** sans content script → message clair, pas d'erreur ;
- version obsolète → rechargement de l'onglet **une seule fois** ;
- message `Mise à jour de la page en cours…`.

---

## Protocole de vérification manuelle

Les tests automatiques ne remplacent pas une vérification dans Chrome,
notamment pour le rendu React réel.

1. Charger l'extension (voir [`INSTALLATION.md`](INSTALLATION.md)).
2. Ouvrir <https://safinum.cm/hackathon-test>.
3. Pour chaque langue (ewondo, fulfulde, basaa, duala, anglais) :
   - vérifier que les libellés changent ;
   - vérifier que **tous** les montants restent identiques ;
   - vérifier que le numéro de compte et la référence sont inchangés ;
   - passer à la langue suivante sans recharger.
4. Cliquer sur **Restaurer** : la page doit revenir au français.
5. Ouvrir **Diagnostic** : `Version page` doit égaler `Version attendue`.
6. Tester **Écouter** : la voix doit lire les libellés, pas les montants.
7. Tester avec une page rechargée (F5) : aucune erreur `lastError`.

### Points d'attention

- Un **libellé absent du dictionnaire** reste en français : c'est attendu.
- Les **dates** (`05 nov. 2026`) restent en français : elles sont protégées.
- Une page **déjà traduite** avant mise à jour doit être rafraîchie (F5) ou
  laissée au rechargement automatique du popup.

---

## Intégration continue

Le workflow `.github/workflows/tests.yml` exécute `npm test` à chaque push et
pull request sur `main`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install
- run: npm test
```

---

## Ajouter un test

1. Créer `tests/test-<sujet>.js` sur le modèle de `test-switch.js`.
2. Utiliser `jsdom` avec `runScripts: "outside-only"`.
3. Charger `guard.js`, `dictionaries.js`, `content.js` dans cet ordre.
4. Fournir un objet `chrome` minimal :

```js
w.chrome = {
  runtime: { onMessage: { addListener() {} }, sendMessage() {} },
  storage: { sync: { get: (_k, cb) => cb({}) } },
};
```

5. Terminer par `process.exit(fail === 0 ? 0 : 1)`.
6. Ajouter le fichier à la chaîne `test` dans `package.json`.

Les tests doivent rester **déterministes** : attendre les passes différées avec
`setTimeout` (les passes vont jusqu'à 3500 ms, prévoir une marge).
