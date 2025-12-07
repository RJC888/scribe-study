/**
 * ScriptureHierarchy.js - Scripture Structure & Hierarchy Data
 * 
 * Combines BSB book divisions, K&D pericopes, and genre information
 * to provide macro→micro navigation for scripture exploration.
 * 
 * Hierarchy Levels (top to bottom):
 *   1. Book Divisions (from BSB) - Major sections of a book
 *   2. Pericopes (from K&D) - Scholarly verse divisions
 *   3. Individual Verses - The granular level
 * 
 * Usage:
 *   const hierarchy = await ScriptureHierarchy.getHierarchyForVerse('Genesis', 22, 1);
 *   const divisions = await ScriptureHierarchy.getBookDivisions('Genesis');
 */

export const ScriptureHierarchy = {
  // Cache for loaded data
  _cache: {
    bsbData: null,
    kdData: null,
    kdTitlesData: null,  // Tier 2: Pericope titles mapped to K&D ranges
    gospelsData: null,
    microData: null,  // Tier 3: Micro units with verse descriptions
  },

  /**
   * Load all required data files
   */
  async init() {
    try {
      // Load BSB hierarchical structure (OT & NT)
      if (!this._cache.bsbData) {
        const bsbRes = await fetch('/data/chapter-outlines-bsb-v2.json');
        this._cache.bsbData = await bsbRes.json();
      }

      // Load K&D pericope divisions (OT primarily, some NT)
      if (!this._cache.kdData) {
        const kdRes = await fetch('/data/chapter-outlines-kd.json');
        this._cache.kdData = await kdRes.json();
      }

      // Load K&D pericope titles (Tier 2)
      if (!this._cache.kdTitlesData) {
        const kdTitlesRes = await fetch('/data/chapter-outlines-kd-titles.json');
        this._cache.kdTitlesData = await kdTitlesRes.json();
      }

      // Load Gospel outlines for NT scene divisions
      if (!this._cache.gospelsData) {
        const gospelsRes = await fetch('/data/chapter-outlines-gospels.json');
        this._cache.gospelsData = await gospelsRes.json();
      }

      // Load micro-level verse descriptions (Tier 3)
      if (!this._cache.microData) {
        const microRes = await fetch('/data/chapter-outlines-micro.json');
        this._cache.microData = await microRes.json();
      }

      console.log('[ScriptureHierarchy] Data loaded successfully');
      return true;
    } catch (e) {
      console.error('[ScriptureHierarchy] Failed to load data:', e);
      return false;
    }
  },

  /**
   * Get all book divisions for a book (Level 1: Macro structure)
   * @param {string} bookName - e.g. "Genesis", "Matthew", "Romans"
   * @returns {array} List of divisions with verse ranges and titles
   */
  getBookDivisions(bookName) {
    if (!this._cache.bsbData) return [];

    const bookData = this._cache.bsbData[bookName];
    if (!bookData) return [];

    // Collect divisions across all chapters
    const divisions = [];
    const seen = new Set();

    // From BSB structure: depth 0 items are major divisions
    for (const [chapter, items] of Object.entries(bookData)) {
      if (!Array.isArray(items)) continue;

      items.forEach(item => {
        if (item.depth === 0 && !seen.has(item.ref)) {
          divisions.push({
            ref: item.ref,
            title: item.title,
            display: item.display,
            depth: 0,
            type: 'book-division',
          });
          seen.add(item.ref);
        }
      });
    }

    return divisions.sort((a, b) => {
      // Sort by verse range numerically
      const aStart = this._parseVerseRange(a.ref)[0];
      const bStart = this._parseVerseRange(b.ref)[0];
      return aStart - bStart;
    });
  },

  /**
   * Get pericope divisions for a specific chapter (Level 2: Middle structure)
   * @param {string} bookName
   * @param {number|string} chapter
   * @returns {array} Pericope divisions with verse ranges
   */
  getChapterPericopes(bookName, chapter) {
    if (!this._cache.kdData) return [];

    const chapterKey = String(chapter);
    const bookData = this._cache.kdData[bookName];
    if (!bookData || !bookData[chapterKey]) return [];

    // K&D provides verse ranges as an array for each chapter
    const pericopes = bookData[chapterKey];
    if (!Array.isArray(pericopes)) return [];

    return pericopes.map((range, index) => {
      // range is already in format "25:1-2", so just prepend book name
      return {
        ref: `${bookName} ${range}`,
        verseRange: range,
        type: 'pericope',
        depth: 1,
        index,
      };
    });
  },

  /**
   * Get pericopes WITH titles (Tier 2 - Complete pericope information)
   * Combines K&D verse ranges with scholarly titles
   * 
   * @param {string} bookName - e.g. "Genesis", "John"
   * @param {number} chapter - e.g. 3
   * @returns {array} Pericopes with full titles and metadata
   */
  getChapterPericopesWithTitles(bookName, chapter) {
    if (!this._cache.kdData || !this._cache.kdTitlesData) return [];

    const chapterKey = String(chapter);
    const kdRanges = this._cache.kdData[bookName]?.[chapterKey];
    const titleData = this._cache.kdTitlesData[bookName]?.[chapterKey];

    if (!kdRanges || !Array.isArray(kdRanges)) return [];

    // Map each K&D verse range to its title
    return kdRanges.map((range, index) => {
      const title = titleData?.[range] || `${range} (untitled)`;
      return {
        ref: `${bookName} ${range}`,
        verseRange: range,
        title: title,
        type: 'pericope',
        depth: 1,
        index,
      };
    });
  },

  /**
   * Get full hierarchy for a specific verse
   * Shows: Book Division → Pericope → This Verse
   * 
   * @param {string} bookName - "Genesis", "Romans", etc.
   * @param {number} chapter
   * @param {number} verse
   * @returns {object} Hierarchical structure
   */
  getHierarchyForVerse(bookName, chapter, verse) {
    const divisions = this.getBookDivisions(bookName);
    const pericopes = this.getChapterPericopes(bookName, chapter);

    // Find which division contains this verse
    let currentDivision = null;
    const verseNum = this._verseToNumber(chapter, verse);

    for (const division of divisions) {
      const [startVerse, endVerse] = this._parseVerseRange(division.ref);
      if (verseNum >= startVerse && verseNum <= endVerse) {
        currentDivision = division;
        break;
      }
    }

    // Find which pericope contains this verse
    let currentPericope = null;
    for (const pericope of pericopes) {
      const range = pericope.verseRange;
      const [startVerse, endVerse] = this._parseVerseRangeSimple(range);
      if (verse >= startVerse && verse <= endVerse) {
        currentPericope = pericope;
        break;
      }
    }

    return {
      book: bookName,
      chapter,
      verse,
      hierarchy: {
        division: currentDivision,
        pericope: currentPericope,
        verse: `${bookName} ${chapter}:${verse}`,
      },
      allDivisions: divisions,
      allPericopes: pericopes,
    };
  },

  /**
   * Get nested structure for display
   * Returns divisions with their contained pericopes
   * 
   * @param {string} bookName
   * @returns {array} Nested structure
   */
  getNestedStructure(bookName) {
    const divisions = this.getBookDivisions(bookName);
    
    // For each division, try to populate its pericopes
    return divisions.map(division => {
      const [startVerse, endVerse] = this._parseVerseRange(division.ref);
      const startChapter = Math.floor(startVerse / 1000);
      const endChapter = Math.floor(endVerse / 1000);

      // Collect pericopes from all chapters in this division
      const pericopes = [];
      const seen = new Set();

      for (let ch = startChapter; ch <= endChapter; ch++) {
        const chPericopes = this.getChapterPericopes(bookName, ch);
        chPericopes.forEach(p => {
          if (!seen.has(p.ref)) {
            pericopes.push(p);
            seen.add(p.ref);
          }
        });
      }

      return {
        ...division,
        children: pericopes,
      };
    });
  },

  /**
   * Get all available books in the data
   */
  getAllBooks() {
    if (!this._cache.bsbData) return [];
    return Object.keys(this._cache.bsbData).sort();
  },

  /**
   * Get all chapters for a book
   */
  getBookChapters(bookName) {
    if (!this._cache.bsbData) return [];
    const bookData = this._cache.bsbData[bookName];
    if (!bookData) return [];
    
    return Object.keys(bookData)
      .map(Number)
      .filter(ch => !isNaN(ch))
      .sort((a, b) => a - b);
  },

  /**
   * Get chapter count for a book
   */
  getChapterCount(bookName) {
    const chapterCounts = {
      'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
      'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
      '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
      'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
      'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
      'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
      'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
      'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
      'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
      'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
      'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
      '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13,
      'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
      'Jude': 1, 'Revelation': 22
    };
    return chapterCounts[bookName] || 1;
  },

  /**
   * Get verse count for a specific chapter
   */
  getVerseCount(bookName, chapter) {
    // Common verse counts - simplified
    const verseCounts = {
      'Genesis': { 1: 31, 2: 25, 3: 24, 4: 26, 5: 32, 6: 22, 7: 24, 8: 22, 9: 29, 10: 32 },
      'John': { 1: 51, 2: 25, 3: 36, 4: 54, 5: 47, 6: 71, 7: 53, 8: 59, 9: 41, 10: 42 },
      'Psalms': { 1: 6, 23: 6, 119: 176 },
    };
    
    return verseCounts[bookName]?.[chapter] || 30; // Default to 30 verses
  },

  /**
   * Get micro-level verse descriptions (Level 3: Smallest units)
   * @param {string} bookName - e.g. "John"
   * @param {number} chapter - e.g. 3
   * @returns {array} List of micro units with verse ranges and descriptions
   */
  getChapterMicroUnits(bookName, chapter) {
    if (!this._cache.microData) return [];

    const chapterKey = String(chapter);
    const bookData = this._cache.microData[bookName];
    if (!bookData || !bookData[chapterKey]) return [];

    const units = bookData[chapterKey];
    if (!Array.isArray(units)) return [];

    return units.map((unit, index) => ({
      ref: `${bookName} ${unit.ref}`,
      description: unit.description,
      type: 'micro',
      depth: 2,
      index,
    }));
  },

  /**
   * PRIVATE HELPERS
   */

  /**
   * Parse verse range like "1:1-2:3" into numeric values
   * Converts to: [1001, 2003] format (book+chapter*1000+verse)
   */
  _parseVerseRange(rangeStr) {
    // Example: "1:1-2:3" or "1:1-10:32"
    const match = rangeStr.match(/(\d+):(\d+)-(\d+):(\d+)/);
    if (!match) return [0, 999999];

    const [, startCh, startVerse, endCh, endVerse] = match.map(Number);
    const start = startCh * 1000 + startVerse;
    const end = endCh * 1000 + endVerse;
    return [start, end];
  },

  /**
   * Parse simple verse range like "1-5" into [1, 5]
   */
  _parseVerseRangeSimple(rangeStr) {
    const match = rangeStr.match(/(\d+)-(\d+)/);
    if (!match) {
      const num = Number(rangeStr);
      return [num, num];
    }
    return [Number(match[1]), Number(match[2])];
  },

  /**
   * Convert chapter:verse to numeric value for comparison
   */
  _verseToNumber(chapter, verse) {
    return chapter * 1000 + verse;
  },
};

// Initialize when first accessed (lazy init - no top-level await)
// ScriptureHierarchy.init() should be called when needed

export default ScriptureHierarchy;
