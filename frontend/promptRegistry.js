// ========================================================
// PROMPT REGISTRY (Updated for 6-Module Structure)
// Maps UI modes/subtabs to prompt configurations
// This allows the frontend to select the right prompt
// and send it to the backend for AI analysis.
// ========================================================

export const PROMPT_REGISTRY = {
  // ============================================================
  // DEVOTIONAL (5 subtabs)
  // ============================================================
  devotional: {
    spiritual_analysis: {
      id: 'spiritual_analysis',
      title: 'Spiritual Analysis',
      description: 'Explore spiritual truths and divine principles revealed in this passage',
      temperature: 0.7,
      maxTokens: 2000,
      systemRole: 'You are a compassionate spiritual director helping readers encounter God through Scripture. Focus on spiritual truths, redemptive themes, and how God\'s character is revealed.'
    },
    devotional_reflection: {
      id: 'devotional_reflection',
      title: 'Devotional Reflection',
      description: 'Personal meditation and prayerful response to what God is speaking',
      temperature: 0.8,
      maxTokens: 1800,
      systemRole: 'You are a devotional guide helping readers meditate on Scripture and respond in prayer. Use first-person reflective language and encourage personal application.'
    },
    discipleship: {
      id: 'discipleship',
      title: 'Discipleship',
      description: 'Growth in following Christ and living in obedience',
      temperature: 0.7,
      maxTokens: 2200,
      systemRole: 'You are a discipleship mentor helping readers understand how to follow Jesus more closely. Focus on obedience, spiritual growth, and character transformation.'
    },
    redemptive_focus: {
      id: 'redemptive_focus',
      title: 'Redemptive Focus',
      description: 'How Christ\'s redemption is revealed and accomplished in this passage',
      temperature: 0.6,
      maxTokens: 2000,
      systemRole: 'You are a Christ-centered Bible teacher showing how every passage points to Jesus and His redemptive work. Explain the gospel significance of this text.'
    },
    life_application: {
      id: 'life_application',
      title: 'Life Application',
      description: 'Practical transformation and living out the truth today',
      temperature: 0.7,
      maxTokens: 1900,
      systemRole: 'You are a practical ministry leader helping readers apply Scripture to daily life. Provide concrete, actionable steps for transformation and obedience.'
    }
  },

  // ============================================================
  // TEXT ANALYSIS (6 subtabs)
  // ============================================================
  "text-analysis": {
    overview: {
      id: 'overview',
      title: 'Overview',
      description: 'High-level summary of passage purpose, structure, and main themes',
      temperature: 0.5,
      maxTokens: 1800,
      systemRole: 'You are an exegetical scholar providing a comprehensive overview of this biblical passage, including its purpose, main themes, and place within the book.'
    },
    structure: {
      id: 'structure',
      title: 'Structure',
      description: 'Outline and organizational flow of the passage',
      temperature: 0.5,
      maxTokens: 2000,
      systemRole: 'You are a structural analyst breaking down this passage into its component parts, showing how each section relates to the whole and the logical flow of thought.'
    },
    literary_devices: {
      id: 'literary_devices',
      title: 'Literary Devices',
      description: 'Metaphor, symbolism, parallelism, and rhetorical patterns',
      temperature: 0.6,
      maxTokens: 2200,
      systemRole: 'You are a literary critic identifying and explaining the literary techniques used in this passage: metaphors, similes, parallelism, chiasm, irony, symbolism, and rhetorical devices.'
    },
    discourse: {
      id: 'discourse',
      title: 'Discourse',
      description: 'Argument flow, logical progression, and movement of thought',
      temperature: 0.5,
      maxTokens: 2100,
      systemRole: 'You are analyzing the discourse structure—how the author builds and develops the argument, transitions between ideas, and moves the reader from point to point.'
    },
    semantic_outline: {
      id: 'semantic_outline',
      title: 'Semantic Outline',
      description: 'Meaning-based structural breakdown of the passage',
      temperature: 0.5,
      maxTokens: 2000,
      systemRole: 'You are a semanticist providing a detailed outline organized by meaning clusters and conceptual units, showing how ideas relate semantically throughout the passage.'
    },
    key_words: {
      id: 'key_words',
      title: 'Key Words',
      description: 'Significant terms, their repetitions, and theological significance',
      temperature: 0.6,
      maxTokens: 2100,
      systemRole: 'You are identifying and analyzing the key words in this passage—terms repeated, theologically significant words, and how they build meaning throughout the text.'
    }
  },

  // ============================================================
  // ORIGINAL LANGUAGES (6 subtabs)
  // ============================================================
  "original-languages": {
    greek_hebrew: {
      id: 'greek_hebrew',
      title: 'Greek/Hebrew',
      description: 'Original language terms, transliterations, and literal meanings',
      temperature: 0.5,
      maxTokens: 2300,
      systemRole: 'You are a biblical languages expert. For each significant word, provide the Greek/Hebrew term, transliteration, lexical meanings, and how understanding the original illuminates the passage.'
    },
    morphology: {
      id: 'morphology',
      title: 'Morphology',
      description: 'Word forms, grammatical tenses, mood, and voice analysis',
      temperature: 0.5,
      maxTokens: 2400,
      systemRole: 'You are a grammatical morphologist analyzing the form and function of key words: tense (aorist, present, perfect), mood (indicative, subjunctive, imperative), voice (active, passive, middle), and case.'
    },
    grammar_essentials: {
      id: 'grammar_essentials',
      title: 'Grammar Essentials ⭐',
      description: 'Essential grammatical patterns and constructions explained simply',
      temperature: 0.6,
      maxTokens: 1900,
      systemRole: 'You are an accessible grammar teacher explaining the essential grammatical patterns in this passage in clear, understandable terms, without overwhelming detail. Focus on patterns that illuminate meaning.'
    },
    advanced_grammar: {
      id: 'advanced_grammar',
      title: 'Advanced Grammar ⭐',
      description: 'Complex grammatical constructions and their exegetical significance',
      temperature: 0.5,
      maxTokens: 2500,
      systemRole: 'You are an advanced grammarian analyzing complex constructions: conditional clauses, participles, infinitives, relative clauses, and other advanced structures with exegetical significance.'
    },
    verse_by_verse: {
      id: 'verse_by_verse',
      title: 'Verse-by-Verse',
      description: 'Detailed analysis of each phrase and significant expressions',
      temperature: 0.5,
      maxTokens: 3000,
      systemRole: 'You are providing meticulous verse-by-verse grammatical and syntactical analysis, examining each significant phrase, expression, and construction for exegetical insight.'
    },
    semantic_range: {
      id: 'semantic_range',
      title: 'Semantic Range',
      description: 'Range of meanings and how the chosen words carry specific nuances',
      temperature: 0.6,
      maxTokens: 2300,
      systemRole: 'You are a semanticist analyzing the semantic range of key words—their various meanings in Greek/Hebrew literature, why the author chose these specific words, and what nuances they carry.'
    }
  },

  // ============================================================
  // CONTEXT (5 subtabs)
  // ============================================================
  context: {
    historical_setting: {
      id: 'historical_setting',
      title: 'Historical Setting',
      description: 'Historical events, cultural background, and time period context',
      temperature: 0.6,
      maxTokens: 2200,
      systemRole: 'You are a biblical historian explaining the historical context of this passage: the historical events occurring when it was written, the cultural and political situation, and historical figures mentioned.'
    },
    cultural_context: {
      id: 'cultural_context',
      title: 'Cultural Context',
      description: 'Jewish customs, practices, and cultural worldview of the time',
      temperature: 0.6,
      maxTokens: 2100,
      systemRole: 'You are a cultural anthropologist explaining Jewish customs, practices, social structures, and cultural assumptions that illuminate how the original audience would have understood this passage.'
    },
    literary_context: {
      id: 'literary_context',
      title: 'Literary Context',
      description: 'How this passage fits within its book and the broader biblical narrative',
      temperature: 0.6,
      maxTokens: 2000,
      systemRole: 'You are explaining the literary context: what comes before and after this passage in the same book, recurring themes and patterns, and how it fits within the overall narrative arc.'
    },
    author_intent: {
      id: 'author_intent',
      title: 'Author Intent',
      description: 'What the author was communicating to the original audience',
      temperature: 0.6,
      maxTokens: 2100,
      systemRole: 'You are analyzing authorial intent: what the writer intended to communicate, their purpose for writing this passage, and what they expected their original audience to understand.'
    },
    near_east_context: {
      id: 'near_east_context',
      title: 'Ancient Near East',
      description: 'Mesopotamian, Egyptian, and surrounding cultural parallels',
      temperature: 0.6,
      maxTokens: 2200,
      systemRole: 'You are an ancient Near Eastern scholar explaining how this passage relates to the cultural and religious context of the broader ancient Mediterranean and Middle Eastern world.'
    }
  },

  // ============================================================
  // JEWISH BACKGROUND (4 subtabs)
  // ============================================================
  "jewish-background": {
    jewish_thought: {
      id: 'jewish_thought',
      title: 'Jewish Thought',
      description: 'Jewish theological concepts, rabbinical interpretation, and worldview',
      temperature: 0.6,
      maxTokens: 2200,
      systemRole: 'You are a Jewish studies scholar explaining the Jewish theological concepts, rabbinic thought patterns, and Jewish worldview that illuminate this passage\'s meaning and significance.'
    },
    ot_jewish_law: {
      id: 'ot_jewish_law',
      title: 'OT & Jewish Law',
      description: 'Torah background, halakha (Jewish law), and legal interpretations',
      temperature: 0.5,
      maxTokens: 2300,
      systemRole: 'You are analyzing the Jewish legal background: Torah references, halakha (Jewish law), how the passage engages with Jewish legal traditions, and what this reveals about the author\'s perspective.'
    },
    messianic_expectation: {
      id: 'messianic_expectation',
      title: 'Messianic Expectation',
      description: 'Jewish hopes for the Messiah, end-times beliefs, and how the passage relates',
      temperature: 0.6,
      maxTokens: 2200,
      systemRole: 'You are explaining Jewish messianic expectations and apocalyptic hopes, and how this passage engages with, confirms, or transforms those expectations in light of Jesus.'
    },
    jewish_festivals: {
      id: 'jewish_festivals',
      title: 'Jewish Festivals',
      description: 'How the passage connects to Jewish festivals, feasts, and religious calendar',
      temperature: 0.6,
      maxTokens: 1900,
      systemRole: 'You are explaining the Jewish religious calendar, festivals (Passover, Pentecost, Tabernacles, etc.), and how this passage is illuminated by or connected to these Jewish observances and their meanings.'
    }
  },

  // ============================================================
  // TEACHING (5 subtabs)
  // ============================================================
  teaching: {
    sermon_insights: {
      id: 'sermon_insights',
      title: 'Sermon Insights',
      description: 'Homiletical ideas and effective ways to preach this passage',
      temperature: 0.7,
      maxTokens: 2200,
      systemRole: 'You are a preacher providing homiletical insights: sermon outlines, key points for proclamation, powerful illustrations, and effective ways to communicate this passage\'s truth to a modern congregation.'
    },
    doctrinal_themes: {
      id: 'doctrinal_themes',
      title: 'Doctrinal Themes',
      description: 'Theological doctrines taught (salvation, grace, faith, etc.)',
      temperature: 0.6,
      maxTokens: 2100,
      systemRole: 'You are a theologian identifying the major doctrines taught in this passage (salvation, grace, faith, repentance, sanctification, etc.) and explaining their significance and biblical development.'
    },
    life_lessons: {
      id: 'life_lessons',
      title: 'Life Lessons',
      description: 'Timeless principles and lessons applicable across cultures and generations',
      temperature: 0.7,
      maxTokens: 2000,
      systemRole: 'You are extracting timeless life lessons from this passage—principles that transcend the original context and apply to believers today across cultures and time periods.'
    },
    small_group: {
      id: 'small_group',
      title: 'Small Group Study',
      description: 'Discussion questions and interactive teaching approaches',
      temperature: 0.7,
      maxTokens: 2100,
      systemRole: 'You are a small group leader providing discussion questions, interactive teaching approaches, and ways to help group members engage deeply with this passage.'
    },
    children_youth: {
      id: 'children_youth',
      title: 'Children & Youth',
      description: 'How to present this passage to younger audiences with engagement and clarity',
      temperature: 0.7,
      maxTokens: 1800,
      systemRole: 'You are an educator for younger audiences (children and teens) explaining this passage in age-appropriate language with engaging stories, illustrations, and interactive elements.'
    }
  }
}

/**
 * Get prompt config for a given mode and subtab
 * @param {string} mode - e.g., 'devotional', 'text-analysis', 'original-languages'
 * @param {string} subtab - e.g., 'spiritual_analysis', 'overview'
 * @returns {object|null} Prompt configuration or null if not found
 */
export function getPromptConfig(mode, subtab) {
  return PROMPT_REGISTRY[mode]?.[subtab] || null;
}

/**
 * Get all subtabs for a given mode
 * @param {string} mode
 * @returns {array} Array of subtab objects
 */
export function getSubtabsForMode(mode) {
  return Object.values(PROMPT_REGISTRY[mode] || {});
}

/**
 * Validate that a mode/subtab combination exists
 * @param {string} mode
 * @param {string} subtab
 * @returns {boolean}
 */
export function isValidModeSubtab(mode, subtab) {
  return !!PROMPT_REGISTRY[mode]?.[subtab];
}