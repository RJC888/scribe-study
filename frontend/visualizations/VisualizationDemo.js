/**
 * VisualizationDemo.js
 * Demo and integration point for visualization modules
 * Shows how to use VisualizationEngine with the carousel
 */

import VisualizationEngine from "./VisualizationEngine.js";

export class VisualizationDemo {
  constructor(container) {
    this.container = container;
    this.currentContext = null;
  }

  /**
   * Initialize demo with sample OT passage contexts
   */
  async initDemo() {
    // Sample context for testing
    const sampleContexts = [
      {
        passage: {
          ref: "1 Samuel 17",
          text: "David and Goliath narrative",
          version: "NIV",
        },
        genre: "historical-narrative",
        prompt: "devotional",
      },
      {
        passage: {
          ref: "Psalm 23",
          text: "The Lord is my shepherd psalm",
          version: "NIV",
        },
        genre: "poetry",
        prompt: "devotional",
      },
      {
        passage: {
          ref: "Isaiah 53",
          text: "Suffering servant prophecy",
          version: "NIV",
        },
        genre: "prophecy",
        prompt: "academic",
      },
    ];

    // Show passage selector
    await this.showContextSelector(sampleContexts);
  }

  /**
   * Show interactive selector for sample passages
   */
  async showContextSelector(contexts) {
    const selector = document.createElement("div");
    selector.className = "visualization-selector";
    selector.innerHTML = `
      <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2>Select a Passage to Visualize</h2>
        <p style="color: #666; margin-bottom: 16px;">Choose an Old Testament passage to see different visualization types.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
          ${contexts
            .map(
              (ctx, idx) => `
            <button class="context-btn" data-idx="${idx}" style="
              padding: 12px;
              background: #f9f9f9;
              border: 2px solid #ddd;
              border-radius: 6px;
              cursor: pointer;
              text-align: left;
              transition: all 0.2s;
              font-size: 14px;
            " onmouseover="this.style.borderColor='#3d6df6'; this.style.boxShadow='0 4px 12px rgba(61,109,246,0.15)'" onmouseout="this.style.borderColor='#ddd'; this.style.boxShadow='none'">
              <strong>${ctx.passage.ref}</strong><br>
              <span style="color: #666; font-size: 12px;">${ctx.genre.replace("-", " ")}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    this.container.innerHTML = "";
    this.container.appendChild(selector);

    // Attach event listeners
    selector.querySelectorAll(".context-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        this.loadContext(contexts[idx]);
      });
    });
  }

  /**
   * Load a passage context and generate carousel
   */
  async loadContext(context) {
    this.currentContext = context;

    // Generate carousel for this context
    await VisualizationEngine.generateCarousel(context);

    // Render the carousel UI
    this.renderCarousel();
  }

  /**
   * Render carousel with current visualization
   */
  renderCarousel() {
    if (!this.currentContext) return;

    const info = VisualizationEngine.getCarouselInfo();

    const carouselHTML = `
      <div class="visualization-carousel">
        <div style="background: white; border-radius: 8px; padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">
          <p style="color: #666; margin: 0 0 8px 0; font-size: 13px;">
            <strong>${this.currentContext.passage.ref}</strong> 
            <span style="color: #999;">• ${this.currentContext.genre.replace("-", " ")}</span>
            <span style="color: #999;">• ${this.currentContext.prompt}</span>
          </p>
        </div>

        <div id="visualization-display" style="
          background: white;
          border-radius: 8px;
          padding: 20px;
          min-height: 300px;
          overflow-y: auto;
        ">
          <!-- Visualization renders here -->
        </div>

        <div class="carousel-nav">
          <button id="carousel-prev" ${info.total <= 1 ? "disabled" : ""}>◀ Previous</button>
          <span class="carousel-info">
            Visualization <strong>${info.current}</strong> / <strong>${info.total}</strong>
            <br><span style="font-size: 12px; color: #999;">${info.currentType}</span>
          </span>
          <button id="carousel-next" ${info.total <= 1 ? "disabled" : ""}>Next ▶</button>
        </div>

        <div style="text-align: center; margin-top: 12px;">
          <button id="back-to-selector" style="
            background: #f0f0f0;
            color: #333;
            border: 1px solid #ddd;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
          ">← Back to Passage Selector</button>
        </div>
      </div>
    `;

    this.container.innerHTML = carouselHTML;

    // Render the visualization
    const displayContainer = this.container.querySelector(
      "#visualization-display"
    );
    VisualizationEngine.renderCurrent(displayContainer, this.currentContext);

    // Attach navigation handlers
    this.container
      .querySelector("#carousel-prev")
      .addEventListener("click", () => {
        VisualizationEngine.prev();
        this.renderCarousel();
      });

    this.container
      .querySelector("#carousel-next")
      .addEventListener("click", () => {
        VisualizationEngine.next();
        this.renderCarousel();
      });

    this.container
      .querySelector("#back-to-selector")
      .addEventListener("click", () => {
        this.initDemo();
      });
  }
}

export default VisualizationDemo;
