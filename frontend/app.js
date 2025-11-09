// ===== SCRIBE STUDY FRONTEND =====
// Calls backend API - users don't need API keys!

// ===== CONFIGURATION =====
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'  // Local development
    : '/api';  // Production (same domain)

// ===== APPLICATION STATE =====
const AppState = {
    currentCategory: 'devotional',
    currentModule: 'spiritual-analysis',
    currentPassage: '',
    currentNoteId: null,
    notes: {},
    analysisVersions: {},
    currentVersionIndex: {},
    // NEW: State for Bible Reader
    currentBibleReference: {
        book: '',
        chapter: null,
        verse: null
    }
};

// ===== MODULE DEFINITIONS =====
const ModuleDefinitions = {
    'languages': {
        name: 'Original Languages',
        modules: {
            'greek-hebrew': {
                name: 'Greek/Hebrew Lexicon',
                prompt: `Provide lexical analysis for key terms in {passage}:

**For each significant word:**
                1. **Original Language:** Hebrew/Greek word (with transliteration)
                2. **Root Meaning:** Etymology and basic semantic range
                3. **Usage Patterns:** How this word is used elsewhere in Scripture
                4. **Theological Significance:** What this word contributes to biblical theology
                5. **Context:** How the meaning functions specifically in this passage

Focus on words that carry theological weight or cultural significance.`,
                icon: '📚'
            },
            'morphology': {
                name: 'Morphology',
                prompt: `Provide detailed morphological analysis of {passage}:

**For each significant word:**
                - Parse (part of speech, person, number, gender, tense, voice, mood, case)
                - Root/lexical form
                - Semantic range
                - Usage in this context

**Analysis should include:**
                - Word-by-word breakdown of key terms
                - Morphological patterns that affect meaning
                - Comparative usage across Scripture
                - Theological implications of specific forms`,
                icon: '📝'
            },
            'grammar-essentials': {
                name: 'Grammar Essentials',
                prompt: `Analyze the grammar of {passage} to help anyone understand how sentence structure reveals theological truth—accessible yet thorough.

LANGUAGE AUTO-DETECTION:
**If passage is Old Testament:**
- Display Hebrew text with transliteration
- Analyze Hebrew grammatical features
- Explain Hebrew word order, construct chains, verb stems
- Note definiteness, pronominal suffixes, particles
- Reference Hebrew syntax and style

**If passage is New Testament:**
                - Display Greek text with transliteration
                - Analyze Greek grammatical features
                - Explain Greek cases, verb aspects, participles
                - Note article usage, prepositions, conjunctions
                - Reference Greek syntax and style

'Focus on making complex grammar accessible while maintaining scholarly accuracy.`,
                icon: '📖'
            },
            'advanced-grammar': {
                name: 'Advanced Grammar',
                prompt: `Perform comprehensive syntactic analysis of {passage} combining scholarly precision with theological depth.

LANGUAGE AUTO-DETECTION & SCHOLARLY TREATMENT:
**If Old Testament:**
                - Display Hebrew text (pointed Masoretic)
                - Provide transliteration for accessibility
                - Analyze ALL Hebrew grammatical features:
                    - Verb stems (Qal, Niphal, Piel, Pual, Hithpael, Hophal, Hiphil)
                    - Verb conjugations (Perfect, Imperfect, Imperative, Infinitive, Participle)
                    - Noun patterns, construct chains, pronominal suffixes
                    - Particles, prepositions, conjunctions
                    - Word order and emphasis
                    - Poetic structures if applicable (parallelism, chiasm)

**If New Testament:**
                - Display Greek text with transliteration
                - Analyze ALL Greek grammatical features:
                    - Verb aspects (aorist, present, perfect, imperfect)
                    - Voice (active, middle, passive)
                    - Mood (indicative, subjunctive, optative, imperative, infinitive, participle)
                    - Case system (nominative, genitive, dative, accusative, vocative)
                    - Article usage and semantic significance
                    - Participles and their functions
                    - Prepositions and compound verbs

Include detailed morphological analysis, clause structures, and syntactic relationships.`,
                icon: '🔬'
            },
            'verse-by-verse': {
                name: 'Verse-by-Verse Grammar',
                prompt: `Provide verse-by-verse grammatical analysis of {passage}:

**For each verse:**
                1. **Text:** Display original language with transliteration
                2. **Clause Structure:** Identify main and subordinate clauses
                3. **Grammatical Features:** Key morphological and syntactic elements
                4. **Structural Relationships:** How clauses connect
                5. **Meaning Impact:** How grammar affects interpretation

Make technical analysis accessible while maintaining precision.`,
                icon: '📋'
            },
            'semantic-range': {
                name: 'Semantic Range',
                prompt: `Analyze the semantic range and contextual meaning of key terms in {passage}:

**For each major term:**
                1. **Full Semantic Range:** Complete spectrum of meanings
                2. **Usage Categories:** How the term functions in different contexts
                3. **Scripture Survey:** Key passages using this term
                4. **Contextual Determination:** Why this specific meaning applies here
                5. **Theological Trajectories:** How meaning develops across biblical corpus

Show how word meanings shift based on context while maintaining core concepts.`,
                icon: '🎯'
            }
        }
    },
    'devotional': {
        name: 'Devotional',
        modules: {
            'spiritual-analysis': {
                name: 'Spiritual Analysis',
                prompt: `Provide a deep spiritual analysis of {passage} with focus on:

* Core theological truths revealed
* Personal heart impact and conviction
* Christ-centered interpretation
* Redemptive-historical context

Include:
* Key spiritual insights that lead to worship
* Personal application points
* How this passage transforms believers
* Connection to themes of divine sovereignty, faith, perseverance, and covenant faithfulness

Avoid generic observations—focus on transformative truth that leads to worship and obedience.`,
                icon: '📖'
            },
            'devotional-reflection': {
                name: 'Devotional Reflection',
                prompt: `Create a devotional reflection on {passage} suitable for personal meditation...`,
                icon: '🙏'
            },
            'discipleship': {
                name: 'Discipleship Application',
                prompt: `Analyze {passage} for discipleship and spiritual growth applications...`,
                icon: '🌱'
            },
            'redemptive-focus': {
                name: 'Redemptive Focus',
                prompt: `Analyze {passage} through the lens of redemptive exposition...`,
                icon: '✝️'
            },
            'life-application': {
                name: 'Life Application',
                prompt: `Provide practical life applications from {passage}...`,
                icon: '🎯'
            }
        }
    },
    'text-analysis': {
        name: 'Text Analysis',
        modules: {
            'passage-overview': {
                name: 'Passage Overview',
                prompt: `Provide a comprehensive overview of {passage}...`,
                icon: '📋'
            },
            'structural-analysis': {
                name: 'Structural Analysis',
                prompt: `Analyze the literary structure of {passage}...`,
                icon: '🏗️'
            },
            'literary-devices': {
                name: 'Literary Devices',
                prompt: `Identify literary devices in {passage}...`,
                icon: '✍️'
            },
            'discourse-analysis': {
                name: 'Discourse Analysis',
                prompt: `Analyze the discourse structure of {passage}...`,
                icon: '💬'
            },
            'semantic-outline': {
                name: 'Semantic Outline',
                prompt: `Generate a semantic outline of {passage}...`,
                icon: '📊'
            },
            'key-words': {
                name: 'Key Words',
                prompt: `Identify and analyze key words in {passage}...`,
                icon: '🔑'
            }
        }
    },
    'context': {
        name: 'Context & Background',
        modules: {
            'historical-cultural': {
                name: 'Historical-Cultural',
                prompt: `Provide historical and cultural context for {passage}...`,
                icon: '🏛️'
            },
            'geographical': {
                name: 'Geographical Context',
                prompt: `Explain the geographical context of {passage}...`,
                icon: '🗺️'
            },
            'theological-context': {
                name: 'Theological Context',
                prompt: `Analyze the theological context of {passage}...`,
                icon: '⛪'
            },
            'cross-references': {
                name: 'Cross-References',
                prompt: `Identify cross-references to {passage}...`,
                icon: '🔗'
            },
            'literary-context': {
                name: 'Literary Context',
                prompt: `Analyze how {passage} fits within its book...`,
                icon: '📖'
            }
        }
    },
    'jewish': {
        name: 'Jewish Background',
        modules: {
            'second-temple': {
                name: 'Second Temple Period',
                prompt: `Analyze {passage} in light of Second Temple literature...`,
                icon: '🕍'
            },
            'rabbinic': {
                name: 'Rabbinic Literature',
                prompt: `Examine connections to Rabbinic literature...`,
                icon: '📜'
            },
            'dead-sea-scrolls': {
                name: 'Dead Sea Scrolls',
                prompt: `Explore connections to Dead Sea Scrolls...`,
                icon: '📰'
            },
            'pseudepigrapha': {
                name: 'Pseudepigrapha',
                prompt: `Analyze in light of Pseudepigraphal writings...`,
                icon: '📕'
            }
        }
    },
    'teaching': {
        name: 'Teaching & Preaching',
        modules: {
            'sermon-outline': {
                name: 'Sermon Outline',
                prompt: `Create a sermon outline for {passage}...`,
                icon: '📋'
            },
            'lesson-plan': {
                name: 'Lesson Plan',
                prompt: `Develop a lesson plan for {passage}...`,
                icon: '📝'
            },
            'discussion-questions': {
                name: 'Discussion Questions',
                prompt: `Generate discussion questions for {passage}...`,
                icon: '❓'
            },
            'illustrations': {
                name: 'Illustrations',
                prompt: `Suggest illustrations for {passage}...`,
                icon: '💡'
            },
            'teaching-points': {
                name: 'Teaching Points',
                prompt: `Extract key teaching points from {passage}...`,
                icon: '🎯'
            }
        }
    }
};

