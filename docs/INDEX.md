# Scribe Study Visualization System - Master Index

Welcome! Here's your complete guide to the new visualization system.

## 📍 Start Here

### For Immediate Testing
→ **[VISUALIZATIONS-README.md](./VISUALIZATIONS-README.md)**
- Overview of what's been built
- Quick start instructions
- How to run the demo

### For Understanding How It Works
→ **[VISUALIZATIONS-QUICK-START.md](./docs/VISUALIZATIONS-QUICK-START.md)**
- Visual diagrams of each visualization type
- Example user flows
- Feature overview

### For Architecture & Integration
→ **[VISUALIZATIONS-IMPLEMENTATION.md](./docs/VISUALIZATIONS-IMPLEMENTATION.md)**
- Complete technical architecture
- How to integrate into app.js
- Phase 2 roadmap

### For OT-Specific Guidance
→ **[OT-VISUALIZATIONS-GUIDE.md](./docs/OT-VISUALIZATIONS-GUIDE.md)**
- Which visualizations work best for each OT passage type
- Examples with visual structures
- Quick reference tables

### For Complete Requirements
→ **[visual-system.md](./docs/visual-system.md)**
- Full specification document
- All requirements and design decisions
- Data structure specifications

---

## 🎨 The 4 Core Visualizations

### 1. ⏳ Timeline Visualizer
**File:** `frontend/visualizations/TimelineVisualizer.js`

Shows event sequences and narrative progression.

**Best for:** Historical narratives (1 Samuel, Genesis, Exodus)

**What it shows:**
- Setup → Inciting Incident → Rising Action → Climax → Resolution
- Each event is expandable for more detail
- Visual timeline with dots and connecting lines

---

### 2. 👥 Character Map Visualizer
**File:** `frontend/visualizations/CharacterMapVisualizer.js`

Displays character relationships and development arcs.

**Best for:** Multi-character stories

**What it shows:**
- Character cards with traits and roles
- Relationships between characters
- Development arcs
- Click to expand for detailed relationships

---

### 3. 🔄 Parallelism Visualizer
**File:** `frontend/visualizations/ParallelismVisualizer.js`

Shows Hebrew poetic structures.

**Best for:** Psalms, wisdom literature, poetry

**What it shows:**
- Synonymous parallelism (green)
- Antithetic parallelism (orange)
- Synthetic parallelism (blue)
- Expandable explanations for each pair

---

### 4. 🔺 Chiasm Visualizer
**File:** `frontend/visualizations/ChiasmVisualizer.js`

Displays mirrored/ABBA structures.

**Best for:** Deeply structured passages, psalms with mirroring

**What it shows:**
- A → B → CENTER (highlighted) → B' → A'
- Nested indentation showing depth
- Color-coded by level
- Expandable elements for detail

---

## ⚙️ The Engine

### VisualizationEngine.js
**File:** `frontend/visualizations/VisualizationEngine.js`

The orchestrator that:
- Detects passage genre
- Ranks visualizations by fit
- Manages carousel navigation
- Scores based on genre + prompt

**Key methods:**
- `generateCarousel(context)` - Creates ranked list of visualizations
- `renderCurrent(container, context)` - Renders current visualization
- `next()` / `prev()` - Navigate carousel
- `getCarouselInfo()` - Get current position info

---

## 🌐 The Demo

### Demo Page
**File:** `frontend/demo-visualizations.html`

A standalone page for testing visualizations without the main app.

**How to use:**
1. Start backend: `cd backend && npm start`
2. Open: `http://localhost:3000/demo-visualizations.html`
3. Select a passage
4. Click "Next ▶" to explore visualizations
5. Click "+" to expand sections

**Sample passages:**
- 1 Samuel 17 (Historical narrative)
- Psalm 23 (Poetry)
- Isaiah 53 (Prophecy)

---

## 🎯 Genre Mapping

The system automatically matches passage types to best visualizations:

| Passage Type | Primary Visualizations | Secondary | Best Answers |
|---|---|---|---|
| Historical Narrative | Timeline, Character Map, Mindmap | Chiasm, Parallelism | "What happened? In what order?" |
| Poetry | Parallelism, Chiasm, Mindmap | Image Cluster | "How does structure create meaning?" |
| Prophecy | Symbol Chart, Chiasm, Mindmap | Intertextual Links | "What symbols? What connections?" |
| Wisdom | Parallelism, Contrast Table, Mindmap | Chiasm, Image Cluster | "What contrasts and connections?" |
| Law/Covenant | Structure Outline, Comparison Grid | Timeline, Mindmap | "What's required? Promised?" |

---

## 🚀 Quick Integration

To use in your app:

```javascript
import VisualizationEngine from "./visualizations/VisualizationEngine.js";

// When a passage is loaded
const context = {
  passage: { ref: "Psalm 23", text: "...", version: "NIV" },
  genre: "poetry",        // Auto-detected if omitted
  prompt: "devotional"
};

// Generate carousel
await VisualizationEngine.generateCarousel(context);

// Render first visualization
VisualizationEngine.renderCurrent(
  document.getElementById("viz-container"),
  context
);

// Handle navigation
document.getElementById("next-btn").onclick = () => {
  VisualizationEngine.next();
  VisualizationEngine.renderCurrent(container, context);
};
```

