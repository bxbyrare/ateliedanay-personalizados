import React, { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Heart, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { ApiError } from '../../api/client';
import { useAuth } from '../../state/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import Seo from '../../components/Seo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/minha-conta';

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setFormError(null);
      setIsGoogleSubmitting(true);
      try {
        await loginWithGoogle(credential);
        navigate(redirectTo);
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : 'Não foi possível entrar com Google. Tente novamente.');
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    [loginWithGoogle, navigate, redirectTo],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login({ email, password, rememberMe });
      } else {
        await register({ name, email, password });
      }
      navigate(redirectTo);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setFieldErrors(err.fields);
      } else {
        console.error('Auth request failed', err);
        setFormError('Não foi possível conectar ao servidor. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4">
      <Seo title="Entrar ou Criar Conta" description="Acesse sua conta ou cadastre-se no Ateliê da Nay para acompanhar seus pedidos." />
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden grid md:grid-cols-12">
        <div className="md:col-span-7 p-8 sm:p-12">
          <div className="flex gap-4 border-b border-stone-200 mb-8 pb-4">
            <button
              onClick={() => { setIsLogin(true); setFormError(null); setFieldErrors({}); }}
              className={`font-serif text-2xl font-bold pb-2 transition-all ${isLogin ? 'text-[#8B0000] border-b-2 border-[#8B0000]' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setFormError(null); setFieldErrors({}); }}
              className={`font-serif text-2xl font-bold pb-2 transition-all ${!isLogin ? 'text-[#8B0000] border-b-2 border-[#8B0000]' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Cadastre-se
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">{formError}</div>
          )}

          {Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID) && (
            <>
              <div className="mb-5">
                <GoogleSignInButton onCredential={handleGoogleCredential} />
                {isGoogleSubmitting && <p className="text-center text-[11px] text-stone-400 mt-2">Entrando...</p>}
              </div>

              <div className="relative mb-5 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
                <span className="relative bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider">ou com e-mail</span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 pl-10 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
                {fieldErrors.name && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name[0]}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
              {fieldErrors.email && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
              {!isLogin && <p className="text-[11px] text-stone-400 mt-1">Mínimo 8 caracteres, com letras e números.</p>}
              {fieldErrors.password && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password[0]}</p>}
            </div>

            {isLogin && (
              <label className="flex items-center gap-2 text-xs text-stone-600">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-stone-300" />
                Mantenha-me conectado
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8B0000] hover:bg-[#6b0000] disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md mt-6"
            >
              {isSubmitting ? 'Aguarde...' : isLogin ? 'Acessar Conta' : 'Criar Minha Conta'}
            </button>
          </form>
        </div>

        <div className="md:col-span-5 bg-rose-50/50 p-8 sm:p-12 border-t md:border-t-0 md:border-l border-stone-200 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#8B0000] mb-4">Seja Bem-vindo ao Ateliê da Nay</h3>
            <p className="text-stone-600 text-xs leading-relaxed mb-6">
              O cadastro é obrigatório para concluir seus pedidos e acompanhar entregas personalizadas em tempo real.
            </p>
            <ul className="space-y-3 text-xs text-stone-700">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#8B0000]" /> Histórico completo de pedidos</li>
              <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#8B0000]" /> Dados salvos com segurança</li>
              <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-[#8B0000]" /> Lista de Favoritos salva</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
