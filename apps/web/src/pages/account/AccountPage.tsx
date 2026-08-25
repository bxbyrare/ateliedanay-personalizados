import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, ImageOff, LogOut, MapPin, Package, Plus, Trash2, User } from 'lucide-react';
import { api, ApiError, productImageUrl } from '../../api/client';
import type { Address, Order, WishlistItem } from '../../api/types';
import { formatCents, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import AddressForm from '../../components/AddressForm';
import Seo from '../../components/Seo';

const TABS = [
  { id: 'painel', label: 'Painel', icon: User },
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'enderecos', label: 'Endereços', icon: MapPin },
  { id: 'detalhes', label: 'Detalhes da Conta', icon: User },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
];

export default function AccountPage() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('aba') || 'painel';

  if (isLoading) return <div className="py-20 text-center text-stone-500 text-sm">Carregando...</div>;
  if (!user) return <Navigate to="/auth?redirect=/minha-conta" replace />;

  function setActiveTab(tab: string) {
    setSearchParams({ aba: tab });
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <Seo title="Minha Conta" noIndex />
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Minha Conta</h1>
        <p className="text-stone-500 text-xs mt-1">Gerencie seus pedidos, dados de entrega e preferências.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        <aside className="md:col-span-3 bg-white rounded-xl border border-stone-200 p-2 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all text-left ${activeTab === tab.id ? 'bg-[#8B0000] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-all text-left mt-2 border-t border-stone-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </aside>

        <main className="md:col-span-9 bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          {activeTab === 'painel' && <PainelTab userName={user.name} setActiveTab={setActiveTab} />}
          {activeTab === 'pedidos' && <PedidosTab />}
          {activeTab === 'enderecos' && <EnderecosTab />}
          {activeTab === 'detalhes' && <DetalhesTab name={user.name} email={user.email} phone={user.phone} cpf={user.cpf} onUpdated={refreshUser} />}
          {activeTab === 'favoritos' && <FavoritosTab />}
        </main>
      </div>
    </div>
  );
}

function PainelTab({ userName, setActiveTab }: { userName: string; setActiveTab: (t: string) => void }) {
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    api.get<{ pagination: { total: number } }>('/api/orders', { limit: 1 }).then((data) => setOrderCount(data.pagination.total)).catch(() => setOrderCount(null));
  }, []);

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4">Olá, {userName}!</h2>
      <p className="text-stone-600 text-xs leading-relaxed mb-6">
        A partir do painel da sua conta, você pode ver seus{' '}
        <button onClick={() => setActiveTab('pedidos')} className="text-[#8B0000] font-semibold underline">pedidos recentes</button>, gerenciar seus{' '}
        <button onClick={() => setActiveTab('enderecos')} className="text-[#8B0000] font-semibold underline">endereços de entrega</button> e editar seus{' '}
        <button onClick={() => setActiveTab('detalhes')} className="text-[#8B0000] font-semibold underline">detalhes de conta</button>.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
          <span className="text-xs text-stone-500 font-medium">Pedidos Realizados</span>
          <span className="font-serif text-2xl font-bold text-stone-800 block mt-1">{orderCount === null ? '—' : orderCount}</span>
        </div>
      </div>
    </div>
  );
}

function PedidosTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.get<{ orders: Order[] }>('/api/orders', { limit: 50 }).then((data) => setOrders(data.orders)).catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4">Meus Pedidos</h2>
      {orders === null ? (
        <p className="text-xs text-stone-500">Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="text-xs text-stone-500">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
          <div className="hidden sm:grid bg-stone-100 px-4 py-3 font-semibold sm:grid-cols-4">
            <span>Pedido</span>
            <span>Data</span>
            <span>Status</span>
            <span>Total</span>
          </div>
          {orders.map((order) => (
            <div key={order.id} className="px-4 py-3 sm:py-4 flex flex-col gap-1.5 sm:grid sm:grid-cols-4 sm:items-center sm:gap-0 border-t border-stone-200 first:border-t-0 sm:first:border-t">
              <span className="font-bold text-[#8B0000]">#{order.orderNumber}</span>
              <span className="text-stone-500">
                <span className="sm:hidden text-stone-400 font-medium">Data: </span>
                {formatDate(order.createdAt)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-max ${ORDER_STATUS_STYLES[order.status] ?? 'bg-stone-100 text-stone-800'}`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="font-bold">
                <span className="sm:hidden text-stone-400 font-medium">Total: </span>
                {formatCents(order.totalCents)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EnderecosTab() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    api.get<{ addresses: Address[] }>('/api/addresses').then((data) => setAddresses(data.addresses)).catch(() => setAddresses([]));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    await api.delete(`/api/addresses/${id}`);
    load();
  }

  function handleSaved() {
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Meus Endereços</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-xs font-semibold text-[#8B0000] hover:underline">
            <Plus className="w-4 h-4" /> Adicionar Endereço
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 max-w-md p-4 border border-stone-200 rounded-lg">
          <AddressForm onSaved={handleSaved} onCancel={() => setShowForm(false)} showCancel />
        </div>
      )}

      {addresses === null ? (
        <p className="text-xs text-stone-500">Carregando...</p>
      ) : addresses.length === 0 ? (
        !showForm && <p className="text-xs text-stone-500">Nenhum endereço cadastrado ainda.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-xl border border-stone-200 max-w-md relative">
              <span className="font-bold text-stone-900 text-xs block mb-1">
                {addr.label} {addr.isDefault && <span className="text-[10px] text-[#8B0000] font-semibold">(Padrão)</span>}
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                {addr.recipientName}<br />
                {addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}<br />
                {addr.neighborhood}, {addr.city} — {addr.state}, CEP {addr.cep}
              </p>
              <button onClick={() => handleDelete(addr.id)} className="absolute top-3 right-3 text-stone-400 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetalhesTab({ name, email, phone, cpf, onUpdated }: { name: string; email: string; phone: string | null; cpf: string | null; onUpdated: () => void }) {
  const [form, setForm] = useState({ name, phone: phone || '', cpf: cpf || '' });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setFieldErrors({});
    setIsSaving(true);
    try {
      await api.patch('/api/users/me', { name: form.name, phone: form.phone, cpf: form.cpf });
      await onUpdated();
      setMessage('Dados atualizados com sucesso.');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setFieldErrors(err.fields);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4">Detalhes da Conta</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md text-xs">
        {message && <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">{message}</p>}
        {error && <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>}
        <div>
          <label className="block text-stone-500 font-medium mb-1">Nome Completo</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded border border-stone-300"
          />
        </div>
        <div>
          <label className="block text-stone-500 font-medium mb-1">E-mail</label>
          <input type="email" value={email} disabled className="w-full px-3 py-2 rounded border border-stone-200 bg-stone-100 text-stone-500" />
        </div>
        <div>
          <label className="block text-stone-500 font-medium mb-1">Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2 rounded border border-stone-300"
          />
        </div>
        <div>
          <label className="block text-stone-500 font-medium mb-1">CPF (opcional)</label>
          <input
            type="text"
            value={form.cpf}
            placeholder="000.000.000-00"
            onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
            className="w-full px-3 py-2 rounded border border-stone-300"
          />
          {fieldErrors.cpf && <p className="text-rose-600 mt-1">{fieldErrors.cpf[0]}</p>}
        </div>
        <button type="submit" disabled={isSaving} className="bg-[#8B0000] disabled:opacity-60 text-white px-4 py-2 rounded font-semibold text-xs">
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}

function FavoritosTab() {
  const [items, setItems] = useState<WishlistItem[] | null>(null);

  function load() {
    api.get<{ items: WishlistItem[] }>('/api/wishlist').then((data) => setItems(data.items)).catch(() => setItems([]));
  }

  useEffect(load, []);

  async function handleRemove(productId: string) {
    await api.delete(`/api/wishlist/${productId}`);
    load();
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4">Favoritos</h2>
      {items === null ? (
        <p className="text-xs text-stone-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-stone-500">Sua lista de mimos salvos está vazia.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const image = item.product.images.find((img) => img.isPrimary) ?? item.product.images[0];
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200">
                <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                  {image ? <img src={productImageUrl(image.url)} alt="" className="w-full h-full object-cover" /> : <ImageOff className="w-5 h-5 text-stone-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-stone-900 block truncate">{item.product.name}</span>
                  <span className="text-xs text-[#8B0000] font-semibold">{formatCents(item.product.priceCents)}</span>
                </div>
                <button onClick={() => handleRemove(item.productId)} className="text-stone-400 hover:text-rose-600 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
