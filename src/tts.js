/**
 * tts.js — Lecture vocale (Text-to-Speech).
 *
 * Module INDÉPENDANT : il n'altère pas le moteur de traduction.
 * Il expose window.__MERA_TTS, appelable depuis le popup.
 *
 * IMPORTANT — limite technique assumée :
 *   Les navigateurs ne fournissent aucune voix pour l'ewondo, le fulfulde,
 *   le basaa ou le duala. La synthèse utilise donc une voix française pour
 *   prononcer les mots locaux : l'API lit les lettres latines à la française.
 *   Ce n'est pas une prononciation authentique. Un moteur TTS spécialisé
 *   (ex. Vambo AI pour le duala) est nécessaire pour aller plus loin.
 *
 * Aucune donnée n'est envoyée hors de la page.
 */
(function () {
  "use strict";

  if (window.__MERA_TTS) return; // déjà chargé

  const SUPPORTED =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function";

  const state = {
    speaking: false,
    lastText: "",
  };

  // ---------------------------------------------------------------- voix

  /**
   * Choisit la meilleure voix disponible.
   * Les langues camerounaises n'ont pas de voix : on prend une française,
   * qui prononce correctement les lettres diacritiques (ɛ, ɔ, ŋ, ɓ, ɗ).
   */
  let cachedVoices = [];

  /** Rafraîchit la liste des voix (Chrome les charge de façon asynchrone). */
  function refreshVoices() {
    if (!SUPPORTED) return [];
    const v = window.speechSynthesis.getVoices();
    if (v && v.length) cachedVoices = Array.from(v);
    return cachedVoices;
  }

  function pickVoice(langHint) {
    if (!SUPPORTED) return null;
    const voices = cachedVoices.length ? cachedVoices : refreshVoices();
    if (!voices || !voices.length) return null;

    const hint = (langHint || "fr").toLowerCase().slice(0, 2);

    // Priorité : la langue demandée, puis le français, puis la voix par défaut
    const preferred = [
      (v) => v.lang && v.lang.toLowerCase().startsWith(hint) && /Google|Natural|Premium/i.test(v.name),
      (v) => v.lang && v.lang.toLowerCase().startsWith(hint),
      (v) => v.lang === "fr-FR",
      (v) => v.lang && v.lang.toLowerCase().startsWith("fr"),
      (v) => v.lang === "en-US",
      (v) => v.lang && v.lang.toLowerCase().startsWith("en"),
      (v) => v.default,
      () => true,
    ];
    for (const test of preferred) {
      const found = voices.find(test);
      if (found) return found;
    }
    return voices[0];
  }

  // Chrome charge les voix après le premier appel : on les écoute.
  if (SUPPORTED && typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
    window.speechSynthesis.onvoiceschanged = () => refreshVoices();
  }
  if (SUPPORTED) {
    // Certaines versions n'émettent pas l'événement : on rafraîchit au démarrage.
    setTimeout(refreshVoices, 100);
    setTimeout(refreshVoices, 800);
  }

  // ---------------------------------------------------------------- lecture

  /**
   * Lit un texte à voix haute.
   * @param {string} text
   * @param {{rate?: number, onState?: Function}} options
   * @returns {boolean} false si non supporté
   */
  function speak(text, options) {
    if (!SUPPORTED) return false;
    const t = (text || "").trim();
    if (!t) return false;

    // Aucune voix installée : le navigateur resterait muet sans prévenir.
    const available = cachedVoices.length ? cachedVoices : refreshVoices();
    if (!available.length) {
      if (options && typeof options.onState === "function") {
        options.onState({
          speaking: false,
          text: t,
          error: "no_voice",
          message:
            "Aucune voix installée sur ce système. Installez espeak-ng, puis redémarrez le navigateur.",
        });
      }
      return false;
    }

    window.speechSynthesis.cancel(); // coupe une lecture en cours

    const u = new window.SpeechSynthesisUtterance(t);
    const voice = pickVoice(options && options.langHint);
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || "fr-FR";
    u.rate = options && options.rate ? options.rate : 0.95;
    u.pitch = 1;

    state.speaking = true;
    state.lastText = t;

    const notify = (extra) => {
      if (options && typeof options.onState === "function") {
        options.onState(Object.assign({ speaking: state.speaking, text: state.lastText }, extra || {}));
      }
    };

    u.onstart = () => {
      state.speaking = true;
      notify();
    };
    u.onend = () => {
      state.speaking = false;
      notify();
    };
    u.onerror = (ev) => {
      state.speaking = false;
      notify({
        error: (ev && ev.error) || "error",
        message: "La lecture a échoué (" + ((ev && ev.error) || "erreur inconnue") + ").",
      });
    };

    window.speechSynthesis.speak(u);
    return true;
  }

  function stop() {
    if (!SUPPORTED) return;
    window.speechSynthesis.cancel();
    state.speaking = false;
  }

  /** Liste des voix réellement installées (utile pour la documentation). */
  function voices() {
    if (!SUPPORTED) return [];
    return window.speechSynthesis.getVoices().map((v) => ({ name: v.name, lang: v.lang }));
  }

  // ---------------------------------------------------------------- panneau

  /**
   * Affiche un panneau flottant « Écouter » en bas à droite de la page.
   * N'interfère pas avec la mise en page du site (position: fixed, z-index élevé).
   */
  function showPanel(text) {
    let panel = document.getElementById("mera-tts-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "mera-tts-panel";
      panel.setAttribute("data-mera-skip", "1"); // le moteur ne traduit pas ce panneau
      panel.style.cssText = [
        "position:fixed",
        "right:18px",
        "bottom:18px",
        "z-index:2147483647",
        "background:#0A1F6B",
        "color:#fff",
        "border-radius:14px",
        "padding:12px 14px",
        "font:600 12px/1.45 system-ui,-apple-system,Segoe UI,sans-serif",
        "box-shadow:0 10px 30px rgba(10,31,107,.35)",
        "max-width:300px",
        "display:flex",
        "gap:10px",
        "align-items:center",
      ].join(";");

      const btn = document.createElement("button");
      btn.id = "mera-tts-play";
      btn.textContent = "🔊 Écouter";
      btn.style.cssText = [
        "background:#1D4ED8",
        "color:#fff",
        "border:0",
        "border-radius:9px",
        "padding:8px 12px",
        "font:700 12px system-ui,sans-serif",
        "cursor:pointer",
        "white-space:nowrap",
      ].join(";");

      const close = document.createElement("button");
      close.textContent = "✕";
      close.style.cssText = [
        "background:transparent",
        "color:#ffffffb0",
        "border:0",
        "font:700 13px system-ui,sans-serif",
        "cursor:pointer",
        "padding:2px 4px",
      ].join(";");
      close.onclick = () => {
        stop();
        panel.remove();
      };

      const label = document.createElement("span");
      label.id = "mera-tts-label";
      label.style.cssText = "color:#ffffffc8;font-weight:500";

      btn.onclick = () => {
        const current = label.textContent || text;
        if (state.speaking) {
          stop();
          btn.textContent = "🔊 Écouter";
          return;
        }
        btn.textContent = "⏹ Stop";
        speak(current, {
          onState: (s) => {
            btn.textContent = s.speaking ? "⏹ Stop" : "🔊 Écouter";
          },
        });
      };

      panel.appendChild(btn);
      panel.appendChild(label);
      panel.appendChild(close);
      document.body.appendChild(panel);
    }

    const label = panel.querySelector("#mera-tts-label");
    if (label) {
      label.textContent = text.length > 42 ? text.slice(0, 40) + "…" : text;
    }
    return panel;
  }

  function hidePanel() {
    stop();
    const p = document.getElementById("mera-tts-panel");
    if (p) p.remove();
  }

  // ---------------------------------------------------------------- API

  window.__MERA_TTS = {
    supported: SUPPORTED,
    speak,
    stop,
    voices,
    showPanel,
    hidePanel,
    isSpeaking: () => state.speaking,
  };

  // ---------------------------------------------------------------- messages popup

  /**
   * Lit le texte visible et traduit de la page.
   * On privilégie les éléments courts (libellés, boutons, titres) : c'est
   * ce qui a été traduit et ce que l'utilisateur doit comprendre.
   */
  function speakPage() {
    if (!SUPPORTED) return { supported: false };

    const SELECTOR = "h1,h2,h3,p,span,strong,button,label,li";
    const parts = [];
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (el.children.length > 0) return; // évite les doublons de conteneurs
      if (el.closest("[data-mera-skip]")) return; // ignore notre propre panneau
      const t = el.textContent.trim();
      if (!t || t.length < 2) return;
      // Ne pas lire les valeurs financières brutes ni les références
      if (window.__MERA_GUARD && window.__MERA_GUARD.isProtected(t)) return;
      parts.push(t);
    });

    // Dédoublonnage en conservant l'ordre
    const seen = new Set();
    const unique = parts.filter((p) => {
      const k = p.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const text = unique.slice(0, 40).join(". ");
    if (!text) return { supported: true, spoken: false, reason: "no_text" };

    let failure = null;
    const started = speak(text, {
      onState: (s) => {
        if (s.error) failure = s.message || s.error;
        if (!s.speaking && !s.error) hidePanel();
      },
    });

    if (!started) {
      return {
        supported: true,
        spoken: false,
        reason: "no_voice",
        message:
          "Aucune voix installée. Sous Linux : sudo apt install espeak-ng, puis redémarrez Chrome.",
      };
    }

    showPanel(unique[0] || text.slice(0, 40));
    return { supported: true, spoken: true, length: text.length, failure };
  }

  window.chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== "MERA_TTS") return;
    if (msg.action === "stop") {
      stop();
      sendResponse({ supported: SUPPORTED, stopped: true });
    } else if (msg.action === "speak-page") {
      sendResponse(speakPage());
    } else if (msg.action === "voices") {
      sendResponse({ supported: SUPPORTED, voices: voices() });
    }
    return true;
  });
})();
