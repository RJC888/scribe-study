# 🎨 Dynamic Meditation Visualization – Test Guide

## What Was Built

Created a dynamic meditation visualization system that generates beautiful, interactive Scripture meditation visualizations for ANY passage based on the Psalm 23 model. The system:

1. **Uses Psalm 23 as the Template**: The visualization mimics the beautiful Psalm 23 meditation structure with meditation cards, themes, and spiritual insights
2. **Works with Any Scripture**: Takes any passage (John 3:16, Romans 8:1, 1 Corinthians 13, etc.) and generates appropriate meditation cards
3. **AI-Powered**: Uses backend AI to analyze the passage and extract spiritual themes, key concepts, and meditation prompts
4. **Full-Screen Display**: Displays in Tier 2 fullscreen mode with proper exit/return workflow

## How It Works

### Flow Diagram
```
User selects passage → Runs Devotional/Spiritual Analysis
    ↓
User clicks "Open Fullscreen Visualization" button
    ↓
System loads passage text + calls AI backend with meditation prompt
    ↓
Backend returns JSON with meditation cards, themes, and prompts
    ↓
Frontend renders beautiful HTML meditation visualization
    ↓
User can scroll, interact with cards, then exit to return to workspace
```

### Key Components

#### 1. **meditationGenerator.js** (`frontend/visualizations/meditationGenerator.js`)
- `generateMeditationVisualization()` – Main export function
- `generateMeditationDataFromBackend()` – Calls backend API with meditation prompt
- `createMeditationHTML()` – Generates styled HTML from meditation data
- `createFallbackHTML()` – Fallback visualization if JSON generation fails

#### 2. **Visualization Prompt** (`promptRegistry.js`)
```javascript
VISUALIZATION_PROMPTS['devotional-spiritual-analysis'] = {
  meditationTemplate: `[Structured prompt that requests JSON output]`
}
```

The prompt:
- Requests ONLY JSON output (no surrounding text)
- Instructs AI to generate 4-6 meditation cards with emojis, themes, descriptions
- Asks for meditation prompt and devotional subtitle
- References Psalm 23 as tone model

#### 3. **Visualization Mode** (`app.js`)
- `initializeVisualizationMode()` – Sets up visualization button handlers
- `generateAndDisplayVisualization()` – Generates visualization on demand
- `fetchScriptureTextForVisualization()` – Gets passage text from cache or API

#### 4. **HTML Structure** (`index.html`)
```html
<button id="enterVisualizationModeBtn">Open Fullscreen Visualization</button>
<section id="visualizationMode" class="hidden">
  <div id="visualizationCanvas"><!-- Generated HTML inserted here --></div>
  <button id="exitVisualizationBtn">Exit Visualization</button>
</section>
```

## Testing Instructions

### Prerequisites
- Backend server running: `npm start` in `/backend` folder
- App loaded at `http://localhost:3000`

### Test Scenario 1: Psalm 23 (Poetry/Comfort Theme)
1. In the Scripture input, enter: `Psalm 23` or `Psalm 23:1-6`
2. Click **"Devotional"** module tab
3. Click **"Spiritual Analysis"** subtab
4. Click either **"📝 Dig In"** or **"🔍 Deep Dive"** button
5. Wait for analysis to complete
6. Look for the **"Open Fullscreen Visualization"** button at the bottom
7. Click it → Should see beautiful Psalm 23 meditation visualization with:
   - Title: "Psalm 23"
   - Subtitle: Something like "A meditation on God's shepherding care"
   - 4-6 meditation cards with themes like shepherd, green pastures, restoration, etc.
   - Full passage displayed with verse numbers
   - Meditation prompt for reflection
8. Click **"Exit Visualization"** → Returns to main workspace

