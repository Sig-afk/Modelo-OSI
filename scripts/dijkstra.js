import { points } from './points.js';

// ===== DOM Elements =====
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
const selectOrigem = document.getElementById('select-origem');
const selectDestino = document.getElementById('select-destino');
const btnCalcular = document.getElementById('btn-calcular');
const btnReset = document.getElementById('btn-reset');
const routeInfo = document.getElementById('route-info');
const noRouteMsg = document.getElementById('no-route-msg');
const routePath = document.getElementById('route-path');
const infoHops = document.getElementById('info-hops');
const infoDist = document.getElementById('info-dist');
const tooltip = document.getElementById('router-tooltip');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// ===== State =====
let routerMap = {};           // id -> point data
let currentPath = [];         // array of router IDs in Dijkstra result
let animationId = null;
let animProgress = 0;
let animSegment = 0;
let hoveredRouter = null;
let animSpeed = 1;

// ===== Image Loading =====
const imgAtivo = new Image();
const imgInativo = new Image();
const imgPacote = new Image();
imgAtivo.src = '../assets/roteador-ativo.png';
imgInativo.src = '../assets/roteador-inativo.png';
imgPacote.src = '../assets/pacote.png';

let imagesLoaded = 0;
const TOTAL_IMAGES = 3;
function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded >= TOTAL_IMAGES) init();
}
imgAtivo.onload = onImageLoad;
imgInativo.onload = onImageLoad;
imgPacote.onload = onImageLoad;

// ===== Coordinate Scaling =====
const PADDING = 50;
const ROUTER_SIZE = 32;
let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;

function calcScale() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  const w = rect.width;
  const h = rect.height;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const dataW = maxX - minX || 1;
  const dataH = maxY - minY || 1;
  scaleX = (w - PADDING * 2) / dataW;
  scaleY = (h - PADDING * 2) / dataH;
  const s = Math.min(scaleX, scaleY);
  scaleX = s;
  scaleY = s;
  offsetX = (w - dataW * s) / 2 - minX * s;
  offsetY = (h - dataH * s) / 2 - minY * s;
}

function tx(x) { return x * scaleX + offsetX; }
function ty(y) { return y * scaleY + offsetY; }

// ===== Build router map and populate dropdowns =====
function buildRouterMap() {
  routerMap = {};
  for (const p of points) {
    routerMap[p.id] = p;
  }
}

function populateDropdowns() {
  const activeRouters = points.filter(p => p.ativo).sort((a, b) => {
    const na = parseInt(a.id.replace('R', ''));
    const nb = parseInt(b.id.replace('R', ''));
    return na - nb;
  });

  for (const r of activeRouters) {
    const opt1 = document.createElement('option');
    opt1.value = r.id;
    opt1.textContent = `${r.id} — ${r.ip}`;
    selectOrigem.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = r.id;
    opt2.textContent = `${r.id} — ${r.ip}`;
    selectDestino.appendChild(opt2);
  }

  if (activeRouters.length > 1) {
    selectOrigem.value = activeRouters[0].id;
    selectDestino.value = activeRouters[activeRouters.length - 1].id;
  }
}

// ===== Dijkstra =====
function euclidean(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function dijkstra(startId, endId) {
  const activeIds = new Set(points.filter(p => p.ativo).map(p => p.id));
  if (!activeIds.has(startId) || !activeIds.has(endId)) return null;

  const dist = {};
  const prev = {};
  const visited = new Set();

  for (const id of activeIds) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  dist[startId] = 0;

  while (true) {
    let u = null;
    let minD = Infinity;
    for (const id of activeIds) {
      if (!visited.has(id) && dist[id] < minD) {
        minD = dist[id];
        u = id;
      }
    }
    if (u === null || u === endId) break;
    visited.add(u);

    const node = routerMap[u];
    for (const neighborId of node.conexoes) {
      if (!activeIds.has(neighborId) || visited.has(neighborId)) continue;
      const neighbor = routerMap[neighborId];
      const alt = dist[u] + euclidean(node, neighbor);
      if (alt < dist[neighborId]) {
        dist[neighborId] = alt;
        prev[neighborId] = u;
      }
    }
  }

  if (dist[endId] === Infinity) return null;

  const path = [];
  let cur = endId;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return { path, distance: dist[endId] };
}

// ===== Drawing =====
function draw() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  drawConnections();
  if (currentPath.length > 1) drawPathHighlight();
  drawRouters();
  if (currentPath.length > 1) drawPacket();
}

