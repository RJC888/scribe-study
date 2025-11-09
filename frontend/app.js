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
    currentVersionIndex: {}
};

// ===== PROMPT DEFINITIONS =====
const Prompts = {
    displayScripture: `Please provide the full, formatted text for {passage}. 
- Include verse numbers (e.g., **[16]**).
- Do not add any commentary, analysis, or headers. 
- Just return the scripture text, formatted for readability.`,
    
    askAi: `You are a helpful and knowledgeable assistant for theological study. 
Answer the following question clearly and concisely.
Question: {passage}` // {passage} will be the user's question
};

// ===== MODULE DEFINITIONS =====
const ModuleDefinitions = {
    'languages': { 
        name: 'Original Languages',
        modules: {
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
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

    // --- NEW: Action Bar Buttons ---
    document.getElementById('moduleAnalysisBtn').addEventListener('click', generateModuleAnalysis);
    document.getElementById('displayScriptureBtn').addEventListener('click', displayScripture);
    document.getElementById('askAiBtn').addEventListener('click', askGeneralQuestion);
    
    // Enter key (defaults to module analysis)
    document.getElementById('passageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateModuleAnalysis();
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
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

// ===== NEW: ANALYSIS FUNCTIONS =====

/**
 * Gets the passage from the input box.
 * @returns {string} The trimmed passage or an empty string.
 */
function getPassageInput() {
    const passage = document.getElementById('passageInput').value.trim();
    if (!passage) {
        showError('Please enter a scripture passage or question in the text box.');
        return '';
    }
    AppState.currentPassage = passage;
    return passage;
}

/**
 * Disables or enables all action buttons.
 * @param {boolean} disabled - True to disable, false to enable.
 */
function setActionButtonsDisabled(disabled) {
    document.getElementById('moduleAnalysisBtn').disabled = disabled;
    document.getElementById('displayScriptureBtn').disabled = disabled;
    document.getElementById('askAiBtn').disabled = disabled;
}

/**
 * Runs the selected module's analysis.
 */
function generateModuleAnalysis() {
    const passage = getPassageInput();
    if (!passage) return;

    const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
    const prompt = moduleInfo.prompt.replace('{passage}', passage);
    
    runAnalysis(prompt, moduleInfo.name, passage);
}

/**
 * Displays the scripture text for the given passage.
 */
function displayScripture() {
    const passage = getPassageInput();
    if (!passage) return;

    const prompt = Prompts.displayScripture.replace('{passage}', passage);
    runAnalysis(prompt, `Scripture Text: ${passage}`, passage);
}

/**
 * Asks a general question to the AI.
 */
function askGeneralQuestion() {
    const passage = getPassageInput(); // Here, 'passage' is the user's question
    if (!passage) return;

    const prompt = Prompts.askAi.replace('{passage}', passage);
    runAnalysis(prompt, `General Question`, passage);
}

/**
 * The core function to call the backend API.
 * @param {string} prompt - The full prompt to send to the AI.
 * @param {string} moduleName - The name of the module or action for display.
 * @param {string} passage - The user's input passage/question for display.
 */
async function runAnalysis(prompt, moduleName, passage) {
    // 1. Show loading state and disable buttons
    showLoadingState(moduleName, passage);
    setActionButtonsDisabled(true);

    try {
        // 2. Call BACKEND API
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                passage: passage,
                moduleName: moduleName
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        const analysis = data.analysis;

        // 3. Store version (only for module analysis)
        if (moduleName !== `Scripture Text: ${passage}` && moduleName !== `General Question`) {
            const versionKey = `${AppState.currentCategory}-${AppState.currentModule}`;
            if (!AppState.analysisVersions[versionKey]) {
                AppState.analysisVersions[versionKey] = [];
            }
            AppState.analysisVersions[versionKey].push(analysis);
            AppState.currentVersionIndex[versionKey] = AppState.analysisVersions[versionKey].length - 1;
        }

        // 4. Display results
        displayAnalysis(analysis, moduleName, passage);

    } catch (error) {
        console.error('Analysis Error:', error);
        showError(error.message);
    } finally {
        // 5. Re-enable buttons
        setActionButtonsDisabled(false);
    }
}


// ===== DISPLAY FUNCTIONS =====
function showLoadingState(moduleName, passage) {
    // Set button text during loading
    const moduleBtn = document.getElementById('moduleAnalysisBtn');
    const scriptureBtn = document.getElementById('displayScriptureBtn');
    const aiBtn = document.getElementById('askAiBtn');
    
    // Reset all buttons
    moduleBtn.innerHTML = `<span>📖</span><span>Run Module Analysis</span>`;
    scriptureBtn.innerHTML = `<span>📚</span><span>Display Scripture Text</span>`;
    aiBtn.innerHTML = `<span>✨</span><span>Ask General Question</span>`;

    // Set loading text on the specific button clicked (or default to module)
    if (moduleName === `Scripture Text: ${passage}`) {
        scriptureBtn.innerHTML = `<span>📚</span><span>Loading...</span>`;
    } else if (moduleName === `General Question`) {
        aiBtn.innerHTML = `<span>✨</span><span>Loading...</span>`;
    } else {
        moduleBtn.innerHTML = `<span>📖</span><span>Loading...</span>`;
    }

    const display = document.getElementById('analysisDisplay');
    display.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚡</div>
            <div style="font-size: 18px; color: var(--text-medium); margin-bottom: 10px;">
                Analyzing ${passage}...
            </div>
            <div style="font-size: 14px; color: var(--text-medium);">
                Using ${moduleName}
            </div>
            <div style="margin-top: 20px;">
                <div class="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        </div>
    `;
}

function displayAnalysis(analysis, moduleName, passage) {
    // Reset all button text
    document.getElementById('moduleAnalysisBtn').innerHTML = `<span>📖</span><span>Run Module Analysis</span>`;
    document.getElementById('displayScriptureBtn').innerHTML = `<span>📚</span><span>Display Scripture Text</span>`;
    document.getElementById('askAiBtn').innerHTML = `<span>✨</span><span>Ask General Question</span>`;

    const display = document.getElementById('analysisDisplay');
    
    // --- New, More Robust Markdown-to-HTML Converter ---
    let formatted = analysis
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic

    // Headers
    formatted = formatted
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Unordered lists (hyphens or asterisks)
    formatted = formatted.replace(/^(?:(?:-|\*)\s.*(?:\n|$))+/gm, (match) => {
        const items = match.trim().split('\n');
        return '<ul>\n' + items.map(item => `  <li>${item.substring(item.indexOf(' ')).trim()}</li>`).join('\n') + '\n</ul>';
    });

    // Ordered lists
    formatted = formatted.replace(/^(?:\d+\.\s.*(?:\n|$))+/gm, (match) => {
        const items = match.trim().split('\n');
        return '<ol>\n' + items.map(item => `  <li>${item.substring(item.indexOf(' ')).trim()}</li>`).join('\n') + '\n</ol>';
    });
    
    // Paragraphs
    const lines = formatted.split('\n');
    let html = '';
    let inParagraph = false;

    for (const line of lines) {
        if (line.trim() === '') {
            if (inParagraph) {
                html += '</p>\n';
                inParagraph = false;
            }
            html += '\n'; // Add a newline for separation
        } else if (line.startsWith('<ul>') || line.startsWith('<ol>') || line.startsWith('<li>') || line.startsWith('</ul>') || line.startsWith('</ol>') || line.startsWith('<h')) {
            if (inParagraph) {
                html += '</p>\n';
                inParagraph = false;
            }
            html += line + '\n';
        } else {
            if (!inParagraph) {
                html += '<p>';
                inParagraph = true;
            }
            html += line + ' '; // Join lines in a paragraph
        }
    }
    if (inParagraph) {
        html += '</p>\n';
    }
    // --- End of New Converter ---

    display.innerHTML = `
        <div class="analysis-header">
            <div class="analysis-title">
                <span class="analysis-icon">📖</span>
                <div>
                    <div class="analysis-passage">${passage}</div>
                    <div class="analysis-module">${moduleName}</div>
                </div>
            </div>
        </div>
        <div class="analysis-content">
            ${html} 
        </div>
        <div class="analysis-footer">
            <span style="color: var(--text-medium); font-size: 12px;">
                ⚡ Powered by Groq AI
            </span>
        </div>
    `;

    updateVersionControls();
}

function showError(message) {
    // Reset all button text
    document.getElementById('moduleAnalysisBtn').innerHTML = `<span>📖</span><span>Run Module Analysis</span>`;
    document.getElementById('displayScriptureBtn').innerHTML = `<span>📚</span><span>Display Scripture Text</span>`;
    document.getElementById('askAiBtn').innerHTML = `<span>✨</span><span>Ask General Question</span>`;

    const display = document.getElementById('analysisDisplay');
    display.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <div style="font-size: 18px; color: #d32f2f; margin-bottom: 10px;">
                Error
            </div>
            <div style="font-size: 14px; color: var(--text-medium); margin-bottom: 20px;">
                ${message}
            </div>
        </div>
    `;
}

// ===== NAVIGATION =====
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
    document.getElementById('sidebarHeader').textContent = ModuleDefinitions[category].name;
}

function switchModule(module) {
    AppState.currentModule = module;
    
    document.querySelectorAll('.secondary-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.module === module);
    });

    // No longer need to update a module display in the header
}

function getModuleInfo(category, module) {
    // Add check for missing definitions
    if (!ModuleDefinitions[category] || !ModuleDefinitions[category].modules[module]) {
        console.error(`Missing module definition for: ${category} -> ${module}`);
        // Return a fallback to prevent crashing
        return { name: "Error", prompt: "Error: Missing module.", icon: "⚠️" };
    }
    return ModuleDefinitions[category].modules[module];
}

// REMOVED updateModuleDisplay() as it's no longer needed

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// ===== VERSION NAVIGATION =====
function navigateVersion(direction) {
    const versionKey = `${AppState.currentCategory}-${AppState.currentModule}`;
    const versions = AppState.analysisVersions[versionKey] || [];
    let currentIndex = AppState.currentVersionIndex[versionKey] || 0;

    currentIndex += direction;
    
    if (currentIndex >= 0 && currentIndex < versions.length) {
        AppState.currentVersionIndex[versionKey] = currentIndex;
        const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
        displayAnalysis(versions[currentIndex], moduleInfo.name, AppState.currentPassage);
    }
}

function updateVersionControls() {
    const versionKey = `${AppState.currentCategory}-${AppState.currentModule}`;
    const versions = AppState.analysisVersions[versionKey] || [];
    const currentIndex = AppState.currentVersionIndex[versionKey] || 0;

    const prevBtn = document.getElementById('prevVersionBtn');
    const nextBtn = document.getElementById('nextVersionBtn');
    const indicator = document.getElementById('versionIndicator');

    // Need to check if these elements exist, as they are not in the initial HTML
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= versions.length - 1;
    if (indicator) indicator.textContent = `Version ${currentIndex + 1} of ${Math.max(versions.length, 1)}`;
}

// ===== NOTES (STUB - IMPLEMENT LATER) =====
function loadNotes() {
    // This should be refactored to use Firestore
    console.warn("Notes are using localStorage. This should be migrated to Firestore.");
    const saved = localStorage.getItem('scribeNotes');
    if (saved) {
        AppState.notes = JSON.parse(saved);
    }
}

function saveNotes() {
    // This should be refactored to use Firestore
    console.warn("Notes are using localStorage. This should be migrated to Firestore.");
    localStorage.setItem('scribeNotes', JSON.JSON.stringify(AppState.notes));
}