// ===== DOM ELEMENTS =====
// Cached DOM elements to avoid repeated lookups
const DOMElements = {};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Cache all DOM elements
    DOMElements.sidebar = document.getElementById('sidebar');
    DOMElements.sidebarHeader = document.getElementById('sidebarHeader');
    DOMElements.primaryTabs = document.querySelectorAll('.primary-tab');
    DOMElements.moduleGroups = document.querySelectorAll('.module-group');
    DOMElements.secondaryTabs = document.querySelectorAll('.secondary-tab');
    DOMElements.passageInput = document.getElementById('passageInput');
    DOMElements.moduleAnalysisBtn = document.getElementById('moduleAnalysisBtn');
    DOMElements.displayScriptureBtn = document.getElementById('displayScriptureBtn');
    DOMElements.versionSelect = document.getElementById('versionSelect');
    DOMElements.analysisDisplay = document.getElementById('analysisDisplay');
    DOMElements.statusMessage = document.getElementById('statusMessage');
    DOMElements.analysisHeaderTemplate = document.getElementById('analysisHeaderTemplate');
    DOMElements.sidebarToggle = document.getElementById('sidebarToggle');
    DOMElements.notesPanel = document.getElementById('notesPanel');
    DOMElements.notesToggle = document.getElementById('notesToggle');
    // ... add other elements as needed

    initializeApp();
    loadNotes();
    checkAPIHealth();
});