function drawConnections() {
  const drawn = new Set();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';

  for (const p of points) {
    for (const cId of p.conexoes) {
      const key = [p.id, cId].sort().join('-');
      if (drawn.has(key)) continue;
      drawn.add(key);

      const other = routerMap[cId];
      if (!other) continue;

      ctx.beginPath();
      ctx.moveTo(tx(p.x), ty(p.y));
      ctx.lineTo(tx(other.x), ty(other.y));
      ctx.stroke();
    }
  }
}

function drawPathHighlight() {
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (let i = 0; i < currentPath.length - 1; i++) {
    const a = routerMap[currentPath[i]];
    const b = routerMap[currentPath[i + 1]];

    const grad = ctx.createLinearGradient(tx(a.x), ty(a.y), tx(b.x), ty(b.y));

    const isVisited = i < animSegment;
    const isCurrent = i === animSegment;

    if (isVisited) {
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#3b82f6');
    } else if (isCurrent) {
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(Math.min(animProgress, 1), '#1d4ed8');
      grad.addColorStop(1, 'rgba(29, 78, 216, 0.2)');
    } else {
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
    }

    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(tx(a.x), ty(a.y));
    ctx.lineTo(tx(b.x), ty(b.y));
    ctx.stroke();
  }

  ctx.lineCap = 'butt';
}

