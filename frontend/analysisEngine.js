// ========================================================
// ANALYSIS ENGINE
// Handles calling the backend API to get AI analysis
// ========================================================

import { PROMPT_REGISTRY } from './promptRegistry.js';

/**
 * Run analysis on a passage
 * @param {string} mode - e.g., 'devotional', 'academic'
 * @param {string} subtab - e.g., 'micro_units', 'syntax'
 * @param {string} passage - The Scripture passage text
 * @param {string} depth - 'dig-in' (executive summary) or 'deep-dive' (thorough analysis)
 * @returns {Promise<object>} Analysis result from backend
 */
export async function runAnalysis(mode, subtab, passage, depth = 'dig-in') {
  try {
    // DEBUG LOGGING
    console.log('🔍 runAnalysis called with:', { mode, subtab, passage, depth });

    // Validate inputs
    if (!mode || !subtab || !passage) {
      console.error('❌ Missing required inputs:', { mode, subtab, passage });
      return { error: 'Missing mode, subtab, or passage' };
    }

    // Get prompt configuration
    const promptConfig = PROMPT_REGISTRY[mode]?.[subtab];
    console.log('📋 Prompt config found:', !!promptConfig, promptConfig);
    
    if (!promptConfig) {
      console.error('❌ Unknown mode/subtab:', { mode, subtab });
      return { error: 'Unknown analysis type' };
    }

    // Adjust temperature and token limits based on depth
    let adjustedTemp = promptConfig.temperature;
    let adjustedTokens = promptConfig.maxTokens;
    let depthPrefix = '';

    if (depth === 'dig-in') {
      // Executive summary: lower temperature (more focused), fewer tokens
      adjustedTemp = Math.max(0.3, promptConfig.temperature - 0.2);
      adjustedTokens = Math.floor(promptConfig.maxTokens * 0.6);
      depthPrefix = 'Provide a brief executive summary with key points:\n\n';
    } else if (depth === 'deep-dive') {
      // Thorough analysis: higher temperature (more creative), more tokens
      adjustedTemp = Math.min(1.0, promptConfig.temperature + 0.2);
      adjustedTokens = Math.floor(promptConfig.maxTokens * 1.4);
      depthPrefix = 'Provide a thorough, detailed analysis:\n\n';
    }

    // Build the prompt with depth-specific instruction
    const customPrompt = `${depthPrefix}${promptConfig.description}\n\nAnalyze this passage:\n\n${passage}`;

    console.log('📝 Custom prompt:', customPrompt.substring(0, 100) + '...');
    console.log('🌡️ Temperature:', adjustedTemp, 'Tokens:', adjustedTokens);

    // Show loading indicator
    document.getElementById('analysisDisplay').innerHTML = '<p style="color: #999; text-align: center;">⏳ Analyzing passage...</p>';

    // Call backend API
    console.log('📡 Calling /api/analyze...');
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: customPrompt,
        passage: passage,
        moduleName: `${mode}-${subtab}`,
        temperature: adjustedTemp,
        maxTokens: adjustedTokens,
        depth: depth
      })
    });

    console.log('📨 Response status:', response.status, response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      document.getElementById('analysisDisplay').innerHTML = `<p style="color: red;">Error: ${errorData.error}</p>`;
      return { error: errorData.error };
    }

    const result = await response.json();

    console.log('✅ API Success:', result);

    if (!result.success) {
      console.error('❌ Analysis failed:', result);
      document.getElementById('analysisDisplay').innerHTML = `<p style="color: red;">Analysis failed</p>`;
      return result;
    }

    // Display the analysis
    displayAnalysis(result.analysis, mode, subtab, passage, depth);

    // Don't minimize Scripture panel - user may want to adjust passage
    // The Analysis panel will be visible regardless

    return result;

  } catch (error) {
    console.error('Analysis Engine Error:', error);
    document.getElementById('analysisDisplay').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    return { error: error.message };
  }
}

/**
 * Display analysis result in the UI
 */
