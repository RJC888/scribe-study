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
  currentDepth: 'dig-in',
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
let analysisDepthButtons = [];

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  attachGlobalEvents();
  initializeServerStatusWidget();
  initializeVersionSelector();
  initializePassageInput();
  initializeAnalysisDepthControls();
  initializeZoomControls();
  initializeAnalysisTabs();
  initializeVisualizationMode();
  initializeHelpModal();
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
  // Persona selector
  const personaSelect = document.getElementById('personaSelect');
  if (personaSelect) {
    personaSelect.addEventListener('change', (e) => {
      const persona = e.target.value;
      AppState.currentPersona = persona;
      
      // Update the persona selector's data attribute for CSS styling
      const personaSelectorDiv = document.getElementById('personaSelector');
      if (personaSelectorDiv) {
        personaSelectorDiv.setAttribute('data-persona', persona);
      }
      
      console.log('🎭 Persona changed to:', persona);
      // You can add persona-specific logic here (change analysis depth, prompts, etc.)
    });
    
    // Initialize with current persona
    const initialPersona = personaSelect.value;
    const personaSelectorDiv = document.getElementById('personaSelector');
    if (personaSelectorDiv) {
      personaSelectorDiv.setAttribute('data-persona', initialPersona);
    }
  }

  // =========================================================
  // DARK MODE TOGGLE
  // =========================================================
  initializeDarkMode();

  // =========================================================
  // FAVORITES SYSTEM
  // =========================================================
  initializeFavorites();

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
          AppState.currentSubtab = subtabId;
          AppState.currentDepth = depth;
          setActiveAnalysisDepth(depth);
          await runAnalysis(module, subtabId, passage, depth);
          updateBreadcrumb();
          collapseSidePane();
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
      AppState.currentDepth = 'dig-in';
      setActiveAnalysisDepth('dig-in');

      // Get the passage text
      const passageText = passageInput.value.trim();
      if (!passageText) {
        alert("Please enter a passage first");
        return;
      }

      // Import and run analysis
      const { runAnalysis } = await import('./analysisEngine.js');
      
      // Call the analysis engine
      await runAnalysis(AppState.currentMode, subtabId, passageText, AppState.currentDepth);
      
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
// ==============================
// BIBLE BOOK DATA FOR AUTOCOMPLETE
// ==============================
const BIBLE_BOOKS = [
  { name: 'Genesis', abbrevs: ['gen', 'ge', 'gn'], chapters: 50, testament: 'OT' },
  { name: 'Exodus', abbrevs: ['exod', 'exo', 'ex'], chapters: 40, testament: 'OT' },
  { name: 'Leviticus', abbrevs: ['lev', 'le', 'lv'], chapters: 27, testament: 'OT' },
  { name: 'Numbers', abbrevs: ['num', 'nu', 'nm', 'nb'], chapters: 36, testament: 'OT' },
  { name: 'Deuteronomy', abbrevs: ['deut', 'de', 'dt'], chapters: 34, testament: 'OT' },
  { name: 'Joshua', abbrevs: ['josh', 'jos', 'jsh'], chapters: 24, testament: 'OT' },
  { name: 'Judges', abbrevs: ['judg', 'jdg', 'jg', 'jdgs'], chapters: 21, testament: 'OT' },
  { name: 'Ruth', abbrevs: ['rth', 'ru'], chapters: 4, testament: 'OT' },
  { name: '1 Samuel', abbrevs: ['1sam', '1sa', '1s', 'i sam', 'i sa', '1 sm', '1st samuel'], chapters: 31, testament: 'OT' },
  { name: '2 Samuel', abbrevs: ['2sam', '2sa', '2s', 'ii sam', 'ii sa', '2 sm', '2nd samuel'], chapters: 24, testament: 'OT' },
  { name: '1 Kings', abbrevs: ['1kgs', '1ki', '1k', 'i kgs', 'i ki', '1st kings'], chapters: 22, testament: 'OT' },
  { name: '2 Kings', abbrevs: ['2kgs', '2ki', '2k', 'ii kgs', 'ii ki', '2nd kings'], chapters: 25, testament: 'OT' },
  { name: '1 Chronicles', abbrevs: ['1chr', '1ch', 'i chr', 'i ch', '1st chronicles'], chapters: 29, testament: 'OT' },
  { name: '2 Chronicles', abbrevs: ['2chr', '2ch', 'ii chr', 'ii ch', '2nd chronicles'], chapters: 36, testament: 'OT' },
  { name: 'Ezra', abbrevs: ['ezr', 'ez'], chapters: 10, testament: 'OT' },
  { name: 'Nehemiah', abbrevs: ['neh', 'ne'], chapters: 13, testament: 'OT' },
  { name: 'Esther', abbrevs: ['esth', 'est', 'es'], chapters: 10, testament: 'OT' },
  { name: 'Job', abbrevs: ['jb'], chapters: 42, testament: 'OT' },
  { name: 'Psalms', abbrevs: ['ps', 'psa', 'pss', 'psalm'], chapters: 150, testament: 'OT' },
  { name: 'Proverbs', abbrevs: ['prov', 'pro', 'pr', 'prv'], chapters: 31, testament: 'OT' },
  { name: 'Ecclesiastes', abbrevs: ['eccl', 'ecc', 'ec', 'qoh'], chapters: 12, testament: 'OT' },
  { name: 'Song of Solomon', abbrevs: ['song', 'sos', 'ss', 'sol', 'sg', 'canticles'], chapters: 8, testament: 'OT' },
  { name: 'Isaiah', abbrevs: ['isa', 'is'], chapters: 66, testament: 'OT' },
  { name: 'Jeremiah', abbrevs: ['jer', 'je', 'jr'], chapters: 52, testament: 'OT' },
  { name: 'Lamentations', abbrevs: ['lam', 'la'], chapters: 5, testament: 'OT' },
  { name: 'Ezekiel', abbrevs: ['ezek', 'eze', 'ezk'], chapters: 48, testament: 'OT' },
  { name: 'Daniel', abbrevs: ['dan', 'da', 'dn'], chapters: 12, testament: 'OT' },
  { name: 'Hosea', abbrevs: ['hos', 'ho'], chapters: 14, testament: 'OT' },
  { name: 'Joel', abbrevs: ['jl'], chapters: 3, testament: 'OT' },
  { name: 'Amos', abbrevs: ['am'], chapters: 9, testament: 'OT' },
  { name: 'Obadiah', abbrevs: ['obad', 'ob'], chapters: 1, testament: 'OT' },
  { name: 'Jonah', abbrevs: ['jon', 'jnh'], chapters: 4, testament: 'OT' },
  { name: 'Micah', abbrevs: ['mic', 'mc'], chapters: 7, testament: 'OT' },
  { name: 'Nahum', abbrevs: ['nah', 'na'], chapters: 3, testament: 'OT' },
  { name: 'Habakkuk', abbrevs: ['hab', 'hb'], chapters: 3, testament: 'OT' },
  { name: 'Zephaniah', abbrevs: ['zeph', 'zep', 'zp'], chapters: 3, testament: 'OT' },
  { name: 'Haggai', abbrevs: ['hag', 'hg'], chapters: 2, testament: 'OT' },
  { name: 'Zechariah', abbrevs: ['zech', 'zec', 'zc'], chapters: 14, testament: 'OT' },
  { name: 'Malachi', abbrevs: ['mal', 'ml'], chapters: 4, testament: 'OT' },
  { name: 'Matthew', abbrevs: ['matt', 'mat', 'mt'], chapters: 28, testament: 'NT' },
  { name: 'Mark', abbrevs: ['mrk', 'mk', 'mr'], chapters: 16, testament: 'NT' },
  { name: 'Luke', abbrevs: ['luk', 'lk'], chapters: 24, testament: 'NT' },
  { name: 'John', abbrevs: ['jhn', 'jn'], chapters: 21, testament: 'NT' },
  { name: 'Acts', abbrevs: ['act', 'ac'], chapters: 28, testament: 'NT' },
  { name: 'Romans', abbrevs: ['rom', 'ro', 'rm'], chapters: 16, testament: 'NT' },
  { name: '1 Corinthians', abbrevs: ['1cor', '1co', 'i cor', 'i co', '1st corinthians'], chapters: 16, testament: 'NT' },
  { name: '2 Corinthians', abbrevs: ['2cor', '2co', 'ii cor', 'ii co', '2nd corinthians'], chapters: 13, testament: 'NT' },
  { name: 'Galatians', abbrevs: ['gal', 'ga'], chapters: 6, testament: 'NT' },
  { name: 'Ephesians', abbrevs: ['eph', 'ep'], chapters: 6, testament: 'NT' },
  { name: 'Philippians', abbrevs: ['phil', 'php', 'pp'], chapters: 4, testament: 'NT' },
  { name: 'Colossians', abbrevs: ['col', 'co'], chapters: 4, testament: 'NT' },
  { name: '1 Thessalonians', abbrevs: ['1thess', '1th', 'i thess', 'i th', '1st thessalonians'], chapters: 5, testament: 'NT' },
  { name: '2 Thessalonians', abbrevs: ['2thess', '2th', 'ii thess', 'ii th', '2nd thessalonians'], chapters: 3, testament: 'NT' },
  { name: '1 Timothy', abbrevs: ['1tim', '1ti', 'i tim', 'i ti', '1st timothy'], chapters: 6, testament: 'NT' },
  { name: '2 Timothy', abbrevs: ['2tim', '2ti', 'ii tim', 'ii ti', '2nd timothy'], chapters: 4, testament: 'NT' },
  { name: 'Titus', abbrevs: ['tit', 'ti'], chapters: 3, testament: 'NT' },
  { name: 'Philemon', abbrevs: ['phlm', 'phm', 'pm'], chapters: 1, testament: 'NT' },
  { name: 'Hebrews', abbrevs: ['heb', 'he'], chapters: 13, testament: 'NT' },
  { name: 'James', abbrevs: ['jas', 'jm'], chapters: 5, testament: 'NT' },
  { name: '1 Peter', abbrevs: ['1pet', '1pe', '1pt', 'i pet', 'i pe', '1st peter'], chapters: 5, testament: 'NT' },
  { name: '2 Peter', abbrevs: ['2pet', '2pe', '2pt', 'ii pet', 'ii pe', '2nd peter'], chapters: 3, testament: 'NT' },
  { name: '1 John', abbrevs: ['1jn', '1jo', 'i jn', 'i jo', '1st john'], chapters: 5, testament: 'NT' },
  { name: '2 John', abbrevs: ['2jn', '2jo', 'ii jn', 'ii jo', '2nd john'], chapters: 1, testament: 'NT' },
  { name: '3 John', abbrevs: ['3jn', '3jo', 'iii jn', 'iii jo', '3rd john'], chapters: 1, testament: 'NT' },
  { name: 'Jude', abbrevs: ['jud', 'jd'], chapters: 1, testament: 'NT' },
  { name: 'Revelation', abbrevs: ['rev', 're', 'rv', 'apocalypse'], chapters: 22, testament: 'NT' }
];

