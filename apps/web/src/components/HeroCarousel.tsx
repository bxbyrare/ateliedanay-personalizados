import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Gift, PartyPopper, Sparkles, Truck } from 'lucide-react';

interface Slide {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  cta: string;
  to: string;
  bg: string;
  Icon: typeof Gift | null;
}

const SLIDES: Slide[] = [
  {
    id: 'intro',
    kicker: 'Lembrancinhas exclusivas',
    title: 'Especialistas em encantar momentos',
    copy: 'Caixas personalizadas, papelaria fina e mimos desenvolvidos sob medida para festas, aniversários e eventos corporativos.',
    cta: 'Ver catálogo',
    to: '/catalogo',
    bg: 'from-[#FFF8F0] to-[#FCEEDC]',
    Icon: null,
  },
  {
    id: 'frete',
    kicker: 'Compras acima de R$ 150',
    title: 'Frete grátis para todo o Brasil',
    copy: 'Sem pegadinha: o frete some no carrinho quando o pedido passa de R$ 150.',
    cta: 'Ver catálogo',
    to: '/catalogo',
    bg: 'from-[#FDF3E3] to-[#F7E4BE]',
    Icon: Truck,
  },
  {
    id: 'festas',
    kicker: 'Aniversários & chás de bebê',
    title: 'Kits para festas com a sua cara',
    copy: 'Lembrancinhas combinando com o tema, do convite ao mimo de agradecimento.',
    cta: 'Montar meu kit',
    to: '/catalogo',
    bg: 'from-[#FFE9EB] to-[#FFD9DE]',
    Icon: PartyPopper,
  },
  {
    id: 'personalizacao',
    kicker: 'Cada peça é única',
    title: 'Personalização de verdade, não só o nome',
    copy: 'Cores, frases e detalhes escolhidos por você — feito à mão, um de cada vez.',
    cta: 'Ver personalizáveis',
    to: '/catalogo',
    bg: 'from-[#FBEAEA] to-[#F3D9D9]',
    Icon: Sparkles,
  },
  {
    id: 'corporativo',
    kicker: 'Empresas & eventos',
    title: 'Brindes corporativos em volume',
    copy: 'Orçamento sob medida para lotes maiores, com identidade visual da sua marca.',
    cta: 'Falar no WhatsApp',
    to: 'https://wa.me/5521980193792',
    bg: 'from-[#FDEFE0] to-[#F5DCC0]',
    Icon: Gift,
  },
];

const AUTOPLAY_MS = 5500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, prefersReducedMotion]);

  const slide = SLIDES[index];
  const Icon = slide.Icon;

  function go(delta: number) {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Destaques e promoções"
    >
      <div className={`relative bg-gradient-to-br ${slide.bg} transition-colors duration-700 min-h-[440px] sm:min-h-[480px] lg:min-h-[560px] flex items-center`}>
        {/* faint dot texture for depth */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'radial-gradient(#8B0000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center py-12">
          <div key={slide.id} className="max-w-lg animate-[fadeIn_0.6s_ease] z-10">
            {Icon && (
              <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-white shadow-md flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#8B0000]" strokeWidth={1.75} />
              </div>
            )}
            <span className="text-[#8B0000] text-xs font-bold uppercase tracking-widest">{slide.kicker}</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4 leading-[1.1]">
              {slide.title}
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mb-7 leading-relaxed">{slide.copy}</p>
            {slide.to.startsWith('http') ? (
              <a
                href={slide.to}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#8B0000] hover:bg-[#6b0000] text-white px-7 py-3.5 rounded-lg text-sm font-semibold transition-all shadow-md"
              >
                {slide.cta}
              </a>
            ) : (
              <Link
                to={slide.to}
                className="inline-block bg-[#8B0000] hover:bg-[#6b0000] text-white px-7 py-3.5 rounded-lg text-sm font-semibold transition-all shadow-md"
              >
                {slide.cta}
              </Link>
            )}
          </div>

          {/* mascot stays fixed in front of every slide — the banners rotate behind her */}
          <div className="hidden md:flex justify-center md:justify-end">
            <img
              src="/mascote1.png"
              alt="Mascote do Ateliê da Nay: uma bonequinha de cabelo preto ondulado, tiara de cristal, blusa azul-turquesa e calça bege, acenando sorrindo"
              className="w-64 lg:w-80 h-auto object-contain drop-shadow-2xl select-none pointer-events-none"
              style={{ filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.12))' }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-stone-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Próximo"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-stone-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir para ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-[#8B0000]' : 'w-1.5 bg-stone-500/40 hover:bg-stone-500/60'}`}
            />
          ))}
        </div>
      </div>

      {/* hand-stitched seam — a nod to the atelier's handmade craft, where the full-bleed banner meets the page */}
      <div className="border-b-2 border-dashed border-[#8B0000]/25" aria-hidden="true" />
    </section>
  );
}