function displayAnalysis(analysisText, mode, subtab, passage, depth = 'dig-in') {
  const container = document.getElementById('analysisDisplay');
  if (!container) return;

  // Clean up the analysis text:
  // 1. Remove "**Executive Summary:**" or "**Thorough Analysis:**" prefixes
  let cleanedText = analysisText
    .replace(/^\*\*Executive Summary:\*\*\s*/i, '')
    .replace(/^\*\*Thorough.*?Analysis:\*\*\s*/i, '')
    .replace(/^Provide a brief executive summary.*?\n\n/i, '')
    .replace(/^Provide a thorough.*?analysis.*?\n\n/i, '');
  
  // 2. Convert markdown formatting to HTML:
  //    - Replace **text** with <strong>text</strong>
  //    - Replace ***text*** with <strong>text</strong> (remove triple asterisks)
  cleanedText = cleanedText
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>')  // Triple asterisks
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')      // Double asterisks (bold)
    .replace(/\*(.*?)\*/g, '<em>$1</em>');                 // Single asterisks (italic)
  
  // 3. Convert bullet points to HTML list items
  const lines = cleanedText.split('\n');
  let htmlContent = '';
  let inList = false;
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('*')) {
      // Start or continue list
      if (!inList) {
        htmlContent += '<ul style="margin: 10px 0; padding-left: 20px;">';
        inList = true;
      }
      // Remove leading * and clean up
      const listItem = trimmed.replace(/^\*\s*/, '').trim();
      htmlContent += `<li style="margin: 6px 0;">${listItem}</li>`;
    } else if (trimmed.startsWith('-')) {
      // Also handle dashes as bullets
      if (!inList) {
        htmlContent += '<ul style="margin: 10px 0; padding-left: 20px;">';
        inList = true;
      }
      const listItem = trimmed.replace(/^-\s*/, '').trim();
      htmlContent += `<li style="margin: 6px 0;">${listItem}</li>`;
    } else {
      // Regular paragraph
      if (inList) {
        htmlContent += '</ul>';
        inList = false;
      }
      if (trimmed.length > 0) {
        htmlContent += `<p style="margin: 12px 0; line-height: 1.6;">${trimmed}</p>`;
      }
    }
  }
  
  if (inList) {
    htmlContent += '</ul>';
  }

  const depthLabel = depth === 'dig-in' ? '📝 Dig In (Summary)' : '🔍 Deep Dive (Thorough)';
  const subtabTitle = PROMPT_REGISTRY[mode]?.[subtab]?.title || subtab;

  // Format the analysis with basic styling
  const html = `
    <div class="analysis-result">
      <div class="analysis-header" style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1e1f22;">${subtabTitle}</h3>
        <p class="analysis-meta" style="margin: 0; font-size: 12px; color: #666;">
          <strong>Passage:</strong> ${passage}<br>
          <strong>Module:</strong> ${mode} → ${subtab}<br>
          <strong>Depth:</strong> ${depthLabel}
        </p>
      </div>
      <div class="analysis-content" style="line-height: 1.8; color: #222;">
        ${htmlContent}
      </div>
      <div class="analysis-actions" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <button class="copy-btn" onclick="copyAnalysisToNotes()" style="padding: 8px 12px; background: #3d6df6; color: white; border: none; border-radius: 4px; cursor: pointer;">📋 Copy to Notes</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
  
  // Also display the passage in the Scripture panel
  displayPassageInScripturePanel(passage);
}

/**
 * Copy analysis to notes textarea
 * Excludes the button and actions section
 */
window.copyAnalysisToNotes = function() {
  try {
    // Get the result container
    const resultContainer = document.querySelector('.analysis-result');
    if (!resultContainer) {
      console.error('❌ Analysis result container not found');
      return;
    }
    
    // Clone the container to manipulate without affecting the DOM
    const clone = resultContainer.cloneNode(true);
    
    // Remove the actions section (which contains the button)
    const actionsDiv = clone.querySelector('.analysis-actions');
    if (actionsDiv) {
      actionsDiv.remove();
    }
    
    // Get the clean text content
    const analysisText = clone.innerText.trim();
    
    const notesTextarea = document.getElementById('notesTextarea');
    
    if (notesTextarea) {
      notesTextarea.value += '\n---\n' + analysisText + '\n';
      
      // Show notes panel if hidden
      const notesPanel = document.getElementById('notesPanel');
      if (notesPanel && notesPanel.classList.contains('hidden')) {
        notesPanel.classList.remove('hidden');
      }
      
      // Scroll to notes panel
      notesPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      console.log('✅ Analysis copied to notes (button properly excluded)');
    }
  } catch (error) {
    console.error('❌ Error copying to notes:', error);
  }
};

/**
 * Display passage text in the Scripture panel with language toggle
 */
function displayPassageInScripturePanel(passage) {
  const pinnedPassageRef = document.getElementById('pinnedPassageRef');
  const fullPassageText = document.getElementById('fullPassageText');
  
  if (pinnedPassageRef) {
    pinnedPassageRef.textContent = passage;
  }
  
  if (fullPassageText) {
    // Show loading state
    fullPassageText.innerHTML = `
      <div style="padding: 12px; background: #f9f9fb; border-radius: 4px; color: #666;">
        <p><strong>${passage}</strong></p>
        <p style="font-style: italic; font-size: 13px; margin-top: 8px;">
          ⏳ Fetching Scripture text...
        </p>
      </div>
    `;
    
    // Fetch scripture asynchronously
    fetchAndDisplayScripture(passage, fullPassageText);
  }
}

/**
 * Fetch scripture from free Bible API and display with language toggle
 * Using: https://github.com/wldeh/bible-api (200+ versions, no API key needed)
 * Original languages: Hebrew OT (hbo-wlc) and Greek NT (grc-tcgnt)
 */

// Track ongoing fetch to cancel if a new one starts
let currentFetchController = null;

export async function fetchAndDisplayScripture(passage, container) {
  // Cancel any ongoing fetch
  if (currentFetchController) {
    currentFetchController.abort();
    currentFetchController = null;
  }
  
  // Create new abort controller for this fetch
  const controller = new AbortController();
  currentFetchController = controller;
  
  try {
    // Get current version from app state (default to kjv)
    const selectedVersion = window.AppState?.currentVersion || 'kjv';
    console.log('🔤 Using version:', selectedVersion);
    
    // Parse the passage reference
    const passageInfo = parsePassageReference(passage);
    if (!passageInfo) {
      throw new Error(`Could not parse passage: ${passage}`);
    }
    
    const { book, chapter, startVerse, endVerse } = passageInfo;
    let englishText = '';
    let versionLabel = '';
    let copyrightNotice = '';
    let originalText = '';
    
    // NET Bible and NET Bible with Notes use labs.bible.org API
    if (selectedVersion === 'net' || selectedVersion === 'net-notes') {
      const netPassage = `${book}+${chapter}:${startVerse}-${endVerse}`;
      const netUrl = `https://labs.bible.org/api/?passage=${netPassage}&type=json`;
      console.log('📡 Fetching from NET Bible API:', netUrl);
      
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(netUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`NET Bible API returned ${response.status}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        englishText = data.map(v => `${v.verse}. ${v.text}`).join('\n\n');
        // If user selected NET with Notes, fetch notes from backend
        if (selectedVersion === 'net-notes') {
          try {
            const notesResponse = await fetch('/api/net-notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ passage: `${book} ${chapter}:${startVerse}-${endVerse}` })
            });
            if (notesResponse.ok) {
              const notesData = await notesResponse.json();
              if (notesData.notes) {
                englishText += `\n\n[Study Notes]\n${notesData.notes}`;
              }
            }
          } catch (notesError) {
            console.log('ℹ️ NET notes not available:', notesError.message);
          }
        }
      } else {
        throw new Error('Invalid response from NET Bible API');
      }
      
      versionLabel = selectedVersion === 'net-notes' ? 'NET (w/ Notes)' : 'NET';
      copyrightNotice = `<p style="font-size: 10px; color: #666; margin-top: 12px; border-top: 1px solid #ddd; padding-top: 8px;">
        Scripture quoted by permission. Quotations designated (<a href="https://netbible.org" target="_blank" style="color: #0066cc;">NET</a>) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C.
      </p>`;
    } else if (selectedVersion === 'hebrew' || selectedVersion === 'greek') {
      // Original languages - display original text only
      originalText = await fetchOriginalLanguages(book, chapter, startVerse, endVerse, selectedVersion === 'hebrew' ? 'hebrew' : 'greek');
      englishText = originalText;
      versionLabel = selectedVersion === 'hebrew' ? 'Hebrew' : 'Koine Greek';
      copyrightNotice = '';
    } else {
      // Use wldeh Bible API for other versions
      // NOTE: Version Availability
      // - Free versions available via wldeh/bible-api: KJV, ASV, LSV, FBV, BSB, T4T, EMTV, RV, OJPS, Brenton Septuagint, TCENT
      // - Premium versions requiring API keys (future implementation):
      //   * ESV (English Standard Version) - requires ESV API key from esv.org
      //   * NIV (New International Version) - requires commercial license from Biblica
      //   * AMP (Amplified Bible) - requires license from Lockman Foundation
      //   * TLV (Tree of Life Version) - requires license from Destiny Image
      //   * NET Study Edition - text available from labs.bible.org (no API key), but study notes only in desktop app/subscription
      
      const versionMap = {
        'kjv': 'en-kjv',      // King James Version
        'asv': 'en-asv',      // American Standard Version
        'lsv': 'en-lsv',      // Literal Standard Version
        'fbv': 'en-fbv',      // Free Bible Version
        'bsb': 'en-bsb',      // Berean Study Bible
        't4t': 'en-t4t',      // Translation for Translators
        'emtv': 'en-US-emtv', // English Majority Text Version
        'rv': 'en-rv',        // Revised Version 1885
        'ojps': 'en-ojps',    // Old JPS TaNaKH 1917
        'engbrent': 'en-engbrent', // Brenton English Septuagint
        'tcent': 'en-tcent',  // Text-Critical English New Testament
      };
      
      const apiVersion = versionMap[selectedVersion] || 'en-kjv';
      versionLabel = selectedVersion.toUpperCase();
      
      const chapterUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${apiVersion}/books/${book}/chapters/${chapter}.json?t=${Date.now()}`;
      console.log('📡 Fetching chapter from Bible API:', chapterUrl);
      console.log('🔢 Looking for verses from', startVerse, 'to', endVerse);
      
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const chapterResponse = await fetch(chapterUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!chapterResponse.ok) {
        throw new Error(`Bible API returned ${chapterResponse.status}`);
      }
      
      const chapterData = await chapterResponse.json();
      
      if (chapterData.data && Array.isArray(chapterData.data)) {
        console.log('📦 Got', chapterData.data.length, 'total verses from API');
        const seenVerses = new Set();
        const requestedVerses = chapterData.data.filter(v => {
          const verseNum = parseInt(v.verse);
          const startNum = parseInt(startVerse);
          const endNum = parseInt(endVerse);
          const isInRange = verseNum >= startNum && verseNum <= endNum;
          if (isInRange && !seenVerses.has(verseNum)) {
            seenVerses.add(verseNum);
            return true;
          }
          return false;
        });
        
        console.log('✅ Filtered to', requestedVerses.length, 'verses in range', startVerse, 'to', endVerse);
        
        if (requestedVerses.length === 0) {
          throw new Error(`No verses found in range ${startVerse}-${endVerse}`);
        }
        
        englishText = requestedVerses.map(v => `${v.verse}. ${v.text}`).join('\n\n');
      } else {
        throw new Error('Invalid chapter data structure from Bible API');
      }
    }
    
    // Fetch original languages (Hebrew for OT, Greek for NT)
    originalText = await fetchOriginalLanguages(book, chapter, startVerse, endVerse);
    
    displayScriptureWithToggle(passage, englishText, originalText, container, versionLabel, copyrightNotice);
    console.log('✅ Scripture fetched successfully');
    
  } catch (error) {
    // Silently ignore abort errors (they happen when user changes version mid-fetch)
    if (error.name === 'AbortError') {
      console.log('ℹ️ Fetch cancelled (version changed or new request started)');
      return;
    }
    
    console.error('❌ Error fetching scripture:', error);
    container.innerHTML = `
      <div style="padding: 12px; background: #fef2f2; border-radius: 4px; color: #991b1b; border: 1px solid #fecaca;">
        <p><strong>⚠️ Error loading Scripture</strong></p>
        <p style="font-size: 12px; margin: 8px 0 0 0;">
          ${error.message}
        </p>
        <p style="font-size: 11px; margin: 8px 0 0 0; color: #7f1d1d;">
          Using free Bible API. Check your internet connection and ensure passage format is correct (e.g., "John 3:16", "Psalm 23").
        </p>
      </div>
    `;
  } finally {
    // Clear the controller reference if this was the active fetch
    if (currentFetchController === controller) {
      currentFetchController = null;
    }
  }
}