### Test Scenario 2: John 3:16 (Gospel Salvation Theme)
1. Enter: `John 3:16`
2. Click **"Devotional"** → **"Spiritual Analysis"**
3. Click a depth button (📝 or 🔍)
4. Wait for analysis
5. Click **"Open Fullscreen Visualization"**
6. Should generate meditation visualization with themes related to:
   - God's love (John 3:16 theme)
   - Redemption/salvation
   - Belief and faith
   - Eternal life
7. Exit and verify you're back in workspace

### Test Scenario 3: Romans 8:1 (Assurance/Freedom Theme)
1. Enter: `Romans 8:1` or `Romans 8:1-4`
2. Run Devotional/Spiritual Analysis
3. Open visualization
4. Should see themes related to:
   - Freedom from condemnation
   - Grace/assurance
   - Spirit-led living
   - Victory in Christ

### Test Scenario 4: Error Handling
1. Enter a very short passage: `John 1:1`
2. Run analysis and try visualization
3. System should still generate something (or fallback gracefully)
4. Verify error messages are user-friendly

### Test Scenario 5: Navigation Flow
1. Run an analysis
2. Click Visualization button → Goes fullscreen
3. Click Exit → Returns to analysis view
4. Click different module/subtab → Workspace returns to normal
5. Click Visualization again with different passage → Should regenerate with new passage

## Expected Output Example

For Psalm 23, you should see something like:

```
┌─────────────────────────────────────────────┐
│            Psalm 23                         │
│   A meditation on God's shepherding care   │
├─────────────────────────────────────────────┤
│  [🐑 Card] [🛤️ Card] [⛅ Card] [🍽️ Card]  │
│  The        Green     The       Table      │
│  Shepherd   Pastures  Valley    Before     │
│                                 Enemies    │
├─────────────────────────────────────────────┤
│            Full Passage                     │
│  1. The LORD is my shepherd...             │
│  2. He maketh me to lie down...            │
│  ... (all verses)                          │
├─────────────────────────────────────────────┤
│  💭 Meditation Prompt:                     │
│  Which aspect of God's shepherding care   │
│  speaks most deeply to your heart today?  │
└─────────────────────────────────────────────┘
```

## Features Demonstrated

✅ **Dynamic Generation**: Works with any passage, not hardcoded
✅ **AI Integration**: Uses backend to generate contextual meditation cards
✅ **Beautiful Design**: Psalm 23 styling applied to any passage
✅ **JSON Parsing**: Robust extraction of structured AI responses
✅ **Fallback Handling**: Graceful degradation if AI generation fails
✅ **Full-Screen UI**: Proper Tier 2 fullscreen mode integration
✅ **Return Navigation**: Can exit and return to workspace

## Architecture Notes

### Data Flow
```javascript
User Input (Passage) 
  → fetchScriptureTextForVisualization() 
  → generateMeditationVisualization() 
  → generateMeditationDataFromBackend() 
  → Backend AI (meditation prompt)
  → JSON Response 
  → createMeditationHTML() 
  → Display in visualizationCanvas
```

### Styling
- Uses Google Fonts: Merriweather + Cormorant Garamond (matches Psalm 23)
- Card colors: 6 theme colors (comfort, guidance, protection, restoration, faithfulness, hope)
- Responsive design for mobile/tablet
- Smooth transitions and hover effects

### Error Recovery
1. If JSON parsing fails → Extract JSON via regex
2. If extraction fails → Return null data → Use fallback structure
3. If API call fails → Return just the passage reference
4. All errors logged to console for debugging

## Future Enhancements

1. **Different Visualization Types**: 
   - Timeline for narrative passages
   - Character maps for Gospels
   - Parallelism visualization for poetry
   - Symbol charts for prophecy

2. **Export Options**:
   - Export as PDF meditation guide
   - Save to notes
   - Print-friendly version

3. **Interactivity**:
   - Click cards to expand with full commentary
   - Voice-guided meditation narration
   - Save custom meditations

4. **Caching**:
   - Cache generated visualizations locally
   - Reuse for same passage in multiple sessions

5. **Customization**:
   - User-selected color themes
   - Font size adjustments
   - Dark mode support
