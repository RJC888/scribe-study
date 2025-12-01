/**
 * VisualizationEngine.js
 * Orchestrates visualization selection, ranking, and carousel logic
 * Handles genre detection and prompt-based prioritization
 */

import { TimelineVisualizer } from "./TimelineVisualizer.js";
import { CharacterMapVisualizer } from "./CharacterMapVisualizer.js";
import { ParallelismVisualizer } from "./ParallelismVisualizer.js";
import { ChiasmVisualizer } from "./ChiasmVisualizer.js";
import { OMindmap } from "../modules/OMindmap.js";

export class VisualizationEngine {
  constructor() {
    this.availableVisualizers = {
      timeline: TimelineVisualizer,
      characterMap: CharacterMapVisualizer,
      parallelism: ParallelismVisualizer,
      chiasm: ChiasmVisualizer,
      mindmap: OMindmap,
    };

    // Genre-to-visualization mappings
    this.genrePreferences = {
      "historical-narrative": {
        primary: ["timeline", "characterMap", "mindmap"],
        secondary: ["chiasm", "parallelism"],
        wildcard: ["symbolChart"],
      },
      poetry: {
        primary: ["parallelism", "chiasm"],
        secondary: ["mindmap", "imageCluster"],
        wildcard: ["timeline"],
      },
      prophecy: {
        primary: ["symbolChart", "chiasm", "mindmap"],
        secondary: ["intertextualLinks", "timelineLayered"],
        wildcard: ["characterMap"],
      },
      wisdom: {
        primary: ["parallelism", "contrastTable", "mindmap"],
        secondary: ["chiasm", "imageCluster"],
        wildcard: ["timeline"],
      },
      "law-covenant": {
        primary: ["structureOutline", "comparisonGrid"],
        secondary: ["timelineCovenantal", "mindmap"],
        wildcard: ["chiasm"],
      },
      gospel: {
        primary: ["timeline", "characterMap", "chiasm"],
        secondary: ["symbolChart", "mindmap"],
        wildcard: ["contrastTable"],
      },
    };

    // Prompt-based ranking adjustments
    this.promptBoosters = {
      devotional: { mindmap: 1.5, symbolChart: 1.3, imageCluster: 1.2 },
      academic: { structureOutline: 1.5, contrastTable: 1.4, chiasm: 1.2 },
      teaching: { timeline: 1.5, characterMap: 1.4, mindmap: 1.1 },
    };

    this.currentCarousel = [];
    this.currentIndex = 0;
  }

  /**
   * Generate ranked carousel for a given passage/context
   */
  async generateCarousel(context) {
    const { passage, genre, prompt, text } = context;

    // Detect genre if not provided
    const detectedGenre = genre || this.detectGenre(passage.ref, text);

    // Get preferred visualizations for this genre
    const prefs = this.genrePreferences[detectedGenre] || this.genrePreferences[
      "historical-narrative"
    ];

    // Build carousel with scoring
    let candidates = [];

    // Add primary visualizations
    prefs.primary.forEach((vis, idx) => {
      candidates.push({
        type: vis,
        score: 100 - idx * 5, // Primary get highest scores
        category: "primary",
      });
    });

    // Add secondary visualizations
    prefs.secondary.forEach((vis, idx) => {
      candidates.push({
        type: vis,
        score: 70 - idx * 5,
        category: "secondary",
      });
    });

    // Add wildcard visualizations (occasional surprises)
    const includeWildcard = Math.random() < 0.4; // 40% chance
    if (includeWildcard && prefs.wildcard.length > 0) {
      const wildcard = prefs.wildcard[0];
      candidates.push({
        type: wildcard,
        score: 50,
        category: "wildcard",
      });
    }

    // Apply prompt-based scoring adjustments
    if (this.promptBoosters[prompt]) {
      candidates = candidates.map((cand) => {
        const boost = this.promptBoosters[prompt][cand.type] || 1;
        return {
          ...cand,
          score: cand.score * boost,
        };
      });
    }

    // Sort by score (descending) and filter to top 5
    candidates.sort((a, b) => b.score - a.score);
    this.currentCarousel = candidates.slice(0, 5).map((cand) => ({
      type: cand.type,
      category: cand.category,
    }));

    this.currentIndex = 0;
    return this.currentCarousel;
  }

  /**
   * Detect genre from passage reference and/or text
   */
  detectGenre(ref, text) {
    // Simple heuristic-based detection
    if (ref.includes("Psalm") || ref.includes("Song of Songs")) return "poetry";
    if (
      ref.includes("Isaiah") ||
      ref.includes("Jeremiah") ||
      ref.includes("Daniel") ||
      ref.includes("Revelation")
    )
      return "prophecy";
    if (
      ref.includes("Proverbs") ||
      ref.includes("Ecclesiastes") ||
      ref.includes("Job")
    )
      return "wisdom";
    if (ref.includes("Exodus") || ref.includes("Leviticus"))
      return "law-covenant";
    if (
      ref.includes("Matthew") ||
      ref.includes("Mark") ||
      ref.includes("Luke") ||
      ref.includes("John")
    )
      return "gospel";

    // Default to historical-narrative for most OT books
    return "historical-narrative";
  }

  /**
   * Get current visualization in carousel
   */
  getCurrentVisualization() {
    if (this.currentCarousel.length === 0) return null;
    return this.currentCarousel[this.currentIndex];
  }

  /**
   * Render current visualization to container
   */
  renderCurrent(container, context) {
    const current = this.getCurrentVisualization();
    if (!current) {
      container.innerHTML =
        "<p>No visualizations available for this passage.</p>";
      return;
    }

    const VisualizerClass = this.availableVisualizers[current.type];
    if (!VisualizerClass) {
      container.innerHTML = `<p>Visualization "${current.type}" not yet implemented.</p>`;
      return;
    }

    const visualizer = new VisualizerClass(container, context);
    visualizer.render();
  }

  /**
   * Navigate carousel
   */
  next() {
    if (this.currentCarousel.length === 0) return;
    this.currentIndex =
      (this.currentIndex + 1) % this.currentCarousel.length;
  }

  prev() {
    if (this.currentCarousel.length === 0) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.currentCarousel.length) %
      this.currentCarousel.length;
  }

  /**
   * Get carousel info for display
   */
  getCarouselInfo() {
    return {
      current: this.currentIndex + 1,
      total: this.currentCarousel.length,
      currentType: this.getCurrentVisualization()?.type || "none",
    };
  }
}

export default new VisualizationEngine();
