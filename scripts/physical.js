function textoParaBinario(texto) {
    return Array.from(texto)
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ')
}

export async function renderPhysicalLayer(frame) {
    const texto = JSON.stringify(frame)
    const crcCalculado = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
    const crcHex = Array.from(new Uint8Array(crcCalculado))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16)
        .toUpperCase()

    const valido = crcHex === frame.crc

    const html = `
    <div class="physical-data-card">
      <div class="data-row">
        <span class="data-label">Status</span>
        <span class="data-value ${valido ? 'status-active' : 'status-error'}">${valido ? 'CRC válido' : 'CRC inválido'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">CRC recebido</span>
        <span class="data-value mono">${frame.crc}</span>
      </div>
      <div class="data-row">
        <span class="data-label">CRC recalculado</span>
        <span class="data-value mono">${crcHex}</span>
      </div>
      <div class="code-block">
        <h4 class="code-block-title">Objeto recebido na camada física</h4>
        <pre>${JSON.stringify(frame, null, 2)}</pre>
      </div>
      <div class="code-block">
        <h4 class="code-block-title">Binário do objeto</h4>
        <pre>${textoParaBinario(texto)}</pre>
      </div>
    </div>
  `

    return { valido, html }
}
