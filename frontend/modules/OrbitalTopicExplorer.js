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
   * Render inline version for embedding in Analysis tab (no modal/backdrop)
   */
  renderInline() {
    return `
      <div class="orbital-topic-inline">
        <!-- Search Bar -->
        <div class="inline-topic-header">
          <div class="inline-search-bar">
            <input 
              type="text" 
              id="inlineTopicSearchInput" 
              placeholder="🔍 Search topics... (Grace, Faith, Prayer)"
              autocomplete="off"
            />
          </div>
          <div class="category-pills">
            <button class="category-pill active" data-category="all">All</button>
            <button class="category-pill" data-category="Doctrines">Doctrines</button>
            <button class="category-pill" data-category="Persons">Persons</button>
            <button class="category-pill" data-category="Places">Places</button>
          </div>
        </div>

        <!-- Topic Grid - 2 per row -->
        <div id="inlineTopicGrid" class="inline-topic-grid">
          <!-- Cards will render here -->
          <div class="loading-message">Loading topics...</div>
        </div>

        <!-- Detail Panel (hidden until topic selected) -->
        <div id="inlineTopicDetail" class="inline-topic-detail hidden">
          <div class="detail-header">
            <button class="back-btn" id="inlineBackToGrid">← Back to Topics</button>
            <h3 id="inlineDetailTitle">Topic Name</h3>
          </div>
          <div id="inlineDetailContent" class="detail-content">
            <!-- Selected topic verses will show here -->
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize inline version with event bindings
   */
  initInline(container) {
    this.container = container;
    this.isInline = true;
    
    // Search input
    const searchInput = container.querySelector('#inlineTopicSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleInlineSearch(e.target.value));
    }

    // Category pills
    container.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.filterInlineByCategory(e.target.dataset.category);
      });
    });

    // Back button
    const backBtn = container.querySelector('#inlineBackToGrid');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.showInlineGrid());
    }

    // Topic card clicks
    const grid = container.querySelector('#inlineTopicGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        // Handle View All click - loads ALL verses into Scripture pane
        const viewAllBtn = e.target.closest('.view-all-btn');
        if (viewAllBtn) {
          e.stopPropagation(); // Prevent card click
          this.loadAllVersesForTopic(viewAllBtn.dataset.topic);
          return;
        }
        
        // Handle individual verse chip click
        const verseChip = e.target.closest('.verse-chip');
        if (verseChip) {
          e.stopPropagation();
          this.loadVerseInScripturePane(verseChip.dataset.ref);
          return;
        }
        
        // Handle card click (topic detail view)
        const card = e.target.closest('.orbital-topic-card');
        if (card) {
          this.selectInlineTopic(card.dataset.topic);
        }
      });
    }

    // Load initial topics
    this.showInlinePopularTopics();
  }

  handleInlineSearch(query) {
    const lower = query.toLowerCase().trim();
    if (!lower || lower.length < 2) {
      this.showInlinePopularTopics();
      return;
    }

    const matches = this.torreyData?.topics?.filter(topic => {
      const name = (topic.name || topic.topic || '').toLowerCase();
      const description = (topic.description || '').toLowerCase();
      return name.includes(lower) || description.includes(lower);
    }) || [];

    console.log('[TopicalExplorer] Search results for', query, ':', matches.length);
    this.renderInlineGrid(matches.slice(0, 10));
  }

  filterInlineByCategory(category) {
    console.log('[TopicalExplorer] Filtering by category:', category);
    if (category === 'all') {
      this.showInlinePopularTopics();
      return;
    }
    const matches = this.torreyData?.topics?.filter(t => t.category === category) || [];
    console.log('[TopicalExplorer] Found', matches.length, 'topics in category', category);
    this.renderInlineGrid(matches.slice(0, 10));
  }

  showInlinePopularTopics() {
    const popularNames = ['Grace', 'Faith', 'Love', 'Prayer', 'Salvation', 'Jesus Christ', 'Hope', 'Mercy'];
    const popular = popularNames
      .map(name => this.torreyData?.topics?.find(t => t.name === name))
      .filter(Boolean);
    
    console.log('[TopicalExplorer] Popular topics found:', popular.length);
    
    if (popular.length === 0 && this.torreyData?.topics?.length) {
      console.log('[TopicalExplorer] Using first 8 topics instead');
      this.renderInlineGrid(this.torreyData.topics.slice(0, 8));
    } else {
      this.renderInlineGrid(popular);
    }
  }

  renderInlineGrid(topics) {
    const grid = this.container?.querySelector('#inlineTopicGrid');
    if (!grid) return;

    if (!topics.length) {
      grid.innerHTML = '<div class="empty-state">No topics found. Try a different search.</div>';
      return;
    }

    grid.innerHTML = topics.map(topic => this.renderInlineCard(topic)).join('');
    this.showInlineGrid();
  }

  renderInlineCard(topic) {
    const topicName = topic.name || topic.topic || 'Unknown';
    const verseCount = topic.count || topic.verses?.length || topic.verseRefs?.length || 0;
    const previewVerses = (topic.verses || topic.verseRefs || []).slice(0, 3);
    const description = topic.description || '';
    const category = topic.category || 'Doctrines';
    
    // Color based on category
    const categoryColors = {
      'Doctrines': '#3b82f6',
      'Persons': '#8b5cf6', 
      'Places': '#10b981',
      'default': '#6366f1'
    };
    const ringColor = categoryColors[category] || categoryColors.default;
    
    return `
      <article class="orbital-topic-card inline-card" data-topic="${this.escapeHtml(topicName)}">
        <div class="inline-card-header">
          <div class="orbital-ring-visual" style="--ring-color: ${ringColor};">
            <div class="ring-outer"></div>
            <div class="ring-inner"></div>
            <div class="ring-core">
              <span class="topic-initial">${topicName.charAt(0)}</span>
            </div>
            <div class="orbit-dot dot-1"></div>
            <div class="orbit-dot dot-2"></div>
            <div class="orbit-dot dot-3"></div>
          </div>
          <div class="topic-info">
            <h4 class="topic-name">${this.escapeHtml(topicName)}</h4>
            <span class="verse-count">📖 ${verseCount} verses</span>
            <span class="topic-category">${category}</span>
          </div>
        </div>
        <p class="topic-description">${this.escapeHtml(description)}</p>
        <div class="inline-card-body">
          <div class="verse-preview">
            ${previewVerses.map(v => `<span class="verse-chip" data-ref="${v}">${v}</span>`).join('')}
          </div>
          ${verseCount > 3 ? `<button class="view-all-btn" data-topic="${this.escapeHtml(topicName)}">View All ${verseCount} →</button>` : ''}
        </div>
      </article>
    `;
  }

  selectInlineTopic(topicName) {
    const topic = this.torreyData?.topics?.find(t => (t.name || t.topic) === topicName);
    if (!topic) {
      console.warn('[TopicalExplorer] Topic not found:', topicName);
      return;
    }

    console.log('[TopicalExplorer] Selected topic:', topic);
    this.currentTopic = topic;
    this.renderInlineDetail(topic);
    this.showInlineDetail();
  }

  renderInlineDetail(topic) {
    const titleEl = this.container?.querySelector('#inlineDetailTitle');
    const contentEl = this.container?.querySelector('#inlineDetailContent');
    const topicName = topic.name || topic.topic || 'Topic';
    
    if (titleEl) titleEl.textContent = `🌌 ${topicName}`;
    if (!contentEl) return;

    const verses = topic.verses || topic.verseRefs || [];
    const verseCount = topic.count || verses.length;
    contentEl.innerHTML = `
      <div class="topic-description">
        ${topic.description || `Explore ${verseCount} verses about ${topicName}.`}
      </div>
      <div class="verses-list">
        <h4>📖 Scripture References (${verses.length})</h4>
        <div class="verse-buttons">
          ${verses.map(v => `
            <button class="verse-ref-btn" data-ref="${v}">${v}</button>
          `).join('')}
        </div>
      </div>
    `;

    // Bind verse clicks to load scripture
    contentEl.querySelectorAll('.verse-ref-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadVerseInScripturePane(btn.dataset.ref);
      });
    });
  }

  loadVerseInScripturePane(reference) {
    console.log('📖 Loading verse in Scripture pane:', reference);
    
    // Update main app state
    if (window.AppState) {
      window.AppState.currentPassage = reference;
    }
    
    // Update passage input
    const passageInput = document.getElementById('passageInput');
    if (passageInput) {
      passageInput.value = reference;
    }

    // Update pinned passage display
    const pinnedPassageRef = document.getElementById('pinnedPassageRef');
    if (pinnedPassageRef) {
      pinnedPassageRef.textContent = reference;
    }

    // Directly load scripture into the main panel
    const fullPassageText = document.getElementById('fullPassageText');
    if (fullPassageText) {
      fullPassageText.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">⏳ Loading Scripture...</div>';
      
      // Use async IIFE to load
      (async () => {
        try {
          const { fetchAndDisplayScripture } = await import('../analysisEngine.js');
          if (fetchAndDisplayScripture) {
            await fetchAndDisplayScripture(reference, fullPassageText);
            console.log('[TopicalExplorer] ✅ Scripture loaded:', reference);
          }
        } catch (importError) {
          console.warn('[TopicalExplorer] Could not import analysisEngine, trying API directly');
          try {
            const resp = await fetch(`/api/scripture/${encodeURIComponent(reference)}`);
            if (resp.ok) {
              const data = await resp.json();
              fullPassageText.innerHTML = data.text || `<p>${reference}</p>`;
            } else {
              fullPassageText.innerHTML = `<p>Could not load ${reference}</p>`;
            }
          } catch (e) {
            fullPassageText.innerHTML = `<p>Error loading scripture: ${e.message}</p>`;
          }
        }
      })();
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('topicExplorer:selectVerse', {
      detail: { reference }
    }));
  }

  /**
   * Load ALL verses for a topic into the Scripture Display pane
   */
  async loadAllVersesForTopic(topicName) {
    console.log('📖 Loading ALL verses for topic:', topicName);
    
    const topic = this.torreyData?.topics?.find(t => (t.name || t.topic) === topicName);
    if (!topic) {
      console.warn('[TopicalExplorer] Topic not found:', topicName);
      return;
    }

    const verses = topic.verses || topic.verseRefs || [];
    const verseCount = verses.length;
    
    console.log(`[TopicalExplorer] Loading ${verseCount} verses for "${topicName}"`);

    // Update passage input to show topic name
    const passageInput = document.getElementById('passageInput');
    if (passageInput) {
      passageInput.value = `${topicName} (${verseCount} verses)`;
    }

    // Update pinned passage display
    const pinnedPassageRef = document.getElementById('pinnedPassageRef');
    if (pinnedPassageRef) {
      pinnedPassageRef.textContent = `Topic: ${topicName}`;
    }

    // Get the scripture display pane
    const fullPassageText = document.getElementById('fullPassageText');
    if (!fullPassageText) {
      console.error('[TopicalExplorer] Scripture display pane not found');
      return;
    }

    // Show loading state with topic header
    fullPassageText.innerHTML = `
      <div class="topic-scripture-header">
        <h3 class="topic-title">📚 ${this.escapeHtml(topicName)}</h3>
        <p class="topic-subtitle">${verseCount} Scripture References</p>
        ${topic.description ? `<p class="topic-desc">${this.escapeHtml(topic.description)}</p>` : ''}
      </div>
      <div class="topic-verses-list">
        <div style="padding: 20px; text-align: center; color: #666;">⏳ Loading scriptures...</div>
      </div>
    `;

    // Load all verses using the existing fetchAndDisplayScripture
    await this.loadMultipleVerses(verses, fullPassageText, topicName, topic.description);
  }

  /**
   * Batch load multiple verses using existing API
   */
  async loadMultipleVerses(verses, container, topicName, topicDescription = '') {
    try {
      const { fetchAndDisplayScripture } = await import('../analysisEngine.js');
      
      // Create array to hold all results
      const results = [];
      const batchSize = 3; // Process 3 at a time
      
      // Update UI with verse list first (showing loading states)
      const renderProgress = (loadedCount) => {
        container.innerHTML = `
          <div class="topic-scripture-header">
            <h3 class="topic-title">📚 ${this.escapeHtml(topicName)}</h3>
            <p class="topic-subtitle">${verses.length} Scripture References ${loadedCount < verses.length ? `(Loading ${loadedCount}/${verses.length}...)` : '✓ Complete'}</p>
            ${topicDescription ? `<p class="topic-desc">${this.escapeHtml(topicDescription)}</p>` : ''}
          </div>
          <div class="topic-verses-list">
            ${results.map((v, idx) => `
              <div class="topic-verse-item ${v.success ? '' : 'verse-not-loaded'}">
                <span class="verse-number">${idx + 1}</span>
                <div class="verse-content">
                  <strong class="verse-ref" data-ref="${v.reference}">${v.reference}</strong>
                  ${v.text ? `<div class="verse-text">${v.text}</div>` : '<p class="verse-text verse-placeholder">Click reference to load</p>'}
                </div>
              </div>
            `).join('')}
            ${loadedCount < verses.length ? `
              <div class="verses-loading-more">
                <div style="padding: 12px; color: #666; font-style: italic; text-align: center;">
                  ⏳ Loading verse ${loadedCount + 1} of ${verses.length}...
                </div>
              </div>
            ` : ''}
          </div>
        `;
        
        // Re-bind click handlers
        container.querySelectorAll('.verse-ref').forEach(ref => {
          ref.addEventListener('click', () => {
            this.loadVerseInScripturePane(ref.dataset.ref);
          });
        });
      };

      // Process verses in batches
      for (let i = 0; i < verses.length; i += batchSize) {
        const batch = verses.slice(i, i + batchSize);
        
        // Fetch each verse in the batch
        const batchPromises = batch.map(async (ref) => {
          try {
            // Create temp container to fetch the verse
            const tempContainer = document.createElement('div');
            await fetchAndDisplayScripture(ref, tempContainer);
            
            // Extract text from temp container
            const text = tempContainer.innerHTML;
            return { reference: ref, text: text, success: true };
          } catch (e) {
            console.warn(`[TopicalExplorer] Failed to fetch ${ref}:`, e.message);
            return { reference: ref, text: '', success: false };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Update display with progress
        renderProgress(results.length);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < verses.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`[TopicalExplorer] ✅ Loaded ${results.length} verses for "${topicName}"`);
      
    } catch (e) {
      console.error('[TopicalExplorer] Error loading multiple verses:', e);
      container.innerHTML = `
        <div class="topic-scripture-header">
          <h3 class="topic-title">📚 ${this.escapeHtml(topicName)}</h3>
          <p class="topic-subtitle">${verses.length} Scripture References</p>
        </div>
        <div class="topic-verses-list">
          <div class="verses-note">⚠️ Error loading verses. Click individual references below to load.</div>
          ${verses.map((v, idx) => `
            <div class="topic-verse-item verse-not-loaded">
              <span class="verse-number">${idx + 1}</span>
              <div class="verse-content">
                <strong class="verse-ref" data-ref="${v}">${v}</strong>
                <p class="verse-text verse-placeholder">Click reference to load</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Bind click handlers
      container.querySelectorAll('.verse-ref').forEach(ref => {
        ref.addEventListener('click', () => {
          this.loadVerseInScripturePane(ref.dataset.ref);
        });
      });
    }
  }

  showInlineGrid() {
    const grid = this.container?.querySelector('#inlineTopicGrid');
    const detail = this.container?.querySelector('#inlineTopicDetail');
    if (grid) grid.classList.remove('hidden');
    if (detail) detail.classList.add('hidden');
  }

  showInlineDetail() {
    const grid = this.container?.querySelector('#inlineTopicGrid');
    const detail = this.container?.querySelector('#inlineTopicDetail');
    if (grid) grid.classList.add('hidden');
    if (detail) detail.classList.remove('hidden');
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