/**
 * Parse passage reference like "John 3:16" into components
 */
function parsePassageReference(passage) {
  // Example formats: "John 3:16", "Genesis 1:1", "1 Corinthians 13:4-7", "I Cor 13:4"
  const bookNames = {
    // Full book names
    'genesis': 'genesis', 'exodus': 'exodus', 'leviticus': 'leviticus', 'numbers': 'numbers',
    'deuteronomy': 'deuteronomy', 'joshua': 'joshua', 'judges': 'judges', 'ruth': 'ruth',
    '1 samuel': '1-samuel', '2 samuel': '2-samuel', '1 kings': '1-kings', '2 kings': '2-kings',
    '1 chronicles': '1-chronicles', '2 chronicles': '2-chronicles', 'ezra': 'ezra',
    'nehemiah': 'nehemiah', 'esther': 'esther', 'job': 'job', 'psalms': 'psalms', 'psalm': 'psalms',
    'proverbs': 'proverbs', 'ecclesiastes': 'ecclesiastes', 'song of songs': 'song-of-songs', 'song of solomon': 'song-of-songs',
    'canticles': 'song-of-songs', 'isaiah': 'isaiah', 'jeremiah': 'jeremiah',
    'lamentations': 'lamentations', 'ezekiel': 'ezekiel', 'daniel': 'daniel', 'hosea': 'hosea',
    'joel': 'joel', 'amos': 'amos', 'obadiah': 'obadiah', 'jonah': 'jonah', 'micah': 'micah',
    'nahum': 'nahum', 'habakkuk': 'habakkuk', 'zephaniah': 'zephaniah', 'haggai': 'haggai',
    'zechariah': 'zechariah', 'malachi': 'malachi', 'matthew': 'matthew', 'mark': 'mark',
    'luke': 'luke', 'john': 'john', 'acts': 'acts', 'romans': 'romans',
    '1 corinthians': '1-corinthians', '2 corinthians': '2-corinthians', 'galatians': 'galatians',
    'ephesians': 'ephesians', 'philippians': 'philippians', 'colossians': 'colossians',
    '1 thessalonians': '1-thessalonians', '2 thessalonians': '2-thessalonians',
    '1 timothy': '1-timothy', '2 timothy': '2-timothy', 'titus': 'titus', 'philemon': 'philemon',
    'hebrews': 'hebrews', 'james': 'james', '1 peter': '1-peter', '2 peter': '2-peter',
    '1 john': '1-john', '2 john': '2-john', '3 john': '3-john', 'jude': 'jude', 'revelation': 'revelation',
    
    // Common abbreviations
    'gen': 'genesis', 'ex': 'exodus', 'lev': 'leviticus', 'num': 'numbers', 'deut': 'deuteronomy',
    'josh': 'joshua', 'judg': 'judges', '1 sam': '1-samuel', '2 sam': '2-samuel', '1 kgs': '1-kings', '2 kgs': '2-kings',
    '1 chr': '1-chronicles', '2 chr': '2-chronicles', 'ps': 'psalms', 'psa': 'psalms', 'prov': 'proverbs',
    'ecc': 'ecclesiastes', 'ss': 'song-of-songs', 'so': 'song-of-songs', 'song': 'song-of-songs', 'isa': 'isaiah', 'jer': 'jeremiah', 'lam': 'lamentations', 'ezek': 'ezekiel', 'dan': 'daniel',
    'matt': 'matthew', 'mr': 'mark', 'mk': 'mark', 'lk': 'luke', 'jn': 'john',
    'cor': '1-corinthians', 'i cor': '1-corinthians', 'ii cor': '2-corinthians', '1 cor': '1-corinthians', '2 cor': '2-corinthians',
    'rom': 'romans', 'gal': 'galatians', 'eph': 'ephesians', 'phil': 'philippians', 'col': 'colossians',
    '1 thess': '1-thessalonians', '2 thess': '2-thessalonians', '1 tim': '1-timothy', '2 tim': '2-timothy',
    'tit': 'titus', 'phlm': 'philemon', 'heb': 'hebrews', 'jas': 'james', '1 pet': '1-peter', '2 pet': '2-peter',
    '1 jn': '1-john', '2 jn': '2-john', '3 jn': '3-john', 'rev': 'revelation', 'apoc': 'revelation'
  };
  
  try {
    // Convert Roman numerals to Arabic numerals first: I → 1, II → 2, III → 3, IV → 4
    let normalizedPassage = passage
      .replace(/\bIV\b/gi, '4')
      .replace(/\bIII\b/gi, '3')
      .replace(/\bII\b/gi, '2')
      .replace(/\bI\b/gi, '1');
    
    // Parse "Book Chapter:Verse"
    const parts = normalizedPassage.trim().split(/\s+/);
    let bookName = '';
    let chapterVerse = '';
    
    // Handle multi-word book names (e.g., "1 Corinthians", "1 John")
    for (let i = 0; i < parts.length; i++) {
      const testBook = parts.slice(0, i + 1).join(' ').toLowerCase();
      if (bookNames[testBook]) {
        bookName = bookNames[testBook];
        chapterVerse = parts.slice(i + 1).join(' ');
        break;
      }
    }
    
    if (!bookName) {
      throw new Error('Book not recognized: ' + passage);
    }
    
    // Parse chapter:verse or chapter:verse-endVerse (e.g., 3:1-18)
    const [chapter, verses] = chapterVerse.split(':');
    if (!verses) {
      return {
        book: bookName,
        chapter: chapter.trim(),
        startVerse: '1',
        endVerse: '999' // Get entire chapter
      };
    }
    
    // Handle verse ranges like "3:1-18"
    const [startVerse, endVerse] = verses.split('-');
    
    return {
      book: bookName,
      chapter: chapter.trim(),
      startVerse: startVerse.trim(),
      endVerse: endVerse ? endVerse.trim() : startVerse.trim()
    };
  } catch (e) {
    console.error('❌ Failed to parse passage:', passage, e);
    return null;
  }
}

