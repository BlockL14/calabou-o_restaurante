# Calabouço Restaurante — Landing page

Site institucional e de vendas do **Calabouço Restaurante & Pizzaria**, pensado como destino do link da bio do
Instagram ([@calaboucorestaurante](https://www.instagram.com/calaboucorestaurante/)).

Site estático (HTML, CSS e JavaScript puros): não precisa de build, banco de dados nem servidor especial.

## Páginas

| Página | Arquivo | Conteúdo |
| --- | --- | --- |
| Início | `index.html` | Banner principal, destaques da casa, categorias, experiência, depoimentos, Instagram e chamada para reserva |
| Cardápio | `cardapio.html` | Catálogo com categorias, busca, faixa de preço, filtros (vegetariano, picante, assinatura) e ordenação |
| Sobre nós | `sobre.html` | História da marca em capítulos, pilares, galeria e todos os depoimentos |
| Contato | `contato.html` | Canais de contato, horários com status "aberto agora", formulário de reserva e mapa |

### Como o site gera reservas e pedidos

- **Minha seleção**: o cliente adiciona pratos pelo cardápio, ajusta quantidades e envia o pedido pronto.
- **Formulário de reserva**: valida data e horário (bloqueia os dias fechados) e monta a mensagem.
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

## Como editar

### Contatos, endereço e horários: `assets/js/config.js`

Tudo é replicado automaticamente em todas as páginas: rodapé, página de contato, mapa, botões e dados para o Google.

```js
whatsapp: "5541999998888", // DDI 55 + DDD + número, só dígitos
hours: [
  { day: 1, closed: true },                  // segunda fechado
  { day: 5, open: "18:00", close: "00:00" }, // sexta até meia-noite
],
```

### Cardápio: `assets/js/data.js`

Cada prato é um objeto:

```js
{
  id: "p5",                       // único
  cat: "pizzas-da-casa",          // id de uma categoria em CALABOUCO_CATEGORIES
  name: "Pizza Calabouço",
  price: 129,
  desc: "Molho rústico, muçarela…",
  meta: "Grande · 8 pedaços",
  tags: ["assinatura", "picante"], // "vegetariano" | "picante" | "assinatura"
  featured: true,                 // aparece em "Destaques da casa" (os 4 primeiros)
  img: "assets/img/pizza-calabouco.jpg",
}
```

### Fotos

1. Salve as fotos em `assets/img/`, de preferência em `.jpg` ou `.webp`, com 1200–1600 px de largura e até ~300 KB cada.
2. Nos pratos, troque o campo `img` em `data.js`.
3. Nas fotos de ambiente (banner, história, galeria), troque o `src` das tags `<img>` nos arquivos `.html`.

Se uma foto não carregar, o site exibe automaticamente um painel com o emblema da casa, sem deixar ícone quebrado.

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
    ├── css/styles.css   # paleta, tipografia e componentes
    ├── js/config.js     # dados do negócio (editar aqui)
    ├── js/data.js       # cardápio, categorias e depoimentos
    ├── js/main.js       # comportamento comum (menu, seleção, horários, ícones)
    ├── js/cardapio.js   # filtros do catálogo
    ├── js/contato.js    # formulário de reserva
    ├── fonts/           # Cinzel, Cormorant Garamond e Manrope (licença SIL OFL)
    └── img/favicon.svg
```

**Identidade visual**:
- Paleta: preto carvão `#0b0807`, marrom `#4a2e22`, vermelho vinho `#9e1f1f` / `#5c1015` e âmbar `#d9a441`.
- Tipografia: Cinzel (marca), Cormorant Garamond (títulos) e Manrope (texto).
- As fontes são hospedadas no próprio site, sem depender do Google Fonts.
