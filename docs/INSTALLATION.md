# Installation et mise à jour

MERA est une extension **non empaquetée** (unpacked) : elle se charge depuis un
dossier local. Aucun compte, aucun serveur, aucune compilation.

---

## Prérequis

| Élément | Version |
|---|---|
| Chrome, Edge, Brave ou Chromium | navigateur compatible Manifest V3 |
| Node.js (uniquement pour les tests) | ≥ 18 |
| npm (uniquement pour les tests) | livré avec Node.js |

L'extension elle-même ne nécessite que le navigateur.

---

## Option A — Cloner le dépôt

```bash
git clone https://github.com/darelle-kameni/mera-extension-safinum.git
cd mera-extension-safinum
```

Facultatif, pour lancer les tests :

```bash
npm install
npm test
```

## Option B — Télécharger une archive

1. Télécharger l'archive `mera-extension-safinum.zip` fournie avec le projet.
2. La décompresser dans un dossier stable (éviter un dossier temporaire).
3. Vérifier que `manifest.json` se trouve **à la racine** du dossier.

---

## Charger l'extension

1. Ouvrir `chrome://extensions/`.
2. Activer le **Mode développeur** en haut à droite.
3. Cliquer sur **Charger l'extension non empaquetée**.
4. Sélectionner le dossier qui contient `manifest.json`.
5. L'extension **MERA** apparaît avec son icône.

> Si Chrome affiche une erreur de manifest, vérifier que le dossier sélectionné
> contient bien `manifest.json` et le répertoire `src/`.

---

## Première utilisation

1. Ouvrir <https://safinum.cm/hackathon-test>.
2. Cliquer sur l'icône **MERA** dans la barre d'outils.
3. Choisir une langue dans le menu.
4. La traduction s'applique immédiatement, sans rechargement.

Le bandeau de statut indique `Active — <langue>`. Si la page n'est pas encore
prise en charge, le popup affiche `Choisissez une langue puis « Traduire la
page »`.

---

## Vérifier que tout fonctionne

### Dans le popup

- Le sélecteur propose six langues : Français, English, Ewondo, Fulfulde,
  Basaa, Duala.
- Les compteurs **traduits / protégés / ignorés** se remplissent.
- La ligne `Solde` affiche un aperçu traduit (`→ Yêglɛ̀` en basaa, par exemple).
- Le bloc de preuve montre `10 000 FCFA`, `SNF-2026-0001` et
  `+237 6 57 41 67 60` comme **protégés**.

### Diagnostic

Bouton **Diagnostic** → le panneau doit afficher :

```
URL : https://safinum.cm/hackathon-test
URL autorisée : oui
Content script : PRÉSENT
Version page : 1.2.4
Version attendue : 1.2.4
Actif : true
Langue : ewo
```

Si `Version page` est différente de `1.2.4`, le popup a normalement déjà
rechargé l'onglet automatiquement.

### Dans la console de la page

```js
__MERA.version          // "1.2.4"
__MERA.languages()      // ["fr", "en", "ewo", "ful", "bas", "dua"]
__MERA.test("Solde")    // { out: "Mòni", changed: true } en ewondo
__MERA.stats()          // compteurs et langue active
```

Ces commandes servent uniquement au diagnostic ; elles ne modifient rien.

---

## Mise à jour de l'extension

Chrome ne met pas à jour une extension non empaquetée automatiquement.

1. Récupérer la nouvelle version (git ou archive).
2. Aller sur `chrome://extensions/`.
3. Cliquer sur l'icône **↻** de la carte MERA.
4. **Rouvrir** la page `safinum.cm/hackathon-test` (F5) : un content script
   déjà chargé ne peut pas être remplacé à chaud.

Le popup vérifie la version du script présent dans la page. Si elle est
obsolète, il affiche `Mise à jour de la page en cours…` et recharge l'onglet une
fois.

---

## Désinstaller

1. `chrome://extensions/`.
2. Carte MERA → **Supprimer**.
3. Recharger l'onglet Safinum : la page revient à son état d'origine.

Aucune donnée n'ayant été stockée, il n'y a rien d'autre à nettoyer.

---

## Démo sans installation

Le fichier `demo.html` reproduit le parcours et embarque les mêmes modules.

1. Ouvrir `demo.html` dans Chrome (double-clic ou glisser dans un onglet).
2. Utiliser la barre de langues en haut de page.
3. Tester la lecture vocale avec le bouton dédié.

La démo ne dépend pas de l'extension et ne contacte aucun serveur.

---

## Dépannage rapide

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Ouvrez safinum.cm/hackathon-test » | onglet actif hors périmètre | ouvrir la bonne page |
| « Aucune traduction active » | rien n'a encore été appliqué | choisir une langue |
| Textes encore en français | libellé absent du dictionnaire | comportement normal, voir `docs/FAQ.md` |
| Ancienne langue affichée | content script obsolète | recharger la page (F5) |
| Voix absente | `speechSynthesis` non supporté | utiliser un autre navigateur |
| Erreur `lastError` dans la console | version ancienne | mettre à jour, puis F5 |

Voir [`FAQ.md`](FAQ.md) pour les cas détaillés.
