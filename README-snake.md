# 🐍 Snake Neon — Documentação simplificada

Três jogos, três arquivos. Todos abrem com **duplo clique** no navegador, sem instalar nada.

| Arquivo | O que é | Internet? |
|---|---|---|
| `snake-neon.html` | Jogo 2D cartoon (canvas) | Não precisa |
| `snake-cubo-3d-cdn.html` | Jogo 3D no cubo (Three.js via CDN) | Só na 1ª vez |
| `snake-cubo-3d-offline.html` | Mesmo jogo 3D, com a biblioteca embutida | Nunca |

> As duas versões 3D são **idênticas em jogabilidade**. A offline é ~700 KB porque carrega
> o Three.js dentro dela; a CDN tem ~36 KB mas baixa a biblioteca da internet.
> Para editar o jogo, prefira a versão **CDN** (o código fica fácil de ler) — depois é só
> repetir a troca da tag `<script src=...>` pelo conteúdo da biblioteca para gerar a offline.

---

## 🎮 Controles

- **Setas ou WASD** — mover (no 3D, as direções são relativas à tela: ⬆ vai para onde parece "cima")
- **Swipe (celular)** — deslizar o dedo sobre o jogo muda a direção; **toque rápido** = começar/pausar
- **Espaço** — começar / pausar
- **G (só no 3D)** — usa o power-up da caixa reserva (no celular, toque na caixa do HUD)
- **M** — menu de opções
- **Mouse (só no 3D)** — arrastar gira o cubo; roda do mouse dá zoom

> Como o swipe funciona: o jogo guarda onde o dedo encostou (`touchstart`) e onde soltou
> (`touchend`). Se a distância for pequena, é um toque (= Espaço); senão, o vetor do gesto
> vira a direção desejada — no 3D ele entra na mesma função `steer()` das setas, que escolhe
> a direção tangente da face que mais se parece com o gesto **na tela**. O CSS
> `touch-action: none` no canvas impede a página de rolar durante o gesto.

## ⚙️ Customizando sem programar (low code)

Abra o arquivo num editor (Bloco de Notas ou VS Code) e procure o bloco `CONFIG`,
logo no início do `<script>` do jogo. Cada linha tem um comentário explicando.
Exemplos do que dá pra mudar:

```js
speed: 6,            // velocidade (passos por segundo)
gridSize: 12,        // células por face do cubo
portalMax: 2,        // máximo de portais 🌀 ao mesmo tempo
portalEvery: 8,      // um portal novo a cada 8 segundos
powerupMax: 3,       // máximo de power-ups ao mesmo tempo
powerupEvery: 4,     // um power-up novo a cada 4 segundos
fruits: [
  { emoji: "🍎", mult: 1, weight: 5 },  // mult = multiplica os pontos
  { emoji: "🍒", mult: 2, weight: 3 },  // weight = chance de aparecer
],
```

Salve, dê **F5** no navegador e pronto. O menu **OPÇÕES** dentro do jogo mexe nos mesmos
valores, mas salva no navegador (localStorage) e **tem prioridade** sobre o arquivo —
se uma edição sua não aparecer, clique em OPÇÕES → PADRÃO.

---

## 🧠 Como o jogo funciona por dentro (para aprender)

### A ideia central de qualquer Snake

O jogo roda em dois ritmos separados:

1. **Lógica (`step`)** — algumas vezes por segundo, a cobra anda exatamente 1 célula.
   A cobra é uma **lista de células**: para andar, insere uma célula nova na frente
   (`unshift`) e remove a última (`pop`). Comer fruta = pular o `pop` (a cobra cresce).
2. **Desenho (`loop`)** — ~60 vezes por segundo (`requestAnimationFrame`), o jogo
   desenha a cena. Para o movimento parecer suave, ele **interpola**: desenha a cobra
   numa posição intermediária entre o passo anterior e o atual.

Colisões são simples: a célula nova da cabeça é comparada com as células do corpo,
das pedras, da fruta e dos portais.

### O pulo do gato do 3D: a cobra anda na *superfície* do cubo

Não existe "dentro" do cubo. Cada célula guarda duas informações:

- `p` — posição 3D do centro da célula (sempre colada na superfície)
- `n` — a **normal**: um vetor apontando "para fora" da face (ex.: face de cima → `(0,0,1)`)

