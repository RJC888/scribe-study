# Scripture Fetch Feature Documentation

## Overview
The Scripture Fetch feature allows users to quickly load Bible passages directly from the Scripture panel using the **ENTER key**.

## Features

### 1. **ENTER Key Scripture Loading**
- Type a Bible passage reference in the "Passage Input" field
- Press **ENTER** to fetch and display the Scripture text immediately
- No need to click an analysis button to see the Scripture text
- The Scripture will appear in the "Scripture Panel" with language options

### 2. **Multi-Version Bible Support**
- Supports multiple Bible translations (KJV, NRSV, WEB, etc.)
- Uses the free **Bible API** (no API key required)
- Default version: King James Version (KJV)

### 3. **Supported Passage Formats**
The parser handles these formats:
- **Single verse**: `John 3:16`, `Genesis 1:1`, `Matthew 5:7`
- **Multi-word books**: `1 Corinthians 13:4`, `2 Timothy 2:15`, `1 John 4:8`
- **Verse ranges** (starts with first verse): `John 3:16-18`, `Romans 12:1-2`
- **Old Testament books**: `Isaiah 40:31`, `Psalm 23:1`

### 4. **Language Toggle**
- **Original Languages Button**: Toggle between English and original language text
- Future enhancement: Will display Hebrew (Old Testament) and Greek (New Testament)
- Current API limitation: Free Bible API has limited original language support
- For production use, consider integrating with paid APIs like `api.bible` or academic APIs

## Technical Implementation

### Code Changes

#### 1. **app.js** - Passage Input Handler
```javascript
async function initializePassageInput() {
  const passageInput = document.getElementById("passageInput");
  
  // Import analysis engine to access fetchAndDisplayScripture
  const { fetchAndDisplayScripture } = await import('./analysisEngine.js');
  
  // Listen for ENTER key
  passageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const passage = AppState.currentPassage;
      
      // Fetch Scripture independently
      const fullPassageText = document.getElementById('fullPassageText');
      if (fullPassageText) {
        fullPassageText.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">⏳ Loading Scripture...</div>';
        fetchAndDisplayScripture(passage, fullPassageText);
      }
      
      // Focus first module tab for analysis
      const firstTab = document.querySelector(".module-tab");
      if (firstTab) firstTab.focus();
    }
  });
}
```

#### 2. **analysisEngine.js** - Exported Scripture Functions
- `fetchAndDisplayScripture(passage, container)` - Exported function to fetch Scripture
- `parsePassageReference(passage)` - Parses references like "John 3:16" into components
- `displayScriptureWithToggle(passage, englishText, originalText, container, apiVersion)` - Renders Scripture with language toggle

### Bible API Reference
- **Provider**: https://github.com/wldeh/bible-api
- **Free tier**: Yes (no API key required)
- **Versions available**: 200+ Bible translations
- **URL format**: `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/{version}/books/{book}/chapters/{chapter}/verses/{verse}.json`

## How to Use

1. **Type a passage reference** in the "Passage Input" field at the top
2. **Press ENTER** - Scripture text will appear in the Scripture Panel
3. **Toggle language** using the "🔤 Original Languages" button
4. **Run analysis** on the Scripture using the module tabs

## Error Handling

- **Invalid passage format**: Error message shows "Could not parse passage"
- **No API data**: Falls back to chapter-level data or displays error
- **Network error**: Shows error message with troubleshooting hint

## Future Enhancements

### 1. **Hebrew/Greek Text Integration**
- Integrate with academic APIs (e.g., Tyndale House, OpenText.org)
- Display original text with transliteration
- Add parsing of Hebrew/Greek grammar

### 2. **Extended Passage Support**
- Full verse ranges: `John 3:16-4:5`
- Book ranges: `Matthew 1:1 - Mark 1:1`
- Passage sets: `John 3:16; Romans 6:23`

### 3. **Performance Optimization**
- Cache fetched passages
- Lazy load large passages
- Pre-fetch popular passages

### 4. **Version Switching**
- Add dropdown to select Bible version before ENTER
- Save user's preferred version to localStorage
- Show version in Scripture display

## Dependencies

- **Bible API**: Free, external CDN
- **fetch API**: Built-in browser API
- **ES6 modules**: For import/export functionality

## Testing

### Manual Test Steps:
1. Open the application at `http://localhost:3000`
2. Type "John 3:16" in the Passage Input field
3. Press ENTER key
4. Verify Scripture appears in the Scripture Panel
5. Click "🔤 Original Languages" to toggle
6. Try different passage formats (e.g., "1 Corinthians 13:4")
7. Run analysis on fetched Scripture

### Test Passages:
- `John 3:16` - Single verse
- `Genesis 1:1` - OT verse  
- `1 Corinthians 13:4-7` - Verse range
- `Psalm 23:1` - Psalm
- `Revelation 22:20` - Last verse in Bible

## Configuration

### Version Mapping (analysisEngine.js)
```javascript
const versionMap = {
  'kjv': 'en-kjv',      // King James Version
  'nrsv': 'en-nrsv',    // New Revised Standard Version
  'web': 'en-web',      // World English Bible
  'asv': 'en-asv',      // American Standard Version
  // ... more versions
};
```

To add new versions, add entries to `versionMap` and install corresponding Bible API versions.

## Known Limitations

1. **Free Bible API**: Limited to available versions (no paid APIs like NIV)
2. **Original Languages**: Hebrew/Greek text requires separate API integration
3. **Range Queries**: Currently only fetches first verse of a range
4. **No Interlinear**: Original language interlinear view not available

## Support & Troubleshooting

### "Bible API returned 404"
- Passage format not recognized by Bible API
- Try different passage format (e.g., "1 John" instead of "I John")

### "Could not parse passage"
- Book name not recognized
- Use full book names: "1 Corinthians" not "1 Cor"

### "Loading Scripture..." hangs
- Network connectivity issue
- Bible API CDN may be down
- Check browser console for detailed error message

## References

- Bible API GitHub: https://github.com/wldeh/bible-api
- Available versions: https://github.com/wldeh/bible-api/tree/main/bibles
- API examples: https://github.com/wldeh/bible-api?tab=readme-ov-file#example-usage
