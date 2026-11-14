/**
 * guard.js — Garde-fou financier.
 *
 * RÈGLE ABSOLUE : l'extension ne traduit JAMAIS une valeur financière,
 * un numéro, une référence, une date ou une donnée saisie par l'utilisateur.
 *
 * Ce module est chargé AVANT content.js dans le manifest.
 * Il expose window.__MERA_GUARD.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------- détection

  /**
   * Un texte est-il « protégé » (à ne jamais traduire) ?
   * @param {string} text
   * @returns {boolean}
   */
  function isProtected(text) {
    if (typeof text !== "string") return true;

    const t = text.trim();
    if (t === "") return true;

    // 1. Contient un chiffre → on protège par défaut.
    //    (montants, numéros, dates, références, codes)
    if (/[0-9]/.test(t)) return true;

    // 2. Devise explicite même sans chiffre (« FCFA »)
    if (/\b(XAF|FCFA|F\s?CFA|EUR|USD)\b/i.test(t)) return true;

    // 3. Numéro de téléphone / compte : symboles d'un numéro
    if (/[+()]/.test(t)) return true;

    // 4. Référence type « SNF-XXXX », « TRX-... », code en majuscules
    if (/\b[A-Z]{2,}[-_][A-Z0-9]{2,}\b/.test(t)) return true;

    // 5. Date
    if (/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/.test(t)) return true;

    // 6. Pourcentage
    if (t.includes("%")) return true;

    // 7. Email / URL
    if (/@|https?:\/\//.test(t)) return true;

    return false;
  }

  /**
   * Un nœud est-il dans une zone où l'utilisateur saisit des données ?
   * (input, textarea, select, contenteditable)
   * @param {Node|null} node
   * @returns {boolean}
   */
  function isUserInput(node) {
    let el = node instanceof Element ? node : node && node.parentElement;
    while (el) {
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      el = el.parentElement;
    }
    return false;
  }

  /**
   * Cet élément doit-il être ignoré par la traduction ?
   * @param {Element} el
   * @returns {boolean}
   */
  function isIgnoredElement(el) {
    if (!el || el.nodeType !== 1) return true;

    const tag = el.tagName;
    // Ne jamais toucher au code, au style, aux scripts, aux champs techniques
    if (
      tag === "SCRIPT" ||
      tag === "STYLE" ||
      tag === "NOSCRIPT" ||
      tag === "CODE" ||
      tag === "PRE" ||
      tag === "SVG" ||
      tag === "CANVAS" ||
      tag === "IFRAME" ||
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    ) {
      return true;
    }

    if (el.isContentEditable) return true;
    if (el.getAttribute("data-mera-skip") === "1") return true;
    if (el.getAttribute("aria-hidden") === "true") return true;

    return false;
  }

  /**
   * Un texte est-il déjà traduit ? (évite la double traduction)
   * @param {Element} el
   * @returns {boolean}
   */
  function isAlreadyTranslated(el) {
    return el.getAttribute("data-mera-translated") === "1";
  }

  window.__MERA_GUARD = {
    isProtected,
    isUserInput,
    isIgnoredElement,
    isAlreadyTranslated,
    PROTECTED_ATTR: "data-mera-skip",
    TRANSLATED_ATTR: "data-mera-translated",
  };
})();
