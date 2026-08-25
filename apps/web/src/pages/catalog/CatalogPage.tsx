import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../../api/client';
import type { Category, Pagination, Product } from '../../api/types';
import ProductCard from '../../components/ProductCard';
import Seo from '../../components/Seo';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('categoria') || undefined;
  const search = searchParams.get('busca') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/api/categories')
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<{ products: Product[]; pagination: Pagination }>('/api/products', {
        categorySlug,
        search: search || undefined,
        limit: 24,
      })
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch(() => {
        setProducts([]);
        setPagination(null);
      })
      .finally(() => setIsLoading(false));
  }, [categorySlug, search]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set('busca', searchInput.trim());
    else next.delete('busca');
    setSearchParams(next);
  }

  function selectCategory(slug: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('categoria', slug);
    else next.delete('categoria');
    setSearchParams(next);
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <Seo title="Catálogo" description="Veja todos os produtos personalizados do Ateliê da Nay: canecas, quadros, convites e lembrancinhas." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Catálogo de Lembrancinhas</h1>
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </form>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => selectCategory(undefined)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${!categorySlug ? 'bg-[#8B0000] text-white' : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'}`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${categorySlug === cat.slug ? 'bg-[#8B0000] text-white' : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-stone-500 text-sm">Carregando produtos...</p>
      ) : products.length === 0 ? (
        <p className="text-stone-500 text-sm">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <p className="text-center text-xs text-stone-400 mt-8">
          Página {pagination.page} de {pagination.totalPages} — {pagination.total} produtos
        </p>
      )}
    </div>
  );
}
