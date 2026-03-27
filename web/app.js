const SVG_NS = "http://www.w3.org/2000/svg";
const SCALE = 120;
const PADDING_X = 120;
const PADDING_Y = 90;
const SAVED_LANS_KEY = "gcse_saved_lans";

const NODE_STYLES = {
  wan: { color: "lightgrey", label: "ISP" },
  router: { color: "orange", label: "Router" },
  switch: { color: "violet", label: "Switch" },
  wap: { color: "gold", label: "Wireless Access Point" },
  server: { color: "red", label: "Server" },
  laptop: { color: "skyblue", label: "Laptop" },
  desktop: { color: "lightgreen", label: "Desktop / PC" },
  phone: { color: "pink", label: "Phone" },
  tv: { color: "cyan", label: "TV" },
  printer: { color: "brown", label: "Printer" },
  default: { color: "white", label: "Device" }
};

const NODE_IMAGES = {
  router: "images/router.png",
  switch: "images/switch.png",
  wap: "images/access point.png",
  server: "images/server.png",
  laptop: "images/laptop.png",
  desktop: "images/desktop.png",
  phone: "images/mobile.png",
  tv: "images/tv.png",
  printer: "images/printer.png"
};

const NODE_DESCRIPTIONS = {
  ISP: "The internet service provider links each LAN out to the wider internet and other remote networks.",
  "Home Router": "The router connects the home LAN to the internet and directs traffic between the devices and the WAN.",
  "Home Laptop": "A laptop on the home network joins wirelessly through the router.",
  "Home Phone": "A smartphone connects wirelessly so it can access internet services on the home LAN.",
  "Home TV": "A smart TV can use a wired connection for stable streaming and faster data transfer.",
  "School Router": "The school router links the school's LAN to outside networks, including the internet.",
  "School Switch": "The switch connects multiple wired devices inside the school LAN and forwards data to the correct port.",
  "School Switch 2": "A second switch expands the wired part of the school LAN so more devices can connect.",
  "School WAP": "The wireless access point lets mobile devices join the school network without a cable.",
  "School Desktop 1": "A wired desktop workstation in the school network.",
  "School Desktop 2": "Another wired desktop connected through the switch.",
  "School Office PC 1": "An office desktop computer connected through the second school switch.",
  "School Office PC 2": "Another office desktop linked to the second school switch.",
  "School Laptop 1": "A school laptop using Wi-Fi through the access point.",
  "School Laptop 2": "Another wireless laptop connected through the WAP.",
  "Business Router": "The business router manages traffic between the business LAN and the WAN.",
  "Business Switch": "A switch is useful in a business because many wired devices need reliable connections.",
  "Business Server": "A server stores files, runs services, or manages logins for users on the business network.",
  "Business PC 1": "A wired business workstation connected through the switch.",
  "Business PC 2": "Another wired PC in the business LAN.",
  "Business Printer": "A network printer can be shared by users across the business LAN.",
  "Business WAP": "The business wireless access point provides Wi-Fi for portable devices.",
  "Business Laptop": "A mobile device using the business Wi-Fi network."
};

