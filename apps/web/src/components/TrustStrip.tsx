import { Heart, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const ITEMS = [
  { Icon: Heart, label: 'Feito à mão, um a um' },
  { Icon: Sparkles, label: 'Personalização exclusiva' },
  { Icon: Truck, label: 'Envio para todo o Brasil' },
  { Icon: ShieldCheck, label: 'Compra 100% protegida' },
];

export default function TrustStrip() {
  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {ITEMS.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 bg-white rounded-xl border border-stone-200 px-3.5 py-3 sm:px-4 sm:py-3.5"
        >
          <Icon className="w-4 h-4 text-[#8B0000] shrink-0" strokeWidth={1.75} />
          <span className="text-[12px] sm:text-[13px] font-semibold text-stone-700 leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}
