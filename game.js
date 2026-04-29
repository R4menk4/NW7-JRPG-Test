"use strict";

const TILE_SIZE = 48;
const HALF_TILE = TILE_SIZE / 2;

const TILE_ID_B = 0;
const TILE_ID_C = 256;
const TILE_ID_D = 512;
const TILE_ID_E = 768;
const TILE_ID_A5 = 1536;
const TILE_ID_A1 = 2048;
const TILE_ID_A2 = 2816;
const TILE_ID_A3 = 4352;
const TILE_ID_A4 = 5888;
const TILE_ID_MAX = 8192;

const DIRS = {
  ArrowDown: { x: 0, y: 1, code: 2 },
  KeyS: { x: 0, y: 1, code: 2 },
  ArrowLeft: { x: -1, y: 0, code: 4 },
  KeyA: { x: -1, y: 0, code: 4 },
  ArrowRight: { x: 1, y: 0, code: 6 },
  KeyD: { x: 1, y: 0, code: 6 },
  ArrowUp: { x: 0, y: -1, code: 8 },
  KeyW: { x: 0, y: -1, code: 8 },
};

const DIR_BITS = {
  2: 0x01,
  4: 0x02,
  6: 0x04,
  8: 0x08,
};

const REVERSE_DIR = {
  2: 8,
  4: 6,
  6: 4,
  8: 2,
};

const FLOOR_AUTOTILE_TABLE = [
  [[2, 4], [1, 4], [2, 3], [1, 3]], [[2, 0], [1, 4], [2, 3], [1, 3]],
  [[2, 4], [3, 0], [2, 3], [1, 3]], [[2, 0], [3, 0], [2, 3], [1, 3]],
  [[2, 4], [1, 4], [2, 3], [3, 1]], [[2, 0], [1, 4], [2, 3], [3, 1]],
  [[2, 4], [3, 0], [2, 3], [3, 1]], [[2, 0], [3, 0], [2, 3], [3, 1]],
  [[2, 4], [1, 4], [2, 1], [1, 3]], [[2, 0], [1, 4], [2, 1], [1, 3]],
  [[2, 4], [3, 0], [2, 1], [1, 3]], [[2, 0], [3, 0], [2, 1], [1, 3]],
  [[2, 4], [1, 4], [2, 1], [3, 1]], [[2, 0], [1, 4], [2, 1], [3, 1]],
  [[2, 4], [3, 0], [2, 1], [3, 1]], [[2, 0], [3, 0], [2, 1], [3, 1]],
  [[0, 4], [1, 4], [0, 3], [1, 3]], [[0, 4], [3, 0], [0, 3], [1, 3]],
  [[0, 4], [1, 4], [0, 3], [3, 1]], [[0, 4], [3, 0], [0, 3], [3, 1]],
  [[2, 2], [1, 2], [2, 3], [1, 3]], [[2, 2], [1, 2], [2, 3], [3, 1]],
  [[2, 2], [1, 2], [2, 1], [1, 3]], [[2, 2], [1, 2], [2, 1], [3, 1]],
  [[2, 4], [3, 4], [2, 3], [3, 3]], [[2, 4], [3, 4], [2, 1], [3, 3]],
  [[2, 0], [3, 0], [2, 3], [3, 3]], [[2, 0], [3, 0], [2, 1], [3, 3]],
  [[2, 4], [1, 4], [2, 5], [1, 5]], [[2, 0], [1, 4], [2, 5], [1, 5]],
  [[2, 4], [3, 0], [2, 5], [1, 5]], [[2, 0], [3, 0], [2, 5], [1, 5]],
  [[0, 4], [3, 4], [0, 3], [3, 3]], [[2, 2], [1, 2], [2, 5], [1, 5]],
  [[0, 2], [1, 2], [0, 3], [1, 3]], [[0, 2], [1, 2], [0, 3], [3, 1]],
  [[2, 4], [3, 4], [2, 5], [3, 5]], [[2, 0], [3, 0], [2, 5], [3, 5]],
  [[0, 4], [1, 4], [0, 5], [1, 5]], [[0, 4], [3, 0], [0, 5], [1, 5]],
  [[0, 2], [3, 2], [0, 3], [3, 3]], [[0, 2], [1, 2], [0, 5], [1, 5]],
  [[0, 4], [3, 4], [0, 5], [3, 5]], [[2, 2], [3, 2], [2, 5], [3, 5]],
  [[0, 2], [3, 2], [0, 5], [3, 5]], [[0, 2], [1, 2], [0, 5], [3, 5]],
  [[0, 2], [3, 2], [0, 5], [1, 5]], [[0, 2], [3, 2], [0, 5], [3, 5]],
];

