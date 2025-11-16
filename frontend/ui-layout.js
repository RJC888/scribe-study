// ui-layout.js
// Handles: top panel expansion, notes panel, Tier 2 visualization mode,
//          basic help popup toggling.

document.addEventListener("DOMContentLoaded", () => {
  // TOP PANELS: SCRIPTURE / ANALYSIS EXPANSION
  const scripturePanel = document.getElementById("scripturePanel");
  const analysisPanel = document.getElementById("analysisPanel");

  document.querySelectorAll(".expandBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    const scripturePanel = document.getElementById("scripturePanel");
    const analysisPanel = document.getElementById("analysisPanel");

    const NEUTRAL = () => {
      scripturePanel.classList.remove("expanded", "minimized");
      analysisPanel.classList.remove("expanded", "minimized");
    };

    if (target === "scripture") {
      // If already expanded → reset to neutral 50/50
      if (scripturePanel.classList.contains("expanded")) {
        NEUTRAL();
        return;
      }

      // Else expand Scripture
      scripturePanel.classList.add("expanded");
      scripturePanel.classList.remove("minimized");

      analysisPanel.classList.add("minimized");
      analysisPanel.classList.remove("expanded");
    }

    if (target === "analysis") {
      // If already expanded → reset to neutral 50/50
      if (analysisPanel.classList.contains("expanded")) {
        NEUTRAL();
        return;
      }

      // Else expand Analysis
      analysisPanel.classList.add("expanded");
      analysisPanel.classList.remove("minimized");

      scripturePanel.classList.add("minimized");
      scripturePanel.classList.remove("expanded");
    }
  });
});

  // PASSAGE DRAWER TOGGLE
  const togglePassageDrawerBtn = document.getElementById("togglePassageDrawerBtn");
  const passageDrawer = document.getElementById("passageDrawer");
  if (togglePassageDrawerBtn && passageDrawer) {
    togglePassageDrawerBtn.addEventListener("click", () => {
      const isHidden = passageDrawer.classList.contains("hidden");
      passageDrawer.classList.toggle("hidden", !isHidden);
      togglePassageDrawerBtn.textContent = isHidden
        ? "Hide full passage ▲"
        : "Show full passage ▼";
    });
  }

  // NOTES PANEL TOGGLE
  const notesBar = document.getElementById("notesBar");
  const notesPanel = document.getElementById("notesPanel");
  const expandNotesBtn = document.getElementById("expandNotesBtn");
  const collapseNotesBtn = document.getElementById("collapseNotesBtn");

  if (expandNotesBtn && notesPanel) {
    expandNotesBtn.addEventListener("click", () => {
      notesPanel.classList.remove("hidden");
    });
  }
  if (collapseNotesBtn && notesPanel) {
    collapseNotesBtn.addEventListener("click", () => {
      notesPanel.classList.add("hidden");
    });
  }

  // TIER 2 VISUALIZATION MODE
  const workspace = document.getElementById("workspace");
  const visualizationMode = document.getElementById("visualizationMode");
  const enterVisualizationBtn = document.getElementById("enterVisualizationModeBtn");
  const exitVisualizationBtn = document.getElementById("exitVisualizationBtn");

  function enterVisualizationMode() {
    if (!workspace || !visualizationMode) return;
    workspace.classList.add("hidden");
    visualizationMode.classList.remove("hidden");
    // TODO: hook your Tier 2 engine to #visualizationCanvas
  }

  function exitVisualizationModeFn() {
    if (!workspace || !visualizationMode) return;
    visualizationMode.classList.add("hidden");
    workspace.classList.remove("hidden");
  }

  if (enterVisualizationBtn) {
    enterVisualizationBtn.addEventListener("click", enterVisualizationMode);
  }
  if (exitVisualizationBtn) {
    exitVisualizationBtn.addEventListener("click", exitVisualizationModeFn);
  }

  // HELP POPUP
  const helpPageBtn = document.getElementById("helpPageBtn");
  const helpPopup = document.getElementById("helpPopup");
  const helpCloseBtn = document.getElementById("helpCloseBtn");
  const helpSendBtn = document.getElementById("helpSendBtn");
  const helpQuestionInput = document.getElementById("helpQuestionInput");
  const helpResponse = document.getElementById("helpResponse");

  function openHelpPopup() {
    if (!helpPopup) return;
    helpPopup.classList.remove("hidden");
  }

  function closeHelpPopup() {
    if (!helpPopup) return;
    helpPopup.classList.add("hidden");
  }

  if (helpPageBtn && helpPopup) {
    helpPageBtn.addEventListener("click", openHelpPopup);
  }
  if (helpCloseBtn && helpPopup) {
    helpCloseBtn.addEventListener("click", closeHelpPopup);
  }

  if (helpSendBtn && helpQuestionInput && helpResponse) {
    helpSendBtn.addEventListener("click", () => {
      const q = helpQuestionInput.value.trim();
      if (!q) {
        helpResponse.textContent = "Please enter a question first.";
        return;
      }
      // Placeholder – later this will call the LLM with full page context
      helpResponse.textContent =
        "Great question! (Here is where your contextual explanation would appear.)";
    });
  }

  // SUGGESTED QUESTIONS (simple placeholder)
  const suggestedQuestionsBar = document.getElementById("suggestedQuestionsBar");
  if (suggestedQuestionsBar) {
    const sample = [
      "What is the main idea of this passage?",
      "How does the structure support the meaning?",
      "What is the role of this visualization?",
      "How can I apply this today?"
    ];
    suggestedQuestionsBar.innerHTML = "";
    sample.forEach((text) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.type = "button";
      btn.addEventListener("click", () => {
        if (helpQuestionInput && helpPopup) {
          helpQuestionInput.value = text;
          helpPopup.classList.remove("hidden");
        }
      });
      suggestedQuestionsBar.appendChild(btn);
    });
  }
});
