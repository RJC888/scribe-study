// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    deleteDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    setLogLevel
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ===== SCRIBE STUDY FRONTEND =====
// BUNDLED BIBLE DATA: Fixes loading errors and race conditions.

// ===== BIBLE STRUCTURE DATA =====
// This is the entire 'bible-structure.json' file, embedded to prevent loading errors.
const BIBLE_DATA = {
    "testament": {
        "old": {
            "books": [
                {"name": "Genesis", "abbr": "Gen", "chapters": 50, "verses": [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26]},
                {"name": "Exodus", "abbr": "Exod", "chapters": 40, "verses": [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38]},
                {"name": "Leviticus", "abbr": "Lev", "chapters": 27, "verses": [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34]},
                {"name": "Numbers", "abbr": "Num", "chapters": 36, "verses": [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13]},
                {"name": "Deuteronomy", "abbr": "Deut", "chapters": 34, "verses": [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12]},
                {"name": "Joshua", "abbr": "Josh", "chapters": 24, "verses": [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33]},
                {"name": "Judges", "abbr": "Judg", "chapters": 21, "verses": [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25]},
                {"name": "Ruth", "abbr": "Ruth", "chapters": 4, "verses": [22,23,18,22]},
                {"name": "1 Samuel", "abbr": "1Sam", "chapters": 31, "verses": [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13]},
                {"name": "2 Samuel", "abbr": "2Sam", "chapters": 24, "verses": [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25]},
                {"name": "1 Kings", "abbr": "1Kgs", "chapters": 22, "verses": [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53]},
                {"name": "2 Kings", "abbr": "2Kgs", "chapters": 25, "verses": [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,20,21,26,20,37,20,30]},
                {"name": "1 Chronicles", "abbr": "1Chr", "chapters": 29, "verses": [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30]},
                {"name": "2 Chronicles", "abbr": "2Chr", "chapters": 36, "verses": [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23]},
                {"name": "Ezra", "abbr": "Ezra", "chapters": 10, "verses": [11,70,13,24,17,22,28,36,15,44]},
                {"name": "Nehemiah", "abbr": "Neh", "chapters": 13, "verses": [11,20,32,23,19,19,73,18,38,39,36,47,31]},
                {"name": "Esther", "abbr": "Esth", "chapters": 10, "verses": [22,23,15,17,14,14,10,17,32,3]},
                {"name": "Job", "abbr": "Job", "chapters": 42, "verses": [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17]},
                {"name": "Psalms", "abbr": "Ps", "chapters": 150, "verses": [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6]},
                {"name": "Proverbs", "abbr": "Prov", "chapters": 31, "verses": [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31]},
                {"name": "Ecclesiastes", "abbr": "Eccl", "chapters": 12, "verses": [18,26,22,16,20,12,29,17,18,20,10,14]},
                {"name": "Song of Solomon", "abbr": "Song", "chapters": 8, "verses": [17,17,11,16,16,13,13,14]},
                {"name": "Isaiah", "abbr": "Isa", "chapters": 66, "verses": [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24]},
                {"name": "Jeremiah", "abbr": "Jer", "chapters": 52, "verses": [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34]},
                {"name": "Lamentations", "abbr": "Lam", "chapters": 5, "verses": [22,22,66,22,22]},
                {"name": "Ezekiel", "abbr": "Ezek", "chapters": 48, "verses": [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35]},
                {"name": "Daniel", "abbr": "Dan", "chapters": 12, "verses": [21,49,30,37,31,28,28,27,27,21,45,13]},
                {"name": "Hosea", "abbr": "Hos", "chapters": 14, "verses": [11,23,5,19,15,11,16,14,17,15,12,14,16,9]},
                {"name": "Joel", "abbr": "Joel", "chapters": 3, "verses": [20,32,21]},
                {"name": "Amos", "abbr": "Amos", "chapters": 9, "verses": [15,16,15,13,27,14,17,14,15]},
                {"name": "Obadiah", "abbr": "Obad", "chapters": 1, "verses": [21]},
                {"name": "Jonah", "abbr": "Jonah", "chapters": 4, "verses": [17,10,10,11]},
                {"name": "Micah", "abbr": "Mic", "chapters": 7, "verses": [16,13,12,13,15,16,20]},
                {"name": "Nahum", "abbr": "Nah", "chapters": 3, "verses": [15,13,19]},
                {"name": "Habakkuk", "abbr": "Hab", "chapters": 3, "verses": [17,20,19]},
                {"name": "Zephaniah", "abbr": "Zeph", "chapters": 3, "verses": [18,15,20]},
                {"name": "Haggai", "abbr": "Hag", "chapters": 2, "verses": [15,23]},
                {"name": "Zechariah", "abbr": "Zech", "chapters": 14, "verses": [21,13,10,14,11,15,14,23,17,12,17,14,9,21]},
                {"name": "Malachi", "abbr": "Mal", "chapters": 4, "verses": [14,17,18,6]}
            ]
        },
        "new": {
            "books": [
                {"name": "Matthew", "abbr": "Matt", "chapters": 28, "verses": [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20]},
                {"name": "Mark", "abbr": "Mark", "chapters": 16, "verses": [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20]},
                {"name": "Luke", "abbr": "Luke", "chapters": 24, "verses": [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53]},
                {"name": "John", "abbr": "John", "chapters": 21, "verses": [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25]},
                {"name": "Acts", "abbr": "Acts", "chapters": 28, "verses": [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31]},
                {"name": "Romans", "abbr": "Rom", "chapters": 16, "verses": [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27]},
                {"name": "1 Corinthians", "abbr": "1Cor", "chapters": 16, "verses": [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24]},
                {"name": "2 Corinthians", "abbr": "2Cor", "chapters": 13, "verses": [24,17,18,18,21,18,16,24,15,18,33,21,14]},
                {"name": "Galatians", "abbr": "Gal", "chapters": 6, "verses": [24,21,29,31,26,18]},
                {"name": "Ephesians", "abbr": "Eph", "chapters": 6, "verses": [23,22,21,32,33,24]},
                {"name": "Philippians", "abbr": "Phil", "chapters": 4, "verses": [30,30,21,23]},
                {"name": "Colossians", "abbr": "Col", "chapters": 4, "verses": [29,23,25,18]},
                {"name": "1 Thessalonians", "abbr": "1Thess", "chapters": 5, "verses": [10,20,13,18,28]},
                {"name": "2 Thessalonians", "abbr": "2Thess", "chapters": 3, "verses": [12,17,18]},
                {"name": "1 Timothy", "abbr": "1Tim", "chapters": 6, "verses": [20,15,16,16,25,21]},
                {"name": "2 Timothy", "abbr": "2Tim", "chapters": 4, "verses": [18,26,17,22]},
                {"name": "Titus", "abbr": "Titus", "chapters": 3, "verses": [16,15,15]},
                {"name": "Philemon", "abbr": "Phlm", "chapters": 1, "verses": [25]},
                {"name": "Hebrews", "abbr": "Heb", "chapters": 13, "verses": [14,18,19,16,14,20,28,13,28,39,40,29,25]},
                {"name": "James", "abbr": "Jas", "chapters": 5, "verses": [27,26,18,17,20]},
                {"name": "1 Peter", "abbr": "1Pet", "chapters": 5, "verses": [25,25,22,19,14]},
                {"name": "2 Peter", "abbr": "2Pet", "chapters": 3, "verses": [21,22,18]},
                {"name": "1 John", "abbr": "1John", "chapters": 5, "verses": [10,29,24,21,21]},
                {"name": "2 John", "abbr": "2John", "chapters": 1, "verses": [13]},
                {"name": "3 John", "abbr": "3John", "chapters": 1, "verses": [14]},
                {"name": "Jude", "abbr": "Jude", "chapters": 1, "verses": [25]},
                {"name": "Revelation", "abbr": "Rev", "chapters": 22, "verses": [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21]}
            ]
        }
    }
};

