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

const SENSITIVE_FIELDS = {
  chat: ['usuario', 'mensagem'],
  site: ['hostIP', 'usuario'],
  email: ['remetente', 'destinatario', 'assunto', 'corpo'],
  arquivo: ['nomeArquivo', 'remetente']
}

const DISPLAY_FIELDS = {
  chat: ['tipo', 'usuario', 'mensagem', 'protocolo', 'timestamp'],
  site: ['tipo', 'metodo', 'hostIP', 'protocolo', 'usuario', 'timestamp'],
  email: ['remetente', 'destinatario', 'assunto', 'corpo', 'protocolo', 'timestamp'],
  arquivo: ['nomeArquivo', 'formato', 'remetente', 'protocolo', 'timestamp']
}

const TYPE_LABELS = {
  chat: { number: 1, label: 'CHAT', varName: 'chat' },
  site: { number: 2, label: 'SITES', varName: 'requisicaoSite' },
  email: { number: 3, label: 'E-MAIL', varName: 'email' },
  arquivo: { number: 4, label: 'ARQUIVOS', varName: 'arquivo' }
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

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function buildCodeLine(prop, value, isSensitive, isLast) {
  const comma = isLast ? '' : '<span class="syn-comma">,</span>'
  const displayValue = escapeHtml(isSensitive ? encryptCaesarCipher(value) : String(value))
  const stringClass = isSensitive ? 'syn-string-encrypted' : 'syn-string'

  return `  <span class="syn-prop">${escapeHtml(prop)}</span>: <span class="${stringClass}">'${displayValue}'</span>${comma}`
}

export function renderPresentationLayer(packet) {
  if (!presentationContainer) return

  const tipo = packet.tipo
  const meta = TYPE_LABELS[tipo]
  if (!meta) return

  const sensitiveList = SENSITIVE_FIELDS[tipo] || []
  const fieldsToShow = DISPLAY_FIELDS[tipo] || []

  const lines = fieldsToShow.map((prop, i) => {
    const isSensitive = sensitiveList.includes(prop)
    const isLast = i === fieldsToShow.length - 1
    return buildCodeLine(prop, packet[prop], isSensitive, isLast)
  })

  const codeHTML = `<span class="syn-keyword">const</span> <span class="syn-var-name">${escapeHtml(meta.varName)}</span> <span class="syn-brace">=</span> <span class="syn-brace">{</span>
${lines.join('\n')}
<span class="syn-brace">}</span><span class="syn-semicolon">;</span>`

  const cardHTML = `
    <div class="presentation-card">
      <div class="presentation-card-header">
        <span class="presentation-card-number">${meta.number}</span>
        <span class="presentation-card-type">${escapeHtml(meta.label)}</span>
      </div>
      <pre class="presentation-code-block">${codeHTML}</pre>
    </div>
  `

  presentationContainer.innerHTML = cardHTML
  if (presentationSection) presentationSection.classList.remove('hidden')
}

export function clearPresentationLayer() {
  if (presentationContainer) presentationContainer.innerHTML = ''
  if (presentationSection) presentationSection.classList.add('hidden')
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
