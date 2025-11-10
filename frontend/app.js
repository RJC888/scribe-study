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
    currentBibleReference: { book: '', chapter: null, verse: null },
    
    // NEW: State for infinite scroll
    isFetchingChapter: false, // Prevents multiple fetches
    currentReaderMode: false  // Is the Bible reader active?
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
                prompt: `Explore the semantic range of key terms in {passage}...`,
                icon: '🌈'
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
// Lazily loaded in initializeApp to ensure they exist
let passageInput, runModuleBtn, displayScriptureBtn, versionSelect,
    sidebar, sidebarHeader, sidebarArrow,
    notesPanel, notesArrow, notesEditor, noteNameInput,
    saveStatus, wordCount, noteCount, noteMeta,
    analysisDisplay, statusMessage;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Select core elements
    passageInput = document.getElementById('passageInput');
    runModuleBtn = document.getElementById('runModuleBtn');
    displayScriptureBtn = document.getElementById('displayScriptureBtn');
    versionSelect = document.getElementById('versionSelect');
    sidebar = document.getElementById('sidebar');
    sidebarHeader = document.getElementById('sidebarHeader');
    sidebarArrow = document.getElementById('sidebarArrow');
    notesPanel = document.getElementById('notesPanel');
    notesArrow = document.getElementById('notesArrow');
    notesEditor = document.getElementById('notesEditor');
    noteNameInput = document.getElementById('noteNameInput');
    saveStatus = document.getElementById('saveStatus');
    wordCount = document.getElementById('wordCount');
    noteCount = document.getElementById('noteCount');
    noteMeta = document.getElementById('noteMeta');
    analysisDisplay = document.getElementById('analysisDisplay');
    statusMessage = document.getElementById('statusMessage');

    // Initialize app
    initializeApp();
    loadNotes();
    checkAPIHealth();
});

function initializeApp() {
    // Primary tabs
    document.querySelectorAll('.primary-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            switchCategory(category);
        });
    });

    // Secondary tabs (modules)
    document.querySelectorAll('.secondary-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const module = e.target.dataset.module;
            switchModule(module);
        });
    });

    // Main action buttons
    runModuleBtn.addEventListener('click', generateModuleAnalysis);
    displayScriptureBtn.addEventListener('click', displayScripture);
    
    // Enter key in search
    passageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // If user hits enter, default to module analysis
            generateModuleAnalysis();
        }
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

    // Notes panel toggle
    document.getElementById('notesToggle').addEventListener('click', toggleNotes);
    
    // Note panel size controls
    document.getElementById('collapseBtn').addEventListener('click', () => setNotesPanelSize('collapsed'));
    document.getElementById('normalBtn').addEventListener('click', () => setNotesPanelSize('normal'));
    document.getElementById('mediumBtn').addEventListener('click', () => setNotesPanelSize('medium'));
    document.getElementById('wideBtn').addEventListener('click', () => setNotesPanelSize('wide'));

    // Note functionality
    document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
    document.getElementById('myNotesBtn').addEventListener('click', showNotesList); // Function to be created
    document.getElementById('deleteBtn').addEventListener('click', deleteCurrentNote);

    // Note saving (autosave)
    notesEditor.addEventListener('input', updateNoteState);
    noteNameInput.addEventListener('input', updateNoteState);

    // Set initial active button
    setNotesPanelSize('normal');
}

// ===== API HEALTH CHECK =====
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (!data.hasApiKey) {
            console.warn('⚠️ Backend API key not configured');
        } else {
            console.log('Backend API connection successful.');
        }
    } catch (error) {
        console.error('Cannot connect to backend:', error);
        showError('Cannot connect to server. Make sure backend is running.');
    }
}

// ===== MAIN ANALYSIS / DATA FETCHING =====

/**
 * Main entry point for module analysis
 */
function generateModuleAnalysis() {
    const passage = passageInput.value.trim();
    if (!passage) {
        showError('Please enter a scripture passage or question.');
        return;
    }
    
    AppState.currentPassage = passage;
    AppState.currentReaderMode = false; // We are in module mode

    // Get module info
    const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
    
    // Build prompt
    let prompt;
    if (passage.includes(' ') || passage.includes(':') || passage.includes('-')) {
        // Looks like a passage
        prompt = moduleInfo.prompt.replace('{passage}', passage);
    } else {
        // Looks like a general question
        prompt = `Treating "{passage}" as a general theological question, please provide a detailed answer. ${moduleInfo.prompt.substring(0, 100)}...`;
        prompt = prompt.replace('{passage}', passage);
    }
    
    const analysisKey = `${passage}-${AppState.currentCategory}-${AppState.currentModule}`;

    runAnalysis({
        type: 'module',
        prompt: prompt,
        analysisKey: analysisKey,
        passage: passage,
        moduleName: moduleInfo.name,
        icon: moduleInfo.icon
    });
}

