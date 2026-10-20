# 🧊 Tetris Neon 3D — Documentação simplificada

Um arquivo, zero instalação: **duplo clique** em `tetris-neon-3d.html` e o jogo abre no
navegador (precisa de internet só na 1ª vez, para baixar a biblioteca Three.js do CDN).

As peças caem dentro de um **poço 3D** (5×5 de base, 12 de altura, por padrão).
Em vez de completar uma *linha*, você completa uma **camada horizontal inteira**
— quando todas as células de um "andar" estão ocupadas, ele some e a pilha desce.

---

## 🎮 Controles

- **Setas** — mover a peça no plano (relativo à câmera: ⬅ vai para onde parece esquerda)
- **Q/E** — girar em torno do eixo Y (como girar um prato)
- **W/S** — girar em torno do eixo X (tombar para frente/trás)
- **A/D** — girar em torno do eixo Z (tombar para os lados)
- **ESPAÇO** — queda instantânea (hard drop, dá pontos extras)
- **SHIFT** — descida rápida enquanto segurar
- **P** — pausar · **M** — menu OPÇÕES
- **Mouse** — arrastar orbita a câmera; roda do mouse dá zoom
- **Celular** — botões de toque aparecem embaixo do jogo

> Dica: a **peça fantasma** (sombra translúcida no fundo) mostra exatamente onde a
> peça vai pousar — essencial para enxergar profundidade em 3D.

## ⚙️ Customizando sem programar (low code)

Abra o arquivo num editor (Bloco de Notas ou VS Code) e procure o bloco `CONFIG`,
logo no início do `<script>` do jogo. Cada linha tem um comentário explicando.
Exemplos do que dá pra mudar:

```js
wellWidth: 5,          // largura do poço (células no eixo X)
wellHeight: 12,        // altura do poço
dropInterval: 900,     // ms entre quedas no nível 1 (menor = mais rápido)
speedupStep: 90,       // quantos ms mais rápido a cada nível
layersPerLevel: 4,     // camadas limpas para subir de nível
layerPoints: [0, 100, 300, 600, 1000], // pontos por 1, 2, 3, 4+ camadas (x nível)
ghostPiece: true,      // mostra a "sombra" de onde a peça vai cair
pieces: [
  { name: "I", color: 0x00ffff, weight: 3, cells: [[0,0,0],[1,0,0],[2,0,0],[3,0,0]] },
  // weight = chance de aparecer; cells = cubinhos em coordenadas [x, y, z]
],
```

Salve, dê **F5** no navegador e pronto. O menu **OPÇÕES** dentro do jogo mexe nos mesmos
valores, mas salva no navegador (localStorage) e **tem prioridade** sobre o arquivo —
se uma edição sua não aparecer, clique em OPÇÕES → PADRÃO.

### Criando peças novas

Cada peça é uma lista de cubinhos em coordenadas relativas `[x, y, z]` (x = largura,
y = altura, z = profundidade). Qualquer conjunto de cubinhos conectados funciona:

```js
{ name: "cruz",   color: 0xff00ff, weight: 1,
  cells: [[1,0,0],[0,0,1],[1,0,1],[2,0,1],[1,0,2]] },   // cruz plana 3x3
{ name: "torre",  color: 0x00ffaa, weight: 1,
  cells: [[0,0,0],[0,1,0],[0,2,0]] },                    // coluna de 3
{ name: "cubão",  color: 0xffffff, weight: 1,
  cells: [[0,0,0],[1,0,0],[0,0,1],[1,0,1],
          [0,1,0],[1,1,0],[0,1,1],[1,1,1]] },            // cubo 2x2x2 (difícil!)
```

`weight` controla a frequência: uma peça com `weight: 6` aparece o dobro de uma
com `weight: 3`. Cores são hex no formato `0xRRGGBB`.

---

## 🧠 Como o jogo funciona por dentro (para aprender)

### A ideia central de qualquer Tetris

O jogo é uma **grade 3D** (`grid[y][z][x]`): cada célula guarda `null` (vazia) ou a
cor do cubinho travado ali. A peça que está caindo **não está na grade** — ela é um
objeto à parte (`piece`) com uma posição e uma lista de cubinhos relativos. Três
rotinas fazem tudo:

1. **`collides()`** — pergunta "se a peça se mover assim, ela bate em algo?".
   Testa cada cubinho contra as paredes, o fundo e a grade. *Toda* ação (mover,
   girar, cair) é só "tenta; se colidir, desfaz".
