import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import type { Category } from '../../api/types';

const emptyForm = { name: '', description: '', imageUrl: '', sortOrder: 0 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function load() {
    api.get<{ categories: Category[] }>('/api/categories/admin/all').then((data) => setCategories(data.categories)).catch(() => setCategories([]));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError(null);
    setShowForm(true);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '', sortOrder: cat.sortOrder });
    setErrors({});
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setIsSaving(true);
    try {
      if (editingId) {
        await api.patch(`/api/categories/${editingId}`, form);
      } else {
        await api.post('/api/categories', form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setErrors(err.fields);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    await api.patch(`/api/categories/${cat.id}`, { isActive: !cat.isActive });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Categorias</h2>
        {!showForm && (
          <button onClick={startCreate} className="flex items-center gap-2 bg-[#8B0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mb-8 p-4 border border-stone-200 rounded-lg">
          {formError && <p className="text-[11px] text-rose-600">{formError}</p>}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Nome</label>
            <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Descrição (opcional)</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="bg-[#8B0000] hover:bg-[#6b0000] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-xs font-semibold">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {categories === null ? (
        <p className="text-xs text-stone-500">Carregando...</p>
      ) : categories.length === 0 ? (
        <p className="text-xs text-stone-500">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <div className="hidden md:grid bg-stone-100 px-4 py-3 font-semibold grid-cols-12 gap-2 text-xs">
            <span className="col-span-6">Nome</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-4 text-right">Ações</span>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="px-4 py-3 flex items-center justify-between gap-3 md:grid md:grid-cols-12 md:gap-2 border-t border-stone-200 text-xs">
              <span className="font-semibold text-stone-900 md:col-span-6">{cat.name}</span>
              <span className="md:col-span-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  {cat.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </span>
              <div className="flex justify-end gap-3 md:col-span-4">
                <button onClick={() => startEdit(cat)} className="text-[#8B0000] font-semibold hover:underline">Editar</button>
                <button onClick={() => toggleActive(cat)} className="text-stone-500 font-semibold hover:underline">
                  {cat.isActive ? 'Desativar' : 'Reativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
