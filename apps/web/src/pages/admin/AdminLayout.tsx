import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, Tag } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import Seo from '../../components/Seo';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="py-20 text-center text-stone-500 text-sm">Carregando...</div>;
  if (!user) return <Navigate to="/auth?redirect=/admin/produtos" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all text-left ${
      isActive ? 'bg-[#8B0000] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
    }`;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <Seo title="Painel Administrativo" noIndex />
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Painel Administrativo</h1>
        <p className="text-stone-500 text-xs mt-1">Gerencie o catálogo de produtos e categorias da loja.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        <aside className="md:col-span-3 bg-white rounded-xl border border-stone-200 p-2 shadow-sm">
          <NavLink to="/admin/produtos" className={linkClass} end>
            <LayoutGrid className="w-4 h-4" />
            <span>Produtos</span>
          </NavLink>
          <NavLink to="/admin/categorias" className={linkClass}>
            <Tag className="w-4 h-4" />
            <span>Categorias</span>
          </NavLink>
        </aside>

        <main className="md:col-span-9 bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