A direção de movimento `d` é sempre **tangente** à face (perpendicular à normal).

**A regra da aresta** (o coração do jogo, em `step()`):

```
Se o próximo passo sai da face:
    nova direção  =  -normal antiga   (a cobra "vira para baixo", dobrando a quina)
    nova normal   =  direção antiga   (a face nova aponta para onde a cobra ia)
```

Só essas duas trocas de vetor fazem a cobra contornar o cubo inteiro, em qualquer
face e direção, sem nenhum caso especial. É o mesmo truque de "rolar um dado".

### Portais 🌀

Um relógio (`portalClock`) cria um portal a cada `portalEvery` segundos (até `portalMax`).
Cada portal tem tempo de vida e some sozinho. Quando a cabeça entra na célula do portal:
sorteia-se uma célula livre **em outra face** (rejeita sorteios na mesma face), a cabeça é
teleportada para lá com uma direção tangente aleatória, e o corpo continua de onde estava
(o desenho detecta a distância grande e não interpola — por isso não aparece um "risco"
atravessando o cubo).

### Câmera

A câmera fica sempre olhando para o centro do cubo, posicionada ao longo de um vetor
`camVec`. A cada quadro, `camVec` é suavemente puxado (lerp) em direção à **normal da
face onde a cabeça está** — por isso o cubo "gira" sozinho quando a cobra muda de face.
Arrastar o mouse rotaciona `camVec` manualmente e pausa o automático por 3 segundos.

### Controles relativos à tela

Apertar ⬆ no 3D não significa "norte da face". O jogo pega as direções tangentes
possíveis, projeta cada uma para coordenadas de tela (`vector.project(camera)`) e
escolhe a que mais aponta para cima **na sua visão**. Por isso o controle continua
intuitivo mesmo com o cubo de cabeça para baixo.

### Modos de jogo (só no 3D)

A primeira tela é a escolha de modo (cartões, teclas 1–4, ou Espaço = Clássico;
**Esc** volta para a seleção a qualquer momento):

- **🎮 Clássico** — o jogo completo; é o único modo que grava o recorde de pontos.
- **🏖 Sandbox** — sem morte (atravessa corpo, pedras e fantasma), 5x frutas e 2x
  power-ups. Para brincar e experimentar; nada conta recorde.
- **🔥 Sobrevivência** — a velocidade cresce sem parar, uma barra de **fome** te
  obriga a comer (a janela começa em 20s e encurta até 8s), e a cada ~25s vem a
  **Fúria das Pedras**: aviso, e então as rochas andam pelo mapa por 6s. O recorde
  é o tempo sobrevivido, salvo separadamente. Calibragem no CONFIG (`hungerStart`,
  `furyEvery`, `survivalAccel`...).
- **🏆 Desafio** — 8 missões fixas (restrição, tempo, exploração e percurso), com
  ✓ salvo no navegador e progresso ao vivo no HUD. Sem fantasma, para ser justo.

### Highscores com nome e skins (só no 3D)

- **Top 3 por modo**: ao morrer no Clássico (pontos) ou na Sobrevivência (tempo), se
  o resultado entrar no top 3, o jogo convida você a registrar seu nome. O pódio
  (🥇🥈🥉) aparece na tela de fim e fica salvo no navegador.
- **Skins**: no menu OPÇÕES — 🟢 Bolinhas (clássica), 🐍 Contínua (corpo de tubo
  liso) e 🟩 Voxel neon (cubos girando). A **🥇 Dourada** (metálica e reluzente)
  começa trancada: só destrava ao completar as 8 missões do modo Desafio.

### Caixa reserva de power-up (só no 3D)

Pegar um power-up **não ativa na hora**: ele vai para a caixinha no HUD, e você decide
o melhor momento de usar com **G**. Se a caixa já estiver cheia, o power-up novo ativa
imediatamente (nada se perde). Isso transforma os power-ups em recurso estratégico —
guarde o 👻 fantasma para uma enrascada, ou o 🎉 para quando a pontuação valer mais.

### Festival de frutas 🎉 (só no 3D)

Power-up especial: por 12 segundos, o cubo se enche de frutas (10x a quantidade normal)
e cada fruta vale um multiplicador **aleatório de 2x a 5x**. Enquanto dura, o fundo da
página pulsa em cores, a luz da cena brilha mais forte e a música muda para acordes
maiores com sininhos. Configurável no CONFIG: `festivalDuration`, `festivalMin/Max`.

