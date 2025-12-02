/**
 * ContrastTableVisualizer.js
 * Renders side-by-side comparison of contrasting concepts
 * Ideal for: Wisdom literature, ethical teaching, moral contrasts
 * Examples: Wise vs. Foolish (Proverbs), Flesh vs. Spirit (Paul's letters)
 */

export class ContrastTableVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context;
    this.expandedRows = new Set();
  }

  render() {
    this.container.innerHTML = "";
    const contrastData = this.buildContrastData();
    const html = this.createContrastTableHTML(contrastData);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Extract or generate contrast data from passage
   * In production, this would parse passage text for opposing concepts
   */
  buildContrastData() {
    const { passage } = this.context;

    return {
      title: `Contrast Analysis: ${passage.ref}`,
      contrasts: [
        {
          id: "contrast1",
          type: "Moral",
          leftConcept: "Wise",
          rightConcept: "Foolish",
          leftTraits: ["Listens to counsel", "Fears the Lord", "Humble"],
          rightTraits: ["Rejects advice", "Self-centered", "Proud"],
          supportingVerses: ["Proverbs 1:7", "Proverbs 12:15", "Proverbs 14:8"],
          expanded: false,
          explanation:
            "The book of Proverbs repeatedly contrasts the wise person who listens and learns from the foolish person who pursues their own way.",
        },
        {
          id: "contrast2",
          type: "Ethical",
          leftConcept: "Spirit",
          rightConcept: "Flesh",
          leftTraits: ["Crucified with Christ", "Produces fruit of the Spirit", "Guided by God"],
          rightTraits: ["Desires wage war", "Produces sin", "Enslaves"],
          supportingVerses: ["Galatians 5:16-17", "Galatians 5:22-23", "Romans 6:6"],
          expanded: false,
          explanation:
            "Paul contrasts living by the Spirit (aligned with God) versus living by the flesh (self-centered desires and sinful nature).",
        },
        {
          id: "contrast3",
          type: "Temporal",
          leftConcept: "Eternal",
          rightConcept: "Temporal",
          leftTraits: ["Lasts forever", "Comes from God", "Imperishable"],
          rightTraits: ["Fades away", "Worldly", "Decaying"],
          supportingVerses: ["2 Corinthians 4:17-18", "1 John 2:15-17", "1 Peter 1:23"],
          expanded: false,
          explanation:
            "Scripture distinguishes between temporary earthly concerns and eternal spiritual realities, calling believers to value the eternal.",
        },
        {
          id: "contrast4",
          type: "Spiritual",
          leftConcept: "Light",
          rightConcept: "Darkness",
          leftTraits: ["Reveals truth", "Pure", "From God"],
          rightTraits: ["Conceals evil", "Impure", "Opposes God"],
          supportingVerses: ["John 8:12", "1 John 1:5-7", "2 Corinthians 6:14"],
          expanded: false,
          explanation:
            "Light and darkness represent the fundamental opposition between God's truth and spiritual blindness or deception.",
        },
      ],
    };
  }

  createContrastTableHTML(data) {
    let html = `
      <div class="contrast-table-visualizer">
        <h3>${data.title}</h3>
        <div class="contrast-table">
    `;

    data.contrasts.forEach((contrast) => {
      const isExpanded = this.expandedRows.has(contrast.id);
      html += `
        <div class="contrast-row" data-contrast-id="${contrast.id}">
          <div class="contrast-header">
            <button class="contrast-toggle" data-contrast-id="${contrast.id}">
              ${isExpanded ? "−" : "+"} <span class="contrast-type-badge">${contrast.type}</span>
            </button>
            <div class="contrast-concepts">
              <div class="concept left-concept">
                <strong>${contrast.leftConcept}</strong>
              </div>
              <div class="contrast-divider">vs</div>
              <div class="concept right-concept">
                <strong>${contrast.rightConcept}</strong>
              </div>
            </div>
          </div>

          ${
            isExpanded
              ? `
            <div class="contrast-details">
              <div class="contrast-explanation">
                <p>${contrast.explanation}</p>
              </div>

              <div class="contrast-comparison">
                <div class="trait-column left-column">
                  <h5>${contrast.leftConcept}</h5>
                  <ul>
                    ${contrast.leftTraits.map((trait) => `<li>${trait}</li>`).join("")}
                  </ul>
                </div>
                <div class="trait-column right-column">
                  <h5>${contrast.rightConcept}</h5>
                  <ul>
                    ${contrast.rightTraits.map((trait) => `<li>${trait}</li>`).join("")}
                  </ul>
                </div>
              </div>

              <div class="supporting-verses">
                <strong>Supporting Verses:</strong>
                <div class="verse-list">
                  ${contrast.supportingVerses.map((verse) => `<span class="verse-tag">${verse}</span>`).join("")}
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
    const toggleButtons = this.container.querySelectorAll(".contrast-toggle");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const contrastId = btn.getAttribute("data-contrast-id");
        this.toggleContrastExpanded(contrastId);
      });
    });

    const verseTags = this.container.querySelectorAll(".verse-tag");
    verseTags.forEach((tag) => {
      tag.addEventListener("click", (e) => {
        const verse = e.target.textContent;
        window.dispatchEvent(
          new CustomEvent("navigateToPassage", { detail: { ref: verse } })
        );
      });
    });
  }

  toggleContrastExpanded(contrastId) {
    if (this.expandedRows.has(contrastId)) {
      this.expandedRows.delete(contrastId);
    } else {
      this.expandedRows.add(contrastId);
    }
    this.render();
  }
}
