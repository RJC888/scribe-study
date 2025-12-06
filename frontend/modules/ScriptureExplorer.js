/**
 * ScriptureExplorer.js - Scripture Hierarchical Navigator
 * 
 * Two-panel layout:
 *   LEFT: Navigation with tabs (Divisions, Pericopes, Verses) + book selector + tree view
 *   RIGHT: Scripture display panel showing selected passage
 * 
 * User selects a verse range → scripture loads in right panel
 */

import ScriptureHierarchy from './ScriptureHierarchy.js';

export const ScriptureExplorer = {
  currentBook: 'Genesis',
  currentChapter: 1,
  currentDivision: null,
  currentPericope: null,
  currentTab: 'divisions',
  expandedDivisions: new Set(),

  /**
   * Create the Scripture Explorer panel HTML
   */
  render() {
    return `
      <div class="scripture-explorer-panel">
        <!-- Main Container: Left Navigation + Right Scripture Display -->
        <div class="scripture-explorer-container">
          
          <!-- LEFT PANEL: Navigation -->
          <div class="scripture-explorer-left">
            <!-- Book Selector -->
            <div class="nav-book-selector">
              <label>📖 Book:</label>
              <select id="scriptureBookSelect" class="book-select">
                ${this.getBookOptions()}
              </select>
            </div>

            <!-- Navigation Tabs -->
            <div class="nav-tabs-row">
              <button class="nav-tab-btn active" data-tab="divisions">📘 Divisions</button>
              <button class="nav-tab-btn" data-tab="pericopes">📄 Pericopes</button>
              <button class="nav-tab-btn" data-tab="verses">📍 Verses</button>
            </div>

            <!-- Tab Content Area -->
            <div class="nav-content-area">
              <!-- Divisions Tab -->
              <div class="nav-tab-content active" data-tab="divisions">
                <div id="divisionsTree" class="nav-tree"></div>
              </div>

              <!-- Pericopes Tab -->
              <div class="nav-tab-content" data-tab="pericopes">
                <div class="pericope-chapter-select">
                  <label>Chapter:</label>
                  <select id="pericopeChapterSelect" class="chapter-select"></select>
                </div>
                <div id="pericopesTree" class="nav-tree"></div>
              </div>

              <!-- Verses Tab -->
              <div class="nav-tab-content" data-tab="verses">
                <div class="verse-chapter-select">
                  <label>Chapter:</label>
                  <select id="verseChapterSelect" class="chapter-select"></select>
                </div>
                <div id="versesGrid" class="verses-grid"></div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL: Scripture Display -->
          <div class="scripture-explorer-right">
            <div id="explorerScriptureContent" class="scripture-display-content">
              <div class="empty-state">
                <span class="empty-icon">📖</span>
                <p>Click a division, pericope, or verse on the left to view the scripture here.</p>
              </div>
            </div>
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
    return books.map(b => `<option value="${b}">${b}</option>`).join('');
  },

  /**
   * Initialize all event handlers
   */
  async init() {
    await ScriptureHierarchy.init();
    
    // Book selector
    const bookSelect = document.getElementById('scriptureBookSelect');
    if (bookSelect) {
      bookSelect.addEventListener('change', (e) => {
        this.currentBook = e.target.value;
        this.currentChapter = 1;
        this.updateDivisionsTree();
        this.updateChapterSelects();
      });
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const contents = document.querySelectorAll('.nav-tab-content');
        contents.forEach(c => c.classList.remove('active'));
        const activeContent = document.querySelector(`.nav-tab-content[data-tab="${tab}"]`);
        if (activeContent) activeContent.classList.add('active');
        
        this.currentTab = tab;
        if (tab === 'pericopes') {
          this.updatePericopesTree();
        } else if (tab === 'verses') {
          this.updateVersesGrid();
        }
      });
    });

    // Initial load
    this.updateDivisionsTree();
    this.updateChapterSelects();
    
    console.log('[ScriptureExplorer] Initialized');
  },

  /**
   * Update divisions tree
   */
  updateDivisionsTree() {
    const container = document.getElementById('divisionsTree');
    if (!container) return;

    const divisions = ScriptureHierarchy.getBookDivisions(this.currentBook);
    
    if (!divisions || divisions.length === 0) {
      container.innerHTML = '<div class="empty-tree">No divisions found</div>';
      return;
    }

    container.innerHTML = divisions.map(div => `
      <div class="tree-item division-item" data-ref="${this.currentBook} ${div.ref}">
        <span class="tree-ref">${div.ref}</span>
        <span class="tree-title">${div.title}</span>
      </div>
    `).join('');

    container.querySelectorAll('.division-item').forEach(item => {
      item.addEventListener('click', () => {
        const ref = item.dataset.ref;
        this.selectDivision(ref);
      });
    });
  },

  /**
   * Select a division and load it
   */
  selectDivision(ref) {
    this.currentDivision = ref;
    this.loadDivisionScripture(ref);
  },

  /**
   * Update pericopes tree
   */
  updatePericopesTree() {
    const container = document.getElementById('pericopesTree');
    if (!container) return;

    const chapter = this.currentChapter || 1;
    const pericopes = ScriptureHierarchy.getChapterPericopesWithTitles(this.currentBook, chapter);
    
    if (!pericopes || pericopes.length === 0) {
      container.innerHTML = '<div class="empty-tree">No pericope divisions found</div>';
      return;
    }

    const html = pericopes.map(p => `
      <button class="pericope-btn" data-ref="${p.ref}" data-type="pericope" title="${p.title}">
        <span class="pericope-range">${p.verseRange}</span>
        <span class="pericope-title">${p.title}</span>
      </button>
    `).join('');

    container.innerHTML = html;

    container.querySelectorAll('.pericope-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        this.selectPericope(ref);
      });
    });
  },

  /**
   * Update chapter selects
   */
  updateChapterSelects() {
    const pericopeSelect = document.getElementById('pericopeChapterSelect');
    const verseSelect = document.getElementById('verseChapterSelect');
    
    const chapters = ScriptureHierarchy.getChapterCount(this.currentBook);
    const options = Array.from({length: chapters}, (_, i) => 
      `<option value="${i+1}" ${i+1 === this.currentChapter ? 'selected' : ''}>${i+1}</option>`
    ).join('');

    if (pericopeSelect) {
      pericopeSelect.innerHTML = options;
      pericopeSelect.addEventListener('change', (e) => {
        this.currentChapter = parseInt(e.target.value);
        this.updatePericopesTree();
      });
    }

    if (verseSelect) {
      verseSelect.innerHTML = options;
      verseSelect.addEventListener('change', (e) => {
        this.currentChapter = parseInt(e.target.value);
        this.updateVersesGrid();
      });
    }
  },

  /**
   * Select a pericope and load it
   */
  selectPericope(ref) {
    this.currentPericope = ref;
    this.loadDivisionScripture(ref);
  },

  /**
   * Update verses grid
   */
  updateVersesGrid() {
    const container = document.getElementById('versesGrid');
    if (!container) return;

    const chapter = this.currentChapter || 1;
    const verses = Array.from({length: 150}, (_, i) => i + 1); // Max 150 verses per chapter
    
    const html = verses.map(v => `
      <button class="verse-btn" data-ref="${this.currentBook} ${chapter}:${v}">
        ${v}
      </button>
    `).join('');

    container.innerHTML = html;

    container.querySelectorAll('.verse-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        this.selectVerse(ref);
      });
    });
  },

  /**
   * Select a verse and load it
   */
  selectVerse(ref) {
    this.loadDivisionScripture(ref);
  },

  /**
   * Load and display scripture - both in explorer AND main Scripture panel
   */
  async loadDivisionScripture(ref) {
    const content = document.getElementById('explorerScriptureContent');
    if (content) {
      content.innerHTML = `<div class="loading">Loading ${ref}...</div>`;
    }

    // Update main app state and trigger Scripture panel load
    if (window.AppState) {
      window.AppState.currentPassage = ref;
    }
    
    // Populate the main passage input and trigger load
    const passageInput = document.getElementById('passageInput');
    if (passageInput) {
      passageInput.value = ref;
      passageInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Trigger immediate load via Enter key simulation
      setTimeout(async () => {
        const enterEvent = new KeyboardEvent('keypress', { 
          key: 'Enter', 
          keyCode: 13,
          bubbles: true 
        });
        passageInput.dispatchEvent(enterEvent);
      }, 100);
    }

    // Also display in the explorer's own content area
    try {
      const resp = await fetch(`/api/scripture/${encodeURIComponent(ref)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (content) {
          content.innerHTML = `
            <div class="scripture-display">
              <h3>📖 ${data.ref || ref}</h3>
              <div class="scripture-text">${data.text || 'Loading...'}</div>
            </div>
          `;
        }
      } else {
        if (content) {
          content.innerHTML = `
            <div class="scripture-display">
              <h3>📖 ${ref}</h3>
              <p class="note">Loading in Scripture panel...</p>
            </div>
          `;
        }
      }
    } catch (error) {
      console.log('[ScriptureExplorer] API fetch skipped, using main panel');
      if (content) {
        content.innerHTML = `
          <div class="scripture-display">
            <h3>📖 ${ref}</h3>
            <p class="note">View in Scripture panel →</p>
          </div>
        `;
      }
    }
  },
};

export default ScriptureExplorer;
