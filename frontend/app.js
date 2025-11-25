// =====================================================
// Scribe Study Prototype – Collapsible Pane + 2-Step Flow
// No Firebase, no AI calls – just layout & behavior.
// =====================================================

const AppState = {
  currentMode: "devotional",
  currentSubtab: null,
  currentPassage: "",
  paneOpen: true,
};

// Configuration for modes and subtabs (extendable later)
const MODE_CONFIG = {
  devotional: {
    label: "Devotional",
    description:
      "Gentle, heart-focused reflection with worship-oriented prompts, micro-units, and spiritual application.",
    subtabs: [
      {
        id: "dev_micro_units",
        title: "Devotional Micro-Units",
        desc: "Break the passage into bite-sized units for prayerful meditation and response.",
      },
      {
        id: "dev_gospel_lens",
        title: "Gospel Lens",
        desc: "Explore how this passage reveals Christ, the gospel, and personal transformation.",
      },
    ],
  },
  academic: {
    label: "Academic",
    description:
      "Text-driven analysis focused on structure, grammar, discourse, and historical-theological depth.",
    subtabs: [
      {
        id: "acad_syntax",
        title: "Syntax Map",
        desc: "Trace the clauses, connectors, and grammatical relationships in the passage.",
      },
      {
        id: "acad_discourse",
        title: "Discourse Flow",
        desc: "Follow the argument, movements, and transitions at the discourse level.",
      },
      {
        id: "acad_lexical",
        title: "Lexical Focus",
        desc: "Highlight key Hebrew/Greek terms, semantic domains, and lexical observations.",
      },
    ],
  },
  visual: {
    label: "Visual",
    description:
      "Imagery, charts, timelines, and diagrams that help the passage become visually memorable.",
    subtabs: [
      {
        id: "vis_diagram",
        title: "Structural Diagram",
        desc: "Generate a high-level visual structure of the passage's main movements.",
      },
      {
        id: "vis_timeline",
        title: "Timeline / Story Arc",
        desc: "Map the events and turning points as a visual storyline.",
      },
    ],
  },
  linguistic: {
    label: "Linguistic Tools",
    description:
      "Language-level tools like morphology, parsing, and word relationships for deeper exegesis.",
    subtabs: [
      {
        id: "ling_morphology",
        title: "Morphology",
        desc: "Focus on forms, parsing, and verbal aspects in the original languages.",
      },
      {
        id: "ling_collocations",
        title: "Collocations & Phrases",
        desc: "Identify key repeated phrases, collocations, and patterns.",
      },
    ],
  },
  compare: {
    label: "Compare",
    description:
      "Compare passages, translations, or parallel texts for harmony and contrast.",
    subtabs: [
      {
        id: "cmp_translations",
        title: "Translation Comparison",
        desc: "Compare multiple English (or other language) translations side by side.",
      },
      {
        id: "cmp_parallels",
        title: "Parallel Passages",
        desc: "Identify related or parallel texts for cross-reference study.",
      },
    ],
  },
  custom: {
    label: "Custom",
    description:
      "User-defined presets and saved analysis flows tailored to recurring study patterns.",
    subtabs: [
      {
        id: "cst_my_template",
        title: "My Template",
        desc: "Run a saved combination of prompts you regularly use.",
      },
      {
        id: "cst_experiment",
        title: "Experiment Mode",
        desc: "Prototype and test new prompt combinations safely.",
      },
    ],
  },
};

// DOM references
let sidePane;
let paneToggleBtn;
let paneCloseBtn;
let breadcrumbBar;
let contentArea;
let mainTabButtons;

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  attachGlobalEvents();
  // Set initial mode and welcome screen
  setMode("devotional");
});

// Cache DOM elements once
function cacheDom() {
  sidePane = document.getElementById("sidePane");
  paneToggleBtn = document.getElementById("paneToggleBtn");
  paneCloseBtn = document.getElementById("paneCloseBtn");
  breadcrumbBar = document.getElementById("breadcrumbBar");
  contentArea = document.getElementById("contentArea");
  mainTabButtons = Array.from(
    document.querySelectorAll("#mainTabs .main-tab-btn")
  );
}

// Attach listeners for pane toggling and main tab clicks
function attachGlobalEvents() {
  // Main tab buttons: set mode and show welcome screen
  mainTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      setMode(mode);
      // If user clicks a tab while pane is collapsed, open it so they can see context.
      if (!AppState.paneOpen) {
        openSidePane();
      }
    });
  });

  // Close (collapse) pane from inside
  if (paneCloseBtn) {
    paneCloseBtn.addEventListener("click", () => {
      collapseSidePane();
    });
  }

  // Toggle button when pane is collapsed
  if (paneToggleBtn) {
    paneToggleBtn.addEventListener("click", () => {
      openSidePane();
    });
  }
}

// ==============================
// MODE + WELCOME SCREEN LOGIC
// ==============================

function setMode(mode) {
  if (!MODE_CONFIG[mode]) {
    console.warn("Unknown mode:", mode);
    return;
  }
  AppState.currentMode = mode;
  AppState.currentSubtab = null;

  // Update tab button active states
  mainTabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // Render welcome screen for selected mode
  renderWelcomeScreen(mode);
  updateBreadcrumb(); // Mode only for now; passage/subtab filled later
}

