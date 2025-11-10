// ===== SCRIBE STUDY FRONTEND =====
// Calls backend API - users don't need API keys!

// ===== CONFIGURATION =====
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'  // Local development
    : '/api';  // Production (same domain)

// ===== EMBEDDED BIBLE DATA =====
// This data is now built-in, removing the need to fetch 'bible-structure.json'
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

// ===== APPLICATION STATE =====
const AppState = {
    currentCategory: 'devotional',
    currentModule: 'spiritual-analysis',
    currentPassage: '',
    currentNoteId: null,
    notes: {},
    analysisVersions: {},
    currentVersionIndex: {},
    
    // --- Bible Reader & Structure State ---
    bibleStructure: null, // Will hold all books, chapters, etc.
    bookAliases: {}, // For quick lookup (e.g., "Gen" -> "Genesis")
    currentBibleReference: { book: '', chapter: null, verse: null },
    isFetchingChapter: false,
    currentReaderMode: false, // Is the Bible reader active?
    currentObserver: null, // Holds the IntersectionObserver
    
    // --- NEW: Font Size State ---
    fontSizes: ['font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge'],
    currentFontSizeIndex: 1 // Default is 'font-size-normal'
};

// ===== MODULE DEFINITIONS =====
const ModuleDefinitions = {
    'languages': { 
        name: 'Original Languages',
        modules: {
            'greek-hebrew': {
                name: 'Greek/Hebrew Lexicon',
                prompt: `Provide a detailed lexical analysis for key terms in {passage}. 
For each significant word, provide:
1.  **Original Language:** The Hebrew/Greek word (with transliteration).
2.  **Root Meaning:** The etymology and basic semantic range.
3.  **Usage Patterns:** How this word is used elsewhere in Scripture, citing key passages.
4.  **Theological Significance:** What this word contributes to biblical theology.
5.  **Contextual Meaning:** How the meaning functions specifically in this passage.
Focus on words that carry theological weight or cultural significance.`,
                icon: '📚'
            },
            'morphology': {
                name: 'Morphology',
                prompt: `Provide a detailed morphological analysis of {passage}:
**For each significant word:**
* Parse (part of speech, person, number, gender, tense, voice, mood, case).
* Root/lexical form.
* Semantic range.
* Usage in this context.
**Analysis should include:**
* A word-by-word breakdown of key terms.
* How morphological patterns (e.g., verb stems, noun cases) affect meaning.
* Theological implications of specific grammatical forms.`,
                icon: '📝'
            },
            'grammar-essentials': {
                name: 'Grammar Essentials',
                prompt: `Analyze the grammar of {passage} to help anyone understand how sentence structure reveals theological truth. Be accessible yet thorough.

LANGUAGE AUTO-DETECTION:
**If passage is Old Testament (Hebrew):**
* Display the Hebrew text with transliteration.
* Analyze key Hebrew grammatical features.
* Explain Hebrew word order, construct chains, and verb stems (e.g., Qal, Piel).
* Note definiteness, pronominal suffixes, and key particles.
* Reference Hebrew syntax and style.

**If passage is New Testament (Greek):**
* Display the Greek text with transliteration.
* Analyze key Greek grammatical features.
* Explain Greek cases, verb aspects (Aorist, Perfect, etc.), and participles.
* Note article usage, prepositions, and conjunctions.
* Reference Greek syntax and style.

Focus on making complex grammar accessible while maintaining scholarly accuracy.`,
                icon: '📖'
            },
            'advanced-grammar': {
                name: 'Advanced Grammar',
                prompt: `Perform a comprehensive syntactic and grammatical analysis of {passage}, combining scholarly precision with theological depth.

LANGUAGE AUTO-DETECTION & SCHOLARLY TREATMENT:
**If Old Testament (Hebrew):**
* Display the Hebrew text (pointed Masoretic) with transliteration.
* Analyze ALL significant Hebrew grammatical features:
    * **Verbs:** Stems (Qal, Niphal, Piel, Pual, Hithpael, Hophal, Hiphil), conjugations (Perfect, Imperfect, Imperative, Infinitive, Participle), and volitives.
    * **Nouns:** Patterns, construct chains, pronominal suffixes, and definiteness.
    * **Particles:** Detailed analysis of prepositions, conjunctions (e.g., *waw*).
    * **Syntax:** Word order and emphasis, clause relationships.
    * **Poetic Structures:** If applicable (parallelism, chiasm).

**If New Testament (Greek):**
* Display the Greek text (e.g., SBLGNT) with transliteration.
* Analyze ALL significant Greek grammatical features:
    * **Verbs:** Tense/Aspect (Aorist, Present, Perfect, etc.), Voice (Active, Middle, Passive), Mood (Indicative, Subjunctive, Optative, Imperative, Infinitive, Participle).
    * **Nouns/Cases:** The function of the case system (Nominative, Genitive, Dative, Accusative, Vocative).
    * **Articles:** The semantic significance of article usage (or non-usage).
    * **Participles:** Their function (adverbial, adjectival) and relationship to the main verb.
    * **Syntax:** Clause structures, prepositions, and compound verbs.

Include detailed morphological parsing for key terms and explain how these grammatical details reveal theological meaning.`,
                icon: '🔬'
            },
            'verse-by-verse': { 
                name: 'Verse-by-Verse Grammar',
                prompt: `Provide a verse-by-verse grammatical analysis of {passage}:
**For each verse:**
1.  **Text:** Display the original language (Hebrew or Greek) with transliteration.
2.  **Clause Structure:** Identify the main and subordinate clauses.
3.  **Grammatical Features:** Point out the key morphological and syntactic elements.
4.  **Structural Relationships:** Explain how the clauses connect and flow.
5.  **Meaning & Impact:** Show how the grammar affects the interpretation of the verse.
Make the technical analysis accessible while maintaining precision.`,
                icon: '📋'
            },
            'semantic-range': {
                name: 'Semantic Range',
                prompt: `Analyze the semantic range and contextual meaning of key terms in {passage}:
**For each major term:**
1.  **Full Semantic Range:** The complete spectrum of possible meanings for this word.
2.  **Usage Categories:** How the term functions in different contexts (e.g., "love" as romantic, familial, or divine).
3.  **Scripture Survey:** Key passages that demonstrate this word's range.
4.  **Contextual Determination:** A clear argument for why this specific meaning applies here.
5.  **Theological Trajectories:** How the meaning of this word develops across the biblical corpus.
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
                prompt: `Provide a deep spiritual analysis of {passage} with a focus on:
* Core theological truths revealed (about God, humanity, sin, redemption).
* Personal heart impact and conviction (areas of repentance, encouragement, or faith).
* Christ-centered interpretation (how does this passage point to Jesus or His work?).
* Redemptive-historical context (how does this fit into the big story of the Bible?).

Include:
* Key spiritual insights that lead to worship.
* Specific, personal application points.
* How this passage transforms a believer's mind and heart.
* Connections to themes of divine sovereignty, faith, perseverance, and covenant faithfulness.

Avoid generic observations—focus on transformative truth that leads to worship and obedience.`,
                icon: '📖'
            },
            'devotional-reflection': {
                name: 'Devotional Reflection',
                prompt: `Create a warm, pastoral devotional reflection on {passage} suitable for personal meditation. 
The reflection should include:
1.  **Opening Hook:** A relatable story or question.
2.  **Key Truth:** The central message of the passage, explained simply.
3.  **Application:** How this truth applies to daily life, struggles, or faith.
4.  **Prayer:** A short, concluding prayer based on the passage.`,
                icon: '🙏'
            },
            'discipleship': {
                name: 'Discipleship Application',
                prompt: `Analyze {passage} for its practical discipleship and spiritual growth applications.
Focus on:
* **Commands to Obey:** What does this passage call us to *do*?
* **Promises to Claim:** What assurances does God give us here?
* **Truths to Believe:** How does this passage correct wrong thinking?
* **Sins to Avoid:** What warnings or examples are present?
* **Character to Cultivate:** What attributes (like patience, love, holiness) does it promote?`,
                icon: '🌱'
            },
            'redemptive-focus': {
                name: 'Redemptive Focus',
                prompt: `Analyze {passage} through the lens of redemptive exposition, showing how it points to the person and work of Jesus Christ.
* **If Old Testament:** How does this passage create tension, foreshadow, or type Christ?
* **If New Testament:** How does this passage fulfill, explain, or apply Christ's work?
* **Big Picture:** Connect the passage to the overarching biblical themes of Creation, Fall, Redemption, and New Creation.`,
                icon: '✝️'
            },
            'life-application': {
                name: 'Life Application',
                prompt: `Provide 3-5 clear, practical, and actionable life applications from {passage}.
For each application:
1.  **The Principle:** State the timeless truth from the text.
2.  **The Application:** Give a concrete "what this looks like" example for today (e.g., at work, in family, in personal thoughts).
3.  **A Question:** A reflective question to help internalize the point.`,
                icon: '🎯'
            }
        }
    },
    'text-analysis': {
        name: 'Text Analysis',
        modules: {
            'passage-overview': {
                name: 'Passage Overview',
                prompt: `Provide a comprehensive overview of {passage}. Include:
1.  **Immediate Context:** What happens immediately before and after this passage?
2.  **Main Idea:** A single sentence summarizing the primary theme.
3.  **Key Points:** A bulleted list of the main movements or arguments in the text.
4.  **Key Terms/People/Places:** Identify and briefly explain the most important proper nouns or theological terms.
5.  **Genre:** What kind of literature is this (narrative, poetry, epistle, etc.)?`,
                icon: '📋'
            },
            'structural-analysis': {
                name: 'Structural Analysis',
                prompt: `Analyze the literary structure of {passage}.
* Identify the main sections and subsections.
* Look for structural markers (e.g., repeated phrases, conjunctions, shifts in topic).
* Identify any literary structures like chiasm, inclusio (bookends), or parallelism.
* Explain how this structure helps communicate the author's main point.
Present the structure as a clear outline.`,
                icon: '🏗️'
            },
            'literary-devices': {
                name: 'Literary Devices',
                prompt: `Identify and explain the literary devices used in {passage}.
Look for (but don't limit to):
* Metaphors & Similes
* Hyperbole
* Irony
* Personification
* Rhetorical Questions
* Wordplay
Explain how each device contributes to the passage's meaning and impact.`,
                icon: '✍️'
            },
            'discourse-analysis': {
                name: 'Discourse Analysis',
                prompt: `Analyze the discourse structure and flow of argument in {passage}.
* Trace the author's logical progression of thought.
* Identify the main propositions and the supporting arguments.
* Analyze the use of conjunctions (e.g., "for," "therefore," "but," "so that") to understand logical relationships.
* What is the main point the author is trying to prove or communicate?`,
                icon: '💬'
            },
            'semantic-outline': {
                name: 'Semantic Outline',
                prompt: `Generate a detailed semantic outline (or "arcing") of {passage}.
This outline should break down each clause and show its grammatical and logical relationship to the clauses around it.
* Identify main clauses.
* Indent subordinate clauses.
* Label the function of each subordinate clause (e.g., "purpose," "cause," "result," "concession").
This is a highly technical, verse-by-verse breakdown.`,
                icon: '📊'
            },
            'key-words': {
                name: 'Key Words',
                prompt: `Identify and analyze the 3-5 most important key words in {passage}.
For each word:
1.  **The Word:** The word itself (and its original language equivalent, if possible).
2.  **Why It's Key:** Explain why this word is crucial to the passage's meaning.
3.  **Deeper Meaning:** Briefly explore its definition, semantic range, and theological weight.`,
                icon: '🔑'
            }
        }
    },
    'context': {
        name: 'Context & Background',
        modules: {
            'historical-cultural': {
                name: 'Historical-Cultural',
                prompt: `Provide the historical and cultural background for {passage}.
* **Author/Audience:** Who wrote this, and to whom?
* **Setting:** What was happening politically, socially, and religiously at the time?
* **Customs:** Are there any cultural customs, values, or practices (e.g., honor-shame, patronage, household codes) that are essential to understanding the text?
* **Key Concepts:** Explain any concepts that had a specific cultural meaning (e.g., "temple," "Pharisee," "circumcision").`,
                icon: '🏛️'
            },
            'geographical': {
                name: 'Geographical Context',
                prompt: `Explain the geographical context of {passage}.
* Identify all relevant locations (cities, regions, rivers, mountains).
* Describe their significance (e.g., political capital, trade route, religious center).
* Explain any geographical factors that influence the text (e.g., travel times, climate, "going up" to Jerusalem).`,
                icon: '🗺️'
            },
            'theological-context': {
                name: 'Theological Context',
                prompt: `Analyze the theological context of {passage}.
* **Canonical Context:** How does this passage fit with the rest of the book and the Bible as a whole?
* **Key Doctrines:** What major Christian doctrines does this passage teach, support, or explain (e.g., Trinity, Atonement, Justification, Sanctification, Ecclesiology)?
* **Polemics:** Is this passage arguing *against* any false teachings (e.g., Gnosticism, legalism)?`,
                icon: '⛪'
            },
            'cross-references': {
                name: 'Cross-References',
                prompt: `Identify and explain the 5-7 most significant cross-references for {passage}.
For each reference:
1.  **The Verse:** Cite the cross-referenced passage.
2.  **The Connection:** Explain the link (e.g., direct quote, thematic parallel, fulfillment of prophecy).
3.  **The Insight:** How does this connection illuminate the meaning of {passage}?
Focus on references that provide real theological insight, not just shared words.`,
                icon: '🔗'
            },
            'literary-context': {
                name: 'Literary Context',
                prompt: `Analyze how {passage} fits within the literary context of the book it's in.
* **Role in Book:** What is this passage's function in the book's overall argument or narrative?
* **Before & After:** How does it connect to the *immediate* preceding and succeeding sections?
* **Genre:** How does the passage's genre (e.g., poetry, narrative, law) shape how it should be read?`,
                icon: '📖'
            }
        }
    },
    'jewish': {
        name: 'Jewish Background',
        modules: {
            'second-temple': {
                name: 'Second Temple Period',
                prompt: `Analyze {passage} in light of Second Temple Jewish literature and thought.
* **Connections:** Are there parallels, echoes, or arguments related to ideas found in the Apocrypha or other Second Temple writings?
* **Groups:** How does this passage relate to the beliefs of groups like Pharisees, Sadducees, Essenes, or Zealots?
* **Messianism:** How does it engage with the messianic expectations of the era?`,
                icon: '🕍'
            },
            'rabbinic': {
                name: 'Rabbinic Literature',
                prompt: `Examine {passage} for connections to Rabbinic literature (e.g., Mishnah, Talmud, Targums).
* **Interpretive Methods:** Does this passage use any interpretive methods (e.g., *gezerah shavah*) similar to those used by the Rabbis?
* **Parallels:** Are there any parallel teachings, parables, or legal rulings?
* **Polemics:** Does the passage seem to be in dialogue or debate with early rabbinic thought?
(Note: Use this primarily for NT passages, acknowledging dating of sources).`,
                icon: '📜'
            },
            'dead-sea-scrolls': {
                name: 'Dead Sea Scrolls',
                prompt: `Explore {passage} for connections to the Dead Sea Scrolls (Qumran).
* **Theology:** Are there thematic parallels (e.g., dualism, purity, eschatology)?
* **Exegesis:** Does the passage interpret any OT texts in a way similar to the Qumran commentaries (*pesharim*)?
* **Language:** Are there shared unique terms or phrases?`,
                icon: '📰'
            },
            'pseudepigrapha': {
                name: 'Pseudepigrapha',
                prompt: `Analyze {passage} in light of Pseudepigraphal writings (e.g., 1 Enoch, Jubilees).
* **Shared Ideas:** Does the passage engage with ideas, narratives (e.g., fall of the Watchers), or theological concepts (e.g., angelology, demonology) prominent in these works?
* **Allusions:** Does it seem to allude to or quote from any of these non-canonical books (e.g., Jude)?`,
                icon: '📕'
            }
        }
    },
    'teaching': {
        name: 'Teaching & Preaching',
        modules: {
            'sermon-outline': {
                name: 'Sermon Outline',
                prompt: `Create a 3-point expository sermon outline for {passage}.
The outline should be alliterative or thematic and flow logically from the text.
For each point:
1.  **Main Point:** The clear statement.
2.  **Textual Basis:** The specific verses it comes from.
3.  **Explanation:** A brief paragraph explaining the point.
4.  **Illustration/Application:** A brief idea for an illustration or application.
Also include a "Big Idea" (main takeaway) and a concluding application.`,
                icon: '📋'
            },
            'lesson-plan': {
                name: 'Lesson Plan',
                prompt: `Develop a 45-minute lesson plan for a small group or Sunday school class on {passage}.
The plan should include:
1.  **Opener (10 min):** An icebreaker or introductory question to get people talking.
2.  **Observe (15 min):** Guided questions to help the group discover what the text *says*.
3.  **Interpret (10 min):** Questions to help the group understand what the text *means*.
4.  **Apply (10 min):** Questions to help the group discuss what the text means for *their lives*.
5.  **Prayer:** A concluding prayer prompt.`,
                icon: '📝'
            },
            'discussion-questions': {
                name: 'Discussion Questions',
                prompt: `Generate 10-12 thoughtful discussion questions for {passage}.
The questions should cover:
* **Observation:** What details do you notice? Who? What? Where? When?
* **Interpretation:** What did the author mean? Why is this important?
* **Application:** How does this challenge or encourage you? What will you do differently?
Ensure the questions are open-ended (not "yes/no").`,
                icon: '❓'
            },
            'illustrations': {
                name: 'Illustrations',
                prompt: `Suggest 2-3 compelling illustrations for a sermon or lesson on {passage}.
For each illustration:
1.  **The Point:** The specific truth from the passage it illustrates.
2.  **The Story:** A brief story (e.g., historical, personal, news, or analogy).
3.  **The Connection:** How to clearly link the story back to the biblical text.`,
                icon: '💡'
            },
            'teaching-points': {
                name: 'Teaching Points',
                prompt: `Extract the 3-5 main teaching points from {passage}.
These should be clear, concise, and theologically sound "takeaways" that could form the basis of a lesson.
For each point, provide a 1-2 sentence explanation.`,
                icon: '🎯'
            }
        }
    }
};

// ===== DOM ELEMENTS =====
// Cached DOM elements
const DOMElements = {};

function cacheDOMElements() {
    DOMElements.sidebar = document.getElementById('sidebar');
    DOMElements.sidebarToggle = document.getElementById('sidebarToggle');
    DOMElements.sidebarArrow = document.getElementById('sidebarArrow');
    DOMElements.sidebarHeader = document.getElementById('sidebarHeader');
    
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
    DOMElements.analysisHeader = document.getElementById('analysis-header'); // Note: This ID doesn't exist in HTML, but it's not used.
    DOMElements.analysisTitleDisplay = document.getElementById('analysisTitleDisplay');
    DOMElements.analysisIconDisplay = document.getElementById('analysisIconDisplay');
    DOMElements.analysisPassageDisplay = document.getElementById('analysisPassageDisplay');
    DOMElements.analysisModuleDisplay = document.getElementById('analysisModuleDisplay');
    
    DOMElements.readerControlsDisplay = document.getElementById('readerControlsDisplay');
    DOMElements.readerTitleDisplay = document.getElementById('readerTitleDisplay');
    
    // Font Controls
    DOMElements.fontDecreaseBtn = document.getElementById('fontDecreaseBtn');
    DOMElements.fontIncreaseBtn = document.getElementById('fontIncreaseBtn');
    DOMElements.readerFontDecreaseBtn = document.getElementById('readerFontDecreaseBtn');
    DOMElements.readerFontIncreaseBtn = document.getElementById('readerFontIncreaseBtn');
    
    DOMElements.scrollLoaderTop = document.getElementById('scrollLoaderTop');
    DOMElements.analysisContent = document.getElementById('analysisContent');
    DOMElements.scrollLoaderBottom = document.getElementById('scrollLoaderBottom');
    DOMElements.analysisFooter = document.getElementById('analysisFooter');
    
    DOMElements.notesPanel = document.getElementById('notesPanel');
    DOMElements.notesToggle = document.getElementById('notesToggle');
    DOMElements.notesArrow = document.getElementById('notesArrow');
    // ... cache other elements as needed
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Main initialization function. Runs once after the DOM is loaded.
 */
function initializeApp() {
    cacheDOMElements();
    processBibleData(); // This is now instant
    registerEventListeners();
    setUIReady(); // Unlock the UI
    checkAPIHealth();
    loadNotes(); // TODO: Refactor to Firestore
}

/**
 * Processes the embedded BIBLE_DATA to populate AppState.
 * This replaces the async fetch() and is now synchronous.
 */
function processBibleData() {
    try {
        AppState.bibleStructure = BIBLE_DATA; // Use embedded data
        
        // Create lookup aliases (e.g., "Gen" -> "Genesis")
        const allBooks = [
            ...BIBLE_DATA.testament.old.books, 
            ...BIBLE_DATA.testament.new.books
        ];
        
        allBooks.forEach((book, index) => {
            const bookKey = book.name.toLowerCase();
            AppState.bookAliases[bookKey] = { ...book, bookIndex: index, testament: 'old' }; // Default to 'old'
            AppState.bookAliases[book.abbr.toLowerCase()] = { ...book, bookIndex: index, testament: 'old' };
        });
        
        // Correct testament for NT books
        BIBLE_DATA.testament.new.books.forEach((book, index) => {
            const bookKey = book.name.toLowerCase();
            const ntIndex = BIBLE_DATA.testament.old.books.length + index;
            AppState.bookAliases[bookKey] = { ...book, bookIndex: ntIndex, testament: 'new' };
            AppState.bookAliases[book.abbr.toLowerCase()] = { ...book, bookIndex: ntIndex, testament: 'new' };
        });
        
        console.log("Bible structure processed instantly.");
    } catch (error) {
        console.error("Critical Error: Could not process embedded BIBLE_DATA.", error);
        showFatalError("Could not load Bible data. The app cannot function.");
    }
}

/**
 * Sets the UI to its "ready" state, hiding the loader and enabling inputs.
 */
function setUIReady() {
    DOMElements.statusMessage.style.display = 'block'; // Ensure it's visible first
    DOMElements.statusIcon.textContent = '✨';
    DOMElements.statusTitle.textContent = "Ready to Study God's Word";
    DOMElements.statusText.textContent = "Enter a passage, then select a module or display the text.";
    
    // Hide the loading dots that were part of the status message
    const loadingDots = DOMElements.statusMessage.querySelector('.loading-dots');
    if (loadingDots) {
        loadingDots.style.display = 'none';
    }

    // Enable all controls
    DOMElements.passageInput.disabled = false;
    DOMElements.runModuleBtn.disabled = false;
    DOMElements.displayScriptureBtn.disabled = false;
    DOMElements.versionSelect.disabled = false;
}

/**
 * Shows a fatal error if the Bible data can't be loaded.
 */
function showFatalError(message) {
    DOMElements.statusMessage.style.display = 'block';
    DOMElements.analysisDisplay.style.display = 'none';
    DOMElements.statusIcon.textContent = '⚠️';
    DOMElements.statusTitle.textContent = 'Application Error';
    DOMElements.statusText.textContent = message;
    
    // Hide loading dots if they exist
    const loadingDots = DOMElements.statusMessage.querySelector('.loading-dots');
    if (loadingDots) {
        loadingDots.style.display = 'none';
    }

    // Keep all controls disabled
    DOMElements.passageInput.disabled = true;
    DOMElements.runModuleBtn.disabled = true;
    DOMElements.displayScriptureBtn.disabled = true;
    DOMElements.versionSelect.disabled = true;
}

/**
 * Registers all event listeners for the application.
 */
function registerEventListeners() {
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

    // Sidebar toggle
    DOMElements.sidebarToggle.addEventListener('click', toggleSidebar);

    // Notes Panel toggle
    DOMElements.notesToggle.addEventListener('click', toggleNotesPanel);
    
    // Notes Panel resize controls
    document.getElementById('collapseBtn').addEventListener('click', () => setNotesPanelSize('collapsed'));
    document.getElementById('normalBtn').addEventListener('click', () => setNotesPanelSize('normal'));
    document.getElementById('mediumBtn').addEventListener('click', () => setNotesPanelSize('medium'));
    document.getElementById('wideBtn').addEventListener('click', () => setNotesPanelSize('wide'));

    // --- Main Action Listeners ---
    DOMElements.runModuleBtn.addEventListener('click', runModuleAnalysis);
    DOMElements.displayScriptureBtn.addEventListener('click', displayScripture);
    
    // Enter key for passage input
    DOMElements.passageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Default action: Run module analysis
            runModuleAnalysis();
        }
    });
    
    // --- Scroll Listener for Bible Reader ---
    DOMElements.resultsMain.addEventListener('scroll', scrollHandler);
    
    // --- NEW: Font Size Listeners ---
    DOMElements.fontDecreaseBtn.addEventListener('click', () => changeFontSize(-1));
    DOMElements.fontIncreaseBtn.addEventListener('click', () => changeFontSize(1));
    DOMElements.readerFontDecreaseBtn.addEventListener('click', () => changeFontSize(-1));
    DOMElements.readerFontIncreaseBtn.addEventListener('click', () => changeFontSize(1));
}

