import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import type { Product } from '../api/types';
import { productImageUrl } from '../api/client';
import { formatCents } from '../lib/format';

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="aspect-square bg-stone-100 flex items-center justify-center overflow-hidden">
        {primaryImage ? (
          <img
            src={productImageUrl(primaryImage.url)}
            alt={primaryImage.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <ImageOff className="w-10 h-10 text-stone-300" />
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{product.category.name}</span>
        )}
        <h3 className="font-serif text-lg font-bold text-stone-900 mt-1 leading-snug">{product.name}</h3>
        <span className="font-serif text-lg font-bold text-[#8B0000] block mt-2">{formatCents(product.priceCents)}</span>
      </div>
    </Link>
  );
}
