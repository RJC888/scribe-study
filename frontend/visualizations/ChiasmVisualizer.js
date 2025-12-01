/**
 * ChiasmVisualizer.js
 * Renders chiastic (mirror) structures found in biblical passages
 * Ideal for: Psalms, wisdom literature, prophetic passages with nested structures
 */

export class ChiasmVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context;
    this.expandedElements = new Set();
  }

  render() {
    this.container.innerHTML = "";
    const chiasm = this.buildChiasmData();
    const html = this.createChiasmHTML(chiasm);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Build chiasm (ABBA mirror structure) from passage analysis
   */
  buildChiasmData() {
    const { passage } = this.context;

    return {
      title: `Chiastic Structure: ${passage.ref}`,
      structure: [
        {
          id: "elem1",
          level: "outer",
          position: "A",
          content: "Opening Theme or Image",
          detail: "Introduces the main subject or situation.",
          expanded: false,
        },
        {
          id: "elem2",
          level: "inner1",
          position: "B",
          content: "Secondary Development",
          detail: "Develops or expands the opening thought.",
          expanded: false,
        },
        {
          id: "elem3",
          level: "center",
          position: "Center (Pivot)",
          content: "Central Point or Turning Point",
          detail:
            "The heart of the passage; often contains the main emphasis or revelation.",
          expanded: false,
        },
        {
          id: "elem4",
          level: "inner2",
          position: "B'",
          content: "Secondary Development (Reflected)",
          detail: "Mirrors the earlier secondary development.",
          expanded: false,
        },
        {
          id: "elem5",
          level: "outer",
          position: "A'",
          content: "Closing Theme or Image (Reflected)",
          detail: "Mirrors the opening, bringing the structure full circle.",
          expanded: false,
        },
      ],
    };
  }

  createChiasmHTML(chiasm) {
    let html = `
      <div class="chiasm-visualizer">
        <h3>${chiasm.title}</h3>
        <p class="chiasm-intro">Chiasm (ABBA structure) uses mirroring to emphasize the central point.</p>
        <div class="chiasm-diagram">
    `;

    // Calculate proper indentation for visual effect
    chiasm.structure.forEach((elem, index) => {
      const isExpanded = this.expandedElements.has(elem.id);
      const indentClass = {
        outer: "indent-outer",
        inner1: "indent-inner1",
        inner2: "indent-inner2",
        center: "indent-center",
      }[elem.level];

      const positionLabel =
        elem.position === "Center (Pivot)"
          ? `<span class="center-label">❖ ${elem.position} ❖</span>`
          : `<span class="position-label">${elem.position}</span>`;

      html += `
        <div class="chiasm-element ${indentClass}" data-elem-id="${elem.id}">
          <div class="element-bar"></div>
          <div class="element-content">
            ${positionLabel}
            <button class="element-toggle ${isExpanded ? "expanded" : ""}" data-elem-id="${elem.id}">
              ${isExpanded ? "−" : "+"} ${elem.content}
            </button>
            ${
              isExpanded
                ? `<div class="element-detail">${elem.detail}</div>`
                : ""
            }
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="chiasm-legend">
          <p><strong>How to read:</strong> Elements marked A and A' are parallel, as are B and B'. The center contains the main emphasis.</p>
        </div>
      </div>
    `;

    return html;
  }

  attachEventListeners() {
    const toggles = this.container.querySelectorAll(".element-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const elemId = btn.dataset.elemId;
        if (this.expandedElements.has(elemId)) {
          this.expandedElements.delete(elemId);
        } else {
          this.expandedElements.add(elemId);
        }
        this.render();
      });
    });
  }
}