const WALL_AUTOTILE_TABLE = [
  [[2, 2], [1, 2], [2, 1], [1, 1]], [[0, 2], [1, 2], [0, 1], [1, 1]],
  [[2, 0], [1, 0], [2, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[2, 2], [3, 2], [2, 1], [3, 1]], [[0, 2], [3, 2], [0, 1], [3, 1]],
  [[2, 0], [3, 0], [2, 1], [3, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]],
  [[2, 2], [1, 2], [2, 3], [1, 3]], [[0, 2], [1, 2], [0, 3], [1, 3]],
  [[2, 0], [1, 0], [2, 3], [1, 3]], [[0, 0], [1, 0], [0, 3], [1, 3]],
  [[2, 2], [3, 2], [2, 3], [3, 3]], [[0, 2], [3, 2], [0, 3], [3, 3]],
  [[2, 0], [3, 0], [2, 3], [3, 3]], [[0, 0], [3, 0], [0, 3], [3, 3]],
  [[0, 2], [1, 2], [0, 1], [1, 1]], [[2, 0], [1, 0], [2, 1], [1, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]],
  [[2, 2], [3, 2], [2, 1], [3, 1]], [[2, 2], [1, 2], [2, 3], [1, 3]],
  [[0, 2], [1, 2], [0, 3], [1, 3]], [[2, 2], [3, 2], [2, 3], [3, 3]],
  [[0, 2], [3, 2], [0, 3], [3, 3]], [[2, 0], [3, 0], [2, 3], [3, 3]],
  [[0, 0], [3, 0], [0, 3], [3, 3]], [[0, 0], [1, 0], [0, 3], [1, 3]],
  [[0, 0], [3, 0], [0, 1], [3, 1]], [[2, 0], [3, 0], [2, 1], [3, 1]],
  [[2, 2], [3, 2], [2, 3], [3, 3]], [[2, 0], [3, 0], [2, 3], [3, 3]],
  [[0, 2], [3, 2], [0, 3], [3, 3]], [[0, 0], [3, 0], [0, 3], [3, 3]],
  [[2, 2], [1, 2], [2, 3], [1, 3]], [[2, 0], [1, 0], [2, 3], [1, 3]],
  [[0, 2], [1, 2], [0, 3], [1, 3]], [[0, 0], [1, 0], [0, 3], [1, 3]],
  [[2, 2], [3, 2], [2, 1], [3, 1]], [[2, 0], [3, 0], [2, 1], [3, 1]],
  [[0, 2], [3, 2], [0, 1], [3, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]],
  [[2, 2], [1, 2], [2, 1], [1, 1]], [[2, 0], [1, 0], [2, 1], [1, 1]],
  [[0, 2], [1, 2], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[0, 0], [3, 0], [0, 3], [3, 3]], [[0, 0], [1, 0], [0, 3], [1, 3]],
];

const state = {
  canvas: document.getElementById("game"),
  ctx: null,
  status: document.getElementById("status"),
  dialog: document.getElementById("dialog"),
  map: null,
  tileset: null,
  images: [],
  npcs: [],
  player: { x: 0, y: 0, facing: 2 },
  camera: { x: 0, y: 0 },
  keys: new Set(),
  moveCooldown: 0,
  dialogTimer: 0,
};

state.ctx = state.canvas.getContext("2d");
state.ctx.imageSmoothingEnabled = false;

init().catch((error) => {
  console.error(error);
  state.status.textContent = `Fehler: ${error.message}`;
});

async function init() {
  const [map, tilesets] = await Promise.all([
    fetchJson("data/Map001.json"),
    fetchJson("data/Tilesets.json"),
  ]);

  const tileset = tilesets[map.tilesetId];
  if (!tileset) {
    throw new Error(`Tileset ${map.tilesetId} wurde nicht gefunden.`);
  }

  state.map = map;
  state.tileset = tileset;
  state.images = await loadTilesetImages(tileset.tilesetNames);
  state.npcs = readNpcs(map);
  state.player = findStartPosition(map);

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", (event) => state.keys.delete(event.code));
  document.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("pointerdown", () => moveByName(button.dataset.dir));
  });

  state.status.textContent = `${tileset.name} · ${map.width}×${map.height}`;
  requestAnimationFrame(gameLoop);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} konnte nicht geladen werden.`);
  }
  return response.json();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`${url} konnte nicht geladen werden.`));
    image.src = url;
  });
}

async function loadTilesetImages(names) {
  return Promise.all(names.map((name) => (name ? loadImage(`img/tilesets/${name}.png`) : Promise.resolve(null))));
}

function resizeCanvas() {
  const wrap = state.canvas.parentElement;
  const bounds = wrap.getBoundingClientRect();
  const width = Math.max(320, Math.floor(bounds.width));
  const height = Math.max(320, Math.floor(bounds.height));
  state.canvas.width = width;
  state.canvas.height = height;
  state.ctx.imageSmoothingEnabled = false;
}

function onKeyDown(event) {
  if (DIRS[event.code]) {
    event.preventDefault();
    state.keys.add(event.code);
  }

  if (event.code === "Space") {
    event.preventDefault();
    talkToNpc();
  }
}

function gameLoop(time) {
  update(time);
  render();
  requestAnimationFrame(gameLoop);
}

function update(time) {
  if (!state.lastTime) state.lastTime = time;
  const delta = time - state.lastTime;
  state.lastTime = time;
  state.moveCooldown = Math.max(0, state.moveCooldown - delta);
  state.dialogTimer = Math.max(0, state.dialogTimer - delta);
  state.dialog.classList.toggle("hidden", state.dialogTimer <= 0);

  if (state.moveCooldown <= 0) {
    const code = [...state.keys].find((key) => DIRS[key]);
    if (code) move(DIRS[code]);
  }
}

function moveByName(name) {
  const dir = {
    down: { x: 0, y: 1, code: 2 },
    left: { x: -1, y: 0, code: 4 },
    right: { x: 1, y: 0, code: 6 },
    up: { x: 0, y: -1, code: 8 },
  }[name];
  if (dir) move(dir);
}

function move(dir) {
  state.player.facing = dir.code;
  const nextX = state.player.x + dir.x;
  const nextY = state.player.y + dir.y;

  if (canMove(state.player.x, state.player.y, nextX, nextY, dir.code)) {
    state.player.x = nextX;
    state.player.y = nextY;
  }

  state.moveCooldown = 120;
}

function canMove(fromX, fromY, toX, toY, dir) {
  if (!insideMap(toX, toY)) return false;
  if (npcAt(toX, toY)) return false;
  return checkPassage(fromX, fromY, dir) && checkPassage(toX, toY, REVERSE_DIR[dir]);
}

function insideMap(x, y) {
  return x >= 0 && y >= 0 && x < state.map.width && y < state.map.height;
}

function checkPassage(x, y, direction) {
  const bit = DIR_BITS[direction];
  const tiles = [3, 2, 1, 0].map((z) => tileAt(x, y, z)).filter((id) => id > 0);

  for (const tileId of tiles) {
    const flag = state.tileset.flags[tileId] ?? 0;
    if (flag & 0x10) continue;
    if ((flag & bit) === 0) return true;
    if ((flag & bit) === bit) return false;
  }

  return false;
}

function tileAt(x, y, z) {
  if (!insideMap(x, y)) return 0;
  return state.map.data[(z * state.map.height + y) * state.map.width + x] || 0;
}

function render() {
  const { ctx, canvas, map, player } = state;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mapPixelWidth = map.width * TILE_SIZE;
  const mapPixelHeight = map.height * TILE_SIZE;
  state.camera.x = clamp(player.x * TILE_SIZE + HALF_TILE - canvas.width / 2, 0, Math.max(0, mapPixelWidth - canvas.width));
  state.camera.y = clamp(player.y * TILE_SIZE + HALF_TILE - canvas.height / 2, 0, Math.max(0, mapPixelHeight - canvas.height));

  const minX = Math.max(0, Math.floor(state.camera.x / TILE_SIZE) - 1);
  const minY = Math.max(0, Math.floor(state.camera.y / TILE_SIZE) - 1);
  const maxX = Math.min(map.width - 1, Math.ceil((state.camera.x + canvas.width) / TILE_SIZE) + 1);
  const maxY = Math.min(map.height - 1, Math.ceil((state.camera.y + canvas.height) / TILE_SIZE) + 1);

  drawTileLayers(0, 1, minX, minY, maxX, maxY);
  drawNpcs();
  drawPlayer();
  drawTileLayers(2, 3, minX, minY, maxX, maxY);
}

function drawTileLayers(firstLayer, lastLayer, minX, minY, maxX, maxY) {
  for (let z = firstLayer; z <= lastLayer; z += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        drawTile(tileAt(x, y, z), x * TILE_SIZE - state.camera.x, y * TILE_SIZE - state.camera.y);
      }
    }
  }
}

function drawTile(tileId, dx, dy) {
  if (tileId <= 0) return;

  if (tileId >= TILE_ID_A1 && tileId < TILE_ID_MAX) {
    drawAutotile(tileId, dx, dy);
    return;
  }

  const source = getNormalTileSource(tileId);
  if (!source || !source.image) return;
  state.ctx.drawImage(source.image, source.sx, source.sy, TILE_SIZE, TILE_SIZE, Math.round(dx), Math.round(dy), TILE_SIZE, TILE_SIZE);
}

function getNormalTileSource(tileId) {
  if (tileId >= TILE_ID_A5 && tileId < TILE_ID_A1) {
    const index = tileId - TILE_ID_A5;
    return {
      image: state.images[4],
      sx: (index % 8) * TILE_SIZE,
      sy: Math.floor(index / 8) * TILE_SIZE,
    };
  }

  if (tileId >= TILE_ID_B && tileId < TILE_ID_A5) {
    const setId = 5 + Math.floor(tileId / 256);
    const index = tileId % 256;
    return {
      image: state.images[setId],
      sx: (index % 8) * TILE_SIZE,
      sy: Math.floor(index / 8) * TILE_SIZE,
    };
  }

  return null;
}

function drawAutotile(tileId, dx, dy) {
  const info = getAutotileInfo(tileId);
  const image = state.images[info.setId];
  if (!image) return;

  const table = info.wall ? WALL_AUTOTILE_TABLE : FLOOR_AUTOTILE_TABLE;
  const quarters = table[info.shape] || table[0];
  const blockWidth = info.wall ? 96 : 96;
  const blockHeight = info.wall ? 96 : 144;
  const bx = (info.kind % 8) * blockWidth;
  const by = Math.floor(info.kind / 8) * blockHeight;

  quarters.forEach(([qx, qy], index) => {
    const sx = bx + qx * HALF_TILE;
    const sy = by + qy * HALF_TILE;
    const ox = index % 2 === 0 ? 0 : HALF_TILE;
    const oy = index < 2 ? 0 : HALF_TILE;
    state.ctx.drawImage(image, sx, sy, HALF_TILE, HALF_TILE, Math.round(dx + ox), Math.round(dy + oy), HALF_TILE, HALF_TILE);
  });
}

function getAutotileInfo(tileId) {
  if (tileId >= TILE_ID_A4) {
    return { setId: 3, kind: Math.floor((tileId - TILE_ID_A4) / 48), shape: (tileId - TILE_ID_A4) % 48, wall: true };
  }
  if (tileId >= TILE_ID_A3) {
    return { setId: 2, kind: Math.floor((tileId - TILE_ID_A3) / 48), shape: (tileId - TILE_ID_A3) % 48, wall: true };
  }
  if (tileId >= TILE_ID_A2) {
    return { setId: 1, kind: Math.floor((tileId - TILE_ID_A2) / 48), shape: (tileId - TILE_ID_A2) % 48, wall: false };
  }
  return { setId: 0, kind: Math.floor((tileId - TILE_ID_A1) / 48), shape: (tileId - TILE_ID_A1) % 48, wall: false };
}

function drawPlayer() {
  const sx = state.player.x * TILE_SIZE - state.camera.x;
  const sy = state.player.y * TILE_SIZE - state.camera.y;
  const ctx = state.ctx;

  ctx.fillStyle = "#2166ff";
  ctx.fillRect(Math.round(sx + 12), Math.round(sy + 8), 24, 34);
  ctx.fillStyle = "#f8d7a4";
  ctx.fillRect(Math.round(sx + 15), Math.round(sy + 5), 18, 16);
  ctx.fillStyle = "#111827";
  ctx.fillRect(Math.round(sx + 18), Math.round(sy + 43), 5, 5);
  ctx.fillRect(Math.round(sx + 25), Math.round(sy + 43), 5, 5);
}

function readNpcs(map) {
  return map.events
    .filter((event) => event && event.name && event.name.startsWith("NPC_"))
    .map((event) => ({ id: event.id, name: event.name, x: event.x, y: event.y }));
}

function drawNpcs() {
  const ctx = state.ctx;
  state.npcs.forEach((npc) => {
    const sx = npc.x * TILE_SIZE - state.camera.x;
    const sy = npc.y * TILE_SIZE - state.camera.y;
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(Math.round(sx + 10), Math.round(sy + 9), 28, 33);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(Math.round(sx + 14), Math.round(sy + 4), 20, 16);
  });
}

function npcAt(x, y) {
  return state.npcs.find((npc) => npc.x === x && npc.y === y);
}

function talkToNpc() {
  const facing = Object.values(DIRS).find((dir) => dir.code === state.player.facing);
  if (!facing) return;
  const npc = npcAt(state.player.x + facing.x, state.player.y + facing.y);
  if (npc) state.dialogTimer = 2500;
}

function findStartPosition(map) {
  const eventStart = map.events.find((event) => event && /player|start/i.test(event.name || ""));
  if (eventStart) {
    return { x: eventStart.x, y: eventStart.y, facing: 2 };
  }

  const centerX = Math.floor(map.width / 2);
  const centerY = Math.floor(map.height / 2);
  const candidates = [];
  for (let radius = 0; radius < Math.max(map.width, map.height); radius += 1) {
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      for (let x = centerX - radius; x <= centerX + radius; x += 1) {
        candidates.push({ x, y });
      }
    }
  }

  const start = candidates.find((pos) => insideMapWithMap(map, pos.x, pos.y) && isPassableOnMap(map, pos.x, pos.y));
  return { x: start?.x ?? centerX, y: start?.y ?? centerY, facing: 2 };
}

function isPassableOnMap(map, x, y) {
  const tiles = [3, 2, 1, 0].map((z) => map.data[(z * map.height + y) * map.width + x] || 0).filter((id) => id > 0);
  for (const tileId of tiles) {
    const flag = state.tileset.flags[tileId] ?? 0;
    if (flag & 0x10) continue;
    return (flag & 0x0f) !== 0x0f;
  }
  return false;
}

function insideMapWithMap(map, x, y) {
  return x >= 0 && y >= 0 && x < map.width && y < map.height;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
