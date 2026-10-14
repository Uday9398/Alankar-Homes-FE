import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Star, X } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import {
  adminFetchProduct,
  createProduct,
  fetchCategories,
  updateProduct,
  uploadImages,
} from '../../features/shop/shopService';
import type { ProductInput } from '../../features/shop/shopTypes';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';

const MAX_IMAGES = 8;

// Numbers are kept as text while typing so the fields can be empty
interface FormState {
  name: string;
  description: string;
  price: string;
  mrp: string;
  stock: string;
  images: string[];
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  mrp: '',
  stock: '1',
  images: [],
  categoryId: '',
  isFeatured: false,
  isActive: true,
};

const labelClass = 'text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const categories = useAsync(fetchCategories, []);
  const existing = useAsync(() => (id ? adminFetchProduct(id) : Promise.resolve(null)), [id]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const p = existing.data;
    if (p) {
      setForm({
        name: p.name,
        description: p.description || '',
        price: String(p.price),
        mrp: p.mrp ? String(p.mrp) : '',
        stock: String(p.stock),
        images: p.images,
        categoryId: p.categoryId ? String(p.categoryId) : '',
        isFeatured: p.isFeatured,
        isActive: p.isActive,
      });
    }
  }, [existing.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const room = MAX_IMAGES - form.images.length;
    const files = Array.from(fileList).slice(0, room);
    if (files.length === 0) {
      setErrors((prev) => ({ ...prev, images: `You can add up to ${MAX_IMAGES} photos` }));
      return;
    }

    setIsUploading(true);
    setErrors((prev) => ({ ...prev, images: '' }));
    try {
      const urls = await uploadImages(files);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, images: getErrorMessage(err) }));
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const makeCover = (index: number) => {
    setForm((prev) => {
      const images = [...prev.images];
      const [picked] = images.splice(index, 1);
      return { ...prev, images: [picked, ...images] };
    });
  };

  const validate = (): ProductInput | null => {
    const newErrors: Record<string, string> = {};
    const price = Number(form.price);
    const mrp = form.mrp ? Number(form.mrp) : null;
    const stock = Number(form.stock);

    if (form.name.trim().length < 2) newErrors.name = 'Please enter a product name';
    if (!form.price || !(price > 0)) newErrors.price = 'Enter a price greater than 0';
    if (mrp !== null && !(mrp > 0)) newErrors.mrp = 'Enter a valid amount or leave empty';
    if (mrp !== null && mrp > 0 && mrp < price) newErrors.mrp = 'Original price should be higher than the selling price';
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) newErrors.stock = 'Enter how many pieces you have (0 or more)';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return null;

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      mrp,
      stock,
      images: form.images,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = validate();
    if (!payload) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      if (isEdit) {
        await updateProduct(Number(id), payload);
      } else {
        await createProduct(payload);
      }
      navigate(ROUTES.ADMIN_PRODUCTS);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  if (existing.isLoading) return <Spinner />;
  if (existing.error) return <ErrorMessage message={existing.error} />;

  return (
    <div className="max-w-3xl space-y-6">
      <Link to={ROUTES.ADMIN_PRODUCTS} className="inline-flex items-center gap-1.5 text-xs text-[#8ba5a0] hover:text-[#ecc588]">
        <ArrowLeft className="w-3.5 h-3.5" /> All products
      </Link>
      <h1 className="font-serif text-3xl text-[#ecc588]">{isEdit ? 'Edit product' : 'Add a new product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <p className={labelClass}>Photos</p>
            <p className="text-xs text-stone-500 mt-1">
              Up to {MAX_IMAGES} photos, 5 MB each. The first photo is the cover shown in the shop.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {form.images.map((image, index) => (
              <div key={image} className="relative aspect-square rounded-lg overflow-hidden group border border-[#0e3f38]">
                <ProductImage src={image} alt={`Photo ${index + 1}`} className="w-full h-full" />
                {index === 0 ? (
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-gold-gradient text-stone-950 px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    title="Make cover photo"
                    className="absolute bottom-1.5 left-1.5 p-1.5 rounded-full bg-stone-950/80 text-[#ecc588] cursor-pointer"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => set('images', form.images.filter((_, i) => i !== index))}
                  title="Remove photo"
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-stone-950/80 text-stone-200 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {form.images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={isUploading}
                className="aspect-square rounded-lg border-2 border-dashed border-[#0e3f38] hover:border-[#caa060]/60 flex flex-col items-center justify-center gap-2 text-[#8ba5a0] hover:text-[#ecc588] cursor-pointer disabled:cursor-wait"
              >
                {isUploading ? (
                  <span className="w-6 h-6 border-2 border-[#caa060] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <ImagePlus className="w-6 h-6" />
                )}
                <span className="text-[11px] font-semibold">{isUploading ? 'Uploading...' : 'Add photos'}</span>
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
          {errors.images && <span className="text-xs text-red-400 font-medium">{errors.images}</span>}
        </section>

        {/* Details */}
        <section className="glass-card rounded-xl p-6 space-y-5">
          <Input
            label="Product name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            placeholder="e.g. Hand-painted terracotta diya set"
          />

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              placeholder="Materials, size, colours, how it's made, care instructions..."
              className="input-field px-4 py-3.5 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              className="input-field px-4 py-3.5 rounded-lg text-sm text-stone-100"
            >
              <option value="" className="bg-[#011714]">No category</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#011714]">{c.name}</option>
              ))}
            </select>
            <Link to={ROUTES.ADMIN_CATEGORIES} className="text-[11px] text-[#caa060] hover:text-[#ecc588] self-start">
              Manage categories
            </Link>
          </div>
        </section>

        {/* Price & stock */}
        <section className="glass-card rounded-xl p-6 grid sm:grid-cols-3 gap-5">
          <Input
            label="Selling price (₹)"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            error={errors.price}
            placeholder="499"
          />
          <Input
            label="Original price (₹, optional)"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.mrp}
            onChange={(e) => set('mrp', e.target.value)}
            error={errors.mrp}
            placeholder="699"
          />
          <Input
            label="Pieces in stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            error={errors.stock}
          />
        </section>

        {/* Visibility */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-amber-600"
            />
            <span>
              <span className="block text-sm text-stone-100">Show in shop</span>
              <span className="block text-xs text-stone-500">Untick to hide it from customers without deleting it.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-amber-600"
            />
            <span>
              <span className="block text-sm text-stone-100">Feature on home page</span>
              <span className="block text-xs text-stone-500">Shown under "Our favourites".</span>
            </span>
          </label>
        </section>

        {submitError && <ErrorMessage message={submitError} />}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" isLoading={isSaving} disabled={isUploading} className="sm:w-auto sm:px-10">
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)} className="sm:w-auto sm:px-10">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