function drawRouters() {
  const radius = ROUTER_SIZE / 2;

  for (const p of points) {
    const x = tx(p.x);
    const y = ty(p.y);
    const img = p.ativo ? imgAtivo : imgInativo;

    const isInPath = currentPath.includes(p.id);
    const pathIdx = currentPath.indexOf(p.id);
    const isVisitedInPath = isInPath && pathIdx <= animSegment;

    ctx.save();

    if (isVisitedInPath) {
      // Glow Azul Neon Vibrante para roteador visitado na rota
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 20;
      
      // Fundo circular holográfico
      ctx.fillStyle = 'rgba(96, 165, 250, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Borda circular
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (p.ativo) {
      // Glow Azul para roteador ativo padrão
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 12;
      
      // Fundo circular holográfico
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Borda circular
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

    } else {
      // Sem glow para inativos, opacidade reduzida e tom cinza
      ctx.globalAlpha = 0.45;
      
      // Fundo circular
      ctx.fillStyle = 'rgba(71, 85, 105, 0.1)';
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Borda circular cinza
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Clip circular para desenhar a imagem cortada como círculo
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    // Desenha a imagem do roteador centralizada e redimensionada
    ctx.drawImage(img, x - radius, y - radius, ROUTER_SIZE, ROUTER_SIZE);

    ctx.restore();
  }
}

function drawPacket() {
  if (animSegment >= currentPath.length - 1) return;

  const a = routerMap[currentPath[animSegment]];
  const b = routerMap[currentPath[animSegment + 1]];
  const px = tx(a.x) + (tx(b.x) - tx(a.x)) * animProgress;
  const py = ty(a.y) + (ty(b.y) - ty(a.y)) * animProgress;
  const pSize = 28;
  const pRadius = pSize / 2;

  ctx.save();
  // Glow Azul Neon no pacote
  ctx.shadowColor = '#60a5fa';
  ctx.shadowBlur = 22;

  // Fundo circular do pacote
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.beginPath();
  ctx.arc(px, py, pRadius + 1, 0, Math.PI * 2);
  ctx.fill();

  // Borda circular do pacote
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Clip circular para a imagem do pacote
  ctx.beginPath();
  ctx.arc(px, py, pRadius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(imgPacote, px - pRadius, py - pRadius, pSize, pSize);
  ctx.restore();
}

// ===== Animation =====
function startAnimation() {
  stopAnimation();
  animSegment = 0;
  animProgress = 0;

  function step() {
    animProgress += 0.012 * animSpeed;
    if (animProgress >= 1) {
      animProgress = 0;
      animSegment++;
      highlightCurrentHop(animSegment);
      if (animSegment >= currentPath.length - 1) {
        animSegment = currentPath.length - 1;
        draw();
        return;
      }
    }
    draw();
    animationId = requestAnimationFrame(step);
  }

  highlightCurrentHop(0);
  animationId = requestAnimationFrame(step);
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function highlightCurrentHop(idx) {
  const hops = routePath.querySelectorAll('.route-hop');
  hops.forEach((h, i) => {
    h.classList.toggle('active-hop', i === idx);
  });
}

// ===== Route Info UI =====
function showRouteInfo(result) {
  noRouteMsg.classList.remove('visible');
  routeInfo.classList.add('visible');

  infoHops.textContent = result.path.length - 1;
  infoDist.textContent = result.distance.toFixed(1) + ' u';

  routePath.innerHTML = '';
  result.path.forEach((id, i) => {
    const r = routerMap[id];
    const hop = document.createElement('div');
    hop.className = 'route-hop' + (i === 0 ? ' active-hop' : '');
    hop.innerHTML = `
      <span class="hop-number">${i + 1}</span>
      <span class="hop-id">${r.id}</span>
      <span class="hop-ip">${r.ip}</span>
    `;
    routePath.appendChild(hop);

    if (i < result.path.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'hop-arrow';
      arrow.textContent = '↓';
      routePath.appendChild(arrow);
    }
  });
}

function showNoRoute() {
  routeInfo.classList.remove('visible');
  noRouteMsg.classList.add('visible');
}

function resetUI() {
  stopAnimation();
  currentPath = [];
  animSegment = 0;
  animProgress = 0;
  routeInfo.classList.remove('visible');
  noRouteMsg.classList.remove('visible');
  routePath.innerHTML = '';
  draw();
}

// ===== Event Handlers =====
btnCalcular.addEventListener('click', () => {
  const origemId = selectOrigem.value;
  const destinoId = selectDestino.value;

  if (!origemId || !destinoId) return;
  if (origemId === destinoId) {
    alert('Selecione roteadores diferentes para origem e destino.');
    return;
  }

  btnCalcular.classList.add('calculating');
  setTimeout(() => {
    const result = dijkstra(origemId, destinoId);

    if (!result) {
      showNoRoute();
      currentPath = [];
      draw();
    } else {
      currentPath = result.path;
      showRouteInfo(result);
      startAnimation();
    }

    btnCalcular.classList.remove('calculating');
  }, 300);
});

btnReset.addEventListener('click', resetUI);

speedSlider.addEventListener('input', () => {
  animSpeed = parseFloat(speedSlider.value);
  speedValue.textContent = animSpeed.toFixed(1) + 'x';
});

// ===== Tooltip (hover) =====
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const half = ROUTER_SIZE / 2;

  let found = null;
  for (const p of points) {
    const px = tx(p.x);
    const py = ty(p.y);
    if (mx >= px - half && mx <= px + half && my >= py - half && my <= py + half) {
      found = p;
      break;
    }
  }

  if (found) {
    hoveredRouter = found;
    tooltip.classList.add('visible');
    tooltip.style.left = tx(found.x) + 'px';
    tooltip.style.top = (ty(found.y) - half - 8) + 'px';
    tooltip.querySelector('.tooltip-title').textContent = found.nome;
    tooltip.querySelector('.tooltip-ip').textContent = found.ip;
    const statusEl = tooltip.querySelector('.tooltip-status');
    statusEl.textContent = found.ativo ? '● Ativo' : '● Inativo';
    statusEl.className = 'tooltip-status ' + (found.ativo ? 'on' : 'off');
    canvas.style.cursor = 'pointer';
  } else {
    hoveredRouter = null;
    tooltip.classList.remove('visible');
    canvas.style.cursor = 'default';
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.classList.remove('visible');
  hoveredRouter = null;
});

// ===== Resize =====
function handleResize() {
  calcScale();
  draw();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleResize, 100);
});

// ===== Init =====
function init() {
  buildRouterMap();
  populateDropdowns();
  calcScale();
  draw();
}

// Fallback if images are cached
if (imgAtivo.complete && imgInativo.complete && imgPacote.complete) {
  imagesLoaded = TOTAL_IMAGES;
  document.addEventListener('DOMContentLoaded', init);
}
