# Visualização de Rede com Dijkstra — Animação de Pacote

Criar uma nova página HTML acessível via botão na index.html que renderize todos os 100 roteadores (de points.js) num canvas interativo, mostre as conexões entre eles, e permita ao usuário selecionar origem e destino para visualizar, com animação do pacote (pacote.png), o caminho mais curto calculado pelo *Algoritmo de Dijkstra*.

## Proposta de Mudanças

### Botão na Página Principal

#### [MODIFY] [index.html](file:///c:/Users/20242ewbj0309/Desktop/projetos/Modelo-OSI/index.html)
- Adicionar um botão estilizado abaixo do dashboard-panel (ou dentro dele) que direciona para dijkstra.html
- Texto: "🌐 Simulador de Roteamento" ou similar, com estilo consistente ao design atual

---

### Nova Página — Dijkstra

#### [NEW] [dijkstra.html](file:///c:/Users/20242ewbj0309/Desktop/projetos/Modelo-OSI/dijkstra.html)
- Herda os mesmos CSS base (reset.css, global.css, header.css) + um CSS próprio (dijkstra.css)
- Header com logo e título da página
- Botão de voltar para index.html
- *Canvas* (HTML5 Canvas) de tamanho responsivo para renderizar:
  - Os roteadores como ícones (roteador-ativo.png / roteador-inativo.png) nas posições (x, y) do points.js
  - As conexões (linhas) entre roteadores
- *Painel de Controle* lateral/superior com:
  - Dropdown "Roteador Origem" (lista dos 100 roteadores, apenas ativos)
  - Dropdown "Roteador Destino"
  - Botão "Calcular Rota" — executa Dijkstra e anima o pacote
  - Info do caminho calculado (lista de IPs, distância total)
- *Legenda*: ativo vs inativo, caminho atual

---

### CSS Dedicado

#### [NEW] [dijkstra.css](file:///c:/Users/20242ewbj0309/Desktop/projetos/Modelo-OSI/style/dijkstra.css)
- Estilos para o canvas e o painel de controle
- Animações e efeitos visuais premium (glow nos roteadores ativos, linhas com gradiente, etc.)
- Painel com glassmorphism para controles
- Responsivo

---

### Script Principal

#### [NEW] [dijkstra.js](file:///c:/Users/20242ewbj0309/Desktop/projetos/Modelo-OSI/scripts/dijkstra.js)

*Funcionalidades:*

1. *Importação e Renderização do Grafo*
   - Importa points de points.js
   - Carrega as imagens dos roteadores e do pacote
   - Desenha todas as conexões (linhas entre roteadores conectados)
   - Desenha os roteadores nas posições (x, y) com o ícone correto (ativo/inativo)
   - Escala as coordenadas do points.js para caber no canvas

2. *Algoritmo de Dijkstra*
   - Constrói o grafo de adjacências usando as conexoes de cada roteador
   - O peso das arestas será a distância euclidiana entre os pontos (x, y)
   - Roteadores *inativos* (ativo: false) não serão roteáveis (excluídos do grafo)
   - Retorna o caminho mais curto e a distância total

3. *Animação do Pacote*
   - Ao clicar "Calcular Rota", o caminho é destacado (linhas brilhantes/coloridas)
   - O ícone pacote.png percorre o caminho de roteador em roteador com animação suave
   - Cada roteador "pisca" ou muda de cor ao ser visitado
   - Velocidade ajustável (ou fixa, confortável)

4. *Interatividade*
   - Hover nos roteadores mostra tooltip com ID, IP, status
   - Zoom/pan no canvas (opcional, se necessário)

## Verificação

### Testes Manuais
- Abrir index.html, clicar no botão "Simulador de Roteamento" e verificar que dijkstra.html abre
- Selecionar roteadores origem e destino e visualizar:
  - O caminho calculado exibido no painel
  - A animação do pacote percorrendo o caminho
  - Roteadores inativos não aparecem como opções nos dropdowns
  - Conexões visíveis entre os roteadores no canvas