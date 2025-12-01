# Quick Start: Visualization System

## 🎯 What You Now Have

A complete **interactive visualization carousel system** for Old Testament (and other) passages with:

### 4 Core Visualization Types

#### 1. **Timeline Visualizer** ⏳
Shows narrative progression with expandable events.

**Best for:**
- Historical narratives (1 Samuel, 1 Kings, Genesis, Exodus)
- Character-driven stories
- Event sequences

**Visual Structure:**
```
🔵 Setup
    ├─ [Opening context]
    
🔵 Inciting Incident
    ├─ [Main conflict emerges]
    
🔵 Rising Action
    ├─ [Events build tension]
    
🔵 Climax
    ├─ [Turning point]
    
🔵 Resolution
    ├─ [Aftermath & conclusion]
```

---

#### 2. **Character Map Visualizer** 👥
Shows character relationships, traits, and development arcs.

**Best for:**
- Multi-character narratives
- Character studies
- Relationship mapping

**Visual Structure:**
```
┌──────────────────┐    ┌──────────────────┐
│  Primary Char    │    │  Supporting Char │
│  • Traits        │──→ │  • Traits        │
│  • Arc           │    │  • Arc           │
└──────────────────┘    └──────────────────┘
         ↑                        ↓
┌──────────────────────────────────┐
│     Antagonist / Obstacle        │
│     • Traits                     │
│     • Arc                        │
└──────────────────────────────────┘
```

---

#### 3. **Parallelism Visualizer** 🔄
Shows Hebrew poetic structure (synonymous, antithetic, synthetic).

**Best for:**
- Psalms
- Wisdom literature (Proverbs, Ecclesiastes)
- Poetic passages

**Visual Structure:**
```
┌─ SYNONYMOUS PARALLELISM
│  Line A: First line expressing the main idea
│  ═══════════════════════════════════════════
│  Line B: Second line reinforcing with similar meaning
│
├─ ANTITHETIC PARALLELISM
│  Line A: Statement of one perspective
│  ═══════════════════════════════════════════
│  Line B: Contrasting statement with opposite view
│
└─ SYNTHETIC PARALLELISM
   Line A: Initial thought or image
   ═══════════════════════════════════════════
   Line B: Building upon or extending the thought
```

---

#### 4. **Chiasm Visualizer** 🔺
Shows mirrored/ABBA literary structures (A → B → CENTER → B' → A').

**Best for:**
- Deeply structured passages
- Psalms with mirroring
- Prophecy with nested structures

**Visual Structure:**
```
    ║ A    ← Outer theme
    ║ ╠════ B  ← Inner development
    ║ ║ ╠══ CENTER (Pivot)
    ║ ║ ╚══ B' ← Reflected inner
    ║ ╚════ A' ← Reflected outer theme
```

---

## 🚀 How to Test

### Option A: Standalone Demo (Recommended First Step)

1. Open your browser and go to:
   ```
   http://localhost:3000/demo-visualizations.html
   ```

2. Click a passage to load it:
   - **1 Samuel 17** (Historical Narrative)
   - **Psalm 23** (Poetry)
   - **Isaiah 53** (Prophecy)

3. Click **"Next ▶"** to navigate through different visualizations
4. Click **"+"** on any section to expand/collapse details

### Option B: Integrate into Main App

In your `app.js`:

```javascript
import VisualizationEngine from "./visualizations/VisualizationEngine.js";

// When user opens a passage:
const context = {
  passage: {
    ref: "Psalm 23",
    text: "The Lord is my shepherd...",
    version: "NIV"
  },
  genre: "poetry",  // Auto-detected if not provided
  prompt: "devotional"
};

// Generate carousel of best visualizations
await VisualizationEngine.generateCarousel(context);

// Render to a container
VisualizationEngine.renderCurrent(document.getElementById("visualization-container"), context);

// Handle navigation
document.getElementById("next-btn").addEventListener("click", () => {
  VisualizationEngine.next();
  VisualizationEngine.renderCurrent(container, context);
});
```

---

## 📊 How Genre Detection Works

The engine automatically ranks visualizations based on passage type:

### Historical Narrative (e.g., 1 Samuel 17)
**Primary (Shown First):**
1. ⏳ Timeline
2. 👥 Character Map
3. 🧠 Mindmap

**Secondary:**
4. 🔺 Chiasm
5. 🔄 Parallelism

**Wildcard (Occasional Surprise):**
- 🔣 Symbol Chart (if detected)