function renderWelcomeScreen(mode) {
  const config = MODE_CONFIG[mode];
  if (!config) return;

  const subtabsHtml = config.subtabs
    .map(
      (sub) => `
      <div class="subtab-card disabled" data-subtab="${sub.id}">
        <div class="subtab-title">${sub.title}</div>
        <p class="subtab-desc">${sub.desc}</p>
        <p class="muted">Enter a passage above to enable this analysis.</p>
      </div>
    `
    )
    .join("");

  const html = `
    <section class="welcome" data-mode="${mode}">
      <header class="welcome-header">
        <h2 class="welcome-title">${config.label} Mode</h2>
        <p class="welcome-subtitle">${config.description}</p>
        <div class="mode-chip">
          <span>Mode:</span>
          <strong>${config.label}</strong>
        </div>
      </header>

      <div class="passage-input-row">
        <label for="passageInput">Step 1 — Enter Scripture Passage</label>
        <input
          id="passageInput"
          type="text"
          placeholder="e.g., John 3:16, Psalm 23, 1 Peter 1:3–9"
          autocomplete="off"
        />
      </div>

      <div class="passage-input-row">
        <label>Step 2 — Choose an analysis focus</label>
        <p class="muted">
          SubTabs will unlock as soon as a passage is entered. Clicking a SubTab
          will launch the analysis and automatically collapse the side pane.
        </p>
      </div>

      <div class="subtab-grid">
        ${subtabsHtml}
      </div>
    </section>
  `;

  contentArea.innerHTML = html;
  setupTwoStepFlow(mode);
}

// ==============================
// TWO-STEP FLOW LOGIC
// ==============================

function setupTwoStepFlow(mode) {
  const passageInput = document.getElementById("passageInput");
  const subtabCards = Array.from(
    document.querySelectorAll(".subtab-card")
  );

  if (!passageInput) return;

  // Initially disabled (already set by class, but keep logic clear)
  subtabCards.forEach((card) => {
    card.classList.add("disabled");
  });

  // When user types a passage, enable subtabs if non-empty
  passageInput.addEventListener("input", () => {
    const value = passageInput.value.trim();
    const hasPassage = value.length > 0;

    AppState.currentPassage = value;

    subtabCards.forEach((card) => {
      card.classList.toggle("disabled", !hasPassage);
    });
  });

  // Attach click listeners to subtabs (Step 2)
  subtabCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card.classList.contains("disabled")) return;

      const subtabId = card.dataset.subtab;
      AppState.currentSubtab = subtabId;

      // At this point, two-step is satisfied:
      //  1) Passage entered
      //  2) SubTab chosen
      // So we:
      //  - Render analysis placeholder
      //  - Update breadcrumb
      //  - Auto-collapse the side pane
      runAnalysisPlaceholder(AppState.currentMode, subtabId, AppState.currentPassage);
      updateBreadcrumb();
      collapseSidePane();
    });
  });
}

// ==============================
// ANALYSIS PLACEHOLDER (NO BACKEND YET)
// ==============================

function runAnalysisPlaceholder(mode, subtabId, passage) {
  const modeConfig = MODE_CONFIG[mode];
  const subtabConfig =
    modeConfig?.subtabs.find((s) => s.id === subtabId) || null;

  const modeLabel = modeConfig ? modeConfig.label : mode;
  const subtabLabel = subtabConfig ? subtabConfig.title : subtabId;

  const html = `
    <section class="analysis-wrapper">
      <header class="analysis-header">
        <h3 class="analysis-title">${modeLabel} • ${subtabLabel}</h3>
        <p class="analysis-label">
          Passage: <strong>${passage || "(no passage detected)"}</strong>
        </p>
      </header>

      <div class="analysis-section">
        <h4>Prototype View</h4>
        <p>
          This is a <strong>safe prototype placeholder</strong>. In the full app,
          this region will:
        </p>
        <ul>
          <li>Display the Scripture text (with appropriate layout and versions).</li>
          <li>Render the analysis results for this SubTab (syntax, discourse, visual, etc.).</li>
          <li>Coordinate with the notes panel and any visualizations.</li>
        </ul>
        <p>
          For now, we are testing:
        </p>
        <ul>
          <li>The <em>collapsible left pane</em> behavior.</li>
          <li>The <em>two-step flow</em> (passage → subtab).</li>
          <li>The <em>automatic collapse</em> of the pane after initiating analysis.</li>
          <li>The <em>breadcrumb bar</em> showing Mode → SubTab | Passage.</li>
        </ul>
      </div>
    </section>
  `;

  contentArea.innerHTML = html;
}

// ==============================
// BREADCRUMB LOGIC
// ==============================

function updateBreadcrumb() {
  const modeConfig = MODE_CONFIG[AppState.currentMode];
  const modeLabel = modeConfig ? modeConfig.label : AppState.currentMode;

  let subtabLabel = "";
  if (AppState.currentSubtab && modeConfig) {
    const sub = modeConfig.subtabs.find(
      (s) => s.id === AppState.currentSubtab
    );
    if (sub) subtabLabel = sub.title;
  }

  const passage = AppState.currentPassage;

  let text = "";
  if (modeLabel) {
    text += `<span>${modeLabel}</span>`;
  }
  if (subtabLabel) {
    text += ` &nbsp;→&nbsp; <span>${subtabLabel}</span>`;
  }
  if (passage) {
    text += ` &nbsp;|&nbsp; <span>${passage}</span>`;
  }

  breadcrumbBar.innerHTML = text || "Select a mode to begin.";
}

// ==============================
// PANE COLLAPSE / EXPAND
// ==============================

function collapseSidePane() {
  if (!sidePane) return;
  sidePane.classList.add("collapsed");
  sidePane.classList.remove("open");
  AppState.paneOpen = false;

  if (paneToggleBtn) {
    paneToggleBtn.style.display = "block";
  }
}

function openSidePane() {
  if (!sidePane) return;
  sidePane.classList.remove("collapsed");
  sidePane.classList.add("open");
  AppState.paneOpen = true;

  if (paneToggleBtn) {
    paneToggleBtn.style.display = "none";
  }
}
