import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import type { Address, Order } from '../../api/types';
import { formatCents } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useCart } from '../../state/CartContext';
import AddressForm from '../../components/AddressForm';
import Seo from '../../components/Seo';

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { lines, totalCents, refresh } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    api
      .get<{ addresses: Address[] }>('/api/addresses')
      .then((data) => {
        setAddresses(data.addresses);
        const preferred = data.addresses.find((a) => a.isDefault) ?? data.addresses[0];
        if (preferred) setSelectedAddressId(preferred.id);
        else setShowNewAddress(true);
      })
      .catch(() => setShowNewAddress(true));
  }, []);

  if (authLoading) return <div className="py-20 text-center text-stone-500 text-sm">Carregando...</div>;
  if (!user) return <Navigate to="/auth?redirect=/checkout" replace />;
  if (lines.length === 0 && !placedOrder) return <Navigate to="/carrinho" replace />;

  function handleAddressSaved(address: Address) {
    setAddresses((prev) => [address, ...prev]);
    setSelectedAddressId(address.id);
    setShowNewAddress(false);
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setFormError('Selecione um endereço de entrega.');
      return;
    }
    setFormError(null);
    setIsPlacing(true);
    try {
      const data = await api.post<{ order: Order }>('/api/orders', { addressId: selectedAddressId, notes: notes || undefined });
      setPlacedOrder(data.order);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
    } finally {
      setIsPlacing(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Pedido Realizado!</h1>
        <p className="text-stone-500 text-sm mb-1">Pedido <span className="font-semibold text-[#8B0000]">#{placedOrder.orderNumber}</span></p>
        <p className="text-stone-500 text-sm mb-6">Total: {formatCents(placedOrder.totalCents)}</p>
        <button
          onClick={() => navigate('/minha-conta?aba=pedidos')}
          className="bg-[#8B0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
        >
          Ver Meus Pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Seo title="Finalizar Pedido" noIndex />
      <h1 className="font-serif text-3xl font-bold text-stone-900 mb-8">Finalizar Pedido</h1>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Endereço de Entrega</h2>

            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#8B0000] bg-rose-50/40' : 'border-stone-200'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-stone-900 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#8B0000]" /> {addr.label}</span>
                      <p className="text-stone-600 mt-1 leading-relaxed">
                        {addr.recipientName} — {addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}<br />
                        {addr.neighborhood}, {addr.city} — {addr.state}, CEP {addr.cep}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showNewAddress ? (
              <button
                onClick={() => setShowNewAddress(true)}
                className="flex items-center gap-2 text-xs font-semibold text-[#8B0000] hover:underline"
              >
                <Plus className="w-4 h-4" /> Adicionar novo endereço
              </button>
            ) : (
              <div className="mt-2 border-t border-stone-100 pt-4">
                <AddressForm onSaved={handleAddressSaved} onCancel={() => setShowNewAddress(false)} showCancel={addresses.length > 0} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-3">Observações (opcional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Alguma instrução especial para seu pedido?"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Resumo do Pedido</h2>
          <div className="space-y-2 mb-4 text-xs text-stone-600 max-h-64 overflow-y-auto">
            {lines.map((line) => (
              <div key={line.id} className="flex justify-between">
                <span className="truncate pr-2">{line.quantity}x {line.product.name}</span>
                <span className="font-semibold text-stone-900 shrink-0">{formatCents(line.priceCents * line.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-3 flex justify-between text-sm mb-4">
            <span className="font-semibold text-stone-900">Total</span>
            <span className="font-serif font-bold text-[#8B0000] text-lg">{formatCents(totalCents)}</span>
          </div>

          {formError && <p className="text-[11px] text-rose-600 mb-3">{formError}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing || !selectedAddressId}
            className="w-full bg-[#8B0000] hover:bg-[#6b0000] disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            {isPlacing ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
          <p className="text-[10px] text-stone-400 text-center mt-3">Pagamento será combinado após a confirmação do pedido.</p>
        </div>
      </div>
    </div>
  );
}