// ===== API HEALTH CHECK =====
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (!data.hasApiKey) {
            console.warn('⚠️ Backend API key not configured');
        } else {
            console.log("Backend API is healthy and configured.");
        }
    } catch (error) {
        console.error('Cannot connect to backend:', error);
        // Don't show a fatal error, just log it.
        // We can show a more specific error if an API call fails.
    }
}

// ===== CORE ANALYSIS & DISPLAY LOGIC =====

/**
 * Main entry point for running any analysis or fetching text.
 * This is the "controller" that handles all user actions.
 */
async function runAnalysis(prompt, passage, analysisType, options = {}) {
    // This is a safety check. If we are already fetching a chapter, don't do anything else.
    if (AppState.isFetchingChapter && (analysisType === 'module' || analysisType === 'reader')) {
        console.warn("Blocking new analysis: Chapter fetch in progress.");
        return;
    }
    
    setLoadingState(true, analysisType);
    AppState.currentPassage = passage;
    
    let analysis = '';
    let error = null;

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                passage: passage,
                moduleName: options.moduleName || analysisType
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        analysis = data.analysis;

    } catch (err) {
        console.error('Analysis Error:', err);
        error = err.message;
    }

    // This is the *only* place displayAnalysis should be called from
    displayAnalysis(analysis, error, analysisType, options);
}

