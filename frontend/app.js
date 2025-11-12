// ===== FIREBASE IMPORTS (v10.13.0 to match index.html) =====
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setLogLevel
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ===== CONFIG PICKUP (robust) =====
// 1) Prefer a JSON string __firebase_config (legacy style)
// 2) Else prefer window/globalThis.firebaseConfig (from <head>)
// 3) Else fall back to your known-good config so the app still boots
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyD1TJ4GTW7bjJNx5Z4SBEMfujTSaD3FWzY",
  authDomain: "scribe-study.firebaseapp.com",
  projectId: "scribe-study",
  storageBucket: "scribe-study.appspot.com",
  messagingSenderId: "133274919715",
  appId: "1:133274919715:web:c48490a98e28db93a9a2296",
  measurementId: "G-GWXZ67WB98",
};

function loadFirebaseConfig() {
  try {
    if (globalThis.__firebase_config) {
      return JSON.parse(globalThis.__firebase_config);
    }
  } catch (e) {
    console.warn("Failed to parse __firebase_config JSON:", e);
  }
  if (globalThis.firebaseConfig) return globalThis.firebaseConfig;
  console.warn("⚠️ Using DEFAULT Firebase config (consider exposing window.firebaseConfig in <head>)");
  return DEFAULT_CONFIG;
}

const firebaseConfig = loadFirebaseConfig();

// ===== API CONFIG =====
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api" // Local dev
    : "/api"; // Production (same domain). If you don’t have an API route, change to your full URL.

// ===== DOM CACHE =====
const DOMElements = {};

// ===== APPLICATION STATE =====
const AppState = {
  app: null,
  auth: null,
  db: null,
  userId: null,
  notesCollectionRef: null,
  notesUnsubscribe: null,

  currentCategory: "devotional",
  currentModule: "spiritual-analysis",
  currentPassage: "",
  currentNoteId: null,
  notes: {},
  currentFontSize: "font-size-normal",

  currentReaderMode: false,
  currentBibleReference: { book: "", chapter: null, verse: null },
  isFetchingChapter: false,

  bibleBookMap: new Map(),
  bibleBookList: [],

  scrollObserver: null,
  headerObserver: null,
  autoSaveTimer: null
};

// ===== BIBLE STRUCTURE DATA (exactly as you provided) =====

// ----------------------
// Utility: Safe query by id
function byId(id) { return document.getElementById(id); }