function initializeApp() {
    // Primary tabs
    DOMElements.primaryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            switchCategory(category);
        });
    });

    // Secondary tabs (modules)
    DOMElements.secondaryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const module = e.target.dataset.module;
            switchModule(module);
        });
    });

    // --- Action Bar ---
    DOMElements.moduleAnalysisBtn.addEventListener('click', generateModuleAnalysis);
    DOMElements.displayScriptureBtn.addEventListener('click', displayScripture);
    
    // Enter key
    DOMElements.passageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateModuleAnalysis(); // Default to module analysis
    });

    // Sidebar toggle
    DOMElements.sidebarToggle.addEventListener('click', () => DOMElements.sidebar.classList.toggle('collapsed'));

    // Notes toggle
    DOMElements.notesToggle.addEventListener('click', () => DOMElements.notesPanel.classList.toggle('collapsed'));
}

// ===== API HEALTH CHECK =====
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (!data.hasApiKey) {
            console.warn('⚠️ Backend API key not configured');
        }
    } catch (error) {
        console.error('Cannot connect to backend:', error);
        showError('Cannot connect to server. Make sure backend is running.');
    }
}

// ===== CORE ANALYSIS FUNCTIONS =====

/**
 * NEW: Parses a passage reference string (e.g., "John 3:16", "Romans 8:1-2")
 * and returns a structured object.
 * This is a simple parser and can be expanded.
 * @param {string} passageStr - The input string from the user.
 * @returns {object} - An object { book: string, chapter: number, verse: number }
 */
