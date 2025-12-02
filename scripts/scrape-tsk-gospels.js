/**
 * TSK Gospels Scraper - Test version
 * Downloads just the 4 Gospels to test the format
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Just the Gospels for testing
const BOOKS = {
  'Matthew': { chapters: 28, abbrev: 'mat' },
  'Mark': { chapters: 16, abbrev: 'mar' },
  'Luke': { chapters: 24, abbrev: 'luk' },
  'John': { chapters: 21, abbrev: 'joh' }
};

const DELAY_MS = 500;
const outlines = {};
let successCount = 0;
let errorCount = 0;

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseOutline(html, book, chapter) {
  try {
    const overviewMatch = html.match(/Overview\s*\n\s*<p>(.*?)<\/p>/s);
    
    if (!overviewMatch) {
      return null;
    }

    let outline = overviewMatch[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    
    const items = outline.split(/;\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    return items.join('\n');
    
  } catch (error) {
    return null;
  }
}

async function downloadChapter(book, chapter, abbrev) {
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
      console.log(`⚠️  ${book} ${chapter}`);
    }
    
  } catch (error) {
    console.error(`❌ ${book} ${chapter}: ${error.message}`);
    errorCount++;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeGospels() {
  console.log('📖 Scraping Gospels TSK Outlines (Test)\n');
  
  for (const [book, info] of Object.entries(BOOKS)) {
    console.log(`\n📕 ${book} (${info.chapters} chapters)`);
    
    for (let chapter = 1; chapter <= info.chapters; chapter++) {
      await downloadChapter(book, chapter, info.abbrev);
      await delay(DELAY_MS);
    }
  }
  
  const outputDir = path.join(__dirname, '../frontend/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'chapter-outlines-gospels.json');
  fs.writeFileSync(outputPath, JSON.stringify(outlines, null, 2), 'utf8');
  
  console.log('\n\n✨ Complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📁 ${outputPath}`);
}

scrapeGospels().catch(console.error);
