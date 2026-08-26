import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Product } from '../api/types';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import PromoBanner from '../components/PromoBanner';
import TrustStrip from '../components/TrustStrip';
import SectionDivider from '../components/SectionDivider';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get<{ products: Product[] }>('/api/products', { limit: 6 })
      .then((data) => setFeatured(data.products))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <Seo title="Presentes e Lembrancinhas Personalizadas" description="Canecas, quadros, convites e lembrancinhas personalizadas artesanalmente. Presentes e brindes corporativos sob medida, entrega para todo o Brasil." />
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-stone-200 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-[#8B0000] text-xs font-bold uppercase tracking-widest">Lembrancinhas Exclusivas</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4 leading-tight">
            Especialistas em Encantar Momentos
          </h1>
          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            Caixas personalizadas, papelaria fina e mimos desenvolvidos sob medida para festas, aniversários e eventos corporativos.
          </p>
          <div className="flex gap-4">
            <Link to="/catalogo" className="bg-[#8B0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md">
              Ver Catálogo
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative w-72 h-72 rounded-full bg-rose-100 border-4 border-white shadow-xl overflow-hidden">
            <img
              src="/mascote1.png"
              alt="Mascote do Ateliê da Nay: uma bonequinha de cabelo preto ondulado, tiara de cristal, blusa azul-turquesa e calça bege, acenando sorrindo"
              className="absolute inset-0 w-full h-full object-cover object-top scale-125"
            />
          </div>
        </div>
      </div>

      <PromoBanner />
      <TrustStrip />

      {featured.length > 0 && (
        <div className="mt-16">
          <SectionDivider />
          <div className="text-center mb-8">
            <span className="text-[#8B0000] text-xs font-bold uppercase tracking-widest">Selecionados a dedo</span>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">Destaques</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
