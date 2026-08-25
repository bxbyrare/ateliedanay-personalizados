import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ImageOff, Minus, Plus } from 'lucide-react';
import { api, ApiError, productImageUrl } from '../../api/client';
import type { Product, WishlistItem } from '../../api/types';
import { formatCents } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useCart } from '../../state/CartContext';
import Seo from '../../components/Seo';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setProduct(null);
    setNotFound(false);
    setActiveImage(0);
    setQuantity(1);
    setCustomValues({});
    api
      .get<{ product: Product }>(`/api/products/${slug}`)
      .then((data) => {
        setProduct(data.product);
        if (user) {
          api
            .get<{ items: WishlistItem[] }>('/api/wishlist')
            .then((wl) => setIsFavorite(wl.items.some((item) => item.productId === data.product.id)))
            .catch(() => setIsFavorite(false));
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [slug, user]);

  async function toggleFavorite() {
    if (!product) return;
    if (!user) {
      navigate(`/auth?redirect=/produto/${product.slug}`);
      return;
    }
    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/api/wishlist/${product.id}`);
        setIsFavorite(false);
      } else {
        await api.post('/api/wishlist', { productId: product.id });
        setIsFavorite(true);
      }
    } catch {
      // Best-effort — leave the toggle state unchanged if the request fails.
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  if (notFound) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Produto não encontrado</h1>
        <Link to="/catalogo" className="text-[#8B0000] font-semibold text-sm underline">Voltar ao catálogo</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="py-20 text-center text-stone-500 text-sm">Carregando...</div>;
  }

  const fields = product.customizationFields ?? [];
  const image = product.images[activeImage] ?? product.images[0];

  function setValue(fieldId: string, value: string) {
    setCustomValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleAddToCart() {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.isRequired && !customValues[field.id]?.trim()) {
        nextErrors[field.id] = 'Campo obrigatório';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsAdding(true);
    try {
      await addItem(product!, quantity, customValues);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setIsAdding(false);
    }
  }

  const plainDescription = product.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <Seo title={product.name} description={plainDescription} />
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center border border-stone-200">
            {image ? (
              <img src={productImageUrl(image.url)} alt={image.altText || product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="w-16 h-16 text-stone-300" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${idx === activeImage ? 'border-[#8B0000]' : 'border-stone-200'}`}
                >
                  <img src={productImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.category && (
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{product.category.name}</span>
              )}
              <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">{product.name}</h1>
            </div>
            <button
              onClick={toggleFavorite}
              disabled={isTogglingFavorite}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className="shrink-0 p-2.5 rounded-full border border-stone-200 hover:border-[#8B0000] transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#8B0000] text-[#8B0000]' : 'text-stone-400'}`} />
            </button>
          </div>
          <span className="font-serif text-2xl font-bold text-[#8B0000] block mt-3">{formatCents(product.priceCents)}</span>

          {product.description && (
            <div
              className="text-sm text-stone-600 leading-relaxed mt-4 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {fields.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">Personalize</h3>
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                    {field.label} {field.isRequired && <span className="text-[#8B0000]">*</span>}
                  </label>
                  {field.fieldType === 'textarea' ? (
                    <textarea
                      maxLength={field.maxLength}
                      value={customValues[field.id] || ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                      rows={3}
                    />
                  ) : field.fieldType === 'select' ? (
                    <select
                      value={customValues[field.id] || ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                      maxLength={field.fieldType === 'text' ? field.maxLength : undefined}
                      value={customValues[field.id] || ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                    />
                  )}
                  {field.helpText && <p className="text-[11px] text-stone-400 mt-1">{field.helpText}</p>}
                  {errors[field.id] && <p className="text-[11px] text-rose-600 mt-1">{errors[field.id]}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-stone-300 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-stone-100">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(20, q + 1))} className="p-2.5 hover:bg-stone-100">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 bg-[#8B0000] hover:bg-[#6b0000] disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
            >
              {isAdding ? 'Adicionando...' : added ? 'Adicionado ✓' : 'Adicionar ao Carrinho'}
            </button>
          </div>

          {added && (
            <button onClick={() => navigate('/carrinho')} className="text-xs text-[#8B0000] font-semibold underline mt-3">
              Ver carrinho
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