// ===== CONFIGURATION =====
const API_URL = window.location.hostname === 'localhost'
    ? 'https://scribe-study.vercel.app/api' // Use deployed backend while testing locally
    : '/api'; // Production (same domain)

// --- Firebase Configuration ---
// These variables are injected by the environment.
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// ===== DOM CACHE (for performance) =====
const DOMElements = {};

// ===== APPLICATION STATE =====
const AppState = {
    // Firebase State
    app: null,
    auth: null,
    db: null,
    userId: null,
    notesCollectionRef: null,
    notesUnsubscribe: null, // To stop the listener

    // App State
    currentCategory: 'devotional',
    currentModule: 'spiritual-analysis',
    currentPassage: '',
    currentNoteId: null, // Tracks the currently open note
    notes: {}, // In-memory store, populated by Firestore
    currentFontSize: 'font-size-normal', // Default font size
    // Bible Reader State
    currentReaderMode: false,
    currentBibleReference: { book: '', chapter: null, verse: null },
    isFetchingChapter: false,
    // Bible Structure
    bibleBookMap: new Map(), // Stores name/abbr -> book object
    bibleBookList: [], // Stores ordered list of book names
    // Observers
    scrollObserver: null,
    headerObserver: null
};

// ===== MODULE DEFINITIONS =====
const ModuleDefinitions = {
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
                prompt: `Provide detailed verse-by-verse grammatical breakdown of {passage}...`,
                icon: '📖'
            },
            'semantic-range': {
                name: 'Semantic Range',
                prompt: `Explore the semantic range of key terms in {passage}...`,
                icon: '🌈'
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
    // --- THIS IS THE FIX ---
    // We wrap EVERYTHING in the try...catch block.
    // This ensures that if caching DOM elements fails OR
    // processBibleData fails, the catch block will
    // be triggered correctly.
    try {
        // 1. Cache all DOM elements FIRST
        DOMElements.sidebar = document.getElementById('sidebar');
        DOMElements.sidebarToggle = document.getElementById('sidebarToggle');
        DOMElements.sidebarArrow = document.getElementById('sidebarArrow');
        DOMElements.sidebarHeader = document.getElementById('sidebarHeader');
        DOMElements.notesPanel = document.getElementById('notesPanel');
        DOMElements.notesToggle = document.getElementById('notesToggle');
        DOMElements.notesArrow = document.getElementById('notesArrow');
        DOMElements.passageInput = document.getElementById('passageInput');
        DOMElements.runModuleBtn = document.getElementById('runModuleBtn');
        DOMElements.displayScriptureBtn = document.getElementById('displayScriptureBtn');
        DOMElements.versionSelect = document.getElementById('versionSelect');
        DOMElements.resultsMain = document.getElementById('resultsMain');
        DOMElements.statusMessage = document.getElementById('statusMessage');
        DOMElements.statusIcon = document.getElementById('statusIcon');
        DOMElements.statusTitle = document.getElementById('statusTitle');
        DOMElements.statusText = document.getElementById('statusText');
        DOMElements.analysisDisplay = document.getElementById('analysisDisplay');
        DOMElements.analysisHeader = document.querySelector('.analysis-header');
        DOMElements.analysisTitleDisplay = document.getElementById('analysisTitleDisplay');
        DOMElements.analysisIconDisplay = document.getElementById('analysisIconDisplay');
        DOMElements.analysisPassageDisplay = document.getElementById('analysisPassageDisplay');
        DOMElements.analysisModuleDisplay = document.getElementById('analysisModuleDisplay');
        DOMElements.readerControlsDisplay = document.getElementById('readerControlsDisplay');
        DOMElements.readerTitleDisplay = document.getElementById('readerTitleDisplay');
        DOMElements.fontDecreaseBtn = document.getElementById('fontDecreaseBtn');
        DOMElements.fontIncreaseBtn = document.getElementById('fontIncreaseBtn');
        DOMElements.analysisContent = document.getElementById('analysisContent');
        DOMElements.scrollLoaderTop = document.getElementById('scrollLoaderTop');
        DOMElements.scrollLoaderBottom = document.getElementById('scrollLoaderBottom');
        DOMElements.analysisFooter = document.getElementById('analysisFooter');
        
        // Notes Panel Elements
        DOMElements.noteEditor = document.getElementById('noteEditor');
        DOMElements.notesList = document.getElementById('notesList');
        DOMElements.newNoteBtn = document.getElementById('newNoteBtn');
        DOMElements.saveNoteBtn = document.getElementById('saveNoteBtn');
        DOMElements.deleteNoteBtn = document.getElementById('deleteNoteBtn');
        DOMElements.noteCount = document.getElementById('noteCount');

        // 2. Initialize Firebase
        // This function can now safely call setErrorState if it fails
        initializeFirebaseAndAuth();

        // 3. Initialize Bible data
        processBibleData();

        // 4. Set initial UI state
        updateModuleDisplay();
        // loadNotes() is now called by Firebase auth

        // 5. Attach all event listeners
        initializeAppListeners();

        // 6. App is ready
        // *** THIS IS THE "Loading" HANG FIX ***
        // We DO NOT set "Ready" here. We wait for Firebase to log in.
        console.log("DOM content loaded. Waiting for Firebase auth...");

    } catch (error) {
        console.error("Failed to initialize app:", error);
        // This will now work because DOMElements are cached.
        setErrorState("Failed to load app. Check console for errors.");
    }
});

