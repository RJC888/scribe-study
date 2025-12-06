/**
 * DLAnalysisPanel.js - Discourse & Literary Analysis Split-Pane
 * 
 * Displays pericope analysis in a side-by-side layout:
 *   LEFT: Discourse markers (EGT/Robertson Greek grammar, connective flow)
 *   RIGHT: Literary divisions (Bullinger chiasm, structure, literary devices)
 * 
 * Integrated into the Analysis pane, responsive to pericope selection
 */

export const DLAnalysisPanel = {
  currentPericope: null,
  currentVerseRange: null,
  discourseData: null,
  literaryData: null,

  /**
   * Initialize with pericope data and render
   */
  async init(pericope) {
    this.currentPericope = pericope;
    
    // Extract verse range from pericope ref (e.g., "Genesis 1:1-2" or "Genesis 1:1")
    let fullRef = pericope.ref;
    let book = '';
    let chapter = '';
    let verseRange = '';
    
    // Try to parse: "Genesis 1:1-5" pattern
    const match = fullRef.match(/^(.+?)\s+(\d+):(.+)$/);
    if (match) {
      [, book, chapter, verseRange] = match;
      this.currentVerseRange = `${book} ${chapter}:${verseRange}`;
    } else {
      // Fallback if pattern doesn't match
      console.warn('[DLAnalysisPanel] Could not parse pericope ref:', fullRef);
      this.currentVerseRange = fullRef;
    }

    console.log('[DLAnalysisPanel] Initialized with:', {
      fullRef,
      book,
      chapter,
      verseRange,
      currentVerseRange: this.currentVerseRange
    });

    // Fetch discourse and literary data
    await this.loadDiscourseData();
    await this.loadLiteraryData();
    
    return this.render();
  },

  /**
   * Load discourse markers from EGT/Robertson data
   */
  async loadDiscourseData() {
    try {
      const response = await fetch('/frontend/data/chapter-outlines-egt.json');
      const data = await response.json();
      this.discourseData = data;
    } catch (err) {
      console.error('[DLAnalysisPanel] Failed to load discourse data:', err);
      this.discourseData = null;
    }
  },

  /**
   * Load literary structure data from Bullinger/commentary sources
   */
  async loadLiteraryData() {
    try {
      const response = await fetch('/frontend/data/chapter-outlines-bullinger.json');
      const data = await response.json();
      this.literaryData = data;
    } catch (err) {
      console.error('[DLAnalysisPanel] Failed to load literary data:', err);
      this.literaryData = null;
    }
  },

  /**
   * Render the split-pane layout
   */
  async render() {
    if (!this.currentVerseRange) {
      return '<div class="dl-panel-error">Invalid pericope reference</div>';
    }

    // Get verse grid HTML (now async due to micro units loading)
    const verseGridHtml = await this.renderVerseGrid();

    return `
      <div id="dlAnalysisPanel" class="dl-analysis-panel">
        <!-- Header with pericope reference -->
        <div class="dl-panel-header">
          <h3>📊 Pericope Analysis</h3>
          <span class="dl-pericope-ref">${this.currentVerseRange}</span>
          <button class="dl-close-btn" title="Close analysis panel">✕</button>
        </div>

        <!-- Split-pane container -->
        <div class="dl-split-container">
          
          <!-- LEFT PANE: Discourse Analysis -->
          <div class="dl-pane discourse-pane">
            <div class="dl-pane-header">
              <h4>🌊 Discourse Flow</h4>
              <p class="dl-pane-subtitle">Greek markers & grammatical connectors</p>
            </div>
            <div class="dl-pane-content" id="discourseContent">
              ${this.renderDiscourseAnalysis()}
            </div>
          </div>

          <!-- CENTER DIVIDER -->
          <div class="dl-divider"></div>

          <!-- RIGHT PANE: Literary Analysis -->
          <div class="dl-pane literary-pane">
            <div class="dl-pane-header">
              <h4>📐 Literary Structure</h4>
              <p class="dl-pane-subtitle">Chiasm, symmetry, devices</p>
            </div>
            <div class="dl-pane-content" id="literaryContent">
              ${this.renderLiteraryAnalysis()}
            </div>
          </div>

        </div>

        <!-- Verse Sections (clickable to auto-load scripture) -->
        <div class="dl-verse-sections">
          <div class="dl-sections-header">
            <h4>📍 Verse Sections</h4>
            <p class="dl-sections-subtitle">Click a section to load scripture in main display</p>
          </div>
          <div class="dl-sections-grid" id="dlVerseGrid">
            ${verseGridHtml}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render discourse flow visualization
   */
  renderDiscourseAnalysis() {
    if (!this.discourseData) {
      return '<div class="dl-placeholder">Discourse data not available</div>';
    }

    // Extract book and chapter from currentVerseRange
    const match = this.currentVerseRange.match(/(.+?)\s+(\d+):/);
    if (!match) return '<div class="dl-placeholder">Unable to parse verse range</div>';

    const [, book, chapter] = match;
    const bookData = this.discourseData[book];
    const chapterData = bookData ? bookData[chapter] : null;

    if (!chapterData || !chapterData.greekMarkers || chapterData.greekMarkers.length === 0) {
      return '<div class="dl-placeholder">No discourse markers found</div>';
    }

    // Render markers with styling
    const markers = chapterData.greekMarkers.slice(0, 10).map(marker => `
      <div class="discourse-marker" data-function="${marker.function}">
        <span class="marker-label">${marker.label}</span>
        <span class="marker-greek">${marker.marker}</span>
        <span class="marker-function">${marker.function}</span>
        <p class="marker-description">${marker.description || 'Grammatical connector'}</p>
      </div>
    `).join('');

    return `
      <div class="discourse-flow">
        ${markers}
        <div class="discourse-note">Shows first 10 markers. Full analysis in detailed view.</div>
      </div>
    `;
  },

  /**
   * Render literary structure visualization
   */
  renderLiteraryAnalysis() {
    if (!this.literaryData) {
      return '<div class="dl-placeholder">Literary structure data not available</div>';
    }

    // Extract book and chapter
    const match = this.currentVerseRange.match(/(.+?)\s+(\d+):/);
    if (!match) return '<div class="dl-placeholder">Unable to parse verse range</div>';

    const [, book, chapter] = match;
    const bookData = this.literaryData[book];
    const chapterData = bookData ? bookData[chapter] : null;

    if (!chapterData || !chapterData.literary) {
      return '<div class="dl-placeholder">Literary structure data not yet available</div>';
    }

    // Render literary structure with indentation showing hierarchy
    const renderStructure = (item, depth = 0) => {
      const indent = depth * 20;
      return `
        <div class="literary-item" style="margin-left: ${indent}px; border-left: ${depth > 0 ? '2px solid #4a9eff' : 'none'}; padding-left: ${depth > 0 ? '12px' : '0'};">
          <span class="literary-ref">${item.ref || ''}</span>
          <p class="literary-title">${item.title || item.description || 'Untitled'}</p>
          ${item.device ? `<span class="literary-device">${item.device}</span>` : ''}
          ${Array.isArray(item.children) ? item.children.map(child => renderStructure(child, depth + 1)).join('') : ''}
        </div>
      `;
    };

    const structure = Array.isArray(chapterData.literary)
      ? chapterData.literary.map(item => renderStructure(item)).join('')
      : renderStructure(chapterData.literary);

    return `
      <div class="literary-structure">
        ${structure}
      </div>
    `;
  },

  /**
   * Render clickable micro units (Tier 3) with descriptions
   */
  async renderVerseGrid() {
    if (!this.currentVerseRange) return '';

    // Parse the verse range to get book and chapter
    const match = this.currentVerseRange.match(/^(.+?)\s+(\d+):(.+)$/);
    if (!match) return '';

    const [, book, chapter, rangeStr] = match;
    
    try {
      // Import ScriptureHierarchy to get micro units
      const { ScriptureHierarchy } = await import('./ScriptureHierarchy.js');
      const microUnits = ScriptureHierarchy.getChapterMicroUnits(book, parseInt(chapter));
      
      if (!microUnits || microUnits.length === 0) {
        // Fallback: show verse buttons if no micro units available
        return this.renderVerseFallback(book, chapter, rangeStr);
      }

      // Create clickable buttons for each micro unit with description
      return microUnits.map(unit => `
        <button class="micro-unit-btn" data-ref="${unit.ref}" title="Load verse in scripture display">
          <span class="micro-ref">${unit.ref.split(' ').slice(1).join(' ')}</span>
          <span class="micro-desc">${unit.description}</span>
        </button>
      `).join('');
    } catch (err) {
      console.error('[DLAnalysisPanel] Failed to load micro units:', err);
      // Fallback to verse buttons
      return this.renderVerseFallback(book, chapter, rangeStr);
    }
  },

  /**
   * Fallback verse display if micro units not available
   */
  renderVerseFallback(book, chapter, rangeStr) {
    // Handle ranges like "1-5" or single verses like "1"
    let verses = [];
    const parts = rangeStr.split('-');
    
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      for (let i = start; i <= end; i++) {
        verses.push(i);
      }
    } else {
      verses = [parseInt(rangeStr)];
    }

    // Create buttons for each verse
    return verses.map(v => `
      <button class="verse-section-btn" data-ref="${book} ${chapter}:${v}" title="Load verse in scripture display">
        ${v}
      </button>
    `).join('');
  },

  /**
   * Attach event handlers
   */
  attachHandlers(container) {
    if (!container) return;

    // Close button
    const closeBtn = container.querySelector('.dl-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Verse section buttons - auto-load scripture on click
    container.querySelectorAll('.verse-section-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        this.loadVerseInMain(ref);
      });
    });
  },

  /**
   * Load a verse in the main Scripture display (auto-load, no Enter needed)
   */
  async loadVerseInMain(ref) {
    try {
      const { fetchAndDisplayScripture } = await import('../analysisEngine.js');
      const container = document.getElementById('fullPassageText');
      
      if (fetchAndDisplayScripture && container) {
        // Update header if present
        const header = document.querySelector('.scripture-header h2');
        if (header) header.textContent = ref;

        // Update passage input
        const passageInput = document.getElementById('passageInput');
        if (passageInput) passageInput.value = ref;

        // Load scripture
        await fetchAndDisplayScripture(ref, container, 'kjv');
        
        // Highlight the verse in main display
        document.dispatchEvent(new CustomEvent('dlAnalysis:verseLoaded', { detail: { ref } }));
      }
    } catch (err) {
      console.error('[DLAnalysisPanel] Failed to load verse:', err);
    }
  },

  /**
   * Open panel in Analysis area
   */
  async open(pericope) {
    const container = document.getElementById('analysisDisplay');
    if (!container) {
      console.error('[DLAnalysisPanel] analysisDisplay container not found');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Initialize and render
    const html = await this.init(pericope);
    container.innerHTML = html;

    // Attach event handlers
    const panel = container.querySelector('#dlAnalysisPanel');
    this.attachHandlers(panel);

    console.log('[DLAnalysisPanel] Opened for pericope:', pericope);
  },

  /**
   * Close the panel
   */
  close() {
    const container = document.getElementById('analysisDisplay');
    if (container) {
      container.innerHTML = '';
    }
    this.currentPericope = null;
    console.log('[DLAnalysisPanel] Closed');
  },

  /**
   * Update panel with new pericope data
   */
  async update(pericope) {
    await this.open(pericope);
  },
};

export default DLAnalysisPanel;