/**
 * Main entry point for displaying scripture
 */
function displayScripture() {
    const passage = passageInput.value.trim();
    if (!passage) {
        showError('Please enter a scripture passage.');
        return;
    }

    AppState.currentPassage = passage;
    AppState.currentReaderMode = true; // We are in reader mode
    
    const ref = parsePassageReference(passage);
    if (!ref) {
        showError("Invalid passage reference. Please use a format like 'John 3:16' or 'Romans 8'.");
        return;
    }
    
    AppState.currentBibleReference = ref;
    
    const version = versionSelect.value;
    const prompt = `Provide the full text for the *entire chapter* of ${ref.book} ${ref.chapter}, using the ${version} version. Format it with [VerseNumber] tags.`;
    const analysisKey = `${ref.book} ${ref.chapter}-${version}`;
    
    runAnalysis({
        type: 'scripture',
        prompt: prompt,
        analysisKey: analysisKey,
        passage: passage,
        version: version
    });
}

/**
 * The core function to call the backend API and handle responses
 * @param {object} options - Configuration for the analysis
 */
async function runAnalysis(options) {
    // --- 1. Set Loading State ---
    if (AppState.isFetchingChapter) return; // Prevent loop
    
    // Detach scroll listener if it exists (to prevent infinite loop)
    analysisDisplay.removeEventListener('scroll', scrollHandler);

    // Set fetching flag if we are scrolling
    if (options.type === 'scroll-top' || options.type === 'scroll-bottom') {
        AppState.isFetchingChapter = true;
        showScrollLoader(options.type === 'scroll-top' ? 'top' : 'bottom');
    } else {
        // This is a new, fresh analysis
        setLoadingState(true);
        // Clear previous version history for this new request
        AppState.analysisVersions[options.analysisKey] = [];
        AppState.currentVersionIndex[options.analysisKey] = 0;
    }

    // --- 2. Make API Call ---
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: options.prompt,
                passage: options.passage,
                moduleName: options.moduleName || options.version
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        const analysis = data.analysis;
        
        // --- 3. Store and Display Results ---
        
        // Store this new analysis as the first version
        if (options.type !== 'scroll-top' && options.type !== 'scroll-bottom') {
            AppState.analysisVersions[options.analysisKey] = [analysis];
            AppState.currentVersionIndex[options.analysisKey] = 0;
        }

        // Display the content
        displayAnalysis(analysis, options);

    } catch (error) {
        console.error('Analysis Error:', error);
        showError(error.message);
        
        // Ensure fetching state is reset on error
        if (options.type === 'scroll-top' || options.type === 'scroll-bottom') {
            AppState.isFetchingChapter = false;
        }
    } finally {
        // --- 4. Reset Loading State ---
        if (options.type === 'scroll-top' || options.type === 'scroll-bottom') {
            // Re-attach scroll listener after a short delay to allow DOM to settle
            setTimeout(() => {
                analysisDisplay.addEventListener('scroll', scrollHandler);
                AppState.isFetchingChapter = false;
            }, 100);
            hideScrollLoader(options.type === 'scroll-top' ? 'top' : 'bottom');
        } else {
            setLoadingState(false);
        }
    }
}

// ===== DISPLAY & UI FUNCTIONS =====

/**
 * Handles the "infinite scroll" behavior for the Bible Reader
 */
