// ==============================
// Scribe Study - Clean App Core
// ==============================
(function () {
  "use strict";

  // ----------------------------
  // Firebase Config + Init
  // ----------------------------
  function loadFirebaseConfig() {
    if (window.firebaseConfig) return window.firebaseConfig;
    console.warn("⚠️ No window.firebaseConfig found. Check index.html for config block.");
    return null;
  }

  let FirebaseState = {
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
        console.log("✅ Firebase initialized (compat)");
      } else {
        FirebaseState.app = firebase.app();
        console.log("ℹ️ Firebase already initialized");
      }

      FirebaseState.auth = firebase.auth();
      FirebaseState.db = firebase.firestore();

      // Optional: enable persistence for future notes features
      firebase
        .firestore()
        .enablePersistence({ synchronizeTabs: true })
        .then(() => console.log("✅ Firestore persistence enabled"))
        .catch((err) =>
          console.warn("⚠️ Persistence not available:", err.message)
        );

      FirebaseState.initialized = true;
    } catch (e) {
      console.error("🔥 Error initializing Firebase:", e);
    }
  }

  // ----------------------------
  // Global App State
  // ----------------------------
  const AppState = {
    currentPassage: "",
    currentVersion: "ESV",
    currentFontSize: "font-size-normal", // relies on analysis.css

    // For dynamic suggested questions (used by ui-layout.js)
    currentMode: "Academic",       // could later be "Devotional", "Visual", etc.
    currentSubtab: null,           // e.g. "Syntax", "Discourse"
    lastUserQuestion: null,        // from Help popup (future)
    lastAIOutputSummary: ""        // simple summary or raw analysis text
  };

  // ----------------------------
  // DOM Cache
  // ----------------------------
  const DOM = {
    sidebar: null,
    sidebarToggle: null,
    scriptureInput: null,
    generateBtn: null,
    displayScriptureBtn: null,
    versionSelect: null,
    output: null,
    zoomMinus: null,
    zoomPlus: null,
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function cacheDom() {
    // Sidebar
    DOM.sidebar = byId("sidebar");
    DOM.sidebarToggle = byId("sidebarToggle");

    // Use the Claude-style analysis section controls
    DOM.scriptureInput = byId("passageInput") || byId("scriptureInput") || null;
    DOM.studyBtn = byId("studyBtn");


    // Output container: prefer the dynamic panel, fallback to legacy
    DOM.output = byId("analysisDisplay");
  }

  // ----------------------------
  // Simple Markdown → HTML
  // ----------------------------
  function simpleMarkdown(text) {
    if (!text) return "";
    let html = text.replace(/\r\n/g, "\n");

    // Headings
    html = html
      .replace(/^###\s(.*)/gm, "<h3>$1</h3>")
      .replace(/^##\s(.*)/gm, "<h2>$1</h2>")
      .replace(/^#\s(.*)/gm, "<h1>$1</h1>");

    // Bold / Italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Blockquotes
    html = html
      .replace(/^\>\s(.*)/gm, "<blockquote>$1</blockquote>")
      .replace(/<\/blockquote>\n<blockquote>/g, "\n");

    // Unordered lists
    html = html
      .replace(/^\s*[\-\*]\s(.*)/gm, "<li>$1</li>")
      .replace(/(\n?<li>.*<\/li>\n?)/gs, "<ul>$1</ul>")
      .replace(/<\/ul>\n?<ul>/g, "");

    // Ordered lists
    html = html
      .replace(/^\s*[0-9]+\.\s(.*)/gm, "<li>$1</li>")
      .replace(
        /(\n?<li>.*<\/li>\n?)/gs,
        (m, p1) => (m.includes("<ul>") ? m : `<ol>${p1}</ol>`)
      )
      .replace(/<\/ol>\n?<ul>/g, "")
      .replace(/<\/ul>\n?<ol>/g, "")
      .replace(/<\/ol>\n?<ol>/g, "");

    // Paragraphs
    html = html
      .split("\n\n")
      .map((p) => {
        if (p.trim().startsWith("<") || p.trim() === "") return p;
        return `<p>${p.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    // Clean nested paragraphs
    html = html
      .replace(/<p>\s*<(ul|ol|h[1-3]|blockquote)/g, "<$1")
      .replace(/<\/(ul|ol|h[1-3]|blockquote)>\s*<\/p>/g, "</$1>")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/<p><br><\/p>/g, "");

    return html;
  }

  // ----------------------------
  // UI State Helpers
  // ----------------------------
  function setOutputStatus(message, icon) {
    if (!DOM.output) return;
    const iconHtml = icon ? `<div class="status-icon">${icon}</div>` : "";
    DOM.output.innerHTML = `
      <div class="status-message">
        ${iconHtml}
        <div class="status-title">${message}</div>
      </div>
    `;
  }

  function setLoadingState(isLoading, label) {
    if (!DOM.output) return;
    if (isLoading) {
      DOM.output.innerHTML = `
        <div class="status-message">
          <div class="status-icon">
            <div class="loading-dots">
              <span>•</span><span>•</span><span>•</span>
            </div>
          </div>
          <div class="status-title">${label || "Working..."}</div>
        </div>
      `;
      if (DOM.generateBtn) DOM.generateBtn.disabled = true;
      if (DOM.displayScriptureBtn) DOM.displayScriptureBtn.disabled = true;
    } else {
      if (DOM.generateBtn) DOM.generateBtn.disabled = false;
      if (DOM.displayScriptureBtn) DOM.displayScriptureBtn.disabled = false;
    }
  }

  function renderMarkdownContent(markdownText) {
    if (!DOM.output) return;
    DOM.output.innerHTML = simpleMarkdown(markdownText || "");
    applyFontSize();
  }

  // ----------------------------
  // Sidebar (Collapsible Pane)
  // ----------------------------
  function toggleSidebar() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.toggle("collapsed");
  }

  // ----------------------------
  // Font Size / Zoom Controls
  // ----------------------------
  function handleFontSizeChange(direction) {
    const sizes = [
      "font-size-small",
      "font-size-normal",
      "font-size-large",
      "font-size-xlarge",
    ];
    let idx = sizes.indexOf(AppState.currentFontSize);
    if (idx === -1) idx = 1; // default to normal

    idx += direction;
    if (idx < 0) idx = 0;
    if (idx >= sizes.length) idx = sizes.length - 1;

    AppState.currentFontSize = sizes[idx];
    applyFontSize();
  }

  function applyFontSize() {
    if (!DOM.output) return;
    const sizes = [
      "font-size-small",
      "font-size-normal",
      "font-size-large",
      "font-size-xlarge",
    ];
    DOM.output.classList.remove(...sizes);
    DOM.output.classList.add(AppState.currentFontSize);
  }

  function ensureZoomControls() {
    if (!DOM.output) return;
    // If controls already exist, skip
    if (document.getElementById("zoomControls")) return;

    const parent = DOM.output.parentElement;
    if (!parent) return;

    const controls = document.createElement("div");
    controls.id = "zoomControls";
    controls.style.display = "flex";
    controls.style.justifyContent = "flex-end";
    controls.style.gap = "8px";
    controls.style.marginBottom = "8px";

    const minusBtn = document.createElement("button");
    minusBtn.id = "fontDecreaseBtn";
    minusBtn.textContent = "A-";
    minusBtn.style.padding = "4px 10px";
    minusBtn.style.borderRadius = "4px";
    minusBtn.style.border = "1px solid var(--sand)";
    minusBtn.style.cursor = "pointer";

    const plusBtn = document.createElement("button");
    plusBtn.id = "fontIncreaseBtn";
    plusBtn.textContent = "A+";
    plusBtn.style.padding = "4px 10px";
    plusBtn.style.borderRadius = "4px";
    plusBtn.style.border = "1px solid var(--sand)";
    plusBtn.style.cursor = "pointer";

    controls.appendChild(minusBtn);
    controls.appendChild(plusBtn);

    // Insert controls just before output panel
    parent.insertBefore(controls, DOM.output);

    DOM.zoomMinus = minusBtn;
    DOM.zoomPlus = plusBtn;

    minusBtn.addEventListener("click", () => handleFontSizeChange(-1));
    plusBtn.addEventListener("click", () => handleFontSizeChange(1));
  }

  // ----------------------------
  // Version Selector
  // ----------------------------
  function ensureVersionSelect() {
    if (byId("versionSelect")) {
      DOM.versionSelect = byId("versionSelect");
      return;
    }

    const header = document.querySelector(".content-header");
    if (!header) return;

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "4px";

    const label = document.createElement("label");
    label.textContent = "Bible Version";
    label.style.fontSize = "11px";
    label.style.fontWeight = "700";
    label.style.textTransform = "uppercase";
    label.style.letterSpacing = "0.8px";
    label.style.color = "var(--text-medium)";

    const select = document.createElement("select");
    select.id = "versionSelect";
    select.style.padding = "8px 12px";
    select.style.borderRadius = "6px";
    select.style.border = "2px solid var(--sand)";
    select.style.fontSize = "13px";

    const versions = ["ESV", "KJV", "NIV", "NASB", "CSB"];
    versions.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });

    select.value = AppState.currentVersion;

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    header.appendChild(wrapper);

    DOM.versionSelect = select;

    select.addEventListener("change", () => {
      AppState.currentVersion = select.value || "ESV";
    });
  }

  // ----------------------------
  // API Call Helper
  // ----------------------------
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "/api";

  async function callAnalysisAPI(prompt, passage, moduleName, version) {
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          passage,
          moduleName,
          version: version || "ESV",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();
      return data.analysis;
    } catch (err) {
      console.error("Analysis Error:", err);
      throw err;
    }
  }

  // ----------------------------
  // Core Actions
  // ----------------------------
  function getCurrentPassage() {
    if (!DOM.scriptureInput) return "";
    return DOM.scriptureInput.value.trim();
  }

  async function handleGenerateAnalysis() {
    const passage = getCurrentPassage();
    if (!passage) {
      setOutputStatus("Please enter a passage (e.g., John 3:16).", "⚠️");
      return;
    }

    AppState.currentPassage = passage;
    AppState.currentMode = "Academic"; // you can refine per tab later
    const version = (DOM.versionSelect && DOM.versionSelect.value) || "ESV";

    const prompt = `
You are a careful, pastoral, biblically-grounded study assistant.

Analyze the passage: "${passage}" in the ${version} translation.

Provide a structured response with:
1. Brief summary of the passage.
2. Key theological themes.
3. Literary or structural features that matter.
4. Connections to the broader biblical storyline.
5. Gentle, Christ-centered applications for life and discipleship.

Write clearly and reverently. Do not include the full text of the passage itself.
    `.trim();

    setLoadingState(true, `Analyzing ${passage} (${version})...`);

    try {
      const analysis = await callAnalysisAPI(
        prompt,
        passage,
        "General Analysis",
        version
      );

      // Render the analysis
      renderMarkdownContent(analysis || "No analysis returned.");

      // Store a simple summary (for now, just re-use the text)
      AppState.lastAIOutputSummary = analysis || "";

      // ✅ NEW: Update dynamic suggested questions, if helper is available
      if (typeof window.updateSuggestedQuestions === "function") {
        window.updateSuggestedQuestions({
          mode: AppState.currentMode || "Academic",
          subtab: AppState.currentSubtab || null,
          lastUserQuestion: AppState.lastUserQuestion || null,
          aiOutputSummary: AppState.lastAIOutputSummary || ""
        });
      }
    } catch (err) {
      setOutputStatus(
        err.message || "An error occurred while generating analysis.",
        "⚠️"
      );
    } finally {
      setLoadingState(false);
    }
  }

  async function handleUnifiedStudy() {
  const passage = getCurrentPassage();
  if (!passage) {
    setOutputStatus("Please enter a passage (e.g., John 3:16).", "⚠️");
    return;
  }

  const version = (DOM.versionSelect && DOM.versionSelect.value) || "ESV";

  // SCRIPTURE PROMPT
  const scripturePrompt = `
Provide the full Scripture text for the passage "${passage}" in the ${version} translation.
Include verse numbers like [1], [2], etc.
No commentary, no paraphrase, no summaries.
  `.trim();

  // ANALYSIS PROMPT
  const analysisPrompt = `
Analyze the passage: "${passage}" in ${version}.
Provide:
1. A brief summary of the passage.
2. Key theological themes.
3. Literary or structural features.
4. Connections to the broader biblical storyline.
5. Clear, Christ-centered application.
  `.trim();

  setLoadingState(true, \`Studying ${passage}...\`);

  try {
    // Run BOTH in parallel → much faster.
    const [scriptureText, analysisText] = await Promise.all([
      callAnalysisAPI(scripturePrompt, passage, "ScriptureText", version),
      callAnalysisAPI(analysisPrompt, passage, "UnifiedAnalysis", version)
    ]);

    // LEFT PANEL — SET SCRIPTURE
    const fullPassageText = document.getElementById("fullPassageText");
    if (fullPassageText) {
      fullPassageText.innerHTML = simpleMarkdown(scriptureText || "");
      document.getElementById("pinnedPassageRef").textContent = passage;
    }

    // RIGHT PANEL — SET ANALYSIS
    renderMarkdownContent(analysisText || "");

    // Track last summary
    AppState.lastAIOutputSummary = analysisText;

    // SUGGESTED QUESTIONS
    if (typeof window.updateSuggestedQuestions === "function") {
      window.updateSuggestedQuestions({
        mode: "UnifiedStudy",
        subtab: null,
        lastUserQuestion: null,
        aiOutputSummary: analysisText
      });
    }

  } catch (err) {
    setOutputStatus(
      err.message || "An error occurred during unified study.",
      "⚠️"
    );
  } finally {
    setLoadingState(false);
  }
}

    AppState.currentPassage = passage;
    AppState.currentMode = "Scripture"; // label for suggested-questions logic
    const version = (DOM.versionSelect && DOM.versionSelect.value) || "ESV";

    const prompt = `
Provide the full Scripture text for the passage "${passage}" in the ${version} translation.

Formatting rules:
- Include verse numbers in brackets like [1], [2], etc.
- Do NOT add commentary, introductions, headings, or cross-references.
- Do NOT paraphrase or summarize. Return only the Scripture text.
    `.trim();

    setLoadingState(true, `Loading ${passage} (${version})...`);

    try {
      const text = await callAnalysisAPI(
        prompt,
        passage,
        `Scripture Text (${version})`,
        version
      );

      // Render the Scripture text
      renderMarkdownContent(text || "No text returned.");

      // Store simple "summary" (here just the text)
      AppState.lastAIOutputSummary = text || "";

      // ✅ NEW: Update dynamic suggested questions, if helper is available
      if (typeof window.updateSuggestedQuestions === "function") {
        window.updateSuggestedQuestions({
          mode: AppState.currentMode || "Scripture",
          subtab: AppState.currentSubtab || null,
          lastUserQuestion: AppState.lastUserQuestion || null,
          aiOutputSummary: AppState.lastAIOutputSummary || ""
        });
      }
    } catch (err) {
      setOutputStatus(
        err.message || "An error occurred while loading Scripture text.",
        "⚠️"
      );
    } finally {
      setLoadingState(false);
    }
  }

  // ----------------------------
  // Extra Controls we create in JS
  // ----------------------------
  function ensureDisplayScriptureButton() {
    if (!DOM.generateBtn) return;

    // If already exists, skip
    if (byId("displayScriptureBtn")) {
      DOM.displayScriptureBtn = byId("displayScriptureBtn");
      return;
    }

    const container = DOM.generateBtn.parentElement;
    if (!container) return;

    const btn = document.createElement("button");
    btn.id = "displayScriptureBtn";
    btn.textContent = "Display Scripture Text";
    btn.className = "generate-btn"; // reuse styling

    container.appendChild(btn);
    DOM.displayScriptureBtn = btn;

    btn.addEventListener("click", handleDisplayScripture);
  }

  function hideLegacyPanelIfPresent() {
    const legacy = byId("analysisDisplay");
    const dynamic = byId("analysisDisplayDynamic");
    if (legacy && dynamic && legacy !== dynamic) {
      // Hide the original status card if we have the new one
      legacy.style.display = "none";
    }
  }

  // ----------------------------
  // Boot / Wiring
  // ----------------------------
  function wireEvents() {
    if (DOM.sidebarToggle) {
      DOM.sidebarToggle.addEventListener("click", toggleSidebar);
    }

   if (DOM.studyBtn) {
  DOM.studyBtn.addEventListener("click", handleUnifiedStudy);
}

if (DOM.scriptureInput) {
  DOM.scriptureInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleUnifiedStudy();
    }
  });
}

  document.addEventListener("DOMContentLoaded", () => {
  try {
    cacheDom();              // 1️⃣ MUST run first
    hideLegacyPanelIfPresent();
    ensureVersionSelect();
    ensureZoomControls();
    wireEvents();            // 2️⃣ MUST run after cacheDom()
    initFirebaseOnce();

    // Initial welcome state
    if (DOM.output) {
      DOM.output.innerHTML = `
        <div class="status-message">
          <div class="status-icon">✨</div>
          <div class="status-title">Ready to Study God's Word</div>
          <p class="status-text">
            Enter a passage above, then click "Study Passage."
          </p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Failed to initialize Scribe Study:", err);
    setOutputStatus("Failed to initialize app. Check console for details.", "⚠️");
  }
});

})();
