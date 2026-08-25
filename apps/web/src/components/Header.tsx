import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useCart } from '../state/CartContext';

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/minha-conta', label: 'Minha Conta' },
];

export default function Header() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const links = user?.role === 'admin' ? [...NAV_LINKS, { to: '/admin/produtos', label: 'Painel Admin' }] : NAV_LINKS;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-[#8B0000] focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-semibold"
      >
        Pular para o conteúdo principal
      </a>

      <div className="bg-[#8B0000] text-stone-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Ateliê da Nay — Mimos e Lembrancinhas Personalizadas para Momentos Especiais</span>
        <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      </div>

      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 min-w-0" onClick={closeMenu}>
            <img
              src="/mascote-face.png"
              alt=""
              className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0 border border-stone-200"
            />
            <div className="min-w-0">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#8B0000] tracking-tight block truncate">Ateliê da Nay</span>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest hidden sm:block -mt-1">Personalizados com Amor</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" aria-label="Navegação principal">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-[#8B0000] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/minha-conta"
              className="hidden sm:flex items-center gap-2 text-stone-700 hover:text-[#8B0000] transition-colors text-sm font-medium"
            >
              <User className="w-5 h-5 text-[#8B0000]" aria-hidden="true" />
              <span>{user ? user.name.split(' ')[0] : 'Entrar'}</span>
            </Link>
            <Link
              to="/carrinho"
              className="relative p-2 text-stone-700 hover:text-[#8B0000] transition-colors"
              aria-label={`Carrinho de compras${itemCount > 0 ? `, ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : ''}`}
            >
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#8B0000] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold" aria-hidden="true">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden p-2 text-stone-700 hover:text-[#8B0000] transition-colors"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav id="mobile-nav-menu" className="md:hidden border-t border-stone-200 bg-white" aria-label="Navegação principal">
            <ul className="max-w-7xl mx-auto px-4 py-2">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={closeMenu}
                    className={`block py-3 text-sm font-medium border-b border-stone-100 last:border-0 ${location.pathname === link.to ? 'text-[#8B0000]' : 'text-stone-700'}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/minha-conta" onClick={closeMenu} className="flex items-center gap-2 py-3 text-sm font-medium text-stone-700 sm:hidden">
                  <User className="w-4 h-4 text-[#8B0000]" aria-hidden="true" />
                  {user ? user.name.split(' ')[0] : 'Entrar'}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