---

## 📁 File Structure

```
scribe-study/
├── frontend/
│   ├── visualizations/                    ← All visualization code
│   │   ├── TimelineVisualizer.js
│   │   ├── CharacterMapVisualizer.js
│   │   ├── ParallelismVisualizer.js
│   │   ├── ChiasmVisualizer.js
│   │   ├── VisualizationEngine.js
│   │   └── VisualizationDemo.js
│   ├── styles/
│   │   └── visualizations.css             ← All styling
│   ├── demo-visualizations.html           ← Standalone demo
│   └── index.html                         ← Updated with stylesheet
│
├── docs/
│   ├── visual-system.md                   ← Full spec
│   ├── VISUALIZATIONS-QUICK-START.md      ← Visual guide
│   ├── VISUALIZATIONS-IMPLEMENTATION.md   ← Architecture
│   ├── OT-VISUALIZATIONS-GUIDE.md         ← OT mapping
│   └── VISUALIZATIONS-README.md           ← Main README
│
└── VISUALIZATIONS-README.md               ← Root level README
```

---

## 📚 Documentation Map

| Document | Purpose | Best For | Read Time |
|---|---|---|---|
| VISUALIZATIONS-README.md | Overview & quick start | Getting started | 5 min |
| VISUALIZATIONS-QUICK-START.md | Visual guide with examples | Understanding features | 10 min |
| VISUALIZATIONS-IMPLEMENTATION.md | Full architecture | Integration & Phase 2 | 15 min |
| OT-VISUALIZATIONS-GUIDE.md | Passage type matching | Learning OT application | 15 min |
| visual-system.md | Complete specification | Requirements review | 20 min |

---

## 🔄 Interactive Features

### Expand/Collapse
All visualizations support expanding sections:
- Click `+` button to expand
- Click `−` button to collapse
- Reduces clutter while enabling exploration

### Carousel Navigation
- Click `◀ Previous` to go back
- Click `Next ▶` to advance
- Shows current position (e.g., "2 / 5")
- Disabled buttons when at start/end

### Responsive Design
- Works on desktop, tablet, mobile
- Touch-friendly buttons
- Adapts layout to screen size
- Readable on all devices

---

## 🛠️ Customization

### Change Visualization Rankings
Edit `genrePreferences` in `VisualizationEngine.js`:

```javascript
genrePreferences['poetry'].primary = ['chiasm', 'parallelism'];
```

### Adjust Prompt Boosters
Modify prompt-based scoring:

```javascript
promptBoosters['teaching'].timeline = 2.0;  // Double for teaching
```

### Add New Visualization
1. Create `YourVisualizer.js` with `render()` method
2. Register in `VisualizationEngine.js`
3. Add to `genrePreferences`
4. (Optional) Add styling to `visualizations.css`

---

## ✨ Phase 1 Complete (Now Available)

✅ Timeline Visualizer  
✅ Character Map Visualizer  
✅ Parallelism Visualizer  
✅ Chiasm Visualizer  
✅ VisualizationEngine with ranking  
✅ Genre detection  
✅ Interactive carousel  
✅ Responsive styling  
✅ Complete documentation  
✅ Demo page  

---

## 🔮 Phase 2 (Ready to Implement)

🔄 Symbol Chart (prophecy passages)  
🔄 Image Cluster (poetry/metaphor mapping)  
🔄 Contrast Table (wisdom literature)  
🔄 Intertextual Links (OT/NT connections)  
🔄 Structure Outline (law passages)  
🔄 Comparison Grid (covenant analysis)  
🔄 Timeline (layered/covenantal variant)  

---

## 🎓 Learning Path

1. **Start:** Read VISUALIZATIONS-README.md (5 min)
2. **Explore:** Try the demo page (10 min)
3. **Understand:** Read VISUALIZATIONS-QUICK-START.md (10 min)
4. **Deep Dive:** Read VISUALIZATIONS-IMPLEMENTATION.md (15 min)
5. **Customize:** Review OT-VISUALIZATIONS-GUIDE.md (15 min)
6. **Code:** Check `frontend/visualizations/*.js` (30 min)

**Total learning time: ~85 minutes**

---

## ❓ Common Questions

**Q: How do I test the visualizations?**
A: Open `http://localhost:3000/demo-visualizations.html` in your browser.

**Q: Can I use just one visualization type?**
A: Yes, each visualizer works standalone. Just instantiate it directly.

**Q: How do I customize the ranking?**
A: Edit `genrePreferences` in `VisualizationEngine.js`.

**Q: How do I add a new visualization?**
A: Create a new `YourVisualizer.js` file following the existing pattern.

**Q: Will this work on mobile?**
A: Yes! All visualizations are fully responsive and touch-friendly.

**Q: Are there external dependencies?**
A: No! The system uses vanilla JavaScript and CSS only.

---

## 🎉 Ready to Begin

Everything is set up and ready to:
✅ Demo at `http://localhost:3000/demo-visualizations.html`  
✅ Review the architecture in documentation  
✅ Integrate into your main app  
✅ Test with real passages  
✅ Plan Phase 2 extensions  

Enjoy exploring! 🎨✨

---

**Last Updated:** November 30, 2025  
**Version:** 1.0 (Phase 1 Complete)  
**Status:** Ready for Testing & Integration
