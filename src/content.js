/**
 * content.js — Moteur de traduction de l'environnement Safinum.
 *
 * Contraintes réelles du site (relevées dans son code source) :
 *   • Les textes sont COMPOSÉS : "Bonjour, Amina", "Numéro de compte : SNF-…",
 *     "Continuer →". Une correspondance exacte échoue.
 *   • Le site est une application React : le contenu apparaît après le chargement.
 *   • Certains blocs ont des classes `dark:` : le thème peut changer.
 *
 * Stratégie :
 *   1. Remplacements de SOUS-CHAÎNES connues (du plus long au plus court)
 *   2. Protection absolue des nombres au niveau du sous-segment
 *   3. Observation du DOM + passes différées pour le rendu React
 */
(function () {
  "use strict";

  // Anti double-injection : le popup peut réinjecter les scripts en secours.
  // Sans ce garde, deux instances se disputent les mêmes nœuds et l'une
  // restaure une langue déjà traduite (ex. salutation figée en basaa).
  const VERSION = "1.2.2";
  // Déjà chargé (même version) ou version obsolète sur la page : dans les deux
  // cas on ne crée pas une seconde instance. Le popup recharge la page si la
  // version diffère, ce qui recharge le script déclaré dans le manifest.
  if (window.__MERA) return;

  const GUARD = window.__MERA_GUARD;
  const DICTS = window.__MERA_DICTIONARIES;

  if (!GUARD || !DICTS) {
    console.warn("[MERA] modules manquants");
    return;
  }

  const state = {
    language: null,
    active: false,
    stats: { translated: 0, protected: 0, skipped: 0 },
    observer: null,
    originals: new Map(), // node -> texte d'origine
    attrOriginals: new Map(), // element -> {attr: valeur}
    timers: [],
  };

  // ------------------------------------------------------------------ dictionnaire indexé

  let INDEX = null; // { sorted, byLower }
  let INVERSE = null; // traduction (minuscule) -> français
  let INVERSE_SORTED = null; // mêmes entrées, plus longues d'abord

  function buildIndex(code) {
    const map = DICTS[code].map;
    const sorted = Object.keys(map)
      .map((k) => ({ key: k, keyLower: k.toLowerCase(), value: map[k] }))
      .sort((a, b) => b.key.length - a.key.length); // plus longs d'abord
    const byLower = new Map();
    sorted.forEach((e) => byLower.set(e.keyLower, e.value));
    INDEX = { sorted, byLower };

    // Table inverse : toute traduction connue -> son texte français.
    // Construite sur toutes les langues, pour revenir au français même si
    // l'extension a été rechargée et a perdu sa mémoire.
    const inv = new Map();
    const frMap = DICTS.fr.map;
    Object.keys(DICTS).forEach((c) => {
      if (c === "fr") return;
      const tmap = DICTS[c].map;
      Object.keys(frMap).forEach((key) => {
        const tr = tmap[key];
        if (tr && tr !== frMap[key] && tr.length >= 3) {
          inv.set(tr.toLowerCase(), frMap[key]);
        }
      });
    });
    // Anciennes traductions retirées des dictionnaires. Une page encore
    // affichée avec une version précédente doit pouvoir revenir au français.
    const LEGACY = { mbolo: "Bonjour" };
    Object.keys(LEGACY).forEach((k) => {
      if (!inv.has(k)) inv.set(k, LEGACY[k]);
    });

    INVERSE = inv;
    INVERSE_SORTED = Array.from(inv.entries())
      .map(([tr, fr]) => ({ key: tr, fr }))
      .filter((e) => e.key.length >= 3)
      .sort((a, b) => b.key.length - a.key.length);
  }

  /** Le texte ressemble-t-il à du français d'origine (clé connue) ? */
  function isFrench(text) {
    if (!INDEX) return true;
    const t = text.trim().toLowerCase();
    if (INDEX.byLower.has(t)) return true;
    if (!INVERSE) return true;
    return !INVERSE.has(t);
  }

  /** Retrouve le français d'un texte déjà traduit, ou null. */
  function toFrench(text) {
    if (!INVERSE) return null;
    const t = text.trim();
    const hit = INVERSE.get(t.toLowerCase());
    if (!hit) return null;
    const lead = text.match(/^\s*/)[0];
    const trail = text.match(/\s*$/)[0];
    return lead + hit + trail;
  }

  /**
   * Retrouve le français même dans un texte COMPOSÉ
   * (« Mɛ̀ ǹyega, Amina » → « Bonjour, Amina »).
   * Indispensable au changement de langue : la salutation contient un prénom
   * variable, donc elle n'existe jamais comme clé exacte dans la table inverse.
   */
  function toFrenchComposed(text) {
    if (!INVERSE_SORTED || !INVERSE_SORTED.length) return null;
    let out = text;
    let changed = false;
    const lower = () => out.toLowerCase();

    for (const entry of INVERSE_SORTED) {
      if (!lower().includes(entry.key)) continue;
      const re = new RegExp(escapeRe(entry.key), "gi");
      out = out.replace(re, () => entry.fr);
      changed = true;
    }
    return changed ? out : null;
  }

  // ------------------------------------------------------------------ traduction

  /**
   * Traduit un texte pouvant contenir plusieurs segments.
   * Les nombres et devises restent intacts.
   */
  function translateText(text) {
    if (!text) return { out: text, changed: false };
    if (!INDEX) return { out: text, changed: false };

    // Texte entièrement protégé (montant, date, référence) → on ne touche à rien.
    // Mais un texte MIXTE ("Numéro de compte : SNF-2026-0001") doit pouvoir
    // traduire le libellé tout en conservant la valeur : on continue alors.
    const fullyProtected = GUARD.isProtected(text.trim());
    if (fullyProtected) {
      // Autoriser le cas d'un libellé suivi d'une valeur (contient « : »)
      if (!/[A-Za-zÀ-ÿ]{4}/.test(text) || !text.includes(":")) {
        return { out: text, changed: false };
      }
    }

    // 1) Correspondance exacte insensible à la casse
    const trimmed = text.trim();
    const exact = INDEX.byLower.get(trimmed.toLowerCase());
    if (exact !== undefined) {
      const lead = text.match(/^\s*/)[0];
      const trail = text.match(/\s*$/)[0];
      return { out: lead + exact + trail, changed: true };
    }

    // 2) Remplacement de sous-chaînes, du plus long au plus court
    let out = text;
    let changed = false;

    // On découpe en fragments pour ne jamais franchir un nombre
    for (const entry of INDEX.sorted) {
      if (entry.key.length < 4) continue; // évite les faux positifs sur les mots courts
      if (!new RegExp(escapeRe(entry.key), "i").test(out)) continue;

      // remplacement insensible à la casse
      const re = new RegExp(escapeRe(entry.key), "gi");
      out = out.replace(re, () => entry.value);
      changed = true;
    }

    if (!changed) return { out: text, changed: false };

    // Sécurité finale : si le texte contenait un nombre et qu'il a disparu ou changé,
    // on restaure l'original. C'est le filet de sécurité ultime.
    const before = extractNumbers(text);
    const after = extractNumbers(out);
    if (before.length && before.join("|") !== after.join("|")) {
      return { out: text, changed: false };
    }

    return { out, changed };
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function extractNumbers(s) {
    return (s.match(/[0-9]+(?:[.,\s][0-9]+)*/g) || []).map((n) => n.replace(/\s/g, ""));
  }

  // ------------------------------------------------------------------ DOM

  function translateNode(node) {
    const value = node.nodeValue;
    if (!value || !value.trim()) return;

    const parent = node.parentElement;
    if (!parent) return;
    if (GUARD.isIgnoredElement(parent) || GUARD.isUserInput(node)) {
      state.stats.skipped++;
      return;
    }

    // Déjà traduit lors d'une passe précédente : on ne retraduit pas,
    // on compte simplement (évite de remettre le compteur à zéro).
    if (state.originals.has(node) && state.originals.get(node) !== value) {
      state.stats.translated++;
      return;
    }

    // Le texte affiché n'est plus du français (page déjà traduite, extension
    // rechargée, changement de langue) : on retrouve le français d'origine
    // avant de retraduire — y compris dans les textes composés.
    let source = value;
    const composed = toFrenchComposed(value);
    if (composed !== null) {
      source = composed;
    } else if (!isFrench(value)) {
      const fr = toFrench(value);
      if (fr === null) return; // traduction inconnue : on laisse tel quel
      source = fr;
    }

    const { out, changed } = translateText(source);
    if (!changed || out === value) {
      if (source !== value) state.stats.translated++;
      return;
    }

    if (!state.originals.has(node)) state.originals.set(node, source);
    node.nodeValue = out;
    state.stats.translated++;
    try {
      parent.setAttribute(GUARD.TRANSLATED_ATTR, "1");
    } catch (e) {
      /* ignore */
    }
  }

  /**
   * Construit la table inverse : traduction → français.
   * Permet de revenir au français même si l'extension a perdu sa mémoire
   * (rechargement), car le dictionnaire français est toujours disponible.
   */
  function buildInverse(code) {
    const frMap = DICTS.fr ? DICTS.fr.map : null;
    if (!frMap) return new Map();
    const inv = new Map();
    const target = DICTS[code].map;
    Object.keys(frMap).forEach((fr) => {
      const tr = target[fr];
      if (tr && tr !== fr) inv.set(tr.toLowerCase(), fr);
    });
    return inv;
  }

  function walk(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      translateNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) {
      if (GUARD.isIgnoredElement(root)) return;
      translateAttributes(root);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(translateNode);

    if (root.querySelectorAll) {
      root
        .querySelectorAll("[placeholder],[title],[aria-label],[alt]")
        .forEach(translateAttributes);
    }
  }

  function translateAttributes(el) {
    if (!el || el.nodeType !== 1 || GUARD.isIgnoredElement(el)) return;

    ["placeholder", "title", "aria-label", "alt"].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value || !value.trim()) return;
      if (GUARD.isProtected(value)) return;

      const composed = toFrenchComposed(value);
      const source = composed !== null ? composed : value;
      const { out, changed } = translateText(source);
      if (!changed || out === value) return;

      if (!state.attrOriginals.has(el)) state.attrOriginals.set(el, {});
      const store = state.attrOriginals.get(el);
      if (store[attr] === undefined) store[attr] = source;
      el.setAttribute(attr, out);
      state.stats.translated++;
    });
  }

  // ------------------------------------------------------------------ cycle de vie

  let walking = false;

  function translateAll() {
    if (!state.active || walking) return;
    walking = true;
    try {
      state.stats = { translated: 0, protected: 0, skipped: 0 };
      walk(document.body);
    } finally {
      walking = false;
    }
    notify();
  }

  function restore() {
    clearTimers();
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    state.originals.forEach((original, node) => {
      try {
        node.nodeValue = original;
      } catch (e) {
        /* nœud supprimé */
      }
    });
    state.attrOriginals.forEach((store, el) => {
      Object.keys(store).forEach((attr) => {
        try {
          el.setAttribute(attr, store[attr]);
        } catch (e) {
          /* ignore */
        }
      });
    });
    document.querySelectorAll("[" + GUARD.TRANSLATED_ATTR + "]").forEach((el) => {
      el.removeAttribute(GUARD.TRANSLATED_ATTR);
    });

    state.originals = new Map();
    state.attrOriginals = new Map();
    state.stats = { translated: 0, protected: 0, skipped: 0 };
    state.active = false;
  }

  function startObserver() {
    if (state.observer) state.observer.disconnect();

    let scheduled = false;
    state.observer = new MutationObserver(() => {
      if (scheduled || !state.active) return;
      scheduled = true;
      // On regroupe les mutations : évite de figer la page
      requestAnimationFrame(() => {
        scheduled = false;
        if (state.active) {
          walk(document.body);
          notify();
        }
      });
    });

    state.observer.observe(document.body, { childList: true, subtree: true });
  }

  function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function notify() {
    try {
      // Callback obligatoire : sans destinataire (popup fermé), Chrome logue
      // « Unchecked runtime.lastError: Could not establish connection ».
      chrome.runtime.sendMessage(
        {
          type: "MERA_STATS",
          stats: state.stats,
          language: state.language,
          active: state.active,
        },
        () => {
          void chrome.runtime.lastError; // lu volontairement, donc pas d'erreur
        },
      );
    } catch (e) {
      /* popup fermé */
    }
  }

  function activate(code) {
    if (!DICTS[code]) return false;
    restore();
    state.language = code;
    state.active = true;
    buildIndex(code);

    translateAll();
    startObserver();

    // React affiche son contenu en plusieurs fois : on repasse.
    clearTimers();
    [200, 500, 1000, 2000, 3500].forEach((d) => {
      state.timers.push(
        setTimeout(() => {
          if (state.active) translateAll();
        }, d),
      );
    });
    return true;
  }

  // ------------------------------------------------------------------ messages

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || !msg.type) return;

    if (msg.type === "MERA_ACTIVATE") {
      const ok = activate(msg.language);
      sendResponse({ ok, version: VERSION, stats: state.stats });
    } else if (msg.type === "MERA_DEACTIVATE") {
      restore();
      notify();
      sendResponse({ ok: true, version: VERSION });
    } else if (msg.type === "MERA_STATUS") {
      // Les compteurs sont maintenus à jour par translateAll() et l'observateur.
      sendResponse({
        active: state.active,
        language: state.language,
        stats: state.stats,
        available: Object.keys(DICTS),
        version: VERSION,
      });
    }
    return true;
  });

  // ------------------------------------------------------------------ démarrage

  // Pas de traduction automatique au chargement : c'est l'utilisateur qui
  // choisit la langue dans le popup. Cela évite qu'une langue mémorisée
  // (ex. fulfulde) bloque la page au rechargement.

  // Aide au diagnostic dans la console
  window.__MERA = {
    version: VERSION,
    activate,
    deactivate: restore,
    translateText,
    test: (t) => translateText(t),
    languages: () => Object.keys(DICTS),
    stats: () => ({
      translated: state.stats.translated,
      protected: state.stats.protected,
      skipped: state.stats.skipped,
      activated: Object.keys(DICTS).length,
      language: state.language,
      active: state.active,
    }),
    loaded: true,
  };
})();
