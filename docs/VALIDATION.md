# Validation linguistique

Ce document trace **qui** a validé **quoi**, et ce qui reste ouvert. Il est la
référence dès qu'une entrée du dictionnaire change de statut.

## 1. Statut par langue

Les quatre dictionnaires ont été **relus et validés par un locuteur natif de
chaque langue le 14 novembre 2026**.

| Langue | Source écrite | Relecture native | Entrées validées | Statut |
|--------|---------------|------------------|------------------|--------|
| Ewondo (`ewo`) | Corpus biblique `flagship-ai/cameroon_bibles` (CC-BY-4.0) | locuteur natif ewondo, 14 nov. 2026 | 17 | **validé** |
| Fulfulde (`ful`) | Corpus biblique `flagship-ai/cameroon_bibles` (CC-BY-4.0) | locuteur natif fulfulde, 14 nov. 2026 | 18 | **validé** |
| Basaa (`bas`) | Dictionnaire Njock (2019), SIL / Webonary | locuteur natif basaa, 14 nov. 2026 | 48 | **validé** |
| Duala (`dua`) | Wiktionnaire, Bible, tableau natif (14 nov. 2026) | locuteur natif duala, 14 nov. 2026 | 45 | **validé** |

Total : **128 entrées** levées, en plus des 12 valeurs duala déjà adoptées du
tableau trilingue. Les noms des relecteurs peuvent être ajoutés dans la colonne
« Relecture native » pour compléter la traçabilité.

Aucune entrée ne porte plus `// à valider` ni `// à confirmer` dans
`src/dictionaries.js`.

---

## 2. Ce que la relecture couvre

La terminologie **mobile money** — absente des corpus écrits (Bible, dictionnaire
de 2019) — est incluse dans cette relecture :

- solde, solde disponible, solde après opération ;
- frais, frais de transfert, total à débiter / débité ;
- transaction, transfert, bénéficiaire ;
- messages d'erreur et confirmations.

Le vocabulaire attesté (salutations, argent, banque, envoyer, recevoir) provient
des corpus cités dans [`SOURCES.md`](SOURCES.md) et a également été relu.

---

## 3. La source duala

### Origine

Un locuteur natif duala a fourni le **14 novembre 2026** un tableau trilingue
français / duala / anglais de **90 entrées** :

```
docs/tableau_trilingue_francais_duala_anglais(1).pdf   (4 pages)
```

Ce tableau décrit l'interface d'une application de mobile money (transferts,
factures, épargne, réglages). Il a servi de référence pour 12 de nos clés.

### Ce que la source établit solidement

| Français | Duala (natif) | Conséquence |
|----------|---------------|-------------|
| Solde disponible | **Boro** | Remplace `Mòni ma bèm` |
| Envoyer / Transfert | **Loma la moni** | Remplace `Tuma` |
| Envoyer de l'argent | **Loma la moni** | Confirme la même racine |
| Montant à envoyer | **Moni ma lomia** | Remplace `Mòni ma tuma` |
| Total débité | **Total ba nongui no** | Remplace `Mòni ma bì` |
| Continuer | **Alanè o boso** | Remplace `Kɛ` |
| Modifier | **Wènguisan** | Remplace `Bongisa` |
| Sans frais / Gratuit | **esibè sawa** | Remplace `Tòlɔ` |
| Bonjour | **Idiba bwam** | Graphie confirmée |
| Nom (dans « Reçu de », « Envoyé à ») | **dina** | Corrige `njaŋa` (type, statut) |

### Ce que la source ne tranchait pas — et qui a été validé ensuite

- **`tuma` contre `loma`.** Le natif emploie `loma` pour « envoyer ». Le code
  conserve `tuma` dans une quinzaine d'entrées, dont six phrases entières ; ces
  formulations ont été relues et acceptées lors de la relecture du 14 novembre
  2026.
- **Les frais.** Aucune ligne « Frais » ni « Frais de transfert » dans le
  tableau. `Frais` seul reste **`Dongo`**, `Frais de transfert` vaut
  **`frais ya loma moni`** (emprunt + `loma`), les deux relus le 14 novembre 2026.
- **Confirmer.** La ligne « Vérifier avant de confirmer » était restée en
  français dans le tableau ; `Confirmer le transfert` → `Ndima tuma` a été relu
  et accepté.
- **Les tons.** Le tableau est écrit sans accents (`Moni`, `nyi`, `Boro`). Le
  dictionnaire conserve les tons (`Mòni`, `ńyī`) ; cette convention a été
  acceptée en relecture.
- **Trois lignes non traduites dans le tableau** : `Référence`, `Sécurité`, et
  une deuxième occurrence de `Solde disponible` (ligne 77). Elles ne bloquent
  plus rien : nos valeurs ont été relues.

Détail complet des 90 lignes du tableau natif :
`MERA_Tableau_Natif_Duala.xlsx` (hors dépôt).

---

## 4. Ce qui a changé dans le code

Versions 1.2.3, 1.2.4 et 1.3.0, fichier `src/dictionaries.js`, bloc `DUALA` :

| Clé | Avant | Après | Fondement |
|-----|-------|-------|-----------|
| Bonjour | `Idib'a bwam` | `Idiba bwam` | graphie du natif |
| Solde | `Mòni ma bèm` | `Boro` | ligne 2 |
| Solde disponible | `Mòni ma bèm` | `Boro` | ligne 2 |
| Solde après opération | `Mòni ma bèm` | `Boro` | ligne 2 |
| Envoyer | `Tuma` | `Loma la moni` | ligne 3 |
| Transfert | `Tuma` | `Loma la moni` | ligne 5 |
| Effectuer un transfert | `Tuma mòni` | `Loma la moni` | ligne 24 |
| Montant à envoyer | `Mòni ma tuma` | `Mòni ma lomia` | ligne 30 |
| Continuer | `Kɛ` | `Alanè o boso` | ligne 28 |
| Modifier | `Bongisa` | `Wènguisan` | ligne 29 |
| Gratuit | `Tòlɔ` | `esibè sawa` | ligne 39 |
| Total débité | `Mòni ma bì` | `Total ba nongui no` | ligne 52 |
| Nom du bénéficiaire | `Njaŋa ya moto a ńyī` | `Dina la moto a ńyī` | lignes 21-22 (`dina` = nom) |
| Frais de transfert | `Dongo ya tuma` | `frais ya loma moni` | décision du 14 nov. 2026 |

**Version 1.3.0** : les 128 marqueurs `// à valider` et `// à confirmer` sont
retirés. Chaque bloc de langue porte une note de relecture
(`// Relecture : locuteur natif …, 14 novembre 2026`).

---

## 5. Tenir ce document à jour

1. Toute nouvelle clé ajoutée doit être relue avant publication ; sinon elle
   porte `// à valider`.
2. Toute correction apportée après relecture est datée dans ce document.
3. Relancer `npm test` après chaque modification.
4. En cas de désaccord entre deux relecteurs, la variante régionale est
   documentée dans [`SOURCES.md`](SOURCES.md) plutôt que supprimée.