/**
 * Fetch original language text (Hebrew for OT, Greek for NT)
 */
async function fetchOriginalLanguages(book, chapter, startVerse, endVerse) {
  try {
    // Determine if OT or NT based on book name
    const otBooks = ['genesis', '1-samuel', '2-samuel', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
      'joshua', 'judges', 'ruth', '1-kings', '2-kings', '1-chronicles', '2-chronicles', 'ezra',
      'nehemiah', 'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'isaiah', 'jeremiah',
      'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah',
      'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'];
    
    const isOT = otBooks.includes(book);
    const version = isOT ? 'hbo-wlc' : 'grc-tcgnt'; // Hebrew for OT, Greek for NT
    const languageLabel = isOT ? 'Hebrew (OT)' : 'Koine Greek (NT)';
    
    // API requires Hebrew/Greek book names, not English
    // Hebrew OT book names (hbo-wlc)
    const hebrewBookNames = {
      'genesis': 'בראשית',
      'exodus': 'שמות',
      'leviticus': 'ויקרא',
      'numbers': 'במדבר',
      'deuteronomy': 'דברים',
      'joshua': 'יהושע',
      'judges': 'שופטים',
      'ruth': 'רות',
      '1-samuel': 'שמואלא',
      '2-samuel': 'שמואלב',
      '1-kings': 'מלכיםא',
      '2-kings': 'מלכיםב',
      '1-chronicles': 'דבריהימיםא',
      '2-chronicles': 'דבריהימיםב',
      'ezra': 'עזרא',
      'nehemiah': 'נחמיה',
      'esther': 'אסתר',
      'job': 'איוב',
      'psalms': 'תהילים',
      'proverbs': 'מִשְׁלֵי',
      'ecclesiastes': 'קֹהֶלֶת',
      'song-of-solomon': 'שירהשירים',
      'isaiah': 'ישעה',
      'jeremiah': 'ירמיה',
      'lamentations': 'איכה',
      'ezekiel': 'יחזקאל',
      'daniel': 'דניאל',
      'hosea': 'הושע',
      'joel': 'יואל',
      'amos': 'עמוס',
      'obadiah': 'עבדיה',
      'jonah': 'יונה',
      'micah': 'מיכה',
      'nahum': 'נחום',
      'habakkuk': 'חבקוק',
      'zephaniah': 'צפניה',
      'haggai': 'חגי',
      'zechariah': 'זכריה',
      'malachi': 'מלאכי'
    };
    
    // Greek NT book names (grc-tcgnt)
    const greekBookNames = {
      'matthew': 'καταματθαιον',
      'mark': 'καταμαρκον',
      'luke': 'καταλουκαν',
      'john': 'καταιωαννην',
      'acts': 'πραξειςαποστολων',
      'romans': 'προςρωμαιους',
      '1-corinthians': 'προςκορινθιουςα',
      '2-corinthians': 'προςκορινθιουςβ',
      'galatians': 'προςγαλατας',
      'ephesians': 'προςεφεσιους',
      'philippians': 'προςφιλιππησιους',
      'colossians': 'προςκολοσσαεις',
      '1-thessalonians': 'προςθεσσαλονικειςα',
      '2-thessalonians': 'προςθεσσαλονικειςβ',
      '1-timothy': 'προςτιμοθεονα',
      '2-timothy': 'προςτιμοθεονβ',
      'titus': 'προςτιτον',
      'philemon': 'προςφιλημονα',
      'hebrews': 'προςεβραιους',
      'james': 'ιακωβου',
      '1-peter': 'πετρουα',
      '2-peter': 'πετρουβ',
      '1-john': 'ιωαννουα',
      '2-john': 'ιωαννουβ',
      '3-john': 'ιωαννουγ',
      'jude': 'ιουδα',
      'revelation': 'αποκαλυψιςιωαννου'
    };
    
    // Get the correct book name for the API
    const apiBookName = isOT ? hebrewBookNames[book] : greekBookNames[book];
    
    if (!apiBookName) {
      console.warn(`⚠️ No ${languageLabel} book name mapping for: ${book}`);
      return `[${languageLabel} not available for ${book}]`;
    }
    
    console.log(`🔤 Fetching ${languageLabel} (${version}) for ${book} → ${apiBookName} ${chapter}`);
    const chapterUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${apiBookName}/chapters/${chapter}.json?t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(chapterUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`⚠️ Could not fetch ${languageLabel}:`, response.status);
      return `[${languageLabel} not available for this passage]`;
    }
    
    const chapterData = await response.json();
    
    if (chapterData.data && Array.isArray(chapterData.data)) {
      const seenVerses = new Set();
      const requestedVerses = chapterData.data.filter(v => {
        const verseNum = parseInt(v.verse);
        const startNum = parseInt(startVerse);
        const endNum = parseInt(endVerse);
        const isInRange = verseNum >= startNum && verseNum <= endNum;
        if (isInRange && !seenVerses.has(verseNum)) {
          seenVerses.add(verseNum);
          return true;
        }
        return false;
      });
      
      if (requestedVerses.length === 0) {
        console.warn(`⚠️ No ${languageLabel} verses found`);
        return `[${languageLabel} not available for verses ${startVerse}-${endVerse}]`;
      }
      
      const text = requestedVerses.map(v => `${v.verse}. ${v.text}`).join('\n\n');
      console.log(`✅ ${languageLabel} fetched successfully`);
      return text;
    }
    
    return `[${languageLabel} not available]`;
  } catch (error) {
    console.warn(`⚠️ Error fetching original languages:`, error);
    return `[Original language fetch error: ${error.message}]`;
  }
}

