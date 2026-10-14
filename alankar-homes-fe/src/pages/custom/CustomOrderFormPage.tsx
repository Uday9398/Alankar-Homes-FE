import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { createAddress, submitCustomRequest, uploadReferenceImages } from '../../features/shop/shopService';
import type { Address } from '../../features/shop/shopTypes';
import { ErrorMessage } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AddressInputs } from '../../components/address/AddressInputs';
import { AddressPicker, SaveAddressOption } from '../../components/address/AddressPicker';
import { emptyAddress, pickAddress, trimAddress, validateAddress } from '../../components/address/addressUtils';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';

const MAX_IMAGES = 5;

// Numbers and the date are kept as text while typing so the fields can be empty
interface FormState {
  title: string;
  description: string;
  quantity: string;
  budget: string;
  neededBy: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
}

type TextField = keyof FormState;

const labelClass = 'text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase';

// en-CA formats as YYYY-MM-DD, which is what <input type="date"> expects
const today = () => new Date().toLocaleDateString('en-CA');

const validate = (form: FormState) => {
  const errors: Partial<Record<TextField, string>> = {};
  const quantity = Number(form.quantity);
  const budget = Number(form.budget);

  if (form.title.trim().length < 3) errors.title = "Please tell us what you'd like made";
  if (form.description.trim().length < 10) errors.description = 'Please add a little more detail (at least 10 characters)';
  if (!Number.isInteger(quantity) || quantity < 1) errors.quantity = 'Enter how many you need (1 or more)';
  if (form.budget && !(budget > 0)) errors.budget = 'Enter a valid amount or leave empty';
  if (form.neededBy && form.neededBy < today()) errors.neededBy = "The date can't be in the past";
  return { ...errors, ...validateAddress(form) };
};

export const CustomOrderFormPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    quantity: '1',
    budget: '',
    neededBy: '',
    ...emptyAddress(user?.name, user?.phone),
  });
  // undefined while saved addresses load, null when typing a new address
  const [addressId, setAddressId] = useState<number | null | undefined>(undefined);
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<TextField | 'images', string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectAddress = useCallback(
    (address: Address | null) => {
      setAddressId(address ? address.id : null);
      setForm((prev) => ({ ...prev, ...(address ? pickAddress(address) : emptyAddress(user?.name, user?.phone)) }));
    },
    [user?.name, user?.phone]
  );

  const field = (name: TextField) => ({
    name,
    value: form[name],
    error: errors[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    },
  });

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) {
      setErrors((prev) => ({ ...prev, images: `You can add up to ${MAX_IMAGES} photos` }));
      return;
    }

    setIsUploading(true);
    setErrors((prev) => ({ ...prev, images: '' }));
    try {
      const urls = await uploadReferenceImages(files);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setErrors((prev) => ({ ...prev, images: getErrorMessage(err) }));
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addressId === undefined) return;
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const request = await submitCustomRequest({
        title: form.title.trim(),
        description: form.description.trim(),
        images,
        quantity: Number(form.quantity),
        budget: form.budget ? Number(form.budget) : null,
        neededBy: form.neededBy || null,
        ...trimAddress(form),
      });
      // Saving the address is a convenience; the request has already been sent if it fails
      if (addressId === null && saveAddress) {
        await createAddress({ label: addressLabel.trim() || 'Home', ...trimAddress(form) }).catch(() => {});
      }
      navigate(`${ROUTES.CUSTOM_ORDERS}/${request.id}`, { replace: true, state: { justSent: true } });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-6">
      <Link to={ROUTES.CUSTOM_ORDERS} className="inline-flex items-center gap-1.5 text-xs text-[#8ba5a0] hover:text-[#ecc588]">
        <ArrowLeft className="w-3.5 h-3.5" /> Custom orders
      </Link>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-[#ecc588]">Request a custom piece</h1>
        <p className="text-sm text-[#8ba5a0]">
          Tell us what you have in mind. There's no payment now. We'll send you a price first, and you decide whether to go ahead.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* The idea */}
        <section className="glass-card rounded-xl p-6 space-y-5">
          <Input label="What would you like made?" placeholder="e.g. Wooden name plate for our new home" {...field('title')} />

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Describe it</label>
            <textarea
              {...field('description')}
              rows={6}
              placeholder="Size, colours, materials, names or text to include, the occasion... the more detail the better."
              className={`input-field px-4 py-3.5 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full resize-y ${
                errors.description ? 'border-red-500/80 focus:border-red-500/80' : ''
              }`}
            />
            {errors.description && <span className="text-xs text-red-400 font-medium tracking-wide">{errors.description}</span>}
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <Input label="Quantity" type="number" min="1" step="1" inputMode="numeric" {...field('quantity')} />
            <Input label="Budget (₹, optional)" type="number" min="0" step="1" inputMode="decimal" placeholder="1500" {...field('budget')} />
            <Input label="Needed by (optional)" type="date" min={today()} {...field('neededBy')} />
          </div>
        </section>

        {/* Reference photos */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <p className={labelClass}>Reference photos (optional)</p>
            <p className="text-xs text-stone-500 mt-1">
              Up to {MAX_IMAGES} photos, 5 MB each: sketches, a similar piece you liked, colours, the space it's for...
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div key={image} className="relative aspect-square rounded-lg overflow-hidden border border-[#0e3f38]">
                <ProductImage src={image} alt={`Reference photo ${index + 1}`} className="w-full h-full" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                  title="Remove photo"
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-stone-950/80 text-stone-200 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
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

        {/* Delivery */}
        <section className="glass-card rounded-xl p-6 space-y-5">
          <h2 className={labelClass}>Delivery address & contact</h2>
          <AddressPicker selectedId={addressId} onSelect={selectAddress} />
          {addressId === null && (
            <>
              <AddressInputs
                value={form}
                errors={errors}
                onChange={(name, value) => {
                  setForm((prev) => ({ ...prev, [name]: value }));
                  if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
                }}
              />
              <SaveAddressOption save={saveAddress} onSaveChange={setSaveAddress} label={addressLabel} onLabelChange={setAddressLabel} />
            </>
          )}
          <p className="text-xs text-stone-500">We may call you on this number to talk through the details.</p>
        </section>

        {submitError && <ErrorMessage message={submitError} />}

        <Button type="submit" isLoading={isSubmitting} disabled={isUploading || addressId === undefined} className="sm:w-auto sm:px-10">
          Send request
        </Button>
      </form>
    </div>
  );
};
