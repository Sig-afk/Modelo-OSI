import * as application from './application.js'
import * as presentation from './presentation.js'
import { SignJWT, decodeJwt } from 'https://cdn.jsdelivr.net/npm/jose@6/+esm'

async function initializeSessionToken() {
  try {
    const message = { dados: 'dados da camada de aplicação' }
    const payload = {
      sessionId: crypto.randomUUID(),
      message
    }
    const secret = new TextEncoder().encode('chave-teste')
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret)

    console.log('Token:', token)

    const dados = decodeJwt(token)
    console.log('Payload:', dados)

    const url = 'ifpe.edu.br'
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(url)}&type=A`)
    const domain = await response.json()
    if (domain?.Answer?.length) {
      console.log('IP', domain.Answer[0].data)
    } else {
      console.warn('DNS lookup did not return an A record for', url, domain)
    }
  } catch (error) {
    console.error('Erro ao inicializar token/DNS:', error)
  }
}

initializeSessionToken()

function processPacket(packet) {
  presentation.renderPresentationLayer(packet)
  const savedKey = application.loadLastPacketKey()
  if (savedKey) {
    console.log('Packet key saved in localStorage:', savedKey)
  }
}

function handleRequest(event) {
  event.preventDefault()

  const isFileChange = event.target && event.target.id === 'arquivo'
  if (isFileChange) {
    const textInput = document.querySelector('.text-input')
    if (textInput) textInput.value = ''
  }

  const requestText = presentation.getRequestText()
  const file = presentation.getSelectedFile()
  const protocolType = isFileChange ? 'file' : application.detectProtocol(requestText, !!file)

  if (!protocolType) {
    presentation.showAlert('Por favor, digite algo ou selecione um arquivo.')
    return
  }

  presentation.clearPresentationLayer()
  presentation.renderProtocolName(application.getProtocolLabel(protocolType))

  if (protocolType === 'email') {
    presentation.renderEmailForm(requestText, application.USER_NAME, formData => {
      const packet = application.createEmailPacket(requestText, formData.destinatario, formData.assunto, formData.corpo)
      processPacket(packet)
    })
    return
  }

  if (protocolType === 'http') {
    presentation.renderHttpForm(requestText, application.USER_NAME, () => {
      const packet = application.createHttpPacket(requestText, application.USER_NAME)
      processPacket(packet)
    })
    return
  }

  if (protocolType === 'chat') {
    presentation.renderChatForm(requestText, application.USER_NAME, () => {
      const packet = application.createChatPacket(requestText, application.USER_NAME)
      processPacket(packet)
    })
    return
  }

  if (protocolType === 'file' && file) {
    presentation.renderFileForm(file, application.USER_NAME, formData => {
      const packet = application.createFilePacket(formData.nomeArquivo, formData.formato, formData.remetente)
      processPacket(packet)
      const fileInput = document.querySelector('#arquivo')
      if (fileInput) fileInput.value = ''
    })

    const form = document.getElementById('dynamic-form')
    if (form) {
      form.requestSubmit()
    }
    return
  }
}

presentation.initializeUI(application.USER_NAME)
presentation.initializeEncryptionUI && presentation.initializeEncryptionUI()
presentation.onRequestClick(handleRequest)
presentation.onFileChange(handleRequest)