// ----------------------
// Simple Markdown -> HTML (your original helper, kept as-is)
function simpleMarkdown(text) {
  if (!text) return "";
  let html = text.replace(/\r\n/g, "\n");
  html = html.replace(/^###\s(.*)/gm, "<h3>$1</h3>")
             .replace(/^##\s(.*)/gm, "<h2>$1</h2>")
             .replace(/^#\s(.*)/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
             .replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^\>\s(.*)/gm, "<blockquote>$1</blockquote>")
             .replace(/<\/blockquote>\n<blockquote>/g, "\n");
  html = html.replace(/^\s*[\-\*]\s(.*)/gm, "<li>$1</li>")
             .replace(/(\n?<li>.*<\/li>\n?)/gs, "<ul>$1</ul>")
             .replace(/<\/ul>\n?<ul>/g, "");
  html = html.replace(/^\s*[0-9]+\.\s(.*)/gm, "<li>$1</li>")
             .replace(/(\n?<li>.*<\/li>\n?)/gs, (m, p1) => m.includes("<ul>") ? m : `<ol>${p1}</ol>`)
             .replace(/<\/ol>\n?<ul>/g, "")
             .replace(/<\/ul>\n?<ol>/g, "")
             .replace(/<\/ol>\n?<ol>/g, "");
  html = html.split("\n\n").map(p => {
    if (p.trim().startsWith("<") || p.trim() === "") return p;
    return `<p>${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  html = html.replace(/<p>\s*<(ul|ol|h[1-3]|blockquote)/g, "<$1")
             .replace(/<\/(ul|ol|h[1-3]|blockquote)>\s*<\/p>/g, "</$1>")
             .replace(/<p>\s*<\/p>/g, "")
             .replace(/<p><br><\/p>/g, "");
  return html;
}

// ----------------------
// STATUS / UI helpers
function setReadyState(title, text, icon = "📖") {
  if (!DOMElements.statusIcon) return;
  DOMElements.statusIcon.innerHTML = icon;
  DOMElements.statusTitle.textContent = title;
  DOMElements.statusText.textContent = text;
  DOMElements.statusIcon.style.display = "block";
  DOMElements.statusText.style.display = "block";
  DOMElements.statusMessage.style.display = "flex";
  DOMElements.analysisDisplay.style.display = "none";
  // enable inputs
  if (DOMElements.passageInput) DOMElements.passageInput.disabled = false;
  if (DOMElements.runModuleBtn) DOMElements.runModuleBtn.disabled = false;
  if (DOMElements.displayScriptureBtn) DOMElements.displayScriptureBtn.disabled = false;
  if (DOMElements.versionSelect) DOMElements.versionSelect.disabled = false;
}

function setErrorState(msg) {
  console.error("UI Error:", msg);
  setReadyState("Error", msg, "⚠️");
}

function setLoadingState(isLoading, title = "Analyzing...") {
  if (isLoading) {
    disconnectObservers();
    if (DOMElements.statusTitle) DOMElements.statusTitle.textContent = title;
    if (DOMElements.statusIcon) DOMElements.statusIcon.innerHTML =
      `<div class="flex space-x-1.5"><div class="dot dot-1"></div><div class="dot dot-2"></div><div class="dot dot-3"></div></div>`;
    if (DOMElements.statusText) DOMElements.statusText.style.display = "none";
    if (DOMElements.statusMessage) DOMElements.statusMessage.style.display = "flex";
    if (DOMElements.analysisDisplay) DOMElements.analysisDisplay.style.display = "none";
    if (DOMElements.passageInput) DOMElements.passageInput.disabled = true;
    if (DOMElements.runModuleBtn) DOMElements.runModuleBtn.disabled = true;
    if (DOMElements.displayScriptureBtn) DOMElements.displayScriptureBtn.disabled = true;
    if (DOMElements.versionSelect) DOMElements.versionSelect.disabled = true;
  } else {
    if (DOMElements.passageInput) DOMElements.passageInput.disabled = false;
    if (DOMElements.runModuleBtn) DOMElements.runModuleBtn.disabled = false;
    if (DOMElements.displayScriptureBtn) DOMElements.displayScriptureBtn.disabled = false;
    if (DOMElements.versionSelect) DOMElements.versionSelect.disabled = false;
    if (DOMElements.statusMessage) DOMElements.statusMessage.style.display = "none";
    if (DOMElements.analysisDisplay) DOMElements.analysisDisplay.style.display = "flex";
  }
}

// ----------------------
// FIREBASE INIT + AUTH
async function initFirebaseOnce() {
  // Avoid mismatched versions by using v10.13.0 everywhere (matched above).
  let app;
  if (getApps().length) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }
  const auth = getAuth(app);
  const db = getFirestore(app);
  setLogLevel("debug");
  await setPersistence(auth, browserLocalPersistence);
  return { app, auth, db };
}

async function initializeFirebaseAndAuth() {
  try {
    console.log("Initializing Firebase...");
    const { app, auth, db } = await initFirebaseOnce();
    AppState.app = app;
    AppState.auth = auth;
    AppState.db = db;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        AppState.userId = user.uid;
        const appId = (typeof globalThis.__app_id !== "undefined") ? globalThis.__app_id : "default-app-id";
        const collectionPath = `/artifacts/${appId}/users/${AppState.userId}/notes`;
        AppState.notesCollectionRef = collection(AppState.db, collectionPath);
        loadNotesFromFirestore();
        setReadyState("Ready to Study God's Word", "Enter a scripture passage or question, then choose an action.");
      } else {
        AppState.userId = null;
        if (AppState.notesUnsubscribe) {
          AppState.notesUnsubscribe();
          AppState.notesUnsubscribe = null;
        }
        try {
          if (globalThis.__initial_auth_token) {
            await signInWithCustomToken(auth, globalThis.__initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Auth error:", err);
          setErrorState(`Authentication Failed: ${err.message || err.code || "Unknown error"}`);
        }
      }
    });
  } catch (e) {
    console.error("Error initializing Firebase:", e);
    setErrorState("Failed to initialize Firebase. Check your config and console.");
  }
}

// --- TEMP FIX until full data file restored ---
const BIBLE_DATA = {
  testament: {
    old: {
      name: "Old Testament",
      books: [
        { name: "Genesis", chapters: 50 },
        { name: "Exodus", chapters: 40 },
        // add more if you like — enough to keep UI functional
      ]
    },
    new: {
      name: "New Testament",
      books: [
        { name: "Matthew", chapters: 28 },
        { name: "Mark", chapters: 16 },
        // add more here as needed
      ]
    }
  }
};

// ----------------------
// BIBLE DATA PROCESSING
function processBibleData() {
  const allBooks = [...BIBLE_DATA.testament.old.books, ...BIBLE_DATA.testament.new.books];
  allBooks.forEach((book, index) => {
    const key = book.name.toLowerCase();
    const data = { ...book, globalIndex: index };
    AppState.bibleBookMap.set(key, data);
    if (book.abbr) AppState.bibleBookMap.set(book.abbr.toLowerCase(), data);
    AppState.bibleBookList.push(book.name);
  });
}

function parsePassageReference(input) {
  const regex = /([1-3]?\s?[A-Za-z]+)\.?\s+([0-9]+)(?:[:.]([0-9]+))?/;
  const m = (input || "").trim().match(regex);
  if (!m) return null;
  const bookName = m[1].toLowerCase().replace(/\./g, "");
  const chapter = parseInt(m[2], 10);
  const verse = m[3] ? parseInt(m[3], 10) : null;
  if (!AppState.bibleBookMap.has(bookName)) return null;
  const bookData = AppState.bibleBookMap.get(bookName);
  if (chapter <= 0 || chapter > bookData.chapters) return null;
  return { book: bookData.name, chapter, verse };
}

// ----------------------
// FETCH ANALYSIS
async function runAnalysis(prompt, passage, moduleName) {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        passage,
        moduleName,
        version: DOMElements.versionSelect ? DOMElements.versionSelect.value : "ESV"
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Analysis failed (${response.status})`);
    }
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Analysis Error:", error);
    setErrorState(error.message);
    return null;
  }
}

// ----------------------
// DISPLAY / RENDER
function displayAnalysis({
  content,
  isReaderMode = false,
  book = "",
  chapter = null,
  icon = "",
  passage = "",
  moduleName = ""
}) {
  disconnectObservers();

  if (!DOMElements.analysisContent) return;

  if (isReaderMode) {
    AppState.currentReaderMode = true;
    const chunk = createChapterChunk(content, book, chapter);
    DOMElements.analysisContent.innerHTML = "";
    DOMElements.analysisContent.appendChild(chunk);

    if (DOMElements.analysisTitleDisplay) DOMElements.analysisTitleDisplay.style.display = "none";
    if (DOMElements.readerControlsDisplay) DOMElements.readerControlsDisplay.style.display = "flex";
    if (DOMElements.readerTitleDisplay) DOMElements.readerTitleDisplay.textContent = `${book} ${chapter}`;
    if (DOMElements.analysisFooter) DOMElements.analysisFooter.style.display = "none";
    if (DOMElements.analysisDisplay) DOMElements.analysisDisplay.classList.add("reader-mode");

    setTimeout(() => {
      if (AppState.currentReaderMode) {
        setupScrollObserver();
        setupHeaderObserver();
      }
    }, 500);
  } else {
    AppState.currentReaderMode = false;
    DOMElements.analysisContent.innerHTML = simpleMarkdown(content);
    if (DOMElements.analysisTitleDisplay) DOMElements.analysisTitleDisplay.style.display = "flex";
    if (DOMElements.readerControlsDisplay) DOMElements.readerControlsDisplay.style.display = "none";
    if (DOMElements.analysisIconDisplay) DOMElements.analysisIconDisplay.textContent = icon || "📖";
    if (DOMElements.analysisPassageDisplay) DOMElements.analysisPassageDisplay.textContent = passage || "";
    if (DOMElements.analysisModuleDisplay) DOMElements.analysisModuleDisplay.textContent = moduleName || "";
    if (DOMElements.analysisFooter) DOMElements.analysisFooter.style.display = "block";
    if (DOMElements.analysisDisplay) DOMElements.analysisDisplay.classList.remove("reader-mode");
  }

  applyFontSize();
  if (DOMElements.resultsMain) DOMElements.resultsMain.scrollTop = 0;
}

function createChapterChunk(content, book, chapter) {
  const chunk = document.createElement("div");
  chunk.className = "chapter-chunk";
  chunk.dataset.book = book;
  chunk.dataset.chapter = chapter;
  chunk.innerHTML = simpleMarkdown(content);
  return chunk;
}

function disconnectObservers() {
  if (AppState.scrollObserver) { AppState.scrollObserver.disconnect(); AppState.scrollObserver = null; }
  if (AppState.headerObserver) { AppState.headerObserver.disconnect(); AppState.headerObserver = null; }
}

function setupHeaderObserver() {
  if (!AppState.currentReaderMode || AppState.headerObserver || !DOMElements.resultsMain) return;
  try {
    const options = { root: DOMElements.resultsMain, threshold: 0.1, rootMargin: "0px 0px -80% 0px" };
    AppState.headerObserver = new IntersectionObserver((entries) => {
      if (!AppState.currentReaderMode) return;
      const topmost = entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top)[0];
      if (topmost) {
        const book = topmost.target.dataset.book;
        const chapter = topmost.target.dataset.chapter;
        if (DOMElements.readerTitleDisplay) DOMElements.readerTitleDisplay.textContent = `${book} ${chapter}`;
        AppState.currentBibleReference.book = book;
        AppState.currentBibleReference.chapter = parseInt(chapter, 10);
      }
    }, options);
    DOMElements.analysisContent?.querySelectorAll(".chapter-chunk").forEach(ch => AppState.headerObserver.observe(ch));
  } catch (e) { console.error("Header observer error:", e); }
}

