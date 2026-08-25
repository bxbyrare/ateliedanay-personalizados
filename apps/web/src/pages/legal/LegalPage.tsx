import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import Seo from '../../components/Seo';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export default function LegalPage({
  title,
  icon: Icon,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  icon: LucideIcon;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4">
      <Seo title={title} />

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-[#8B0000] px-8 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-rose-100/80 text-xs">Atualizado em {updatedAt}</p>
        </div>
        <p className="text-stone-600 text-sm leading-relaxed px-8 py-6 text-center max-w-2xl mx-auto">{intro}</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        <aside className="hidden md:block md:col-span-3 sticky top-24">
          <nav aria-label="Seções" className="bg-white rounded-xl border border-stone-200 p-2 shadow-sm">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-[#8B0000] transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="md:col-span-9 space-y-4">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 scroll-mt-24">
              <h2 className="font-serif text-xl font-bold text-stone-900 mb-3 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-rose-50 text-[#8B0000] text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                {section.title}
              </h2>
              <div className="text-sm text-stone-600 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
                {section.body}
              </div>
            </section>
          ))}

          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 mb-1">Ainda com dúvidas?</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fale com a gente pelo{' '}
                <a href="https://wa.me/5521980193792" target="_blank" rel="noreferrer noopener" className="text-[#8B0000] font-semibold hover:underline">
                  WhatsApp (21) 98019-3792
                </a>{' '}
                ou pelo{' '}
                <a href="https://www.instagram.com/ateliedanaypersonalizados" target="_blank" rel="noreferrer noopener" className="text-[#8B0000] font-semibold hover:underline">
                  Instagram @ateliedanaypersonalizados
                </a>
                .
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
