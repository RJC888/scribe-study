/**
 * IntertextualLinksVisualizer.js
 * Renders cross-references, quotations, and allusions between passages
 * Ideal for: All genres - shows Scripture's interconnected unity
 * Examples: OT quotations in NT, prophetic fulfillment, thematic parallels
 */

export class IntertextualLinksVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context;
    this.selectedLink = null;
  }

  render() {
    this.container.innerHTML = "";
    const linkData = this.buildIntertextualData();
    const html = this.createIntertextualHTML(linkData);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Extract or generate intertextual link data
   * In production, this would use a link database or AI analysis
   */
  buildIntertextualData() {
    const { passage } = this.context;

    return {
      title: `Intertextual Links: ${passage.ref}`,
      centerPassage: passage.ref,
      links: [
        {
          id: "link1",
          sourcePassage: passage.ref,
          targetPassage: "Isaiah 53:5",
          type: "fulfillment",
          typeLabel: "Prophetic Fulfillment",
          typeColor: "#d4a373",
          description: "Prophecy of suffering servant fulfilled in Christ's passion",
          strength: "Strong",
          relevance: "This prophecy is seen as directly fulfilled in Jesus's crucifixion.",
        },
        {
          id: "link2",
          sourcePassage: passage.ref,
          targetPassage: "Psalm 22:1",
          type: "quotation",
          typeLabel: "Direct Quotation",
          typeColor: "#4a9eff",
          description: 'Jesus cites this psalm on the cross: "My God, my God, why have you forsaken me?"',
          strength: "Strong",
          relevance:
            "Jesus's words at crucifixion directly quote the opening of this psalm.",
        },
        {
          id: "link3",
          sourcePassage: passage.ref,
          targetPassage: "Genesis 22:1-18",
          type: "allusion",
          typeLabel: "Thematic Allusion",
          typeColor: "#7cb9e8",
          description: "Both passages explore sacrificial obedience and divine provision",
          strength: "Moderate",
          relevance:
            "Abraham's willingness to sacrifice Isaac parallels Christ's sacrifice.",
        },
        {
          id: "link4",
          sourcePassage: passage.ref,
          targetPassage: "Exodus 12:1-14",
          type: "type-antitype",
          typeLabel: "Type and Antitype",
          typeColor: "#92d050",
          description: "Passover lamb prefigures Christ as the ultimate sacrifice",
          strength: "Strong",
          relevance:
            "The Passover lamb's blood protecting Israel typifies Christ's blood for salvation.",
        },
        {
          id: "link5",
          sourcePassage: passage.ref,
          targetPassage: "Zechariah 12:10",
          type: "fulfillment",
          typeLabel: "Prophetic Fulfillment",
          typeColor: "#d4a373",
          description: "Prophecy of piercing that occurs at the crucifixion",
          strength: "Strong",
          relevance:
            "Zechariah prophesies the piercing that John describes in the gospel.",
        },
        {
          id: "link6",
          sourcePassage: passage.ref,
          targetPassage: "1 Corinthians 15:54-57",
          type: "echo",
          typeLabel: "Thematic Echo",
          typeColor: "#c5e1a5",
          description: "Paul echoes resurrection themes from the gospel accounts",
          strength: "Moderate",
          relevance:
            "Paul reflects on the meaning and implications of Christ's resurrection.",
        },
      ],
    };
  }

  createIntertextualHTML(data) {
    // Create SVG network visualization
    let html = `
      <div class="intertextual-links-visualizer">
        <h3>${data.title}</h3>
        
        <div class="intertextual-network">
          <svg class="network-svg" viewBox="0 0 800 500">
            <!-- SVG background -->
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#666" />
              </marker>
            </defs>
            
            <!-- Central node -->
            <circle class="center-node" cx="400" cy="250" r="40" fill="#4a665a" />
            <text class="center-text" x="400" y="260" text-anchor="middle" fill="white" font-weight="bold">
              Center
            </text>

            <!-- Link lines and peripheral nodes will be added dynamically -->
          </svg>
        </div>

        <div class="link-legend">
          <h4>Connection Types</h4>
          <div class="legend-items">
            <span class="legend-item" style="border-left: 4px solid #d4a373">Prophetic Fulfillment</span>
            <span class="legend-item" style="border-left: 4px solid #4a9eff">Direct Quotation</span>
            <span class="legend-item" style="border-left: 4px solid #7cb9e8">Thematic Allusion</span>
            <span class="legend-item" style="border-left: 4px solid #92d050">Type & Antitype</span>
          </div>
        </div>

        <div class="link-list">
          <h4>Intertextual Connections</h4>
          <div class="links-container">
    `;

    data.links.forEach((link) => {
      const isSelected = this.selectedLink === link.id;
      html += `
        <div class="link-card ${isSelected ? "selected" : ""}" data-link-id="${link.id}">
          <div class="link-header">
            <div class="link-type-indicator" style="background-color: ${link.typeColor}" title="${link.typeLabel}"></div>
            <div class="link-passage">
              <span class="target-passage" data-ref="${link.targetPassage}">${link.targetPassage}</span>
              <span class="link-type-label">${link.typeLabel}</span>
            </div>
            <span class="link-strength ${link.strength.toLowerCase()}">${link.strength}</span>
          </div>

          <div class="link-description">
            <p>${link.description}</p>
          </div>

          <div class="link-relevance">
            <strong>Relevance:</strong> ${link.relevance}
          </div>

          <div class="link-actions">
            <button class="view-passage-btn" data-ref="${link.targetPassage}">
              View Passage →
            </button>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    return html;
  }

  attachEventListeners() {
    // Link card selection
    const linkCards = this.container.querySelectorAll(".link-card");
    linkCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".view-passage-btn")) {
          const linkId = card.getAttribute("data-link-id");
          this.selectLink(linkId);
        }
      });
    });

    // View passage buttons
    const viewButtons = this.container.querySelectorAll(".view-passage-btn");
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ref = btn.getAttribute("data-ref");
        window.dispatchEvent(
          new CustomEvent("navigateToPassage", { detail: { ref } })
        );
      });
    });

    // Clickable passage references in link list
    const passageRefs = this.container.querySelectorAll(".target-passage");
    passageRefs.forEach((ref) => {
      ref.style.cursor = "pointer";
      ref.addEventListener("click", (e) => {
        e.stopPropagation();
        const passageRef = e.target.getAttribute("data-ref");
        window.dispatchEvent(
          new CustomEvent("navigateToPassage", { detail: { ref: passageRef } })
        );
      });
    });
  }

  selectLink(linkId) {
    if (this.selectedLink === linkId) {
      this.selectedLink = null;
    } else {
      this.selectedLink = linkId;
    }
    this.render();
  }
}