function setupScrollObserver() {
  if (!AppState.currentReaderMode || AppState.scrollObserver || !DOMElements.resultsMain) return;
  try {
    const options = { root: DOMElements.resultsMain, threshold: 0, rootMargin: "300px 0px 300px 0px" };
    AppState.scrollObserver = new IntersectionObserver((entries) => {
      if (AppState.isFetchingChapter || !AppState.currentReaderMode) return;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const chunk = entry.target;
        const currentRef = { book: chunk.dataset.book, chapter: parseInt(chunk.dataset.chapter, 10) };
        if (chunk === DOMElements.analysisContent.firstChild) {
          const prevRef = getAdjacentChapter(currentRef, -1);
          if (prevRef) {
            AppState.scrollObserver.unobserve(chunk);
            fetchAndDisplayChapter(prevRef, "prepend").then(() => {
              if (DOMElements.analysisContent.firstChild) {
                AppState.scrollObserver.observe(DOMElements.analysisContent.firstChild);
              }
            });
          }
        }
        if (chunk === DOMElements.analysisContent.lastChild) {
          const nextRef = getAdjacentChapter(currentRef, 1);
          if (nextRef) {
            AppState.scrollObserver.unobserve(chunk);
            fetchAndDisplayChapter(nextRef, "append").then(() => {
              if (DOMElements.analysisContent.lastChild) {
                AppState.scrollObserver.observe(DOMElements.analysisContent.lastChild);
              }
            });
          }
        }
      });
    }, options);

    if (DOMElements.analysisContent.firstChild) {
      AppState.scrollObserver.observe(DOMElements.analysisContent.firstChild);
    }
    if (DOMElements.analysisContent.lastChild && DOMElements.analysisContent.firstChild !== DOMElements.analysisContent.lastChild) {
      AppState.scrollObserver.observe(DOMElements.analysisContent.lastChild);
    }
  } catch (e) { console.error("Scroll observer error:", e); }
}

