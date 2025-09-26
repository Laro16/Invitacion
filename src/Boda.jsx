import React, { useState, useEffect, useRef } from 'react';
// Importa los datos y los assets desde el nuevo archivo data.js
import { weddingData } from './data.js';

const pad = (num) => String(num).padStart(2, '0');

function Boda() {
  // Desestructura los datos importados
  const { heroImage, backgroundMusic, couple, event, contact, storySlides, locations, itinerary } = weddingData;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [companions, setCompanions] = useState('0');
  
  const audioRef = useRef(null);

  // Countdown Timer Effect
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

  // Image Slider Auto-play Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % storySlides.length), 6000);
    return () => clearInterval(timer);
  }, [storySlides.length]);
  
  // Scroll Reveal Animation Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), 
      // 👇 CAMBIO AQUÍ: La animación empieza cuando el 40% del elemento es visible
      { threshold: 0.4 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Music Autoplay on first user interaction
  useEffect(() => {
    const tryStartBg = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.volume = 0.6;
        audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click', tryStartBg, { once: true });
    return () => document.removeEventListener('click', tryStartBg);
  }, []);

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
        {/* 👇 CAMBIO AQUÍ: Indicador para invitar al usuario a hacer scroll */}
        <div className="scroll-down-indicator"></div>
      </header>
      
      {/* ...el resto del componente JSX sigue igual... */}

    </>
  );
}

export default Boda;
