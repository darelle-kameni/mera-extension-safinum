# Validation linguistique

Ce document trace **qui** a validé **quoi**, et ce qui reste en attente. Il est
la référence dès qu'une entrée du dictionnaire change de statut.

Principe : une traduction n'est jamais déclarée validée sans source nommée,
datée et vérifiable. Le règlement du hackathon sanctionne le texte inventé non
déclaré ; il ne sanctionne pas une proposition clairement signalée comme telle.

---

## 1. Statut par langue

| Langue | Source principale | Statut | Reste à valider |
|--------|-------------------|--------|-----------------|
| Ewondo (`ewo`) | Corpus biblique `flagship-ai/cameroon_bibles` (CC-BY-4.0) | Partiel | 17 entrées |
| Fulfulde (`ful`) | Corpus biblique `flagship-ai/cameroon_bibles` (CC-BY-4.0) | Partiel | 18 entrées |
| Basaa (`bas`) | Dictionnaire Njock (2019), SIL / Webonary | Partiel | 48 entrées |
| Duala (`dua`) | Wiktionnaire, Bible, **+ tableau d'un locuteur natif (14 nov. 2026)** | Partiel, renforcé | 12 valeurs adoptées, 4 points à arbitrer |

**Aucune langue n'est intégralement validée.** Après l'intégration duala,
**128 entrées** restent marquées (123 « à valider », 5 « à confirmer ») ; elles
étaient 137 avant l'adoption de 9 entrées duala. Elles sont listées dans
`MERA_Entrees_A_Valider.xlsx`, hors du dépôt.

---

## 2. La source duala

### Origine

Un locuteur natif duala a fourni le **14 novembre 2026** un tableau trilingue
français / duala / anglais de **90 entrées** :

```
docs/tableau_trilingue_francais_duala_anglais(1).pdf   (4 pages)
```

Ce tableau décrit l'interface d'une application de mobile money (transferts,
factures, épargne, réglages). Il couvre donc une partie de notre vocabulaire,
mais pas tous nos libellés.

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

### Ce que la source ne tranche pas

- **`tuma` contre `loma`.** Le natif emploie `loma` pour « envoyer ». Le code
  emploie `tuma` dans une quinzaine d'entrées, dont six phrases entières. Les deux formes
  peuvent coexister (registres différents), mais il faut le confirmer.
- **Les frais.** Aucune ligne « Frais » ni « Frais de transfert » dans le
  tableau natif. Le natif donne seulement `Moni mwabu` pour « frais de
  service » et `esibè sawa` pour « sans frais ». Pour « Frais de transfert »,
  la forme `frais ya loma moni` a été retenue le 14 nov. 2026 (emprunt + racine
  `loma`) ; « Frais » seul reste `Dongo`, non validé.
- **Confirmer.** La ligne « Vérifier avant de confirmer » est restée en
  français : aucun verbe de confirmation n'est fourni.
- **Les tons.** Le tableau est écrit sans accents (`Moni`, `nyi`, `Boro`). Le
  dictionnaire conserve les tons (`Mòni`, `ńyī`) pour rester cohérent.
- **Trois lignes non traduites** : `Référence`, `Sécurité`, et une deuxième
  occurrence de `Solde disponible` (ligne 77). Cette dernière montre que la
  relecture n'est pas systématique : c'est une limite de la source, pas un
  oubli de notre part.

### Décision d'intégration

Seules les valeurs **explicitement fournies** ont été adoptées. Aucune phrase
n'a été réécrite par déduction. Les points ouverts sont signalés dans le code
par `// à valider` et listés ci-dessus.

Détail complet des 90 lignes, avec décision ligne par ligne :
`MERA_Tableau_Natif_Duala.xlsx` (hors dépôt).

---

## 3. Ce qui a changé dans le code

Versions 1.2.3 et 1.2.4, fichier `src/dictionaries.js`, bloc `DUALA` :

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
| Frais de transfert | `Dongo ya tuma` | `frais ya loma moni` | emprunt + `loma`, décision du 14 nov. 2026 |

La dernière ligne est une **construction** : le natif fournit le mot `dina`,
mais pas la formule complète. Elle reste marquée `// à valider`.

---

## 4. Protocole pour les autres langues

1. Faire relire les entrées listées dans `MERA_Entrees_A_Valider.xlsx`.
2. Pour chaque entrée : « OK », ou la formulation corrigée.
3. Reporter la correction dans `src/dictionaries.js`, avec la date et la source.
4. Relancer `npm test`.
5. Mettre à jour ce document.

Un relecteur natif par langue suffit pour lever le statut « à valider ». En cas
de désaccord entre deux relecteurs, la variante régionale est documentée dans
`docs/SOURCES.md` plutôt que supprimée.
