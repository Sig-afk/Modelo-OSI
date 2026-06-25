const user = document.querySelector('.user')
const reqBtn = document.querySelector('.request-btn')
const reqText = document.querySelector('.text-input')
const inputFile = document.querySelector('#arquivo')
const protocolName = document.querySelector('.protocol-name')
const formContainer = document.querySelector('.form-container')
const presentationContainer = document.querySelector('.presentation-container')
const applicationSection = document.querySelector('.application-layer-section')
const presentationSection = document.querySelector('.presentation-layer-section')

export function initializeUI(userName) {
  if (user) user.textContent = `Usuário: ${userName}`
}

export function getRequestText() {
  return reqText ? reqText.value.trim() : ''
}

export function getSelectedFile() {
  return inputFile && inputFile.files.length > 0 ? inputFile.files[0] : null
}

export function renderProtocolName(text) {
  if (protocolName) protocolName.textContent = text
}

export function clearUI() {
  if (formContainer) formContainer.innerHTML = ''
  if (applicationSection) applicationSection.classList.add('hidden')
  if (reqText) reqText.value = ''
  if (inputFile) inputFile.value = ''
  renderProtocolName('')
  clearPresentationLayer()
}

function showApplicationLayer() {
  if (applicationSection) applicationSection.classList.remove('hidden')
}

export function showAlert(message) {
  window.alert(message)
}

function attachFormSubmit(handler) {
  const form = document.getElementById('dynamic-form')
  if (form) form.addEventListener('submit', handler)
}

export function renderEmailForm(remetente, usuario, onSubmit) {
  if (!formContainer) return
  showApplicationLayer()
  formContainer.innerHTML = `
    <form id="dynamic-form" class="dynamic-form">
      <h3>Novo E-mail</h3>
      <div class="form-group">
        <input type="text" id="remetente" value="${remetente}" readonly placeholder=" ">
        <label>Remetente</label>
      </div>
      <div class="form-group">
        <input type="email" id="destinatario" required placeholder=" ">
        <label>Destinatário</label>
      </div>
      <div class="form-group">
        <input type="text" id="assunto" required placeholder=" ">
        <label>Assunto</label>
      </div>
      <div class="form-group">
        <textarea id="corpo" required placeholder=" "></textarea>
        <label>Corpo da mensagem</label>
      </div>
      <div class="form-group">
        <input type="text" id="usuario" value="${usuario}" readonly placeholder=" ">
        <label>Usuário</label>
      </div>
      <div class="form-group">
        <input type="text" id="protocolo" value="SMTP" readonly placeholder=" ">
        <label>Protocolo</label>
      </div>
      <button type="submit" class="form-submit-btn">Enviar</button>
    </form>
  `

  attachFormSubmit(function (e) {
    e.preventDefault()
    onSubmit({
      destinatario: document.getElementById('destinatario').value,
      assunto: document.getElementById('assunto').value,
      corpo: document.getElementById('corpo').value
    })
  })
}

export function renderHttpForm(hostIP, usuario, onSubmit) {
  if (!formContainer) return
  showApplicationLayer()
  formContainer.innerHTML = `
    <form id="dynamic-form" class="dynamic-form">
      <h3>Requisição de Site</h3>
      <div class="form-group">
        <input type="text" id="metodo" value="GET" readonly placeholder=" ">
        <label>Método</label>
      </div>
      <div class="form-group">
        <input type="text" id="hostIP" value="${hostIP}" readonly placeholder=" ">
        <label>Host/IP</label>
      </div>
      <div class="form-group">
        <input type="text" id="protocolo" value="HTTP/HTTPS" readonly placeholder=" ">
        <label>Protocolo</label>
      </div>
      <div class="form-group">
        <input type="text" id="usuario" value="${usuario}" readonly placeholder=" ">
        <label>Usuário</label>
      </div>
      <button type="submit" class="form-submit-btn">Salvar Pacote</button>
    </form>
  `

  attachFormSubmit(function (e) {
    e.preventDefault()
    onSubmit()
  })
}

export function renderChatForm(mensagem, usuario, onSubmit) {
  if (!formContainer) return
  showApplicationLayer()
  formContainer.innerHTML = `
    <form id="dynamic-form" class="dynamic-form">
      <h3>Mensagem de Chat</h3>
      <div class="form-group">
        <input type="text" id="usuario" value="${usuario}" readonly placeholder=" ">
        <label>Usuário</label>
      </div>
      <div class="form-group">
        <input type="text" id="mensagem" value="${mensagem}" readonly placeholder=" ">
        <label>Mensagem</label>
      </div>
      <div class="form-group">
        <input type="text" id="protocolo" value="WebSocket" readonly placeholder=" ">
        <label>Protocolo</label>
      </div>
      <button type="submit" class="form-submit-btn">Salvar Pacote</button>
    </form>
  `

  attachFormSubmit(function (e) {
    e.preventDefault()
    onSubmit()
  })
}

