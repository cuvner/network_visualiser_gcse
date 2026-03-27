const SVG_NS = "http://www.w3.org/2000/svg";
const SAVED_LANS_KEY = "gcse_saved_lans";

const DEVICE_LIBRARY = {
  isp: { label: "ISP", color: "lightgrey", baseName: "ISP" },
  router: { label: "Router", color: "orange", baseName: "Router" },
  switch: { label: "Switch", color: "violet", baseName: "Switch" },
  wap: { label: "Wireless Access Point", color: "gold", baseName: "WAP" },
  server: { label: "Server", color: "red", baseName: "Server" },
  desktop: { label: "Desktop / PC", color: "lightgreen", baseName: "PC" },
  laptop: { label: "Laptop", color: "skyblue", baseName: "Laptop" },
  printer: { label: "Printer", color: "brown", baseName: "Printer" },
  phone: { label: "Phone", color: "pink", baseName: "Phone" },
  tv: { label: "TV", color: "cyan", baseName: "TV" }
};

const DEVICE_IMAGES = {
  router: "images/router.png",
  switch: "images/switch.png",
  wap: "images/access point.png",
  server: "images/server.png",
  desktop: "images/desktop.png",
  laptop: "images/laptop.png",
  printer: "images/printer.png",
  phone: "images/mobile.png",
  tv: "images/tv.png"
};

const designerSvg = document.getElementById("designer-svg");
const deviceForm = document.getElementById("device-form");
const deviceTypeInput = document.getElementById("device-type");
const deviceNameInput = document.getElementById("device-name");
const designerInfo = document.getElementById("designer-info");
const deleteDeviceButton = document.getElementById("delete-device-button");
const connectModeButton = document.getElementById("connect-mode-button");
const clearConnectionsButton = document.getElementById("clear-connections-button");
const resetDesignButton = document.getElementById("reset-design-button");
const saveLanNameInput = document.getElementById("save-lan-name");
const saveLanButton = document.getElementById("save-lan-button");
const saveStatus = document.getElementById("save-status");
const designerConnectionColoursToggle = document.getElementById("designer-connection-colours-toggle");

let deviceCount = 0;
let devices = [];
let connections = [];
let selectedDeviceId = null;
let connectMode = false;
let pendingConnectionId = null;
let dragState = null;

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
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

function makeLanId(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `lan-${Date.now()}`;
}

function defaultName(type) {
  const matching = devices.filter((device) => device.type === type).length + 1;
  return `${DEVICE_LIBRARY[type].baseName} ${matching}`;
}

