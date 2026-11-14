# FAQ et dépannage

---

## Installation et chargement

### Chrome refuse de charger l'extension

**Symptôme** : « Manifest file is missing or unreadable ».

**Cause** : le dossier sélectionné ne contient pas `manifest.json` à sa racine.

**Solution** : sélectionner le dossier `mera-extension-safinum` lui-même, pas son
parent ni son sous-dossier `src/`.

### L'icône MERA n'apparaît pas

1. `chrome://extensions/` → vérifier que l'extension est **activée**.
2. Cliquer sur l'icône puzzle 🧩 dans la barre d'outils.
3. Épingler **MERA**.

### L'extension fonctionne dans Chrome mais pas dans Firefox

MERA utilise Manifest V3 et l'API `chrome.scripting`, supportées par Chrome,
Edge, Brave et Chromium récents. Firefox n'est pas testé et peut nécessiter des
adaptations.

---

## Utilisation

### Le popup affiche « Ouvrez safinum.cm/hackathon-test »

L'extension refuse volontairement d'agir hors de son périmètre. Ouvrir
<https://safinum.cm/hackathon-test> dans l'onglet actif, puis rouvrir le popup.

### Rien ne se passe quand je choisis une langue

1. Vérifier que l'onglet actif est bien sur `safinum.cm`.
2. Cliquer sur **Diagnostic** et vérifier :
   - `URL autorisée : oui` ;
   - `Content script : PRÉSENT`.
3. Si `ABSENT`, cliquer sur **Traduire la page** : le popup injecte
   automatiquement les scripts.
4. Si le problème persiste, recharger la page (F5).

### Le changement de langue ne s'applique pas

Une page ouverte **avant** une mise à jour garde l'ancien content script.
Le popup détecte normalement la version obsolète et recharge l'onglet une fois.

Si ce n'est pas le cas :

1. `chrome://extensions/` → **↻** sur MERA ;
2. F5 sur la page Safinum ;
3. rouvrir le popup.

### La salutation reste dans une ancienne langue

Ce cas est couvert depuis la version **1.2.2** : l'ancienne traduction `Mbolo`
est reconnue comme un alias de `Bonjour`. Vérifier dans **Diagnostic** que
`Version page` est bien `1.2.3`. Sinon : mettre à jour, puis F5.

### Certains textes restent en français

C'est **normal**. Le moteur traduit des **segments connus**. Restent en
français :

- les libellés absents des dictionnaires ;
- les textes entièrement protégés (montants, dates, références) ;
- les noms propres et les données du compte.

L'objectif est de ne jamais inventer une traduction hasardeuse sur un écran
financier.

### Les dates restent en français

Oui, volontairement. Une date est une donnée financière : elle est protégée par
le garde-fou (`05 nov. 2026` ne doit jamais changer). Seuls les libellés qui
l'entourent sont traduits.

---

## Valeurs et sécurité

### L'extension peut-elle modifier un montant ?

Non, par construction :

1. `guard.js` bloque tout texte contenant un chiffre, une devise, une date, une
   référence, un email ou une URL ;
2. après chaque remplacement, `content.js` compare la liste des nombres avant et
   après. Toute différence annule la traduction ;
3. les zones de saisie (`input`, `textarea`, `select`, `contenteditable`) sont
   totalement ignorées.

Les tests vérifient 12 valeurs réelles sur la reproduction du DOM du site, et
17 formats dans `test-core.js`.

### Que se passe-t-il pour `Numéro de compte : SNF-2026-0001` ?

Le libellé `Numéro de compte` est traduit, la valeur `SNF-2026-0001` reste
intacte. Le moteur autorise ce cas mixte uniquement parce que le texte contient
un `:` et un mot de plus de 4 lettres.

### Mes saisies sont-elles modifiées ?

Non. Aucun nœud situé dans un champ de formulaire n'est touché. Les attributs
`placeholder`, `title`, `aria-label` et `alt` peuvent être traduits, mais jamais
la valeur saisie.

---

## Confidentialité

### L'extension envoie-t-elle des données ?

**Aucune.** Pas de requête réseau, pas de télémétrie, pas de serveur. Tout le
traitement se fait dans la page.

### Où la langue choisie est-elle enregistrée ?

**Nulle part.** L'extension ne demande pas la permission `storage`. À chaque
ouverture, il faut choisir la langue. Ce choix est délibéré : il évite qu'une
langue mémorisée transforme la page dès le chargement.

### Pourquoi les permissions `tabs` et `scripting` ?

- `activeTab` : agir sur l'onglet actif après un clic sur l'extension ;
- `tabs` : identifier l'onglet et son URL, et le recharger en cas de version
  obsolète ;
- `scripting` : injecter le moteur si le content script n'est pas présent.

Aucune de ces permissions ne donne accès aux autres onglets, à l'historique ou
aux données personnelles.

