import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { productImageUrl } from '../../api/client';
import { formatCents } from '../../lib/format';
import { useCart } from '../../state/CartContext';
import { useAuth } from '../../state/AuthContext';
import Seo from '../../components/Seo';

export default function CartPage() {
  const { lines, isLoading, totalCents, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function goToCheckout() {
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  }

  if (isLoading) {
    return <div className="py-20 text-center text-stone-500 text-sm">Carregando carrinho...</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Seu carrinho está vazio</h1>
        <p className="text-stone-500 text-sm mb-6">Explore nosso catálogo e encontre o mimo perfeito.</p>
        <Link to="/catalogo" className="bg-[#8B0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Seo title="Carrinho" noIndex />
      <h1 className="font-serif text-3xl font-bold text-stone-900 mb-8">Seu Carrinho</h1>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          {lines.map((line) => {
            const image = line.product.images.find((img) => img.isPrimary) ?? line.product.images[0];
            return (
              <div key={line.id} className="bg-white rounded-xl border border-stone-200 p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                  {image ? (
                    <img src={productImageUrl(image.url)} alt={line.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="w-6 h-6 text-stone-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/produto/${line.product.slug}`} className="font-serif font-bold text-stone-900 hover:text-[#8B0000] transition-colors truncate block">
                    {line.product.name}
                  </Link>
                  {Object.entries(line.customizationValues).length > 0 && (
                    <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                      {Object.values(line.customizationValues).filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <span className="text-[#8B0000] font-semibold text-sm block mt-1">{formatCents(line.priceCents)}</span>
                </div>
                <div className="flex items-center border border-stone-300 rounded-lg shrink-0">
                  <button
                    onClick={() => updateQuantity(line.id, Math.max(1, line.quantity - 1))}
                    className="p-2 hover:bg-stone-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                  <button
                    onClick={() => updateQuantity(line.id, Math.min(20, line.quantity + 1))}
                    className="p-2 hover:bg-stone-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => removeItem(line.id)} className="p-2 text-stone-400 hover:text-rose-600 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Resumo</h2>
          <div className="flex justify-between text-sm text-stone-600 mb-2">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatCents(totalCents)}</span>
          </div>
          <p className="text-[11px] text-stone-400 mb-4">Frete calculado na finalização do pedido.</p>
          <button
            onClick={goToCheckout}
            className="w-full bg-[#8B0000] hover:bg-[#6b0000] text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            Finalizar Pedido
          </button>
          {!user && (
            <p className="text-[11px] text-stone-400 text-center mt-3">É necessário criar uma conta para finalizar a compra.</p>
          )}
        </div>
      </div>
    </div>
  );
}