/**
 * Prepares and runs a "Module Analysis"
 */
function runModuleAnalysis() {
    const passage = DOMElements.passageInput.value.trim();
    if (!passage) {
        showError("Please enter a scripture passage or question.");
        return;
    }

    // Get module info
    const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
    
    // Build prompt
    const prompt = moduleInfo.prompt.replace('{passage}', passage);

    runAnalysis(prompt, passage, 'module', {
        moduleName: moduleInfo.name,
        icon: moduleInfo.icon
    });
}

/**
 * Prepares and runs a "Display Scripture" request
 */
function displayScripture() {
    const passage = DOMElements.passageInput.value.trim();
    if (!passage) {
        showError("Please enter a scripture passage to display.");
        return;
    }

    const ref = parsePassageReference(passage);
    if (!ref) {
        showError(`Could not understand the passage reference: "${passage}"`);
        return;
    }

    AppState.currentBibleReference = ref; // Store for scrolling
    AppState.currentReaderMode = true; // Set reader mode

    const version = DOMElements.versionSelect.value;
    const prompt = getScripturePrompt(ref, version);

    runAnalysis(prompt, passage, 'reader', {
        book: ref.book,
        chapter: ref.chapter
    });
}

/**
 * Fetches the next or previous chapter for infinite scroll
 */
