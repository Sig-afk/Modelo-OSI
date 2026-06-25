// =============================================
// Camada 4 — Transporte
// Segmentação, controle de fluxo, portas e handshake TCP
// Baseado na arquitetura do Projeto B (transporte.js)
// =============================================

/**
 * Gera um Packet ID hexadecimal criptográfico.
 * @returns {string}
 */
function generatePacketId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(4)
    crypto.getRandomValues(arr)
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  let result = ''
  for (let i = 0; i < 4; i++) {
    const val = Math.floor(Math.random() * 256)
    result += val.toString(16).padStart(2, '0')
  }
  return result
}

/**
 * Mapeia o protocolo de aplicação para a porta de destino padrão.
 * @param {string} appProtocol - Protocolo da aplicação.
 * @returns {number}
 */
function getDestinationPort(appProtocol) {
  const portMap = {
    'HTTP': 80,
    'HTTP/HTTPS': 443,
    'HTTPS': 443,
    'SMTP': 25,
    'SMTP/POP3': 25,
    'POP3': 110,
    'FTP': 21,
    'HTTP Upload': 21,
    'WebSocket': 443,
    'WEBSOCKET': 443
  }
  return portMap[appProtocol] || 80
}

/**
 * Gera uma porta de origem efêmera aleatória (49152–65535).
 * @returns {number}
 */
function generateSourcePort() {
  return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152
}

/**
 * Renderiza a camada de Transporte com dados TCP e simulação de Three-Way Handshake.
 * @param {string} sessionId - Session ID da Camada 5.
 * @param {string} appProtocol - Protocolo da aplicação (ex: 'HTTP/HTTPS', 'SMTP', etc.).
 * @returns {{ transportData: Object, html: string }}
 */
export function renderTransportLayer(sessionId, appProtocol) {
  const packetId = generatePacketId()
  const srcPort = generateSourcePort()
  const dstPort = getDestinationPort(appProtocol)

  const transportData = {
    sessionId,
    packetId,
    protocoloTransporte: 'TCP',
    portaOrigem: srcPort,
    portaDestino: dstPort
  }

  const html = `
    <div class="transport-data-card">
      <div class="data-row">
        <span class="data-label">Session ID</span>
        <span class="data-value mono">${transportData.sessionId}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Packet ID</span>
        <span class="data-value mono">0x${transportData.packetId}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Protocolo</span>
        <span class="data-value">${transportData.protocoloTransporte}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Porta Origem</span>
        <span class="data-value mono">${transportData.portaOrigem}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Porta Destino</span>
        <span class="data-value mono">${transportData.portaDestino}</span>
      </div>

      <div class="handshake-section">
        <h4 class="handshake-title">TCP Three-Way Handshake</h4>
        <div class="handshake-steps">
          <div class="handshake-step" data-step="1">
            <span class="handshake-arrow">→</span>
            <span class="handshake-label">SYN</span>
            <span class="handshake-detail">seq=${Math.floor(Math.random() * 9000) + 1000}</span>
          </div>
          <div class="handshake-step" data-step="2">
            <span class="handshake-arrow">←</span>
            <span class="handshake-label">SYN-ACK</span>
            <span class="handshake-detail">seq=${Math.floor(Math.random() * 9000) + 1000}, ack</span>
          </div>
          <div class="handshake-step" data-step="3">
            <span class="handshake-arrow">→</span>
            <span class="handshake-label">ACK</span>
            <span class="handshake-detail">Conexão estabelecida ✓</span>
          </div>
        </div>
      </div>
    </div>
  `

  return { transportData, html }
}