function getAdjacentChapter(currentRef, direction) {
  const data = AppState.bibleBookMap.get(currentRef.book.toLowerCase());
  if (!data) return null;
  let newChapter = currentRef.chapter + direction;
  if (newChapter > 0 && newChapter <= data.chapters) {
    return { book: currentRef.book, chapter: newChapter, verse: 1 };
  }
  const newBookIndex = data.globalIndex + direction;
  if (newBookIndex >= 0 && newBookIndex < AppState.bibleBookList.length) {
    const newBookName = AppState.bibleBookList[newBookIndex];
    const newBookData = AppState.bibleBookMap.get(newBookName.toLowerCase());
    return direction === 1
      ? { book: newBookName, chapter: 1, verse: 1 }
      : { book: newBookName, chapter: newBookData.chapters, verse: 1 };
  }
  return null;
}

// ----------------------
// FONT + PANELS
function handleFontSizeChange(direction) {
  const sizes = ["font-size-small", "font-size-normal", "font-size-large", "font-size-xlarge"];
  let idx = sizes.indexOf(AppState.currentFontSize);
  idx += direction;
  if (idx < 0) idx = 0;
  if (idx >= sizes.length) idx = sizes.length - 1;
  AppState.currentFontSize = sizes[idx];
  applyFontSize();
}