// Autocomplete state
let autocompleteState = {
  activeIndex: -1,
  suggestions: [],
  selectedBook: null
};

// Common pericopes (text units) for quick reference
const COMMON_PERICOPES = {
  'Matthew': {
    '5': ['5:1-12 Beatitudes', '5:3-12 Blessings', '5:21-48 Antitheses'],
    '6': ['6:1-18 Practices of piety', '6:9-13 Lord\'s Prayer'],
    '25': ['25:31-46 Judgment of Nations']
  },
  'Mark': {
    '1': ['1:1-15 Prologue', '1:40-45 Leper healed']
  },
  'Luke': {
    '1': ['1:26-38 Annunciation', '1:46-55 Magnificat'],
    '15': ['15:11-32 Prodigal Son']
  },
  'John': {
    '1': ['1:1-18 Prologue', '1:19-34 Witness of John'],
    '3': ['3:16-18 God\'s love'],
    '11': ['11:1-44 Lazarus']
  }
};

function getAutocompleteSuggestions(input) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return [];
  
  // Only match if input looks like a Bible reference (contains letters or numbers)
  // This prevents matching names from contacts, addresses, etc.
  const hasBookLike = /[a-z]{2,}|^\d{1,2}(?:\s|$)/.test(trimmed);
  if (!hasBookLike) return [];
  
  // Check if user has already selected a book (e.g., "John 3")
  const bookMatch = BIBLE_BOOKS.find(book => {
    const bookLower = book.name.toLowerCase();
    return trimmed.startsWith(bookLower + ' ') || 
           book.abbrevs.some(abbr => trimmed.startsWith(abbr + ' '));
  });
  
  if (bookMatch) {
    // Extract the part after the book name
    const bookNameLower = bookMatch.name.toLowerCase();
    let afterBook = trimmed;
    
    // Remove book name or abbreviation from the start
    for (const abbr of [bookNameLower, ...bookMatch.abbrevs]) {
      if (trimmed.startsWith(abbr + ' ')) {
        afterBook = trimmed.slice(abbr.length).trim();
        break;
      }
    }
    
    const suggestions = [];
    const colonIdx = afterBook.indexOf(':');
    
    // Stage 1: Suggest chapters (e.g., "John 5" or "John 5:")
    if (!colonIdx || colonIdx === afterBook.length - 1) {
      const chapterPart = afterBook.replace(/:.*/, '').trim();
      const typedNum = parseInt(chapterPart) || 0;
      
      for (let ch = 1; ch <= bookMatch.chapters && suggestions.length < 8; ch++) {
        const chStr = ch.toString();
        if (typedNum === 0 || chStr.startsWith(chapterPart)) {
          // Check if this chapter has common pericopes
          const pericopes = COMMON_PERICOPES[bookMatch.name]?.[chStr] || [];
          
          suggestions.push({
            display: `${bookMatch.name} ${ch}`,
            value: `${bookMatch.name} ${ch}`,
            type: 'chapter',
            icon: '📄'
          });
          
          // Add top pericope for this chapter as a sub-suggestion
          if (pericopes.length > 0) {
            suggestions.push({
              display: `  └─ ${pericopes[0]}`,
              value: `${bookMatch.name} ${pericopes[0].split(' ')[0]}`,
              type: 'pericope',
              icon: '✨'
            });
          }
        }
      }
      
      return suggestions;
    }
    
    // Stage 2: User typing chapter:verse (e.g., "John 5:1" or "John 5:1-3")
    if (colonIdx > 0) {
      const chapterPart = afterBook.substring(0, colonIdx).trim();
      const versePart = afterBook.substring(colonIdx + 1).trim();
      const chapter = parseInt(chapterPart);
      
      if (!isNaN(chapter) && chapter >= 1 && chapter <= bookMatch.chapters) {
        // Estimate verses in chapter (typical max is ~50 for longer chapters)
        const maxVersesInChapter = 50;
        
        // Parse version range if it exists (e.g., "1-5")
        const dashIdx = versePart.indexOf('-');
        const startVerse = parseInt(versePart.substring(0, dashIdx === -1 ? versePart.length : dashIdx)) || 0;
        
        // Suggest verse or verse ranges
        if (dashIdx === -1) {
          // Single verse suggestions
          for (let v = startVerse || 1; v <= Math.min(maxVersesInChapter, 10); v++) {
            const vStr = v.toString();
            if (!startVerse || vStr.startsWith(startVerse.toString())) {
              suggestions.push({
                display: `${bookMatch.name} ${chapter}:${v}`,
                value: `${bookMatch.name} ${chapter}:${v}`,
                type: 'verse',
                icon: '📍'
              });
              if (suggestions.length >= 8) break;
            }
          }
        } else {
          // Verse range suggestions (e.g., "1-5", "1-12")
          const endVerse = parseInt(versePart.substring(dashIdx + 1)) || 0;
          const suggestedEnds = [5, 10, 12, 15, 20];
          for (const end of suggestedEnds) {
            if (end >= startVerse) {
              suggestions.push({
                display: `${bookMatch.name} ${chapter}:${startVerse}-${end}`,
                value: `${bookMatch.name} ${chapter}:${startVerse}-${end}`,
                type: 'verse-range',
                icon: '📍'
              });
              if (suggestions.length >= 6) break;
            }
          }
        }
        
        return suggestions;
      }
    }
    
    return [];
  }
  
  // Search for matching books (first stage)
  const matches = [];
  for (const book of BIBLE_BOOKS) {
    const bookLower = book.name.toLowerCase();
    const matchesName = bookLower.startsWith(trimmed);
    const matchesAbbrev = book.abbrevs.some(abbr => abbr.startsWith(trimmed));
    
    if (matchesName || matchesAbbrev) {
      matches.push({
        display: `${book.name} (${book.testament})`,
        value: book.name,
        type: 'book',
        chapters: book.chapters,
        icon: '📖'
      });
      if (matches.length >= 10) break;
    }
  }
  
  return matches;
}

