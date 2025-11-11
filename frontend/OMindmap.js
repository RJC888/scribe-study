// frontend/modules/OMindmap.js
import { saveReflection } from "../formationEngine.js";

const nodes = [
  { id: "root", label: "I am the vine", relation: null },
  { id: "n1", label: "you are the branches", relation: "identity" },
  { id: "n2", label: "remain in Me", relation: "command" },
  { id: "n3", label: "you will bear much fruit", relation: "result" },
  { id: "n4", label: "apart from Me you can do nothing", relation: "contrast" },
];

const SIZE = 420;
const RADIUS = 150;
const CENTER = { x: SIZE / 2, y: SIZE / 2 };

export function renderMindmap({
  mountId = "mindmap",
  passage = "John 15:5",
  theme = "Union with Christ",
} = {}) {
  const container = document.getElementById(mountId);
  if (!container) {
    console.error(`OMindmap: #${mountId} not found`);
    return;
  }

  container.innerHTML = "";
  container.classList.add("mindmap-container");
  container.style.setProperty("--mm-size", `${SIZE}px`);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", SIZE);
  svg.setAttribute("height", SIZE);
  svg.classList.add("mindmap-lines");
  container.appendChild(svg);

  const rootEl = document.createElement("div");
  rootEl.className = "mindmap-node root";
  rootEl.textContent = nodes[0].label;
  rootEl.style.left = `${CENTER.x}px`;
  rootEl.style.top = `${CENTER.y}px`;
  container.appendChild(rootEl);

  const branches = nodes.slice(1);
  branches.forEach((node, i) => {
    const angle = (i / branches.length) * Math.PI * 2;
    const x = CENTER.x + RADIUS * Math.cos(angle);
    const y = CENTER.y + RADIUS * Math.sin(angle);

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", CENTER.x);
    line.setAttribute("y1", CENTER.y);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "var(--mm-stroke, #6d7c6e)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);

    const el = document.createElement("div");
    el.className = "mindmap-node";
    el.textContent = node.label;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.title = `Relation: ${node.relation}`;

    el.addEventListener("click", async () => {
      const response = window.prompt(`Reflect: How does "${node.label}" connect to your life?`);
      if (response) {
        await saveReflection({
          passage,
          module: "OMindmap",
          visualizationType: "ConceptualMap",
          prompt: `How does "${node.label}" connect to your life?`,
          response,
          theme,
          tags: ["mindmap", node.relation].filter(Boolean),
        });
        alert("Reflection saved!");
      }
    });

    container.appendChild(el);
  });

  console.log("✅ O-Mindmap rendered");
}
