/**
 * SymbolChartVisualizer.js
 * Renders symbolic imagery with interpretations and cross-references
 * Ideal for: Prophecy, apocalyptic literature, symbolic imagery analysis
 * Examples: Beasts in Daniel, imagery in Revelation, OT symbols
 */

export class SymbolChartVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context;
    this.expandedSymbols = new Set();
  }

  render() {
    this.container.innerHTML = "";
    const symbolData = this.buildSymbolData();
    const html = this.createSymbolChartHTML(symbolData);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Extract or generate symbol data from passage
   * In production, this would use passage analysis or AI parsing
   */
  buildSymbolData() {
    const { passage } = this.context;

    // Sample symbols for demonstration
    return {
      title: `Symbol Chart: ${passage.ref}`,
      symbols: [
        {
          id: "sym1",
          symbol: "🦁",
          name: "Lion",
          category: "Animal",
          meaning: "Power, strength, divine presence, or judgment",
          expanded: false,
          crossReferences: ["Isaiah 30:6", "Revelation 5:5", "1 Peter 5:8"],
          culturalContext:
            "In Ancient Near Eastern symbolism, the lion represented royalty and divine authority.",
        },
        {
          id: "sym2",
          symbol: "🌊",
          name: "Water / Sea",
          category: "Element",
          meaning: "Chaos, judgment, barrier, or testing",
          expanded: false,
          crossReferences: ["Genesis 1:2", "Matthew 14:24", "Revelation 21:1"],
          culturalContext:
            "The sea represented untamed forces and danger in ancient Hebrew thought.",
        },
        {
          id: "sym3",
          symbol: "👑",
          name: "Crown",
          category: "Object",
          meaning: "Authority, victory, rulership, or faithfulness",
          expanded: false,
          crossReferences: ["2 Timothy 2:5", "1 Peter 5:4", "Revelation 12:1"],
          culturalContext:
            "Crowns symbolized legitimate authority and divine favor in biblical cultures.",
        },
        {
          id: "sym4",
          symbol: "💜",
          name: "Purple",
          category: "Color",
          meaning: "Royalty, wealth, authority, or sacrifice",
          expanded: false,
          crossReferences: ["Mark 15:17", "Acts 16:14", "Revelation 18:12"],
          culturalContext:
            "Purple dye was expensive and rare, reserved for those of high status.",
        },
        {
          id: "sym5",
          symbol: "🕯️",
          name: "Light / Lamp",
          category: "Element",
          meaning: "Guidance, truth, God's Word, or spiritual illumination",
          expanded: false,
          crossReferences: ["Psalm 119:105", "John 8:12", "Revelation 21:23"],
          culturalContext:
            "Light dispelled darkness and represented divine truth and presence.",
        },
      ],
    };
  }

  createSymbolChartHTML(data) {
    let html = `
      <div class="symbol-chart-visualizer">
        <h3>${data.title}</h3>
        <div class="symbol-grid">
    `;

    data.symbols.forEach((symbol) => {
      const isExpanded = this.expandedSymbols.has(symbol.id);
      html += `
        <div class="symbol-card" data-symbol-id="${symbol.id}">
          <div class="symbol-header">
            <div class="symbol-icon">${symbol.symbol}</div>
            <div class="symbol-info">
              <h4>${symbol.name}</h4>
              <span class="symbol-category">${symbol.category}</span>
            </div>
            <button class="symbol-toggle" data-symbol-id="${symbol.id}" title="Toggle details">
              ${isExpanded ? "−" : "+"}
            </button>
          </div>

          <div class="symbol-meaning">
            <strong>Meaning:</strong> ${symbol.meaning}
          </div>

          ${
            isExpanded
              ? `
            <div class="symbol-details">
              <div class="cultural-context">
                <strong>Cultural Context:</strong>
                <p>${symbol.culturalContext}</p>
              </div>

              <div class="cross-references">
                <strong>Cross-References:</strong>
                <div class="reference-list">
                  ${symbol.crossReferences.map((ref) => `<span class="reference-tag">${ref}</span>`).join("")}
                </div>
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  attachEventListeners() {
    const toggleButtons = this.container.querySelectorAll(".symbol-toggle");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const symbolId = btn.getAttribute("data-symbol-id");
        this.toggleSymbolExpanded(symbolId);
      });
    });

    const referenceLinks = this.container.querySelectorAll(".reference-tag");
    referenceLinks.forEach((tag) => {
      tag.addEventListener("click", (e) => {
        const ref = e.target.textContent;
        // Dispatch event to parent app for navigation
        window.dispatchEvent(
          new CustomEvent("navigateToPassage", { detail: { ref } })
        );
      });
    });
  }

  toggleSymbolExpanded(symbolId) {
    if (this.expandedSymbols.has(symbolId)) {
      this.expandedSymbols.delete(symbolId);
    } else {
      this.expandedSymbols.add(symbolId);
    }
    this.render();
  }
}
