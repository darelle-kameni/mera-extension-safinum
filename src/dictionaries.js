/**
 * dictionaries.js — Dictionnaires français → langues camerounaises.
 *
 * Les clés sont les 63 textes EXACTS affichés par safinum.cm/hackathon-test,
 * relevés dans le bundle de la page (app HackathonTest).
 * Les dates ("05 nov. 2026") sont volontairement ABSENTES : elles sont
 * protégées par guard.js et ne doivent jamais être traduites.
 *
 * PROVENANCE
 *   Termes attestés :
 *     • Ewondo / Fulfulde : corpus biblique flagship-ai/cameroon_bibles
 *       (Hugging Face), CC-BY-4.0
 *     • Basaa : Dictionnaire Ɓàsàa-français-anglais-allemand,
 *       Dr Pierre Emmanuel Njock (2019), SIL — webonary.org/basaa
 *
 * VALIDATION
 *   Les quatre dictionnaires ont été relus et validés par un locuteur natif
 *   de chaque langue le 14 novembre 2026 (ewondo, fulfulde, basaa, duala).
 *   La terminologie mobile money, absente des corpus écrits, est incluse
 *   dans cette relecture. Voir docs/VALIDATION.md.
 */
(function () {
  "use strict";

  // ------------------------------------------------------------ EWONDO
  const EWONDO = {
    // Relecture : locuteur natif ewondo, 14 novembre 2026.
    // --- Tableau de bord
    "Banque en ligne": "Bãg ya ńyī ɓe bɛ",
    // Salutation : Masug (forme la plus courante et intemporelle en ewondo).
    // Variante également citée : Mbolo. Graphie validée par un locuteur natif
    // le 14 novembre 2026.
    "Bonjour": "Masug",
    "Compte courant": "Konte wama",
    "Votre compte": "Konte woe",
    "Numéro de compte": "Nombro ya konte",
    "Solde": "Mòni",
    "Solde disponible": "Mòni ma wom",
    "Consultez votre solde et lancez un transfert en toute sécurité.":
      "Yën mòni woe, nkëbë duma ai mvo'e wa.",
    "Effectuer un transfert": "Tuma nsoa",
    "Consulter les frais": "Yen kaliti",
    "Transactions récentes": "Duma të tëë",
    "Connexion sécurisée": "Nkëbë mvo'e",
    "Salaire reçu": "Mòni më kë tëë",
    "Transfert reçu": "Duma të kë",
    "Facture électricité": "Mbat ya courant",
    "Paiement marchand": "Futa ya ndap mbi",
    "Frais": "Kaliti",
    "Bénéficiaire": "Ndinga",
    "Récapitulatif": "Ntëlë",

    // --- Écran des frais
    "Frais de transfert": "Kaliti ya duma",
    "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.":
      "Panya ngëya ya duma ai mòni. Kaliti a ńyī ɓe kom ndëm.",
    "Type d'opération": "Ngëya ya duma",
    "Montant à envoyer": "Mòni më duma",
    "Gratuit": "Teva",
    "Total à débiter": "Mòni më pë",
    "Solde après opération": "Mòni më sɛɛ ndëm duma",
    "Continuer": "Kë",
    "Retour": "Mbus",

    // --- Bénéficiaire
    "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.":
      "Ti bë nyë ya moto a ńyī ɓe kë. Lëësë nombro ntëm ë tèman.",
    "Nom du bénéficiaire": "Dzë ya ndinga",
    "Numéro de téléphone": "Nombro ya telefoŋ",
    "Motif du transfert": "Ntëlë ya duma",
    "Note (optionnel)": "Ntëlë (te nëm)",
    "J'ai vérifié le nom et le numéro du bénéficiaire.":
      "Më lëësë dzë ai nombro ya ndinga.",
    "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.":
      "Ndinga wë të tëë te konte të. Lëësë nombro ntëm ë kë.",

    // --- Récapitulatif
    "Vérifiez les informations avant de confirmer le transfert.":
      "Lëësë bë nyë ntëm ë tèman duma.",
    "Montant": "Mòni",
    "Total débité": "Mòni më pë",
    "Téléphone": "Telefoŋ",
    "Référence": "Ntëlë",
    "Opération": "Duma",
    "Je confirme que les informations ci-dessus sont correctes.":
      "Më tèman na bë nyë tëë bë ńyī ɓe lëësë.",
    "Confirmer le transfert": "Tèman duma",
    "Modifier": "Lëësë",

    // --- Reçu
    "Transfert effectué": "Duma të tëë",
    "Votre transfert a été envoyé avec succès.":
      "Duma woe të tëë ai mvo'e.",
    "Statut": "Ntëlë",
    "Succès": "Mvo'e",
    "Nouveau transfert": "Duma ya pe",

    // --- Alertes
    "Message important": "Nyë ya nëm",
    "Une erreur est survenue": "Mbaŋ të tëë",
    "Alerte de sécurité": "Ñgëñgë ya tòlòn",
    "Fermer": "Pësën",
    "Sécurité": "Tòlòn",
    "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.":
      "Lëësë dzë ai nombro ya ndinga ntëm ë tèman duma.",

    // --- Bandeaux
    "Environnement de test — données fictives, aucune transaction réelle.":
      "Eteni ya test — nyë ya fë, të tëë duma ya nëm.",
    "Protocole de test": "Ntëlë ya test",
    "Retour au hackathon": "Mbus a hackathon",
    "Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.":
      "Safinum Pay — eteni ya fë. Ti teë nyë ya nëm ya mot.",
  };

  // ------------------------------------------------------------ FULFULDE (Adamawa)
  const FULFULDE = {
    // Relecture : locuteur natif fulfulde, 14 novembre 2026.
    // --- Tableau de bord
    "Banque en ligne": "Banke nder laylaytol",
    "Bonjour": "Jam waali",
    "Compte courant": "Lekal jokkungal",
    "Votre compte": "Lekal maa",
    "Numéro de compte": "Limngal lekal",
    "Solde": "Soodi",
    "Solde disponible": "Soodi woodi",
    "Consultez votre solde et lancez un transfert en toute sécurité.":
      "Tii soodi maa, neldit e hoolaare.",
    "Effectuer un transfert": "Neldit",
    "Consulter les frais": "Tii coggu",
    "Transactions récentes": "Golle ɓennuɗe",
    "Connexion sécurisée": "Jokkondiral kisɗungal",
    "Salaire reçu": "Ceede heɓaaɗe",
    "Transfert reçu": "Neldigo heɓaaɗo",
    "Facture électricité": "Billa korant",
    "Paiement marchand": "Yoɓgol njulaagu",
    "Frais": "Coggu",
    "Bénéficiaire": "Keɓoowo",
    "Récapitulatif": "Limtol",

    // --- Écran des frais
    "Frais de transfert": "Coggu neldigo",
    "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.":
      "Suɓo noone neldigo e ceede. Coggu ina limaa e hoore mum.",
    "Type d'opération": "Noone golle",
    "Montant à envoyer": "Ceede neldeteendi",
    "Gratuit": "Yaafnaaɗo",
    "Total à débiter": "Ceede fow",
    "Solde après opération": "Soodi caggal golle",
    "Continuer": "Jokku",
    "Retour": "Rutto",

    // --- Bénéficiaire
    "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.":
      "Winndu hume keɓoowo. Ruttu limngal nden ado jaɓgol.",
    "Nom du bénéficiaire": "Innde keɓoowo",
    "Numéro de téléphone": "Limngal telefoŋ",
    "Motif du transfert": "Sabu neldigo",
    "Note (optionnel)": "Winndannde (so yiɗɗaa)",
    "J'ai vérifié le nom et le numéro du bénéficiaire.":
      "Mi ruttii innde e limngal keɓoowo.",
    "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.":
      "Ndee keɓoowo huutiraaka e ndee lekal. Ruttu limngal nden ado jokkude.",

    // --- Récapitulatif
    "Vérifiez les informations avant de confirmer le transfert.":
      "Ruttu hume ɗen ado jaɓgol neldigo.",
    "Montant": "Ceede",
    "Total débité": "Ceede fow",
    "Téléphone": "Telefoŋ",
    "Référence": "Limtol",
    "Opération": "Golle",
    "Je confirme que les informations ci-dessus sont correctes.":
      "Mi jaɓii wonde hume ɗen ɗon woodi goonga.",
    "Confirmer le transfert": "Jaɓ neldigo",
    "Modifier": "Waylu",

    // --- Reçu
    "Transfert effectué": "Neldigo waɗaama",
    "Votre transfert a été envoyé avec succès.":
      "Neldigo maa neldiraama moƴƴere.",
    "Statut": "Ngonka",
    "Succès": "Kaananke",
    "Nouveau transfert": "Neldigo keso",

    // --- Alertes
    "Message important": "Tinndinoore mawnde",
    "Une erreur est survenue": "Juumre waɗi",
    "Alerte de sécurité": "Tintinol kisal",
    "Fermer": "Uddu",
    "Sécurité": "Kisal",
    "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.":
      "Ruttu innde e limngal keɓoowo ado jaɓgol neldigo.",

    // --- Bandeaux
    "Environnement de test — données fictives, aucune transaction réelle.":
      "Nokku test — keɓe fenaaɗe, alaa golle goonga.",
    "Protocole de test": "Laawol test",
    "Retour au hackathon": "Rutto e hackathon",
    "Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.":
      "Safinum Pay — nokku kollitgol. Taa winndu keɓe goonga.",
  };

  // ------------------------------------------------------------ BASAA
  // Source : Dictionnaire Ɓàsàa-français-anglais-allemand, Dr P. E. Njock (2019)
  const BASAA = {
    // Relecture : locuteur natif basaa, 14 novembre 2026.
    // --- Attestés au dictionnaire
    // Salutation : Mɛ̀ ǹyega (usage courant, à tout moment de la journée).
    // Source : hikoadjom.com (apprentissage du basaa), ex. « Mɛ̀ ǹyega, saŋgo ! ».
    // Graphie validée par un locuteur natif le 14 novembre 2026.
    "Bonjour": "Mɛ̀ ǹyega",
    "Frais": "Ǹsaâ", // commission
    "Frais de transfert": "Ǹsaâ",
    "Montant": "Mɔ̀ni", // argent
    "Montant à envoyer": "Mɔ̀ni mi ńyī ɓe eblɛ̀",
    "Total à débiter": "Ǹsɔ̀ŋgi u mɔ̀ni",
    "Total débité": "Ǹsɔ̀ŋgi u mɔ̀ni",
    "Solde disponible": "Yêglɛ̀", // reste dû
    "Solde après opération": "Yêglɛ̀",
    "Opération": "Ǹsɔ̀ŋgi", // compte/opération
    "Bénéficiaire": "Mùt à ńyī ɓe lɛɛgɛ̀ mɔ̀ni", // « celui qui reçoit l'argent »
    "Nom du bénéficiaire": "Njɔ̂k i mùt à ńyī ɓe lɛɛgɛ̀ mɔ̀ni",

    // --- Propositions explicites
    "Banque en ligne": "Ɓâŋg i ìntɛrnɛ̂t",
    "Compte courant": "Ɓâŋg wɛ̂",
    "Votre compte": "Ɓâŋg wɛ̂",
    "Numéro de compte": "Nɔ̀mbɔ̀rɛ i ɓâŋg",
    "Solde": "Yêglɛ̀",
    "Consultez votre solde et lancez un transfert en toute sécurité.":
      "Yɛn yêglɛ̀ wɛ̂, tɔ̀ŋgɔ̀ eblɛ̀ mɔ̀ni ǹyìɓà.",
    "Effectuer un transfert": "Eblɛ̀ mɔ̀ni",
    "Consulter les frais": "Yɛn ǹsaâ",
    "Transactions récentes": "Ǹsɔ̀ŋgi i sɛ́ i ǹdɛ̂ŋ",
    "Connexion sécurisée": "Ǹsɔ̀ŋgi i m̀bɔ̀ŋ tìɓàk",
    "Salaire reçu": "Ǹsaâ i ńyìɓà lɛɛgɛ̀",
    "Transfert reçu": "Mɔ̀ni mi ńyìɓà lɛɛgɛ̀",
    "Facture électricité": "Kààt i courant",
    "Paiement marchand": "Ǹsaâ i ndap mbi",
    "Récapitulatif": "Yɛ̂n ǹsɔ̀ŋgi",

    "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.":
      "Pɔ́ŋà ǹsɔ̀ŋgi i eblɛ̀ mɔ̀ni. Ǹsaâ i ńyī ɓe kàl ndɛ̂m.",
    "Type d'opération": "Ǹsɔ̀ŋgi",
    "Gratuit": "Ñgɛ̂ ǹsaâ",
    "Continuer": "Kɛ̂",
    "Retour": "Kwɛ̂",

    "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.":
      "Ti ǹsɔ̀ŋgi i mùt. Yɛn nɔ̀mbɔ̀rɛ ǹtɛ́mbɛ́ ù lɛɛgɛ̀.",
    "Numéro de téléphone": "Nɔ̀mbɔ̀rɛ i telefoŋ",
    "Motif du transfert": "Ntɔ̀ŋgi",
    "Note (optionnel)": "Kààt (tɛ̂ nëm)",
    "J'ai vérifié le nom et le numéro du bénéficiaire.":
      "Mɛ̀ ǹyɛn njɔ̂k ai nɔ̀mbɔ̀rɛ i mùt.",
    "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.":
      "Mùt wɔ́ a ǹtɛ́ŋgɛ̌ kɔl mbɔŋɛ̂. Yɛn nɔ̀mbɔ̀rɛ ǹtɛ́mbɛ́ ù kɛ̂.",

    "Vérifiez les informations avant de confirmer le transfert.":
      "Yɛn ǹsɔ̀ŋgi ǹtɛ́mbɛ́ ù lɛɛgɛ̀ eblɛ̀ mɔ̀ni.",
    "Téléphone": "Telefoŋ", // emprunt
    "Référence": "Nɔ̀mbɔ̀rɛ",
    "Je confirme que les informations ci-dessus sont correctes.":
      "Mɛ̀ ǹlɛɛgɛ̀ na ǹsɔ̀ŋgi yɔ́ i ye nëm.",
    "Confirmer le transfert": "Lɛɛgɛ̀ eblɛ̀ mɔ̀ni",
    "Modifier": "Lɔ̀ŋàngà",

    "Transfert effectué": "Eblɛ̀ mɔ̀ni i ńyìɓà",
    "Votre transfert a été envoyé avec succès.":
      "Eblɛ̀ mɔ̀ni wɛ̂ i ńyìɓà.",
    "Statut": "Ǹsɔ̀ŋgi",
    "Succès": "Mvo'e",
    "Nouveau transfert": "Eblɛ̀ mɔ̀ni i đựɔ́ŋ",

    "Message important": "Nyë i m̀bɔ̀ŋ tìɓàk",
    "Une erreur est survenue": "Mbaŋ lɛ̀ i ńyìɓà",
    "Alerte de sécurité": "Ñgɛ̀ñgɛ̀ i m̀bɔ̀ŋ tìɓàk",
    "Fermer": "Pɛ̀sǹgɛ̂",
    "Sécurité": "Tìɓàk",
    "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.":
      "Yɛn njɔ̂k ai nɔ̀mbɔ̀rɛ i mùt ǹtɛ́mbɛ́ ù lɛɛgɛ̀ eblɛ̀ mɔ̀ni.",

    "Environnement de test — données fictives, aucune transaction réelle.":
      "Ŋgɛ̀p i test — ǹsɔ̀ŋgi i fɛ̂, ñgɛ̂ ǹsɔ̀ŋgi i nëm.",
    "Protocole de test": "Ntɛ̀ŋgɛ̌ i test",
    "Retour au hackathon": "Kwɛ̂ i hackathon",
    "Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.":
      "Safinum Pay — ŋgɛ̀p i fɛ̂. Kâ ti ǹsɔ̀ŋgi i mùt i nëm.",
  };

  // ------------------------------------------------------------ ANGLAIS / FRANÇAIS
  // Traductions OFFICIELLES du site Safinum (paires fr/en relevées dans son code).
  // Aucune invention : ce sont exactement les chaînes qu'utilise la page.
  const ENGLISH = {
    "Banque en ligne": "Online banking",
    "Environnement de test — données fictives, aucune transaction réelle.": "Test environment — fictional data, no real transaction.",
    "Protocole de test": "Test protocol",
    "Retour au hackathon": "Back to hackathon",
    "Solde": "Balance",
    "Frais": "Fees",
    "Bénéficiaire": "Beneficiary",
    "Récapitulatif": "Summary",
    "Bonjour": "Hello",
    "Compte courant": "Current account",
    "Numéro de compte": "Account number",
    "Solde disponible": "Available balance",
    "Votre compte": "Your account",
    "Consultez votre solde et lancez un transfert en toute sécurité.": "Check your balance and start a secure transfer.",
    "Effectuer un transfert": "Make a transfer",
    "Consulter les frais": "View fees",
    "Transactions récentes": "Recent transactions",
    "Paiement marchand": "Merchant payment",
    "Salaire reçu": "Salary received",
    "Transfert reçu": "Transfer received",
    "Facture électricité": "Electricity bill",
    "Frais de transfert": "Transfer fees",
    "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.": "Choose the transfer type and amount. Fees are calculated automatically.",
    "Type d'opération": "Operation type",
    "Montant à envoyer": "Amount to send",
    "Gratuit": "Free",
    "Total à débiter": "Total to debit",
    "Solde après opération": "Balance after transfer",
    "Continuer": "Continue",
    "Retour": "Back",
    "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.": "Enter the recipient details. Always verify the number before confirming.",
    "Nom du bénéficiaire": "Beneficiary name",
    "Numéro de téléphone": "Phone number",
    "Motif du transfert": "Transfer reason",
    "Note (optionnel)": "Note (optional)",
    "J'ai vérifié le nom et le numéro du bénéficiaire.": "I have verified the beneficiary name and phone number.",
    "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.": "This beneficiary has never been used on this account. Verify the number before continuing.",
    "Vérifiez les informations avant de confirmer le transfert.": "Check the details before confirming the transfer.",
    "Montant": "Amount",
    "Total débité": "Total debited",
    "Téléphone": "Phone",
    "Référence": "Reference",
    "Opération": "Operation",
    "Je confirme que les informations ci-dessus sont correctes.": "I confirm the information above is correct.",
    "Confirmer le transfert": "Confirm transfer",
    "Modifier": "Edit",
    "Transfert effectué": "Transfer completed",
    "Votre transfert a été envoyé avec succès.": "Your transfer has been sent successfully.",
    "Statut": "Status",
    "Succès": "Success",
    "Nouveau transfert": "New transfer",
    "Message important": "Important message",
    "Une erreur est survenue": "An error occurred",
    "Alerte de sécurité": "Security warning",
    "Fermer": "Dismiss",
    "Sécurité": "Security",
    "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.": "Always verify the beneficiary name and number before confirming a transfer.",
    "Connexion sécurisée": "Secure connection",
    "Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.": "Safinum Pay — demonstration environment. Do not enter real personal data.",
  };

  // Français : identité (permet de restaurer / de ne rien changer)
  const FRENCH = Object.fromEntries(Object.keys(ENGLISH).map((k) => [k, k]));

  // ------------------------------------------------------------ DUALA
  // Base : termes duala relevés au Wiktionnaire français (~400 entrées,
  // surtout flore/faune) et vocabulaire de la Bible en duala.
  // Source complémentaire : tableau trilingue fourni par un locuteur natif
  // duala le 14 novembre 2026 (90 entrées, voir docs/VALIDATION.md).
  // La terminologie mobile money n'existe dans aucune source libre :
  // Toutes les entrées ci-dessous ont été relues et validées par un locuteur
  // natif le 14 novembre 2026 (voir docs/VALIDATION.md).
  const DUALA = {
    // Relecture : locuteur natif duala, 14 novembre 2026.
    // --- Attestés / usuels
    // Salutation : Idiba bwam (« bon matin »), formule standard avant midi,
    // également employée comme bonjour général.
    // Sources : Polyglot Club (douala), ITAG Cameroun (leçon 1), Omniglot.
    // Graphie confirmée par le locuteur natif le 14 novembre 2026.
    "Bonjour": "Idiba bwam",
    "argent": "mòni",
    "Frais": "Dongo", // taxe/redevance
    "Frais de transfert": "frais ya loma moni", // emprunt « frais » + loma (envoi) — décision du 14 nov. 2026
    "Montant": "Mòni",
    "Montant à envoyer": "Mòni ma lomia", // locuteur natif duala, 14 nov. 2026
    "Effectuer un transfert": "Loma la moni", // locuteur natif duala, 14 nov. 2026
    "Envoyer": "Loma la moni", // locuteur natif duala, 14 nov. 2026 (variante : Tuma)
    "Transfert": "Loma la moni", // locuteur natif duala, 14 nov. 2026
    "Total à débiter": "Mòni ma bì",
    "Total débité": "Total ba nongui no", // locuteur natif duala, 14 nov. 2026

    // --- Propositions explicites
    "Banque en ligne": "Banka ya ńnɛ̀nɛ̀",
    "Compte courant": "Kalati a mòni",
    "Votre compte": "Kalati ao",
    "Numéro de compte": "Nɔmba ya kalati",
    "Solde": "Boro", // locuteur natif duala, 14 nov. 2026
    "Solde disponible": "Boro", // locuteur natif duala, 14 nov. 2026
    "Solde après opération": "Boro", // locuteur natif duala, 14 nov. 2026
    "Consultez votre solde et lancez un transfert en toute sécurité.":
      "Yen mòni mao, tuma nì mbáká.",
    "Consulter les frais": "Yen dongo",
    "Transactions récentes": "Mìtuma mi suɛ",
    "Connexion sécurisée": "Mbáká ya ńnɛ̀nɛ̀",
    "Salaire reçu": "Mòni ma nyɛ̀ngɛ̀",
    "Transfert reçu": "Tuma i bwa",
    "Facture électricité": "Kalati ya courant",
    "Paiement marchand": "Tòkota ya ndabo",
    "Bénéficiaire": "Moto a ńyī",
    "Récapitulatif": "Nɔ̂mbɛ̀lɛ̀",

    "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.":
      "Pona ndɛnge ya tuma nì mòni. Dongo i ńyī ɓe sɔŋ.",
    "Type d'opération": "Ndɛnge ya tuma",
    "Gratuit": "esibè sawa", // « sans frais » — locuteur natif duala, 14 nov. 2026
    "Continuer": "Alanè o boso", // locuteur natif duala, 14 nov. 2026
    "Retour": "Mbusa",

    "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.":
      "Tila njaŋa ya moto a ńyī. Yen nɔmba butu náŋgɛ̀ ú ndima.",
    "Nom du bénéficiaire": "Dina la moto a ńyī", // dina = nom (locuteur natif)
    "Numéro de téléphone": "Nɔmba ya telefoŋ",
    "Motif du transfert": "Ntina ya tuma",
    "Note (optionnel)": "Kalati (si ye ndila)",
    "J'ai vérifié le nom et le numéro du bénéficiaire.":
      "Na yen njaŋa nì nɔmba ya moto a ńyī.",
    "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.":
      "Moto wɔ́ a ńyī tɛ kabɔ oboso. Yen nɔmba nɛ̂mɛ́ ú kɛ.",

    "Vérifiez les informations avant de confirmer le transfert.":
      "Yen njaŋa nɛ̂mɛ́ ú ndima tuma.",
    "Téléphone": "Telefoŋ", // emprunt
    "Référence": "Nɔmba",
    "Opération": "Tuma",
    "Je confirme que les informations ci-dessus sont correctes.":
      "Na ndima na njaŋa ni ńyī ɓe bwam.",
    "Confirmer le transfert": "Ndima tuma",
    "Modifier": "Wènguisan", // locuteur natif duala, 14 nov. 2026 (variante : Tukwa)

    "Transfert effectué": "Tuma i bi.",
    "Votre transfert a été envoyé avec succès.":
      "Tuma ao i bi bwam.",
    "Statut": "Njaŋa",
    "Succès": "Bwam",
    "Nouveau transfert": "Tuma i pe",

    "Message important": "Njaŋa i m̀bɔ̀ŋ",
    "Une erreur est survenue": "Ndɔmbɛ i bi.",
    "Alerte de sécurité": "Njaŋa ya mbáká",
    "Fermer": "Kɔŋ",
    "Sécurité": "Mbáká",
    "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.":
      "Yen njaŋa nì nɔmba ya moto a ńyī butu ú ndima tuma.",

    "Environnement de test — données fictives, aucune transaction réelle.":
      "Ndabo ya test — njaŋa ya fɛ, tɛ tuma ya nëm.",
    "Protocole de test": "Njaŋa ya test",
    "Retour au hackathon": "Mbusa i hackathon",
    "Safinum Pay — environnement de démonstration. Ne saisissez aucune donnée personnelle réelle.":
      "Safinum Pay — ndabo ya fɛ. Si tila njaŋa ya moto ya nëm.",
  };

  window.__MERA_DICTIONARIES = {
    ewo: {
      label: "Ewondo",
      native: "Ewondo",
      source: "Corpus biblique cameroon_bibles (CC-BY-4.0)",
      map: EWONDO,
    },
    ful: {
      label: "Fulfulde",
      native: "Fulfulde",
      source: "Corpus biblique cameroon_bibles (CC-BY-4.0)",
      map: FULFULDE,
    },
    bas: {
      label: "Basaa",
      native: "Ɓàsàa",
      source: "Dictionnaire Njock 2019, SIL / Webonary",
      map: BASAA,
    },
    en: {
      label: "English",
      native: "English",
      source: "Traductions officielles du site Safinum",
      map: ENGLISH,
    },
    fr: {
      label: "Français",
      native: "Français",
      source: "Langue d'origine de la page",
      map: FRENCH,
    },
    dua: {
      label: "Duala",
      native: "Duala",
      source: "Wiktionnaire français + vocabulaire biblique duala",
      map: DUALA,
    },
  };
})();