function wrapLabel(text) {
  const words = text.split(" ");
  if (words.length <= 2) {
    return [text];
  }
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function currentConnectionType() {
  const selected = document.querySelector("input[name='connection-type']:checked");
  return selected ? selected.value : "utp";
}

function normalizeConnectionType(type) {
  if (type === "wireless") return "wifi";
  if (type === "wired") return "utp";
  return type;
}

function getDevice(deviceId) {
  return devices.find((device) => device.id === deviceId);
}

function connectionExists(from, to) {
  return connections.some((connection) => {
    return (
      (connection.from === from && connection.to === to) ||
      (connection.from === to && connection.to === from)
    );
  });
}

function updateInfoPanel() {
  const device = getDevice(selectedDeviceId);
  deleteDeviceButton.disabled = !device;

  if (!device) {
    designerInfo.innerHTML = `
      <h3>No device selected</h3>
      <p>Click a device on the canvas to inspect it or remove it.</p>
    `;
    return;
  }

  const connectedCount = connections.filter((connection) => {
    return connection.from === device.id || connection.to === device.id;
  }).length;

  designerInfo.innerHTML = `
    <h3>${device.name}</h3>
    <p><strong>Type:</strong> ${DEVICE_LIBRARY[device.type].label}</p>
    <p><strong>Connections:</strong> ${connectedCount}</p>
    <p>Drag this device to reposition it, or use connect mode to link it to another device.</p>
  `;
}

function updateToolbar() {
  connectModeButton.textContent = connectMode ? "Exit connect mode" : "Connect devices";
  connectModeButton.classList.toggle("secondary", !connectMode);
}

function addDevice(type, name) {
  deviceCount += 1;
  const column = (deviceCount - 1) % 4;
  const row = Math.floor((deviceCount - 1) / 4);
  const x = 200 + column * 280;
  const y = 170 + row * 190;

  devices.push({
    id: `device-${deviceCount}`,
    type,
    name: name || defaultName(type),
    x,
    y
  });

  selectedDeviceId = `device-${deviceCount}`;
  updateInfoPanel();
  renderDesigner();
}

function addConnection(from, to, connectionType = currentConnectionType()) {
  if (from === to || connectionExists(from, to)) {
    return;
  }

  connections.push({
    id: `connection-${connections.length + 1}`,
    from,
    to,
    type: normalizeConnectionType(connectionType)
  });
}

function removeDevice(deviceId) {
  devices = devices.filter((device) => device.id !== deviceId);
  connections = connections.filter((connection) => {
    return connection.from !== deviceId && connection.to !== deviceId;
  });

  if (selectedDeviceId === deviceId) {
    selectedDeviceId = null;
  }
  if (pendingConnectionId === deviceId) {
    pendingConnectionId = null;
  }

  updateInfoPanel();
  renderDesigner();
}

function svgPoint(clientX, clientY) {
  const point = designerSvg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformed = point.matrixTransform(designerSvg.getScreenCTM().inverse());
  return { x: transformed.x, y: transformed.y };
}

function drawConnection(connection) {
  const from = getDevice(connection.from);
  const to = getDevice(connection.to);
  if (!from || !to) {
    return;
  }

  const line = createSvgElement("line", {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    class: `designer-connection ${normalizeConnectionType(connection.type)}`
  });
  designerSvg.appendChild(line);
}

function drawDevice(device) {
  const style = DEVICE_LIBRARY[device.type];
  const group = createSvgElement("g", {
    class: `designer-node${selectedDeviceId === device.id ? " selected" : ""}${pendingConnectionId === device.id ? " connecting" : ""}`,
    "data-device-id": device.id
  });

  const halo = createSvgElement("circle", {
    cx: device.x,
    cy: device.y,
    r: 42,
    class: "designer-node-halo"
  });

  const imagePath = DEVICE_IMAGES[device.type];
  let visual;

  if (imagePath) {
    visual = createSvgElement("image", {
      href: imagePath,
      x: device.x - 60,
      y: device.y - 60,
      width: 120,
      height: 120,
      preserveAspectRatio: "xMidYMid meet"
    });
  } else {
    visual = createSvgElement("circle", {
      cx: device.x,
      cy: device.y,
      r: 36,
      fill: style.color
    });
  }

  const label = createSvgElement("text", {
    x: device.x,
    y: device.y + 60
  });

  wrapLabel(device.name).forEach((line, index) => {
    const tspan = createSvgElement("tspan", {
      x: device.x,
      dy: index === 0 ? "0" : "1.15em"
    });
    tspan.textContent = line;
    label.appendChild(tspan);
  });

  const startDrag = (event) => {
    const point = svgPoint(event.clientX, event.clientY);
    dragState = {
      id: device.id,
      offsetX: point.x - device.x,
      offsetY: point.y - device.y
    };
    selectedDeviceId = device.id;
    updateInfoPanel();
    renderDesigner();
  };

  group.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (connectMode) {
      return;
    }
    startDrag(event);
  });

  group.addEventListener("click", (event) => {
    event.stopPropagation();
    if (connectMode) {
      handleConnectSelection(device.id);
      return;
    }
    selectedDeviceId = device.id;
    updateInfoPanel();
    renderDesigner();
  });

  group.append(halo, visual, label);
  designerSvg.appendChild(group);
}

