// =====================================================
// Scribe Study Prototype – Collapsible Pane + 2-Step Flow
// No Firebase, no AI calls – just layout & behavior.
// =====================================================

import { PROMPT_REGISTRY } from './promptRegistry.js';

const AppState = {
  currentMode: "devotional",
  currentSubtab: null,
  currentPassage: "",
  currentVersion: "web",
  paneOpen: true,
};

// Make AppState accessible to other modules
window.AppState = AppState;

// Configuration for modules and subtabs (NEW STRUCTURE - 6 modules)
const MODE_CONFIG = {
  devotional: {
    label: "Devotional",
    description: "Spiritual depth and transformative reflection through Scripture",
    subtabs: [
      { id: "spiritual_analysis", title: "Spiritual Analysis", desc: "Explore spiritual truths and divine principles", icon: "🙏" },
      { id: "devotional_reflection", title: "Devotional Reflection", desc: "Personal meditation and prayerful response", icon: "📖" },
      { id: "discipleship", title: "Discipleship", desc: "Growth in following Christ and obedience", icon: "👥" },
      { id: "redemptive_focus", title: "Redemptive Focus", desc: "How Christ's redemption is revealed", icon: "✨" },
      { id: "life_application", title: "Life Application", desc: "Practical transformation and living truth", icon: "💡" },
    ],
  },
  "text-analysis": {
    label: "Text Analysis",
    description: "Structural, literary, and linguistic depth of Scripture",
    subtabs: [
      { id: "overview", title: "Overview", desc: "High-level passage summary and context", icon: "🔍" },
      { id: "structure", title: "Structure", desc: "Outline and organizational flow", icon: "📋" },
      { id: "literary_devices", title: "Literary Devices", desc: "Metaphor, symbolism, and rhetorical patterns", icon: "🎨" },
      { id: "discourse", title: "Discourse", desc: "Argument flow and logical progression", icon: "💬" },
      { id: "semantic_outline", title: "Semantic Outline", desc: "Meaning-based structural breakdown", icon: "📊" },
      { id: "key_words", title: "Key Words", desc: "Significant terms and their significance", icon: "🏷️" },
    ],
  },
  "original-languages": {
    label: "Original Languages",
    description: "Greek, Hebrew, and linguistic depth",
    subtabs: [
      { id: "greek_hebrew", title: "Greek/Hebrew", desc: "Original language terms and meanings", icon: "Ἑ" },
      { id: "morphology", title: "Morphology", desc: "Word forms, tenses, and grammatical structures", icon: "🔬" },
      { id: "grammar_essentials", title: "Grammar Essentials ⭐", desc: "Essential grammatical patterns", icon: "📚" },
      { id: "advanced_grammar", title: "Advanced Grammar ⭐", desc: "Complex grammatical constructions", icon: "🧠" },
      { id: "verse_by_verse", title: "Verse-by-Verse", desc: "Detailed analysis of each phrase", icon: "📝" },
      { id: "semantic_range", title: "Semantic Range", desc: "Range of meanings and usage", icon: "🌐" },
    ],
  },
  context: {
    label: "Context",
    description: "Historical, cultural, and theological background",
    subtabs: [
      { id: "historical_cultural", title: "Historical-Cultural", desc: "First-century world and customs", icon: "🏛️" },
      { id: "geographical", title: "Geographical", desc: "Maps, places, and travel routes", icon: "🗺️" },
      { id: "theological", title: "Theological", desc: "Theological themes and tensions", icon: "⛪" },
      { id: "cross_references", title: "Cross-References", desc: "Related passages and parallels", icon: "🔗" },
      { id: "literary_context", title: "Literary", desc: "Book setting and narrative context", icon: "📖" },
    ],
  },
  "jewish-background": {
    label: "Jewish Background",
    description: "Second Temple Judaism and Jewish thought",
    subtabs: [
      { id: "second_temple", title: "Second Temple", desc: "Temple period practices and beliefs", icon: "🕌" },
      { id: "rabbinic", title: "Rabbinic", desc: "Rabbinic interpretation and tradition", icon: "📜" },
      { id: "dead_sea_scrolls", title: "Dead Sea Scrolls", desc: "DSS parallels and insights", icon: "🏜️" },
      { id: "pseudepigrapha", title: "Pseudepigrapha", desc: "Jewish apocryphal literature", icon: "📚" },
    ],
  },
  teaching: {
    label: "Teaching",
    description: "Resources for teaching and proclaiming Scripture",
    subtabs: [
      { id: "sermon_outline", title: "Sermon Outline", desc: "Structured outline for preaching", icon: "🎤" },
      { id: "lesson_plan", title: "Lesson Plan", desc: "Educational lesson structure", icon: "✏️" },
      { id: "discussion_questions", title: "Discussion Questions", desc: "Questions for group study", icon: "❓" },
      { id: "illustrations", title: "Illustrations", desc: "Stories and examples for teaching", icon: "📚" },
      { id: "teaching_points", title: "Teaching Points", desc: "Key takeaways and insights", icon: "⭐" },
    ],
  },
};

