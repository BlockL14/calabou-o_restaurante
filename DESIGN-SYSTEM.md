# Design system "Brasa" — Calabouço

Sistema visual extraído de três referências e adaptado à marca (restaurante e pizzaria escuro, à luz de velas).
Tudo o que é compartilhado está em `assets/css/base.css`; a composição da home está em `assets/css/pages/home.css`.

## De onde veio cada decisão

| Referência | O que foi extraído | Onde aparece |
| --- | --- | --- |
| **Best Pizza** (layout de pizzaria) | Pretos neutros (`#0C0C0C`) e cartões `#1E1E1E`; CTA amarelo em pílula; laranja nas palavras de destaque; título em slab larga e caixa alta; pizza vazando pela borda do banner com arco tracejado de benefícios; abas de categoria em pílula; cartão com foto redonda saindo do cartão e fio laranja sob o título; paginação "‹ 1/2 ›"; cartões de promoção com número grande em laranja e moldura grossa; depoimentos em carrossel com cartão central em destaque e avatar com anel tracejado; fundo de madeira escura; ícones sociais amarelos | Hero, cardápio, destaques, depoimentos, rodapé |
| **Japan Tours** (landing de viagem) | Fotografia cinematográfica em tela cheia; navegação em pílula de vidro fosco; palavra gigante translúcida atrás do conteúdo; títulos condensados em caixa alta com fio até a margem; rótulo entre fios; linha do tempo vertical com pontos e fotos sobrepostas; cartões só com contorno ("What's included"); painel de vidro sobre a foto | Navegação, hero, "Uma noite aqui", "O que te espera", chamada final |
| **RedSun** (template Webflow) | "Sol" vermelho com brilho atrás do produto; feixes de luz verticais; luz que acompanha o cursor; botão com glow; selo em pílula com etiqueta ("What's new"); faixa rolante com fade nas bordas; entrada em sequência (fade + 20 px); rodapé com marca + colunas + divisória | Hero, botões, faixa rolante, rodapé, animações |

### Como os valores foram obtidos (e o grau de certeza)

- **Best Pizza e Japan Tours**: cores medidas por amostragem de pixels das imagens enviadas (JPEG, margem de erro de
  alguns tons). Ex.: amarelo do CTA `#FCCC2E`, laranja `#DE4E12`, cartão `#1E1E1E`, fundo `#0C0C0C`; cinza dos títulos
  do Japan `#A2A2A2`, contorno dos cartões ≈ branco a 50%.
- **RedSun**: o HTML salvo não traz o CSS (o arquivo `.css` ficava num CDN que este ambiente não acessa). Do RedSun
  foram extraídos **padrões e estrutura** (classes como `button-glow`, `light left/middle/right`, `cursor-light`,
  `badge-wrapper`, `company-logo-holder`, `footer-wrapper`), não valores medidos. As cores do brilho foram ajustadas à
  paleta do Calabouço.
- **Fontes**: a fonte do título da Best Pizza não foi identificada com certeza. Foram comparadas oito slabs abertas;
  a **Arvo 700** é a mais próxima em largura e peso. Para os títulos condensados do Japan Tours, **Saira Condensed 600**.

## Tokens

### Cores

| Token | Valor | Uso | Contraste sobre `--bg` |
| --- | --- | --- | --- |
| `--bg` | `#0C0A09` | Fundo da página | — |
| `--bg-2` | `#13100E` | Seções alternadas | — |
| `--tile` | `#1C1917` | Cartões | — |
| `--tile-2` / `--tile-3` | `#26221F` / `#322D29` | Molduras, hover | — |
| `--yellow` | `#FCCC2E` | **Ação**: botões principais, links, estados ativos | 13,0:1 |
| `--on-yellow` | `#1A1206` | Texto sobre amarelo | 12,2:1 sobre o amarelo |
| `--ember` | `#EE6326` | **Destaque tipográfico**: palavra do título, preço em promoção, nome no depoimento | 6,1:1 |
| `--red` | `#C8261D` | Brilho do "sol", botão flutuante | — |
| `--text` / `--text-2` / `--text-3` | `#F6F2ED` / `#AAA49F` / `#8C8682` | Texto principal / secundário / terciário | 17,7 / 8,0 / 5,5:1 |
| `--line` / `--line-2` / `--line-strong` | branco quente a 9% / 16% / 38% | Divisórias / bordas / contorno dos cartões | — |
| `--glass`, `--glass-line`, `--blur` | `rgba(28,24,21,.5)`, 14%, 18 px | Vidro fosco (navegação, selo, painel) | — |

