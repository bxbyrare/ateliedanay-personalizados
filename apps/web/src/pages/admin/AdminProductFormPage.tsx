import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageOff, Plus, Star, Trash2, Upload } from 'lucide-react';
import { api, ApiError, productImageUrl, uploadFile } from '../../api/client';
import type { Category, CustomizationFieldType, Product } from '../../api/types';

interface ImageForm {
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface FieldForm {
  label: string;
  fieldType: CustomizationFieldType;
  isRequired: boolean;
  maxLength: number;
  optionsText: string;
  helpText: string;
}

const emptyField: FieldForm = { label: '', fieldType: 'text', isRequired: false, maxLength: 200, optionsText: '', helpText: '' };

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [images, setImages] = useState<ImageForm[]>([]);
  const [fields, setFields] = useState<FieldForm[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<{ categories: Category[] }>('/api/categories/admin/all').then((data) => setCategories(data.categories)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ product: Product }>(`/api/products/admin/${id}`)
      .then((data) => {
        const p = data.product;
        setName(p.name);
        setDescription(p.description || '');
        setPrice((p.priceCents / 100).toFixed(2));
        setCategoryId(p.categoryId || '');
        setIsActive(p.isActive);
        setIsFeatured(p.isFeatured);
        setStockQuantity(p.stockQuantity !== null ? String(p.stockQuantity) : '');
        setSku('');
        setImages(p.images.map((img) => ({ url: img.url, altText: img.altText || '', isPrimary: img.isPrimary })));
        setFields(
          (p.customizationFields || []).map((f) => ({
            label: f.label,
            fieldType: f.fieldType,
            isRequired: f.isRequired,
            maxLength: f.maxLength,
            optionsText: (f.options || []).join(', '),
            helpText: f.helpText || '',
          })),
        );
      })
      .finally(() => setIsLoadingProduct(false));
  }, [id]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setFormError(null);
    try {
      const result = await uploadFile(file, 'image');
      setImages((prev) => [...prev, { url: result.url, altText: '', isPrimary: prev.length === 0 }]);
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) next[0] = { ...next[0], isPrimary: true };
      return next;
    });
  }

  function setPrimaryImage(index: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  function addField() {
    setFields((prev) => [...prev, { ...emptyField }]);
  }

  function updateField(index: number, patch: Partial<FieldForm>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const payload = {
      name,
      description: description || undefined,
      price: Number(price.replace(',', '.')),
      categoryId: categoryId || undefined,
      isActive,
      isFeatured,
      stockQuantity: stockQuantity ? Number(stockQuantity) : undefined,
      sku: sku || undefined,
      images: images.map((img, index) => ({ url: img.url, altText: img.altText || undefined, isPrimary: img.isPrimary, sortOrder: index })),
      customizationFields: fields.map((f, index) => ({
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        maxLength: f.maxLength,
        options: f.fieldType === 'select' ? f.optionsText.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
        helpText: f.helpText || undefined,
        sortOrder: index,
      })),
    };

    setIsSaving(true);
    try {
      if (isEditing) {
        await api.patch(`/api/products/${id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      navigate('/admin/produtos');
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setErrors(err.fields);
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingProduct) return <p className="text-xs text-stone-500">Carregando produto...</p>;

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>

      {formError && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">{formError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Nome do Produto</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
          {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name[0]}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Preço (R$)</label>
            <input type="text" required inputMode="decimal" placeholder="49,90" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
            {errors.price && <p className="text-[11px] text-rose-600 mt-1">{errors.price[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Categoria</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none">
              <option value="">Sem categoria</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">Estoque (opcional)</label>
            <input type="number" min={0} value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">SKU (opcional)</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none" />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-stone-300" />
            Ativo (visível na loja)
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-stone-300" />
            Destaque na home
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wider">Imagens</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200 group">
                <img src={productImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button type="button" onClick={() => setPrimaryImage(index)} title="Definir como principal" className="p-1.5 bg-white rounded-full">
                    <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-amber-400 text-amber-400' : 'text-stone-500'}`} />
                  </button>
                  <button type="button" onClick={() => removeImage(index)} title="Remover" className="p-1.5 bg-white rounded-full">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                </div>
                {img.isPrimary && <span className="absolute bottom-1 left-1 bg-[#8B0000] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Principal</span>}
              </div>
            ))}
            {images.length === 0 && (
              <div className="w-24 h-24 rounded-lg border border-dashed border-stone-300 flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-stone-300" />
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelected} className="hidden" id="product-image-upload" />
          <label htmlFor="product-image-upload" className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-stone-300 cursor-pointer hover:bg-stone-100 transition-all ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
            <Upload className="w-3.5 h-3.5" /> {isUploading ? 'Enviando...' : 'Adicionar Imagem'}
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Campos de Personalização</label>
            <button type="button" onClick={addField} className="flex items-center gap-1 text-[#8B0000] text-xs font-semibold hover:underline">
              <Plus className="w-3.5 h-3.5" /> Adicionar Campo
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="p-3 border border-stone-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Rótulo (ex: Nome para gravação)"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="px-2 py-1.5 rounded border border-stone-300 text-xs"
                  />
                  <select
                    value={field.fieldType}
                    onChange={(e) => updateField(index, { fieldType: e.target.value as CustomizationFieldType })}
                    className="px-2 py-1.5 rounded border border-stone-300 text-xs"
                  >
                    <option value="text">Texto curto</option>
                    <option value="textarea">Texto longo</option>
                    <option value="select">Lista de opções</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                  </select>
                </div>
                {field.fieldType === 'select' && (
                  <input
                    type="text"
                    placeholder="Opções separadas por vírgula"
                    value={field.optionsText}
                    onChange={(e) => updateField(index, { optionsText: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-stone-300 text-xs"
                  />
                )}
                <input
                  type="text"
                  placeholder="Texto de ajuda (opcional)"
                  value={field.helpText}
                  onChange={(e) => updateField(index, { helpText: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-stone-300 text-xs"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-stone-600">
                    <input type="checkbox" checked={field.isRequired} onChange={(e) => updateField(index, { isRequired: e.target.checked })} className="rounded border-stone-300" />
                    Obrigatório
                  </label>
                  <button type="button" onClick={() => removeField(index)} className="text-rose-600 text-[11px] font-semibold hover:underline">Remover</button>
                </div>
              </div>
            ))}
            {fields.length === 0 && <p className="text-[11px] text-stone-400">Nenhum campo de personalização — o cliente compra o produto sem informar dados extras.</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSaving} className="bg-[#8B0000] hover:bg-[#6b0000] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
          <button type="button" onClick={() => navigate('/admin/produtos')} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-stone-600 hover:bg-stone-100">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