function renderSuggestions(suggestions, container) {
  container.innerHTML = '';
  
  if (suggestions.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  suggestions.forEach((sugg, index) => {
    const li = document.createElement('li');
    li.className = 'suggestion-item' + (index === autocompleteState.activeIndex ? ' active' : '');
    li.dataset.index = index;
    li.dataset.value = sugg.value;
    li.dataset.type = sugg.type;
    
    const icon = sugg.icon || '📖';
    li.innerHTML = `<span class="suggestion-icon">${icon}</span> ${sugg.display}`;
    
    container.appendChild(li);
  });
  
  container.classList.remove('hidden');
}

function selectSuggestion(suggestion, input, container) {
  if (suggestion.type === 'book') {
    // Set book name with space for chapter
    input.value = suggestion.value + ' ';
    autocompleteState.selectedBook = suggestion;
    // Re-trigger to show chapter suggestions
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  } else {
    // Set chapter, verse, or pericope reference
    input.value = suggestion.value;
    container.classList.add('hidden');
    autocompleteState.activeIndex = -1;
    autocompleteState.suggestions = [];
    // Update AppState
    if (AppState && typeof AppState === 'object') {
      AppState.currentPassage = suggestion.value;
    }
  }
  input.focus();
}

async function initializePassageInput() {
  try {
    const passageInput = document.getElementById("passageInput");
    const suggestionsContainer = document.getElementById("passageSuggestions");
    console.log('📄 Initializing passage input:', !!passageInput, 'Suggestions:', !!suggestionsContainer);
    
    if (!passageInput) return;
    
    passageInput.addEventListener("input", (e) => {
      try {
        if (AppState && typeof AppState === 'object') {
          AppState.currentPassage = e.target.value.trim();
          console.log('✍️ Passage updated:', AppState.currentPassage);
        }
        
        // Autocomplete logic
        if (suggestionsContainer) {
          const suggestions = getAutocompleteSuggestions(e.target.value);
          autocompleteState.suggestions = suggestions;
          autocompleteState.activeIndex = -1;
          renderSuggestions(suggestions, suggestionsContainer);
        }
      } catch (err) {
        console.error('❌ Error updating passage:', err);
      }
    });
    
    // Keyboard navigation for autocomplete
    passageInput.addEventListener("keydown", (e) => {
      if (!suggestionsContainer || suggestionsContainer.classList.contains('hidden')) {
        return;
      }
      
      const suggestions = autocompleteState.suggestions;
      if (suggestions.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        autocompleteState.activeIndex = Math.min(autocompleteState.activeIndex + 1, suggestions.length - 1);
        renderSuggestions(suggestions, suggestionsContainer);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        autocompleteState.activeIndex = Math.max(autocompleteState.activeIndex - 1, 0);
        renderSuggestions(suggestions, suggestionsContainer);
      } else if (e.key === 'Enter' && autocompleteState.activeIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[autocompleteState.activeIndex], passageInput, suggestionsContainer);
        return; // Don't let the keypress handler also run
      } else if (e.key === 'Escape') {
        suggestionsContainer.classList.add('hidden');
        autocompleteState.activeIndex = -1;
      } else if (e.key === 'Tab' && autocompleteState.activeIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[autocompleteState.activeIndex], passageInput, suggestionsContainer);
      }
    });
    
    // Click handler for suggestions
    if (suggestionsContainer) {
      suggestionsContainer.addEventListener("click", (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
          const index = parseInt(item.dataset.index);
          const suggestions = autocompleteState.suggestions;
          if (suggestions[index]) {
            selectSuggestion(suggestions[index], passageInput, suggestionsContainer);
          }
        }
      });
      
      // Hide suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (!passageInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
          suggestionsContainer.classList.add('hidden');
          autocompleteState.activeIndex = -1;
        }
      });
    }
    
    // AUTO-LOAD Scripture with debounce (load without pressing Enter)
    let autoLoadDebounceTimer = null;
    const AUTO_LOAD_DELAY = 1500; // 1.5 seconds after user stops typing
    
    passageInput.addEventListener("input", async (e) => {
      // Clear existing debounce timer
      if (autoLoadDebounceTimer) {
        clearTimeout(autoLoadDebounceTimer);
      }
      
      // Only auto-load if passage is reasonably complete (3+ chars and looks like a reference)
      const passage = e.target.value.trim();
      const looksLikeReference = /^\w+\s+\d+[:.]?\d*/.test(passage); // e.g., "John 3:16", "Matt 5"
      
      if (passage.length >= 3 && looksLikeReference && !suggestionsContainer.classList.contains('hidden')) {
        // Schedule auto-load
        autoLoadDebounceTimer = setTimeout(async () => {
          try {
            console.log('⏱️ Auto-loading Scripture:', passage);
            const fullPassageText = document.getElementById('fullPassageText');
            if (fullPassageText) {
              const { fetchAndDisplayScripture } = await import('./analysisEngine.js');
              if (fetchAndDisplayScripture) {
                await fetchAndDisplayScripture(passage, fullPassageText);
                console.log('✅ Auto-loaded Scripture successfully');
              }
            }
          } catch (error) {
            console.error('⚠️ Auto-load failed:', error);
          }
        }, AUTO_LOAD_DELAY);
      }
    });
    
    passageInput.addEventListener("keypress", async (e) => {
      try {
        // Clear debounce timer on explicit Enter key
        if (autoLoadDebounceTimer) {
          clearTimeout(autoLoadDebounceTimer);
          autoLoadDebounceTimer = null;
        }
        if (e.key === "Enter") {
          // Hide autocomplete suggestions
          if (suggestionsContainer) {
            suggestionsContainer.classList.add('hidden');
            autocompleteState.activeIndex = -1;
          }
          
          const passage = AppState?.currentPassage;
          console.log('⏎ Enter pressed on passage input:', passage);
          
          if (passage) {
            // Fetch and display the Scripture in the panel
            console.log('📖 Fetching Scripture for passage:', passage);
            const fullPassageText = document.getElementById('fullPassageText');
            if (fullPassageText) {
              fullPassageText.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">⏳ Loading Scripture...</div>';
              try {
                const { fetchAndDisplayScripture } = await import('./analysisEngine.js');
                if (fetchAndDisplayScripture) {
                  await fetchAndDisplayScripture(passage, fullPassageText);
                  console.log('✅ Scripture loaded successfully');
                }
              } catch (importError) {
                console.error('⚠️ Failed to fetch Scripture:', importError);
              }
            }
            
            passageInput.blur();
            // DO NOT open modal automatically - user should click on a depth button to open it
          } else {
            console.warn('⚠️ No passage entered');
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
    const zoomFactor = ZoomState.level / 100;
    
    const scriptureEnglish = document.getElementById('scriptureEnglish');
    const scriptureOriginal = document.getElementById('scriptureOriginal');
    const analysisDisplay = document.getElementById('analysisDisplay');
    const fullPassageText = document.getElementById('fullPassageText');
    
    if (scriptureEnglish) {
      scriptureEnglish.style.fontSize = `${17 * zoomFactor}px`;
      scriptureEnglish.style.lineHeight = `${1.6 * zoomFactor}`;
    }
    
    if (scriptureOriginal) {
      scriptureOriginal.style.fontSize = `${22 * zoomFactor}px`;
      scriptureOriginal.style.lineHeight = `${1.7 * zoomFactor}`;
    }
    
    if (fullPassageText && !scriptureEnglish) {
      // Fallback state before scriptureEnglish is injected
      fullPassageText.style.fontSize = `${17 * zoomFactor}px`;
    }
    
    if (analysisDisplay) {
      analysisDisplay.style.fontSize = `${14 * zoomFactor}px`;
      analysisDisplay.style.lineHeight = `${1.6 * zoomFactor}`;
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

// ==============================
// ANALYSIS DEPTH CONTROLS
// ==============================
function setActiveAnalysisDepth(depth) {
  if (!analysisDepthButtons || !analysisDepthButtons.length) return;
  analysisDepthButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.depth === depth);
    btn.setAttribute('aria-pressed', btn.dataset.depth === depth ? 'true' : 'false');
  });
}

async function rerunAnalysisWithDepth(depth) {
  if (!AppState.currentMode || !AppState.currentSubtab || !AppState.currentPassage) {
    alert('Select a module and run an analysis first.');
    return;
  }
  try {
    const { runAnalysis } = await import('./analysisEngine.js');
    await runAnalysis(AppState.currentMode, AppState.currentSubtab, AppState.currentPassage, depth);
    AppState.currentDepth = depth;
    setActiveAnalysisDepth(depth);
  } catch (err) {
    console.error('❌ Error running analysis:', err);
    alert('Error running analysis. Check console for details.');
  }
}

function initializeAnalysisDepthControls() {
  analysisDepthButtons = Array.from(document.querySelectorAll('.analysis-depth-btn'));
  if (!analysisDepthButtons.length) return;
  analysisDepthButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const depth = btn.dataset.depth || 'dig-in';
      await rerunAnalysisWithDepth(depth);
    });
  });
  setActiveAnalysisDepth(AppState.currentDepth || 'dig-in');
}

