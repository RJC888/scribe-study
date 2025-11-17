/**************************************************************
 Scribe Study — app.js (Final v1)
 --------------------------------------------------------------
 Clean, stable, and fully integrated version.

 Major Sections:
 1. DOM CACHE
 2. STATE
 3. FIREBASE INIT (clean, no duplicates)
 4. EVENT WIRING
 5. SCRIPTURE HANDLING
 6. ANALYSIS HANDLING
 7. UI HELPERS
**************************************************************/

/* ============================================================
   1. DOM CACHE
   ============================================================ */
const DOM = {
  passageInput: document.getElementById("passageInput"),
  displayBtn: document.getElementById("displayBtn"),
  analysisBtn: document.getElementById("analysisBtn"),
  output: document.getElementById("primaryDisplay"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  notesList: document.getElementById("notesList"),
};


/* ============================================================
   2. APP STATE
   ============================================================ */
const AppState = {
  user: null,
  currentPassage: "",
};


/* ============================================================
   3. FIREBASE INIT (COMPAT VERSION)
   ============================================================ */

function loadFirebaseConfig() {
  // REPLACE WITH YOUR ACTUAL CONFIG BLOCK
  return {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APPID",
  };
}

function initFirebaseOnce() {
  try {
    const config = loadFirebaseConfig();
    if (!config) throw new Error("Missing Firebase config.");

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
      firebase.auth();
      firebase.firestore();
      console.log("✅ Firebase Auth & Firestore ready (compat)");
    }

    // Auth listener
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        AppState.user = user;
        console.log("👤 Logged in:", user.email);

        // Load notes if we have them
        await loadNotesFromFirestore();
        renderNotes();

      } else {
        console.log("🚫 No user signed in");
        AppState.user = null;
      }
    });

  } catch (e) {
    console.error("🔥 Firebase init error:", e);
    setErrorState("Failed to initialize Firebase. Check your config and console.");
  }
}

// Start Firebase
initFirebaseOnce();


/* ============================================================
   4. EVENT WIRING
   ============================================================ */
function wireEvents() {
  if (DOM.displayBtn) {
    DOM.displayBtn.addEventListener("click", handleDisplayScripture);
  }

  if (DOM.analysisBtn) {
    DOM.analysisBtn.addEventListener("click", handleGenerateAnalysis);
  }

  console.log("⚙️ Events wired.");
}

document.addEventListener("DOMContentLoaded", wireEvents);


/* ============================================================
   5. SCRIPTURE DISPLAY (Connected to formattingEngine.js)
   ============================================================ */
/**
 * Parse simple references like "John 3:16" → { book, chapter, verse }
 */
function parsePassageInput(raw) {
  if (!raw) return null;
  const cleaned = raw.trim();

  // Basic: "John 3:16"
  const match = cleaned.match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)$/);
  if (!match) return null;

  return {
    book: match[1],
    chapter: match[2],
    verse: match[3],
  };
}

/**
 * TEMP mock scripture loader
 * (Later: Replace with API call)
 */
async function fetchMockPassage(book, chapter) {
  return [
    "1 In the beginning God created the heavens and the earth.",
    "2 And the earth was without form and void.",
    "3 And God said, Let there be light."
  ];
}


/* ============================================================
   Handle Display Scripture
   ============================================================ */
async function handleDisplayScripture() {
  const raw = DOM.passageInput.value.trim();
  if (!raw) {
    setErrorState("Please enter a passage.");
    return;
  }

  const ref = parsePassageInput(raw);
  if (!ref) {
    setErrorState("Invalid passage format. Try Example: John 3:16");
    return;
  }

  AppState.currentPassage = raw;

  try {
    const rawVerses = await fetchMockPassage(ref.book, ref.chapter);

    // Determine Testament → Hebrew/Greek/English
    const testament = determineTestament(ref.book);
    const language = BibleFormatter.detectLanguageFromTestament(testament);

    const html = BibleFormatter.formatPassageToHtml({
      language,
      verses: rawVerses,
      indentRule: "first-left-rest-indented"
    });

    DOM.output.innerHTML = html;

  } catch (e) {
    console.error(e);
    setErrorState("Unable to load passage.");
  }
}


/**
 * VERY simple OT/NT detector.
 * In a later version, this will use a more robust BookMap.
 */
function determineTestament(bookName) {
  const otBooks = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
    "Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings",
    "1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job",
    "Psalms","Proverbs","Ecclesiastes","Song","Isaiah","Jeremiah","Lamentations",
    "Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah",
    "Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"
  ];
  return otBooks.includes(bookName) ? "ot" : "nt";
}


/* ============================================================
   6. ANALYSIS HANDLING (placeholder for LLM integration)
   ============================================================ */
async function handleGenerateAnalysis() {
  const raw = DOM.passageInput.value.trim();
  if (!raw) {
    setErrorState("Enter a passage first.");
    return;
  }

  DOM.output.innerHTML = `
    <div class="status-message">
      <div class="status-icon">⏳</div>
      <div class="status-title">Generating Analysis…</div>
      <p class="status-text">Please wait a moment.</p>
    </div>
  `;

  // Here you will call your LLM API later.
  setTimeout(() => {
    DOM.output.innerHTML = `
      <div class="status-message">
        <div class="status-icon">📘</div>
        <div class="status-title">Analysis Placeholder</div>
        <p class="status-text">LLM output will appear here.</p>
      </div>
    `;
  }, 1200);
}


/* ============================================================
   7. UI HELPERS
   ============================================================ */
function setErrorState(msg) {
  DOM.output.innerHTML = `
    <div class="status-message">
      <div class="status-icon">⚠️</div>
      <div class="status-title">Error</div>
      <p class="status-text">${msg}</p>
    </div>
  `;
}

/* Firestore placeholders (not removed, but quiet) */
async function loadNotesFromFirestore() { return []; }
function renderNotes() {}