/**
 * Initializes Firebase services and authentication.
 */
async function initializeFirebaseAndAuth() {
  try {
    console.log("Initializing Firebase...");

    // ✅ Use the existing initialized app from the <head> script
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    setLogLevel('Debug');

    // Store in AppState
    AppState.app = app;
    AppState.auth = auth;
    AppState.db = db;

        // --- Authentication ---
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                AppState.userId = user.uid;
                console.log("User authenticated with UID:", AppState.userId);
                
                // Define the Firestore collection path for this user
                const collectionPath = `/artifacts/${appId}/users/${AppState.userId}/notes`;
                AppState.notesCollectionRef = collection(AppState.db, collectionPath);
                console.log("Firestore notes collection path set to:", collectionPath);

                // User is authenticated, now we can safely set up the notes listener
                loadNotesFromFirestore();

                // *** THIS IS THE "Loading" HANG FIX ***
                // Now that we are logged in AND have a notes listener,
                // we can unlock the app.
                setReadyState("Ready to Study God's Word", "Enter a scripture passage or general question, then choose an action.");


            } else {
                // User is signed out, or first-time visit
                AppState.userId = null;
                console.log("User is signed out. Attempting to sign in.");
                
                // Stop listening to old user's notes
                if (AppState.notesUnsubscribe) {
                    AppState.notesUnsubscribe();
                    AppState.notesUnsubscribe = null;
                }

                // Try to sign in
                try {
                    if (initialAuthToken) {
                        console.log("Attempting sign in with custom token...");
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        console.log("No custom token. Attempting sign in anonymously...");
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error during sign-in:", error);
                    setErrorState(`Authentication Failed: ${error.message}`);
                }
            }
        });

    } catch (e) {
        console.error("Error initializing Firebase:", e);
        setErrorState("Failed to initialize Firebase. Please check console.");
    }
}

/**
 * Processes the embedded BIBLE_DATA and populates the AppState maps.
 */
function processBibleData() {
    const allBooks = [...BIBLE_DATA.testament.old.books, ...BIBLE_DATA.testament.new.books];
    allBooks.forEach((book, index) => {
        const bookKey = book.name.toLowerCase();
        const bookData = { ...book, globalIndex: index };
        
        AppState.bibleBookMap.set(bookKey, bookData);
        // Add abbreviations as aliases
        if (book.abbr) {
            AppState.bibleBookMap.set(book.abbr.toLowerCase(), bookData);
        }
        AppState.bibleBookList.push(book.name);
    });
}

/**
 * Attaches all primary event listeners to the DOM.
 */
function initializeAppListeners() {
    // Primary tabs
    document.querySelectorAll('.primary-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const category = e.target.closest('.primary-tab').dataset.category;
            switchCategory(category);
        });
    });

    // Secondary tabs (modules)
    document.querySelectorAll('.secondary-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Find the button itself, even if the user clicks the icon or text
            const button = e.target.closest('.secondary-tab');
            const module = button.dataset.module;
            switchModule(module);
        });
    });

    // Main action buttons
    DOMElements.runModuleBtn.addEventListener('click', runModuleAnalysis);
    DOMElements.displayScriptureBtn.addEventListener('click', displayScripture);
    
    // Enter key
    DOMElements.passageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Default to module analysis on Enter key
            runModuleAnalysis();
        }
    });

    // Sidebar & Notes Panel Toggles
    DOMElements.sidebarToggle.addEventListener('click', () => toggleSidebar(true));
    DOMElements.notesToggle.addEventListener('click', () => toggleNotes(true));
    
    // This is the close button on the sidebar itself (for mobile)
    if (DOMElements.sidebarArrow) {
        DOMElements.sidebarArrow.addEventListener('click', () => toggleSidebar(false));
    }
    // This is the close button on the notes panel itself (for mobile)
    if (DOMElements.notesArrow) {
        DOMElements.notesArrow.addEventListener('click', () => toggleNotes(false));
    }
    
    // Font Controls
    DOMElements.fontDecreaseBtn.addEventListener('click', () => handleFontSizeChange(-1));
    DOMElements.fontIncreaseBtn.addEventListener('click', () => handleFontSizeChange(1));

    // Notes Panel Controls (from index.html)
    document.getElementById('collapseBtn')?.addEventListener('click', () => resizeNotes('collapsed'));
    document.getElementById('normalBtn')?.addEventListener('click', () => resizeNotes('normal'));
    document.getElementById('mediumBtn')?.addEventListener('click', () => resizeNotes('medium'));
    document.getElementById('wideBtn')?.addEventListener('click', () => resizeNotes('wide'));

    // --- Notes Functionality Listeners ---
    DOMElements.newNoteBtn.addEventListener('click', createNewNote);
    DOMElements.saveNoteBtn.addEventListener('click', saveCurrentNote);
    DOMElements.deleteNoteBtn.addEventListener('click', deleteCurrentNote);

    // Event delegation for clicking on a note in the list
    DOMElements.notesList.addEventListener('click', handleNoteListClick);
}

// ===== API & CORE FUNCTIONS =====

/**
 * Central function to set the app's loading state.
 * @param {boolean} isLoading - Whether the app is entering a loading state.
 * @param {string} [title='Analyzing...'] - The title for the loading message.
 */