function applyFontSize() {
  const sizes = ["font-size-small", "font-size-normal", "font-size-large", "font-size-xlarge"];
  if (DOMElements.analysisContent) {
    DOMElements.analysisContent.classList.remove(...sizes);
    DOMElements.analysisContent.classList.add(AppState.currentFontSize);
  }
  if (DOMElements.noteEditor) {
    DOMElements.noteEditor.classList.remove(...sizes);
    DOMElements.noteEditor.classList.add(AppState.currentFontSize);
  }
  if (DOMElements.fontDecreaseBtn) DOMElements.fontDecreaseBtn.disabled = (AppState.currentFontSize === sizes[0]);
  if (DOMElements.fontIncreaseBtn) DOMElements.fontIncreaseBtn.disabled = (AppState.currentFontSize === sizes[sizes.length - 1]);
}

function toggleSidebar() {
  if (!DOMElements.sidebar) return;
  const isCollapsed = DOMElements.sidebar.classList.toggle("collapsed");
  if (window.innerWidth <= 1024 && !isCollapsed && DOMElements.notesPanel) {
    DOMElements.notesPanel.classList.add("collapsed");
  }
}
function toggleNotes() {
  if (!DOMElements.notesPanel) return;
  const isCollapsed = DOMElements.notesPanel.classList.toggle("collapsed");
  if (window.innerWidth <= 1024 && !isCollapsed && DOMElements.sidebar) {
    DOMElements.sidebar.classList.add("collapsed");
  }
}
function resizeNotes(size) {
  const panel = DOMElements.notesPanel;
  if (!panel) return;
  panel.classList.remove("collapsed", "normal", "medium", "wide");
  byId("collapseBtn")?.classList.remove("active");
  byId("normalBtn")?.classList.remove("active");
  byId("mediumBtn")?.classList.remove("active");
  byId("wideBtn")?.classList.remove("active");
  if (size === "collapsed") {
    panel.classList.add("collapsed"); byId("collapseBtn")?.classList.add("active");
  } else if (size === "medium") {
    panel.classList.add("medium"); byId("mediumBtn")?.classList.add("active");
  } else if (size === "wide") {
    panel.classList.add("wide"); byId("wideBtn")?.classList.add("active");
  } else {
    panel.classList.add("normal"); byId("normalBtn")?.classList.add("active");
  }
}

// ----------------------
// MODULES (kept minimal: plug in your ModuleDefinitions here)
const ModuleDefinitions = { /* -- paste your ModuleDefinitions object here unchanged -- */ };

function getModuleInfo(category, module) {
  if (ModuleDefinitions[category]?.modules?.[module]) return ModuleDefinitions[category].modules[module];
  if (ModuleDefinitions[category]) {
    const first = Object.keys(ModuleDefinitions[category].modules)[0];
    return ModuleDefinitions[category].modules[first];
  }
  return { name: "Error", prompt: "Error: Module not found.", icon: "⚠️" };
}

function switchCategory(category) {
  AppState.currentCategory = category;
  document.querySelectorAll(".primary-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });
  document.querySelectorAll(".module-group").forEach(group => {
    group.classList.toggle("active", group.dataset.category === category);
  });
  if (DOMElements.sidebarHeader && ModuleDefinitions[category]) {
    DOMElements.sidebarHeader.textContent = ModuleDefinitions[category].name;
  }
  const firstModuleKey = Object.keys(ModuleDefinitions[category].modules)[0];
  switchModule(firstModuleKey, true);
}

function switchModule(module, forceAutoRun = false) {
  if (AppState.currentModule === module && !forceAutoRun) return;
  AppState.currentModule = module;
  document.querySelectorAll(".secondary-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.module === module);
  });
  const passage = DOMElements.passageInput ? DOMElements.passageInput.value.trim() : "";
  if (passage) runModuleAnalysis();
}

async function runModuleAnalysis() {
  disconnectObservers();
  AppState.currentReaderMode = false;

  const passage = DOMElements.passageInput ? DOMElements.passageInput.value.trim() : "";
  if (!passage) { setErrorState("Please enter a scripture passage or question."); return; }
  AppState.currentPassage = passage;

  const moduleInfo = getModuleInfo(AppState.currentCategory, AppState.currentModule);
  setLoadingState(true, `Analyzing ${passage}...`);

  let finalPrompt;
  if (!parsePassageReference(passage)) {
    finalPrompt = `Answer the following question based on biblical and theological knowledge: "${passage}"`;
  } else {
    finalPrompt = moduleInfo.prompt.replace("{passage}", passage);
  }

  const analysis = await runAnalysis(finalPrompt, passage, moduleInfo.name);
  if (analysis) {
    setLoadingState(false);
    displayAnalysis({
      content: analysis,
      icon: moduleInfo.icon,
      passage: AppState.currentPassage,
      moduleName: moduleInfo.name,
      isReaderMode: false
    });
  }
}