function handleConnectSelection(deviceId) {
  selectedDeviceId = deviceId;

  if (!pendingConnectionId) {
    pendingConnectionId = deviceId;
    updateInfoPanel();
    renderDesigner();
    return;
  }

  addConnection(pendingConnectionId, deviceId);
  pendingConnectionId = null;
  updateInfoPanel();
  renderDesigner();
}

function renderDesigner() {
  designerSvg.innerHTML = "";
  designerSvg.classList.toggle("color-connections", designerConnectionColoursToggle.checked);

  connections.forEach(drawConnection);
  devices.forEach(drawDevice);
}

deviceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = deviceTypeInput.value;
  const name = deviceNameInput.value.trim();
  addDevice(type, name);
  deviceNameInput.value = "";
});

designerSvg.addEventListener("pointermove", (event) => {
  if (!dragState) {
    return;
  }

  const device = getDevice(dragState.id);
  if (!device) {
    return;
  }

  const point = svgPoint(event.clientX, event.clientY);
  device.x = Math.max(60, Math.min(1340, point.x - dragState.offsetX));
  device.y = Math.max(60, Math.min(840, point.y - dragState.offsetY));
  renderDesigner();
});

saveLanButton.addEventListener("click", () => {
  const lanName = saveLanNameInput.value.trim();

  if (!lanName) {
    saveStatus.textContent = "Enter a LAN name before saving.";
    return;
  }

  if (devices.length === 0) {
    saveStatus.textContent = "Add at least one device before saving this LAN.";
    return;
  }

  const savedLans = loadSavedLans();
  const lanId = makeLanId(lanName);
  const savedLan = {
    id: lanId,
    name: lanName,
    devices: devices.map((device) => ({
      id: device.id,
      type: device.type,
      name: device.name,
      x: device.x,
      y: device.y
    })),
    connections: connections.map((connection) => ({
      from: connection.from,
      to: connection.to,
      type: connection.type
    }))
  };

  const existingIndex = savedLans.findIndex((lan) => lan.id === lanId);
  if (existingIndex >= 0) {
    savedLans[existingIndex] = savedLan;
    saveStatus.textContent = `"${lanName}" updated. It will appear on the Visualiser page.`;
  } else {
    savedLans.push(savedLan);
    saveStatus.textContent = `"${lanName}" saved. It will appear on the Visualiser page.`;
  }

  saveSavedLans(savedLans);
});

designerSvg.addEventListener("pointerup", () => {
  dragState = null;
});

designerSvg.addEventListener("pointerleave", () => {
  dragState = null;
});

designerSvg.addEventListener("click", (event) => {
  if (event.target !== designerSvg) {
    return;
  }

  if (connectMode) {
    pendingConnectionId = null;
  }
  selectedDeviceId = null;
  updateInfoPanel();
  renderDesigner();
});

deleteDeviceButton.addEventListener("click", () => {
  if (selectedDeviceId) {
    removeDevice(selectedDeviceId);
  }
});

connectModeButton.addEventListener("click", () => {
  connectMode = !connectMode;
  pendingConnectionId = null;
  updateToolbar();
  renderDesigner();
});

clearConnectionsButton.addEventListener("click", () => {
  connections = [];
  pendingConnectionId = null;
  updateInfoPanel();
  renderDesigner();
});

resetDesignButton.addEventListener("click", () => {
  deviceCount = 0;
  devices = [];
  connections = [];
  selectedDeviceId = null;
  pendingConnectionId = null;
  connectMode = false;
  updateToolbar();
  updateInfoPanel();
  renderDesigner();
});

designerConnectionColoursToggle.addEventListener("change", renderDesigner);

addDevice("router", "Main Router");
addDevice("isp", "ISP");
addDevice("switch", "Core Switch");
addDevice("desktop", "Student PC");
addDevice("laptop", "Teacher Laptop");
addConnection("device-1", "device-2", "fibre");
selectedDeviceId = null;
updateToolbar();
updateInfoPanel();
renderDesigner();