// ==============================
// VISUALIZATION MODE (TIER 2)
// ==============================
function initializeAnalysisTabs() {
  const tabButtons = document.querySelectorAll('.analysis-tab-btn');
  const tabPanes = document.querySelectorAll('.analysis-tab-pane');

  console.log('[initializeAnalysisTabs] Found', tabButtons.length, 'tab buttons and', tabPanes.length, 'panes');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const tabName = btn.dataset.tab;
      console.log('[Tab Click] Clicked tab:', tabName);
      
      // Update active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Map tab names to pane IDs (convert kebab-case to camelCase)
      const paneIdMap = {
        'analysis': 'analysisTabContent',
        'scripture-explorer': 'scriptureExplorerTabContent',
        'topical-explorer': 'topicalExplorerTabContent'
      };
      const paneId = paneIdMap[tabName];
      
      // Update active pane
      tabPanes.forEach(pane => pane.classList.remove('active'));
      const activePane = document.getElementById(paneId);
      console.log('[Tab Switch] Looking for pane:', paneId, 'Found:', !!activePane);
      if (activePane) {
        activePane.classList.add('active');
      }
      
      // Initialize explorers on first load
      if (tabName === 'scripture-explorer' && !window.scriptureExplorerInitialized) {
        console.log('[Init] Starting Scripture Explorer initialization...');
        await initializeScriptureExplorer();
        window.scriptureExplorerInitialized = true;
      } else if (tabName === 'topical-explorer' && !window.topicalExplorerInitialized) {
        console.log('[Init] Starting Topical Explorer initialization...');
        await initializeTopicalExplorer();
        window.topicalExplorerInitialized = true;
      }
    });
  });
}