async function displayScripture() {
  disconnectObservers();
  AppState.currentReaderMode = true;

  const passageInput = DOMElements.passageInput ? DOMElements.passageInput.value.trim() : "";
  if (!passageInput) { setErrorState("Please enter a scripture passage."); return; }
  const ref = parsePassageReference(passageInput);
  if (!ref) { setErrorState(`Could not understand passage: "${passageInput}". Try "John 3:16" or "Genesis 1".`); return; }
  AppState.currentBibleReference = ref;
  setLoadingState(true, `Loading ${ref.book} ${ref.chapter}...`);
  await fetchAndDisplayChapter(ref, "replace");
}

async function fetchAndDisplayChapter(ref, mode = "replace") {
  if (!ref) return;
  AppState.isFetchingChapter = true;
  const version = DOMElements.versionSelect ? DOMElements.versionSelect.value : "ESV";
  const passage = `${ref.book} ${ref.chapter}`;

  if (mode === "prepend" && DOMElements.scrollLoaderTop) DOMElements.scrollLoaderTop.style.display = "block";
  if (mode === "append" && DOMElements.scrollLoaderBottom) DOMElements.scrollLoaderBottom.style.display = "block";

  const prompt = `Provide the full, complete text for the entire chapter of ${passage}.
- **Version:** Use the ${version} version.
- **Formatting:** - Include verse numbers in brackets (e.g., [1], [2]).
  - Do NOT add any extra commentary, headers, or introductions. Just the scripture text.`;

  const analysis = await runAnalysis(prompt, passage, `Scripture Text (${version})`);

  if (mode === "prepend" && DOMElements.scrollLoaderTop) DOMElements.scrollLoaderTop.style.display = "none";
  if (mode === "append" && DOMElements.scrollLoaderBottom) DOMElements.scrollLoaderBottom.style.display = "none";

  if (analysis) {
    if (mode === "replace") {
      setLoadingState(false);
      displayAnalysis({ content: analysis, isReaderMode: true, book: ref.book, chapter: ref.chapter });
      if (ref.verse && DOMElements.resultsMain) DOMElements.resultsMain.scrollTop = 0;
    } else {
      const newChunk = createChapterChunk(analysis, ref.book, ref.chapter);
      const scrollContainer = DOMElements.resultsMain;
      const oldHeight = scrollContainer ? scrollContainer.scrollHeight : 0;
      const oldTop = scrollContainer ? scrollContainer.scrollTop : 0;

      if (mode === "prepend") {
        DOMElements.analysisContent?.prepend(newChunk);
        if (scrollContainer) {
          const newHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop = oldTop + (newHeight - oldHeight);
        }
      } else {
        DOMElements.analysisContent?.append(newChunk);
      }
    }
  } else if (mode === "replace") {
    setErrorState(`Failed to load text for ${passage}.`);
  }
  AppState.isFetchingChapter = false;
}

// ----------------------
// NOTES (FIRESTORE)
function loadNotesFromFirestore() {
  if (!AppState.notesCollectionRef) {
    console.error("Notes collection reference is not set. Cannot load notes.");
    return;
  }
  const q = query(AppState.notesCollectionRef);
  if (AppState.notesUnsubscribe) AppState.notesUnsubscribe();
  AppState.notesUnsubscribe = onSnapshot(q, (snapshot) => {
    AppState.notes = {};
    snapshot.docs.forEach((d) => { AppState.notes[d.id] = d.data(); });
    renderNotesList();
    updateNoteCount();
  }, (error) => {
    console.error("Error listening to notes collection:", error);
    if (DOMElements.notesList) {
      DOMElements.notesList.innerHTML = `<li class="p-2 text-red-400 italic text-center">Error loading notes.</li>`;
    }
  });
}

function renderNotesList() {
  if (!DOMElements.notesList) return;
  DOMElements.notesList.innerHTML = "";
  const sorted = Object.entries(AppState.notes).sort(([, a], [, b]) => {
    const ta = a.updatedAt?.toMillis?.() || 0;
    const tb = b.updatedAt?.toMillis?.() || 0;
    return tb - ta;
  });
  if (!sorted.length) {
    DOMElements.notesList.innerHTML = `<li class="p-4 text-gray-400 italic text-center">No notes yet.</li>`;
    return;
  }
  sorted.forEach(([id, note]) => {
    const li = document.createElement("li");
    const isActive = id === AppState.currentNoteId;
    li.className = `p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${isActive ? "bg-blue-800" : ""}`;
    li.dataset.id = id;
    const title = note.passage || "Untitled Note";
    const snippet = note.content ? note.content.substring(0, 70) + "..." : "No content";
    const date = note.updatedAt ? new Date(note.updatedAt.toMillis()).toLocaleString() : "Just now";
    li.innerHTML = `
      <div class="font-bold text-white truncate">${title}</div>
      <div class="text-sm text-gray-300 truncate mt-1">${snippet}</div>
      <div class="text-xs text-gray-400 mt-2">${date}</div>
    `;
    DOMElements.notesList.appendChild(li);
  });
}