2. **`lockPiece()`** — quando a peça não consegue mais descer, seus cubinhos são
   *carimbados* na grade, as camadas completas são limpas e uma peça nova nasce no topo.
3. **`clearLayers()`** — varre os andares de cima para baixo; um andar onde
   `every()` célula está ocupada é removido do array (`splice`) e um andar vazio
   entra no topo (`push`) — é assim que a pilha "desce" de graça, sem mover nada.

### Rotação 3D sem matrizes

Girar 90° em torno de um eixo é só **trocar duas coordenadas e inverter o sinal de
uma**: em torno de Y, `(x, y, z) → (z, y, -x)`. Depois da troca a peça é "normalizada"
(empurrada de volta para coordenadas ≥ 0) e testada com `collides()`. Se a posição
atual não cabe, o jogo tenta posições vizinhas — os **wall kicks** — antes de desistir:
por isso uma peça encostada na parede ainda consegue girar.

### A peça fantasma

Antes de desenhar, o jogo simula a queda: "quantas células a peça desceria até
colidir?" (`while (!collides(...)) d++`). A peça é então desenhada também *lá embaixo*
com material translúcido. É o mesmo cálculo do hard drop — ESPAÇO só aplica a
distância de uma vez e dá pontos por célula pulada.

### Controles relativos à câmera

Você pode orbitar a câmera livremente, então "esquerda" muda de significado. Quando
você aperta ⬅, o jogo arredonda o ângulo da câmera para o quadrante mais próximo
(0°, 90°, 180°, 270°) e gira o vetor do comando de acordo (`camRelative()`). Assim
⬅ sempre move a peça para onde *parece* esquerda na tela.

### Dois ritmos: lógica e desenho

Como no Snake, a lógica e o desenho rodam separados. O `loop()` roda ~60x/s
(`requestAnimationFrame`) e acumula o tempo passado em `dropTimer`; quando passa de
`dropInterval`, a peça desce 1 célula. Segurar SHIFT não muda a lógica — só faz o
relógio andar `fastDropFactor`× mais rápido. Subir de nível encurta o `dropInterval`.

### O poço de linhas neon

O poço não é um modelo 3D: são só **segmentos de reta** (`THREE.LineSegments`) gerados
por código em `buildWell()` — a grade do fundo, as verticais das paredes e os anéis
horizontais roxos. Por ser gerado por código, mudar `wellWidth/Depth/Height` no menu
reconstrói o poço do tamanho certo na próxima partida, e a câmera se reajusta
(`fitCamera()`).

### Por que cada cubinho tem borda brilhante

Cada cubinho é um `Mesh` com material levemente **emissivo** (brilha sozinho) + um
`LineSegments` com as arestas na mesma cor. Sem as arestas, cubos vizinhos da mesma
cor virariam um borrão único — as bordas são o que deixa a pilha legível (e neon).

---

## 📍 Mapa do código

Na ordem em que aparece no arquivo:

| Trecho | Responsabilidade |
|---|---|
| `<style>` | Visual da página, HUD, menu, animações CSS |
| `CONFIG` | Tudo que é customizável |
| `buildWell` / `stars` | O poço de linhas neon e o fundo estrelado |
| `makeCube` | Fábrica de cubinhos (normal e fantasma) |
| `fitCamera` / `updateCamera` | Câmera orbital (mouse arrasta, roda dá zoom) |
| `randomPieceDef` / `newPiece` | Sorteio ponderado e nascimento das peças |
| `collides` / `tryMove` / `tryRotate` | **A física do jogo** — tenta; se colidir, desfaz |
| `lockPiece` / `clearLayers` | Carimbar na grade e limpar camadas completas |
| `renderStack` / `renderPiece` | Desenho da pilha, da peça e do fantasma |
| `drawNext` | Prévia isométrica da próxima peça (canvas 2D) |
| `MENU_FIELDS` / `buildMenu` | Liga o painel OPÇÕES ao CONFIG (localStorage) |
| `keydown` / `#touchpad` | Controles de teclado e toque |
| `loop()` | Relógio do jogo + render |

## 💡 Ideias de exercícios

1. Adicione uma peça nova no `pieces` (comece pela "torre" de 3 cubinhos lá de cima).
2. Mude `layerPoints` para valorizar mais limpezas múltiplas (ex.: `[0, 50, 300, 900, 2000]`).
3. Faça um modo fácil: poço 3×3 com só as peças I, O e torre.
4. Desafio: dê pontos de bônus quando o jogador limpar uma camada usando hard drop.
