import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import type { Product } from '../api/types';
import { productImageUrl } from '../api/client';
import { formatCents } from '../lib/format';

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <Link to={`/produto/${product.slug}`} className="group block">
      <div className="aspect-square bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden">
        {primaryImage ? (
          <img
            src={productImageUrl(primaryImage.url)}
            alt={primaryImage.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
        ) : (
          <ImageOff className="w-10 h-10 text-stone-300" />
        )}
      </div>
      <div className="pt-3.5 text-center">
        {product.category && (
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{product.category.name}</span>
        )}
        <h3 className="font-serif text-base font-bold text-stone-900 mt-1 leading-snug group-hover:text-[#8B0000] transition-colors">{product.name}</h3>
        <span className="text-sm font-semibold text-stone-700 block mt-1">{formatCents(product.priceCents)}</span>
      </div>
    </Link>
  );
}