function fetchAndDisplayChapter(direction) {
    if (AppState.isFetchingChapter) return; // Prevent simultaneous fetches

    const { book, chapter } = AppState.currentBibleReference;
    const nextRef = getAdjacentChapter(book, chapter, direction);
    
    if (!nextRef) {
        console.log("End of the line, no more chapters.");
        return; // No more chapters
    }

    AppState.isFetchingChapter = true;
    const loader = (direction === 1) ? DOMElements.scrollLoaderBottom : DOMElements.scrollLoaderTop;
    loader.style.display = 'block';
    
    // Detach observer to prevent loops
    if (AppState.currentObserver) {
        AppState.currentObserver.disconnect();
    }

    const version = DOMElements.versionSelect.value;
    const prompt = getScripturePrompt(nextRef, version);

    // Use runAnalysis to fetch the new chapter
    runAnalysis(prompt, `${nextRef.book} ${nextRef.chapter}`, 'readerAppend', {
        book: nextRef.book,
        chapter: nextRef.chapter,
        direction: direction
    });
}

// ===== DISPLAY & UI STATE =====

/**
 * Sets the UI to a loading or ready state.
 * @param {boolean} isLoading - True to set loading, false to set ready.
 * @param {string} analysisType - 'module', 'reader', 'readerAppend'
 */
