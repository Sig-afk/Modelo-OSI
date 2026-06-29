function gerarMacOrigem() {
    return '00:11:22:33:44:55'
}

function gerarMacDestino() {
    return 'AA:BB:CC:DD:EE:FF'
}

async function gerarCrc(objeto) {
    const text = JSON.stringify(objeto)
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 16).toUpperCase()
}

export async function renderDataLinkLayer(payload) {
    const frameId = `F${String(Math.floor(Math.random() * 900) + 100)}`
    const frame = {
        frameId,
        macOrigem: gerarMacOrigem(),
        macDestino: gerarMacDestino(),
        tipo: 'IPv4',
        crc: '',
        payload
    }

    frame.crc = await gerarCrc(frame)

    const html = `
    <div class="datalink-data-card">
      <div class="data-row">
        <span class="data-label">Frame ID</span>
        <span class="data-value mono">${frame.frameId}</span>
      </div>
      <div class="data-row">
        <span class="data-label">MAC Origem</span>
        <span class="data-value mono">${frame.macOrigem}</span>
      </div>
      <div class="data-row">
        <span class="data-label">MAC Destino</span>
        <span class="data-value mono">${frame.macDestino}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Tipo</span>
        <span class="data-value">${frame.tipo}</span>
      </div>
      <div class="data-row">
        <span class="data-label">CRC</span>
        <span class="data-value mono">${frame.crc}</span>
      </div>
      <div class="code-block">
        <h4 class="code-block-title">Objeto pronto para a camada física</h4>
        <pre>${JSON.stringify(frame, null, 2)}</pre>
      </div>
    </div>
  `

    return { frame, html }
}
