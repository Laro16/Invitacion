import React, { useState, useEffect, useRef } from 'react';
import { weddingData } from './data.js';

const pad = (num) => String(num).padStart(2, '0');

function Boda() {
  const { heroImage, backgroundMusic, couple, event, contact, storySlides, locations, itinerary } = weddingData;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [companions, setCompanions] = useState('0');

  // 👇 NUEVOS ESTADOS para controlar la visibilidad de la historia y el modal de imagen
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [activeModalSlide, setActiveModalSlide] = useState(null);

  const audioRef = useRef(null);

  // Countdown Timer Effect (sin cambios)
  useEffect(() => {
    const targetDate = new Date(event.date);
    const interval = setInterval(() => {
      const diff = targetDate - new Date();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  // 👇 CAMBIO AQUÍ: El carrusel ahora dura 15 segundos y se detiene si el modal está abierto
  useEffect(() => {
    let timer;
    // Solo iniciar el temporizador si la historia es visible y no hay un modal activo
    if (isStoryVisible && activeModalSlide === null) {
      timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % storySlides.length);
      }, 15000); // 15 segundos
    }
    return () => clearInterval(timer);
  }, [isStoryVisible, activeModalSlide, storySlides.length]);
  
  // Scroll Reveal Animation Effect (sin cambios)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.4 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 👇 CAMBIO AQUÍ: Se eliminó el useEffect que iniciaba la música con cualquier clic

  const handleScrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ... (el resto de las funciones como handleAddToCalendar, handleRsvpSubmit, etc. no cambian)
  const handleAddToCalendar = () => {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const fmt = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Creative Studio//Boda//ES\nBEGIN:VEVENT\nUID:${Date.now()}@boda\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:Boda de ${couple.name1} & ${couple.name2}\nLOCATION:${locations[0].name}; Recepción: ${locations[1].name}\nDESCRIPTION:Acompáñanos en nuestro gran día 💕\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `Boda-${couple.name1}-${couple.name2}.ics` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return alert('Por favor, escribe tu nombre.');
    const compText = companions === '-1' ? 'Lamentablemente no podré asistir.'
      : (companions === '0' ? 'Confirmo mi asistencia (sin acompañantes).'
      : `Confirmo mi asistencia con ${companions} acompañante${companions === '1' ? '' : 's'}.`);
    const msg = `¡Hola! Soy ${guestName}. ${compText}`;
    window.open(`https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const togglePlayPause = () => audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
  const toggleMute = () => { if(audioRef.current) audioRef.current.muted = !audioRef.current.muted; };
  const handleAudioStateChange = () => {
    if (audioRef.current) {
      setIsPlaying(!audioRef.current.paused);
      setIsMuted(audioRef.current.muted);
    }
  };


  return (
    <>
      <header className="hero" id="hero" style={{
        backgroundImage: `linear-gradient(to top, rgba(30, 65, 58, 0.7), rgba(30, 65, 58, 0.3) 60%, transparent), url('${heroImage}')`
      }}>
        {/* ... (código del hero sin cambios) ... */}
      </header>
      
      {/* ... (código del reproductor de música sin cambios) ... */}

      <main>
        <section id="historia" className="wrap reveal sectioned">
          <h2 className="title">Nuestra Historia</h2>
          
          {/* 👇 CAMBIO AQUÍ: Lógica para mostrar la portada o el carrusel */}
          {!isStoryVisible ? (
            <div className="story-cover">
              <p className="subtitle">Un viaje a través de los momentos que nos trajeron hasta aquí.</p>
              <button className="btn-circle" onClick={() => setIsStoryVisible(true)}>
                Ver Nuestra Historia
              </button>
            </div>
          ) : (
            <>
              <p className="subtitle">Desliza para revivir nuestros recuerdos más queridos. Haz clic en una imagen para verla en grande.</p>
              <div className="slider">
                <div className="slides-container">
                  <ul className="slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {storySlides.map((slide, index) => (
                      <li 
                        key={index} 
                        className={`slide ${index === currentSlide ? 'is-active' : ''}`}
                        onClick={() => setActiveModalSlide(index)} // <-- Abre el modal al hacer clic
                      >
                        <img src={slide.image} alt={slide.alt} loading="lazy" />
                        <div className="overlay"><b>{slide.date}</b><p style={{ margin: '4px 0 0' }}>{slide.caption}</p></div>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); setCurrentSlide((currentSlide - 1 + storySlides.length) % storySlides.length); }}>⟵</button>
                <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); setCurrentSlide((currentSlide + 1) % storySlides.length); }}>⟶</button>
                <div className="dots">
                  {storySlides.map((_, index) => <button key={index} onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }} aria-current={index === currentSlide}></button>)}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ... (resto de las secciones como lugares, itinerario, etc., sin cambios) ... */}
      </main>

      {/* 👇 CAMBIO AQUÍ: Estructura del Modal (Lightbox) para las imágenes */}
      {activeModalSlide !== null && (
        <div className="lightbox-overlay" onClick={() => setActiveModalSlide(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveModalSlide(null)}>&times;</button>
            <img src={storySlides[activeModalSlide].image} alt={storySlides[activeModalSlide].alt} />
            <div className="lightbox-caption">
              <b>{storySlides[activeModalSlide].date}</b>
              <p>{storySlides[activeModalSlide].caption}</p>
            </div>
          </div>
        </div>
      )}

      <audio 
        ref={audioRef}
        src={backgroundMusic}
        preload="auto" 
        loop
        onPlay={handleAudioStateChange}
        onPause={handleAudioStateChange}
      />
    </>
  );
}

export default Boda;