function setLoadingState(isLoading, analysisType = 'module') {
    // Disable all action buttons
    DOMElements.runModuleBtn.disabled = isLoading;
    DOMElements.displayScriptureBtn.disabled = isLoading;
    DOMElements.versionSelect.disabled = isLoading;
    DOMElements.passageInput.disabled = isLoading;

    if (isLoading) {
        DOMElements.statusMessage.style.display = 'block';
        DOMElements.analysisDisplay.style.display = 'none';

        if (analysisType === 'module' || analysisType === 'reader') {
            DOMElements.statusIcon.textContent = '📖';
            DOMElements.statusTitle.textContent = `Analyzing ${DOMElements.passageInput.value.trim()}...`;
            DOMElements.statusText.textContent = 'Please wait a moment.';
            // Show loading dots if they exist
            const loadingDots = DOMElements.statusMessage.querySelector('.loading-dots');
            if (loadingDots) loadingDots.style.display = 'inline-flex';
        }
    } else {
        // Re-enable controls
        DOMElements.runModuleBtn.disabled = false;
        DOMElements.displayScriptureBtn.disabled = false;
        DOMElements.versionSelect.disabled = false;
        DOMElements.passageInput.disabled = false;
    }
}

/**
 * Main display function. Routes to the correct display handler.
 * This is the single choke-point for all content rendering.
 */
