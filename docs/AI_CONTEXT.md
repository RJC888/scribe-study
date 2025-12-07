# AI Context - Scribe Study

> Last Updated: December 7, 2025

## Project Overview

**Scribe Study** is a Bible study web application that provides:
- Scripture reading with multiple Bible versions (KJV, NET, ASV, Hebrew, Greek)
- AI-powered analysis using Groq API (llama-3.3-70b-versatile model)
- Topical exploration via Torrey's Topical Textbook data
- Scripture navigation with book/chapter/pericope hierarchy
- Dark mode support throughout

The app is designed for deep Bible study with both devotional and academic analysis modes.

---

## Directory Structure

```
scribe-study/
├── backend/
│   ├── server.js          # Express server - API routes, Groq integration
│   └── package.json
├── frontend/
│   ├── index.html         # Main HTML entry point
│   ├── app.js             # Main application logic, event handlers
│   ├── analysisEngine.js  # Scripture fetching, AI analysis
│   ├── formattingEngine.js
│   ├── ui-layout.js
│   ├── modules/
│   │   ├── OrbitalTopicExplorer.js  # Topical Explorer with orbital UI
│   │   ├── ScriptureExplorer.js     # Scripture hierarchy navigation
│   │   ├── ScriptureHierarchy.js    # Pericope/division data
│   │   ├── DLAnalysisPanel.js       # Analysis panel component
│   │   ├── ReflectionModal.js
│   │   └── OMindmap.js
│   ├── styles/
│   │   ├── orbital-topics.css       # Topical Explorer styles
│   │   ├── dl-panel.css             # Analysis panel styles
│   │   ├── analysis.css
│   │   ├── module-mindmap.css
│   │   └── reflection-modal.css
│   ├── analysis/
│   │   └── analysisConfig.js
│   └── prototype/                   # Earlier prototype version
├── prompts/
│   ├── advanced-grammar.txt
│   └── grammar-essentials.txt
├── tests/
│   ├── smoke.spec.js
│   ├── scripture.spec.js
│   ├── analysis.spec.js
│   └── ui.spec.js
├── docs/
│   └── AI_CONTEXT.md               # This file
├── package.json
├── Playwright.config.js
├── vercel.json
└── *.md files                      # Documentation
```

---

## Architecture Summary

### Frontend (Vanilla JS + ES6 Modules)
- **No framework** - Pure JavaScript with ES6 module imports
- **CSS Variables** for theming and dark mode
- **Event-driven** architecture using CustomEvents for inter-component communication
- **Dynamic imports** for lazy loading modules

### Backend (Node.js + Express)
- **Port 3000** - Serves static frontend files
- **API Routes**:
  - `POST /api/analyze` - Groq AI analysis
  - `GET /api/health` - Health check
  - `GET /api/prompt-config/:mode/:subtab` - Prompt registry
- **Rate limiting** - 100 requests per 15 minutes

### Data Sources
- **Bible Text**: CDN API (cdn.jsdelivr.net/gh/wldeh/bible-api) for KJV, ASV, etc.
- **NET Bible**: labs.bible.org API
- **Topical Data**: `chapter-outlines-torrey.json` (Torrey's Topical Textbook)
- **Pericope Data**: `ScriptureHierarchy.js` module

---

## Current Tasks

### ✅ Completed (PINNED: `pinned-topical-explorer-orbital-animations`)
- Dark mode with proper contrast
- Tab navigation (Analysis/Scripture Explorer/Topical Explorer)
- Topical Explorer with animated orbital ring graphics
- Favorites system with stars
- Scripture auto-load with debounce
- Individual verse loading from topic cards

### 🔄 In Progress
- **"View All X" button** - Load ALL verses for a topic into Scripture Display pane
  - Currently loads verses progressively (3 at a time)
  - User requested: Load 12-20 at a time, include verse text inline

### 📋 Pending
- Scripture Explorer pericope navigation (divisions → pericopes → verses)
- Local Bible text storage (avoid external API calls)

---

## Key Design Decisions

1. **No Framework**: Vanilla JS chosen for simplicity and direct DOM control
2. **Module Pattern**: ES6 modules with dynamic imports for code splitting
3. **Dark Mode**: CSS class-based (`body.dark-mode`) with localStorage persistence
4. **Event System**: CustomEvents for loose coupling between components
   - `passage:changed` - When user enters a new passage
   - `topicExplorer:selectVerse` - When verse selected in topic explorer
5. **Orbital UI**: Animated rings with orbiting dots for visual appeal in Topical Explorer
6. **Progressive Loading**: Batch API calls to avoid rate limiting

---

## Technologies in Use

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Backend server |
| **Vanilla JavaScript** | Frontend logic |
| **CSS3** | Styling, animations, dark mode |
| **Groq API** | AI analysis (llama-3.3-70b-versatile) |
| **Bible APIs** | Scripture text (wldeh/bible-api, labs.bible.org) |
| **Playwright** | E2E testing |
| **Vercel** | Deployment target |
| **Git** | Version control |

---

## Outstanding Issues

### High Priority
1. **Scripture Explorer not showing pericopes** - Click handlers for chapter divisions may not be wired correctly
2. **View All loading speed** - Currently fetches from external API; user wants local Bible text

### Medium Priority
3. **Verse text storage** - Need local copies of Bible versions (KJV, ASV, NET) to avoid API latency
4. **Rate limiting** - External Bible APIs may throttle heavy usage

### Low Priority
5. **Mobile responsiveness** - Needs testing on smaller screens
6. **Offline support** - Service worker for offline Bible reading

---

## Git Recovery

If something breaks, restore the working pinned version:
```bash
git checkout pinned-topical-explorer-orbital-animations
```

---

## Quick Start Commands

```bash
# Start development server
cd scribe-study
npm run dev

# Server runs at http://localhost:3000

# Run tests
npm test
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `frontend/app.js` | Main entry, event handlers, tab switching |
| `frontend/analysisEngine.js` | `fetchAndDisplayScripture()`, AI calls |
| `frontend/modules/OrbitalTopicExplorer.js` | Topical navigation UI |
| `frontend/modules/ScriptureExplorer.js` | Book/chapter/pericope navigation |
| `frontend/styles/orbital-topics.css` | Orbital ring animations |
| `backend/server.js` | Express routes, Groq API proxy |
| `chapter-outlines-torrey.json` | Topical textbook data (if exists) |