function scrollHandler() {
    if (AppState.isFetchingChapter || !AppState.currentReaderMode) {
        return;
    }

    const { scrollTop, scrollHeight, clientHeight } = analysisDisplay;

    // Check if scrolled to the top
    if (scrollTop < 50) { // 50px buffer
        const { book, chapter } = AppState.currentBibleReference;
        if (chapter > 1) {
            const prevChapter = chapter - 1;
            AppState.currentBibleReference.chapter = prevChapter; // Update state
            
            const version = versionSelect.value;
            const prompt = `Provide the full text for ${book} ${prevChapter}, using the ${version} version. Format it with [VerseNumber] tags.`;
            
            runAnalysis({
                type: 'scroll-top',
                prompt: prompt,
                passage: `${book} ${prevChapter}`,
                version: version
            });
        }
    }
    
    // Check if scrolled to the bottom
    if (scrollHeight - scrollTop - clientHeight < 50) { // 50px buffer
        const { book, chapter } = AppState.currentBibleReference;
        // We'd need to know max chapters per book for this. For now, just assume it's possible.
        const nextChapter = chapter + 1;
        AppState.currentBibleReference.chapter = nextChapter; // Update state

        const version = versionSelect.value;
        const prompt = `Provide the full text for ${book} ${nextChapter}, using the ${version} version. Format it with [VerseNumber] tags.`;
        
        runAnalysis({
            type: 'scroll-bottom',
            prompt: prompt,
            passage: `${book} ${nextChapter}`,
            version: version
        });
    }
}

/**
 * Shows or hides the main loading state
 * @param {boolean} isLoading
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        statusMessage.classList.remove('hidden');
        analysisDisplay.classList.remove('visible');
        
        statusMessage.innerHTML = `
            <div class="status-icon">
                <div class="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
            <div class="status-title">Analyzing...</div>
        `;
    } else {
        statusMessage.classList.add('hidden');
        analysisDisplay.classList.add('visible');
    }
    
    // Disable action buttons while loading
    runModuleBtn.disabled = isLoading;
    displayScriptureBtn.disabled = isLoading;
}

/**
 * Renders the analysis or scripture text to the display pane
 * @param {string} content - The formatted text to display
 * @param {object} options - The original options object
 */
function displayAnalysis(content, options) {
    // --- 1. Format the Content ---
    let formatted = formatMarkdown(content);
    
    // --- 2. Handle Scroll-Stitching ---
    if (options.type === 'scroll-top') {
        const oldScrollHeight = analysisDisplay.scrollHeight;
        const oldScrollTop = analysisDisplay.scrollTop;
        
        analysisDisplay.innerHTML = formatted + analysisDisplay.innerHTML;
        
        // Maintain scroll position
        analysisDisplay.scrollTop = oldScrollTop + (analysisDisplay.scrollHeight - oldScrollHeight);
        
    } else if (options.type === 'scroll-bottom') {
        analysisDisplay.innerHTML += formatted;
        
    } else {
        // This is a new, fresh load
        analysisDisplay.innerHTML = '';
        
        // --- 3. Build Header ---
        const header = document.createElement('div');
        header.className = 'analysis-header';
        
        if (options.type === 'module') {
            const template = document.getElementById('analysisHeaderTemplate');
            header.innerHTML = template.innerHTML;
            header.querySelector('#analysisPassageDisplay').textContent = options.passage;
            header.querySelector('#analysisModuleDisplay').textContent = options.moduleName;
            header.querySelector('#analysisIconDisplay').textContent = options.icon || '🔬';
            header.querySelector('#regenerateBtn').onclick = generateModuleAnalysis; // Re-hook
            
            // Detach scroll listener if it's a module
            analysisDisplay.removeEventListener('scroll', scrollHandler);

        } else if (options.type === 'scripture') {
            const template = document.getElementById('readerHeaderTemplate');
            header.innerHTML = template.innerHTML;
            header.querySelector('#readerChapterDisplay').textContent = `${AppState.currentBibleReference.book} ${AppState.currentBibleReference.chapter}`;
            
            // Attach scroll listener
            analysisDisplay.addEventListener('scroll', scrollHandler);
        }
        
        analysisDisplay.appendChild(header);
        
        // --- 4. Build Content Body ---
        const contentDiv = document.createElement('div');
        contentDiv.className = 'analysis-content';
        contentDiv.innerHTML = formatted;
        analysisDisplay.appendChild(contentDiv);
        
        // --- 5. Build Footer (for modules only) ---
        if (options.type === 'module') {
            const footer = document.createElement('div');
            footer.className = 'analysis-footer';
            const template = document.getElementById('versionControlsTemplate');
            footer.innerHTML = template.innerHTML;
            analysisDisplay.appendChild(footer);
            // updateVersionControls(); // This will be needed later
        }

        // --- 6. Scroll to Top (or to verse) ---
        if (options.type === 'scripture' && AppState.currentBibleReference.verse) {
            // Logic to scroll to a specific verse (to be implemented)
            analysisDisplay.scrollTop = 0; // For now, just scroll to top
        } else {
            analysisDisplay.scrollTop = 0;
        }
    }

    // Make sure display is visible
    statusMessage.classList.add('hidden');
    analysisDisplay.classList.add('visible');
}