function displayAnalysis(analysis, error, analysisType, options) {
    // Re-enable controls, regardless of success or error
    setLoadingState(false, analysisType);
    
    // Always hide the top-level status message
    DOMElements.statusMessage.style.display = 'none';
    DOMElements.analysisDisplay.style.display = 'block';
    
    // Disconnect any old observer
    if (AppState.currentObserver) {
        AppState.currentObserver.disconnect();
        AppState.currentObserver = null;
    }

    if (error) {
        showError(error); // Show error *inside* the display pane
        return;
    }

    if (analysisType === 'module') {
        renderModuleAnalysis(analysis, options);
        AppState.currentReaderMode = false;
    } else if (analysisType === 'reader') {
        renderBibleText(analysis, options);
        AppState.currentReaderMode = true;
    } else if (analysisType === 'readerAppend') {
        renderAppendedBibleText(analysis, options);
        AppState.currentReaderMode = true; // Already true, but good to be explicit
    }
    
    // Apply the current font size
    applyFontSize();
    
    // After any render, re-init the observer if we are in reader mode
    if (AppState.currentReaderMode) {
        setupIntersectionObserver();
    }
}

/**
 * Renders the result of a "Module Analysis"
 */
function renderModuleAnalysis(analysis, options) {
    // Configure header
    DOMElements.analysisTitleDisplay.style.display = 'flex';
    DOMElements.readerControlsDisplay.style.display = 'none';
    DOMElements.analysisPassageDisplay.textContent = AppState.currentPassage;
    DOMElements.analysisModuleDisplay.textContent = options.moduleName;
    DOMElements.analysisIconDisplay.textContent = options.icon;
    
    // Format and inject content
    const formatted = robustMarkdown(analysis); // <-- NEW FORMATTER
    DOMElements.analysisContent.innerHTML = formatted;
    
    // Show footer
    DOMElements.analysisFooter.style.display = 'block';
    DOMElements.analysisFooter.innerHTML = `Analysis complete.`; // Placeholder
    
    // Ensure scroll-loaders are hidden
    DOMElements.scrollLoaderTop.style.display = 'none';
    DOMElements.scrollLoaderBottom.style.display = 'none';
}

/**
 * Renders the result of a "Display Scripture" request (a full chapter)
 */
function renderBibleText(analysis, options) {
    // Configure header
    DOMElements.analysisTitleDisplay.style.display = 'none';
    DOMElements.readerControlsDisplay.style.display = 'flex';
    DOMElements.readerTitleDisplay.textContent = `${options.book} ${options.chapter}`;
    
    // Format and inject content
    const formatted = robustMarkdown(analysis); // <-- NEW FORMATTER
    DOMElements.analysisContent.innerHTML = `
        <div class="chapter-chunk" data-book="${options.book}" data-chapter="${options.chapter}">
            ${formatted}
        </div>
    `;
    
    // Hide footer
    DOMElements.analysisFooter.style.display = 'none';
    
    // Ensure scroll-loaders are hidden
    DOMElements.scrollLoaderTop.style.display = 'none';
    DOMElements.scrollLoaderBottom.style.display = 'none';

    // Scroll to top
    DOMElements.resultsMain.scrollTop = 0;
}

/**
 * Renders an appended chapter (from "infinite scroll")
 */
function renderAppendedBibleText(analysis, options) {
    const { book, chapter, direction } = options;
    
    // Format and create new chunk
    const formatted = robustMarkdown(analysis); // <-- NEW FORMATTER
    const newChunk = document.createElement('div');
    newChunk.className = 'chapter-chunk';
    newChunk.dataset.book = book;
    newChunk.dataset.chapter = chapter;
    newChunk.innerHTML = formatted;

    const oldScrollHeight = DOMElements.analysisContent.scrollHeight;

    if (direction === 1) { // Appending to bottom
        DOMElements.analysisContent.appendChild(newChunk);
        DOMElements.scrollLoaderBottom.style.display = 'none';
    } else { // Prepending to top
        DOMElements.analysisContent.prepend(newChunk);
        DOMElements.scrollLoaderTop.style.display = 'none';
        
        // Adjust scroll position to keep user in the same place
        const newScrollHeight = DOMElements.analysisContent.scrollHeight;
        DOMElements.resultsMain.scrollTop += (newScrollHeight - oldScrollHeight);
    }

    AppState.isFetchingChapter = false;
}

