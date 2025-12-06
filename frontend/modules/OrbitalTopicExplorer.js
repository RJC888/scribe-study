/**
 * OrbitalTopicExplorer.js
 * 
 * Beautiful orbital-themed topic explorer with circular ring cards
 * Topics display as glowing orbital rings with:
 *   - Subtopics as orbiting satellites
 *   - Verse count badges
 *   - Related topics as connected elements
 *   - Expandable verse reference panels
 */

export class OrbitalTopicExplorer {
  constructor() {
    this.torreyData = null;
    this.currentTopic = null;
    this.searchResults = [];
    this.isOpen = false;
    this.container = null;
  }

  /**
   * Initialize and load Torrey topic data
   */
  async init() {
    try {
      const resp = await fetch('./data/chapter-outlines-torrey.json');
      if (resp.ok) {
        this.torreyData = await resp.json();
        console.log(`🌌 OrbitalTopicExplorer: Loaded ${this.torreyData.topics?.length || 0} topics`);
      }
    } catch (e) {
      console.warn('⚠️ Could not load Torrey data:', e.message);
    }
    
    this.createContainer();
    this.bindEvents();
  }

  /**
   * Create the modal container
   */
  createContainer() {
    // Remove existing if present
    const existing = document.getElementById('orbitalTopicExplorer');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'orbitalTopicExplorer';
    modal.className = 'orbital-topic-modal hidden';
    modal.innerHTML = this.render();
    document.body.appendChild(modal);
    this.container = modal;
  }

  /**
   * Render the modal HTML
   */
  render() {
    return `
      <div class="orbital-topic-backdrop"></div>
      <div class="orbital-topic-panel">
        <!-- Header with Search -->
        <header class="orbital-topic-header">
          <div class="header-title">
            <span class="header-icon">🌌</span>
            <h2>Topical Explorer</h2>
            <span class="topic-count">${this.torreyData?.topics?.length || 497} Topics</span>
          </div>
          <div class="header-search">
            <input 
              type="text" 
              id="topicSearchInput" 
              placeholder="Search topics... (e.g., Grace, Faith, Prayer)"
              autocomplete="off"
            />
            <span class="search-icon">🔍</span>
          </div>
          <button class="close-btn" id="closeTopicExplorer">✕</button>
        </header>

        <!-- Main Content Area -->
        <main class="orbital-topic-content">
          <!-- Left: Topic Grid with Orbital Cards -->
          <section class="topic-grid-section">
            <div class="section-header">
              <h3>📚 Topics</h3>
              <div class="category-filter">
                <button class="filter-chip active" data-category="all">All</button>
                <button class="filter-chip" data-category="Doctrines">Doctrines</button>
                <button class="filter-chip" data-category="Persons">Persons</button>
                <button class="filter-chip" data-category="Places">Places</button>
              </div>
            </div>
            <div id="topicGrid" class="topic-grid">
              <!-- Orbital topic cards will be rendered here -->
              <div class="loading-message">Type to search or browse topics...</div>
            </div>
          </section>

          <!-- Right: Detail Panel (shown when topic selected) -->
          <section id="topicDetailPanel" class="topic-detail-section hidden">
            <div class="detail-header">
              <button class="back-btn" id="backToGrid">← Back</button>
              <h3 id="detailTopicTitle">Topic Name</h3>
            </div>
            <div id="topicDetailContent" class="detail-content">
              <!-- Selected topic details -->
            </div>
          </section>
        </main>

        <!-- Footer -->
        <footer class="orbital-topic-footer">
          <div class="footer-info">
            <span>💡 Click a topic ring to explore verses</span>
          </div>
          <button class="btn-home" id="topicHomeBtn">🏠 Return Home</button>
        </footer>
      </div>
    `;
  }

