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
  
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [activeModalSlide, setActiveModalSlide] = useState(null);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const audioRef = useRef(null);

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
  
  // 👇 CAMBIO AQUÍ: Se agrega 'isStoryVisible' al array de dependencias
  // Esto fuerza al efecto a re-ejecutarse cuando la galería se muestra,
  // permitiendo que el observer encuentre los nuevos elementos.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), 
      { threshold: 0.4 }
    );
    
    // Seleccionamos solo los elementos que aún no son visibles
    const elementsToReveal = document.querySelectorAll('.reveal:not(.visible)');
    elementsToReveal.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isStoryVisible]); // <-- LA CORRECCIÓN CLAVE ESTÁ AQUÍ

  const handleScrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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

  const minSwipeDistance = 50;
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % storySlides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + storySlides.length) % storySlides.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };


  return (
    <>
      <header className="hero" id="hero" style={{
        backgroundImage: `linear-gradient(to top, rgba(30, 65, 58, 0.7), rgba(30, 65, 58, 0.3) 60%, transparent), url('${heroImage}')`
      }}>
        <div className="wrap reveal">
          <span className="badge">NUESTRA BODA</span>
          <h1>{couple.name1} y {couple.name2}</h1>
          <p className="sub">{event.displayDate}</p>
          <div className="countdown" aria-live="polite">
            <div className="time-box"><span className="num">{pad(timeLeft.days)}</span><span className="label">Días</span></div>
            <div className="time-box"><span className="num">{pad(timeLeft.hours)}</span><span className="label">Horas</span></div>
            <div className="time-box"><span className="num">{pad(timeLeft.mins)}</span><span className="label">Minutos</span></div>
            <div className="time-box"><span className="num">{pad(timeLeft.secs)}</span><span className="label">Segundos</span></div>
          </div>
          <div className="cta-row">
            <button className="btn secondary" onClick={() => handleScrollTo('historia')}>Nuestra Historia</button>
            <button className="btn secondary" onClick={handleAddToCalendar}>Añadir al Calendario</button>
          </div>
        </div>
        <div className="scroll-down-indicator"></div>
      </header>
      
      <div className={`player ${isPlaying ? 'playing' : ''}`}>
        <div className="disc" aria-hidden="true"></div>
        <button className="icon-btn" onClick={togglePlayPause} aria-label="Reproducir / Pausar">
          <svg className="icon" viewBox="0 0 24 24" style={{ display: isPlaying ? 'none' : 'block' }}><path d="M8 5v14l11-7z" /></svg>
          <svg className="icon" viewBox="0 0 24 24" style={{ display: isPlaying ? 'block' : 'none' }}><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
        </button>
        <button className="icon-btn" onClick={toggleMute} aria-label="Silenciar / Activar">
          <svg className="icon" viewBox="0 0 24 24" style={{ display: isMuted ? 'none' : 'block' }}><path d="M4 10v4h4l5 4V6l-5 4H4zm12.5 2a4.5 4.5 0 0 0-2.3-3.9v7.8a4.5 4.5 0 0 0 2.3-3.9z" /></svg>
          <svg className="icon" viewBox="0 0 24 24" style={{ display: isMuted ? 'block' : 'none' }}><path d="M16.5 12a4.5 4.5 0 0 1-2.3 3.9V8.1A4.5 4.5 0 0 1 16.5 12zM4 10v4h4l5 4V6l-5 4H4zm12.6 6.2 1.4 1.4L21.6 18l-1.8-1.8L21.6 14l-1.4-1.4-1.8 1.8-1.8-1.8L15.2 14l1.8 1.8-1.8 1.8z" /></svg>
        </button>
      </div>

      <main>
        <section id="historia" className="wrap reveal sectioned">
          <h2 className="title">Nuestra Historia</h2>
          {!isStoryVisible ? (
            <div className="story-cover">
              <button className="story-cover-card" onClick={() => setIsStoryVisible(true)}>
                <span className="story-cover-subtitle">Click para ver la historia de</span>
                <span className="story-cover-title">{couple.name1} y {couple.name2}</span>
              </button>
            </div>
          ) : (
            <>
              <p className="subtitle">Haz clic en una imagen para revivir nuestros recuerdos más queridos.</p>
              <div className="story-grid">
                {storySlides.map((slide, index) => (
                  <article 
                    key={index}
                    className="thumbnail-card reveal"
                    onClick={() => setActiveModalSlide(index)}
                  >
                    <img src={slide.image} alt={slide.alt} loading="lazy" />
                    <div className="thumbnail-overlay">
                      <b>{slide.date}</b>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section id="lugares" className="wrap reveal sectioned">
          <h2 className="title">La Celebración</h2>
          <p className="subtitle">Estos son los lugares donde celebraremos nuestro amor. Toca en cada uno para ver la ubicación en el mapa.</p>
          <div className="grid two">
            {locations.map((loc, index) => (
              <article key={index} className="card reveal">
                <img src={loc.image} alt={`Lugar de la ${loc.type}`} loading="lazy" />
                <div className="body">
                  <h3>{loc.type}</h3>
                  <p className="helper">{loc.name}<br />{loc.details}</p>
                  <div className="center-actions">
                    <a className="btn primary" href={loc.mapLink} target="_blank" rel="noopener noreferrer">Ver Ubicación</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="itinerario" className="wrap reveal sectioned">
          <h2 className="title">Itinerario</h2>
          <p className="subtitle">Planeamos cada momento con mucho cariño para que disfrutes este día con nosotros.</p>
          <ul className="timeline">
            {itinerary.map((item, index) => (
              <li key={index} className="tl-item reveal">
                <div className="tl-time">{item.time}</div>
                <div className="tl-card card"><div className="body"><b>{item.title}</b><div className="place">{item.place}</div></div></div>
              </li>
            ))}
          </ul>
        </section>

        <section id="rsvp" className="wrap reveal sectioned">
          <h2 className="title">Confirmar Asistencia</h2>
          <p className="subtitle">Tu presencia es nuestro mayor regalo. Por favor, confirma tu asistencia antes del 6 de Noviembre de 2025.</p>
          <form className="rsvp-card" onSubmit={handleRsvpSubmit}>
            <div className="field">
              <label htmlFor="guestName"><span>Nombre Completo</span></label>
              <input className="input" id="guestName" type="text" placeholder="Escribe tu nombre y apellido" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="companions"><span>Acompañantes</span></label>
              <select className="select" id="companions" value={companions} onChange={(e) => setCompanions(e.target.value)}>
                <option value="0">Asistiré sin acompañantes</option>
                <option value="1">Asistiré con 1 acompañante</option>
                <option value="2">Asistiré con 2 acompañantes</option>
                <option value="3">Asistiré con 3 acompañantes</option>
                <option value="4">Asistiré con 4 acompañantes</option>
                <option value="5">Asistiré con 5 acompañantes</option>
                <option value="-1">Lamentablemente no podré asistir</option>
              </select>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button type="submit" className="btn primary" id="btnWhatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5a10 10 0 0 0-16.2 11.3L3 21l6.4-1.3A10 10 0 0 0 20.5 3.5Zm-1.1 13a8 8 0 0 1-11.8 1.5l-.3-.2-3 .6.6-2.9-.2-.3A8 8 0 1 1 19.4 16.5ZM8.9 7.9c.2-.5.4-.5.7-.5h.6c.2 0 .5 0 .7.5s.9 1.5.9 1.6.1.4 0 .6-.2.4-.4.6-.4.5-.2.9c.2.4 1 1.6 2.1 2.6 1.5 1.3 2.7 1.7 3.1 1.9s.5 0 .7-.2.8-.9 1-1.2.4-.2.6-.1.6.3 1.4.7 1.2.6 1.4.9.1.9-.2 1.5c-.3.6-1.2 1.1-1.6 1.1s-.9.2-3-.8a13.6 13.6 0 0 1-3.8-2.4 12.2 12.2 0 0 1-2.2-2.6c-.8-1.2-1.1-2.1-1.2-2.4-.2-.4 0-.8.1-1s.5-1.2.6-1.4Z"/></svg>
                Confirmar por WhatsApp
              </button>
              <p className="helper">O si prefieres, puedes llamar al <a href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a>.</p>
            </div>
          </form>
        </section>

        <footer className="signature reveal sectioned">
          <div>Con todo nuestro cariño,</div>
          <em>{couple.name1} & {couple.name2}</em>
        </footer>
      </main>

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
