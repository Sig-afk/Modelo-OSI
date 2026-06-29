import * as application from './application.js'
import * as presentation from './presentation.js'
import * as session from './session.js'
import * as transport from './transport.js'
import * as network from './network.js'
import * as datalink from './datalink.js'
import * as physical from './physical.js'

// Cache de seletores HTML para a animação sequencial
const applicationSection = document.querySelector('.application-layer-section')
const presentationSection = document.querySelector('.presentation-layer-section')
const sessionSection = document.querySelector('.session-layer-section')
const transportSection = document.querySelector('.transport-layer-section')
const networkSection = document.querySelector('.network-layer-section')
const datalinkSection = document.querySelector('.datalink-layer-section')
const physicalSection = document.querySelector('.physical-layer-section')
const resetBtnWrapper = document.querySelector('.reset-button-wrapper')
const btnReset = document.getElementById('btn-reset')

const textInput = document.querySelector('.text-input')

// Inicializar interface
presentation.initializeUI(application.USER_NAME)
if (presentation.initializeEncryptionUI) {
  presentation.initializeEncryptionUI()
}

// Evento de digitação dinâmica para detecção de protocolo em tempo real
if (textInput) {
  textInput.addEventListener('input', () => {
    const val = textInput.value.trim()
    if (val) {
      const type = application.detectProtocol(val, false)
      presentation.renderProtocolName(application.getProtocolLabel(type))
    } else {
      presentation.renderProtocolName('')
    }
  })
}

/**
 * Limpa todos os contêineres e oculta as seções das camadas OSI
 */
