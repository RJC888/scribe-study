// ========================================================
// DYNAMIC MEDITATION VISUALIZATION GENERATOR
// Generates interactive meditation visualizations for any Scripture passage
// Similar to Psalm 23 but dynamically generated based on passage content
// ========================================================

import { VISUALIZATION_PROMPTS } from '../promptRegistry.js';

/**
 * Generate a dynamic meditation visualization for any Scripture passage
 * 
 * @param {string} passage - The Scripture passage reference (e.g., "John 3:16")
 * @param {string} scriptureText - The actual Scripture text
 * @param {string} mode - The module mode (e.g., 'devotional')
 * @param {string} subtab - The subtab (e.g., 'spiritual_analysis')
 * @param {string} depth - The depth level (e.g., 'dig-in' or 'deep-dive')
 * @returns {Promise<string>} HTML string for the visualization
 */
export async function generateMeditationVisualization(passage, scriptureText, mode = 'devotional', subtab = 'spiritual_analysis', depth = 'dig-in') {
  try {
    console.log('🎨 Generating meditation visualization for:', passage, `(${depth})`);

    // Call backend to get AI-generated meditation cards
    const meditationData = await generateMeditationDataFromBackend(passage, scriptureText, depth);

    // Generate HTML from the meditation data
    const html = createMeditationHTML(passage, scriptureText, meditationData);

    return html;

  } catch (error) {
    console.error('❌ Error generating meditation visualization:', error);
    // Return a fallback simple visualization
    return createFallbackHTML(passage, scriptureText);
  }
}

/**
 * Call backend to generate meditation card data using AI
 */