export function renderFileForm(file, usuario, onSubmit) {
  if (!formContainer || !file) return
  showApplicationLayer()
  const fileName = file.name
  const fileExt = fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : 'DESCONHECIDO'

  formContainer.innerHTML = `
    <form id="dynamic-form" class="dynamic-form">
      <h3>Envio de Arquivo</h3>
      <div class="form-group">
        <input type="text" id="nomeArquivo" value="${fileName}" readonly placeholder=" ">
        <label>Nome do Arquivo</label>
      </div>
      <div class="form-group">
        <input type="text" id="formato" value="${fileExt}" readonly placeholder=" ">
        <label>Formato</label>
      </div>
      <div class="form-group">
        <input type="text" id="remetente" value="${usuario}" readonly placeholder=" ">
        <label>Remetente</label>
      </div>
      <div class="form-group">
        <input type="text" id="protocolo" value="FTP" readonly placeholder=" ">
        <label>Protocolo</label>
      </div>
      <button type="submit" class="form-submit-btn">Salvar Pacote</button>
    </form>
  `

  attachFormSubmit(function (e) {
    e.preventDefault()
    onSubmit({
      nomeArquivo: document.getElementById('nomeArquivo').value,
      formato: document.getElementById('formato').value,
      remetente: document.getElementById('remetente').value
    })
  })
}

export function onRequestClick(handler) {
  if (reqBtn) reqBtn.addEventListener('click', handler)
}

export function onFileChange(handler) {
  if (inputFile) inputFile.addEventListener('change', handler)
}

/* ===== Camada de Apresentação ===== */

export function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function simulateHmacSignature(input, secret = 'chave-secreta-osi') {
  let hash = 0
  const combined = input + secret
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return base64UrlEncode(
    hex.repeat(4) + combined.length.toString(16).padStart(4, '0')
  )
}

export function generateJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signature = simulateHmacSignature(`${headerB64}.${payloadB64}`)
  return {
    token: `${headerB64}.${payloadB64}.${signature}`,
    header,
    payload,
    headerB64,
    payloadB64,
    signature
  }
}

export function renderPresentationLayer(packet) {
  if (!presentationContainer) return

  // Filtramos os campos para o payload do JWT para ficar limpo
  const payload = { ...packet }
  delete payload.key // removemos chave interna

  const jwt = generateJWT(payload)

  const cardHTML = `
    <div class="presentation-card">
      <div class="jwt-token-display">
        <span class="jwt-part jwt-header" title="Header (Cabeçalho)">${jwt.headerB64}</span>.<span class="jwt-part jwt-payload" title="Payload (Carga Útil)">${jwt.payloadB64}</span>.<span class="jwt-part jwt-signature" title="Signature (Assinatura)">${jwt.signature}</span>
      </div>
      
      <div class="jwt-details-grid">
        <div class="jwt-detail-section">
          <h4 class="jwt-section-title header-title">Header (Cabeçalho)</h4>
          <pre class="jwt-json-block header-block">${JSON.stringify(jwt.header, null, 2)}</pre>
        </div>
        <div class="jwt-detail-section">
          <h4 class="jwt-section-title payload-title">Payload (Carga Útil)</h4>
          <pre class="jwt-json-block payload-block">${JSON.stringify(jwt.payload, null, 2)}</pre>
        </div>
        <div class="jwt-detail-section">
          <h4 class="jwt-section-title signature-title">Assinatura</h4>
          <pre class="jwt-json-block signature-block">HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "chave-secreta-osi"
) = "${jwt.signature}"</pre>
        </div>
      </div>
    </div>
  `

  presentationContainer.innerHTML = cardHTML
  if (presentationSection) presentationSection.classList.remove('hidden')

  return jwt.token
}

export function clearPresentationLayer() {
  if (presentationContainer) presentationContainer.innerHTML = ''
  if (presentationSection) presentationSection.classList.add('hidden')
}

function encryptCaesarCipher(value, shift = 3) {
  if (!value) return ''
  return String(value).split('').map(char => {
    const code = char.charCodeAt(0)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65)
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26) + 97)
    }
    return char
  }).join('')
}

export function initializeEncryptionUI() {
  const encryptionSection = document.querySelector('.encryption-section')
  const encryptBtn = document.getElementById('encrypt-btn')
  const clearBtn = document.getElementById('clear-encrypt')
  const input = document.getElementById('encrypt-input')
  const output = document.getElementById('encrypt-output')
  const algorithm = document.getElementById('algorithm')
  const shiftInput = document.getElementById('caesar-shift')

  if (!encryptionSection) return
  // show the encryption panel (keeps it hidden by default until initialized)
  encryptionSection.classList.remove('hidden')

  if (encryptBtn) {
    encryptBtn.addEventListener('click', () => {
      const text = input ? input.value : ''
      if (!text) return
      const alg = algorithm ? algorithm.value : 'caesar'
      let result = ''
      if (alg === 'caesar') {
        const shift = parseInt(shiftInput?.value) || 3
        result = encryptCaesarCipher(text, shift)
      } else {
        result = text
      }
      if (output) output.value = result
    })
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (input) input.value = ''
      if (output) output.value = ''
    })
  }
}