const NETWORKS = {
  home: {
    title: "Home LAN",
    width: 4.8,
    nodes: [
      { id: "Home Router", x: 0, y: 0.1 },
      { id: "Home Laptop", x: -1.5, y: 1.9 },
      { id: "Home Phone", x: 0, y: 2.2 },
      { id: "Home TV", x: 1.5, y: 1.9 }
    ],
    edges: [
      ["Home Router", "Home TV", "utp"],
      ["Home Router", "Home Laptop", "wifi"],
      ["Home Router", "Home Phone", "wifi"]
    ]
  },
  school: {
    title: "School LAN",
    width: 9.2,
    nodes: [
      { id: "School Router", x: -3.6, y: 0 },
      { id: "School Switch", x: -1.2, y: 0 },
      { id: "School Switch 2", x: 1.4, y: 1.8 },
      { id: "School WAP", x: 1.4, y: -0.6 },
      { id: "School Desktop 1", x: 1.4, y: 3.3 },
      { id: "School Desktop 2", x: 1.4, y: 4.8 },
      { id: "School Office PC 1", x: 3.8, y: 1.1 },
      { id: "School Office PC 2", x: 3.8, y: 2.7 },
      { id: "School Laptop 1", x: 4.8, y: -0.2 },
      { id: "School Laptop 2", x: 4.8, y: 1.3 }
    ],
    edges: [
      ["School Router", "School Switch", "utp"],
      ["School Switch", "School Switch 2", "utp"],
      ["School Switch", "School Desktop 1", "utp"],
      ["School Switch", "School Desktop 2", "utp"],
      ["School Switch", "School WAP", "utp"],
      ["School Switch 2", "School Office PC 1", "utp"],
      ["School Switch 2", "School Office PC 2", "utp"],
      ["School WAP", "School Laptop 1", "wifi"],
      ["School WAP", "School Laptop 2", "wifi"]
    ]
  },
  business: {
    title: "Business LAN",
    width: 7.4,
    nodes: [
      { id: "Business Router", x: -2.7, y: 0 },
      { id: "Business Switch", x: -0.3, y: 0 },
      { id: "Business Server", x: 2.3, y: -0.4 },
      { id: "Business PC 1", x: 2.3, y: 1.2 },
      { id: "Business PC 2", x: 2.3, y: 2.8 },
      { id: "Business Printer", x: 2.3, y: 4.3 },
      { id: "Business WAP", x: 5.1, y: 0.8 },
      { id: "Business Laptop", x: 7.2, y: 0.8 }
    ],
    edges: [
      ["Business Router", "Business Switch", "utp"],
      ["Business Switch", "Business Server", "utp"],
      ["Business Switch", "Business PC 1", "utp"],
      ["Business Switch", "Business PC 2", "utp"],
      ["Business Switch", "Business Printer", "utp"],
      ["Business Switch", "Business WAP", "utp"],
      ["Business WAP", "Business Laptop", "wifi"]
    ]
  }
};

const svg = document.getElementById("network-svg");
const emptyState = document.getElementById("empty-state");
const diagramWrapper = document.getElementById("diagram-wrapper");
const nodeInfo = document.getElementById("node-info");
const form = document.getElementById("network-form");
const nodeLegend = document.getElementById("node-legend");
const savedNetworkOptions = document.getElementById("saved-network-options");
const showLinesToggle = document.getElementById("show-lines-toggle");
const showWanLinesToggle = document.getElementById("show-wan-lines-toggle");
const showConnectionColoursToggle = document.getElementById("show-connection-colours-toggle");
const connectionInfo = document.getElementById("connection-info");
const connectionColourSelect = document.getElementById("connection-colour-select");

let activeNodeId = null;
let currentNodes = [];
let currentEdges = [];
let nodePositionOverrides = {};
let dragState = null;
let suppressClickNodeId = null;

function normalizeConnectionType(type) {
  if (type === "wireless") return "wifi";
  if (type === "wired") return "utp";
  return type;
}

function nodeLabel(node) {
  return node.label || node.id;
}

function nodeCategory(nodeOrId) {
  if (typeof nodeOrId !== "string" && nodeOrId.type) {
    return nodeOrId.type;
  }

  const text = typeof nodeOrId === "string" ? nodeOrId.toLowerCase() : nodeLabel(nodeOrId).toLowerCase();
  if (text.includes("isp")) return "wan";
  if (text.includes("wan")) return "wan";
  if (text.includes("router")) return "router";
  if (text.includes("switch")) return "switch";
  if (text.includes("wap")) return "wap";
  if (text.includes("server")) return "server";
  if (text.includes("laptop")) return "laptop";
  if (text.includes("desktop") || text.includes("pc")) return "desktop";
  if (text.includes("phone")) return "phone";
  if (text.includes("tv")) return "tv";
  if (text.includes("printer")) return "printer";
  return "default";
}

