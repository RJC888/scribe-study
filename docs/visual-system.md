# Scribe Study – Visual Exploration System (Tier 2 Visual Modules)

## 1. Carousel of Visual Iterations

- Each **visual module** should support:
  - Forward (`▶`) and back (`◀`) arrows.
  - The user scrolls through **multiple visual iterations** for the same:
    - Passage / text,
    - Prompt (e.g., Devotional vs Academic),
    - Genre (e.g., Narrative, Prophecy, Poetry).
- Behind the scenes, each "slide" is:
  - A different **visual representation** of the same underlying analysis:
    - Mindmap, timeline, comparison grid, layered annotations, etc.
  - There should be ~15–18 potential display patterns, but:
    - Each prompt + genre combo only surfaces a **curated subset**.

---

## 2. Background Ranking / Filtering of Visualizations

- A **background process** evaluates:
  - The passage text,
  - The user's chosen prompt (Devotional / Academic / Teaching, etc.),
  - The detected **genre** (from the Genre Engine).
- It then:
  - Scores available visualization types by **fit**.
  - Prioritizes certain visual filters for each genre:
    - e.g., Historical narrative → timelines, character maps, cause–effect chains.
    - Prophecy / apocalyptic → symbol charts, intertextual links, layered structures.
    - Poetry → parallelism arcs, stanza structure, imagery clustering.
  - Some visuals may be **genre-agnostic** but still ranked lower or higher per prompt.

- We also intentionally:
  - Keep a few "wildcard" visuals in the carousel, even if they're not obvious fits.
  - This allows for occasional **surprising but insightful** visualizations.

---

## 3. Visual Categories & Tier 2 Integration

- Visuals are grouped into **Tier 2 categories**, for example:
  - **Structure-Centered**: outline trees, mindmaps, flowcharts.
  - **Timeline-Centered**: sequences, story arcs, redemptive history lines.
  - **Comparison-Centered**: contrast tables, OT/NT echo diagrams, before/after.
  - **Symbolic / Thematic**: icons, color layers, motif tracing.
  - **Chiasm**: layout that shows bars moving horizontally to illustrate big picture, minor points and the center (if there is one)  

- For each **genre**, we:
  - Map which Tier 2 categories tend to shine.
  - Store those mappings so the engine can:
    - Auto-prioritize categories per passage.
    - Customize the carousel ordering.

---

## 4. Interaction & Layout Requirements

- Some visuals are **static** (no user interaction).
- Others are **interactive**, with:
  - Collapsible / expandable branches (e.g., mindmaps, nested lists).
  - Hover or tap tooltips for deeper detail.
  - Click-to-expand sub-sections.

- Therefore, the UI must support:
  - **Dynamic resizing** of the visualization area:
    - The user can expand/shrink the visual pane.
    - Visuals should reflow or zoom appropriately.
  - A responsive **zoom control** specific to visuals (not just text font size):
    - Zoom in/out without breaking the layout.
  - Enough space for:
    - Deeply nested branches,
    - Wide "stretched" diagrams,
    - And still keeping the rest of the app usable.

---

## 5. Core User Story

> "Given a passage, a genre, and a chosen prompt (Devotional, Academic, Teaching, etc.),  
> Scribe Study should present a **carousel of the best-fitting visualizations**,  
> curated and ranked by genre + prompt + text,  
> with forward/back arrows to explore multiple iterations,  
> including some wildcard visuals that may reveal surprising insights.  
> Interactive visuals must support expand/collapse and zoom, with a layout that resizes gracefully."

---

## 6. Genre-to-Visualization Mapping

### Old Testament Narrative (Historical Books)
**Primary Tier 2 Categories:**
- **Timeline-Centered**: Redemptive history arcs, character timelines, cause-effect chains
- **Structure-Centered**: Outline trees showing parallel structures, covenant patterns
- **Comparison-Centered**: OT foreshadowing to NT fulfillment, cyclical patterns
- **Symbolic / Thematic**: Motif tracking across passages, redemptive themes

**Example Visualizations:**
1. **Timeline**: Events, characters, cause-effect sequences
2. **Character Map**: Relationships, development arcs, roles
3. **Covenant Arc**: Progression of God's covenants
4. **Redemptive History Line**: Placement within larger biblical narrative
5. **Chiastical Structure**: Parallel elements showing literary symmetry

### Old Testament Poetry (Psalms, Wisdom)
**Primary Tier 2 Categories:**
- **Structure-Centered**: Stanza structure, parallelism arcs, chiasm layouts
- **Symbolic / Thematic**: Imagery clustering, metaphor mapping, emotional arcs
- **Comparison-Centered**: Parallels within the psalm, echoes in other psalms

**Example Visualizations:**
1. **Parallelism Arc**: Visual representation of synonymous, antithetic, and synthetic parallelism
2. **Stanza Structure**: Layout showing organizational patterns
3. **Imagery Clustering**: Metaphors and symbols grouped by theme
4. **Emotional Arc**: Progression of mood/tone throughout the passage
5. **Chiasm Map**: Visual showing the center point and mirrored sections

### Old Testament Prophecy (Isaiah, Jeremiah, etc.)
**Primary Tier 2 Categories:**
- **Comparison-Centered**: Intertextual links, typological connections
- **Structure-Centered**: Nested prophecies, layers of fulfillment
- **Symbolic / Thematic**: Symbol charts, apocalyptic imagery mapping
- **Timeline-Centered**: Fulfillment timelines, historical-eschatological progression

**Example Visualizations:**
1. **Symbol Chart**: Recurring symbols and their meanings
2. **Fulfillment Timeline**: Layers of prophecy and fulfillment
3. **Intertextual Links**: Connections to other biblical passages
4. **Nested Structure**: How inner prophecies relate to outer frame
5. **Apocalyptic Imagery Map**: Organization of symbolic language

---

## 7. Implementation Roadmap

### Phase 1: Foundation
- [ ] Create `VisualizationEngine.js` to handle carousel logic and ranking
- [ ] Create genre detection utilities
- [ ] Build `VisualizationCarousel` component with nav buttons

### Phase 2: Core Visualizations
- [ ] Enhance `OMindmap.js` for collapsible/expandable nodes
- [ ] Implement `TimelineVisualizer.js`
- [ ] Implement `CharacterMapVisualizer.js`
- [ ] Implement `ParallelismArcVisualizer.js`

### Phase 3: Ranking & Filtering
- [ ] Implement visualization scoring logic based on genre + prompt
- [ ] Create mappings for genre-to-visualization associations
- [ ] Integrate wildcard selection logic

### Phase 4: Polish & Optimization
- [ ] Add zoom and pan controls
- [ ] Optimize rendering for large datasets
- [ ] Add tooltips and expanded detail views
- [ ] Test responsive behavior on various screen sizes

---

## 8. Data Structure for Visualizations

Each visualization receives a context object:
```javascript
{
  passage: {
    ref: "1 Samuel 17",
    text: "...",
    version: "NIV"
  },
  genre: "historical-narrative",
  prompt: "devotional",
  analysis: {
    // Genre-specific analysis
    // e.g., characters, events, themes, parallelisms, etc.
  }
}
```

The visualization engine uses this to determine which visualizations to render and in what order.
