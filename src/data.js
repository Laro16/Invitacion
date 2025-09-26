// Importa todas las imágenes y la música que usarás
import historia1 from './assets/imagenes/historia-1.jpg';
import historia2 from './assets/imagenes/historia-2.jpg';
import historia3 from './assets/imagenes/historia-3.jpg';
import historia4 from './assets/imagenes/historia-4.jpg';
import ceremoniaImg from './assets/imagenes/ceremonia.jpg';
import recepcionImg from './assets/imagenes/recepcion.jpg';
import heroPortada from './assets/imagenes/hero-portada.jpg';
import musicaFondo from './assets/musica/fondo.mp3';

export const weddingData = {
  heroImage: heroPortada,
  backgroundMusic: musicaFondo,
  couple: {
    name1: "Isabel",
    name2: "Alejandro"
  },
  event: {
    date: "2025-12-06T13:30:00",
    displayDate: "6 de Diciembre de 2025 · 1:30 pm"
  },
  contact: {
    whatsappNumber: "44649407",
    phone: "44649407",
    phoneDisplay: "44 64 94 07"
  },
  storySlides: [
    { image: historia1, alt: "Cuando nos conocimos", date: "02 de Septiembre, 2025", caption: "Cuando nos conocimos. Una mirada bastó para empezar la aventura." },
    { image: historia2, alt: "Primera cita", date: "16 de Octubre, 2025", caption: "Nuestra primera cita. Entre risas, café y mil planes por delante." },
    { image: historia3, alt: "Primer viaje", date: "08 de Enero, 2026", caption: "El primer viaje. Descubrimos que el mejor destino es estar juntos." },
    { image: historia4, alt: "La propuesta", date: "12 de Febrero, 2027", caption: "¡Dijo que sí! El comienzo de una nueva etapa para siempre." }
  ],
  locations: [
    { type: "Ceremonia", name: "Iglesia Retalhuleu", image: ceremoniaImg, details: "Llegar 15 minutos antes. Hay estacionamiento frente a la entrada.", mapLink: "https://maps.google.com/?q=Iglesia%20Retalhuleu" },
    { type: "Recepción", name: "Salón Las Morenas", image: recepcionImg, details: "Acompáñanos a la cena, el brindis y el baile para celebrar.", mapLink: "https://maps.google.com/?q=Salon%20Las%20Morenas" }
  ],
  itinerary: [
    { time: "6:00 pm", title: "Ceremonia Religiosa", place: "Iglesia Retalhuleu" },
    { time: "8:00 pm", title: "Recepción y Cena", place: "Salón Las Morenas" },
    { time: "10:30 pm", title: "Corte del Pastel", place: "¡El momento más dulce de la noche!" },
    { time: "12:00 am", title: "Despedida y Agradecimientos", place: "Gracias por ser parte de nuestra historia. 💕" }
  ]
};