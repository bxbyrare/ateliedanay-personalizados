import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, ShieldCheck } from 'lucide-react';

const WHATSAPP_NUMBER = '5521980193792';
const WHATSAPP_DISPLAY = '(21) 98019-3792';
const INSTAGRAM_HANDLE = 'ateliedanaypersonalizados';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 border-t border-stone-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10">
        <div>
          <h3 className="font-serif text-xl font-bold text-white mb-3">Ateliê da Nay</h3>
          <p className="text-stone-400 text-xs leading-relaxed">
            Especialistas em brindes, presentes corporativos e mimos personalizados artesanais.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Atendimento</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                WhatsApp: {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" aria-hidden="true" />
                @{INSTAGRAM_HANDLE}
              </a>
            </li>
            <li>Região dos Lagos / Rio de Janeiro</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Institucional</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><Link to="/catalogo" className="hover:text-white transition-colors">Catálogo</Link></li>
            <li><Link to="/termos" className="hover:text-white transition-colors">Termos e Condições</Link></li>
            <li><Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
            <li><Link to="/trocas-e-devolucoes" className="hover:text-white transition-colors">Trocas e Devoluções</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Segurança</h4>
          <p className="text-xs text-stone-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            Cadastro 100% Protegido
          </p>
        </div>
      </div>

      <div className="border-t border-stone-800 py-4 px-4 sm:px-6 lg:px-8">
        <p className="max-w-7xl mx-auto text-[11px] text-stone-500 text-center">
          © {year} Ateliê da Nay Personalizados. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