### Viagem pelo buraco de minhoca

Entrar num portal não teleporta instantaneamente: a cobra para, a câmera mergulha em
direção ao cubo girando em parafuso, um clarão roxo toma a tela — e o teleporte acontece
**no auge do clarão**, para a troca de face ficar escondida dentro da animação. Depois
a câmera se afasta de volta já na face nova. Duração no CONFIG: `warpDuration`.

### Minimapa, trilha térmica, seta de portal e câmera de morte (só no 3D)

- **Minimapa**: o cubo planificado em cruz no canto, com a face atual destacada e
  pontos para cobra, frutas, power-ups, portais, pedras e fantasma. É um canvas 2D
  desenhado por cima do 3D — cada item é convertido de (posição 3D, face) para (u,v).
- **Trilha térmica**: partículas emitidas ao longo do corpo, quentes (laranja) na
  cabeça e frias (azul) na cauda — a cor é interpolada pelo índice do segmento.
- **Seta de portal**: quando o wormhole mais próximo está numa face escondida, uma
  seta na borda da tela aponta para ele (a visibilidade usa a normal da face, porque
  projeção sozinha não detecta o que o cubo está tampando).
- **Câmera de morte**: ao morrer, o jogo entra em câmera lenta por ~2,4s — zoom no
  local do acidente, órbita lenta e partículas a 18% da velocidade — e só então o
  GAME OVER aparece.

### Cobra fantasma 👻 (só no 3D)

O trajeto da sua run anterior é gravado passo a passo e reproduzido na run seguinte
como um "eco" translúcido **atrasado em 12 passos** — ele persegue seu rastro, e você
morre se cruzar sua rota antiga no momento errado. O atraso evita morte injusta no
início (todas as runs nascem no mesmo lugar). O power-up 👻 atravessa o fantasma.
Liga/desliga no menu; `ghostLength` e `ghostDelay` no CONFIG.

### Música ambiente sem arquivos de áudio (só no 3D)

A trilha são **pads etéreos** gerados pela Web Audio API: a cada ~6 segundos toca um
acorde longo (Am7 → Fmaj7 → Gsus → Em) com dois osciladores levemente desafinados entre
si (o "detune" dá o som orgânico) passando por um filtro grave. No festival, a progressão
muda para tom maior (C → F → G → C), mais rápida, com filtro mais aberto e sininhos.
Liga/desliga no menu; volume em `musicVolume` no CONFIG.

### Sons sem arquivos de áudio

A função `beep()` usa a **Web Audio API**: cria um oscilador (onda quadrada/serra),
define a frequência e o decaimento do volume, e pronto — efeitos retrô gerados em
tempo real. Cada som do jogo (comer, power-up, portal, game over) é só uma combinação
de 1 a 3 beeps com frequências diferentes.

---

## 📍 Mapa do código (versão 3D)

Na ordem em que aparece no arquivo:

| Trecho | Responsabilidade |
|---|---|
| `<style>` | Visual da página, HUD, menu, animações CSS |
| `CONFIG` | Tudo que é customizável |
| `beep` / `SFX` | Sons retrô |
| `faceTexture` / `buildCube` | Desenha a grade numa textura e cria o cubo |
| `tangents`, `randomCellOn`, `key`, `faceOf` | Matemática da superfície do cubo |
| `spawnFood/Obstacles/Portal` | Criação dos itens |
| `step()` | **A lógica do jogo** — movimento, aresta, colisões, portal |
| `loop()` | Relógio do jogo + partículas + render |
| `renderSnake/Items`, `updateCamera` | Desenho de cada quadro |
| `keydown` / `mousemove` | Controles |
| Bloco do menu | Liga o painel OPÇÕES ao CONFIG |

## 💡 Ideias de exercícios

1. Adicione uma fruta nova no `fruits` (ex.: 🍌 com `mult: 4`).
2. Mude `portalPoints` para um valor negativo — entrar no portal vira um risco!
3. Crie um power-up novo: adicione um tipo em `powerupTypes`, um item em `POWER_INFO`
   e trate o efeito em `currentSpeed()` ou em `step()`.
4. Desafio: faça as pedras se moverem 1 célula a cada 5 segundos.