/**
 * Shows an error message in the main display
 * @param {string} message
 */
function showError(message) {
    statusMessage.innerHTML = `
        <div class="status-icon">⚠️</div>
        <div class="status-title">Error</div>
        <p class="status-text" style="color: #d32f2f;">${message}</p>
    `;
    statusMessage.classList.remove('hidden');
    analysisDisplay.classList.remove('visible');
    
    // Re-enable buttons
    runModuleBtn.disabled = false;
    displayScriptureBtn.disabled = false;
}

/**
 * Formats plain text/markdown into HTML
 * @param {string} text
 * @returns {string} HTML
 */
function formatMarkdown(text) {
    if (!text) return '';

    // Simple markdown to HTML
    return text
        .replace(/</g, '&lt;') // Sanitize HTML
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.+?)\*/g, '<em>$1</em>')     // Italic
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')     // H1
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')   // H2
        .replace(/^### (.+)$/gm, '<h3>$1</h3>') // H3
        .replace(/\[(\d+:\d+)\]/g, '<strong>$1</strong>') // Verse numbers (e.g., [1:23])
        .replace(/\[(\d+)\]/g, '<strong>$1</strong>') // Verse numbers (e.g., [23])
        .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>') // Bullets
        .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>') // Bullets
        .replace(/^(\d+)\. (.*$)/gm, '<ol><li>$2</li></ol>') // Numbered lists
        .replace(/<\/ul>\n<ul>/g, '') // Combine adjacent bullet lists
        .replace(/<\/ol>\n<ol>/g, '') // Combine adjacent numbered lists
        .replace(/\n/g, '<br />') // Newlines
        .replace(/<br \/>\s*<br \/>/g, '</p><p>') // Paragraphs
        .replace(/<br \/><h1>/g, '<h1>')
        .replace(/<br \/><h2>/g, '<h2>')
        .replace(/<br \/><h3>/g, '<h3>')
        .replace(/<br \/><ul>/g, '<ul>')
        .replace(/<br \/><ol>/g, '<ol>');
}


/**
 * Shows/hides the top/bottom scroll loaders
 * @param {'top' | 'bottom'} position
 */
function showScrollLoader(position) {
    let loader = analysisDisplay.querySelector(`.scroll-loader-${position}`);
    if (!loader) {
        const template = document.getElementById('scrollLoaderTemplate');
        loader = template.content.cloneNode(true).firstElementChild;
        loader.classList.add(`scroll-loader-${position}`);
        
        if (position === 'top') {
            analysisDisplay.prepend(loader);
        } else {
            analysisDisplay.appendChild(loader);
        }
    }
    loader.style.display = 'block';
}

function hideScrollLoader(position) {
    let loader = analysisDisplay.querySelector(`.scroll-loader-${position}`);
    if (loader) {
        loader.style.display = 'none';
    }
}


// ===== NAVIGATION & UI STATE =====

function switchCategory(category) {
    AppState.currentCategory = category;
    
    // Update UI
    document.querySelectorAll('.primary-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    document.querySelectorAll('.module-group').forEach(group => {
        group.classList.toggle('active', group.dataset.category === category);
    });

    // Set first module as active
    const firstModule = ModuleDefinitions[category].modules;
    const firstModuleKey = Object.keys(firstModule)[0];
    switchModule(firstModuleKey);

    // Update header
    sidebarHeader.textContent = ModuleDefinitions[category].name;
}

function switchModule(module) {
    AppState.currentModule = module;
    
    document.querySelectorAll('.secondary-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.module === module);
    });
}

function getModuleInfo(category, module) {
    return ModuleDefinitions[category].modules[module];
}

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    sidebarArrow.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
}

function toggleNotes() {
    notesPanel.classList.toggle('collapsed');
    notesArrow.textContent = notesPanel.classList.contains('collapsed') ? '◀' : '▶';
}

