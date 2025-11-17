/* ============================================================
   Scribe Study — Bible Formatting Engine (v1)
   ------------------------------------------------------------
   Responsible for:
   - Normalizing raw verse data into { number, text } objects
   - Applying indentation rules (1st verse flush, rest indented)
   - Adding correct classes for Hebrew / Greek / default text
   - Producing HTML for the Display Scripture panel

   Public API (attached to window.BibleFormatter):
   ------------------------------------------------
   1) normalizeVerseData(rawVerses)
      - rawVerses: string OR array
      - Returns: [{ number: "1", text: "In the beginning..." }, ...]

   2) formatPassageToHtml(options)
      - options = {
          language: "hebrew" | "greek" | "english",
          verses: [{ number, text }],
          indentRule: "first-left-rest-indented"
        }
      - Returns: HTML string ready for innerHTML

   3) detectLanguageFromTestament(testament)
      - "ot" => "hebrew"
      - "nt" => "greek"
      - anything else => "english"
   ============================================================ */

(function (global) {
  "use strict";

  /* =========================================
     INTERNAL HELPERS
     ========================================= */

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Try to pull off a leading verse number if present
  // Examples it will handle:
  // "1 In the beginning..."
  // "1. In the beginning..."
  // "1) In the beginning..."
  function parseLineToVerse(line, index) {
    var trimmed = line.trim();
    if (!trimmed) {
      return null;
    }

    var match = trimmed.match(/^(\d+)[\.\)]?\s+(.*)$/);
    if (match) {
      return {
        number: match[1],
        text: match[2]
      };
    }

    // If no explicit number, fall back to index-based
    return {
      number: String(index + 1),
      text: trimmed
    };
  }

  /* =========================================
     PUBLIC: normalizeVerseData(rawVerses)
     ========================================= */

  function normalizeVerseData(rawVerses) {
    // Case 1: Already an array of { number, text }
    if (Array.isArray(rawVerses)) {
      // If it looks like [{ number, text }], just return as-is
      var looksStructured = rawVerses.length === 0 || typeof rawVerses[0] === "object";
      if (looksStructured) {
        return rawVerses
          .filter(function (v) {
            return v && (v.text || v.number);
          })
          .map(function (v, idx) {
            return {
              number: v.number != null ? String(v.number) : String(idx + 1),
              text: v.text != null ? String(v.text) : ""
            };
          });
      }

      // Otherwise treat it as an array of lines
      return rawVerses
        .map(function (line, idx) {
          return parseLineToVerse(String(line || ""), idx);
        })
        .filter(Boolean);
    }

    // Case 2: String -> split on newline
    if (typeof rawVerses === "string") {
      var lines = rawVerses.split(/\r?\n/);
      return lines
        .map(function (line, idx) {
          return parseLineToVerse(line, idx);
        })
        .filter(Boolean);
    }

    // Fallback: empty
    return [];
  }

  /* =========================================
     PUBLIC: detectLanguageFromTestament
     ========================================= */

  function detectLanguageFromTestament(testament) {
    if (!testament) return "english";
    var t = String(testament).toLowerCase();

    if (t === "ot" || t === "old" || t === "old testament") {
      return "hebrew";
    }
    if (t === "nt" || t === "new" || t === "new testament") {
      return "greek";
    }
    return "english";
  }

  /* =========================================
     INTERNAL: computeIndentClass
     - Current rule: 1st verse no indent, others indent-1
     ========================================= */

  function computeIndentClass(index, indentRule) {
    // For now we only implement "first-left-rest-indented"
    // but we keep the switch in case we want more later.
    var rule = indentRule || "first-left-rest-indented";

    switch (rule) {
      case "first-left-rest-indented":
      default:
        return index === 0 ? "indent-0" : "indent-1";
    }
  }

  /* =========================================
     PUBLIC: formatPassageToHtml(options)
     ========================================= */

  function formatPassageToHtml(options) {
    options = options || {};
    var language = (options.language || "english").toLowerCase();
    var verses = normalizeVerseData(options.verses || []);
    var indentRule = options.indentRule || "first-left-rest-indented";

    var isHebrew = language === "hebrew";
    var isGreek = language === "greek";

    var containerClasses = ["scripture-container"];
    if (isHebrew) {
      containerClasses.push("hebrew");
    } else if (isGreek) {
      containerClasses.push("greek");
    }

    var versesHtml = verses
      .map(function (v, index) {
        var indentClass = computeIndentClass(index, indentRule);

        var verseClasses = ["verse", indentClass];
        if (isHebrew) {
          verseClasses.push("hebrew");
        } else if (isGreek) {
          verseClasses.push("greek");
        }

        var numSafe = escapeHtml(v.number);
        var textSafe = escapeHtml(v.text);

        return (
          '<div class="' +
          verseClasses.join(" ") +
          '">' +
          '<span class="verse-number">' +
          numSafe +
          "</span>" +
          '<span class="verse-text">' +
          textSafe +
          "</span>" +
          "</div>"
        );
      })
      .join("\n");

    return '<div class="' + containerClasses.join(" ") + '">' + versesHtml + "</div>";
  }

  /* =========================================
     GLOBAL EXPORT
     ========================================= */

  var BibleFormatter = {
    normalizeVerseData: normalizeVerseData,
    formatPassageToHtml: formatPassageToHtml,
    detectLanguageFromTestament: detectLanguageFromTestament
  };

  global.BibleFormatter = BibleFormatter;
})(window);
