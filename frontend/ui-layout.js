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

/* -----------------------------------------------
   DYNAMIC SUGGESTED QUESTIONS SYSTEM
------------------------------------------------- */

function updateSuggestedQuestions(context) {
  const bar = document.getElementById("suggestedQuestionsBar");
  if (!bar) return;

  bar.innerHTML = ""; // Clear previous suggestions

  let suggestions = [];

  // 1. Based on Mode (Devotional / Academic / Visual)
  if (context.mode === "Academic") {
    suggestions.push(
      "What is the structure of this passage?",
      "How does the author develop the argument?",
      "What are the key Greek or Hebrew terms here?"
    );
  }

  if (context.mode === "Devotional") {
    suggestions.push(
      "What does this teach about God's character?",
      "How should this shape my heart today?",
      "What is the main truth for my life?"
    );
  }

  if (context.mode === "Visual") {
    suggestions.push(
      "Can you show the structure visually?",
      "What patterns can I see in this text?",
      "Show connections to other passages."
    );
  }

  // 2. Based on Subtab
  if (context.subtab === "Syntax") {
    suggestions.push("Explain the syntax step-by-step.");
  }
  if (context.subtab === "Discourse") {
    suggestions.push("Show the discourse flow.");
  }

  // 3. Based on AI output summary (optional)
  if (context.aiOutputSummary?.includes("chiasm")) {
    suggestions.push("Show the chiastic structure visually.");
  }
  if (context.aiOutputSummary?.includes("shift")) {
    suggestions.push("Explain the theme shift.");
  }

  // 4. Based on last user question
  if (context.lastUserQuestion) {
    suggestions.push(`What follows from: "${context.lastUserQuestion}" ?`);
  }

  // Render suggestions
  suggestions.forEach((text) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = "suggestedQuestionBtn";
    btn.addEventListener("click", () => {
      const helpInput = document.getElementById("helpQuestionInput");
      const helpPopup = document.getElementById("helpPopup");

      if (helpInput) helpInput.value = text;
      if (helpPopup) helpPopup.classList.remove("hidden");
    });

    bar.appendChild(btn);
  });
}

// Make available globally (so app.js can call it)
window.updateSuggestedQuestions = updateSuggestedQuestions;

});  // ← Correct alignment closes DOMContentLoaded