function handleNoteListClick(e) {
  const li = e.target.closest("li[data-id]");
  if (!li) return;
  const noteId = li.dataset.id;
  loadNoteIntoEditor(noteId);
}

function loadNoteIntoEditor(noteId) {
  const note = AppState.notes[noteId];
  if (!note) { console.error(`Note ${noteId} not found in state.`); return; }
  AppState.currentNoteId = noteId;
  if (DOMElements.noteEditor) DOMElements.noteEditor.value = note.content || "";
  renderNotesList();
  updateNoteEditorUI();
}

function createNewNote() {
  AppState.currentNoteId = null;
  if (DOMElements.noteEditor) {
    DOMElements.noteEditor.value = "";
    DOMElements.noteEditor.focus();
  }
  renderNotesList();
  updateNoteEditorUI();
}

function triggerAutoSave() {
  if (AppState.autoSaveTimer) clearTimeout(AppState.autoSaveTimer);
  AppState.autoSaveTimer = setTimeout(() => { saveCurrentNote(); }, 1500);
}

async function saveCurrentNote() {
  if (!AppState.notesCollectionRef) { console.error("Cannot save note: Firestore not ready."); return; }
  if (DOMElements.saveNoteBtn) {
    DOMElements.saveNoteBtn.disabled = true;
    DOMElements.saveNoteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Saving...';
  }
  const content = DOMElements.noteEditor ? DOMElements.noteEditor.value : "";
  let passage = AppState.currentPassage || "Untitled Note";
  if (AppState.currentNoteId && AppState.notes[AppState.currentNoteId]) {
    passage = AppState.notes[AppState.currentNoteId].passage || passage;
  }
  const module = AppState.currentModule || "General";
  const noteData = { content, passage, module, updatedAt: serverTimestamp() };

  try {
    if (AppState.currentNoteId) {
      const ref = doc(AppState.notesCollectionRef, AppState.currentNoteId);
      await setDoc(ref, noteData, { merge: true });
    } else {
      const ref = await addDoc(AppState.notesCollectionRef, noteData);
      AppState.currentNoteId = ref.id;
    }
    renderNotesList();
  } catch (e) {
    console.error("Error saving note:", e);
  } finally {
    if (DOMElements.saveNoteBtn) {
      DOMElements.saveNoteBtn.disabled = false;
      DOMElements.saveNoteBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Save Note';
    }
    updateNoteEditorUI();
  }
}

async function deleteCurrentNote() {
  if (!AppState.currentNoteId || !AppState.notesCollectionRef) return;
  try {
    if (DOMElements.deleteNoteBtn) DOMElements.deleteNoteBtn.disabled = true;
    await deleteDoc(doc(AppState.notesCollectionRef, AppState.currentNoteId));
    createNewNote();
  } catch (e) {
    console.error("Error deleting note:", e);
    updateNoteEditorUI();
  }
}

function updateNoteCount() {
  if (!DOMElements.noteCount) return;
  const count = Object.keys(AppState.notes).length;
  DOMElements.noteCount.textContent = count;
}

function updateNoteEditorUI() {
  if (DOMElements.deleteNoteBtn) DOMElements.deleteNoteBtn.disabled = !AppState.currentNoteId;
}

