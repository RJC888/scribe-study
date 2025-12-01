#!/usr/bin/env node

/**
 * Test file for Scripture Fetch Feature
 * Run: node test-scripture-fetch.js
 */

// Simulate the parsePassageReference function
function parsePassageReference(passage) {
  const bookNames = {
    'genesis': 'genesis', 'exodus': 'exodus', 'leviticus': 'leviticus', 'numbers': 'numbers',
    'deuteronomy': 'deuteronomy', 'joshua': 'joshua', 'judges': 'judges', 'ruth': 'ruth',
    '1 samuel': '1-samuel', '2 samuel': '2-samuel', '1 kings': '1-kings', '2 kings': '2-kings',
    '1 chronicles': '1-chronicles', '2 chronicles': '2-chronicles', 'ezra': 'ezra',
    'nehemiah': 'nehemiah', 'esther': 'esther', 'job': 'job', 'psalms': 'psalms', 'psalm': 'psalms',
    'proverbs': 'proverbs', 'ecclesiastes': 'ecclesiastes', 'isaiah': 'isaiah', 'jeremiah': 'jeremiah',
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
    '1 john': '1-john', '2 john': '2-john', '3 john': '3-john', 'jude': 'jude', 'revelation': 'revelation'
  };
  
  try {
    const parts = passage.trim().split(/\s+/);
    let bookName = '';
    let chapterVerse = '';
    
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
    
    const [chapter, verses] = chapterVerse.split(':');
    const verse = verses ? verses.split('-')[0] : '1';
    
    return {
      book: bookName,
      chapter: chapter.trim(),
      verse: verse.trim()
    };
  } catch (e) {
    return null;
  }
}

// Test cases
const testCases = [
  { input: 'John 3:16', expected: { book: 'john', chapter: '3', verse: '16' } },
  { input: 'Genesis 1:1', expected: { book: 'genesis', chapter: '1', verse: '1' } },
  { input: 'John 3:16-18', expected: { book: 'john', chapter: '3', verse: '16' } },
  { input: '1 Corinthians 13:4', expected: { book: '1-corinthians', chapter: '13', verse: '4' } },
  { input: 'Romans 12:1', expected: { book: 'romans', chapter: '12', verse: '1' } },
  { input: 'Psalm 23:1', expected: { book: 'psalms', chapter: '23', verse: '1' } },
  { input: '1 John 4:8', expected: { book: '1-john', chapter: '4', verse: '8' } },
  { input: 'Revelation 22:20', expected: { book: 'revelation', chapter: '22', verse: '20' } },
  { input: 'Matthew 5:7', expected: { book: 'matthew', chapter: '5', verse: '7' } },
  { input: '2 Timothy 2:15', expected: { book: '2-timothy', chapter: '2', verse: '15' } },
];

console.log('\n📖 Scripture Fetch - Passage Parser Tests\n');
console.log('============================================\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = parsePassageReference(test.input);
  const success = JSON.stringify(result) === JSON.stringify(test.expected);
  
  if (success) {
    console.log(`✅ Test ${index + 1} PASSED: "${test.input}"`);
    console.log(`   Book: ${result.book}, Chapter: ${result.chapter}, Verse: ${result.verse}\n`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1} FAILED: "${test.input}"`);
    console.log(`   Expected: ${JSON.stringify(test.expected)}`);
    console.log(`   Got:      ${JSON.stringify(result)}\n`);
    failed++;
  }
});

console.log('============================================');
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

// Test URL generation
console.log('📡 Sample Bible API URLs:\n');

const samplePassages = ['John 3:16', '1 Corinthians 13:4', 'Psalm 23:1'];

samplePassages.forEach(passage => {
  const parsed = parsePassageReference(passage);
  if (parsed) {
    const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${parsed.book}/chapters/${parsed.chapter}/verses/${parsed.verse}.json`;
    console.log(`${passage}`);
    console.log(`→ ${apiUrl}\n`);
  }
});