function setLoadingState(isLoading, title = 'Analyzing...') {
    if (isLoading) {
        // --- Enter Loading State ---
        // CRITICAL: Stop all background listeners BEFORE new action
        disconnectObservers(); 
        
        DOMElements.statusTitle.textContent = title;
        DOMElements.statusIcon.innerHTML = `<div class="flex space-x-1.5"><div class="dot dot-1"></div><div class="dot dot-2"></div><div class="dot dot-3"></div></div>`;
        DOMElements.statusText.style.display = 'none'; // Hide text
        DOMElements.statusMessage.style.display = 'flex'; // Show status wrapper
        DOMElements.analysisDisplay.style.display = 'none'; // Hide old analysis

        // Disable all inputs
        DOMElements.passageInput.disabled = true;
        DOMElements.runModuleBtn.disabled = true;
        DOMElements.displayScriptureBtn.disabled = true;
        DOMElements.versionSelect.disabled = true;
    } else {
        // --- Exit Loading State ---
        // Re-enable all inputs
        DOMElements.passageInput.disabled = false;
        DOMElements.runModuleBtn.disabled = false;
        DOMElements.displayScriptureBtn.disabled = false;
        DOMElements.versionSelect.disabled = false;
        
        // Hide status, show analysis
        DOMElements.statusMessage.style.display = 'none';
        DOMElements.analysisDisplay.style.display = 'flex';
    }
}

/**
 * Sets the app to a "Ready" state (e.g., on load).
 */
function setReadyState(title, text, icon = '📖') {
    if (!DOMElements.statusIcon) return; // Guard against race condition
    DOMElements.statusIcon.innerHTML = icon;
    DOMElements.statusTitle.textContent = title;
    DOMElements.statusText.textContent = text;
    DOMElements.statusIcon.style.display = 'block';
    DOMElements.statusText.style.display = 'block';
    DOMElements.statusMessage.style.display = 'flex';
    DOMElements.analysisDisplay.style.display = 'none';
    
    // Enable inputs
    DOMElements.passageInput.disabled = false;
    DOMElements.runModuleBtn.disabled = false;
    DOMElements.displayScriptureBtn.disabled = false;
    DOMElements.versionSelect.disabled = false;
}

/**
 * Sets the app to an "Error" state.
 */
function setErrorState(errorMessage) {
    setReadyState('Error', errorMessage, '⚠️');
    // Ensure inputs are re-enabled so user can try again
    DOMElements.passageInput.disabled = false;
    DOMElements.runModuleBtn.disabled = false;
    DOMElements.displayScriptureBtn.disabled = false;
    DOMElements.versionSelect.disabled = false;
}

/**
 * Central API call function.
 * @param {string} prompt - The full prompt to send to the backend.
 * @param {string} passage - The scripture passage.
 * @param {string} moduleName - The name of the module.
 * @returns {Promise<string>} - The formatted analysis text.
 */
async function runAnalysis(prompt, passage, moduleName) {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                passage: passage,
                moduleName: moduleName,
                version: DOMElements.versionSelect.value // Send selected version
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        return data.analysis;

    } catch (error) {
        console.error('Analysis Error:', error);
        setErrorState(error.message);
        return null; // Return null on failure
    }
}

// ===== FEATURE: MODULE ANALYSIS =====

/**
 * Runs the currently selected module analysis.
 */
async function runModuleAnalysis() {
    // CRITICAL FIX: Kill any "ghost" Bible Reader listeners FIRST.
    disconnectObservers();
    AppState.currentReaderMode = false;

    const passage = DOMElements.passageInput.value.trim();
    if (!passage) {
        setErrorState('Please enter a scripture passage or question.');
        return;
    }
    
    AppState.currentPassage = passage;
    const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
    
    // Set loading state
    setLoadingState(true, `Analyzing ${passage}...`);

    let finalPrompt;
    // Check if it's a general question
    if (!parsePassageReference(passage)) {
        finalPrompt = `Answer the following question based on biblical and theological knowledge: "${passage}"`;
    } else {
        finalPrompt = moduleInfo.prompt.replace('{passage}', passage);
    }

    const analysis = await runAnalysis(finalPrompt, passage, moduleInfo.name);

    if (analysis) {
        // Success
        setLoadingState(false);
        displayAnalysis({
            content: analysis,
            icon: moduleInfo.icon,
            passage: AppState.currentPassage,
            moduleName: moduleInfo.name,
            isReaderMode: false
        });
    }
    // If analysis is null, setErrorState was already called by runAnalysis
}

// ===== FEATURE: BIBLE READER =====

/**
 * Initiates the Bible Reader, fetching the full chapter.
 */
async function displayScripture() {
    // CRITICAL: Kill any "ghost" listeners from a previous session
    disconnectObservers();
    AppState.currentReaderMode = true;

    const passageInput = DOMElements.passageInput.value.trim();
    if (!passageInput) {
        setErrorState('Please enter a scripture passage.');
        return;
    }

    const ref = parsePassageReference(passageInput);
    if (!ref) {
        setErrorState(`Could not understand passage: "${passageInput}". Try "John 3:16" or "Genesis 1".`);
        return;
    }
    
    AppState.currentBibleReference = ref;
    
    // Set loading state
    setLoadingState(true, `Loading ${ref.book} ${ref.chapter}...`);
    
    await fetchAndDisplayChapter(ref, 'replace');
}

/**
 * Fetches and displays a specific chapter.
 * @param {object} ref - The reference object {book, chapter}.
 * @param {'replace' | 'prepend' | 'append'} mode - How to add the content.
 */
async function fetchAndDisplayChapter(ref, mode = 'replace') {
    if (!ref) {
        console.warn("fetchAndDisplayChapter called with null reference.");
        return;
    }
    AppState.isFetchingChapter = true;
    const version = DOMElements.versionSelect.value;
    const passage = `${ref.book} ${ref.chapter}`;

    // Show loaders
    if (mode === 'prepend') DOMElements.scrollLoaderTop.style.display = 'block';
    if (mode === 'append') DOMElements.scrollLoaderBottom.style.display = 'block';
    
    const prompt = `Provide the full, complete text for the entire chapter of ${passage}.
- **Version:** Use the ${version} version.
- **Formatting:** - Include verse numbers in brackets (e.g., [1], [2]).
    - Do NOT add any extra commentary, headers, or introductions. Just the scripture text.`;

    const analysis = await runAnalysis(prompt, passage, `Scripture Text (${version})`);

    // Hide loaders
    if (mode === 'prepend') DOMElements.scrollLoaderTop.style.display = 'none';
    if (mode === 'append') DOMElements.scrollLoaderBottom.style.display = 'none';

    if (analysis) {
        if (mode === 'replace') {
            // This is a new request, so exit loading state
            setLoadingState(false);
            displayAnalysis({
                content: analysis,
                isReaderMode: true,
                book: ref.book,
                chapter: ref.chapter
            });
            // After content is set, scroll to the target verse if specified
            if (ref.verse) {
                // This is a simple implementation; a more robust one would find [verse]
                DOMElements.resultsMain.scrollTop = 0; // For now, just scroll to top
            }
        } else {
            // This is an infinite scroll request
            const newChunk = createChapterChunk(analysis, ref.book, ref.chapter);
            const scrollContainer = DOMElements.resultsMain;
            const oldScrollHeight = scrollContainer.scrollHeight;
            const oldScrollTop = scrollContainer.scrollTop;

            if (mode === 'prepend') {
                DOMElements.analysisContent.prepend(newChunk);
                // Maintain scroll position
                const newScrollHeight = scrollContainer.scrollHeight;
                scrollContainer.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
            } else {
                DOMElements.analysisContent.append(newChunk);
            }
        }
    } else if (mode === 'replace') {
        // Only set error if the *initial* load failed
        setErrorState(`Failed to load text for ${passage}.`);
    }
    
    AppState.isFetchingChapter = false;
}