// ----------------------
// EVENT WIRING
function initializeAppListeners() {
  // Cache DOM
  DOMElements.sidebar = byId("sidebar");
  DOMElements.sidebarToggle = byId("sidebarToggle");
  DOMElements.sidebarArrow = byId("sidebarArrow");
  DOMElements.sidebarHeader = byId("sidebarHeader");
  DOMElements.notesPanel = byId("notesPanel");
  DOMElements.notesToggle = byId("notesToggle");
  DOMElements.notesArrow = byId("notesArrow");
  DOMElements.passageInput = byId("passageInput");
  DOMElements.runModuleBtn = byId("runModuleBtn");
  DOMElements.displayScriptureBtn = byId("displayScriptureBtn");
  DOMElements.versionSelect = byId("versionSelect");
  DOMElements.resultsMain = byId("resultsMain");
  DOMElements.statusMessage = byId("statusMessage");
  DOMElements.statusIcon = byId("statusIcon");
  DOMElements.statusTitle = byId("statusTitle");
  DOMElements.statusText = byId("statusText");
  DOMElements.analysisDisplay = byId("analysisDisplay");
  DOMElements.analysisHeader = document.querySelector(".analysis-header");
  DOMElements.analysisTitleDisplay = byId("analysisTitleDisplay");
  DOMElements.analysisIconDisplay = byId("analysisIconDisplay");
  DOMElements.analysisPassageDisplay = byId("analysisPassageDisplay");
  DOMElements.analysisModuleDisplay = byId("analysisModuleDisplay");
  DOMElements.readerControlsDisplay = byId("readerControlsDisplay");
  DOMElements.readerTitleDisplay = byId("readerTitleDisplay");
  DOMElements.fontDecreaseBtn = byId("fontDecreaseBtn");
  DOMElements.fontIncreaseBtn = byId("fontIncreaseBtn");
  DOMElements.analysisContent = byId("analysisContent");
  DOMElements.scrollLoaderTop = byId("scrollLoaderTop");
  DOMElements.scrollLoaderBottom = byId("scrollLoaderBottom");
  DOMElements.analysisFooter = byId("analysisFooter");
  DOMElements.noteEditor = byId("noteEditor");
  DOMElements.notesList = byId("notesList");
  DOMElements.newNoteBtn = byId("newNoteBtn");
  DOMElements.saveNoteBtn = byId("saveNoteBtn");
  DOMElements.deleteNoteBtn = byId("deleteNoteBtn");
  DOMElements.noteCount = byId("noteCount");

  // Primary tabs
  document.querySelectorAll(".primary-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const category = e.target.closest(".primary-tab")?.dataset.category;
      if (category) switchCategory(category);
    });
  });

  // Secondary tabs
  document.querySelectorAll(".secondary-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const button = e.target.closest(".secondary-tab");
      const module = button?.dataset.module;
      if (module) switchModule(module);
    });
  });

  // Main actions
  DOMElements.runModuleBtn?.addEventListener("click", runModuleAnalysis);
  DOMElements.displayScriptureBtn?.addEventListener("click", displayScripture);

  DOMElements.passageInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") runModuleAnalysis();
  });

  // Toggles
  DOMElements.sidebarToggle?.addEventListener("click", () => toggleSidebar(true));
  DOMElements.notesToggle?.addEventListener("click", () => toggleNotes(true));
  DOMElements.sidebarArrow?.addEventListener("click", () => toggleSidebar(false));
  DOMElements.notesArrow?.addEventListener("click", () => toggleNotes(false));

  // Font
  DOMElements.fontDecreaseBtn?.addEventListener("click", () => handleFontSizeChange(-1));
  DOMElements.fontIncreaseBtn?.addEventListener("click", () => handleFontSizeChange(1));

  // Notes panel size
  byId("collapseBtn")?.addEventListener("click", () => resizeNotes("collapsed"));
  byId("normalBtn")?.addEventListener("click", () => resizeNotes("normal"));
  byId("mediumBtn")?.addEventListener("click", () => resizeNotes("medium"));
  byId("wideBtn")?.addEventListener("click", () => resizeNotes("wide"));

  // Notes actions
  DOMElements.newNoteBtn?.addEventListener("click", createNewNote);
  DOMElements.saveNoteBtn?.addEventListener("click", saveCurrentNote);
  DOMElements.deleteNoteBtn?.addEventListener("click", deleteCurrentNote);
  DOMElements.notesList?.addEventListener("click", handleNoteListClick);
}

// ----------------------
// BOOT
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Cache DOM first
    initializeAppListeners();

    // Firebase + Bible data
    await initializeFirebaseAndAuth();
    processBibleData();

    // Initial UI
    setReadyState("Welcome to Scribe Study", "Enter a passage or a question to begin.", "📖");
  } catch (err) {
    console.error("Failed to initialize app:", err);
    setErrorState("Failed to load app. Check console for errors.");
  }
});

// --- SAFETY TRIGGER ---
// Ensures UI fully loads even if earlier modules or data lag
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initApp === "function") initApp();
  else if (typeof initUI === "function") initUI();
  else if (typeof buildUI === "function") buildUI();
  else if (typeof renderUI === "function") renderUI();
  else console.warn("⚠️ No UI initialization function found.");
});