  /**
   * Bind all event handlers
   */
  bindEvents() {
    // Close button
    this.container?.querySelector('#closeTopicExplorer')?.addEventListener('click', () => this.close());
    this.container?.querySelector('.orbital-topic-backdrop')?.addEventListener('click', () => this.close());
    
    // Home button
    this.container?.querySelector('#topicHomeBtn')?.addEventListener('click', () => {
      this.close();
      document.dispatchEvent(new CustomEvent('navigation:home'));
    });

    // Search input
    const searchInput = this.container?.querySelector('#topicSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });
    }

    // Category filters
    this.container?.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.filterByCategory(e.target.dataset.category);
      });
    });

    // Back button in detail panel
    this.container?.querySelector('#backToGrid')?.addEventListener('click', () => this.showGrid());

    // Delegate clicks on topic cards
    this.container?.querySelector('#topicGrid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.orbital-topic-card');
      if (card) {
        const topicName = card.dataset.topic;
        this.selectTopic(topicName);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Open the explorer modal
   */
  open(initialSearch = '') {
    if (!this.container) this.createContainer();
    
    this.container.classList.remove('hidden');
    this.isOpen = true;
    
    const searchInput = this.container.querySelector('#topicSearchInput');
    if (searchInput) {
      searchInput.value = initialSearch;
      searchInput.focus();
      
      if (initialSearch) {
        this.handleSearch(initialSearch);
      } else {
        this.showPopularTopics();
      }
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the explorer modal
   */
  close() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
    this.isOpen = false;
    this.currentTopic = null;
    document.body.style.overflow = '';
  }

  /**
   * Handle search input
   */
  handleSearch(query) {
    const lower = query.toLowerCase().trim();
    
    if (!lower || lower.length < 2) {
      this.showPopularTopics();
      return;
    }

    const matches = this.torreyData?.topics?.filter(topic => {
      const name = topic.topic?.toLowerCase() || '';
      const subtopics = topic.subtopics?.join(' ').toLowerCase() || '';
      return name.includes(lower) || subtopics.includes(lower);
    }) || [];

    this.searchResults = matches.slice(0, 20);
    this.renderTopicGrid(this.searchResults);
  }

  /**
   * Filter by category
   */
  filterByCategory(category) {
    if (category === 'all') {
      this.showPopularTopics();
      return;
    }

    const matches = this.torreyData?.topics?.filter(t => t.category === category) || [];
    this.renderTopicGrid(matches.slice(0, 20));
  }

  /**
   * Show popular/featured topics on initial load
   */
  showPopularTopics() {
    // Pick some popular theological topics
    const popularNames = [
      'Grace', 'Faith', 'Prayer', 'Love', 'Salvation', 'Hope',
      'Righteousness', 'Mercy', 'Peace', 'Joy', 'Wisdom', 'Truth'
    ];

    const popular = this.torreyData?.topics?.filter(t => 
      popularNames.some(p => t.topic?.toLowerCase().includes(p.toLowerCase()))
    ).slice(0, 12) || [];

    if (popular.length === 0 && this.torreyData?.topics) {
      // Fallback to first 12 topics
      this.renderTopicGrid(this.torreyData.topics.slice(0, 12));
    } else {
      this.renderTopicGrid(popular);
    }
  }

  /**
   * Render the topic grid with orbital cards
   */
  renderTopicGrid(topics) {
    const grid = this.container?.querySelector('#topicGrid');
    if (!grid) return;

    if (!topics || topics.length === 0) {
      grid.innerHTML = '<div class="no-results">No topics found. Try a different search.</div>';
      return;
    }

    grid.innerHTML = topics.map(topic => this.renderOrbitalCard(topic)).join('');
    
    // Show grid, hide detail
    this.showGrid();
  }

  /**
   * Render a single orbital topic card
   */
  renderOrbitalCard(topic) {
    const subtopicCount = topic.subtopics?.length || 0;
    const verseCount = topic.verseRefs?.length || 0;
    const relatedCount = topic.relatedTopics?.length || 0;
    
    // Generate orbiting satellites for subtopics (max 6 visible)
    const satellites = (topic.subtopics || []).slice(0, 6).map((sub, i) => {
      const angle = (i * 60) - 90; // Distribute around the ring
      return `<span class="orbital-satellite" style="--angle: ${angle}deg" title="${sub}">${sub.charAt(0)}</span>`;
    }).join('');

    // Related topics as small connected dots
    const connections = (topic.relatedTopics || []).slice(0, 3).map((rel, i) => {
      return `<span class="orbital-connection" style="--conn-index: ${i}">${rel}</span>`;
    }).join('');

    return `
      <article class="orbital-topic-card" data-topic="${this.escapeHtml(topic.topic)}">
        <div class="orbital-ring">
          <div class="ring-glow"></div>
          <div class="ring-inner">
            <span class="topic-name">${this.escapeHtml(topic.topic)}</span>
          </div>
          <div class="orbital-satellites">
            ${satellites}
          </div>
        </div>
        <div class="card-footer">
          <span class="verse-badge" title="${verseCount} verse references">
            📖 ${verseCount}
          </span>
          ${subtopicCount > 6 ? `<span class="more-badge">+${subtopicCount - 6} more</span>` : ''}
        </div>
        ${connections ? `<div class="orbital-connections">${connections}</div>` : ''}
      </article>
    `;
  }

  /**
   * Select a topic and show detail panel
   */
  selectTopic(topicName) {
    const topic = this.torreyData?.topics?.find(t => t.topic === topicName);
    if (!topic) return;

    this.currentTopic = topic;
    this.renderDetailPanel(topic);
    this.showDetail();
  }

  /**
   * Render the detail panel for a selected topic
   */
  renderDetailPanel(topic) {
    const titleEl = this.container?.querySelector('#detailTopicTitle');
    const contentEl = this.container?.querySelector('#topicDetailContent');
    
    if (titleEl) titleEl.textContent = topic.topic;
    if (!contentEl) return;

    const subtopicsHtml = topic.subtopics?.length ? `
      <div class="detail-section">
        <h4>📋 Subtopics</h4>
        <div class="subtopic-list">
          ${topic.subtopics.map(s => `<span class="subtopic-chip">${this.escapeHtml(s)}</span>`).join('')}
        </div>
      </div>
    ` : '';

    const versesHtml = topic.verseRefs?.length ? `
      <div class="detail-section">
        <h4>📖 Scripture References (${topic.verseRefs.length})</h4>
        <div class="verse-grid">
          ${topic.verseRefs.slice(0, 30).map(ref => `
            <button class="verse-ref-btn" data-ref="${this.escapeHtml(ref)}">${this.escapeHtml(ref)}</button>
          `).join('')}
          ${topic.verseRefs.length > 30 ? `<span class="more-verses">+${topic.verseRefs.length - 30} more</span>` : ''}
        </div>
      </div>
    ` : '';

    const relatedHtml = topic.relatedTopics?.length ? `
      <div class="detail-section">
        <h4>🔗 Related Topics</h4>
        <div class="related-list">
          ${topic.relatedTopics.map(r => `
            <button class="related-topic-btn" data-topic="${this.escapeHtml(r)}">${this.escapeHtml(r)}</button>
          `).join('')}
        </div>
      </div>
    ` : '';

    contentEl.innerHTML = `
      <div class="detail-orbital-display">
        <div class="large-orbital-ring">
          <div class="ring-glow"></div>
          <div class="ring-center">
            <span class="big-topic-name">${this.escapeHtml(topic.topic)}</span>
            <span class="verse-count">${topic.verseRefs?.length || 0} verses</span>
          </div>
        </div>
      </div>
      ${subtopicsHtml}
      ${versesHtml}
      ${relatedHtml}
    `;

    // Bind verse click handlers
    contentEl.querySelectorAll('.verse-ref-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        this.navigateToVerse(ref);
      });
    });

    // Bind related topic click handlers
    contentEl.querySelectorAll('.related-topic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const topicName = btn.dataset.topic;
        this.selectTopic(topicName);
      });
    });
  }

  /**
   * Navigate to a verse reference
   */
  navigateToVerse(ref) {
    console.log('📖 Navigating to:', ref);
    
    // Clean up the reference format
    const cleanRef = ref.replace(/\s*:\s*/g, ':').replace(/\s+/g, ' ').trim();
    
    // Dispatch event for app.js to handle
    document.dispatchEvent(new CustomEvent('topicExplorer:selectVerse', {
      detail: { reference: cleanRef, topic: this.currentTopic?.topic }
    }));

    // Close the explorer
    this.close();
  }

  /**
   * Show the grid view
   */
  showGrid() {
    const grid = this.container?.querySelector('.topic-grid-section');
    const detail = this.container?.querySelector('#topicDetailPanel');
    
    if (grid) grid.classList.remove('hidden');
    if (detail) detail.classList.add('hidden');
  }

  /**
   * Show the detail view
   */
  showDetail() {
    const grid = this.container?.querySelector('.topic-grid-section');
    const detail = this.container?.querySelector('#topicDetailPanel');
    
    if (grid) grid.classList.add('hidden');
    if (detail) detail.classList.remove('hidden');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// Singleton instance
let orbitalTopicExplorer = null;

export function getOrbitalTopicExplorer() {
  if (!orbitalTopicExplorer) {
    orbitalTopicExplorer = new OrbitalTopicExplorer();
  }
  return orbitalTopicExplorer;
}

export default OrbitalTopicExplorer;