/**
 * Display Scripture with toggle between English and original languages
 */
function displayScriptureWithToggle(passage, englishText, originalText, container, versionLabel, copyrightNotice = '') {
  // Convert double line breaks to single for tighter verse spacing
  const formattedEnglish = englishText.replace(/\n\n/g, '\n').replace(/\n/g, '<br>');
  
  // Clean Greek text: remove all textual apparatus notation
  // Remove: verse refs (13:2), dashes (--- or ―), abbreviations (ANT CT PCK etc), percentages, duplicates
  let cleanedOriginal = originalText
    .replace(/\s+---\s+/g, ' ')  // Remove "---" separators
    .replace(/\s+―\s+/g, ' ')   // Remove long dashes
    .replace(/\s+[A-Z]{2,}\s+/g, ' ')  // Remove 2+ letter abbreviations (ANT, CT, PCK, TH, WH, etc.)
    .replace(/\s+\d+:\d+\s+/g, ' ')  // Remove verse references like "13:2"
    .replace(/\s+\d+\.?\d*%\s+/g, ' ')  // Remove percentages
    .replace(/([α-ωά-ώΐΰ]+)\s+\1\s+/g, '$1 ')  // Remove duplicate Greek words
    .replace(/\s{2,}/g, ' ')  // Remove extra whitespace
    .trim();
  
  const formattedOriginal = cleanedOriginal.replace(/\n\n/g, '\n').replace(/\n/g, '<br>');
  
  // Update the pinned passage bar to show the passage reference
  const pinnedBar = document.getElementById('pinnedPassageBar');
  const pinnedRef = document.getElementById('pinnedPassageRef');
  pinnedRef.innerHTML = `<strong>${passage}</strong><br><span style="font-size: 11px; color: #666;">Version: ${versionLabel}</span>`;
  
  const html = `
    <div style="margin: 0; padding: 0; background: transparent;">
      <div id="scriptureEnglish" style="
        font-size: 17px;
        line-height: 1.6;
        color: #222;
        display: block;
        font-family: 'Merriweather', Georgia, serif;
        margin-top: -70px;
      ">${formattedEnglish}</div>
      
      <div id="scriptureOriginal" style="
        font-size: 22px;
        line-height: 1.7;
        color: #222;
        display: none;
        font-family: 'Noto Sans Hebrew', 'Noto Sans Greek', serif;
        border-top: 1px solid #e5e7eb;
        padding-top: 4px;
        margin-top: -95px;
        direction: auto;
      ">${formattedOriginal}</div>
      ${copyrightNotice}
    </div>
  `;
  
  container.innerHTML = html;
  
  // Show the language toggle button in header
  const toggleBtn = document.getElementById('languageToggleBtn');
  const englishDiv = document.getElementById('scriptureEnglish');
  const originalDiv = document.getElementById('scriptureOriginal');
  
  if (toggleBtn) {
    toggleBtn.classList.add('visible');
    let showingOriginal = false;
    
    // Remove any existing listeners by cloning
    const newBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
    const newToggleBtn = newBtn;
    
    newToggleBtn.addEventListener('click', () => {
      showingOriginal = !showingOriginal;
      
      if (showingOriginal) {
        englishDiv.style.display = 'none';
        originalDiv.style.display = 'block';
        newToggleBtn.textContent = '🔤 English';
      } else {
        englishDiv.style.display = 'block';
        originalDiv.style.display = 'none';
        newToggleBtn.textContent = '🔤 Original Languages';
      }
    });
  }
}