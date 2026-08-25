import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, ApiError } from '../api/client';
import type { Address, BrazilianState } from '../api/types';

export const BRAZILIAN_STATES: BrazilianState[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const NICKNAME_SUGGESTIONS = ['Casa', 'Trabalho'];

const emptyAddressForm = {
  label: '',
  recipientName: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: 'RJ' as BrazilianState,
  phone: '',
  isDefault: false,
};

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

export default function AddressForm({
  onSaved,
  onCancel,
  showCancel,
}: {
  onSaved: (address: Address) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}) {
  const [form, setForm] = useState(emptyAddressForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const lastLookedUpCep = useRef<string | null>(null);

  const cepDigits = form.cep.replace(/\D/g, '');

  // Auto-fills street/neighborhood/city/UF from the Brazilian postal service's public
  // CEP lookup as soon as a full 8-digit CEP is typed — avoids the customer retyping
  // an address we can already resolve, and catches an invalid/nonexistent CEP early
  // instead of only at checkout.
  useEffect(() => {
    if (cepDigits.length !== 8 || lastLookedUpCep.current === cepDigits) return;

    let cancelled = false;
    lastLookedUpCep.current = cepDigits;
    setCepError(null);
    setIsLookingUpCep(true);

    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
      .then((res) => res.json())
      .then((data: ViaCepResponse) => {
        if (cancelled) return;
        if (data.erro) {
          setCepError('CEP não encontrado');
          return;
        }
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: (data.uf as BrazilianState) || f.state,
        }));
        numberInputRef.current?.focus();
      })
      .catch(() => {
        if (!cancelled) setCepError('Não foi possível consultar o CEP agora — preencha o endereço manualmente');
      })
      .finally(() => {
        if (!cancelled) setIsLookingUpCep(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cepDigits]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setIsSaving(true);
    try {
      const data = await api.post<{ address: Address }>('/api/addresses', form);
      onSaved(data.address);
      setForm(emptyAddressForm);
      lastLookedUpCep.current = null;
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setErrors(err.fields);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {formError && <p className="text-[11px] text-rose-600">{formError}</p>}

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Nome do endereço</label>
        <input
          type="text"
          value={form.label}
          placeholder="Casa, Trabalho..."
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
        />
        <div className="flex gap-2 mt-1.5">
          {NICKNAME_SUGGESTIONS.map((nickname) => (
            <button
              key={nickname}
              type="button"
              onClick={() => setForm((f) => ({ ...f, label: nickname }))}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${form.label === nickname ? 'bg-[#8B0000] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {nickname}
            </button>
          ))}
        </div>
        {errors.label && <p className="text-[11px] text-rose-600 mt-1">{errors.label[0]}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Destinatário" value={form.recipientName} onChange={(v) => setForm((f) => ({ ...f, recipientName: v }))} error={errors.recipientName} />
        <Field label="Telefone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} error={errors.phone} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">CEP</label>
        <div className="relative max-w-[200px]">
          <input
            type="text"
            value={form.cep}
            placeholder="00000-000"
            maxLength={9}
            onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
          />
          {isLookingUpCep && <Loader2 className="w-4 h-4 text-stone-400 animate-spin absolute right-3 top-2.5" aria-hidden="true" />}
        </div>
        {cepError && <p className="text-[11px] text-rose-600 mt-1">{cepError}</p>}
        {errors.cep && <p className="text-[11px] text-rose-600 mt-1">{errors.cep[0]}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Field label="Rua" value={form.street} onChange={(v) => setForm((f) => ({ ...f, street: v }))} error={errors.street} />
        </div>
        <Field label="Número" value={form.number} onChange={(v) => setForm((f) => ({ ...f, number: v }))} error={errors.number} inputRef={numberInputRef} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Complemento" value={form.complement} onChange={(v) => setForm((f) => ({ ...f, complement: v }))} error={errors.complement} />
        <Field label="Bairro" value={form.neighborhood} onChange={(v) => setForm((f) => ({ ...f, neighborhood: v }))} error={errors.neighborhood} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Field label="Cidade" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} error={errors.city} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">UF</label>
          <select
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value as BrazilianState }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
          >
            {BRAZILIAN_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-stone-600">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="rounded border-stone-300" />
        Usar como endereço padrão
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={isSaving} className="bg-[#8B0000] hover:bg-[#6b0000] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-xs font-semibold">
          {isSaving ? 'Salvando...' : 'Salvar Endereço'}
        </button>
        {showCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label, value, onChange, error, placeholder, inputRef,
}: { label: string; value: string; onChange: (v: string) => void; error?: string[]; placeholder?: string; inputRef?: React.RefObject<HTMLInputElement> }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
      />
      {error && <p className="text-[11px] text-rose-600 mt-1">{error[0]}</p>}
    </div>
  );
}
