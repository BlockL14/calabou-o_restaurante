/* ==========================================================================
   CALABOUÇO — CARDÁPIO E DEPOIMENTOS
   - Pratos, descrições e preços são uma PROPOSTA (ticket médio R$ 80–180).
     Ajuste para o cardápio real da casa.
   - Fotos: imagens temporárias do Unsplash. Troque pelas fotos reais dos
     pratos (as mesmas do Instagram), salvas em assets/img/ — ex.:
     img: "assets/img/pizza-calabouco.jpg"
   ========================================================================== */

(function () {
  const u = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  window.CALABOUCO_IMG = u;

  // fb = ícone exibido caso a foto não carregue (pizza, pasta, plate, dessert, wine, glass)
  window.CALABOUCO_CATEGORIES = [
    { id: "entradas", label: "Entradas", short: "Entradas", icon: "plate", fb: "plate", img: u("1540189549336-e6e99c3679fe", 1200) },
    { id: "pizzas-tradicionais", label: "Pizzas Tradicionais", short: "Pizza tradicional", icon: "pizza", fb: "pizza", img: u("1574071318508-1cdbab80d002", 1200) },
    { id: "pizzas-da-casa", label: "Pizzas da Casa", short: "Pizza da casa", icon: "crown", fb: "pizza", img: u("1513104890138-7c749659a591", 1200) },
    { id: "massas", label: "Massas", short: "Massas", icon: "pasta", fb: "pasta", img: u("1473093295043-cdd812d0e601", 1200) },
    { id: "pratos-principais", label: "Pratos Principais", short: "Prato principal", icon: "plate", fb: "plate", img: u("1600891964092-4316c288032e", 1200) },
    { id: "sobremesas", label: "Sobremesas", short: "Sobremesas", icon: "dessert", fb: "dessert", img: u("1551024506-0bccd828d307", 1200) },
    { id: "bebidas", label: "Vinhos & Drinks", short: "Bebidas", icon: "wine", fb: "wine", img: u("1510812431401-41d2bd2722f3", 1200) },
  ];

  // tags: "vegetariano", "picante", "assinatura"
  // featured: true => aparece primeiro na sua aba do cardápio da home
  window.CALABOUCO_MENU = [
    // ---------------- Entradas ----------------
    {
      id: "e1",
      cat: "entradas",
      name: "Bruschetta da Masmorra",
      price: 42,
      desc: "Pão de fermentação natural tostado, tomates confitados, manjericão e azeite extravirgem.",
      meta: "4 unidades",
      tags: ["vegetariano"],
      img: u("1572695157366-5e585ab2b69f"),
    },
    {
      id: "e2",
      cat: "entradas",
      name: "Burrata ao Pesto",
      price: 68,
      desc: "Burrata cremosa, pesto de manjericão, tomate-cereja assado e focaccia quente da casa.",
      meta: "Serve 2",
      tags: ["vegetariano"],
      featured: true,
      img: u("1512621776951-a57141f2eefd"),
    },
    {
      id: "e3",
      cat: "entradas",
      name: "Carpaccio Clássico",
      price: 59,
      desc: "Lâminas finas de filé-mignon, alcaparras, rúcula, lascas de parmesão e molho de mostarda Dijon.",
      meta: "Serve 2",
      tags: [],
      img: u("1504674900247-0877df9cc836"),
    },
    {
      id: "e4",
      cat: "entradas",
      name: "Salada Calabouço",
      price: 46,
      desc: "Folhas nobres, figos, nozes caramelizadas, queijo de cabra e vinagrete de mel.",
      meta: "Individual",
      tags: ["vegetariano"],
      img: u("1540189549336-e6e99c3679fe"),
    },

    // ---------------- Pizzas tradicionais ----------------
    {
      id: "p1",
      cat: "pizzas-tradicionais",
      name: "Margherita",
      price: 89,
      desc: "Molho de tomate italiano, muçarela de búfala, manjericão fresco e azeite extravirgem.",
      meta: "Grande · 8 pedaços",
      tags: ["vegetariano"],
      featured: true,
      img: u("1574071318508-1cdbab80d002"),
    },
    {
      id: "p2",
      cat: "pizzas-tradicionais",
      name: "Calabresa Artesanal",
      price: 92,
      desc: "Calabresa defumada fatiada fina, cebola roxa, azeitonas pretas e orégano.",
      meta: "Grande · 8 pedaços",
      tags: [],
      img: u("1565299624946-b28f40a0ae38"),
    },
    {
      id: "p3",
      cat: "pizzas-tradicionais",
      name: "Quatro Queijos",
      price: 98,
      desc: "Muçarela, gorgonzola, provolone e parmesão gratinados no forno.",
      meta: "Grande · 8 pedaços",
      tags: ["vegetariano"],
      img: u("1604382354936-07c5d9983bd3"),
    },
    {
      id: "p4",
      cat: "pizzas-tradicionais",
      name: "Portuguesa da Casa",
      price: 96,
      desc: "Presunto, ovos, cebola, ervilha fresca, azeitonas e muçarela.",
      meta: "Grande · 8 pedaços",
      tags: [],
      img: u("1593560708920-61dd98c46a4e"),
    },

    // ---------------- Pizzas da casa ----------------
    {
      id: "p5",
      cat: "pizzas-da-casa",
      name: "Pizza Calabouço",
      price: 129,
      desc: "Molho rústico, muçarela, linguiça artesanal, cebola caramelizada, pimenta biquinho e fio de mel picante.",
      meta: "Grande · 8 pedaços",
      tags: ["assinatura", "picante"],
      featured: true,
      img: u("1513104890138-7c749659a591"),
    },
    {
      id: "p6",
      cat: "pizzas-da-casa",
      name: "Parma & Rúcula",
      price: 136,
      desc: "Presunto de Parma, rúcula, tomate seco, lascas de parmesão e redução de balsâmico.",
      meta: "Grande · 8 pedaços",
      tags: ["assinatura"],
      featured: true,
      img: u("1590947132387-155cc02f3212"),
    },
    {
      id: "p7",
      cat: "pizzas-da-casa",
      name: "Funghi Tartufato",
      price: 139,
      desc: "Mix de cogumelos salteados, muçarela, creme de trufas negras e tomilho fresco.",
      meta: "Grande · 8 pedaços",
      tags: ["vegetariano"],
      img: u("1571407970349-bc81e7e96d47"),
    },
    {
      id: "p8",
      cat: "pizzas-da-casa",
      name: "Filé ao Gorgonzola",
      price: 134,
      desc: "Tiras de filé-mignon, gorgonzola cremoso, alho-poró e cebola crispy.",
      meta: "Grande · 8 pedaços",
      tags: [],
      img: u("1579751626657-72bc17010498"),
    },

    // ---------------- Massas ----------------
    {
      id: "m1",
      cat: "massas",
      name: "Carbonara Tradicional",
      price: 78,
      desc: "Spaghetti, guanciale crocante, gema, pecorino romano e pimenta-do-reino moída na hora.",
      meta: "Individual",
      tags: [],
      featured: true,
      img: u("1612874742237-6526221588e3"),
    },
    {
      id: "m2",
      cat: "massas",
      name: "Fettuccine ao Funghi",
      price: 84,
      desc: "Molho cremoso de cogumelos, parmesão e finalização com azeite de trufas.",
      meta: "Individual",
      tags: ["vegetariano"],
      img: u("1473093295043-cdd812d0e601"),
    },
    {
      id: "m3",
      cat: "massas",
      name: "Ravioli de Costela",
      price: 92,
      desc: "Ravioli recheado de costela braseada, molho de vinho tinto e manteiga de sálvia.",
      meta: "Individual",
      tags: ["assinatura"],
      img: u("1621996346565-e3dbc646d9a9"),
    },

    // ---------------- Pratos principais ----------------
    {
      id: "c1",
      cat: "pratos-principais",
      name: "Filé ao Molho de Vinho",
      price: 128,
      desc: "Medalhão de filé-mignon, redução de vinho tinto e risoto cremoso de parmesão.",
      meta: "Individual",
      tags: ["assinatura"],
      featured: true,
      img: u("1600891964092-4316c288032e"),
    },
    {
      id: "c2",
      cat: "pratos-principais",
      name: "Costela Braseada",
      price: 112,
      desc: "Costela cozida lentamente até desmanchar, purê rústico de batata e farofa de ervas.",
      meta: "Individual",
      tags: [],
      img: u("1544025162-d76694265947"),
    },
    {
      id: "c3",
      cat: "pratos-principais",
      name: "Risoto de Cogumelos",
      price: 89,
      desc: "Arbóreo, mix de cogumelos frescos, vinho branco, manteiga e parmesão.",
      meta: "Individual",
      tags: ["vegetariano"],
      img: u("1476124369491-e7addf5db371"),
    },

    // ---------------- Sobremesas ----------------
    {
      id: "s1",
      cat: "sobremesas",
      name: "Tiramisù da Casa",
      price: 36,
      desc: "Biscoito embebido em café, creme de mascarpone e cacau em pó.",
      meta: "Individual",
      tags: ["vegetariano"],
      featured: true,
      img: u("1571877227200-a0d98ea607e9"),
    },
    {
      id: "s2",
      cat: "sobremesas",
      name: "Petit Gâteau",
      price: 38,
      desc: "Bolo quente de chocolate meio amargo com coração cremoso e sorvete de creme.",
      meta: "Individual",
      tags: ["vegetariano"],
      img: u("1606313564200-e75d5e30476c"),
    },
    {
      id: "s3",
      cat: "sobremesas",
      name: "Panna Cotta de Frutas Vermelhas",
      price: 34,
      desc: "Creme italiano de baunilha com calda quente de frutas vermelhas.",
      meta: "Individual",
      tags: [],
      img: u("1488477181946-6428a0291777"),
    },
    {
      id: "s4",
      cat: "sobremesas",
      name: "Pizza Doce de Nutella & Morango",
      price: 59,
      desc: "Massa fina, creme de avelã, morangos frescos e açúcar de confeiteiro.",
      meta: "Brotinho · 4 pedaços",
      tags: ["vegetariano"],
      img: u("1551024506-0bccd828d307"),
    },

    // ---------------- Vinhos & drinks ----------------
    {
      id: "b1",
      cat: "bebidas",
      name: "Vinho Tinto da Casa — Taça",
      price: 38,
      desc: "Seleção rotativa de tintos encorpados para acompanhar pizzas e carnes.",
      meta: "Taça 150 ml",
      tags: [],
      img: u("1510812431401-41d2bd2722f3"),
    },
    {
      id: "b2",
      cat: "bebidas",
      name: "Tinto Reserva — Garrafa",
      price: 189,
      desc: "Malbec ou Cabernet Sauvignon de seleção especial. Consulte os rótulos do dia.",
      meta: "Garrafa 750 ml",
      tags: [],
      img: u("1474722883778-792e7990302f"),
    },
    {
      id: "b3",
      cat: "bebidas",
      name: "Negroni Calabouço",
      price: 42,
      desc: "Gin, Campari e vermute rosso, com casca de laranja queimada.",
      meta: "Drink da casa",
      tags: ["assinatura"],
      featured: true,
      img: u("1514362545857-3bc16c4c7d1b"),
    },
    {
      id: "b4",
      cat: "bebidas",
      name: "Soda Italiana",
      price: 22,
      desc: "Xarope artesanal (frutas vermelhas, maçã verde ou limão-siciliano) com água gaseificada.",
      meta: "Sem álcool · 400 ml",
      tags: [],
      img: u("1470337458703-46ad1756a187"),
    },
  ];

  // EXEMPLOS DE DEPOIMENTOS — substituir por avaliações reais (Google,
  // Instagram, TripAdvisor), sempre com autorização dos clientes.
  window.CALABOUCO_TESTIMONIALS = [
    {
      name: "Camila R.",
      occasion: "Jantar a dois",
      rating: 5,
      text: "Parece que você entra em outro mundo. A luz de velas, a música baixa e a Pizza Calabouço com mel picante — saímos já planejando a próxima vez.",
    },
    {
      name: "Eduardo M.",
      occasion: "Aniversário em família",
      rating: 5,
      text: "Comemoramos os 60 anos da minha mãe e fomos tratados com um carinho enorme. A equipe ajudou a escolher o vinho e acertou em cheio.",
    },
    {
      name: "Juliana P.",
      occasion: "Noite com amigas",
      rating: 5,
      text: "A carbonara é das melhores que já comi fora da Itália. Serviço atencioso e sem pressa, do jeito que um jantar deve ser.",
    },
    {
      name: "Rodrigo A.",
      occasion: "Primeira visita",
      rating: 5,
      text: "Conheci pelo Instagram e o lugar é ainda mais bonito pessoalmente. Ambiente escuro, aconchegante e muito elegante.",
    },
    {
      name: "Fernanda & Lucas",
      occasion: "Programa de sexta",
      rating: 5,
      text: "A Parma & Rúcula tem uma massa levíssima, com borda crocante. Virou nosso ritual de fim de semana.",
    },
    {
      name: "Marcelo T.",
      occasion: "Jantar de negócios",
      rating: 5,
      text: "Levei clientes e foi um acerto. Elegante sem ser engessado, cardápio bem executado e uma carta de vinhos que impressiona.",
    },
  ];
})();