function buildLegend() {
  const entries = Object.values(NODE_STYLES).filter(
    (item, index, array) => array.findIndex((candidate) => candidate.label === item.label) === index
  );

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "legend-item";

    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.backgroundColor = entry.color;

    const label = document.createElement("span");
    label.textContent = entry.label;

    row.append(swatch, label);
    nodeLegend.appendChild(row);
  });
}

function loadSavedLans() {
  try {
    const raw = localStorage.getItem(SAVED_LANS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedLans(savedLans) {
  localStorage.setItem(SAVED_LANS_KEY, JSON.stringify(savedLans));
}

function deleteSavedLan(savedLanId) {
  const savedLans = loadSavedLans().filter((savedLan) => savedLan.id !== savedLanId);
  saveSavedLans(savedLans);
  activeNodeId = null;
  currentNodes = [];
  currentEdges = [];
  renderSavedNetworkOptions();
  render();
}

function renderSavedNetworkOptions() {
  const savedLans = loadSavedLans();
  savedNetworkOptions.innerHTML = "";

  if (savedLans.length === 0) {
    savedNetworkOptions.innerHTML = `<p class="small-note">No saved LANs yet. Save one from the LAN Designer page.</p>`;
    return;
  }

  savedLans.forEach((savedLan) => {
    const wrapper = document.createElement("div");
    wrapper.className = "saved-network-chip";

    const label = document.createElement("label");
    label.className = "choice-chip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "network";
    input.value = `saved:${savedLan.id}`;

    const text = document.createElement("span");
    text.textContent = savedLan.name;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "saved-network-delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteSavedLan(savedLan.id);
    });

    label.append(input, text);
    wrapper.append(label, deleteButton);
    savedNetworkOptions.appendChild(wrapper);
  });
}

function selectedNetworks() {
  return Array.from(form.querySelectorAll("input[name='network']:checked")).map((input) => input.value);
}

function getSavedLan(savedId) {
  return loadSavedLans().find((savedLan) => savedLan.id === savedId);
}

function computeCenters(selected) {
  const widths = selected.map((name) => getNetworkDefinition(name).width);
  const gap = selected.length === 1 ? 0 : 2.7;
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(selected.length - 1, 0);
  let cursor = -totalWidth / 2;

  return selected.map((name, index) => {
    const width = widths[index];
    const center = cursor + width / 2;
    cursor += width + gap;
    return { name, center };
  });
}

function getNetworkDefinition(name) {
  if (NETWORKS[name]) {
    return NETWORKS[name];
  }

  if (name.startsWith("saved:")) {
    const savedLan = getSavedLan(name.replace("saved:", ""));
    if (savedLan) {
      return createSavedNetworkDefinition(savedLan);
    }
  }

  return null;
}

function createSavedNetworkDefinition(savedLan) {
  const xs = savedLan.devices.map((device) => device.x);
  const ys = savedLan.devices.map((device) => device.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spreadX = Math.max(maxX - minX, 180);
  const spreadY = Math.max(maxY - minY, 180);
  const centerX = (minX + maxX) / 2;
  const wanNodeIds = [];

  const nodes = savedLan.devices.map((device) => {
    const normalizedX = ((device.x - centerX) / spreadX) * 6.8;
    const visualType = device.type === "isp" ? "wan" : device.type;
    const normalizedY = visualType === "wan"
      ? -2.8
      : ((device.y - minY) / spreadY) * 4.2;
    const nodeId = `${savedLan.id}:${device.id}`;

    if (visualType === "wan") {
      wanNodeIds.push(nodeId);
    }

    return {
      id: nodeId,
      label: device.name,
      x: normalizedX,
      y: normalizedY,
      type: visualType,
      description: `Student-designed ${DEVICE_LABELS[device.type] || "device"} in the saved LAN "${savedLan.name}".`
    };
  });

  const deviceMap = Object.fromEntries(savedLan.devices.map((device) => [device.id, `${savedLan.id}:${device.id}`]));
    const edges = savedLan.connections.map((connection) => [
      deviceMap[connection.from],
      deviceMap[connection.to],
      normalizeConnectionType(connection.type)
    ]);

  const routerNode = nodes.find((node) => node.type === "router") || nodes[0];
  const width = Math.max(5.5, ((maxX - minX) / spreadX) * 7 + 2.5);

  return {
    title: savedLan.name,
    width,
    nodes,
    edges,
    routerId: routerNode ? routerNode.id : null,
    wanNodeIds
  };
}

const DEVICE_LABELS = {
  isp: "ISP node",
  router: "router",
  switch: "switch",
  wap: "wireless access point",
  server: "server",
  desktop: "desktop computer",
  laptop: "laptop",
  phone: "phone",
  tv: "TV",
  printer: "printer"
};

function layoutNetworks(selected) {
  const nodes = [];
  const edges = [];
  const wanNodeIds = [];
  const centers = computeCenters(selected);
  const topY = 3.4;
  let minX = 0;
  let maxX = 0;
  let minY = -2.8;
  let maxY = -2.8;

  centers.forEach(({ name, center }) => {
    const network = getNetworkDefinition(name);
    if (!network) {
      return;
    }

    let primaryWanNodeId = null;

    if (!network.wanNodeIds || network.wanNodeIds.length === 0) {
      const wanNode = {
        id: `wan-${name.replace(/[^a-z0-9:-]/gi, "-")}`,
        label: "ISP",
        x: center,
        y: -2.8,
        type: "wan"
      };
      nodes.push(wanNode);
      wanNodeIds.push(wanNode.id);
      primaryWanNodeId = wanNode.id;
      minX = Math.min(minX, wanNode.x);
      maxX = Math.max(maxX, wanNode.x);
      minY = Math.min(minY, wanNode.y);
      maxY = Math.max(maxY, wanNode.y);
    }

    network.nodes.forEach((node) => {
      const shifted = {
        id: node.id,
        label: node.label,
        x: node.x + center,
        y: node.type === "wan" ? node.y : node.y + topY,
        type: node.type,
        description: node.description
      };
      nodes.push(shifted);
      minX = Math.min(minX, shifted.x);
      maxX = Math.max(maxX, shifted.x);
      minY = Math.min(minY, shifted.y);
      maxY = Math.max(maxY, shifted.y);
    });

    if (network.wanNodeIds && network.wanNodeIds.length > 0) {
      primaryWanNodeId = network.wanNodeIds[0];
      wanNodeIds.push(primaryWanNodeId);
    }

    const routerNode = network.routerId
      ? network.nodes.find((node) => node.id === network.routerId)
      : network.nodes.find((node) => node.id.includes("Router"));

    if (routerNode && primaryWanNodeId && (!network.wanNodeIds || network.wanNodeIds.length === 0)) {
      edges.push({ from: routerNode.id, to: primaryWanNodeId, type: "fibre" });
    }

    network.edges.forEach(([from, to, type]) => {
      edges.push({
        from,
        to,
        type: normalizeConnectionType(type)
      });
    });
  });

  for (let index = 0; index < wanNodeIds.length - 1; index += 1) {
    edges.push({
      from: wanNodeIds[index],
      to: wanNodeIds[index + 1],
      type: "fibre"
    });
  }

  return {
    nodes,
    edges,
    bounds: {
      minX: minX - 1.3,
      maxX: maxX + 1.3,
      minY: minY - 1.1,
      maxY: maxY + 2.2
    }
  };
}

function toSvgPoint(bounds, x, y) {
  const width = (bounds.maxX - bounds.minX) * SCALE + PADDING_X * 2;
  const height = (bounds.maxY - bounds.minY) * SCALE + PADDING_Y * 2;
  return {
    x: PADDING_X + (x - bounds.minX) * SCALE,
    y: PADDING_Y + (y - bounds.minY) * SCALE
  };
}

function nodeById(nodes, id) {
  return nodes.find((node) => node.id === id);
}

function svgPoint(clientX, clientY) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
  return { x: transformed.x, y: transformed.y };
}

function updateInfoPanel(nodeId) {
  const node = nodeById(currentNodes, nodeId);
  if (!node) {
    return;
  }
  const category = nodeCategory(node);
  const readableType = NODE_STYLES[category].label;
  nodeInfo.innerHTML = `
    <h3>${nodeLabel(node)}</h3>
    <p><strong>Type:</strong> ${readableType}</p>
    <p>${node.description || NODE_DESCRIPTIONS[nodeLabel(node)] || "This device is part of the selected network layout."}</p>
  `;
}

function updateConnectionPanel() {
  const selectedType = connectionColourSelect.value;
  const readableType = selectedType === "wifi" ? "Wi-Fi" : selectedType === "fibre" ? "Fibre optic" : selectedType === "utp" ? "UTP" : "None";
  const count = currentEdges.filter((edge) => edge.type === selectedType).length;

  connectionInfo.innerHTML = selectedType === "default"
    ? `
      <h3>Highlight by type</h3>
      <p>Choose a connection type to highlight all links of that type while you talk through the network.</p>
    `
    : `
      <h3>${readableType} selected</h3>
      <p><strong>Highlighted connections:</strong> ${count}</p>
      <p>All ${readableType.toLowerCase()} connections are now highlighted using their colour.</p>
    `;
}

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

function labelLines(text) {
  const words = text.split(" ");
  if (words.length <= 2) {
    return [text];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function createMultilineLabel(x, y, text, cssClass) {
  const label = createSvgElement("text", {
    x,
    y,
    class: cssClass
  });

  labelLines(text).forEach((line, index) => {
    const tspan = createSvgElement("tspan", {
      x,
      dy: index === 0 ? "0" : "1.15em"
    });
    tspan.textContent = line;
    label.appendChild(tspan);
  });

  return label;
}

function createNodeVisual(point, node, category, style) {
  const radius = category === "wan" ? 42 : 34;
  const group = createSvgElement("g");
  const imagePath = NODE_IMAGES[category];

  const halo = createSvgElement("circle", {
    cx: point.x,
    cy: point.y,
    r: radius + 6,
    class: "network-node-halo"
  });
  group.appendChild(halo);

  if (imagePath) {
    const imageSize = radius * 3.3;
    const image = createSvgElement("image", {
      href: imagePath,
      x: point.x - imageSize / 2,
      y: point.y - imageSize / 2,
      width: imageSize,
      height: imageSize,
      preserveAspectRatio: "xMidYMid meet"
    });
    group.appendChild(image);
    return group;
  }

  const circle = createSvgElement("circle", {
    cx: point.x,
    cy: point.y,
    r: radius,
    fill: style.color
  });
  group.appendChild(circle);
  return group;
}

function drawEdge(edge, nodes, bounds) {
  const fromNode = nodeById(nodes, edge.from);
  const toNode = nodeById(nodes, edge.to);
  const from = toSvgPoint(bounds, fromNode.x, fromNode.y);
  const to = toSvgPoint(bounds, toNode.x, toNode.y);
  const isWanEdge = fromNode.type === "wan" || toNode.type === "wan";
  const highlightClass = connectionColourSelect.value !== "default" && connectionColourSelect.value === edge.type
    ? " type-highlight"
    : "";

  if (isWanEdge) {
    const midY = from.y + (to.y - from.y) * 0.45;
    return createSvgElement("path", {
      d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`,
      class: `network-edge ${edge.type} wan-edge${highlightClass}`,
      fill: "none"
    });
  }

  return createSvgElement("line", {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    class: `network-edge ${edge.type}${highlightClass}`
  });
}

function render() {
  const selected = selectedNetworks();
  svg.innerHTML = "";

  if (selected.length === 0) {
    emptyState.hidden = false;
    diagramWrapper.hidden = true;
    activeNodeId = null;
    nodeInfo.innerHTML = `
      <h3>No LAN selected</h3>
      <p>Tick at least one option to build a network diagram.</p>
    `;
    return;
  }

  emptyState.hidden = true;
  diagramWrapper.hidden = false;

  const { nodes, edges, bounds } = layoutNetworks(selected);
  const positionedNodes = nodes.map((node) => {
    const override = nodePositionOverrides[node.id];
    return override ? { ...node, x: override.x, y: override.y } : node;
  });
  const enrichedEdges = edges.map((edge) => ({ ...edge }));
  currentNodes = positionedNodes;
  currentEdges = enrichedEdges;
  const viewWidth = (bounds.maxX - bounds.minX) * SCALE + PADDING_X * 2;
  const viewHeight = (bounds.maxY - bounds.minY) * SCALE + PADDING_Y * 2;
  svg.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  svg.classList.toggle("color-connections", showConnectionColoursToggle.checked);

  if (showLinesToggle.checked) {
    enrichedEdges.forEach((edge) => {
      const fromNode = nodeById(positionedNodes, edge.from);
      const toNode = nodeById(positionedNodes, edge.to);
      const isWanEdge = fromNode?.type === "wan" || toNode?.type === "wan";
      if (isWanEdge && !showWanLinesToggle.checked) {
        return;
      }
      svg.appendChild(drawEdge(edge, positionedNodes, bounds));
    });
  }

  positionedNodes.forEach((node) => {
    const point = toSvgPoint(bounds, node.x, node.y);
    const category = nodeCategory(node);
    const style = NODE_STYLES[category];
    const group = createSvgElement("g", {
      class: `network-node${activeNodeId === node.id ? " active" : ""}`,
      tabindex: "0",
      role: "button",
      "aria-label": nodeLabel(node)
    });

    const visual = createNodeVisual(point, node, category, style);
    const label = createMultilineLabel(point.x, point.y + 62, nodeLabel(node), "network-label");

    const activate = () => {
      if (suppressClickNodeId === node.id) {
        suppressClickNodeId = null;
        return;
      }
      activeNodeId = node.id;
      updateInfoPanel(node.id);
      render();
    };

    group.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const pointInSvg = svgPoint(event.clientX, event.clientY);
      dragState = {
        id: node.id,
        startX: pointInSvg.x,
        startY: pointInSvg.y,
        nodeStartX: node.x,
        nodeStartY: node.y,
        moved: false
      };
    });

    group.addEventListener("click", activate);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });

    group.append(visual, label);
    svg.appendChild(group);
  });

  if (!activeNodeId || !nodeById(nodes, activeNodeId)) {
    const firstWan = positionedNodes.find((node) => node.type === "wan");
    activeNodeId = firstWan ? firstWan.id : positionedNodes[0]?.id;
  }
  updateInfoPanel(activeNodeId);
  updateConnectionPanel();
}

buildLegend();
renderSavedNetworkOptions();
form.addEventListener("change", render);
showLinesToggle.addEventListener("change", render);
showWanLinesToggle.addEventListener("change", render);
showConnectionColoursToggle.addEventListener("change", render);
connectionColourSelect.addEventListener("change", () => {
  updateConnectionPanel();
  render();
});
svg.addEventListener("pointermove", (event) => {
  if (!dragState) {
    return;
  }

  const point = svgPoint(event.clientX, event.clientY);
  const deltaSvgX = point.x - dragState.startX;
  const deltaSvgY = point.y - dragState.startY;
  const deltaX = deltaSvgX / SCALE;
  const deltaY = deltaSvgY / SCALE;

  if (Math.abs(deltaSvgX) > 3 || Math.abs(deltaSvgY) > 3) {
    dragState.moved = true;
  }

  nodePositionOverrides[dragState.id] = {
    x: dragState.nodeStartX + deltaX,
    y: dragState.nodeStartY + deltaY
  };
  render();
});

svg.addEventListener("pointerup", () => {
  if (dragState && dragState.moved) {
    suppressClickNodeId = dragState.id;
  }
  dragState = null;
});

svg.addEventListener("pointerleave", () => {
  dragState = null;
});
render();