/**
 * Gets the next or previous chapter reference.
 * @param {object} currentRef - The current reference {book, chapter}.
 * @param {number} direction - 1 for next, -1 for previous.
 * @returns {object|null} - The new reference or null if at end/start.
 */
function getAdjacentChapter(currentRef, direction) {
    const bookData = AppState.bibleBookMap.get(currentRef.book.toLowerCase());
    if (!bookData) return null;

    let newChapter = currentRef.chapter + direction;

    // Case 1: Moving within the same book
    if (newChapter > 0 && newChapter <= bookData.chapters) {
        return { book: currentRef.book, chapter: newChapter, verse: 1 };
    }

    // Case 2: Moving to an adjacent book
    const newBookIndex = bookData.globalIndex + direction;
    if (newBookIndex >= 0 && newBookIndex < AppState.bibleBookList.length) {
        const newBookName = AppState.bibleBookList[newBookIndex];
        const newBookData = AppState.bibleBookMap.get(newBookName.toLowerCase());
        
        if (direction === 1) { // Moving forward
            return { book: newBookName, chapter: 1, verse: 1 };
        } else { // Moving backward
            return { book: newBookName, chapter: newBookData.chapters, verse: 1 };
        }
    }

    // At the start of Genesis or end of Revelation
    return null;
}

// ===== PARSING & FORMATTING =====

/**
 * Parses a string input to find a valid Bible reference.
 * @param {string} input - The user's input.
 * @returns {object|null} - A reference object or null.
 */
function parsePassageReference(input) {
    // Regex to find book, chapter, and optional verse
    // Supports "John 3:16", "John 3", "1 John 3"
    const regex = /([1-3]?\s?[A-Za-z]+)\.?\s+([0-9]+)(?:[:.]([0-9]+))?/;
    const match = input.trim().match(regex);

    if (!match) return null;

    const bookNameInput = match[1].toLowerCase().replace(/\./g, '');
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : null;

    // Find the canonical book name
    if (AppState.bibleBookMap.has(bookNameInput)) {
        const bookData = AppState.bibleBookMap.get(bookNameInput);
        if (chapter > 0 && chapter <= bookData.chapters) {
            return {
                book: bookData.name, // Return canonical name
                chapter: chapter,
                verse: verse
            };
        }
    }
    return null; // Book not found or chapter out of range
}

/**
 * A more robust markdown-to-HTML converter.
 * Fixes issues with line breaks and paragraphs.
 * @param {string} text - The raw text from the AI.
 * @returns {string} - Formatted HTML.
 */