/**
 * Shows an error message *inside* the analysis display pane.
 */
function showError(message) {
    // Use the main status message area for errors
    DOMElements.statusMessage.style.display = 'block';
    DOMElements.analysisDisplay.style.display = 'none'; // Hide the analysis pane
    
    DOMElements.statusIcon.textContent = '⚠️';
    DOMElements.statusTitle.textContent = 'An Error Occurred';
    DOMElements.statusText.textContent = message;

    // Hide loading dots if they exist
    const loadingDots = DOMElements.statusMessage.querySelector('.loading-dots');
    if (loadingDots) {
        loadingDots.style.display = 'none';
    }
}

// ===== NAVIGATION & UI TOGGLES =====

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
    DOMElements.sidebarHeader.textContent = ModuleDefinitions[category].name;
}

function switchModule(module) {
    AppState.currentModule = module;
    
    document.querySelectorAll('.secondary-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.module === module);
    });

    // Auto-run analysis if a passage is present
    const passage = DOMElements.passageInput.value.trim();
    if (passage && !AppState.currentReaderMode) {
        runModuleAnalysis();
    }
}

function getModuleInfo(category, module) {
    return ModuleDefinitions[category].modules[module];
}

function toggleSidebar() {
    DOMElements.sidebar.classList.toggle('collapsed');
    const isCollapsed = DOMElements.sidebar.classList.contains('collapsed');
    DOMElements.sidebarArrow.textContent = isCollapsed ? '▶' : '◀';
}

function toggleNotesPanel() {
    const isCollapsed = DOMElements.notesPanel.classList.contains('collapsed');
    setNotesPanelSize(isCollapsed ? 'normal' : 'collapsed');
}

function setNotesPanelSize(size) {
    const panel = DOMElements.notesPanel;
    panel.classList.toggle('collapsed', size === 'collapsed');
    panel.classList.toggle('medium', size === 'medium');
    panel.classList.toggle('wide', size === 'wide');
    
    // Update arrow
    DOMElements.notesArrow.textContent = (size === 'collapsed') ? '◀' : '▶';
    
    // Update active button state
    document.getElementById('collapseBtn').classList.toggle('active', size === 'collapsed');
    document.getElementById('normalBtn').classList.toggle('active', size === 'normal');
    document.getElementById('mediumBtn').classList.toggle('active', size === 'medium');
    document.getElementById('wideBtn').classList.toggle('active', size === 'wide');
}

// ===== BIBLE READER & SCROLL LOGIC =====

/**
 * Handles scroll events on the results pane for infinite scroll.
 */
function scrollHandler() {
    if (!AppState.currentReaderMode || AppState.isFetchingChapter) {
        return;
    }

    const pane = DOMElements.resultsMain;
    const scroll = pane.scrollTop;
    const topThreshold = 50; // Pixels from top
    const bottomThreshold = pane.scrollHeight - pane.clientHeight - 50; // Pixels from bottom

    if (scroll < topThreshold) {
        // Scrolled to top, fetch previous chapter
        fetchAndDisplayChapter(-1);
    } else if (scroll > bottomThreshold && (pane.scrollHeight > pane.clientHeight)) { // Added check to prevent firing on load
        // Scrolled to bottom, fetch next chapter
        fetchAndDisplayChapter(1);
    }
}

/**
 * Sets up the IntersectionObserver to watch for chapter chunks.
 * This is the FIX for the "smart header" bug.
 */
function setupIntersectionObserver() {
    if (AppState.currentObserver) {
        AppState.currentObserver.disconnect();
    }

    const options = {
        root: DOMElements.resultsMain, // The scrollable pane
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.1 // Fire when 10% of the element is visible
    };

    AppState.currentObserver = new IntersectionObserver((entries, observer) => {
        let topmostVisibleEntry = null;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!topmostVisibleEntry || entry.boundingClientRect.y < topmostVisibleEntry.boundingClientRect.y) {
                    topmostVisibleEntry = entry;
                }
            }
        });

        if (topmostVisibleEntry) {
            const { book, chapter } = topmostVisibleEntry.target.dataset;
            DOMElements.readerTitleDisplay.textContent = `${book} ${chapter}`;
            AppState.currentBibleReference.book = book;
            AppState.currentBibleReference.chapter = parseInt(chapter, 10);
        }
    }, options);

    const chunks = DOMElements.analysisContent.querySelectorAll('.chapter-chunk');
    chunks.forEach(chunk => AppState.currentObserver.observe(chunk));
}

/**
 * Creates the AI prompt for fetching scripture text.
 */
function getScripturePrompt(ref, version) {
    const versionMap = {
        'KJV': 'King James Version (KJV)',
        'WEB': 'World English Bible (WEB)',
        'RVR1909': 'Reina-Valera 1909 (Spanish)',
        'WLC': 'Hebrew Westminster Leningrad Codex (WLC)',
        'SBLGNT': 'SBLGNT (SBL Greek New Testament)'
    };
    const versionFullName = versionMap[version] || 'King James Version (KJV)';
    return `Please provide the full, complete text for the *entire chapter* of ${ref.book} ${ref.chapter}, using the ${versionFullName}. Do not add any commentary, just the scripture text.`;
}

/**
 * Parses a string like "John 3:16" or "Gen 1" into an object.
 * @param {string} passageStr - The user's input string.
 * @returns {object | null} - A reference object or null if invalid.
 */
