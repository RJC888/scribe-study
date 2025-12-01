# Plan: Fix Main Layout CSS for 2-Panel Scripture/Analysis + Collapsible Notes

## Objective
Restore the working 2-panel layout (Scripture left, Analysis right, collapsible Notes bottom) with modern light theme, keeping the intentional panel design intact.

## Problem Identified
Your main `index.html` has the correct HTML structure for the 2-panel layout, but `styles.css` is missing critical responsive sizing rules. The CSS defines classes for expanding/minimizing panels but lacks proper `height`, `width`, and flex constraints needed for the layout to render fully across the viewport. Content is currently scrunching into the upper left quarter of the screen.

## Solution Approach
Correct `frontend/styles.css` to render the 2-panel layout properly without structural changes to HTML or JavaScript.

## Implementation Steps

### 1. Fix Viewport/Container Sizing
- Ensure `body` has `height: 100%` and `overflow: hidden`
- Ensure `#mainShell` has `height: calc(100vh - 88px)` (accounting for header ~50px + tabs ~38px)
- Ensure `#workspace` has `height: 100%` and `overflow: hidden`
- Ensure `#mainPanel` has `height: 100%`

### 2. Correct `#topPanels` Flex Layout
- Add explicit `min-height: 0` to `#topPanels` (critical for flex children to shrink below content size)
- Ensure `#topPanels` has `flex: 1` to fill available space
- Ensure `#topPanels` has `overflow: hidden`

### 3. Fix Panel Content Scrolling
- Ensure both `.panel` elements (Scripture and Analysis) have `flex: 1`
- Ensure `#scriptureContent` and `#analysisContent` have:
  - `flex: 1`
  - `overflow-y: auto`
  - `overflow-x: hidden`
  - `padding: 6px`
- Prevent `.panelHeader` from shrinking: `flex-shrink: 0`

### 4. Verify Notes Panel Dimensions
- Set `#notesBar` height to fixed value (e.g., `height: 40px`)
- Set `#notesPanel` height to fixed value when visible (e.g., `height: 160px`)
- Ensure `#notesPanel.hidden` uses `display: none`
- Ensure notes don't interfere with top panels

### 5. Validate `.hidden` Class Consistency
- Confirm all `.hidden` classes use `display: none !important`
- Apply to: `#welcomePanel`, `#notesPanel`, `#visualizationMode`, `#helpPopup`, `#passageDrawer`

### 6. Test Browser Rendering
- Load `http://localhost:3000`
- Verify all 4 areas visible and properly sized:
  - Header (fixed, ~50px)
  - Main tabs (fixed, ~38px)
  - Top panels split 50/50 (Scripture left, Analysis right)
  - Notes bar at bottom (collapsible)
- Test panel expand buttons toggle correctly
- Test notes panel slide in/out smoothly
- Verify no content squishing or overflow

## Files to Modify

### Primary
- `frontend/styles.css` — Complete CSS rewrite with proper flex constraints

### Verify (No changes needed unless bugs found)
- `frontend/index.html` — Structure is correct
- `frontend/ui-layout.js` — Toggle logic is correct

### Preserve (No changes)
- `frontend/styles.backup.css` — Archive earthy theme
- `frontend/prototype/` — Keep as reference

## Key CSS Constraints

```
body
  ├─ overflow: hidden
  ├─ height: 100%
  │
  ├─ #topBar (fixed ~50px)
  ├─ #mainTabs (fixed ~38px)
  └─ #mainShell
      ├─ display: flex
      ├─ flex-direction: column
      ├─ height: calc(100vh - 88px)
      ├─ overflow: hidden
      │
      └─ #workspace
          ├─ display: flex
          ├─ flex-direction: column
          ├─ height: 100%
          ├─ overflow: hidden
          │
          ├─ #topPanels
          │   ├─ display: flex
          │   ├─ flex: 1
          │   ├─ min-height: 0 (CRITICAL)
          │   ├─ overflow: hidden
          │   │
          │   ├─ #scripturePanel.panel
          │   │   ├─ display: flex
          │   │   ├─ flex-direction: column
          │   │   ├─ flex: 1
          │   │   ├─ overflow: hidden
          │   │   │
          │   │   ├─ .panelHeader (flex-shrink: 0)
          │   │   └─ #scriptureContent
          │   │       ├─ flex: 1
          │   │       ├─ overflow-y: auto
          │   │
          │   └─ #analysisPanel.panel
          │       ├─ display: flex
          │       ├─ flex-direction: column
          │       ├─ flex: 1
          │       ├─ overflow: hidden
          │       │
          │       ├─ .panelHeader (flex-shrink: 0)
          │       └─ #analysisContent
          │           ├─ flex: 1
          │           ├─ overflow-y: auto
          │
          ├─ #notesBar
          │   ├─ height: 40px (fixed)
          │   ├─ flex-shrink: 0
          │
          └─ #notesPanel
              ├─ height: 160px (when visible)
              ├─ display: flex
              ├─ flex-direction: column
              ├─ flex-shrink: 0
              │
              ├─ .panelHeader (flex-shrink: 0)
              └─ #notesContent
                  ├─ flex: 1
                  ├─ overflow-y: auto
```

## Success Criteria

✓ Header visible at top  
✓ Main tabs visible below header  
✓ Scripture and Analysis panels side-by-side, 50/50 split  
✓ Both panels fill available space (not scrunched)  
✓ Notes bar visible at bottom (collapsible)  
✓ Panel expand buttons toggle between 70/30 and 30/70 splits  
✓ Notes panel slides in when "Study Notes ↑" clicked  
✓ Notes panel slides out when "↓ Collapse" clicked  
✓ Scrollable content within panels (overflow-y: auto)  
✓ No layout shifts or jumping  
✓ Modern light theme applies consistently  

## Decisions Made

1. **Color theme:** Modern light (current `styles.css` intent)
2. **Layout design:** Keep 2-panel Scripture/Analysis with collapsible bottom Notes
3. **Prototype:** Not used; focus on main `index.html` + corrected CSS
4. **Structural changes:** CSS-only, no HTML/JS modifications

## Next Steps After Fix

Once layout is rendering correctly:
1. Layer in AI analysis calls via `/api/analyze` endpoint
2. Connect Scripture passage display to backend
3. Wire up module/analysis selection logic
4. Add visualization components (Tier 2 mode)
5. Connect notes textarea to storage
6. Refine UI styling and interactions