function simpleMarkdown(text) {
    if (!text) return '';
    // 0. Normalize line endings
    let html = text.replace(/\r\n/g, '\n');

    // 1. Headers
    html = html.replace(/^###\s(.*)/gm, '<h3>$1</h3>')
               .replace(/^##\s(.*)/gm, '<h2>$1</h2>')
               .replace(/^#\s(.*)/gm, '<h1>$1</h1>');
    
    // 2. Bold/Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 3. Blockquotes
    html = html.replace(/^\>\s(.*)/gm, '<blockquote>$1</blockquote>')
               .replace(/<\/blockquote>\n<blockquote>/g, '\n'); // Merge adjacent

    // 4. Lists
    // Handle bullet lists
    html = html.replace(/^\s*[\-\*]\s(.*)/gm, '<li>$1</li>')
               .replace(/(\n?<li>.*<\/li>\n?)/gs, '<ul>$1</ul>')
               .replace(/<\/ul>\n?<ul>/g, ''); // Merge adjacent
    
    // Handle numbered lists
    html = html.replace(/^\s*[0-9]+\.\s(.*)/gm, '<li>$1</li>')
               .replace(/(\n?<li>.*<\/li>\n?)/gs, (match, p1) => {
                   // Only wrap if it's not already in a <ul>
                   if (match.includes('<ul>')) return match;
                   return `<ol>${p1}</ol>`;
               })
               .replace(/<\/ol>\n?<ul>/g, '') // Fix for mixed lists
               .replace(/<\/ul>\n?<ol>/g, '')
               .replace(/<\/ol>\n?<ol>/g, '');

    // 5. Paragraphs and Line Breaks
    html = html.split('\n\n')
        .map(paragraph => {
            // If the paragraph is a list, header, or blockquote, leave it alone
            if (paragraph.trim().startsWith('<') || paragraph.trim() === '') {
                return paragraph;
            }
            // Otherwise, wrap in <p> and replace single newlines with <br>
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
        
    // 6. Clean up artifacts
    html = html.replace(/<p>\s*<(ul|ol|h[1-3]|blockquote)/g, '<$1') // Remove <p> before block elements
               .replace(/<\/(ul|ol|h[1-3]|blockquote)>\s*<\/p>/g, '</$1>') // Remove </p> after block elements
               .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
               .replace(/<p><br><\/p>/g, '');

    return html;
}


// ===== UI DISPLAY & NAVIGATION =====

/**
 * Central display function for all content.
 * @param {object} options - Configuration for what to display.
 */
function displayAnalysis({
    content,
    isReaderMode = false,
    book = '',
    chapter = null,
    icon = '',
    passage = '',
    moduleName = ''
}) {
    // 1. Disconnect any old observers
    disconnectObservers();

    // 2. Set the content
    if (isReaderMode) {
        // BIBLE READER MODE
        AppState.currentReaderMode = true;
        const chunk = createChapterChunk(content, book, chapter);
        DOMElements.analysisContent.innerHTML = ''; // Clear content
        DOMElements.analysisContent.appendChild(chunk);
        
        // Update UI
        DOMElements.analysisTitleDisplay.style.display = 'none';
        DOMElements.readerControlsDisplay.style.display = 'flex';
        DOMElements.readerTitleDisplay.textContent = `${book} ${chapter}`;
        DOMElements.analysisFooter.style.display = 'none';
        DOMElements.analysisDisplay.classList.add('reader-mode');

        // 3. Set up new observers for this mode
        // CRITICAL FIX: Add a "grace period" before attaching listeners.
        setTimeout(() => {
            if (AppState.currentReaderMode) { // Only attach if still in reader mode
                setupScrollObserver();
                setupHeaderObserver();
            }
        }, 500); // 500ms grace period
        
    } else {
        // MODULE ANALYSIS MODE
        AppState.currentReaderMode = false;
        DOMElements.analysisContent.innerHTML = simpleMarkdown(content);
        
        // Update UI
        DOMElements.analysisTitleDisplay.style.display = 'flex';
        DOMElements.readerControlsDisplay.style.display = 'none';
        DOMElements.analysisIconDisplay.textContent = icon;
        DOMElements.analysisPassageDisplay.textContent = passage;
        DOMElements.analysisModuleDisplay.textContent = moduleName;
        DOMElements.analysisFooter.style.display = 'block';
        DOMElements.analysisDisplay.classList.remove('reader-mode');
    }
    
    // 4. Set font size and scroll to top
    applyFontSize();
    DOMElements.resultsMain.scrollTop = 0;
}

/**
 * Creates a DOM element for a chapter.
 * @param {string} content - The raw HTML/text for the chapter.
 * @param {string} book - The book name.
 * @param {number} chapter - The chapter number.
 * @returns {HTMLElement} - The new div.chapter-chunk element.
 */
function createChapterChunk(content, book, chapter) {
    const chunk = document.createElement('div');
    chunk.className = 'chapter-chunk';
    chunk.dataset.book = book;
    chunk.dataset.chapter = chapter;
    // Use simpleMarkdown to format the text
    chunk.innerHTML = simpleMarkdown(content);
    return chunk;
}

/**
 * Disconnects and clears all active IntersectionObservers.
 * CRITICAL to prevent "ghost listener" bugs.
 */
function disconnectObservers() {
    if (AppState.scrollObserver) {
        AppState.scrollObserver.disconnect();
        AppState.scrollObserver = null;
    }
    if (AppState.headerObserver) {
        AppState.headerObserver.disconnect();
        AppState.headerObserver = null;
    }
}

/**
 * Sets up the IntersectionObserver for the "smart header".
 * Updates the sticky header text when a new chapter hits the top.
 */
function setupHeaderObserver() {
    // Safety check: ensure we are in reader mode and not already observing
    if (!AppState.currentReaderMode || AppState.headerObserver) return;
    
    try {
        const options = {
            root: DOMElements.resultsMain,
            threshold: 0.1, // Trigger when 10% is visible
            rootMargin: "0px 0px -80% 0px" // Watch a "scan line" near the top
        };

        AppState.headerObserver = new IntersectionObserver((entries) => {
            if (!AppState.currentReaderMode) return; // Don't act if not in reader mode

            // Find the "topmost" visible entry
            const topmostVisibleEntry = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top)[0];
            
            if (topmostVisibleEntry) {
                const book = topmostVisibleEntry.target.dataset.book;
                const chapter = topmostVisibleEntry.target.dataset.chapter;
                DOMElements.readerTitleDisplay.textContent = `${book} ${chapter}`;
                // Update global state
                AppState.currentBibleReference.book = book;
                AppState.currentBibleReference.chapter = parseInt(chapter, 10);
            }
        }, options);

        DOMElements.analysisContent.querySelectorAll('.chapter-chunk').forEach(chunk => {
            AppState.headerObserver.observe(chunk);
        });
    } catch (e) {
        console.error("Failed to setup Header Observer:", e);
    }
}

/**
 * Sets up the IntersectionObserver for "infinite scrolling".
 * Fetches new chapters when user scrolls near the top or bottom.
 */
function setupScrollObserver() {
    // Safety check: ensure we are in reader mode and not already observing
    if (!AppState.currentReaderMode || AppState.scrollObserver) return;
    
    try {
        const options = {
            root: DOMElements.resultsMain,
            threshold: 0,
            rootMargin: "300px 0px 300px 0px" // Load when 300px away
        };

        AppState.scrollObserver = new IntersectionObserver((entries) => {
            if (AppState.isFetchingChapter || !AppState.currentReaderMode) return; // Don't fetch if already fetching or not in mode
            
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                const chunk = entry.target;
                const currentRef = { 
                    book: chunk.dataset.book, 
                    chapter: parseInt(chunk.dataset.chapter, 10) 
                };
                
                // Is this the first chunk? Check for "scroll up"
                if (chunk === DOMElements.analysisContent.firstChild) {
                    const prevRef = getAdjacentChapter(currentRef, -1);
                    if (prevRef) {
                        AppState.scrollObserver.unobserve(chunk); // Stop observing this
                        fetchAndDisplayChapter(prevRef, 'prepend').then(() => {
                            // Re-observe new first chunk
                            if(DOMElements.analysisContent.firstChild) {
                                AppState.scrollObserver.observe(DOMElements.analysisContent.firstChild);
                            }
                        });
                    }
                }
                
                // Is this the last chunk? Check for "scroll down"
                if (chunk === DOMElements.analysisContent.lastChild) {
                    const nextRef = getAdjacentChapter(currentRef, 1);
                    if (nextRef) {
                        AppState.scrollObserver.unobserve(chunk); // Stop observing this
                        fetchAndDisplayChapter(nextRef, 'append').then(() => {
                            // Re-observe new last chunk
                            if (DOMElements.analysisContent.lastChild) {
                                AppState.scrollObserver.observe(DOMElements.analysisContent.lastChild);
                            }
                        });
                    }
                }
            });
        }, options);
        
        // Observe the first and last chunks
        if (DOMElements.analysisContent.firstChild) {
            AppState.scrollObserver.observe(DOMElements.analysisContent.firstChild);
        }
        if (DOMElements.analysisContent.lastChild && DOMElements.analysisContent.firstChild !== DOMElements.analysisContent.lastChild) {
            AppState.scrollObserver.observe(DOMElements.analysisContent.lastChild);
        }
    } catch (e) {
        console.error("Failed to setup Scroll Observer:", e);
    }
}

/**
 * Handles font size changes.
 * @param {number} direction - 1 for larger, -1 for smaller.
 */
function handleFontSizeChange(direction) {
    const sizes = ['font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge'];
    let currentIndex = sizes.indexOf(AppState.currentFontSize);
    
    currentIndex += direction;
    
    // Clamp the index
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= sizes.length) currentIndex = sizes.length - 1;
    
    AppState.currentFontSize = sizes[currentIndex];
    applyFontSize();
}

/**
 * Applies the current font size class to the content area.
 */
function applyFontSize() {
    const sizes = ['font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge'];
    // Apply to both content and notes editor
    DOMElements.analysisContent.classList.remove(...sizes);
    DOMElements.analysisContent.classList.add(AppState.currentFontSize);
    
    // Also apply to notes editor
    if (DOMElements.noteEditor) {
        DOMElements.noteEditor.classList.remove(...sizes);
        DOMElements.noteEditor.classList.add(AppState.currentFontSize);
    }

    // Disable buttons at min/max
    DOMElements.fontDecreaseBtn.disabled = (AppState.currentFontSize === sizes[0]);
    DOMElements.fontIncreaseBtn.disabled = (AppState.currentFontSize === sizes[sizes.length - 1]);
}

/**
 * Toggles the main sidebar.
 */
function toggleSidebar(isDesktopClick) {
    const isCollapsed = DOMElements.sidebar.classList.toggle('collapsed');
    
    // On mobile, also close the notes panel if it's open
    if (window.innerWidth <= 1024 && !isCollapsed) {
        DOMElements.notesPanel.classList.add('collapsed');
    }
}

/**
 * Toggles the notes panel.
 */
function toggleNotes(isDesktopClick) {
    const isCollapsed = DOMElements.notesPanel.classList.toggle('collapsed');

    // On mobile, also close the sidebar if it's open
    if (window.innerWidth <= 1024 && !isCollapsed) {
        DOMElements.sidebar.classList.add('collapsed');
    }
}

/**
 * Resizes the notes panel.
 */
function resizeNotes(size) {
    const panel = DOMElements.notesPanel;
    panel.classList.remove('collapsed', 'normal', 'medium', 'wide');
    
    document.getElementById('collapseBtn')?.classList.remove('active');
    document.getElementById('normalBtn')?.classList.remove('active');
    document.getElementById('mediumBtn')?.classList.remove('active');
    document.getElementById('wideBtn')?.classList.remove('active');

    if (size === 'collapsed') {
        panel.classList.add('collapsed');
        document.getElementById('collapseBtn')?.classList.add('active');
    } else if (size === 'medium') {
        panel.classList.add('medium');
        document.getElementById('mediumBtn')?.classList.add('active');
    } else if (size === 'wide') {
        panel.classList.add('wide');
        document.getElementById('wideBtn')?.classList.add('active');
    } else {
        // default to normal
        panel.classList.add('normal');
        document.getElementById('normalBtn')?.classList.add('active');
    }
}

/**
 * Switches the main module category.
 */
function switchCategory(category) {
    AppState.currentCategory = category;
    
    document.querySelectorAll('.primary-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    document.querySelectorAll('.module-group').forEach(group => {
        group.classList.toggle('active', group.dataset.category === category);
    });

    DOMElements.sidebarHeader.textContent = ModuleDefinitions[category].name;

    // Auto-select first module in new category
    const firstModuleKey = Object.keys(ModuleDefinitions[category].modules)[0];
    switchModule(firstModuleKey, true); // Force auto-run
}

