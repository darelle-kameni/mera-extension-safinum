/**
 * popup.js — Interface de contrôle de l'extension MERA.
 */
(function () {
  "use strict";

  const CONTENT_VERSION = "1.3.0";
  let reloadedForVersion = false;

  const $ = (id) => document.getElementById(id);
  const langSelect = $("lang");
  const applyBtn = $("apply");
  const resetBtn = $("reset");
  const statusEl = $("status");
  const demoEl = $("demo");

  // Aperçu statique du terme « Solde » selon la langue
  const SOLDE_PREVIEW = {
    fr: "Solde disponible",
    en: "Available balance",
    ewo: "Mòni ma wom",
    ful: "Soodi woodi",
    bas: "Yêglɛ̀",
    dua: "Boro",
  };

  const LANG_NAMES = {
    fr: "Français",
    en: "English",
    ewo: "Ewondo",
    ful: "Fulfulde",
    bas: "Basaa",
    dua: "Duala",
  };

  function setStatus(active, language) {
    if (active) {
      statusEl.textContent = "Active — " + (LANG_NAMES[language] || language);
      statusEl.className = "status on";
    } else {
      statusEl.textContent = "Extension inactive";
      statusEl.className = "status off";
    }
  }

  function setStats(stats) {
    if (!stats) return;
    $("s-translated").textContent = stats.translated || 0;
    $("s-protected").textContent = stats.protected || 0;
    $("s-skipped").textContent = stats.skipped || 0;
  }

  // Récupère l'onglet actif
  function withActiveTab(cb) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) return; // évite un lastError non lu
      if (!tabs || !tabs[0]) return;
      cb(tabs[0]);
    });
  }

  // Une page ouverte avant la mise à jour garde l'ancien content script en
  // mémoire. On recharge la page une seule fois pour charger la nouvelle version.
  function reloadForVersion(tab) {
    statusEl.textContent = "Mise à jour de la page en cours…";
    statusEl.className = "status off";
    if (reloadedForVersion) return;
    reloadedForVersion = true;
    chrome.tabs.reload(tab.id, {}, () => {
      void chrome.runtime.lastError;
    });
  }

  function isStale(res) {
    return !!res && res.version !== CONTENT_VERSION;
  }

  // Charge l'état + les compteurs depuis le content script.
  // (Un popup ne reçoit pas les sendMessage d'un content script : on interroge.)
  let pollTimer = null;

  function refresh() {
    withActiveTab((tab) => {
      const url = tab.url || "";
      if (!/^https:\/\/(www\.)?safinum\.cm\//.test(url)) {
        setStatus(false);
        statusEl.textContent = "Ouvrez safinum.cm/hackathon-test";
        statusEl.className = "status off";
        return;
      }
      // On ne sollicite pas d'injection pendant le rafraîchissement :
      // simple lecture d'état, l'injection se fait au clic.
      chrome.tabs.sendMessage(tab.id, { type: "MERA_STATUS" }, (res) => {
        if (chrome.runtime.lastError || !res) {
          setStatus(false);
          statusEl.textContent = "Choisissez une langue puis « Traduire la page »";
          statusEl.className = "status off";
          return;
        }
        if (isStale(res)) {
          reloadForVersion(tab);
          return;
        }
        setStatus(res.active, res.language);
        setStats(res.stats);
        // Ne PAS écraser la sélection de l'utilisateur : le menu doit rester
        // sur la langue qu'il vient de choisir, pour pouvoir en changer à tout moment.
        if (!langSelect.value && res.language) {
          langSelect.value = res.language;
        }
      });
    });
  }

  // Interroge le content script en boucle pour rafraîchir les compteurs
  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(refresh, 800);
  }

  function updateDemo() {
    const code = langSelect.value;
    demoEl.textContent = code
      ? "→ " + (SOLDE_PREVIEW[code] || "traduit")
      : "→ traduit";
    applyBtn.disabled = !code;
  }

  // Changer la langue : applique immédiatement (pas besoin de recharger la page)
  langSelect.addEventListener("change", () => {
    updateDemo();
    const code = langSelect.value;
    if (!code) return;

    withActiveTab((tab) => {
      if (!/^https:\/\/(www\.)?safinum\.cm\//.test(tab.url || "")) {
        statusEl.textContent = "Ouvrez d'abord safinum.cm/hackathon-test";
        statusEl.className = "status off";
        return;
      }
      sendToPage(tab, { type: "MERA_ACTIVATE", language: code }, (res, err) => {
        if (!res) {
          statusEl.textContent = /mise à jour/i.test(err || "")
            ? "Mise à jour de la page en cours…"
            : "Échec : " + (err || "inconnu");
          statusEl.className = "status off";
          return;
        }
        setStatus(true, code);
        setStats(res.stats);
      });
    });
  });

  // Injecte les scripts à la demande, si le content script n'est pas présent
  // (page ouverte avant le chargement de l'extension, rechargement, etc.)
  function ensureScripts(tab, cb) {
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ["src/guard.js", "src/dictionaries.js", "src/content.js", "src/tts.js"] },
      () => {
        const err = chrome.runtime.lastError;
        cb(!err, err ? err.message : null);
      },
    );
  }

  // Envoie un message au content script, avec injection de secours
  function sendToPage(tab, payload, cb) {
    chrome.tabs.sendMessage(tab.id, payload, (res) => {
      if (!chrome.runtime.lastError && res) {
        if (isStale(res)) {
          reloadForVersion(tab);
          cb(null, "mise à jour de la page — réessayez dans un instant");
          return;
        }
        cb(res);
        return;
      }
      // Pas de content script : on l'injecte puis on réessaie
      ensureScripts(tab, (ok, err) => {
        if (!ok) {
          cb(null, err);
          return;
        }
        chrome.tabs.sendMessage(tab.id, payload, (res2) => {
          if (chrome.runtime.lastError || !res2) {
            cb(null, chrome.runtime.lastError ? chrome.runtime.lastError.message : "aucune réponse");
            return;
          }
          if (isStale(res2)) {
            reloadForVersion(tab);
            cb(null, "mise à jour de la page — réessayez dans un instant");
            return;
          }
          cb(res2);
        });
      });
    });
  }

  // Appliquer la traduction
  applyBtn.addEventListener("click", () => {
    const code = langSelect.value;
    if (!code) return;

    withActiveTab((tab) => {
      if (!/^https:\/\/(www\.)?safinum\.cm\//.test(tab.url || "")) {
        statusEl.textContent = "Ouvrez d'abord safinum.cm/hackathon-test";
        statusEl.className = "status off";
        return;
      }

      sendToPage(tab, { type: "MERA_ACTIVATE", language: code }, (res, err) => {
        if (!res) {
          statusEl.textContent = /mise à jour/i.test(err || "")
            ? "Mise à jour de la page en cours…"
            : "Échec : " + (err || "inconnu");
          statusEl.className = "status off";
          return;
        }
        setStatus(true, code);
        setStats(res.stats);
      });
    });
  });

  // Restaurer
  resetBtn.addEventListener("click", () => {
    withActiveTab((tab) => {
      if (!/^https:\/\/(www\.)?safinum\.cm\//.test(tab.url || "")) {
        statusEl.textContent = "Ouvrez d'abord safinum.cm/hackathon-test";
        statusEl.className = "status off";
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: "MERA_DEACTIVATE" }, (res) => {
        // Lire lastError systématiquement : sinon Chrome logue
        // « Unchecked runtime.lastError: Could not establish connection ».
        if (chrome.runtime.lastError || !res) {
          setStatus(false);
          setStats({ translated: 0, protected: 0, skipped: 0 });
          statusEl.textContent = "Aucune traduction active sur cette page";
          statusEl.className = "status off";
          return;
        }
        setStatus(false);
        setStats({ translated: 0, protected: 0, skipped: 0 });
      });
    });
  });

  // Le content script signale ses mises à jour (relais via le service worker si présent)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "MERA_STATS") {
      setStats(msg.stats);
      setStatus(msg.active, msg.language);
    }
  });

  // ---------------------------------------------------------------- lecture vocale

  // Récupère le texte traduit de la page, dans l'ordre d'affichage
  function collectPageText() {
    const nodes = document.querySelectorAll("h1,h2,h3,p,span,strong,button,label,li");
    return Array.from(nodes)
      .filter((el) => el.children.length === 0 && el.textContent.trim())
      .map((el) => el.textContent.trim())
      .join(" ");
  }

  function sendTts(action, text, cb) {
    withActiveTab((tab) => {
      chrome.tabs.sendMessage(tab.id, { type: "MERA_TTS", action, text }, (res) => {
        if (chrome.runtime.lastError || !res) {
          if (cb) cb(false, chrome.runtime.lastError && chrome.runtime.lastError.message);
          return;
        }
        if (cb) cb(true, null, res);
      });
    });
  }

  $("tts-play").addEventListener("click", () => {
    // Le content script lit le texte déjà traduit de sa propre page
    sendTts("speak-page", null, (ok, err, res) => {
      if (!ok) {
        statusEl.textContent = "Lecture impossible : " + (err || "page non prise en charge");
        statusEl.className = "status off";
        return;
      }
      if (res && res.supported === false) {
        statusEl.textContent = "Synthèse vocale non supportée par ce navigateur";
        statusEl.className = "status off";
      }
    });
  });

  $("tts-stop").addEventListener("click", () => sendTts("stop"));

  // Diagnostic : dit précisément pourquoi la page n'est pas prise en charge
  $("diag").addEventListener("click", () => {
    const out = $("diag-out");
    out.style.display = "block";
    out.textContent = "Analyse…";

    withActiveTab((tab) => {
      const lines = [];
      lines.push("URL : " + (tab.url || "(inconnue)"));
      lines.push("Onglet : " + tab.id);

      const urlOk = /^https:\/\/(www\.)?safinum\.cm\//.test(tab.url || "");
      lines.push("URL autorisée : " + (urlOk ? "oui" : "NON — ouvrez safinum.cm/hackathon-test"));

      chrome.tabs.sendMessage(tab.id, { type: "MERA_STATUS" }, (res) => {
        const err = chrome.runtime.lastError;
        if (err || !res) {
          lines.push("Content script : ABSENT (" + (err ? err.message : "aucune réponse") + ")");
          lines.push("→ cliquez sur « Traduire la page » : l'extension tentera une injection.");
        } else {
          lines.push("Content script : PRÉSENT");
          lines.push("Version page : " + (res.version || "OBSOLÈTE (rechargez la page)"));
          lines.push("Version attendue : " + CONTENT_VERSION);
          lines.push("Actif : " + res.active);
          lines.push("Langue : " + (res.language || "—"));
          lines.push("Traduits : " + (res.stats ? res.stats.translated : 0));
        }
        lines.push("Extension : v1.3.0");
        out.textContent = lines.join("\n");
      });
    });
  });

  updateDemo();
  refresh();
  startPolling();
})();