---

### Poetry (e.g., Psalm 23)
**Primary:**
1. 🔄 Parallelism
2. 🔺 Chiasm
3. 🧠 Mindmap

**Secondary:**
4. 🖼️ Image Cluster

**Wildcard:**
- ⏳ Timeline (surprising but might show theological progression)

---

### Prophecy (e.g., Isaiah 53)
**Primary:**
1. 🔣 Symbol Chart
2. 🔺 Chiasm
3. 🧠 Mindmap

**Secondary:**
4. 🔗 Intertextual Links (OT/NT connections)

**Wildcard:**
- 👥 Character Map (Servant, God, People)

---

## 🎨 Visual Features

All visualizations support:

✅ **Expandable/Collapsible** sections for exploring depth without clutter
✅ **Color-coded** elements (genre-specific visual cues)
✅ **Responsive Design** (works on mobile, tablet, desktop)
✅ **Hover Effects** for better interactivity
✅ **Keyboard Friendly** for accessibility
✅ **Smooth Transitions** between visualizations

---

## 📁 File Structure

```
frontend/
├── visualizations/                    ← All visualization code
│   ├── TimelineVisualizer.js          ← Event timeline
│   ├── CharacterMapVisualizer.js      ← Character relationships
│   ├── ParallelismVisualizer.js       ← Poetic parallelism
│   ├── ChiasmVisualizer.js            ← Mirror structures
│   ├── VisualizationEngine.js         ← Orchestrator & ranking
│   └── VisualizationDemo.js           ← Demo UI
│
├── styles/
│   └── visualizations.css             ← All styling
│
├── demo-visualizations.html           ← Standalone demo page
└── index.html                         ← (Updated with stylesheet)

docs/
├── visual-system.md                   ← Full specification
└── VISUALIZATIONS-IMPLEMENTATION.md   ← This implementation guide
```

---

## 🔮 Future Visualizations (Phase 2+)

Ready to implement when needed:

- **🔣 Symbol Chart**: Track recurring symbols and meanings (prophecy)
- **🖼️ Image Cluster**: Group metaphors and imagery by theme (poetry)
- **🔗 Intertextual Links**: Show OT/NT connections (prophecy/teaching)
- **📊 Comparison Grid**: Side-by-side passage comparisons
- **📈 Emotional Arc**: Visualize mood/tone progression

---

## 💡 Key Insights

1. **Each visualization is independent** — can be used standalone or in carousel
2. **Genre-aware ranking** — best visualizations surface first for each passage type
3. **Wildcard logic** — 40% chance of surprising visualization keeps exploration engaging
4. **Prompt-boosted** — devotional, academic, and teaching modes emphasize different visuals
5. **Scalable** — adding new visualization types requires only a new JS class + CSS

---

## 🎓 Example: How It Works for 1 Samuel 17

**User opens the passage:**
```
Input: 1 Samuel 17 (David vs. Goliath)
↓
VisualizationEngine.detectGenre("1 Samuel 17") → "historical-narrative"
↓
generateCarousel() scores visualizations:
  - Timeline        : 100/100 (primary for narrative)
  - CharacterMap   : 95/100  (2nd, shows David/Goliath/Saul)
  - Mindmap        : 90/100  (shows faith, courage, victory themes)
  - Chiasm         : 70/100  (secondary, might show structure)
  - Parallelism    : 65/100  (secondary, shows repetitions)
↓
Renders in order: Timeline → Character Map → Mindmap → Chiasm → Parallelism
↓
User clicks "Next ▶" to navigate through carousel
```

---

## 🤝 Next Steps

1. **Test the demo page**: `http://localhost:3000/demo-visualizations.html`
2. **Review the code**: Check `VisualizationEngine.js` to understand the architecture
3. **Integrate into app.js**: Import and use in your main application
4. **Customize if needed**: Add your own visualizations or adjust rankings
5. **Add Phase 2 visualizations** as needed (Symbol Chart, etc.)

---

## ❓ Questions?

- **How do I add a new visualization?** → Create a new `XyzVisualizer.js` class extending the pattern
- **Can I customize the carousel order?** → Yes, edit `genrePreferences` in `VisualizationEngine.js`
- **Can I use just one visualization type?** → Yes, each visualizer works standalone
- **Are visualizations dynamic?** → Currently using sample data; Phase 2 will extract from passage analysis

Enjoy exploring! 🎉