async function initializeScriptureExplorer() {
  try {
    console.log('[ScriptureExplorer] Starting init...');
    const { default: ScriptureExplorer } = await import('./modules/ScriptureExplorer.js');
    const container = document.getElementById('scriptureExplorerPanel');
    if (!container) {
      console.error('[ScriptureExplorer] Container not found!');
      return;
    }
    
    console.log('[ScriptureExplorer] Container found, rendering...');
    container.innerHTML = ScriptureExplorer.render();
    console.log('[ScriptureExplorer] HTML rendered, initializing...');
    await ScriptureExplorer.init();
    console.log('[ScriptureExplorer] ✅ Initialization complete');
  } catch (error) {
    console.error('❌ Error initializing Scripture Explorer:', error);
    const container = document.getElementById('scriptureExplorerPanel');
    if (container) {
      container.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
    }
  }
}

async function initializeTopicalExplorer() {
  try {
    console.log('[TopicalExplorer] Starting init...');
    const { OrbitalTopicExplorer } = await import('./modules/OrbitalTopicExplorer.js');
    const container = document.getElementById('topicalExplorerPanel');
    if (!container) {
      console.error('[TopicalExplorer] Container not found!');
      return;
    }
    
    console.log('[TopicalExplorer] Container found, creating explorer...');
    const explorer = new OrbitalTopicExplorer();
    await explorer.init();
    
    console.log('[TopicalExplorer] Rendering HTML...');
    container.innerHTML = explorer.render();
    console.log('[TopicalExplorer] Binding events...');
    explorer.bindEvents();
    
    // Load initial topics
    if (explorer.torreyData?.topics?.length) {
      console.log('[TopicalExplorer] Loading initial topics...');
      explorer.renderTopicGrid(explorer.torreyData.topics.slice(0, 12));
    }
    console.log('[TopicalExplorer] ✅ Initialization complete');
  } catch (error) {
    console.error('❌ Error initializing Topical Explorer:', error);
    const container = document.getElementById('topicalExplorerPanel');
    if (container) {
      container.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
    }
  }
}

function initializeVisualizationMode() {
  const enterVisualizationBtn = document.getElementById('enterVisualizationModeBtn');
  const exitVisualizationBtn = document.getElementById('exitVisualizationBtn');
  const visualizationMode = document.getElementById('visualizationMode');
  const workspace = document.getElementById('workspace');

  if (!enterVisualizationBtn || !exitVisualizationBtn || !visualizationMode) return;

  // Enter visualization mode
  enterVisualizationBtn.addEventListener('click', async () => {
    if (!AppState.currentPassage) {
      alert('Please enter a passage first');
      return;
    }

    console.log('🎨 Entering visualization mode for:', AppState.currentPassage);

    try {
      // Hide workspace, show visualization
      if (workspace) workspace.classList.add('hidden');
      visualizationMode.classList.remove('hidden');

      // Generate and display meditation visualization
      await generateAndDisplayVisualization();

    } catch (error) {
      console.error('❌ Error entering visualization mode:', error);
      alert('Error generating visualization. Check console for details.');
      // Return to workspace on error
      if (workspace) workspace.classList.remove('hidden');
      visualizationMode.classList.add('hidden');
    }
  });

  // Exit visualization mode
  exitVisualizationBtn.addEventListener('click', () => {
    console.log('👈 Exiting visualization mode');
    visualizationMode.classList.add('hidden');
    if (workspace) workspace.classList.remove('hidden');
  });
}

/**
 * Generate and display meditation visualization for current passage
 */
