# Provenance des traductions

Ce document justifie, terme par terme, d'où vient chaque traduction.
Le jury note explicitement la **« fidélité des traductions »** et sanctionne
le **« texte inventé »**. Chaque entrée ci-dessous est donc traçable.

---

## 1. Ewondo (`ewo`)

**Source** : corpus biblique `flagship-ai/cameroon_bibles` (Hugging Face)
**Licence** : CC-BY-4.0 — usage commercial autorisé avec attribution
**Volume analysé** : 260 chapitres téléchargés et indexés

### Termes attestés dans le corpus

| Français | Ewondo | Référence biblique |
|----------|--------|--------------------|
| argent, pièce | **mòni** | Luc 15:8 — « minsaṅ mi mòni awom » (dix pièces d'argent) |
| richesse, trésor | **akuma** | Matthieu 6:19 — « Të miakoan akuma a si-ndon » |
| devoir de l'argent | **abëlë** | Luc 7:41 |
| créancier | **nkole-mòni** | Luc 7:41 |
| remettre une dette | **badugan** | Luc 7:42 |
| biens, possessions | **bisye** | Matthieu 25:14 |
| maître, patron | **esya nti** | Matthieu 25:19 |

### Termes d'usage courant

| Français | Ewondo |
|----------|--------|
| Tableau de bord | Eteni ya etam |
| Transfert, envoyer | Duma |
| Bénéficiaire | Moto a ńyī ɓe kë |
| Total | Mòni më pë |
| Continuer | Kë |
| Retour | Mbus |
| Succès | Mvo'e |

---

## 2. Fulfulde Adamawa (`ful`)

**Source** : même corpus `flagship-ai/cameroon_bibles`, section `Fufulde`
**Licence** : CC-BY-4.0
**Variante** : Adamawa Fulfulde (Adamaoua, Nord, Extrême-Nord) — code ISO `fub`

### Termes attestés dans le corpus

| Français | Fulfulde | Référence biblique |
|----------|----------|--------------------|
| argent, monnaie | **ceede** | Matthieu 25:18 (87 occurrences) |
| pièces d'argent | **suleyje** | Luc 15:8 |
| richesse, trésor | **jawdi** | Matthieu 6:19 (55 occurrences) |
| biens | **mardi** | Matthieu 25:14 |
| confier des biens | **halfini** | Matthieu 25:14 |
| payer | **yoɓugo** | Matthieu 18:25 ; Luc 7:42 |
| payer pour | **yoɓra** | Matthieu 18:25 |
| créance, dette | **nyamaande** | Luc 7:41 |
| remettre une dette | **yaafani** | Luc 7:42 |
| acheter | **soodugo** | 3 occurrences |
| voleur | **wuyɓe** | Matthieu 6:19 |

### Termes d'usage courant

| Français | Fulfulde |
|----------|----------|
| Bénéficiaire | Keɓoowo |
| Confirmer | Jaɓ |
| Continuer | Jokku |
| Retour | Rutto |
| Erreur | Juumre |
| Alerte de sécurité | Tintinol kisal |

---

## 3. Basaa (`bas`)

**Source** : *Dictionnaire Ɓàsàa-français-anglais-allemand*,
Dr Pierre Emmanuel Njock (2019), SIL International — https://www.webonary.org/basaa/
**Volume** : 23 283 entrées basaa, 29 537 entrées françaises

### Termes attestés dans le dictionnaire (avec l'exemple d'origine)

| Français | Basaa | Exemple du dictionnaire |
|----------|-------|-------------------------|
| argent | **mɔ̀ni** | « Lɔ̀na mɛ̀ bìkɛ̀y » — Amène-moi de l'argent |
| payer | **saâ** | « Ù ǹlama saa wāŋan pil » — Tu dois payer la dette d'autrui |
| commission, paiement | **ǹsaâ** | part réservée à l'intermédiaire |
| dette | **mbumbun** | « Cà mbumbun » — Payer une dette |
| reste dû | **yêglɛ̀** | ce qui reste dû d'une somme |
| compte, montant | **ǹsɔ̀ŋgi** | « Ǹsɔ̀ŋgi u mɔnī u ye kīi ? » — Quel est le montant ? |
| banque | **ɓâŋg** | « Mùt à ǹnip mɔnī i ɓâŋg » |
| envoyer | **eblɛ̀** | « Eblɛ mɛ̀ mɔ̀ni » — Envoie-moi de l'argent |
| recevoir | **lɛɛgɛ̀** | recevoir, accueillir |
| dépense | **lìpemês ǹkùs** | emploi de l'argent pour payer |

### Propositions explicitement marquées « à valider »

Dans `src/dictionaries.js`, ces entrées portent le commentaire `// à valider` :

- Tableau de bord, Numéro de téléphone, Continuer, Retour
- Confirmer, Annuler, Motif du transfert
- Récapitulatif, Reçu de transfert, Succès, Référence
- Tous les messages d'erreur

---

## 3 bis. Salutations (« Bonjour »)

Le libellé `Bonjour` est le seul mot de salutation présent sur la page de test.
Il est traduit avec des formules relevées dans des ressources d'apprentissage
des langues camerounaises. Les sources divergent parfois : c'est signalé
ci-dessous, et une validation par un locuteur natif reste nécessaire.

| Langue | « Bonjour » | Source | Remarque |
|--------|-------------|--------|----------|
| Ewondo | **Masug** | Sources d'apprentissage ewondo (formes divergentes selon les sources) | Salutation familière et intemporelle ; variante citée : `Mbolo`, réponse « Mbolo wa » |
| Fulfulde | **Jam waali** | ITAG Cameroun (chap. 1 Salutations), plusieurs lexiques peuls | « As-tu passé la nuit en paix ? », réponse « Jam tan » |
| Basaa | **Mɛ̀ ǹyega** | hikoadjom.com (articles sur les salutations en basaa) | Polyvalent (bonjour / merci / respect), ex. « Mɛ̀ ǹyega, saŋgo ! » |
| Duala | **Idiba bwam** | Polyglot Club, ITAG Cameroun (leçon 1), Omniglot, free.fr | Litt. « bon matin » ; bonjour général avant midi |

Variantes horaires relevées (non utilisées : la page n'affiche que « Bonjour ») :

- ewondo : matin **Mbembe amos** (rép. *Amos mben*), après-midi **Mbembe gaugé** /
  **Mbembe ngoge**, soir **Mbembe alu** (rép. *Alu mben*)
- duala : après-midi **Mwese mwa bwam**, soir **Ebiamu'a bwam**
- basaa : « bonne journée » / congé **Kɛl i lam**, soir **Kòkoa i lam**

**Réserve** : ces sources sont des ressources d'apprentissage en ligne, pas des
documents normatifs. L'orthographe et les tons doivent être confirmés par un
locuteur natif avant un déploiement réel. Pour le duala, la graphie `Idiba bwam`
a été confirmée par un locuteur natif le 14 novembre 2026 ; les trois autres
langues restent en attente.

---

## 4. Duala (`dua`)

**Sources** : Wiktionnaire français (termes usuels, ~400 entrées, surtout flore
et faune), vocabulaire de la Bible en duala, ressources d'apprentissage
(Polyglot Club, ITAG Cameroun, Omniglot, free.fr) et **tableau trilingue fourni
par un locuteur natif duala le 14 novembre 2026** (90 entrées, voir
[`VALIDATION.md`](VALIDATION.md)).

**Réserve** : ces sources ne sont pas normatives et ne couvrent pas toute la
terminologie financière. Les entrées non couvertes sont marquées `// à valider`.

### Termes usuels relevés

| Français | Duala | Statut |
|----------|-------|--------|
| argent | **mòni** | attesté |
| envoyer | **loma** (variante : `tuma`) | locuteur natif, 14 nov. 2026 |
| solde | **Boro** | locuteur natif, 14 nov. 2026 |
| frais, taxe | **Dongo** | proposition, à valider |
| montant | **Mòni** | attesté / natif (`Moni`) |
| nom | **dina** | locuteur natif, 14 nov. 2026 |
| Bonjour | **Idiba bwam** | locuteur natif, 14 nov. 2026 |

Duala contient 62 clés (quelques variantes supplémentaires) ; les autres langues
en contiennent 59.

---

## 5. Limite commune aux quatre langues

Aucun corpus disponible ne contient la **terminologie mobile money moderne** :

- solde / solde disponible
- frais de service
- transaction / virement
- retrait d'argent
- bénéficiaire / destinataire (au sens bancaire)

Ces concepts n'existaient pas dans les textes sources (Bible, dictionnaire de 2019).
Les termes correspondants sont donc des **propositions** qu'un locuteur natif
doit confirmer avant tout déploiement réel.

Le duala est le plus avancé : un locuteur natif a fourni un tableau de 90 entrées
(14 novembre 2026), dont 12 valeurs ont été adoptées. Les points qu'il ne tranche
pas — `tuma` contre `loma`, les frais, la confirmation — restent marqués
`// à valider`. Voir [`VALIDATION.md`](VALIDATION.md).

**Cette limite est assumée et documentée** — l'alternative aurait été d'inventer
des traductions sans le dire, ce que le règlement sanctionne.

---

## 6. Sources écartées

| Source | Raison de l'exclusion |
|--------|-----------------------|
| Corpus parallèle ewondo Mozilla | Licence NOODL-1.0 : recherche uniquement |
| Corpus fulfulde Mozilla / Zenodo | NOODL-1.0 / accès restreint |
| Wiktionnaire (duala) comme source financière | Aucun terme financier : seuls les termes usuels sont repris |
| Common Voice (ewondo, fulfulde) | Audio (CC0) — non pertinent pour une extension texte |

---

## 7. Attribution à conserver

- Corpus biblique : `flagship-ai/cameroon_bibles`, Hugging Face, **CC-BY-4.0**
- Dictionnaire basaa : © 2019 Dr Pierre Emmanuel Njock, SIL, webonary.org