O laranja da Best Pizza (`#DE4E12`) foi clareado para `#EE6326`: o original mede 4,9:1 sobre o fundo e 4,3:1 sobre os
cartões (abaixo do mínimo de 4,5:1 para texto pequeno); o novo mede 6,1:1 e 5,4:1.

`--amber` continua existindo como apelido de `--yellow`, para as páginas internas.

### Tipografia

| Papel | Família | Classe | Regra |
| --- | --- | --- | --- |
| Display | Arvo 700 | `.t-display` (caixa alta), `.t-hero`, `.t-headline`, `.t-title` | Títulos. Caixa alta só em títulos curtos (até ~4 palavras), com `.upper` |
| Título de seção | Saira Condensed 600 | `.t-section` | Caixa alta, cinza, com fio até a margem (`.t-section--center` põe fio dos dois lados) |
| Rótulo | Saira Condensed 600 | `.eyebrow` / `.kicker`, `.kicker--lined` | Caixa alta, espaçamento 0,16 em, amarelo |
| Texto e interface | Inter (variável) | — | Corpo, botões, formulários |
| Destaque | — | `.ember` | Uma palavra ou expressão por título, no máximo |

As três fontes são servidas pelo próprio site (`assets/fonts/`, licença SIL OFL).

### Forma, profundidade e movimento

- Raios: `--radius-sm` 12 px · `--radius` 18 px · `--radius-lg` 26 px · `--pill` 999 px (botões, abas, selos).
- `--shadow-glow`: brilho laranja/vermelho do botão principal (RedSun). `--shadow-card`: sombra longa dos cartões.
- Tracejado (`--dash`): arco do banner e anel dos avatares (Best Pizza).
- Movimento: `.reveal` (fade + 24 px, em sequência com `--delay`), faixa rolante com botão de pausa, pizza girando
  devagar, feixes de luz pulsando. Tudo isso é desligado com "reduzir movimento".

## Componentes

| Componente | Classe | Origem |
| --- | --- | --- |
| Botão principal / secundário / fantasma / claro | `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--light` | Best Pizza (pílula amarela, caixa alta) + RedSun (glow, seta) |
| Selo com etiqueta | `.badge-pill` + `.badge-pill__tag` + `.status-dot` | RedSun |
| Navegação em pílula de vidro | `.gnav` / `.gnav__inner` | Japan Tours |
| Abas | `.tabs` / `.tab[aria-selected]` | Best Pizza |
| Cartão do cardápio com foto redonda | `.menu-card` | Best Pizza |
| Paginação | `.pager` | Best Pizza |
| Cartão de contorno | `.outline-card` | Japan Tours |
| Painel de vidro | `.glass-card` | Japan Tours |
| Faixa rolante | `.marquee` (+ `.marquee__toggle`) | RedSun |
| Fundo de madeira escura | `.section--texture` | Best Pizza |
| Botões de seta / redondos | `.arrow-btn`, `.circle-btn` | Best Pizza |
| Rodapé com marca e ícones | `.footer__top`, `.footer__brand`, `.social-btn` | RedSun + Best Pizza |

### Estados

- **Selecionado** (abas, filtros, data, horário, ocasião): contorno amarelo + fundo amarelo a 12% + texto amarelo.
- **Foco**: contorno amarelo de 2 px, afastado 3 px.
- **Hover em cartões**: borda amarela suave + brilho laranja.

## Regras de uso

- Amarelo é **ação**; laranja é **ênfase**. Não usar laranja em botões nem amarelo como enfeite de título.
- Um botão principal (amarelo) por bloco; os demais em `.btn--ghost`.
- Caixa alta em botões, rótulos e títulos curtos; nunca em parágrafos.
- Fotos redondas precisam de imagem vista de cima (a pizza inteira centralizada). Fotos de ambiente vão em
  retângulos.
- Brilho, feixes e palavra gigante são exclusivos do banner da home, para não banalizar o efeito.