async function generateAndDisplayVisualization() {
  try {
    const passage = AppState.currentPassage;
    const visualizationCanvas = document.getElementById('visualizationCanvas');
    const visualizationPassageRef = document.getElementById('visualizationPassageRef');

    if (!visualizationCanvas || !visualizationPassageRef) {
      console.error('Visualization DOM elements not found');
      return;
    }

    // Update passage reference
    visualizationPassageRef.textContent = passage;

    // Show loading state
    visualizationCanvas.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;"><p>⏳ Generating meditation visualization...</p></div>';

    // Import meditation generator
    const { generateMeditationVisualization } = await import('./visualizations/meditationGenerator.js');

    // Fetch the scripture text for the passage
    const scriptureText = await fetchScriptureTextForVisualization(passage);

    // Generate the visualization HTML
    const visualizationHTML = await generateMeditationVisualization(
      passage,
      scriptureText,
      AppState.currentMode || 'devotional',
      AppState.currentSubtab || 'spiritual_analysis',
      AppState.currentDepth || 'dig-in'
    );

    // Display the visualization
    visualizationCanvas.innerHTML = visualizationHTML;

    console.log('✅ Visualization generated successfully');

  } catch (error) {
    console.error('❌ Error generating visualization:', error);
    const visualizationCanvas = document.getElementById('visualizationCanvas');
    if (visualizationCanvas) {
      visualizationCanvas.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #d32f2f;">
          <p>❌ Error generating visualization</p>
          <p style="font-size: 12px; margin-top: 12px; color: #999;">${error.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Fetch scripture text for visualization
 * Uses existing fullPassageText if available, otherwise fetches via API
 */
async function fetchScriptureTextForVisualization(passage) {
  try {
    // Try to get from existing full passage display
    const fullPassageText = document.getElementById('fullPassageText');
    if (fullPassageText && fullPassageText.textContent.trim()) {
      // Extract just the verse text, not HTML formatting
      const verseElements = fullPassageText.querySelectorAll('.verse-text');
      if (verseElements.length > 0) {
        const verses = Array.from(verseElements).map(el => el.textContent).join('\n');
        if (verses.trim()) return verses;
      }
      // Fallback to full text content
      return fullPassageText.textContent.trim();
    }

    // If no cached version, fetch via API
    console.log('📖 Fetching scripture text from API for:', passage);
    const { fetchAndDisplayScripture } = await import('./analysisEngine.js');

    // Create a temporary container to receive the scripture
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    // This will populate the passage if API is available
    // For now, return placeholder if fetch fails
    try {
      await fetchAndDisplayScripture(passage, tempContainer);
      const text = tempContainer.textContent;
      tempContainer.remove();
      return text || passage; // Fallback to passage reference if text empty
    } catch (e) {
      tempContainer.remove();
      return passage; // Return just the reference if fetch fails
    }

  } catch (error) {
    console.warn('⚠️ Could not fetch scripture text:', error);
    return passage; // Return passage reference as fallback
  }
}

// ==============================
// HELP MODAL INITIALIZATION
// ==============================
function initializeHelpModal() {
  const helpPageBtn = document.getElementById('helpPageBtn');
  const helpModal = document.getElementById('helpModal');
  const helpModalCloseBtn = document.getElementById('helpModalCloseBtn');
  const helpModalOverlay = document.getElementById('helpModalOverlay');
  const helpSendBtn = document.getElementById('helpSendBtn');
  const helpQuestionInput = document.getElementById('helpQuestionInput');
  const historyToggleCheckbox = document.getElementById('historyToggleCheckbox');
  const helpHistoryBtn = document.getElementById('helpHistoryBtn');
  const helpHistoryModal = document.getElementById('helpHistoryModal');
  const helpHistoryModalCloseBtn = document.getElementById('helpHistoryModalCloseBtn');
  const helpHistoryModalOverlay = document.getElementById('helpHistoryModalOverlay');
  const helpHistoryList = document.getElementById('helpHistoryList');

  if (!helpPageBtn || !helpModal) {
    console.warn('❌ Help modal elements not found');
    return;
  }

  // State for help conversation
  let conversationHistory = [];
  let rememberHistory = true;

  // Open help modal
  function openHelpModal() {
    console.log('📖 Opening help modal');
    helpModal.classList.remove('hidden');
    helpQuestionInput.focus();
  }

  // Close help modal
  function closeHelpModal() {
    console.log('📖 Closing help modal');
    helpModal.classList.add('hidden');
    
    // Check if user wants to remember history
    if (!rememberHistory) {
      conversationHistory = [];
      console.log('🔄 Help history cleared (user preference)');
    }
  }

  // Open help history modal
  function openHelpHistoryModal() {
    console.log('📜 Opening help history modal');
    renderHelpHistory();
    helpHistoryModal.classList.remove('hidden');
  }

  // Close help history modal
  function closeHelpHistoryModal() {
    console.log('📜 Closing help history modal');
    helpHistoryModal.classList.add('hidden');
  }

  // Render help history
  function renderHelpHistory() {
    helpHistoryList.innerHTML = '';
    
    if (conversationHistory.length === 0) {
      helpHistoryList.innerHTML = '<div class="helpHistoryEmpty">📭 No questions asked yet. Ask a question to build your history!</div>';
      return;
    }

    conversationHistory.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'helpHistoryItem';
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      historyItem.innerHTML = `
        <div class="helpHistoryQuestion">Q: ${escapeHtml(item.question)}</div>
        <div class="helpHistoryAnswer">${escapeHtml(item.answer)}</div>
        <div class="helpHistoryTimestamp">Asked just now</div>
      `;
      helpHistoryList.appendChild(historyItem);
    });
  }

  // Handle help send button
  async function handleHelpQuestion() {
    const question = helpQuestionInput.value.trim();
    
    if (!question) {
      console.warn('⚠️ Empty question');
      helpQuestionInput.focus();
      return;
    }

    console.log('💬 Help question:', question);

    // Disable send button and show loading
    helpSendBtn.disabled = true;
    helpSendBtn.textContent = '⏳ Thinking...';

    try {
      // Call backend
      const response = await fetch('/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          passage: AppState.currentPassage || 'General',
          mode: AppState.currentMode || 'devotional',
          subtab: AppState.currentSubtab || 'spiritual_analysis',
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get help');
      }

      const result = await response.json();

      console.log('✅ Help response received:', result);

      // Add to conversation history
      const qaItem = {
        question: question,
        answer: result.answer,
        suggestedQuestions: result.suggestedQuestions || []
      };
      conversationHistory.push(qaItem);

      // Display Q&A in conversation area
      const conversationArea = document.getElementById('helpConversationArea');
      const qaElement = document.createElement('div');
      qaElement.className = 'helpQAItem';
      qaElement.innerHTML = `
        <div class="helpQuestion">Q: ${escapeHtml(question)}</div>
        <div class="helpAnswer">${escapeHtml(result.answer)}</div>
      `;

      // Add suggested questions if available
      if (result.suggestedQuestions && result.suggestedQuestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestedQuestionsContainer';
        suggestionsDiv.innerHTML = `
          <span class="suggestedQuestionsLabel">Suggested next questions:</span>
          <div class="suggestedQuestionsList">
            ${result.suggestedQuestions.map((q, idx) => `
              <button class="suggestedQuestionBtn" data-question="${escapeHtml(q)}">
                ➜ ${escapeHtml(q)}
              </button>
            `).join('')}
          </div>
        `;
        qaElement.appendChild(suggestionsDiv);

        // Attach listeners to suggested question buttons
        suggestionsDiv.querySelectorAll('.suggestedQuestionBtn').forEach(btn => {
          btn.addEventListener('click', () => {
            const suggestedQuestion = btn.dataset.question;
            console.log('📋 Suggested question selected:', suggestedQuestion);
            helpQuestionInput.value = suggestedQuestion;
            helpQuestionInput.focus();
            // Auto-submit
            setTimeout(() => handleHelpQuestion(), 100);
          });
        });
      }

      conversationArea.appendChild(qaElement);

      // Scroll to bottom
      conversationArea.scrollTop = conversationArea.scrollHeight;

      // Clear input
      helpQuestionInput.value = '';
      helpQuestionInput.focus();

    } catch (error) {
      console.error('❌ Help error:', error);
      const conversationArea = document.getElementById('helpConversationArea');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'helpAnswer';
      errorDiv.style.color = '#d32f2f';
      errorDiv.textContent = `❌ Error: ${error.message}`;
      conversationArea.appendChild(errorDiv);
    } finally {
      // Re-enable send button
      helpSendBtn.disabled = false;
      helpSendBtn.textContent = 'Send Question →';
    }
  }

  // Event listeners
  helpPageBtn.addEventListener('click', openHelpModal);
  helpModalCloseBtn.addEventListener('click', closeHelpModal);
  helpModalOverlay.addEventListener('click', closeHelpModal);
  helpSendBtn.addEventListener('click', handleHelpQuestion);
  
  // History button and modal
  if (helpHistoryBtn) {
    helpHistoryBtn.addEventListener('click', openHelpHistoryModal);
  }
  if (helpHistoryModalCloseBtn) {
    helpHistoryModalCloseBtn.addEventListener('click', closeHelpHistoryModal);
  }
  if (helpHistoryModalOverlay) {
    helpHistoryModalOverlay.addEventListener('click', closeHelpHistoryModal);
  }
  
  // Send on Enter key
  helpQuestionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleHelpQuestion();
    }
  });

  // History toggle
  if (historyToggleCheckbox) {
    historyToggleCheckbox.addEventListener('change', (e) => {
      rememberHistory = e.target.checked;
      console.log('🔄 Help history preference:', rememberHistory ? 'Remember' : 'Fresh each time');
      
      if (!rememberHistory) {
        // Clear history immediately
        conversationHistory = [];
        document.getElementById('helpConversationArea').innerHTML = '';
        console.log('✓ Help history cleared');
      }
    });
  }

  console.log('✅ Help modal initialized');
}

