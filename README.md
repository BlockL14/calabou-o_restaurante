# Calabouço Restaurante — Landing page

Site institucional e de vendas do **Calabouço Restaurante & Pizzaria**, pensado como destino do link da bio do
Instagram ([@calaboucorestaurante](https://www.instagram.com/calaboucorestaurante/)).

Site estático (HTML, CSS e JavaScript puros): não precisa de build, banco de dados nem servidor especial.

## Referências de design

A interface segue padrões consagrados de landing pages de marcas grandes:

| Onde | Padrão de referência |
| --- | --- |
| Estrutura geral, navegação, tipografia, blocos de destaque, rodapé | **Apple** (apple.com) |
| Vitrine "Os mais pedidos" (galeria horizontal com setas) | **Apple / Nike** |
| Cardápio: barra lateral de categorias no desktop | **Starbucks** (menu) |
| Cardápio no celular, ficha do produto, sacola com barra inferior | **iFood / Domino's** |
| Reserva: pessoas, datas e horários em botões | **OpenTable / Resy** |
| Cartão "Visite-nos" com status, horários e mapa | **Apple Store** (página da loja) |
| Depoimentos | **Airbnb** |
| Sobre nós: texto que acende com a rolagem e mídia fixa | **Apple** + editorial de restaurantes de luxo |

## Páginas

| Página | Arquivo | Conteúdo |
| --- | --- | --- |
| Início | `index.html` | Banner, pizza assinatura, categorias, mais pedidos, manifesto, diferenciais, depoimentos, Instagram e reserva |
| Cardápio | `cardapio.html` | Categorias, busca, preferências, faixa de preço, ordenação, ficha do produto e sacola |
| Sobre nós | `sobre.html` | História em capítulos, pilares, galeria do ambiente e depoimentos |
| Reservas e contato | `contato.html` | Reserva (pessoas, data, horário), canais, horários, mapa e perguntas frequentes |

### Como o site gera reservas e pedidos

- **Sacola**: o cliente adiciona pratos (pelo botão "+" ou pela ficha do produto), ajusta quantidades e envia o pedido pronto.
  A sacola fica salva no navegador e sincroniza entre abas.
- **Reserva**: escolhe pessoas, data e horário (dias fechados e horários passados ficam bloqueados) e envia a solicitação.
- **Canal de envio**:
  - com o WhatsApp configurado, abre o WhatsApp com a mensagem já escrita;
  - sem WhatsApp, copia a mensagem e abre o Direct do Instagram para o cliente colar.
- **Origem**: links com `?utm_source=instagram` fazem a mensagem começar com "Vim pelo Instagram", o que
  ajuda a medir quantos clientes chegam pela bio.

## Antes de publicar: o que precisa ser confirmado

Os itens abaixo são **provisórios**. Revise-os antes de divulgar o site:

1. **WhatsApp**: preencha `whatsapp` em `assets/js/config.js`.
2. **Endereço e telefone** (`config.js`): vieram de uma listagem pública na internet e **não foram confirmados**.
3. **Horários** (`config.js`): são um exemplo.
4. **Cardápio e preços** (`assets/js/data.js`): são uma proposta coerente com o ticket médio de R$ 80–180.
5. **Depoimentos** (`data.js`): são **exemplos ilustrativos**. Troque por avaliações reais (Google ou Instagram),
   com autorização dos clientes. Não publique depoimentos fictícios como se fossem reais.
6. **História da marca** (`sobre.html`): é um texto institucional proposto. Inclua os fatos reais da casa
   (ano de fundação, fundadores, marcos).
7. **Fotos**: são imagens temporárias do Unsplash. Troque pelas fotos reais (veja abaixo).
8. **Formas de pedido** (`config.js`, `orderModes`): "Retirada no local" e "Delivery" só devem ficar se a casa
   oferecer esses serviços.
9. **Selos "Vegetariano"** (`data.js`): confirme com a cozinha (queijos com coalho animal, por exemplo).

## Como editar

### Contatos, endereço e horários: `assets/js/config.js`

Tudo é replicado automaticamente em todas as páginas: rodapé, reservas, mapa, botões e dados para o Google.

```js
whatsapp: "5541999998888", // DDI 55 + DDD + número, só dígitos
hours: [
  { day: 1, closed: true },                  // segunda fechado
  { day: 5, open: "18:00", close: "00:00" }, // sexta até meia-noite
],
reservationSlots: { start: "18:00", end: "22:30", step: 30 }, // horários oferecidos na reserva
```

### Cardápio: `assets/js/data.js`

Cada prato é um objeto:

```js
{
  id: "p5",                        // único
  cat: "pizzas-da-casa",           // id de uma categoria em CALABOUCO_CATEGORIES
  name: "Pizza Calabouço",
  price: 129,
  desc: "Molho rústico, muçarela…",
  meta: "Grande · 8 pedaços",
  tags: ["assinatura", "picante"], // "vegetariano" | "picante" | "assinatura"
  featured: true,                  // aparece na vitrine "Os mais pedidos" da home
  img: "assets/img/pizza-calabouco.jpg",
}
```

### Fotos

1. Salve as fotos em `assets/img/`, de preferência em `.jpg` ou `.webp`, com 1200–1600 px de largura e até ~300 KB cada.
2. Nos pratos, troque o campo `img` em `data.js`.
3. Nas fotos de ambiente (banner, blocos, história, galeria), troque o `src` das tags `<img>` nos arquivos `.html`.

Se uma foto não carregar, o site exibe um painel escuro com o ícone da categoria, sem deixar ícone quebrado.

## Testar localmente

Abra `index.html` no navegador ou, de preferência, rode um servidor local:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

## Publicar (gratuito)

- **GitHub Pages**: Settings → Pages → *Deploy from a branch* → selecione a branch e a pasta `/ (root)`.
- **Netlify / Vercel / Cloudflare Pages**: importe o repositório. Não há comando de build, e a pasta de publicação é a raiz.

Depois de publicar, coloque na bio do Instagram:

```
https://SEU-DOMINIO/?utm_source=instagram&utm_medium=bio
```

## Estrutura

```
├── index.html, cardapio.html, sobre.html, contato.html
└── assets/
    ├── css/base.css       # design system: cores, tipografia, navegação, componentes
    ├── css/pages/*.css    # estilos específicos de cada página
    ├── js/config.js       # dados do negócio (editar aqui)
    ├── js/data.js         # cardápio, categorias e depoimentos
    ├── js/main.js         # comportamento comum (navegação, sacola, ficha do produto, horários, ícones)
    ├── js/cardapio.js     # filtros e categorias do cardápio
    ├── js/contato.js      # reserva
    ├── js/sobre.js        # efeitos da página Sobre nós
    ├── fonts/             # Inter (licença SIL OFL)
    └── img/                # favicon.svg e apple-touch-icon.png
```

**Identidade visual**:
- Paleta: preto `#0a0807`, superfícies marrom-escuras `#171210`, vermelho `#c8261d` (ações) e âmbar `#f2b544` (links e destaques).
- Tipografia: Inter, a alternativa aberta mais próxima da SF Pro da Apple, hospedada no próprio site.