---

## Lecture vocale

### La voix est française, pas ewondo

Aucun navigateur ne fournit de voix pour l'ewondo, le fulfulde, le basaa ou le
duala. MERA utilise donc la meilleure voix disponible (souvent française) pour
prononcer les graphèmes latins. **La prononciation est indicative, pas
authentique.**

Le module `tts.js` est isolé précisément pour permettre le branchement futur
d'un moteur spécialisé (par exemple Vambo AI pour le duala).

### Aucun son ne sort

1. Vérifier le volume du système et de l'onglet.
2. Vérifier que le navigateur supporte `speechSynthesis` (Chrome oui).
3. Sur Linux, l'installation de voix système (`speech-dispatcher`, `espeak`)
   peut être nécessaire.
4. Le popup affiche `Synthèse vocale non supportée par ce navigateur` si l'API
   est absente.

### La lecture lit-elle les montants ?

Non. Le même garde-fou filtre les montants, numéros, dates et références avant
la synthèse.

---

## Erreurs techniques

### `Unchecked runtime.lastError: Could not establish connection`

Cette erreur apparaissait quand un message était envoyé sans destinataire
(popup fermé) sans lire `lastError`.

**Corrigé en 1.2.0 et 1.2.2.** Si elle réapparaît :

1. vérifier la version dans **Diagnostic** ;
2. mettre à jour l'extension ;
3. recharger la page.

### `Could not load javascript 'src/...' for content script`

Le fichier référencé par `manifest.json` est absent ou le dossier chargé n'est
pas le bon. Vérifier la structure :

```
manifest.json
src/guard.js
src/dictionaries.js
src/content.js
src/tts.js
src/popup.html
src/popup.js
src/icon16.png …
```

### `Extension context invalidated`

L'extension a été rechargée ou supprimée pendant que la page utilisait encore
son content script. Recharger la page (F5) résout le problème.

### Le popup affiche « Version page : OBSOLÈTE »

Le script présent dans la page ne correspond pas à la version de l'extension.

1. Attendre le rechargement automatique (le popup le déclenche) ;
2. ou F5 manuellement ;
3. rouvrir le popup.

---

## Traductions

### Pourquoi `// à valider` dans le code ?

Le vocabulaire du **mobile money** (solde, frais, transaction, bénéficiaire) est
absent des corpus sources : la Bible et le dictionnaire basaa de 2019 ne
parlaient pas de transfert d'argent mobile. Les termes correspondants sont donc
des **propositions documentées**, marquées `// à valider`, en attente de
validation par un locuteur natif.

Cette transparence est volontaire : le règlement du hackathon sanctionne le
« texte inventé » non déclaré.

### Pourquoi `Masug` et non `Mbolo` en ewondo ?

`Masug` est la salutation familière et intemporelle la plus citée. `Mbolo` est
une variante valable, documentée dans `docs/SOURCES.md` et conservée comme alias
technique pour les pages déjà traduites.

### Puis-je ajouter une langue ?

Oui :

1. ajouter un dictionnaire dans `src/dictionaries.js` ;
2. ajouter l'option dans `src/popup.html` ;
3. compléter `LANG_NAMES` et `SOLDE_PREVIEW` dans `src/popup.js` ;
4. lancer `npm test` et compléter les tests de couverture.

Aucune autre modification n'est nécessaire : le moteur construit ses index à
partir de `__MERA_DICTIONARIES`.

### Puis-je corriger une traduction ?

Oui. Modifier la valeur dans les dictionnaires (six langues), mettre à jour
`docs/SOURCES.md` avec la source, puis relancer `npm test`. Les tests vérifient
la présence des 59 clés, pas leur contenu exact, sauf pour quelques cas
explicitement testés (salutations, marqueurs de langue).

---

## Divers

### L'extension fonctionne-t-elle hors ligne ?

Oui, entièrement. Aucun appel réseau n'est effectué.

### Fonctionne-t-elle sur d'autres sites Safinum ?

Le manifest autorise `https://safinum.cm/*` et `https://www.safinum.cm/*`. Le
popup vérifie la même règle. D'autres pages du domaine peuvent donc être
traduites, mais seuls les 59 libellés connus sont couverts.

### Comment désinstaller proprement ?

`chrome://extensions/` → carte MERA → **Supprimer**, puis recharger l'onglet.
Aucune donnée n'étant stockée, il n'y a rien d'autre à nettoyer.

### Comment contribuer ?

Les contributions utiles sont :

- la validation de termes par des locuteurs natifs ;
- l'ajout de sources vérifiables dans `docs/SOURCES.md` ;
- de nouveaux tests de non-régression ;
- un moteur TTS spécialisé pour une langue camerounaise.

Toute modification doit passer `npm test` et ne jamais affaiblir le garde-fou.
