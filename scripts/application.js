// =============================================
// Camada 7 — Aplicação
// Lógica de protocolos e consultas DNS
// Baseado na arquitetura do Projeto B (aplicacao.js)
// =============================================

export const USER_NAME = 'Gustavo Henrique'
const packetStore = new Map()

/**
 * Detecta o protocolo com base no input ou arquivo enviado.
 * @param {string} requestText
 * @param {boolean} hasFile
 * @returns {'email'|'http'|'chat'|'file'|null}
 */
export function detectProtocol(requestText, hasFile) {
  if (requestText) {
    const text = requestText.toLowerCase().trim()
    if (text.includes('@')) return 'email'
    if (text.includes('www.') || text.startsWith('http://') || text.startsWith('https://')) return 'http'
    if (text.startsWith('ftp://') || text === 'ftp') return 'file'
    return 'chat'
  }
  if (hasFile) return 'file'
  return null
}

/**
 * Retorna o rótulo legível do protocolo.
 * @param {string} type
 * @returns {string}
 */
export function getProtocolLabel(type) {
  switch (type) {
    case 'email':
      return 'E-mail (SMTP/POP)'
    case 'http':
      return 'Site / URL (HTTP/HTTPS)'
    case 'chat':
      return 'Chat (WebSocket)'
    case 'file':
      return 'Arquivo (FTP)'
    default:
      return ''
  }
}

/**
 * Extrai o hostname de uma string de URL.
 * Ex: "https://www.google.com/search" → "google.com"
 * @param {string} urlString
 * @returns {string}
 */
export function extractHostname(urlString) {
  let hostname = urlString.trim()
  hostname = hostname.replace(/^https?:\/\//i, '')
  hostname = hostname.replace(/^www\./i, '')
  hostname = hostname.split('/')[0]
  hostname = hostname.split('?')[0]
  hostname = hostname.split('#')[0]
  hostname = hostname.split(':')[0]
  return hostname
}

/**
 * Resolve o domínio usando DNS do Google.
 * @param {string} domain
 * @returns {Promise<string>} IP correspondente
 */
export async function resolveDNS(domain) {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`)
    const data = await response.json()
    if (data?.Answer?.length) {
      return data.Answer[0].data
    }
  } catch (err) {
    console.warn('Erro ao resolver DNS para', domain, err)
  }
  // Fallback caso falhe ou não encontre registro
  return '192.168.1.1'
}

function formatTimestamp() {
  return new Date().toISOString()
}

function generatePacketKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function registerPacket(packet) {
  packetStore.set(packet.key, packet)
  return packet
}

export function getPacketByKey(key) {
  return packetStore.get(key) || null
}

export function createEmailPacket(remetente, destinatario, assunto, corpo) {
  const packet = {
    key: generatePacketKey(),
    tipo: 'email',
    remetente,
    destinatario,
    assunto,
    corpo,
    protocolo: 'SMTP',
    timestamp: formatTimestamp()
  }
  return registerPacket(packet)
}

export function createHttpPacket(hostIP, usuario) {
  const packet = {
    key: generatePacketKey(),
    tipo: 'site',
    metodo: 'GET',
    hostIP,
    protocolo: 'HTTP',
    usuario,
    timestamp: formatTimestamp()
  }
  return registerPacket(packet)
}

export function createChatPacket(mensagem, usuario) {
  const packet = {
    key: generatePacketKey(),
    tipo: 'chat',
    usuario,
    mensagem,
    protocolo: 'WebSocket',
    timestamp: formatTimestamp()
  }
  return registerPacket(packet)
}

export function createFilePacket(nomeArquivo, formato, remetente) {
  const packet = {
    key: generatePacketKey(),
    tipo: 'arquivo',
    nomeArquivo,
    formato,
    remetente,
    protocolo: 'FTP',
    timestamp: formatTimestamp()
  }
  return registerPacket(packet)
}