function parsePassageReference(passageStr) {
    // This is a basic parser. A more robust one would handle "1 John", "Song of Solomon", etc.
    const match = passageStr.match(/^(\d?\s*[a-zA-Z]+(?:\s[a-zA-Z]+)?)\s*(\d+)(?:[:.](\d+))?/);
    
    if (match) {
        const book = match[1].trim();
        const chapter = parseInt(match[2], 10);
        const verse = match[3] ? parseInt(match[3], 10) : 1; // Default to verse 1 if not specified
        
        return { book, chapter, verse };
    }
    
    // Fallback for simple inputs like "Romans 8" or general questions
    const parts = passageStr.split(' ');
    const lastPart = parts[parts.length - 1];
    if (parts.length > 1 && /^\d+$/.test(lastPart)) {
        const chapter = parseInt(lastPart, 10);
        const book = parts.slice(0, -1).join(' ');
        return { book, chapter, verse: 1 };
    }

    // Not a scripture reference, or just a book name.
    // Treat as a general question or topic.
    return { book: passageStr, chapter: null, verse: null };
}


/**
 * Main function to call the backend API.
 * @param {string} prompt - The final prompt to send to the AI.
 * @param {string} analysisType - 'module', 'scripture', or 'general'.
 * @param {object} context - Additional info (passage, moduleName, etc.)
 */
