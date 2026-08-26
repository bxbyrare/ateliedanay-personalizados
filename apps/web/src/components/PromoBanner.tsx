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
  Icon: typeof Gift;
}

const SLIDES: Slide[] = [
  {
    id: 'frete',
    kicker: 'Compras acima de R$ 150',
    title: 'Frete grátis para todo o Brasil',
    copy: 'Sem pegadinha: o frete some no carrinho quando o pedido passa de R$ 150.',
    cta: 'Ver catálogo',
    to: '/catalogo',
    bg: 'from-[#FFF8F0] to-[#FCEEDC]',
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
    bg: 'from-[#FDF3E3] to-[#F7E4BE]',
    Icon: Gift,
  },
];

const AUTOPLAY_MS = 5500;

export default function PromoBanner() {
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
    <div
      className="relative mt-6 rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promoções"
    >
      {/* hand-stitched frame — a nod to the atelier's handmade craft */}
      <div
        className="pointer-events-none absolute inset-2 rounded-xl border-2 border-dashed opacity-40 z-10"
        style={{ borderColor: '#8B0000' }}
        aria-hidden="true"
      />

      <div className={`relative bg-gradient-to-br ${slide.bg} transition-colors duration-700`}>
        {/* faint dot texture for depth */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(#8B0000 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          aria-hidden="true"
        />

        <div key={slide.id} className="relative px-6 py-9 sm:px-12 sm:py-12 flex items-center gap-8 animate-[fadeIn_0.5s_ease]">
          <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-full bg-white/70 border-2 border-white shadow-md items-center justify-center">
            <Icon className="w-7 h-7 text-[#8B0000]" strokeWidth={1.75} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[#8B0000] text-[11px] font-bold uppercase tracking-widest">{slide.kicker}</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1.5 leading-snug">{slide.title}</h3>
            <p className="text-stone-600 text-sm mt-2 max-w-md leading-relaxed hidden sm:block">{slide.copy}</p>
          </div>

          {slide.to.startsWith('http') ? (
            <a
              href={slide.to}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 bg-[#8B0000] hover:bg-[#6b0000] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md whitespace-nowrap"
            >
              {slide.cta}
            </a>
          ) : (
            <Link
              to={slide.to}
              className="shrink-0 bg-[#8B0000] hover:bg-[#6b0000] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md whitespace-nowrap"
            >
              {slide.cta}
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Promoção anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-stone-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Próxima promoção"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-stone-700 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir para promoção ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-[#8B0000]' : 'w-1.5 bg-stone-400/50 hover:bg-stone-400'}`}
          />
        ))}
      </div>
    </div>
  );
}