function parsePassageReference(passageStr) {
    if (!AppState.bibleStructure) {
        console.error("Bible structure not loaded, cannot parse passage.");
        return null;
    }
    
    // Regex to capture book, chapter, and optional verse
    // Matches "John 3:16", "1 John 3", "Song of Solomon 1"
    const regex = /^([1-3]?\s?[A-Za-z\s]+?)\s?(\d+)(?:[:.](\d+))?.*$/;
    const match = passageStr.trim().match(regex);
    
    if (!match) {
        return null; // Doesn't look like a reference
    }

    const bookInput = match[1].trim().toLowerCase();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : 1; // Default to verse 1

    const bookData = AppState.bookAliases[bookInput];
    
    if (!bookData) {
        return null; // Book not found
    }

    const bookName = bookData.name; // Get the canonical name
    
    // Validate chapter
    if (chapter < 1 || chapter > bookData.chapters) {
        return null; // Invalid chapter
    }

    // Validate verse
    if (verse < 1 || verse > bookData.verses[chapter - 1]) {
        return null; // Invalid verse
    }
    
    return {
        book: bookName,
        chapter: chapter,
        verse: verse
    };
}

/**
 * Gets the reference for the adjacent chapter.
 * @param {string} bookName - The canonical book name.
 * @param {number} chapter - The current chapter number.
 * @param {number} direction - 1 (next) or -1 (previous).
 * @returns {object | null} - The new ref object or null if at end/start of Bible.
 */
function getAdjacentChapter(bookName, chapter, direction) {
    const bookData = AppState.bookAliases[bookName.toLowerCase()];
    if (!bookData) return null;

    const allBooks = [
        ...AppState.bibleStructure.testament.old.books, 
        ...AppState.bibleStructure.testament.new.books
    ];

    let newChapter = chapter + direction;
    let newBook = bookName;

    if (newChapter > bookData.chapters) {
        // Go to next book
        const newBookIndex = bookData.bookIndex + 1;
        if (newBookIndex >= allBooks.length) {
            return null; // End of Bible
        }
        const newBookData = allBooks[newBookIndex];
        newBook = newBookData.name;
        newChapter = 1;
    } else if (newChapter < 1) {
        // Go to previous book
        const newBookIndex = bookData.bookIndex - 1;
        if (newBookIndex < 0) {
            return null; // Start of Bible
        }
        const newBookData = allBooks[newBookIndex];
        newBook = newBookData.name;
        newChapter = newBookData.chapters; // Last chapter of previous book
    }

    return { book: newBook, chapter: newChapter, verse: 1 };
}

// ===== NEW: FONT SIZE LOGIC =====

/**
 * Changes the font size for the analysis content.
 * @param {number} direction - 1 to increase, -1 to decrease.
 */
function changeFontSize(direction) {
    const newIndex = AppState.currentFontSizeIndex + direction;
    
    // Clamp the index between 0 and max size
    if (newIndex < 0 || newIndex >= AppState.fontSizes.length) {
        return;
    }
    
    AppState.currentFontSizeIndex = newIndex;
    applyFontSize();
}

/**
 * Applies the current font size class to the content and updates buttons.
 */
function applyFontSize() {
    const content = DOMElements.analysisContent;
    const sizeClass = AppState.fontSizes[AppState.currentFontSizeIndex];
    
    // Remove old size classes and add new one
    content.classList.remove(...AppState.fontSizes);
    content.classList.add(sizeClass);
    
    // Update button states
    const atMin = AppState.currentFontSizeIndex === 0;
    const atMax = AppState.currentFontSizeIndex === AppState.fontSizes.length - 1;
    
    DOMElements.fontDecreaseBtn.disabled = atMin;
    DOMElements.readerFontDecreaseBtn.disabled = atMin;
    DOMElements.fontIncreaseBtn.disabled = atMax;
    DOMElements.readerFontIncreaseBtn.disabled = atMax;
}


// ===== UTILITIES =====

/**
 * A more robust markdown-to-HTML converter.
 * FIXES the formatting bug.
 * @param {string} text - The raw text from the AI.
 * @returns {string} - Formatted HTML.
 */
function robustMarkdown(text) {
    if (!text) return '<p>No analysis returned.</p>';

    // 1. Handle block-level elements first (headers, lists, blockquotes)
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // 2. Wrap contiguous <li>s in <ul> or <ol>
    // This regex looks for <li> elements and wraps them.
    html = html.replace(/^(<li>(?:.|\n)*?)(?=^[^<li]|\Z)/gim, (match) => {
        if (match.trim() === '') return '';
        // Simple check: if the *first* li was from a numbered list, use <ol>
        const firstLiContent = match.match(/<li>(.*?)<\/li>/i);
        if (firstLiContent) {
            // Find the original line in the *raw* text
            const originalLine = text.split('\n').find(line => line.includes(firstLiContent[1]));
            if (originalLine && /^\d+\./.test(originalLine.trim())) {
                return `<ol>${match}</ol>`;
            }
        }
        return `<ul>${match}</ul>`;
    });
    
    // 3. Handle inline elements (bold, italic)
    html = html
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // 4. Handle paragraphs and line breaks
    let paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
        if (p.trim() === '') return '';
        // If it's already a block element, just handle internal line breaks
        if (p.match(/<\/?(h[1-3]|ul|ol|li|blockquote)>/)) {
            return p.replace(/\n(?!<)/g, '<br>'); // Add line breaks but not before new tags
        }
        // Otherwise, wrap in a <p> tag and handle internal line breaks
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}

// ===== NOTES (STUB - REQUIRES FIRESTORE) =====
function loadNotes() {
    console.log("Notes loading... (stub)");
    // TODO: Implement with Firestore
    const saved = localStorage.getItem('scribeNotes'); // Temporary
    if (saved) {
        AppState.notes = JSON.parse(saved);
    }
}

function saveNotes() {
    console.log("Notes saving... (stub)");
    // TODO: Implement with Firestore
    localStorage.setItem('scribeNotes', JSON.stringify(AppState.notes)); // Temporary
}
