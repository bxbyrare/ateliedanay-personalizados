import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { api } from '../../api/client';
import type { Category, Pagination, Product } from '../../api/types';
import ProductCard from '../../components/ProductCard';
import Seo from '../../components/Seo';

type SortOption = 'destaque' | 'preco-asc' | 'preco-desc' | 'nome-asc' | 'nome-desc';

const SORT_LABELS: Record<SortOption, string> = {
  destaque: 'Destaque',
  'preco-asc': 'Preço: menor ao maior',
  'preco-desc': 'Preço: maior ao menor',
  'nome-asc': 'Nome: A-Z',
  'nome-desc': 'Nome: Z-A',
};

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case 'preco-asc':
      return list.sort((a, b) => a.priceCents - b.priceCents);
    case 'preco-desc':
      return list.sort((a, b) => b.priceCents - a.priceCents);
    case 'nome-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    case 'nome-desc':
      return list.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
    case 'destaque':
    default:
      return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('categoria') || undefined;
  const search = searchParams.get('busca') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [sort, setSort] = useState<SortOption>('destaque');

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

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
    <div className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Seo title="Catálogo" description="Veja todos os produtos personalizados do Ateliê da Nay: canecas, quadros, convites e lembrancinhas." />

      <div className="text-center mb-10">
        <span className="text-[#8B0000] text-xs font-bold uppercase tracking-widest">Tudo do Ateliê</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1.5">Catálogo de Lembrancinhas</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        {categories.length > 0 && (
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Categorias">
            <button
              onClick={() => selectCategory(undefined)}
              className={`pb-1 font-semibold transition-colors border-b-2 ${!categorySlug ? 'text-[#8B0000] border-[#8B0000]' : 'text-stone-500 border-transparent hover:text-stone-800'}`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.slug)}
                className={`pb-1 font-semibold transition-colors border-b-2 ${categorySlug === cat.slug ? 'text-[#8B0000] border-[#8B0000]' : 'text-stone-500 border-transparent hover:text-stone-800'}`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        )}

        <div className="flex gap-3 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label="Ordenar produtos"
              className="appearance-none pl-4 pr-9 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-none cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>{SORT_LABELS[key]}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-stone-500 text-sm">Carregando produtos...</p>
      ) : sortedProducts.length === 0 ? (
        <p className="text-stone-500 text-sm">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {sortedProducts.map((product) => (
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
