/**
 * CharacterMapVisualizer.js
 * Renders character relationships and development arcs
 * Ideal for: Historical narratives with multiple characters, character studies
 */

export class CharacterMapVisualizer {
  constructor(container, context) {
    this.container = container;
    this.context = context;
    this.selectedCharacter = null;
  }

  render() {
    this.container.innerHTML = "";
    const characterData = this.buildCharacterData();
    const html = this.createCharacterMapHTML(characterData);
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Build character relationship and development data
   * In production, this would extract from passage analysis
   */
  buildCharacterData() {
    const { passage } = this.context;

    return {
      title: `Character Map: ${passage.ref}`,
      characters: [
        {
          id: "char1",
          name: "Primary Character",
          role: "Protagonist",
          traits: ["Courageous", "Faith-driven", "Sacrificial"],
          arc: "Growth through challenge and divine encounter",
          relationships: ["char2", "char3"],
        },
        {
          id: "char2",
          name: "Supporting Character",
          role: "Ally / Witness",
          traits: ["Loyal", "Faithful", "Observant"],
          arc: "Strengthens and validates protagonist's journey",
          relationships: ["char1"],
        },
        {
          id: "char3",
          name: "Antagonist / Obstacle",
          role: "Opposing Force",
          traits: ["Resistant", "Skeptical", "Self-interested"],
          arc: "Represents the challenge to be overcome",
          relationships: ["char1"],
        },
      ],
    };
  }

  createCharacterMapHTML(data) {
    let html = `
      <div class="character-map-visualizer">
        <h3>${data.title}</h3>
        <div class="character-grid">
    `;

    data.characters.forEach((char) => {
      const isSelected = this.selectedCharacter === char.id;
      html += `
        <div class="character-card ${isSelected ? "selected" : ""}" data-char-id="${char.id}">
          <div class="character-header">
            <h4>${char.name}</h4>
            <span class="character-role">${char.role}</span>
          </div>
          <div class="character-traits">
            <strong>Traits:</strong>
            <div class="traits-list">
              ${char.traits.map((t) => `<span class="trait-tag">${t}</span>`).join("")}
            </div>
          </div>
          <div class="character-arc">
            <strong>Arc:</strong> ${char.arc}
          </div>
          ${
            isSelected
              ? `
            <div class="character-relationships">
              <strong>Related Characters:</strong>
              <ul>
                ${char.relationships.map((relId) => {
                  const relChar = data.characters.find(
                    (c) => c.id === relId
                  );
                  return `<li>${relChar ? relChar.name : "Unknown"}</li>`;
                }).join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>
      `;
    });

    html += `
        </div>
        <div class="character-legend">
          <p><strong>Click a character card to expand details and see relationships.</strong></p>
        </div>
      </div>
    `;

    return html;
  }

  attachEventListeners() {
    const cards = this.container.querySelectorAll(".character-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const charId = card.dataset.charId;
        this.selectedCharacter =
          this.selectedCharacter === charId ? null : charId;
        this.render();
      });
    });
  }
}
