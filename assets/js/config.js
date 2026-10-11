/* ==========================================================================
   CALABOUÇO — CONFIGURAÇÃO DO NEGÓCIO
   Edite APENAS este arquivo para atualizar contatos, endereço e horários.
   Tudo o que estiver aqui é replicado automaticamente em todas as páginas.
   ========================================================================== */

window.CALABOUCO_CONFIG = {
  name: "Calabouço Restaurante",
  shortName: "Calabouço",
  tagline: "Restaurante & Pizzaria",

  // Perfil oficial informado pelo cliente.
  instagram: {
    user: "calaboucorestaurante",
    url: "https://www.instagram.com/calaboucorestaurante/",
  },

  // WhatsApp: somente números, com DDI (55) + DDD. Ex.: "5541999998888".
  // Enquanto estiver vazio, os botões de reserva/pedido abrem o Direct do
  // Instagram e copiam a mensagem pronta para a área de transferência.
  whatsapp: "",

  // ATENÇÃO — CONFIRMAR: telefone e endereço abaixo vieram de uma listagem
  // pública na internet ("Calabouço Restaurante e Pizzaria", Curitiba/PR) e
  // não puderam ser validados com o perfil do Instagram.
  phone: {
    display: "(41) 3254-6112",
    tel: "+554132546112",
  },
  address: {
    street: "R. Mateus Leme, 1000",
    district: "Centro Cívico",
    city: "Curitiba",
    state: "PR",
    zip: "80530-010",
  },

  // EXEMPLO — substituir pelos horários reais.
  // day: 0 = domingo, 1 = segunda ... 6 = sábado. Fechamento "00:00" = meia-noite.
  hours: [
    { day: 1, closed: true },
    { day: 2, open: "18:00", close: "23:00" },
    { day: 3, open: "18:00", close: "23:00" },
    { day: 4, open: "18:00", close: "23:00" },
    { day: 5, open: "18:00", close: "00:00" },
    { day: 6, open: "18:00", close: "00:00" },
    { day: 0, open: "18:00", close: "23:00" },
  ],

  // Horários oferecidos no formulário de reserva.
  reservationSlots: { start: "18:00", end: "22:30", step: 30 },

  // Opções exibidas no envio da "Minha seleção" (pedido).
  orderModes: ["Pedido para a mesa reservada", "Retirada no local", "Delivery (consultar área)"],
};
