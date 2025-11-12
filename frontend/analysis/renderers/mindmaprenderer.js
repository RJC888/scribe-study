// ==============================
// Simple Mindmap Renderer Placeholder
// ==============================

export function loadMindmapRenderer(container, tags = []) {
  const mapContainer = document.createElement("div");
  mapContainer.classList.add("mindmap-placeholder");

  const center = document.createElement("div");
  center.classList.add("mindmap-center");
  center.textContent = "🧠 Discipleship";

  mapContainer.appendChild(center);

  tags.forEach((t) => {
    const node = document.createElement("div");
    node.classList.add("mindmap-node");
    node.textContent = t;
    mapContainer.appendChild(node);
  });

  container.appendChild(mapContainer);
  console.log("🧩 Mindmap renderer initialized with tags:", tags);
}