async function generateMeditationDataFromBackend(passage, scriptureText, depth = 'dig-in') {
  try {
    console.log('📡 Calling backend for meditation data...', `Depth: ${depth}`);

    // Select prompt template based on depth
    let promptConfigKey = 'devotional-spiritual-analysis';
    if (depth === 'deep-dive') {
      promptConfigKey = 'devotional-spiritual-analysis-deep-dive';
    }

    const promptConfig = VISUALIZATION_PROMPTS[promptConfigKey];
    if (!promptConfig) {
      throw new Error(`Meditation prompt template not found in registry: ${promptConfigKey}`);
    }

    // Fill in the template with passage data
    const prompt = promptConfig.meditationTemplate
      .replace('{PASSAGE_TEXT}', scriptureText)
      .replace('{PASSAGE_REF}', passage);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        passage,
        moduleName: 'visualization-meditation',
        temperature: 0.8,
        maxTokens: 1200,
        depth: 'dig-in'
      })
    });

    if (!response.ok) {
      console.error('Backend error:', response.status);
      throw new Error(`Backend returned ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.analysis) {
      console.error('Analysis failed or empty:', result);
      throw new Error('Meditation generation failed');
    }

    // Parse the analysis as JSON
    try {
      const parsed = JSON.parse(result.analysis);
      console.log('✅ Successfully parsed meditation data:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Try to extract JSON from the response if it has surrounding text
      const jsonMatch = result.analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw parseError;
    }

  } catch (error) {
    console.error('❌ Error getting meditation data from backend:', error);
    // Return default structure for fallback
    return null;
  }
}

/**
 * Create HTML for meditation visualization
 * Mirrors the structure and styling of psalm23-meditation.html
 */
function createMeditationHTML(passage, scriptureText, meditationData) {
  const themeColors = [
    'theme-comfort',
    'theme-guidance',
    'theme-protection',
    'theme-restoration',
    'theme-faithfulness',
    'theme-hope'
  ];

  let cardsHTML = '';
  if (meditationData && meditationData.cards && Array.isArray(meditationData.cards)) {
    cardsHTML = meditationData.cards.map((card, index) => {
      const themeClass = themeColors[index % themeColors.length];
      return `
      <div class="meditation-card ${themeClass}">
        <div class="card-icon">${card.icon || '✨'}</div>
        <div class="card-verse">Card ${index + 1}</div>
        <div class="card-theme">${card.theme || 'Insight'}</div>
        <div class="card-text">${card.description || 'Reflect on this spiritual truth.'}</div>
      </div>
      `;
    }).join('');
  }

  // Format scripture text as verses
  const versesHTML = scriptureText.split('\n')
    .filter(line => line.trim().length > 0)
    .map((verse, index) => {
      const verseNum = index + 1;
      return `
      <div class="verse">
        <span class="verse-num">${verseNum}</span><span class="verse-text">${verse.trim()}</span>
      </div>
      `;
    }).join('');

  const meditationPrompt = meditationData?.meditationPrompt || 'Take time to reflect on this passage and allow God to speak to your heart.';
  const subtitle = meditationData?.subtitle || 'A Scripture Meditation';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${passage} - Meditation Visualization</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Cormorant+Garamond:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Merriweather', serif;
      background: linear-gradient(135deg, #e8f4f8 0%, #d4e9f7 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px;
      color: #2c5aa0;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      font-style: italic;
    }

    /* Meditation Journey */
    .meditation-journey {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .meditation-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #2c5aa0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .meditation-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .meditation-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(44, 90, 160, 0.05) 0%, transparent 100%);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .meditation-card:hover::before {
      opacity: 1;
    }

    .card-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .card-verse {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      font-style: italic;
    }

    .card-theme {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      color: #2c5aa0;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .card-text {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }

    .meditation-card.theme-comfort { border-left-color: #4CAF50; }
    .meditation-card.theme-guidance { border-left-color: #2196F3; }
    .meditation-card.theme-protection { border-left-color: #FF6B6B; }
    .meditation-card.theme-restoration { border-left-color: #9C27B0; }
    .meditation-card.theme-faithfulness { border-left-color: #FF9800; }
    .meditation-card.theme-hope { border-left-color: #00BCD4; }

    /* Full Passage Section */
    .full-passage {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      margin-bottom: 40px;
    }

    .passage-header {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 700;
      color: #2c5aa0;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .verse {
      display: flex;
      margin-bottom: 12px;
      line-height: 1.8;
    }

    .verse-num {
      flex: 0 0 40px;
      color: #999;
      font-weight: 700;
      text-align: right;
      margin-right: 12px;
    }

    .verse-text {
      flex: 1;
      color: #333;
    }

    /* Meditation Prompt */
    .meditation-prompt {
      background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
      border-left: 5px solid #FF9800;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.7;
      color: #333;
      margin-bottom: 40px;
    }

    .meditation-prompt strong {
      display: block;
      margin-bottom: 12px;
      color: #FF6F00;
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      h1 { font-size: 36px; }
      .meditation-journey { grid-template-columns: 1fr; }
      .full-passage { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${passage}</h1>
      <p class="subtitle">${subtitle}</p>
    </header>

    <!-- Meditation Journey -->
    <div class="meditation-journey">
      ${cardsHTML}
    </div>

    <!-- Full Passage -->
    <div class="full-passage">
      <div class="passage-header">Full Passage</div>
      ${versesHTML}
    </div>

    <!-- Meditation Prompt -->
    <div class="meditation-prompt">
      <strong>💭 Meditation Prompt:</strong>
      ${meditationPrompt}
    </div>
  </div>

  <script>
    document.querySelectorAll('.meditation-card').forEach(card => {
      card.addEventListener('click', function() {
        this.style.transform = 'scale(1.02)';
        setTimeout(() => { this.style.transform = ''; }, 300);
      });
    });
    console.log('✨ Meditation Visualization Loaded');
  </script>
</body>
</html>
  `;
}

/**
 * Create simple HTML fallback visualization
 */
function createFallbackHTML(passage, scriptureText) {
  const versesHTML = scriptureText.split('\n')
    .filter(line => line.trim().length > 0)
    .map((verse, index) => `
      <div class="verse">
        <span class="verse-num">${index + 1}</span>
        <span class="verse-text">${verse.trim()}</span>
      </div>
    `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${passage} - Scripture Visualization</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Cormorant+Garamond:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Merriweather', serif;
      background: linear-gradient(135deg, #e8f4f8 0%, #d4e9f7 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
    }
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px;
      color: #2c5aa0;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .subtitle {
      font-size: 14px;
      color: #666;
      font-style: italic;
    }
    .passage-content {
      margin-top: 30px;
      line-height: 2;
    }
    .verse {
      display: flex;
      margin-bottom: 16px;
    }
    .verse-num {
      flex: 0 0 50px;
      color: #2c5aa0;
      font-weight: 700;
      text-align: right;
      margin-right: 16px;
      font-size: 14px;
    }
    .verse-text {
      flex: 1;
      color: #333;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${passage}</h1>
      <p class="subtitle">Scripture Passage</p>
    </header>
    <div class="passage-content">
      ${versesHTML}
    </div>
  </div>
</body>
</html>
  `;
}