/**
 * Utility to escape HTML in user input
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ==============================
// SERVER STATUS WIDGET
// ==============================
function initializeServerStatusWidget() {
  const statusIndicator = document.getElementById('serverStatusIndicator');
  const statusModal = document.getElementById('serverStatusModal');
  const statusModalOverlay = document.getElementById('serverStatusModalOverlay');
  const statusCloseBtn = document.getElementById('serverStatusCloseBtn');
  const retryServerBtn = document.getElementById('retryServerBtn');
  const statusDisplay = document.getElementById('serverStatusDisplay');
  const debugInfo = document.getElementById('serverDebugInfo');

  if (!statusIndicator || !statusModal) {
    console.warn('❌ Server status widget elements not found');
    return;
  }

  // Check server status periodically
  let checkInterval;
  let lastStatus = null;

  async function checkServerStatus() {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();
        updateStatusIndicator(true, data);
        return true;
      } else {
        updateStatusIndicator(false, { error: `HTTP ${response.status}` });
        return false;
      }
    } catch (error) {
      updateStatusIndicator(false, { error: error.message });
      return false;
    }
  }

  function updateStatusIndicator(isConnected, details = {}) {
    // Only update if status changed or it's the first check
    const statusChanged = lastStatus !== isConnected;
    lastStatus = isConnected;

    if (isConnected) {
      statusIndicator.className = 'status-connected';
      statusIndicator.innerHTML = '🟢 Server Connected';
      statusIndicator.title = 'Server is running and responding';
    } else {
      statusIndicator.className = 'status-disconnected';
      statusIndicator.innerHTML = '🔴 Server Disconnected';
      statusIndicator.title = 'Click to troubleshoot';
    }

    // Store status for modal display
    window.serverStatusDetails = { isConnected, details };
  }

  async function openStatusModal() {
    console.log('📊 Opening server status modal');
    statusModal.classList.remove('hidden');

    // Do a fresh check
    const isConnected = await checkServerStatus();
    
    // Display status
    const details = window.serverStatusDetails || {};
    let statusHTML = '';

    if (isConnected) {
      statusDisplay.className = 'connected';
      statusHTML = `
        <h3>✅ Server is Connected</h3>
        <p>The backend server is running and responding normally.</p>
        <p><strong>Model:</strong> ${details.details?.model || 'llama-3.3-70b-versatile'}</p>
        <p><strong>API Key:</strong> ${details.details?.hasApiKey ? '✓ Configured' : '✗ Missing'}</p>
      `;
    } else {
      statusDisplay.className = '';
      statusHTML = `
        <h3>❌ Server Connection Failed</h3>
        <p><strong>Error:</strong> ${details.details?.error || 'Unknown error'}</p>
        <p>The frontend cannot reach the backend server at http://localhost:3000</p>
        
        <h4 style="margin-top: 12px; margin-bottom: 8px;">How to fix:</h4>
        <ol style="margin: 0 0 0 16px; font-size: 11px; line-height: 1.6;">
          <li><strong>In a terminal:</strong> Navigate to the scribe-study folder</li>
          <li><strong>Run:</strong> <code style="background: #f5f5f5; padding: 2px 4px; border-radius: 2px;">cd backend && npm start</code></li>
          <li><strong>Wait</strong> for the "API SERVER RUNNING" message</li>
          <li><strong>Come back</strong> to this page and click "Retry Connection"</li>
        </ol>
        
        <p style="margin-top: 12px; font-size: 11px; color: #999;"><strong>Possible causes:</strong></p>
        <ul style="margin: 4px 0 0 16px; font-size: 11px;">
          <li>Backend server is not running</li>
          <li>Port 3000 is in use by another process</li>
          <li>Network connectivity issue</li>
        </ul>
      `;
      debugInfo.innerHTML = `
Last checked: ${new Date().toLocaleTimeString()}<br>
Endpoint: http://localhost:3000/api/health<br>
Error: ${details.details?.error || 'Unknown'}<br>
Status: Connection refused or timeout
      `;
      debugInfo.style.display = 'block';
    }

    statusDisplay.innerHTML = statusHTML;
  }

  function closeStatusModal() {
    statusModal.classList.add('hidden');
  }

  // Retry connection
  retryServerBtn.addEventListener('click', async () => {
    console.log('🔄 Retrying server connection...');
    retryServerBtn.disabled = true;
    retryServerBtn.textContent = '⏳ Checking...';

    const isConnected = await checkServerStatus();

    if (isConnected) {
      console.log('✅ Server reconnected!');
      retryServerBtn.textContent = '✅ Connected!';
      setTimeout(() => {
        closeStatusModal();
        retryServerBtn.textContent = '🔄 Retry Connection';
        retryServerBtn.disabled = false;
      }, 1000);
    } else {
      console.log('❌ Still disconnected');
      retryServerBtn.textContent = '❌ Still disconnected - Start the server manually';
      retryServerBtn.disabled = false;
    }
  });

  // Modal controls
  statusIndicator.addEventListener('click', openStatusModal);
  statusCloseBtn.addEventListener('click', closeStatusModal);
  statusModalOverlay.addEventListener('click', closeStatusModal);

  // Initial status check
  statusIndicator.className = 'status-checking';
  statusIndicator.innerHTML = '⚪ Checking...';
  
  checkServerStatus();

  // Check every 30 seconds
  checkInterval = setInterval(checkServerStatus, 30000);

  // Also check when user makes an API call (attach to fetch for detection)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      if (args[0]?.includes('/api/')) {
        console.warn('⚠️ API call failed:', error.message);
        checkServerStatus();
      }
      throw error;
    });
  };

  console.log('✅ Server status widget initialized');
}

// =========================================================
// DARK MODE TOGGLE
// =========================================================
function initializeDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;

  // Check for saved preference or system preference
  const savedDarkMode = localStorage.getItem('darkMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedDarkMode === 'true' || (savedDarkMode === null && prefersDark)) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
  } else {
    darkModeToggle.textContent = '🌙';
  }

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
    console.log('🌓 Dark mode:', isDark ? 'ON' : 'OFF');
  });

  console.log('✅ Dark mode toggle initialized');
}

// =========================================================
// FAVORITES SYSTEM
// =========================================================
const FavoritesManager = {
  favorites: [],

  init() {
    this.loadFavorites();
    this.renderFavorites();
  },

  loadFavorites() {
    try {
      const saved = localStorage.getItem('scribeFavorites');
      this.favorites = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.favorites = [];
    }
  },

  saveFavorites() {
    localStorage.setItem('scribeFavorites', JSON.stringify(this.favorites));
  },

  addFavorite(type, title, data = {}) {
    const id = `fav_${Date.now()}`;
    const favorite = { id, type, title, data, addedAt: new Date().toISOString() };
    this.favorites.push(favorite);
    this.saveFavorites();
    this.renderFavorites();
    return id;
  },

  removeFavorite(id) {
    this.favorites = this.favorites.filter(f => f.id !== id);
    this.saveFavorites();
    this.renderFavorites();
  },

  isFavorited(type, title) {
    return this.favorites.some(f => f.type === type && f.title === title);
  },

  renderFavorites() {
    const list = document.getElementById('favoritesList');
    if (!list) return;

    if (this.favorites.length === 0) {
      list.innerHTML = '<p class="empty-favorites">No favorites yet. Click ☆ on any panel to add.</p>';
      return;
    }

    list.innerHTML = this.favorites.map(fav => `
      <div class="favorite-item" data-id="${fav.id}" data-type="${fav.type}">
        <span class="fav-icon">${this.getTypeIcon(fav.type)}</span>
        <span class="fav-title">${fav.title}</span>
        <button class="remove-fav" data-id="${fav.id}">✕</button>
      </div>
    `).join('');

    // Bind remove buttons
    list.querySelectorAll('.remove-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFavorite(btn.dataset.id);
      });
    });

    // Bind click to navigate
    list.querySelectorAll('.favorite-item').forEach(item => {
      item.addEventListener('click', () => {
        const fav = this.favorites.find(f => f.id === item.dataset.id);
        if (fav) this.openFavorite(fav);
      });
    });
  },

  getTypeIcon(type) {
    const icons = {
      scripture: '📖',
      analysis: '📊',
      topic: '🌌',
      passage: '📜'
    };
    return icons[type] || '⭐';
  },

  openFavorite(fav) {
    console.log('Opening favorite:', fav);
    // Close sidebar
    document.getElementById('favoritesSidebar')?.classList.add('hidden');
    
    // Navigate based on type
    if (fav.type === 'passage' && fav.data?.reference) {
      const passageInput = document.getElementById('passageInput');
      if (passageInput) {
        passageInput.value = fav.data.reference;
        passageInput.dispatchEvent(new Event('input'));
      }
    }
  }
};

function initializeFavorites() {
  FavoritesManager.init();

  // Toggle sidebar
  const favoritesToggle = document.getElementById('favoritesToggle');
  const favoritesSidebar = document.getElementById('favoritesSidebar');
  const closeFavorites = document.getElementById('closeFavorites');

  if (favoritesToggle && favoritesSidebar) {
    favoritesToggle.addEventListener('click', () => {
      favoritesSidebar.classList.toggle('hidden');
    });
  }

  if (closeFavorites && favoritesSidebar) {
    closeFavorites.addEventListener('click', () => {
      favoritesSidebar.classList.add('hidden');
    });
  }

  // Star buttons on panels
  document.querySelectorAll('.favorite-star').forEach(star => {
    const panel = star.dataset.panel;
    
    // Check if already favorited
    if (FavoritesManager.isFavorited(panel, panel)) {
      star.classList.add('favorited');
      star.textContent = '★';
    }

    star.addEventListener('click', () => {
      const title = panel.charAt(0).toUpperCase() + panel.slice(1) + ' Panel';
      
      if (star.classList.contains('favorited')) {
        // Remove from favorites
        const fav = FavoritesManager.favorites.find(f => f.type === panel);
        if (fav) FavoritesManager.removeFavorite(fav.id);
        star.classList.remove('favorited');
        star.textContent = '☆';
      } else {
        // Add to favorites
        FavoritesManager.addFavorite(panel, title);
        star.classList.add('favorited');
        star.textContent = '★';
      }
    });
  });

  console.log('✅ Favorites system initialized');
}

// Make FavoritesManager available globally
window.FavoritesManager = FavoritesManager;