async function runAnalysis(prompt, analysisType, context) {
    const passage = DOMElements.passageInput.value.trim();
    if (!passage) {
        showError('Please enter a scripture passage or question.');
        return;
    }

    // Show loading state
    setLoadingState(true, 'Analyzing...');
    DOMElements.statusMessage.classList.add('hidden');

    try {
        // Call BACKEND API (not Groq directly!)
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                passage: passage,
                moduleName: context.moduleName || 'Analysis'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        const analysis = data.analysis;

        // Store version if it's a module analysis
        if (analysisType === 'module') {
            const versionKey = `${AppState.currentCategory}-${AppState.currentModule}`;
            if (!AppState.analysisVersions[versionKey]) {
                AppState.analysisVersions[versionKey] = [];
            }
            AppState.analysisVersions[versionKey].push(analysis);
            AppState.currentVersionIndex[versionKey] = AppState.analysisVersions[versionKey].length - 1;
        }

        // Display
        displayAnalysis(analysis, analysisType, context);

    } catch (error) {
        console.error('Analysis Error:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Triggered by the "Run Module Analysis" button.
 */
function generateModuleAnalysis() {
    const passage = DOMElements.passageInput.value.trim();
    AppState.currentPassage = passage;

    // Get module info
    const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
    if (!moduleInfo) {
        showError("Could not find selected module.");
        return;
    }
    
    // Build prompt
    let prompt = moduleInfo.prompt.replace('{passage}', passage);

    // If it's a general question, add a system message
    const ref = parsePassageReference(passage);
    if (!ref.chapter) {
        prompt = `User's input is a general topic or question, not a specific scripture passage.
User's input: "${passage}"
Based on this, perform the following analysis as a topic-based query:
${prompt}`;
    }

    runAnalysis(prompt, 'module', {
        passage: passage,
        moduleName: moduleInfo.name,
        icon: moduleInfo.icon
    });
}

/**
 * Triggered by the "Display Scripture Text" button.
 */
function displayScripture() {
    const passage = DOMElements.passageInput.value.trim();
    const version = DOMElements.versionSelect.value;
    const versionText = DOMElements.versionSelect.options[DOMElements.versionSelect.selectedIndex].text;

    // Try to parse the passage
    const ref = parsePassageReference(passage);
    let chapterQuery = passage;

    if (ref.chapter) {
        // It's a valid reference, let's get the whole chapter
        chapterQuery = `${ref.book} ${ref.chapter}`;
        // Store this for Step 2 (Navigation)
        AppState.currentBibleReference = ref;
    } else {
        // Not a reference, maybe just a book? Or topic?
        // Let's just send the raw query.
        AppState.currentBibleReference = { book: passage, chapter: null, verse: null };
    }

    const prompt = `Please provide the full text for the *entire chapter* of ${chapterQuery} using the ${versionText} version.
Format the text with verse numbers in brackets, like [1], [2], [3], etc.
If the input is not a specific chapter (e.g., "Genesis 1"), but a book or topic (e.g., "Genesis" or "Love"), please state that you can only display full chapters.`;

    runAnalysis(prompt, 'scripture', {
        passage: passage,
        chapter: chapterQuery,
        version: versionText
    });
}


// ===== DISPLAY FUNCTIONS =====

/**
 * Toggles the loading state of the action buttons.
 * @param {boolean} isLoading - Whether to show the loading state.
 * @param {string} [message] - Optional message (e.g., "Loading...").
 */
function setLoadingState(isLoading, message = "Loading...") {
    if (isLoading) {
        DOMElements.moduleAnalysisBtn.disabled = true;
        DOMElements.moduleAnalysisBtn.innerHTML = `<span><div class="loading-dots" style="font-size: 14px; color: white;"><span>.</span><span>.</span><span>.</span></div></span> ${message}`;
        DOMElements.displayScriptureBtn.disabled = true;
    } else {
        DOMElements.moduleAnalysisBtn.disabled = false;
        DOMElements.moduleAnalysisBtn.innerHTML = `<span>📖</span> Run Module Analysis`;
        DOMElements.displayScriptureBtn.disabled = false;
    }
}

/**
 * Formats raw markdown/plain text from AI into clean HTML.
 */
function formatAiResponse(text) {
    // 1. Convert newlines to paragraphs
    let html = text.split('\n\n')
                   .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                   .join('');

    // 2. Handle simple markdown lists (bulleted or numbered)
    html = html.replace(/<p>(?:[\*\-]\s|(\d+)\.\s)(.+?)<\/p>/g, '<li>$2</li>');
    html = html.replace(/(<li>.+?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // Fix contiguous lists

    // 3. Handle headings
    html = html.replace(/<p>###\s*(.+?)<\/p>/g, '<h3>$1</h3>');
    html = html.replace(/<p>##\s*(.+?)<\/p>/g, '<h2>$1</h2>');
    html = html.replace(/<p>#\s*(.+?)<\/p>/g, '<h1>$1</h1>');

    // 4. Handle bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // 5. Clean up verse numbers for scripture display
    html = html.replace(/\[(\d+)\]/g, ' <strong>[$1]</strong> ');

    return html;
}

/**
 * Main function to render analysis or scripture text in the display pane.
 * @param {string} content - The raw text/markdown from the AI.
 * @param {string} analysisType - 'module', 'scripture', or 'general'.
 * @param {object} context - Additional info (passage, moduleName, etc.)
 */
function displayAnalysis(content, analysisType, context) {
    DOMElements.analysisDisplay.innerHTML = ''; // Clear display

    // --- 1. CLONE AND APPEND HEADER ---
    const headerTemplate = DOMElements.analysisHeaderTemplate.content.cloneNode(true);
    const headerEl = headerTemplate.querySelector('.analysis-header');
    DOMElements.analysisDisplay.appendChild(headerEl);

    // Get all the nodes from the new header
    const analysisTitleDisplay = headerEl.querySelector('#analysisTitleDisplay');
    const analysisPassageDisplay = headerEl.querySelector('#analysisPassageDisplay');
    const analysisModuleDisplay = headerEl.querySelector('#analysisModuleDisplay');
    
    const readerControlsDisplay = headerEl.querySelector('#readerControlsDisplay');
    const prevChapterBtn = headerEl.querySelector('#prevChapterBtn');
    const nextChapterBtn = headerEl.querySelector('#nextChapterBtn');
    const readerChapterDisplay = headerEl.querySelector('#readerChapterDisplay');
    const readerVersionDisplay = headerEl.querySelector('#readerVersionDisplay');

    // --- 2. CONFIGURE HEADER BASED ON TYPE ---
    if (analysisType === 'scripture') {
        // We are in "Reader" mode
        analysisTitleDisplay.classList.add('hidden');
        readerControlsDisplay.classList.remove('hidden');

        readerChapterDisplay.textContent = context.chapter;
        readerVersionDisplay.textContent = context.version;
        
        // TODO: Hook up buttons in Step 2
        // prevChapterBtn.addEventListener('click', ...);
        // nextChapterBtn.addEventListener('click', ...);
        
    } else {
        // We are in "Module" mode (or general)
        analysisTitleDisplay.classList.remove('hidden');
        readerControlsDisplay.classList.add('hidden');
        
        analysisPassageDisplay.textContent = context.passage;
        analysisModuleDisplay.textContent = context.moduleName;
    }
    
    // --- 3. FORMAT AND APPEND CONTENT ---
    const contentEl = document.createElement('div');
    contentEl.className = 'analysis-content';
    contentEl.innerHTML = formatAiResponse(content);
    DOMElements.analysisDisplay.appendChild(contentEl);

    // --- 4. APPEND FOOTER ---
    const footerEl = document.createElement('div');
    footerEl.className = 'analysis-footer';
    
    // Add version controls if it's a module
    if (analysisType === 'module') {
        const versionControls = document.getElementById('versionControls').cloneNode(true);
        versionControls.style.display = 'flex';
        footerEl.appendChild(versionControls);
        // TODO: Hook up version button logic
        // updateVersionControls();
    }
    
    DOMElements.analysisDisplay.appendChild(footerEl);
    
    // Hide the initial status message
    DOMElements.statusMessage.classList.add('hidden');
}


function showError(message) {
    DOMElements.analysisDisplay.innerHTML = ''; // Clear
    DOMElements.statusMessage.innerHTML = `
        <div class="status-icon">⚠️</div>
        <div class="status-title" style="color: #d32f2f;">Error</div>
        <p class="status-text">${message}</p>
    `;
    DOMElements.statusMessage.classList.remove('hidden');
    setLoadingState(false); // Make sure buttons are re-enabled
}

// ===== NAVIGATION =====
function switchCategory(category) {
    if (!ModuleDefinitions[category]) {
        console.error(`Category "${category}" not found in ModuleDefinitions.`);
        return;
    }
    
    AppState.currentCategory = category;
    
    // Update UI
    DOMElements.primaryTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    DOMElements.moduleGroups.forEach(group => {
        group.classList.toggle('active', group.dataset.category === category);
    });

    // Set first module as active
    const firstModule = ModuleDefinitions[category].modules;
    const firstModuleKey = Object.keys(firstModule)[0];
    switchModule(firstModuleKey, true); // Force-switch to first module

    // Update header
    DOMElements.sidebarHeader.textContent = ModuleDefinitions[category].name;
}

function switchModule(module, forceSwitch = false) {
    // Don't auto-run if module is already active, unless forced
    if (AppState.currentModule === module && !forceSwitch) return;
    
    AppState.currentModule = module;
    
    DOMElements.secondaryTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.module === module);
    });

    // Auto-run analysis
    const passage = DOMElements.passageInput.value.trim();
    if (passage) {
        generateModuleAnalysis();
    }
}

function getModuleInfo(category, module) {
    try {
        return ModuleDefinitions[category].modules[module];
    } catch (e) {
        console.error(`Could not find module info for: ${category}/${module}`, e);
        return null;
    }
}

// ===== VERSION NAVIGATION (STUB) =====
function navigateVersion(direction) {
    // This logic needs to be attached to the buttons created in displayAnalysis
    // ...
}

function updateVersionControls() {
    // This logic needs to be attached to the buttons created in displayAnalysis
    // ...
}

// ===== NOTES (STUB - IMPLEMENT LATER) =====
function loadNotes() {
    const saved = localStorage.getItem('scribeNotes');
    if (saved) {
        AppState.notes = JSON.parse(saved);
    }
}

function saveNotes() {
    localStorage.setItem('scribeNotes', JSON.stringify(AppState.notes));
}
