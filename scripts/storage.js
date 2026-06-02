const STORAGE_KEY = 'pacoteKeys'

export function loadPacketKeys() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
}

export function loadLastPacketKey() {
  const keys = loadPacketKeys()
  return keys.length ? keys[keys.length - 1] : null
}

export function savePacketKey(key) {
  const keys = loadPacketKeys()
  keys.push(key)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  return key
}