function setNotesPanelSize(size) {
    notesPanel.classList.remove('collapsed', 'medium', 'wide');
    
    document.getElementById('collapseBtn').classList.remove('active');
    document.getElementById('normalBtn').classList.remove('active');
    document.getElementById('mediumBtn').classList.remove('active');
    document.getElementById('wideBtn').classList.remove('active');

    if (size === 'collapsed') {
        notesPanel.classList.add('collapsed');
        document.getElementById('collapseBtn').classList.add('active');
    } else if (size === 'medium') {
        notesPanel.classList.add('medium');
        document.getElementById('mediumBtn').classList.add('active');
    } else if (size === 'wide') {
        notesPanel.classList.add('wide');
        document.getElementById('wideBtn').classList.add('active');
    } else {
        // Default to 'normal'
        document.getElementById('normalBtn').classList.add('active');
    }
    
    notesArrow.textContent = size === 'collapsed' ? '◀' : '▶';
}

// ===== UTILITIES =====

/**
 * Parses a passage string into a reference object
 * @param {string} passageStr
 * @returns {object | null}
 */
function parsePassageReference(passageStr) {
    if (!passageStr) return null;
    
    // Simple parser: "Book Chapter:Verse" or "Book Chapter"
    // Regex to capture book, chapter, and optional verse
    const regex = /^([1-3]?\s?[A-Za-z]+)\s*(\d+)(?:[:\.](\d+))?.*$/;
    const match = passageStr.match(regex);
    
    if (match) {
        return {
            book: match[1].trim(),
            chapter: parseInt(match[2], 10),
            verse: match[3] ? parseInt(match[3], 10) : null
        };
    }
    
    return null; // Invalid format
}

// ===== NOTES (localStorage) =====

let saveTimeout = null;
function updateNoteState() {
    const content = notesEditor.value;
    const title = noteNameInput.value;
    
    // Update UI
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    wordCount.textContent = `${words} words`;
    
    if (AppState.currentNoteId) {
        noteMeta.textContent = `Editing • ${words} words`;
    } else {
        noteMeta.textContent = `New note • ${words} words`;
    }

    // Debounce save
    if (saveTimeout) clearTimeout(saveTimeout);
    saveStatus.textContent = 'Saving...';
    
    saveTimeout = setTimeout(() => {
        saveCurrentNote();
        saveStatus.textContent = 'Saved';
    }, 1000);
}

function saveCurrentNote() {
    const title = noteNameInput.value || 'Untitled Note';
    const content = notesEditor.value;
    
    if (!AppState.currentNoteId) {
        // This is a new note, create an ID
        if (!content && title === 'Untitled Note') return; // Don't save empty new notes
        AppState.currentNoteId = `note_${new Date().getTime()}`;
    }
    
    AppState.notes[AppState.currentNoteId] = {
        id: AppState.currentNoteId,
        title: title,
        content: content,
        lastModified: new Date().toISOString()
    };
    
    saveNotesToStorage();
    updateNoteList(); // Update count
}

function loadNotes() {
    const saved = localStorage.getItem('scribeNotes');
    if (saved) {
        AppState.notes = JSON.parse(saved);
    } else {
        AppState.notes = {};
    }
    updateNoteList();
    createNewNote(); // Start with a blank note
}

function saveNotesToStorage() {
    localStorage.setItem('scribeNotes', JSON.stringify(AppState.notes));
}

function createNewNote() {
    saveCurrentNote(); // Save any pending changes
    
    AppState.currentNoteId = null;
    noteNameInput.value = '';
    notesEditor.value = '';
    updateNoteState();
    noteNameInput.focus();
}

function loadNote(noteId) {
    if (!AppState.notes[noteId]) return;
    
    saveCurrentNote(); // Save any pending changes
    
    const note = AppState.notes[noteId];
    AppState.currentNoteId = noteId;
    noteNameInput.value = note.title;
    notesEditor.value = note.content;
    updateNoteState();
}

function deleteCurrentNote() {
    if (AppState.currentNoteId) {
        delete AppState.notes[AppState.currentNoteId];
        saveNotesToStorage();
        updateNoteList();
        createNewNote(); // Load a blank note
    }
}

function updateNoteList() {
    const count = Object.keys(AppState.notes).length;
    noteCount.textContent = count;
    // We'll build the "My Notes" modal later
}

function showNotesList() {
    // This is a stub for building the modal
    alert('Showing all notes (modal not yet built)');
}
