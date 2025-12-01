/**
 * ParallelismVisualizer.js
 * Renders parallelism structures for poetry and wisdom passages
 * Ideal for: Psalms, wisdom literature, poetic structures
 */

export class ParallelismVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context;
    this.expandedPairs = new Set();
  }

  render() {
    this.container.innerHTML = "";
    const parallelismData = this.buildParallelismData();
    const html = this.createParallelismHTML(parallelismData);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Build parallelism pairs from passage analysis
   * In production, this would extract from passage structure
   */
  buildParallelismData() {
    const { passage } = this.context;

    return {
      title: `Parallelism Structure: ${passage.ref}`,
      pairs: [
        {
          id: "pair1",
          type: "Synonymous",
          lineA: "First line expressing the main idea",
          lineB: "Second line reinforcing with similar meaning",
          explanation:
            "Both lines convey essentially the same thought, emphasizing the concept.",
          expanded: false,
        },
        {
          id: "pair2",
          type: "Antithetic",
          lineA: "Statement of one perspective or condition",
          lineB: "Contrasting statement offering opposite view",
          explanation:
            "The lines present opposing ideas, creating emphasis through contrast.",
          expanded: false,
        },
        {
          id: "pair3",
          type: "Synthetic",
          lineA: "Initial thought or image",
          lineB: "Building upon or extending the thought",
          explanation:
            "The second line develops or completes the idea in the first line.",
          expanded: false,
        },
      ],
    };
  }

  createParallelismHTML(data) {
    let html = `
      <div class="parallelism-visualizer">
        <h3>${data.title}</h3>
        <div class="parallelism-container">
    `;

    data.pairs.forEach((pair) => {
      const isExpanded = this.expandedPairs.has(pair.id);
      const typeColor =
        {
          Synonymous: "#4CAF50",
          Antithetic: "#FF9800",
          Synthetic: "#2196F3",
        }[pair.type] || "#999";

      html += `
        <div class="parallelism-pair" data-pair-id="${pair.id}">
          <div class="pair-header">
            <button class="pair-toggle ${isExpanded ? "expanded" : ""}" data-pair-id="${pair.id}">
              ${isExpanded ? "−" : "+"} <strong style="color: ${typeColor}">${pair.type}</strong> Parallelism
            </button>
          </div>
          <div class="pair-structure">
            <div class="line-a">
              <span class="line-label">Line A:</span>
              <p>${pair.lineA}</p>
            </div>
            <div class="parallel-connector" style="border-left-color: ${typeColor}"></div>
            <div class="line-b">
              <span class="line-label">Line B:</span>
              <p>${pair.lineB}</p>
            </div>
          </div>
          ${
            isExpanded
              ? `<div class="pair-explanation"><strong>Explanation:</strong> ${pair.explanation}</div>`
              : ""
          }
        </div>
      `;
    });

    html += `
        </div>
        <div class="parallelism-legend">
          <p><strong>Tip:</strong> Hebrew poetry uses parallelism to create meaning and emphasis. Click each pair to learn more.</p>
        </div>
      </div>
    `;

    return html;
  }

  attachEventListeners() {
    const toggles = this.container.querySelectorAll(".pair-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const pairId = btn.dataset.pairId;
        if (this.expandedPairs.has(pairId)) {
          this.expandedPairs.delete(pairId);
        } else {
          this.expandedPairs.add(pairId);
        }
        this.render();
      });
    });
  }
}