// DOM references (NEW MODAL SYSTEM)
let mainTabButtons;
let subtabModal;
let subtabModalOverlay;
let subtabModalCloseBtn;
let subtabModalTitle;
let subtabGrid;

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  attachGlobalEvents();
  initializeVersionSelector();
  initializePassageInput();
  initializePassageDrawer();
  initializeZoomControls();
  // Set initial mode and welcome screen
  //setMode("devotional");
});

// Cache DOM elements once
function cacheDom() {
  mainTabButtons = Array.from(
    document.querySelectorAll("#moduleTabsBar .module-tab")
  );
  subtabModal = document.getElementById("subtabModal");
  subtabModalOverlay = document.getElementById("subtabModalOverlay");
  subtabModalCloseBtn = document.getElementById("subtabModalCloseBtn");
  subtabModalTitle = document.getElementById("subtabModalTitle");
  subtabGrid = document.getElementById("subtabGrid");
}

// Attach listeners for module tabs and modal
function attachGlobalEvents() {
  // Module tab buttons: show subtab modal
  mainTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const module = btn.dataset.module;
      showSubtabModal(module);
    });
  });

  // Close modal via X button
  if (subtabModalCloseBtn) {
    subtabModalCloseBtn.addEventListener("click", () => {
      closeSubtabModal();
    });
  }

  // Close modal when clicking overlay
  if (subtabModalOverlay) {
    subtabModalOverlay.addEventListener("click", () => {
      closeSubtabModal();
    });
  }
}

// ==============================
// MODE + MODAL LOGIC
// ==============================

function showSubtabModal(module) {
  console.log('🔍 showSubtabModal called for:', module);
  const config = MODE_CONFIG[module];
  if (!config) {
    console.warn('Unknown module:', module);
    return;
  }
  
  AppState.currentMode = module;
  console.log('✓ Module config found:', config.label);
  
  // Update modal title
  if (subtabModalTitle) {
    subtabModalTitle.textContent = config.label;
    console.log('📝 Modal title set to:', config.label);
  }
  
  // Populate subtab grid
  if (subtabGrid) {
    console.log('📊 Populating subtab grid with', config.subtabs.length, 'subtabs');
    subtabGrid.innerHTML = config.subtabs.map(subtab => `
      <div class="subtab-card-item" data-subtab="${subtab.id}">
        <div class="subtab-card-icon">${subtab.icon || '📖'}</div>
        <div class="subtab-card-title">${subtab.title}</div>
        <div class="subtab-card-desc">${subtab.desc}</div>
        <div class="subtab-depth-buttons">
          <button class="depth-btn dig-in" data-depth="dig-in">📝 Dig In</button>
          <button class="depth-btn deep-dive" data-depth="deep-dive">🔍 Deep Dive</button>
        </div>
      </div>
    `).join('');
    console.log('✓ Subtab grid populated');
    
    // Attach click listeners to depth buttons
    const depthButtons = subtabGrid.querySelectorAll('.depth-btn');
    console.log('🔗 Attaching listeners to', depthButtons.length, 'depth buttons');
    depthButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent card click
        const card = btn.closest('.subtab-card-item');
        const subtabId = card.dataset.subtab;
        const depth = btn.dataset.depth;
        const passage = AppState.currentPassage;
        
        if (!passage) {
          alert('Please enter a passage in the Scripture panel first');
          return;
        }
        
        // Close modal
        closeSubtabModal();
        
        // Run analysis with depth
        try {
          const { runAnalysis } = await import('./analysisEngine.js');
          await runAnalysis(module, subtabId, passage, depth);
        } catch (err) {
          console.error('❌ Error running analysis:', err);
          alert('Error running analysis. Check console for details.');
        }
      });
    });
  }
  
  // Show modal
  if (subtabModal) {
    console.log('🎬 Showing modal');
    subtabModal.classList.remove('hidden');
  } else {
    console.warn('⚠️ subtabModal element not found');
  }
}

