import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Plus, RotateCcw } from 'lucide-react';
import { api, productImageUrl } from '../../api/client';
import type { Pagination, Product } from '../../api/types';
import { formatCents } from '../../lib/format';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  function load() {
    api
      .get<{ products: Product[]; pagination: Pagination }>('/api/products/admin/all', { limit: 100 })
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch(() => setProducts([]));
  }

  useEffect(load, []);

  async function toggleActive(product: Product) {
    if (product.isActive) {
      await api.delete(`/api/products/${product.id}`);
    } else {
      await api.patch(`/api/products/${product.id}`, { isActive: true });
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Produtos</h2>
        <Link
          to="/admin/produtos/novo"
          className="flex items-center gap-2 bg-[#8B0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </Link>
      </div>

      {products === null ? (
        <p className="text-xs text-stone-500">Carregando...</p>
      ) : products.length === 0 ? (
        <p className="text-xs text-stone-500">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <div className="hidden md:grid bg-stone-100 px-4 py-3 font-semibold grid-cols-12 gap-2 text-xs">
            <span className="col-span-5">Produto</span>
            <span className="col-span-2">Categoria</span>
            <span className="col-span-2">Preço</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-2 text-right">Ações</span>
          </div>
          {products.map((product) => {
            const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
            return (
              <div key={product.id} className="px-4 py-3 flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-2 md:items-center border-t border-stone-200 text-xs">
                <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                    {image ? (
                      <img src={productImageUrl(image.url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                  <span className="font-semibold text-stone-900 truncate">{product.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:contents">
                  <span className="md:col-span-2 text-stone-500 truncate">{product.category?.name ?? 'Sem categoria'}</span>
                  <span className="md:col-span-2 font-semibold">{formatCents(product.priceCents)}</span>
                  <span className="md:col-span-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </span>
                </div>
                <div className="flex md:col-span-2 md:justify-end gap-3 md:gap-2">
                  <Link to={`/admin/produtos/${product.id}/editar`} className="text-[#8B0000] font-semibold hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => toggleActive(product)} className="text-stone-400 hover:text-stone-700" title={product.isActive ? 'Desativar' : 'Reativar'}>
                    {product.isActive ? <span className="text-rose-600 font-semibold hover:underline">Desativar</span> : <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />Reativar</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {products && pagination && pagination.total > products.length && (
        <p className="text-[11px] text-stone-400 mt-3">Mostrando {products.length} de {pagination.total} produtos.</p>
      )}
    </div>
  );
}