/**
 * Switches the active module.
 * @param {string} module - The module key.
 * @param {boolean} [forceAutoRun=false] - Whether to force auto-run.
 */
function switchModule(module, forceAutoRun = false) {
    // Only switch if the module is different
    if (AppState.currentModule === module && !forceAutoRun) {
        return;
    }

    AppState.currentModule = module;
    
    document.querySelectorAll('.secondary-tab').forEach(tab => {
        const isThisTab = tab.dataset.module === module;
        tab.classList.toggle('active', isThisTab);
    });

    // Auto-run analysis if passage exists
    const passage = DOMElements.passageInput.value.trim();
    if (passage) {
        runModuleAnalysis();
    }
}


function updateModuleDisplay() {
    // This function seems to be deprecated by the new UI, but we leave it
}

function getModuleInfo(category, module) {
    if (ModuleDefinitions[category] && ModuleDefinitions[category].modules[module]) {
        return ModuleDefinitions[category].modules[module];
    }
    // Fallback if module/category is missing
    console.warn(`Could not find module info for ${category}:${module}`);
    // Find the *first* module in the category as a fallback
    if (ModuleDefinitions[category]) {
        const firstModuleKey = Object.keys(ModuleDefinitions[category].modules)[0];
        return ModuleDefinitions[category].modules[firstModuleKey];
    }
    // Total fallback
    return { name: 'Error', prompt: 'Error: Module not found.', icon: '⚠️' };
}

// ===== NOTES (FIRESTORE) =====

/**
 * Attaches a real-time listener to load and update notes from Firestore.
 */
function loadNotesFromFirestore() {
    if (!AppState.notesCollectionRef) {
        console.error("Notes collection reference is not set. Cannot load notes.");
        return;
    }

    console.log("Setting up Firestore snapshot listener for notes...");
    
    // *** THIS IS THE "Notes List" HANG FIX ***
    // We remove `orderBy("updatedAt", "desc")` because it requires a Firestore index.
    // The `renderNotesList` function already sorts the notes on the client-side.
    const q = query(AppState.notesCollectionRef);

    // Stop any previous listener
    if (AppState.notesUnsubscribe) {
        AppState.notesUnsubscribe();
    }

    AppState.notesUnsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`Received ${snapshot.docs.length} notes from Firestore.`);
        AppState.notes = {}; // Clear the in-memory store
        snapshot.docs.forEach((doc) => {
            AppState.notes[doc.id] = doc.data();
        });
        
        renderNotesList(); // Update the UI
        updateNoteCount();
    }, (error) => {
        console.error("Error listening to notes collection:", error);
        DOMElements.notesList.innerHTML = `<li class="p-2 text-red-400 italic text-center">Error loading notes.</li>`;
    });
}

