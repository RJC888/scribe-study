// ==============================
// Scribe Study — Clean, Corrected, Working Build
// ==============================
(function () {
  "use strict";

  // ----------------------------------------------------
  // Firebase Config + Init (Safe, non-blocking)
  // ----------------------------------------------------
  function loadFirebaseConfig() {
    if (window.firebaseConfig) return window.firebaseConfig;
    console.warn("⚠️ No window.firebaseConfig found in index.html.");
    return null;
  }

  const FirebaseState = {
    app: null,
    auth: null,
    db: null,
    initialized: false,
  };

  function initFirebaseOnce() {
    if (FirebaseState.initialized) return;
    if (typeof firebase === "undefined") {
      console.warn("⚠️ Firebase SDK not loaded.");
      return;
    }

    try {
      const config = loadFirebaseConfig();
      if (!config) throw new Error("Missing Firebase config.");

      if (!firebase.apps.length) {
        FirebaseState.app = firebase.initializeApp(config);
        console.log("✅ Firebase initialized");
      } else {
        FirebaseState.app = firebase.app();
      }

      FirebaseState.auth = firebase.auth();
      FirebaseState.db = firebase.firestore();

      firebase
        .firestore()
        .enablePersistence({ synchronizeTabs: true })
        .catch((err) =>
          console.warn("⚠️ Firestore persistence not available:", err.message)
        );

      FirebaseState.initialized = true;
    } catch (err) {
      console.error("🔥 Firebase init error:", err);
    }
  }

  // ----------------------------------------------------
  // Global App State
  // ----------------------------------------------------
  const AppState = {
    currentPassage: "",
    currentVersion: "ESV",
    currentMode: "Academic",
    lastUserQuestion: null,
    lastAIOutputSummary: "",
  };

  // ----------------------------------------------------
  // DOM CACHE
  // ----------------------------------------------------
  const DOM = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function cacheDom() {
    DOM.scriptureInput = byId("passageInput");
    DOM.scriptureOnlyBtn = byId("scriptureOnlyBtn");
    DOM.unifiedStudyBtn = byId("unifiedStudyBtn");
    DOM.output = byId("analysisDisplay");
  }

  // ----------------------------------------------------
  // Markdown → HTML
  // ----------------------------------------------------
  function simpleMarkdown(text) {
    if (!text) return "";
    let html = text.replace(/\r\n/g, "\n");

    html = html
      .replace(/^###\s(.*)/gm, "<h3>$1</h3>")
      .replace(/^##\s(.*)/gm, "<h2>$1</h2>")
      .replace(/^#\s(.*)/gm, "<h1>$1</h1>");

    html = html
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    html = html
      .replace(/^\s*[\-\*]\s(.*)/gm, "<li>$1</li>")
      .replace(/(\n?<li>.*<\/li>\n?)/gs, "<ul>$1</ul>")
      .replace(/<\/ul>\n?<ul>/g, "");

    html = html
      .replace(/^\s*[0-9]+\.\s(.*)/gm, "<li>$1</li>")
      .replace(/(\n?<li>.*<\/li>\n?)/gs, "<ol>$1</ol>")
      .replace(/<\/ol>\n?<ol>/g, "");

    html = html
      .split("\n\n")
      .map((p) => {
        if (p.trim().startsWith("<") || p.trim() === "") return p;
        return `<p>${p.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    return html;
  }

  function renderMarkdownContent(text) {
    if (!DOM.output) return;
    DOM.output.innerHTML = simpleMarkdown(text || "");
  }

  function setOutputStatus(message, icon) {
    if (!DOM.output) return;
    DOM.output.innerHTML = `
      <div class="status-message">
        <div class="status-icon">${icon || ""}</div>
        <div class="status-title">${message}</div>
      </div>
    `;
  }

  function setLoadingState(isLoading, label) {
    if (!DOM.output) return;

    if (isLoading) {
      DOM.output.innerHTML = `
        <div class="status-message">
          <div class="status-icon"><div class="loading-dots"><span>•</span><span>•</span><span>•</span></div></div>
          <div class="status-title">${label}</div>
        </div>
      `;
    }
  }

  // ----------------------------------------------------
  // API CALLS
  // ----------------------------------------------------
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "/api";

  async function callAnalysisAPI(prompt, passage, moduleName, version) {
    const res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, passage, moduleName, version }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Analysis failed");
    }

    const data = await res.json();
    return data.analysis;
  }

  // ----------------------------------------------------
  // Scripture ONLY
  // ----------------------------------------------------
  async function handleDisplayScripture() {
    const passage = DOM.scriptureInput.value.trim();
    if (!passage) {
      setOutputStatus("Please enter a passage (e.g., John 3:16).", "⚠️");
      return;
    }

    setLoadingState(true, `Loading ${passage}...`);

    const version = AppState.currentVersion;

    const prompt = `
Provide the full Scripture text for "${passage}" in ${version}.
Include verse numbers like [1], [2].
Do NOT add commentary or headings.
`.trim();

    try {
      const scripture = await callAnalysisAPI(
        prompt,
        passage,
        "ScriptureOnly",
        version
      );

      const fullPassageText = byId("fullPassageText");
      if (fullPassageText) {
        fullPassageText.innerHTML = simpleMarkdown(scripture);
      }
      const pinned = byId("pinnedPassageRef");
      if (pinned) pinned.textContent = passage;

      renderMarkdownContent(scripture);

      AppState.lastAIOutputSummary = scripture;
      AppState.currentMode = "Scripture";

      if (window.updateSuggestedQuestions) {
        window.updateSuggestedQuestions({
          mode: "Scripture",
          aiOutputSummary: scripture,
        });
      }
    } catch (err) {
      setOutputStatus(err.message, "⚠️");
    }
  }

  // ----------------------------------------------------
  // Unified Study (Scripture + Analysis)
  // ----------------------------------------------------
  async function handleUnifiedStudy() {
    const passage = DOM.scriptureInput.value.trim();
    if (!passage) {
      setOutputStatus("Please enter a passage.", "⚠️");
      return;
    }

    const version = AppState.currentVersion;

    setLoadingState(true, `Studying ${passage}...`);

    const scripturePrompt = `
Provide the full Scripture text for "${passage}" in ${version}.
Number verses like [1], [2].
No commentary.
`.trim();

    const analysisPrompt = `
Analyze "${passage}" in ${version}.
Give:
1. Summary
2. Key themes
3. Structure
4. Biblical connections
5. Christ-centered application
`.trim();

    try {
      const [scripture, analysis] = await Promise.all([
        callAnalysisAPI(scripturePrompt, passage, "Scripture", version),
        callAnalysisAPI(analysisPrompt, passage, "Analysis", version),
      ]);

      const fullPassageText = byId("fullPassageText");
      if (fullPassageText) {
        fullPassageText.innerHTML = simpleMarkdown(scripture);
      }
      const pinned = byId("pinnedPassageRef");
      if (pinned) pinned.textContent = passage;

      renderMarkdownContent(analysis);

      AppState.lastAIOutputSummary = analysis;
      AppState.currentMode = "UnifiedStudy";

      if (window.updateSuggestedQuestions) {
        window.updateSuggestedQuestions({
          mode: "UnifiedStudy",
          aiOutputSummary: analysis,
        });
      }
    } catch (err) {
      setOutputStatus(err.message || "Unified Study failed.", "⚠️");
    }
  }

  // ----------------------------------------------------
  // WIRING
  // ----------------------------------------------------
  function wireEvents() {
    if (DOM.scriptureOnlyBtn)
      DOM.scriptureOnlyBtn.addEventListener("click", handleDisplayScripture);

    if (DOM.unifiedStudyBtn)
      DOM.unifiedStudyBtn.addEventListener("click", handleUnifiedStudy);

    if (DOM.scriptureInput) {
      DOM.scriptureInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleUnifiedStudy();
      });
    }
  }

  // ----------------------------------------------------
  // BOOTSTRAP
  // ----------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    cacheDom();
    wireEvents();
    initFirebaseOnce();

    if (DOM.output) {
      DOM.output.innerHTML = `
        <div class="status-message">
          <div class="status-icon">✨</div>
          <div class="status-title">Ready to Study God's Word</div>
          <p class="status-text">
            Enter a passage above, then choose Scripture Only or Unified Study.
          </p>
        </div>
      `;
    }
  });

})();
