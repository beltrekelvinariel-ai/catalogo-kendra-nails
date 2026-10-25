/**
 * KENDRA NAILS — CONFIGURACIÓN GENERAL DEL CATÁLOGO
 * 
 * Este archivo centraliza los datos de contacto y la conexión opcional a Google Sheets.
 * La dueña puede editar su número de WhatsApp o pegar aquí el enlace público CSV de su Google Sheet.
 */

const KENDRA_CONFIG = {
  // Información de la marca
  salonName: "Kendra Nails",
  slogan: "✦ Uñas que hablan de ti ✦",
  tagline: "Arte, sofisticación y cuidado en cada detalle de tus manos",
  
  // Moneda del catálogo (Pesos Dominicanos confirmados)
  currency: {
    code: "DOP",
    symbol: "RD$",
    locale: "es-DO"
  },

  // Contacto y redes
  contact: {
    whatsapp: "18299357408", // República Dominicana +1 (829) 935-7408
    whatsappDisplay: "+1 (829) 935-7408",
    whatsappMessageTemplate: "¡Hola Kendra Nails! Vi su catálogo digital y me interesa consultar por el diseño *{designName}*{lengthText} con precio aproximado de *{price}*.",
    whatsappGeneralTemplate: "¡Hola Kendra Nails! Vi su catálogo digital y me gustaría agendar una cita o consultar disponibilidad.",
    instagram: "kendranails", // Usuario de Instagram sin @
    instagramUrl: "https://instagram.com/kendranails",
    address: "Disponible previa cita en nuestro estudio",
    hours: "Lunes a Sábado: 9:00 AM – 7:00 PM (Solo con reserva previa)",
    notes: "Para garantizar una atención exclusiva y personalizada, todos los servicios se realizan con previa cita."
  },

  // Integración con Google Sheets (OPCIONAL)
  // Cuando la dueña cree su Google Sheet y lo publique como CSV (Archivo > Compartir > Publicar en la web > CSV),
  // puede pegar ese enlace aquí o en el panel de administración del catálogo.
  // Si está vacío, el catálogo carga los datos de 'data/designs.json' instantáneamente.
  googleSheet: {
    csvUrl: "", // Ej: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
    enabled: false
  },

  // Rutas de datos locales de respaldo
  dataSources: {
    localJson: "data/designs.json",
    localSalonInfo: "data/salon_info.json"
  }
};

// Exportar globalmente
if (typeof window !== "undefined") {
  window.KENDRA_CONFIG = KENDRA_CONFIG;
}
