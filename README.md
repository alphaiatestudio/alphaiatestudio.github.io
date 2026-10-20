# Alpha-IAte Studio · jogos

Jogos lançados pelo Alpha-IAte Studio. Cada jogo é um único arquivo HTML: abra no navegador e jogue.

Jogue online: https://alphaiatestudio.github.io/

| Jogo | Arquivo |
|---|---|
| Snake Cubo 3D | `snake-cubo-3d-cdn.html` |
| Tetris Neon 3D | `tetris-neon-3d.html` |

Documentação dos jogos: [README-snake.md](README-snake.md) e [README-tetris.md](README-tetris.md).

## Senha do navio

A página inicial tem o campo **SENHA DO NAVIO**, que abre uma demonstração do Alpha-IAte, o iate da tripulação do estúdio. O iate fica cifrado em `navio.json` e só abre com a senha. Para gerar de novo, rode no repositório `alpha-iate`:

```
node tools/gerar-demo.mjs <senha> <caminho deste repositório>/navio.json
```
