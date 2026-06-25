// =============================================
// Camada 5 — Sessão
// Gerencia o estabelecimento e controle da sessão
// Baseado na arquitetura do Projeto B (sessao.js)
// =============================================

let lastSessionId = ''

/**
 * Retorna o último Session ID gerado.
 * @returns {string}
 */
export function getSessionId() {
  return lastSessionId
}

/**
 * Gera um UUID v4 (com fallback para navegadores sem crypto.randomUUID).
 * @returns {string}
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Formata uma data no padrão ISO 8601.
 * @param {Date} date
 * @returns {string}
 */
function formatISO(date) {
  return date.toISOString()
}

/**
 * Gera os dados da camada de Sessão.
 * @param {string} jwtToken - Token JWT da Camada 6 (Apresentação).
 * @returns {{ sessionData: Object, html: string }}
 */
export function renderSessionLayer(jwtToken) {
  const sessionId = generateUUID()
  lastSessionId = sessionId

  const now = new Date()
  const expiration = new Date(now.getTime() + 60 * 60 * 1000) // +1 hora

  const sessionData = {
    sessionId,
    status: 'ESTABLISHED',
    inicio: formatISO(now),
    expiracao: formatISO(expiration),
    token: jwtToken
  }

  const html = `
    <div class="session-data-card">
      <div class="data-row">
        <span class="data-label">Session ID</span>
        <span class="data-value mono">${sessionData.sessionId}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Status</span>
        <span class="data-value status-active">● ${sessionData.status}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Início</span>
        <span class="data-value mono">${sessionData.inicio}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Expiração</span>
        <span class="data-value mono">${sessionData.expiracao}</span>
      </div>
      <div class="data-row">
        <span class="data-label">JWT Token</span>
        <span class="data-value mono jwt-token-display">${sessionData.token}</span>
      </div>
    </div>
  `

  return { sessionData, html }
}
