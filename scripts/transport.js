const transportObj = {
  "sessionId": "...",
  "packetId": crypto.randomUUID(),
  "protocoloTransporte": "TCP",
  "portaOrigem": 52341,
  "portaDestino": 80
}
/*
HTTP	- TCP	- 80
HTTPS	- TCP	- 443
WebSocket (ws)	- TCP	- 80
SMTP (envio de e-mail)	- TCP	- 25 ou 587
FTP	- TCP	- 21
*/