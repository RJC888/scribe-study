/**
 * TimelineVisualizer.js
 * Renders event or character timelines for narrative passages
 * Ideal for: Historical narratives, character arcs, cause-effect sequences
 */

export class TimelineVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context; // { passage, genre, prompt, analysis }
    this.expandedNodes = new Set();
  }

  render() {
    this.container.innerHTML = "";
    const timeline = this.buildTimeline();
    const html = this.createTimelineHTML(timeline);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Extract timeline data from passage analysis
   * For now, we'll create a sample structure; in production,
   * this would parse passage text or use pre-analyzed data
   */
  buildTimeline() {
    const { passage, analysis } = this.context;

    // Sample structure - in production, extract from passage or analysis
    return {
      title: `Timeline: ${passage.ref}`,
      events: [
        {
          id: "evt1",
          time: "Setup",
          description: "Initial situation or character introduction",
          expanded: false,
          details:
            "The opening context provides background and stakes for what follows.",
        },
        {
          id: "evt2",
          time: "Inciting Incident",
          description: "The main conflict or challenge emerges",
          expanded: false,
          details:
            "This is the pivotal moment that propels the narrative forward.",
        },
        {
          id: "evt3",
          time: "Rising Action",
          description: "Events build toward climax",
          expanded: false,
          details:
            "Multiple layers of tension or development occur, deepening the stakes.",
        },
        {
          id: "evt4",
          time: "Climax",
          description: "The turning point or moment of greatest tension",
          expanded: false,
          details:
            "The central crisis is reached; a crucial decision or revelation occurs.",
        },
        {
          id: "evt5",
          time: "Resolution",
          description: "The aftermath and conclusion",
          expanded: false,
          details:
            "The consequences unfold and the narrative reaches its conclusion.",
        },
      ],
    };
  }

  createTimelineHTML(timeline) {
    let html = `
      <div class="timeline-visualizer">
        <h3>${timeline.title}</h3>
        <div class="timeline-container">
    `;

    timeline.events.forEach((event, index) => {
      const isExpanded = this.expandedNodes.has(event.id);
      html += `
        <div class="timeline-event" data-event-id="${event.id}">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <button class="timeline-toggle ${isExpanded ? "expanded" : ""}" data-event-id="${event.id}">
              ${isExpanded ? "−" : "+"} ${event.time}
            </button>
            <p class="timeline-description">${event.description}</p>
            ${
              isExpanded
                ? `<div class="timeline-details">${event.details}</div>`
                : ""
            }
          </div>
        </div>
        ${index < timeline.events.length - 1 ? '<div class="timeline-line"></div>' : ""}
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  attachEventListeners() {
    const toggles = this.container.querySelectorAll(".timeline-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = btn.dataset.eventId;
        if (this.expandedNodes.has(eventId)) {
          this.expandedNodes.delete(eventId);
        } else {
          this.expandedNodes.add(eventId);
        }
        this.render(); // Re-render with expanded state
      });
    });
  }
}
