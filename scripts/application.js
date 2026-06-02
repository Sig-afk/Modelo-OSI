import * as storage from './storage.js'

export const USER_NAME = 'Gustavo Henrique'
const packetStore = new Map()

export function detectProtocol(requestText, hasFile) {
  if (requestText) {
    if (requestText.includes('@')) return 'email'
    if (requestText.includes('www') || requestText.includes('http')) return 'http'
    return 'chat'
  }
  if (hasFile) return 'file'
  return null
}

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
  storage.savePacketKey(packet.key)
  return packet
}

export function loadLastPacketKey() {
  return storage.loadLastPacketKey()
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
    protocolo: 'HTTP Upload',
    timestamp: formatTimestamp()
  }
  return registerPacket(packet)
}
