/**
 * TSK Chapter Outlines Scraper
 * Downloads chapter outlines from Sacred Texts Treasury of Scripture Knowledge
 * Formats each outline section on its own line for autocomplete display
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Bible book names and chapter counts
const BIBLE_BOOKS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
  'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
  'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
  'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
  'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
  'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
  '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
  '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
  'Jude': 1, 'Revelation': 22
};

// Map book names to Sacred Texts URL abbreviations
const BOOK_ABBREV = {
  'Genesis': 'gen', 'Exodus': 'exo', 'Leviticus': 'lev', 'Numbers': 'num', 'Deuteronomy': 'deu',
  'Joshua': 'jos', 'Judges': 'jdg', 'Ruth': 'rut', '1 Samuel': 'sa1', '2 Samuel': 'sa2',
  '1 Kings': 'kg1', '2 Kings': 'kg2', '1 Chronicles': 'ch1', '2 Chronicles': 'ch2', 'Ezra': 'ezr',
  'Nehemiah': 'neh', 'Esther': 'est', 'Job': 'job', 'Psalms': 'psa', 'Proverbs': 'pro',
  'Ecclesiastes': 'ecc', 'Song of Solomon': 'sol', 'Isaiah': 'isa', 'Jeremiah': 'jer', 'Lamentations': 'lam',
  'Ezekiel': 'eze', 'Daniel': 'dan', 'Hosea': 'hos', 'Joel': 'joe', 'Amos': 'amo',
  'Obadiah': 'oba', 'Jonah': 'jon', 'Micah': 'mic', 'Nahum': 'nah', 'Habakkuk': 'hab',
  'Zephaniah': 'zep', 'Haggai': 'hag', 'Zechariah': 'zac', 'Malachi': 'mal',
  'Matthew': 'mat', 'Mark': 'mar', 'Luke': 'luk', 'John': 'joh', 'Acts': 'act',
  'Romans': 'rom', '1 Corinthians': 'co1', '2 Corinthians': 'co2', 'Galatians': 'gal', 'Ephesians': 'eph',
  'Philippians': 'phi', 'Colossians': 'col', '1 Thessalonians': 'th1', '2 Thessalonians': 'th2', '1 Timothy': 'ti1',
  '2 Timothy': 'ti2', 'Titus': 'tit', 'Philemon': 'plm', 'Hebrews': 'heb', 'James': 'jam',
  '1 Peter': 'pe1', '2 Peter': 'pe2', '1 John': 'jo1', '2 John': 'jo2', '3 John': 'jo3',
  'Jude': 'jde', 'Revelation': 'rev'
};

// Delay between requests (milliseconds) - be respectful to the server
const DELAY_MS = 500;

const outlines = {};
let successCount = 0;
let errorCount = 0;

/**
 * Fetch HTML content from URL
 */
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Parse chapter outline from HTML
 * Extracts the "Overview" section and splits into individual lines
 */
function parseOutline(html, book, chapter) {
  try {
    // Look for the Overview section - it's in a <p> tag after "Overview"
    const overviewMatch = html.match(/Overview\s*\n\s*<p>(.*?)<\/p>/s);
    
    if (!overviewMatch) {
      console.log(`⚠️  No outline found for ${book} ${chapter}`);
      return null;
    }

    let outline = overviewMatch[1];
    
    // Remove HTML tags and links
    outline = outline.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    outline = outline.replace(/&quot;/g, '"')
                     .replace(/&amp;/g, '&')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&#\d+;/g, '');
    
    // Clean up extra whitespace
    outline = outline.replace(/\s+/g, ' ').trim();
    
    // Split by semicolon to get individual outline items
    // Each item should be on its own line for autocomplete display
    const items = outline.split(/;\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Format: each item on its own line
    return items.join('\n');
    
  } catch (error) {
    console.error(`❌ Error parsing ${book} ${chapter}:`, error.message);
    return null;
  }
}

/**
 * Download outline for a specific chapter
 */
async function downloadChapter(book, chapter) {
  const abbrev = BOOK_ABBREV[book];
  const chapterStr = String(chapter).padStart(3, '0');
  const url = `https://sacred-texts.com/bib/cmt/tsk/${abbrev}${chapterStr}.htm`;
  
  try {
    const html = await fetchURL(url);
    const outline = parseOutline(html, book, chapter);
    
    if (outline) {
      if (!outlines[book]) outlines[book] = {};
      outlines[book][chapter] = outline;
      successCount++;
      console.log(`✅ ${book} ${chapter}`);
    } else {
      errorCount++;
    }
    
  } catch (error) {
    console.error(`❌ Failed to download ${book} ${chapter}:`, error.message);
    errorCount++;
  }
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main scraper function
 */
async function scrapeAllOutlines() {
  console.log('📖 Starting TSK Chapter Outlines Scraper...\n');
  console.log(`📊 Total chapters to download: ${Object.values(BIBLE_BOOKS).reduce((a, b) => a + b, 0)}\n`);
  
  for (const [book, chapterCount] of Object.entries(BIBLE_BOOKS)) {
    console.log(`\n📕 ${book} (${chapterCount} chapters)`);
    
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      await downloadChapter(book, chapter);
      await delay(DELAY_MS); // Be respectful to the server
    }
  }
  
  // Save to JSON file
  const outputDir = path.join(__dirname, '../frontend/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'chapter-outlines.json');
  fs.writeFileSync(outputPath, JSON.stringify(outlines, null, 2), 'utf8');
  
  console.log('\n\n✨ Scraping Complete!');
  console.log(`✅ Successfully downloaded: ${successCount} chapters`);
  console.log(`❌ Failed/No outline: ${errorCount} chapters`);
  console.log(`📁 Saved to: ${outputPath}`);
}

// Run the scraper
scrapeAllOutlines().catch(console.error);
