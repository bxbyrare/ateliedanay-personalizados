import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import CatalogPage from './pages/catalog/CatalogPage';
import ProductPage from './pages/catalog/ProductPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import AccountPage from './pages/account/AccountPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import ExchangesPage from './pages/legal/ExchangesPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <ScrollToTop />
      <Header />

      <main id="conteudo-principal" tabIndex={-1} className="flex-grow outline-none">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/minha-conta" element={<AccountPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/produto/:slug" element={<ProductPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProductsPage />} />
            <Route path="produtos" element={<AdminProductsPage />} />
            <Route path="produtos/novo" element={<AdminProductFormPage />} />
            <Route path="produtos/:id/editar" element={<AdminProductFormPage />} />
            <Route path="categorias" element={<AdminCategoriesPage />} />
          </Route>
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/trocas-e-devolucoes" element={<ExchangesPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
