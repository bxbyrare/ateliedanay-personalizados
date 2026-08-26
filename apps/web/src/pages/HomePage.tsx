import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Product } from '../api/types';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import HeroCarousel from '../components/HeroCarousel';
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
    <div>
      <Seo title="Presentes e Lembrancinhas Personalizadas" description="Canecas, quadros, convites e lembrancinhas personalizadas artesanalmente. Presentes e brindes corporativos sob medida, entrega para todo o Brasil." />

      <HeroCarousel />

      <div className="py-12 max-w-7xl mx-auto px-4">
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
    </div>
  );
}