function scrollToSection(section) {
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function showLayer(section, container, html) {
  if (container) container.innerHTML = html
  if (section) {
    section.classList.remove('hidden')
    section.classList.add('layer-section-active')
    requestAnimationFrame(() => {
      section.classList.add('layer-section-visible')
    })
  }
  scrollToSection(section)
}

function clearAllSimulation() {
  network.stopNetworkAnimation()

  // Esconder seções
  applicationSection?.classList.add('hidden')
  presentationSection?.classList.add('hidden')
  sessionSection?.classList.add('hidden')
  transportSection?.classList.add('hidden')
  networkSection?.classList.add('hidden')
  datalinkSection?.classList.add('hidden')
  physicalSection?.classList.add('hidden')
  resetBtnWrapper?.classList.add('hidden')

  document.querySelectorAll('.layer-section').forEach(el => {
    el.classList.remove('layer-section-active', 'layer-section-visible')
  })

  // Limpar contêineres de dados
  const sessionContainer = document.querySelector('.session-container')
  const transportContainer = document.querySelector('.transport-container')
  const networkContainer = document.querySelector('.network-container')
  const datalinkContainer = document.querySelector('.datalink-container')
  const physicalContainer = document.querySelector('.physical-container')

  if (sessionContainer) sessionContainer.innerHTML = ''
  if (transportContainer) transportContainer.innerHTML = ''
  if (networkContainer) networkContainer.innerHTML = ''
  if (datalinkContainer) datalinkContainer.innerHTML = ''
  if (physicalContainer) physicalContainer.innerHTML = ''

  presentation.clearPresentationLayer()
}

/**
 * Orquestrador sequencial de animação das Camadas OSI (7 → 6 → 5 → 4 → 3)
 */
async function runOsiPipeline(packet, protocolLabel) {
  clearAllSimulation()

  // Forçar exibição da camada de Aplicação (L7) pois o formulário já foi preenchido
  applicationSection?.classList.remove('hidden')

  // Delay entre cada camada (1500ms)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // --- Camada 6: Apresentação ---
  await delay(1500)
  const jwtToken = presentation.renderPresentationLayer(packet)
  if (presentationSection) {
    presentationSection.classList.remove('hidden')
    presentationSection.classList.add('layer-section-active')
    requestAnimationFrame(() => {
      presentationSection.classList.add('layer-section-visible')
    })
  }
  scrollToSection(presentationSection)

  // --- Camada 5: Sessão ---
  await delay(1500)
  const sessionContainer = document.querySelector('.session-container')
  const { sessionData, html: sessionHtml } = session.renderSessionLayer(jwtToken)
  showLayer(sessionSection, sessionContainer, sessionHtml)

  // --- Camada 4: Transporte ---
  await delay(1500)
  const transportContainer = document.querySelector('.transport-container')
  const { html: transportHtml } = transport.renderTransportLayer(sessionData.sessionId, protocolLabel)
  showLayer(transportSection, transportContainer, transportHtml)

  // --- Camada 3: Rede ---
  await delay(1500)
  const networkContainer = document.querySelector('.network-container')
  const { networkPacket, html: networkHtml } = network.renderNetworkLayer()
  showLayer(networkSection, networkContainer, networkHtml)

  // Inicializar o canvas animado da rede
  network.initNetworkCanvas(networkPacket)

  // --- Camada 2: Enlace ---
  await delay(1500)
  const datalinkContainer = document.querySelector('.datalink-container')
  const { frame, html: datalinkHtml } = await datalink.renderDataLinkLayer({
    payload: packet,
    origem: application.USER_NAME
  })
  showLayer(datalinkSection, datalinkContainer, datalinkHtml)

  // --- Camada 1: Física ---
  await delay(1500)
  const physicalContainer = document.querySelector('.physical-container')
  const { html: physicalHtml } = await physical.renderPhysicalLayer(frame)
  showLayer(physicalSection, physicalContainer, physicalHtml)

  // Mostrar o botão de reset ao fim do pipeline
  resetBtnWrapper?.classList.remove('hidden')
}

/**
 * Trata o clique no botão principal de enviar/requisitar
 */
async function handleRequest(event) {
  event.preventDefault()

  const isFileChange = event.target && event.target.id === 'arquivo'
  if (isFileChange) {
    if (textInput) textInput.value = ''
  }

  const requestText = presentation.getRequestText()
  const file = presentation.getSelectedFile()
  const protocolType = isFileChange ? 'file' : application.detectProtocol(requestText, !!file)

  if (!protocolType) {
    presentation.showAlert('Por favor, digite algo ou selecione um arquivo.')
    return
  }

  clearAllSimulation()
  presentation.renderProtocolName(application.getProtocolLabel(protocolType))

  // Renderizar o formulário da Camada de Aplicação dependendo do tipo
  if (protocolType === 'email') {
    presentation.renderEmailForm(requestText, application.USER_NAME, formData => {
      const packet = application.createEmailPacket(requestText, formData.destinatario, formData.assunto, formData.corpo)
      runOsiPipeline(packet, 'SMTP')
    })
    return
  }

  if (protocolType === 'http') {
    const hostname = application.extractHostname(requestText)
    presentation.renderProtocolName(`${application.getProtocolLabel(protocolType)} - Resolvendo DNS para: ${hostname}...`)

    // Consulta DNS do Google assíncrona
    const hostIP = await application.resolveDNS(hostname)

    presentation.renderProtocolName(`${application.getProtocolLabel(protocolType)} (${hostname} → ${hostIP})`)

    presentation.renderHttpForm(hostIP, application.USER_NAME, () => {
      const packet = application.createHttpPacket(hostIP, application.USER_NAME)
      runOsiPipeline(packet, 'HTTP/HTTPS')
    })
    return
  }

  if (protocolType === 'chat') {
    presentation.renderChatForm(requestText, application.USER_NAME, () => {
      const packet = application.createChatPacket(requestText, application.USER_NAME)
      runOsiPipeline(packet, 'WebSocket')
    })
    return
  }

  if (protocolType === 'file' && file) {
    presentation.renderFileForm(file, application.USER_NAME, formData => {
      const packet = application.createFilePacket(formData.nomeArquivo, formData.formato, formData.remetente)
      runOsiPipeline(packet, 'FTP')

      const fileInput = document.querySelector('#arquivo')
      if (fileInput) fileInput.value = ''
    })

    // Submeter automaticamente o formulário do arquivo para iniciar a simulação
    const form = document.getElementById('dynamic-form')
    if (form) {
      form.requestSubmit()
    }
  }
}

// Configurar escutas de eventos nos botões e inputs
presentation.onRequestClick(handleRequest)
presentation.onFileChange(handleRequest)

if (btnReset) {
  btnReset.addEventListener('click', () => {
    clearAllSimulation()
    if (textInput) textInput.value = ''
    presentation.renderProtocolName('')
  })
}