function closeSubtabModal() {
  if (subtabModal) {
    subtabModal.classList.add('hidden');
  }
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
    card.addEventListener("click", async () => {
      if (card.classList.contains("disabled")) return;

      const subtabId = card.dataset.subtab;
      AppState.currentSubtab = subtabId;

      // Get the passage text
      const passageText = passageInput.value.trim();
      if (!passageText) {
        alert("Please enter a passage first");
        return;
      }

      // Import and run analysis
      const { runAnalysis } = await import('./analysisEngine.js');
      
      // Call the analysis engine
      await runAnalysis(AppState.currentMode, subtabId, passageText);
      
      // Update breadcrumb
      updateBreadcrumb();
      
      // Auto-collapse the side pane
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

// Update breadcrumb/status display
function updateBreadcrumb() {
  const config = MODE_CONFIG[AppState.currentMode];
  const modeLabel = config ? config.label : AppState.currentMode;
  const passage = AppState.currentPassage;

  console.log('📍 Mode:', modeLabel, '| Passage:', passage);
}

// ==============================
// PANE / MODAL HELPERS
// ==============================

function collapseSidePane() {
  if (subtabModal) {
    subtabModal.classList.add('hidden');
  }
}

function openSidePane() {
  // Not needed in new modal system
}

// ==============================
// MODULE TAB MODAL LOGIC
// ==============================

function initializeModuleTabModal() {
  // Modal system is now initialized via attachGlobalEvents()
}

// ==============================
async function initializePassageInput() {
  try {
    const passageInput = document.getElementById("passageInput");
    console.log('📄 Initializing passage input:', !!passageInput);
    
    if (!passageInput) return;
    
    // Import analysis engine at initialization time
    let fetchAndDisplayScripture = null;
    try {
      const module = await import('./analysisEngine.js');
      fetchAndDisplayScripture = module.fetchAndDisplayScripture;
    } catch (e) {
      console.error('⚠️ Could not load analysisEngine:', e);
    }
    
    passageInput.addEventListener("input", (e) => {
      try {
        if (AppState && typeof AppState === 'object') {
          AppState.currentPassage = e.target.value.trim();
          console.log('✍️ Passage updated:', AppState.currentPassage);
        }
      } catch (err) {
        console.error('❌ Error updating passage:', err);
      }
    });
    
    passageInput.addEventListener("keypress", (e) => {
      try {
        if (e.key === "Enter") {
          const passage = AppState?.currentPassage;
          console.log('⏎ Enter pressed on passage input:', passage);
          
          if (passage && fetchAndDisplayScripture) {
            const fullPassageText = document.getElementById('fullPassageText');
            const passageDrawer = document.getElementById('passageDrawer');
            if (fullPassageText) {
              console.log('📖 Fetching Scripture independently for:', passage);
              // Show loading state
              fullPassageText.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">⏳ Loading Scripture...</div>';
              // Auto-expand the passage drawer
              if (passageDrawer) {
                console.log('📂 Expanding passage drawer');
                passageDrawer.classList.remove('hidden');
              }
              console.log('🔄 Calling fetchAndDisplayScripture...');
              fetchAndDisplayScripture(passage, fullPassageText);
            } else {
              console.warn('⚠️ fullPassageText element not found');
            }
          } else {
            console.warn('⚠️ Missing passage or fetchAndDisplayScripture. passage:', passage, 'fn:', !!fetchAndDisplayScripture);
          }
          
          // Focus on first module tab
          const firstTab = document.querySelector(".module-tab");
          if (firstTab) {
            firstTab.focus();
          }
        }
      } catch (err) {
        console.error('❌ Error on Enter key:', err);
      }
    });
  } catch (error) {
    console.error('❌ Error initializing passage input:', error);
  }
}

// ==============================
// PASSAGE DRAWER TOGGLE
// ==============================
function initializePassageDrawer() {
  const toggleBtn = document.getElementById('togglePassageDrawerBtn');
  const passageDrawer = document.getElementById('passageDrawer');
  
  if (!toggleBtn || !passageDrawer) return;
  
  toggleBtn.addEventListener('click', () => {
    console.log('🔀 Toggle passage drawer clicked');
    passageDrawer.classList.toggle('hidden');
    // Update button text
    if (passageDrawer.classList.contains('hidden')) {
      toggleBtn.textContent = 'Show full passage ▼';
    } else {
      toggleBtn.textContent = 'Hide full passage ▲';
    }
  });
}

// ==============================
// VERSION SELECTOR INITIALIZATION
// ==============================
function initializeVersionSelector() {
  try {
    const versionSelector = document.getElementById('versionSelector');
    if (!versionSelector) {
      console.warn('⚠️ versionSelector element not found');
      return;
    }
    
    // Restore saved version from localStorage
    const savedVersion = localStorage.getItem('bibleVersion') || 'web';
    versionSelector.value = savedVersion;
    if (AppState && typeof AppState === 'object') {
      AppState.currentVersion = savedVersion;
    }
    console.log('📖 Restored Bible version from storage:', savedVersion);
    
    // Listen for version changes
    versionSelector.addEventListener('change', async (e) => {
      try {
        const newVersion = e.target.value;
        if (AppState && typeof AppState === 'object') {
          AppState.currentVersion = newVersion;
        }
        localStorage.setItem('bibleVersion', newVersion);
        console.log('📖 Bible version changed to:', newVersion);
        
        // Re-fetch current passage in new version
        const passage = AppState?.currentPassage;
        if (passage) {
          const fullPassageText = document.getElementById('fullPassageText');
          if (fullPassageText) {
            fullPassageText.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">⏳ Loading Scripture in new version...</div>';
            try {
              const { fetchAndDisplayScripture } = await import('./analysisEngine.js');
              if (fetchAndDisplayScripture) {
                fetchAndDisplayScripture(passage, fullPassageText);
              }
            } catch (importError) {
              console.error('⚠️ Failed to import analysisEngine:', importError);
            }
          }
        }
      } catch (changeError) {
        console.error('❌ Error handling version change:', changeError);
      }
    });
  } catch (error) {
    console.error('❌ Error initializing version selector:', error);
  }
}

// ==============================
// ZOOM CONTROLS INITIALIZATION
// ==============================
const ZoomState = {
  level: 100, // percentage
};

function initializeZoomControls() {
  const zoomDecreaseBtn = document.getElementById("zoomDecreaseBtn");
  const zoomIncreaseBtn = document.getElementById("zoomIncreaseBtn");
  const zoomLevel = document.getElementById("zoomLevel");
  
  if (!zoomDecreaseBtn || !zoomIncreaseBtn) return;
  
  function updateZoom() {
    zoomLevel.textContent = ZoomState.level + "%";
    
    // Apply zoom to both Scripture and Analysis content
    const scriptureContent = document.getElementById("scriptureContent");
    const analysisContent = document.getElementById("analysisContent");
    
    const zoomFactor = ZoomState.level / 100;
    
    if (scriptureContent) {
      scriptureContent.style.fontSize = (13 * zoomFactor) + "px";
    }
    
    if (analysisContent) {
      analysisContent.style.fontSize = (13 * zoomFactor) + "px";
    }
  }
  
  zoomDecreaseBtn.addEventListener("click", () => {
    if (ZoomState.level > 60) {
      ZoomState.level -= 10;
      updateZoom();
    }
  });
  
  zoomIncreaseBtn.addEventListener("click", () => {
    if (ZoomState.level < 150) {
      ZoomState.level += 10;
      updateZoom();
    }
  });
  
  // Initialize zoom display
  updateZoom();
}
