// =============================================
// Camada 3 — Rede
// Roteamento com Busca Gulosa + Canvas animado
// Utiliza os 100 roteadores de points.js
// Usa imagens de roteador (estilo dijkstra.js)
// Animação do pacote em LOOP contínuo
// =============================================

import { points } from './points.js'

// ── Construir grafo a partir do points.js ──
const GRAPH = {}
for (const p of points) {
  GRAPH[p.id] = {
    ip: p.ip,
    label: p.nome,
    x: p.x,
    y: p.y,
    ativo: p.ativo,
    conexoes: p.conexoes
  }
}

// ── Busca Gulosa (Greedy Best-First Search) ──

function heuristic(aId, bId) {
  const a = GRAPH[aId]
  const b = GRAPH[bId]
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function greedySearch(startId, goalId) {
  const visited = new Set()
  const path = []
  let cur = startId

  while (cur !== goalId) {
    visited.add(cur)
    path.push(cur)

    const neighbors = GRAPH[cur].conexoes.filter(
      n => !visited.has(n) && (GRAPH[n].ativo || n === goalId)
    )

    if (!neighbors.length) return []
    cur = neighbors.reduce((best, n) =>
      heuristic(n, goalId) < heuristic(best, goalId) ? n : best
    )
  }

  path.push(goalId)
  return path
}

// ── Sortear origem e destino entre roteadores ativos ──

function sortearOrigemDestino() {
  const ativos = points.filter(p => p.ativo)
  const idxOrigem = Math.floor(Math.random() * ativos.length)
  let idxDestino
  do {
    idxDestino = Math.floor(Math.random() * ativos.length)
  } while (idxDestino === idxOrigem)
  return { origem: ativos[idxOrigem], destino: ativos[idxDestino] }
}

// ── Pacote de rede ──

function buildNetworkPacket() {
  const { origem, destino } = sortearOrigemDestino()
  const routeIds = greedySearch(origem.id, destino.id)

  const rota = routeIds.map(id => ({
    id,
    ip: GRAPH[id].ip,
    label: GRAPH[id].label,
    x: GRAPH[id].x,
    y: GRAPH[id].y
  }))

  return {
    ipOrigem: origem.ip,
    ipDestino: destino.ip,
    origemId: origem.id,
    destinoId: destino.id,
    rota,
    ttl: 64,
    rotaEncontrada: routeIds.length > 0
  }
}

// ── Animação ──
let animFrameId = null

/**
 * Para a animação da camada de rede.
 */
export function stopNetworkAnimation() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
}

// ── Carregamento de imagens ──
const imgAtivo = new Image()
const imgInativo = new Image()
const imgPacote = new Image()
imgAtivo.src = './assets/roteador-ativo.png'
imgInativo.src = './assets/roteador-inativo.png'
imgPacote.src = './assets/pacote.png'

const ROUTER_SIZE = 32
const PADDING = 50

// ── Renderização do Canvas com imagens (estilo dijkstra.js) ──

/**
 * Renderiza a topologia da rede e a animação de pacote no canvas.
 * A animação roda em loop contínuo.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} networkPacket
 */