/**
 * Re-renders the list of notes in the notes panel.
 */
function renderNotesList() {
    if (!DOMElements.notesList) return;
    DOMElements.notesList.innerHTML = ''; // Clear the list

    // Sort the notes from the in-memory store by `updatedAt`
    const sortedNotes = Object.entries(AppState.notes)
        .sort(([, noteA], [, noteB]) => {
            const timeA = noteA.updatedAt?.toMillis() || 0;
            const timeB = noteB.updatedAt?.toMillis() || 0;
            return timeB - timeA; // Descending
        });

    if (sortedNotes.length === 0) {
        DOMElements.notesList.innerHTML = `<li class="p-4 text-gray-400 italic text-center">No notes yet.</li>`;
        return;
    }

    sortedNotes.forEach(([id, note]) => {
        const li = document.createElement('li');
        const isActive = (id === AppState.currentNoteId);
        li.className = `p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${isActive ? 'bg-blue-800' : ''}`;
        li.dataset.id = id;

        const title = note.passage || "Untitled Note";
        const contentSnippet = note.content ? note.content.substring(0, 70) + '...' : 'No content';
        const date = note.updatedAt ? new Date(note.updatedAt.toMillis()).toLocaleString() : 'Just now';
        
        li.innerHTML = `
            <div class="font-bold text-white truncate">${title}</div>
            <div class="text-sm text-gray-300 truncate mt-1">${contentSnippet}</div>
            <div class="text-xs text-gray-400 mt-2">${date}</div>
        `;
        DOMElements.notesList.appendChild(li);
    });
}

/**
 * Handles clicks within the notes list to load a note.
 */
function handleNoteListClick(e) {
    const li = e.target.closest('li[data-id]');
    if (li) {
        const noteId = li.dataset.id;
        loadNoteIntoEditor(noteId);
    }
}

/**
 * Loads the content of a specific note into the editor.
 * @param {string} noteId - The Firestore document ID of the note.
 */
function loadNoteIntoEditor(noteId) {
    if (!AppState.notes[noteId]) {
        console.error(`Note with ID ${noteId} not found in local state.`);
        return;
    }
    
    const note = AppState.notes[noteId];
    AppState.currentNoteId = noteId;
    DOMElements.noteEditor.value = note.content || '';
    
    // Highlight the selected note in the list
    renderNotesList(); 
    
    // Update UI
    updateNoteEditorUI();
}

/**
 * Clears the note editor to create a new note.
 */
function createNewNote() {
    AppState.currentNoteId = null;
    DOMElements.noteEditor.value = '';
    renderNotesList(); // To remove highlight
    updateNoteEditorUI();
    DOMElements.noteEditor.focus();
}

/**
 * Debouncer for auto-saving notes.
 */
function triggerAutoSave() {
    // Clear the existing timer
    if (AppState.autoSaveTimer) {
        clearTimeout(AppState.autoSaveTimer);
    }
    
    // Set a new timer
    AppState.autoSaveTimer = setTimeout(() => {
        saveCurrentNote();
    }, 1500); // Wait 1.5 seconds after typing stops
}

/**
 * Saves the current note (either new or existing) to Firestore.
 */
async function saveCurrentNote() {
    if (!AppState.notesCollectionRef) {
        console.error("Cannot save note: Firestore is not ready.");
        return;
    }

    DOMElements.saveNoteBtn.disabled = true;
    DOMElements.saveNoteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Saving...';

    const content = DOMElements.noteEditor.value;
    
    // Try to get passage from analysis...
    let passage = AppState.currentPassage || "Untitled Note";
    // ...but if a note is loaded, use its existing passage
    if (AppState.currentNoteId && AppState.notes[AppState.currentNoteId]) {
        passage = AppState.notes[AppState.currentNoteId].passage || passage;
    }
    
    const module = AppState.currentModule || "General";

    const noteData = {
        content: content,
        passage: passage,
        module: module,
        updatedAt: serverTimestamp() // Use server-side timestamp
    };

    try {
        if (AppState.currentNoteId) {
            // Update existing note
            console.log(`Updating note: ${AppState.currentNoteId}`);
            const docRef = doc(AppState.notesCollectionRef, AppState.currentNoteId);
            await setDoc(docRef, noteData, { merge: true }); // merge: true is safer
        } else {
            // Create new note
            console.log("Adding new note...");
            const docRef = await addDoc(AppState.notesCollectionRef, noteData);
            AppState.currentNoteId = docRef.id; // Set new ID so next save is an update
            console.log(`New note added with ID: ${docRef.id}`);
        }
        // The onSnapshot listener will handle the UI update
        // We just need to re-highlight the note
        renderNotesList();
    } catch (error) {
        console.error("Error saving note:", error);
    } finally {
        DOMElements.saveNoteBtn.disabled = false;
        DOMElements.saveNoteBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Save Note';
        updateNoteEditorUI();
    }
}

/**
 * Deletes the currently loaded note from Firestore.
 */
async function deleteCurrentNote() {
    if (!AppState.currentNoteId || !AppState.notesCollectionRef) {
        console.warn("No note selected to delete.");
        return;
    }

    // No custom confirm, just delete
    console.log(`Deleting note: ${AppState.currentNoteId}`);
    try {
        DOMElements.deleteNoteBtn.disabled = true;
        await deleteDoc(doc(AppState.notesCollectionRef, AppState.currentNoteId));
        console.log("Note deleted.");
        createNewNote(); // Clear the editor
        // onSnapshot will update the list
    } catch (error) {
        console.error("Error deleting note:", error);
        updateNoteEditorUI(); // Re-enable delete button if delete failed
    }
}

/**
 * Updates the note count badge.
 */
function updateNoteCount() {
    const count = Object.keys(AppState.notes).length;
    DOMElements.noteCount.textContent = count;
}

/**
 * Updates the enabled/disabled state of the note editor buttons.
 */
function updateNoteEditorUI() {
    // Delete button is enabled only if a note is loaded
    DOMElements.deleteNoteBtn.disabled = !AppState.currentNoteId;
}
