/**
 * ScriptureExplorer.js - Scripture Hierarchical Navigator
 * 
 * Horizontal hierarchical layout:
 *   - Division bar (with dropdown for pericopes)
 *   - Pericope bar (with dropdown for verses)
 *   - Verse buttons
 * 
 * Syncs with the current passage from AppState
 */

import ScriptureHierarchy from './ScriptureHierarchy.js';

export const ScriptureExplorer = {
  currentBook: 'Matthew',
  currentChapter: 1,
  currentDivision: null,
  currentPericope: null,
  expandedDivision: null,
  expandedPericope: null,

  /**
   * Create the Scripture Explorer panel HTML - Horizontal hierarchical layout
   */
  render() {
    return `
      <div class="scripture-explorer-inline">
        <!-- Current Context Bar -->
        <div class="explorer-context-bar">
          <span class="context-label">📖 Exploring:</span>
          <span id="explorerCurrentBook" class="context-book">${this.currentBook}</span>
          <span id="explorerCurrentRef" class="context-ref"></span>
        </div>

        <!-- Book Selector Row -->
        <div class="explorer-book-row">
          <label>Book:</label>
          <select id="scriptureBookSelect" class="book-select-inline">
            ${this.getBookOptions()}
          </select>
          <label style="margin-left: 16px;">Chapter:</label>
          <select id="scriptureChapterSelect" class="chapter-select-inline">
            <option value="1">1</option>
          </select>
        </div>

        <!-- Divisions Bar (Horizontal) -->
        <div class="explorer-hierarchy-section">
          <div class="hierarchy-label">📘 Major Divisions</div>
          <div id="divisionsBar" class="hierarchy-bar divisions-bar">
            <!-- Division buttons render here -->
          </div>
        </div>

        <!-- Pericopes Bar (Shows when division expanded) -->
        <div id="pericopesSection" class="explorer-hierarchy-section hidden">
          <div class="hierarchy-label">📄 Pericopes <span id="pericopeDivisionLabel"></span></div>
          <div id="pericopesBar" class="hierarchy-bar pericopes-bar">
            <!-- Pericope buttons render here -->
          </div>
        </div>

        <!-- Verses Bar (Shows when pericope expanded) -->
        <div id="versesSection" class="explorer-hierarchy-section hidden">
          <div class="hierarchy-label">📍 Verses <span id="versePericopeLabel"></span></div>
          <div id="versesBar" class="hierarchy-bar verses-bar">
            <!-- Verse buttons render here -->
          </div>
        </div>

        <!-- Scripture Preview -->
        <div id="explorerScriptureContent" class="explorer-preview">
          <div class="empty-state">
            <p>Select a division, pericope, or verse above to preview</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Generate book options HTML
   */
  getBookOptions() {
    const books = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
      'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
      'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts',
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
      'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
      'Jude', 'Revelation'
    ];
    return books.map(b => `<option value="${b}" ${b === this.currentBook ? 'selected' : ''}>${b}</option>`).join('');
  },

  /**
   * Initialize - sync with current passage from AppState
   */
  async init() {
    await ScriptureHierarchy.init();
    
    // Sync with current passage if available
    this.syncWithCurrentPassage();
    
    // Book selector
    const bookSelect = document.getElementById('scriptureBookSelect');
    if (bookSelect) {
      bookSelect.value = this.currentBook;
      bookSelect.addEventListener('change', (e) => {
        this.currentBook = e.target.value;
        this.currentChapter = 1;
        this.updateChapterSelect();
        this.renderDivisionsBar();
        this.hidePericopesSection();
        this.hideVersesSection();
        this.updateContextDisplay();
      });
    }

    // Chapter selector
    const chapterSelect = document.getElementById('scriptureChapterSelect');
    if (chapterSelect) {
      chapterSelect.addEventListener('change', (e) => {
        this.currentChapter = parseInt(e.target.value);
        this.renderDivisionsBar();
        this.hidePericopesSection();
        this.hideVersesSection();
      });
    }

    // Listen for passage changes from main app
    document.addEventListener('passage:changed', (e) => {
      this.syncWithCurrentPassage();
    });

    // Initial render
    this.updateChapterSelect();
    this.renderDivisionsBar();
    this.updateContextDisplay();
    
    console.log('[ScriptureExplorer] Initialized with book:', this.currentBook);
  },

  /**
   * Sync explorer with current passage from AppState
   */
  syncWithCurrentPassage() {
    const passage = window.AppState?.currentPassage;
    if (!passage) return;

    console.log('[ScriptureExplorer] Syncing with passage:', passage);
    
    // Parse the passage to extract book and chapter
    const parsed = this.parsePassage(passage);
    if (parsed) {
      this.currentBook = parsed.book;
      this.currentChapter = parsed.chapter;
      
      // Update UI
      const bookSelect = document.getElementById('scriptureBookSelect');
      if (bookSelect) bookSelect.value = this.currentBook;
      
      this.updateChapterSelect();
      this.renderDivisionsBar();
      this.updateContextDisplay();
    }
  },

  /**
   * Parse passage string to extract book and chapter
   */
  parsePassage(passage) {
    if (!passage) return null;
    
    const bookNames = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
      'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
      'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts',
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
      'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
      'Jude', 'Revelation'
    ];

    const normalizedPassage = passage.trim();
    
    for (const book of bookNames) {
      if (normalizedPassage.toLowerCase().startsWith(book.toLowerCase())) {
        const rest = normalizedPassage.slice(book.length).trim();
        const chapterMatch = rest.match(/^(\d+)/);
        const chapter = chapterMatch ? parseInt(chapterMatch[1]) : 1;
        return { book, chapter };
      }
    }
    
    return null;
  },

  /**
   * Update context display bar
   */
  updateContextDisplay() {
    const bookEl = document.getElementById('explorerCurrentBook');
    const refEl = document.getElementById('explorerCurrentRef');
    if (bookEl) bookEl.textContent = this.currentBook;
    if (refEl) refEl.textContent = window.AppState?.currentPassage || '';
  },

  /**
   * Update chapter select dropdown
   */
  updateChapterSelect() {
    const select = document.getElementById('scriptureChapterSelect');
    if (!select) return;

    const chapters = ScriptureHierarchy.getChapterCount(this.currentBook);
    select.innerHTML = Array.from({length: chapters}, (_, i) => 
      `<option value="${i+1}" ${i+1 === this.currentChapter ? 'selected' : ''}>${i+1}</option>`
    ).join('');
  },

  /**
   * Render divisions as horizontal bar
   */
  renderDivisionsBar() {
    const container = document.getElementById('divisionsBar');
    if (!container) return;

    const divisions = ScriptureHierarchy.getBookDivisions(this.currentBook);
    
    if (!divisions || divisions.length === 0) {
      // Show chapter-based divisions if no structured divisions
      this.renderChapterDivisions(container);
      return;
    }

    container.innerHTML = divisions.map((div, idx) => `
      <button class="hierarchy-btn division-btn ${this.expandedDivision === idx ? 'expanded' : ''}" 
              data-index="${idx}" data-ref="${this.currentBook} ${div.ref}">
        <span class="btn-ref">${div.ref}</span>
        <span class="btn-title">${div.title || ''}</span>
        <span class="btn-expand">▼</span>
      </button>
    `).join('');

    // Bind click events
    container.querySelectorAll('.division-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const ref = btn.dataset.ref;
        this.toggleDivision(idx, ref, divisions[idx]);
      });
    });
  },

  /**
   * Render chapter-based divisions when no structured data available
   */
  renderChapterDivisions(container) {
    const chapters = ScriptureHierarchy.getChapterCount(this.currentBook);
    const chapterGroups = [];
    
    // Group chapters (e.g., 1-5, 6-10, etc.)
    const groupSize = Math.max(1, Math.ceil(chapters / 8));
    for (let i = 1; i <= chapters; i += groupSize) {
      const end = Math.min(i + groupSize - 1, chapters);
      chapterGroups.push({ start: i, end, label: i === end ? `Ch ${i}` : `Ch ${i}-${end}` });
    }

    container.innerHTML = chapterGroups.map((group, idx) => `
      <button class="hierarchy-btn division-btn" data-index="${idx}" data-start="${group.start}" data-end="${group.end}">
        <span class="btn-ref">${group.label}</span>
        <span class="btn-expand">▼</span>
      </button>
    `).join('');

    // Bind click events for chapter-based divisions
    container.querySelectorAll('.division-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const start = parseInt(btn.dataset.start);
        const end = parseInt(btn.dataset.end);
        this.toggleChapterDivision(idx, start, end);
      });
    });
  },

  /**
   * Toggle chapter-based division expansion - show pericopes for chapter range
   */
  toggleChapterDivision(idx, startChapter, endChapter) {
    if (this.expandedDivision === idx) {
      this.hidePericopesSection();
      this.expandedDivision = null;
    } else {
      this.expandedDivision = idx;
      this.showPericopesForChapterRange(startChapter, endChapter);
    }
    
    // Update button states
    document.querySelectorAll('.division-btn').forEach((btn, i) => {
      btn.classList.toggle('expanded', i === this.expandedDivision);
    });
  },

  /**
   * Show pericopes for a range of chapters
   */
  showPericopesForChapterRange(startChapter, endChapter) {
    const section = document.getElementById('pericopesSection');
    const bar = document.getElementById('pericopesBar');
    const label = document.getElementById('pericopeDivisionLabel');
    
    if (!section || !bar) return;
    
    section.classList.remove('hidden');
    const rangeLabel = startChapter === endChapter ? `Ch ${startChapter}` : `Ch ${startChapter}-${endChapter}`;
    if (label) label.textContent = `(${rangeLabel})`;
    
    // Collect pericopes from all chapters in this range
    const allPericopes = [];
    for (let ch = startChapter; ch <= endChapter; ch++) {
      const pericopes = ScriptureHierarchy.getChapterPericopesWithTitles(this.currentBook, ch);
      if (pericopes && pericopes.length > 0) {
        allPericopes.push(...pericopes);
      }
    }
    
    if (allPericopes.length === 0) {
      // Show individual chapter buttons if no pericopes
      bar.innerHTML = '';
      for (let ch = startChapter; ch <= endChapter; ch++) {
        bar.innerHTML += `
          <button class="hierarchy-btn pericope-btn chapter-fallback" data-chapter="${ch}">
            <span class="btn-ref">Chapter ${ch}</span>
            <span class="btn-expand">▼</span>
          </button>
        `;
      }
      
      bar.querySelectorAll('.chapter-fallback').forEach(btn => {
        btn.addEventListener('click', () => {
          const ch = parseInt(btn.dataset.chapter);
          this.showVersesForChapter(ch);
        });
      });
    } else {
      bar.innerHTML = allPericopes.map((p, idx) => `
        <button class="hierarchy-btn pericope-btn ${this.expandedPericope === idx ? 'expanded' : ''}" 
                data-index="${idx}" data-ref="${p.ref}">
          <span class="btn-ref">${p.verseRange || p.ref}</span>
          <span class="btn-title">${p.title || ''}</span>
          <span class="btn-expand">▼</span>
        </button>
      `).join('');

      bar.querySelectorAll('.pericope-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          const pRef = btn.dataset.ref;
          this.togglePericope(idx, pRef, allPericopes[idx]);
        });
      });
    }

    this.hideVersesSection();
  },

  /**
   * Show verses for a specific chapter (fallback when no pericope data)
   */
  showVersesForChapter(chapter) {
    const section = document.getElementById('versesSection');
    const bar = document.getElementById('versesBar');
    const label = document.getElementById('versePericopeLabel');
    
    if (!section || !bar) return;
    
    section.classList.remove('hidden');
    if (label) label.textContent = `(Chapter ${chapter})`;
    
    // Try to get micro-level data or default to 30 verses
    const verseCount = 30;
    
    bar.innerHTML = '';
    for (let v = 1; v <= verseCount; v++) {
      const verseRef = `${this.currentBook} ${chapter}:${v}`;
      bar.innerHTML += `
        <button class="hierarchy-btn verse-btn" data-ref="${verseRef}">
          ${v}
        </button>
      `;
    }

    bar.querySelectorAll('.verse-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadDivisionScripture(btn.dataset.ref);
        bar.querySelectorAll('.verse-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  },

  /**
   * Toggle division expansion - show/hide pericopes
   */
  toggleDivision(idx, ref, division) {
    if (this.expandedDivision === idx) {
      this.hidePericopesSection();
      this.expandedDivision = null;
    } else {
      this.expandedDivision = idx;
      this.showPericopesForDivision(ref, division);
    }
    
    // Update button states
    document.querySelectorAll('.division-btn').forEach((btn, i) => {
      btn.classList.toggle('expanded', i === this.expandedDivision);
    });
  },

  /**
   * Show pericopes section for a division
   */
  showPericopesForDivision(ref, division) {
    const section = document.getElementById('pericopesSection');
    const bar = document.getElementById('pericopesBar');
    const label = document.getElementById('pericopeDivisionLabel');
    
    if (!section || !bar) return;
    
    section.classList.remove('hidden');
    if (label) label.textContent = `(${ref})`;
    
    // Get pericopes for this chapter range
    const match = ref.match(/(\d+)/);
    const chapter = match ? parseInt(match[1]) : this.currentChapter;
    const pericopes = ScriptureHierarchy.getChapterPericopesWithTitles(this.currentBook, chapter);
    
    if (!pericopes || pericopes.length === 0) {
      bar.innerHTML = this.renderChapterVerseButtons(chapter);
    } else {
      bar.innerHTML = pericopes.map((p, idx) => `
        <button class="hierarchy-btn pericope-btn ${this.expandedPericope === idx ? 'expanded' : ''}" 
                data-index="${idx}" data-ref="${p.ref}">
          <span class="btn-ref">${p.verseRange || p.ref}</span>
          <span class="btn-title">${p.title || ''}</span>
          <span class="btn-expand">▼</span>
        </button>
      `).join('');

      bar.querySelectorAll('.pericope-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          const pRef = btn.dataset.ref;
          this.togglePericope(idx, pRef, pericopes[idx]);
        });
      });
    }

    this.hideVersesSection();
  },

  /**
   * Render chapter verse buttons
   */
  renderChapterVerseButtons(chapter) {
    const verseCount = 50; // Default max verses
    const buttons = [];
    for (let v = 1; v <= verseCount; v++) {
      buttons.push(`
        <button class="hierarchy-btn verse-btn" data-ref="${this.currentBook} ${chapter}:${v}">
          ${v}
        </button>
      `);
    }
    return buttons.join('');
  },

  /**
   * Toggle pericope expansion - show/hide verses
   */
  togglePericope(idx, ref, pericope) {
    if (this.expandedPericope === idx) {
      this.hideVersesSection();
      this.expandedPericope = null;
    } else {
      this.expandedPericope = idx;
      this.showVersesForPericope(ref, pericope);
      // Also load this pericope in the main panel
      this.loadDivisionScripture(ref);
    }
    
    document.querySelectorAll('.pericope-btn').forEach((btn, i) => {
      btn.classList.toggle('expanded', i === this.expandedPericope);
    });
  },

  /**
   * Show verses section for a pericope
   */
  showVersesForPericope(ref, pericope) {
    const section = document.getElementById('versesSection');
    const bar = document.getElementById('versesBar');
    const label = document.getElementById('versePericopeLabel');
    
    if (!section || !bar) return;
    
    section.classList.remove('hidden');
    if (label) label.textContent = `(${ref})`;
    
    // Parse verse range from ref (e.g., "3:1-15" → verses 1-15)
    const rangeMatch = ref.match(/(\d+):(\d+)(?:-(\d+))?/);
    let startVerse = 1, endVerse = 30;
    
    if (rangeMatch) {
      startVerse = parseInt(rangeMatch[2]);
      endVerse = rangeMatch[3] ? parseInt(rangeMatch[3]) : startVerse + 10;
    }

    const chapter = rangeMatch ? rangeMatch[1] : this.currentChapter;
    
    bar.innerHTML = '';
    for (let v = startVerse; v <= endVerse; v++) {
      const verseRef = `${this.currentBook} ${chapter}:${v}`;
      bar.innerHTML += `
        <button class="hierarchy-btn verse-btn" data-ref="${verseRef}">
          ${v}
        </button>
      `;
    }

    bar.querySelectorAll('.verse-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadDivisionScripture(btn.dataset.ref);
        // Highlight selected verse
        bar.querySelectorAll('.verse-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  },

  hidePericopesSection() {
    const section = document.getElementById('pericopesSection');
    if (section) section.classList.add('hidden');
    this.expandedPericope = null;
    this.hideVersesSection();
  },

  hideVersesSection() {
    const section = document.getElementById('versesSection');
    if (section) section.classList.add('hidden');
  },

  /**
   * Load and display scripture - both in explorer AND main Scripture panel
   */
  async loadDivisionScripture(ref) {
    console.log('[ScriptureExplorer] 📖 Loading:', ref);
    
    const content = document.getElementById('explorerScriptureContent');
    if (content) {
      content.innerHTML = `<div class="loading" style="padding: 20px; color: #888;">⏳ Loading ${ref}...</div>`;
    }

    // Update main app state
    if (window.AppState) {
      window.AppState.currentPassage = ref;
    }
    
    // Populate the main passage input
    const passageInput = document.getElementById('passageInput');
    if (passageInput) {
      passageInput.value = ref;
    }

    // Update pinned passage display
    const pinnedPassageRef = document.getElementById('pinnedPassageRef');
    if (pinnedPassageRef) {
      pinnedPassageRef.textContent = ref;
    }

    // Update context display
    this.updateContextDisplay();

    // Directly load scripture into the main panel
    const fullPassageText = document.getElementById('fullPassageText');
    
    if (fullPassageText) {
      fullPassageText.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">⏳ Loading Scripture...</div>';
      
      try {
        const { fetchAndDisplayScripture } = await import('../analysisEngine.js');
        
        if (fetchAndDisplayScripture) {
          await fetchAndDisplayScripture(ref, fullPassageText);
          console.log('[ScriptureExplorer] ✅ Scripture loaded:', ref);
          
          // Also show in explorer preview
          if (content) {
            content.innerHTML = `
              <div class="explorer-scripture-preview">
                <div class="preview-header">📖 ${ref}</div>
                <div class="preview-text">${fullPassageText.innerHTML}</div>
              </div>
            `;
          }
        }
      } catch (importError) {
        console.error('[ScriptureExplorer] Import error:', importError);
        if (content) {
          content.innerHTML = `<div class="error-state">Could not load scripture</div>`;
        }
      }
    }
  },
};

export default ScriptureExplorer;