function renderCanvas(canvas, networkPacket) {
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const W = rect.width
  const H = rect.height

  // Calcular escala para caber os pontos no canvas
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const dataW = maxX - minX || 1
  const dataH = maxY - minY || 1
  const s = Math.min((W - PADDING * 2) / dataW, (H - PADDING * 2) / dataH)
  const offX = (W - dataW * s) / 2 - minX * s
  const offY = (H - dataH * s) / 2 - minY * s

  function tx(x) { return x * s + offX }
  function ty(y) { return y * s + offY }

  // IDs na rota para highlight
  const routeIdSet = new Set(networkPacket.rota.map(r => r.id))

  // Estado da animação
  let animSegment = 0
  let animProgress = 0
  const SPEED = 0.015
  const radius = ROUTER_SIZE / 2

  function drawConnections() {
    const drawn = new Set()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)'

    for (const p of points) {
      for (const cId of p.conexoes) {
        const key = [p.id, cId].sort().join('-')
        if (drawn.has(key)) continue
        drawn.add(key)
        const other = GRAPH[cId]
        if (!other) continue

        ctx.beginPath()
        ctx.moveTo(tx(p.x), ty(p.y))
        ctx.lineTo(tx(other.x), ty(other.y))
        ctx.stroke()
      }
    }
  }

  function drawPathHighlight() {
    if (networkPacket.rota.length <= 1) return

    ctx.lineWidth = 3
    ctx.lineCap = 'round'

    for (let i = 0; i < networkPacket.rota.length - 1; i++) {
      const a = networkPacket.rota[i]
      const b = networkPacket.rota[i + 1]
      const isVisited = i < animSegment
      const isCurrent = i === animSegment

      ctx.beginPath()
      ctx.moveTo(tx(a.x), ty(a.y))
      ctx.lineTo(tx(b.x), ty(b.y))

      if (isVisited) {
        ctx.strokeStyle = '#3b82f6'
      } else if (isCurrent) {
        const grad = ctx.createLinearGradient(tx(a.x), ty(a.y), tx(b.x), ty(b.y))
        grad.addColorStop(0, '#3b82f6')
        grad.addColorStop(Math.min(animProgress, 1), '#1d4ed8')
        grad.addColorStop(1, 'rgba(29, 78, 216, 0.2)')
        ctx.strokeStyle = grad
      } else {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)'
      }
      ctx.stroke()
    }
    ctx.lineCap = 'butt'
  }

  function drawRouters() {
    for (const p of points) {
      const x = tx(p.x)
      const y = ty(p.y)
      const img = p.ativo ? imgAtivo : imgInativo

      const isInPath = routeIdSet.has(p.id)
      const pathIdx = networkPacket.rota.findIndex(r => r.id === p.id)
      const isVisitedInPath = isInPath && pathIdx >= 0 && pathIdx <= animSegment

      ctx.save()

      if (isVisitedInPath) {
        // Glow azul neon para roteador visitado na rota
        ctx.shadowColor = '#60a5fa'
        ctx.shadowBlur = 20

        ctx.fillStyle = 'rgba(96, 165, 250, 0.25)'
        ctx.beginPath()
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = '#60a5fa'
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (p.ativo) {
        // Glow azul para roteador ativo padrão
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 12

        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'
        ctx.beginPath()
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else {
        // Sem glow para inativos
        ctx.globalAlpha = 0.45

        ctx.fillStyle = 'rgba(71, 85, 105, 0.1)'
        ctx.beginPath()
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Clip circular e desenha a imagem
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, x - radius, y - radius, ROUTER_SIZE, ROUTER_SIZE)

      ctx.restore()
    }
  }

  function drawPacket() {
    if (networkPacket.rota.length <= 1) return
    if (animSegment >= networkPacket.rota.length - 1) return

    const a = networkPacket.rota[animSegment]
    const b = networkPacket.rota[animSegment + 1]
    const px = tx(a.x) + (tx(b.x) - tx(a.x)) * animProgress
    const py = ty(a.y) + (ty(b.y) - ty(a.y)) * animProgress
    const pSize = 28
    const pRadius = pSize / 2

    ctx.save()
    ctx.shadowColor = '#60a5fa'
    ctx.shadowBlur = 22

    // Fundo circular do pacote
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)'
    ctx.beginPath()
    ctx.arc(px, py, pRadius + 1, 0, Math.PI * 2)
    ctx.fill()

    // Borda circular do pacote
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()

    // Clip circular para a imagem do pacote
    ctx.beginPath()
    ctx.arc(px, py, pRadius, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(imgPacote, px - pRadius, py - pRadius, pSize, pSize)

    ctx.restore()
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)
    drawConnections()
    drawPathHighlight()
    drawRouters()
    drawPacket()
  }

  function animate() {
    animProgress += SPEED
    if (animProgress >= 1) {
      animProgress = 0
      animSegment++
      // LOOP: quando chega ao fim, reinicia do começo
      if (animSegment >= networkPacket.rota.length - 1) {
        animSegment = 0
      }
    }
    draw()
    animFrameId = requestAnimationFrame(animate)
  }

  // Iniciar
  draw()
  if (networkPacket.rota.length > 1) {
    animFrameId = requestAnimationFrame(animate)
  }
}

/**
 * Inicializa o canvas da camada de Rede, se presente no DOM.
 * Aguarda as imagens carregarem antes de renderizar.
 * @param {Object} networkPacket
 */
export function initNetworkCanvas(networkPacket) {
  const canvas = document.getElementById('rede-canvas')
  if (!canvas) return

  function startRender() {
    stopNetworkAnimation()
    renderCanvas(canvas, networkPacket)
  }

  // Verificar se todas as imagens já estão carregadas
  const images = [imgAtivo, imgInativo, imgPacote]
  const allLoaded = images.every(img => img.complete && img.naturalWidth > 0)

  if (allLoaded) {
    startRender()
  } else {
    let loaded = 0
    const total = images.filter(img => !(img.complete && img.naturalWidth > 0)).length
    for (const img of images) {
      if (img.complete && img.naturalWidth > 0) continue
      img.addEventListener('load', () => {
        loaded++
        if (loaded >= total) startRender()
      }, { once: true })
    }
  }

  // Resize handler
  let resizeTimer
  const handleResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      stopNetworkAnimation()
      renderCanvas(canvas, networkPacket)
    }, 150)
  }
  window.addEventListener('resize', handleResize)
}

/**
 * Renderiza a camada de Rede: constrói pacote, gera HTML com informações e canvas.
 * @returns {{ networkPacket: Object, html: string }}
 */
export function renderNetworkLayer() {
  const networkPacket = buildNetworkPacket()

  const routeDisplay = networkPacket.rotaEncontrada
    ? networkPacket.rota.map((r, i) =>
        `<span class="route-node ${i === 0 ? 'origin' : i === networkPacket.rota.length - 1 ? 'destination' : ''}">${r.id} (${r.ip})</span>`
      ).join('<span class="route-arrow">→</span>')
    : '<span class="no-route">Rota não encontrada</span>'

  const html = `
    <div class="network-data-card">
      <div class="data-row">
        <span class="data-label">IP Origem</span>
        <span class="data-value mono">${networkPacket.ipOrigem}</span>
      </div>
      <div class="data-row">
        <span class="data-label">IP Destino</span>
        <span class="data-value mono">${networkPacket.ipDestino}</span>
      </div>
      <div class="data-row">
        <span class="data-label">TTL</span>
        <span class="data-value">${networkPacket.ttl}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Saltos</span>
        <span class="data-value">${networkPacket.rota.length > 0 ? networkPacket.rota.length - 1 : 0}</span>
      </div>
      <div class="route-display">
        <span class="data-label">Rota</span>
        <div class="route-nodes">${routeDisplay}</div>
      </div>
    </div>
    <div class="rede-canvas-wrapper">
      <canvas id="rede-canvas"></canvas>
    </div>
  `

  return { networkPacket, html }
}