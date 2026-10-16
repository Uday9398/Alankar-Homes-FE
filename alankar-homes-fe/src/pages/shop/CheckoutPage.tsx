import React, { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Banknote } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearCart } from '../../features/cart/cartSlice';
import { createAddress, placeOrder } from '../../features/shop/shopService';
import type { Address, ShippingDetails } from '../../features/shop/shopTypes';
import { ProductImage } from '../../components/common/ProductImage';
import { Input } from '../../components/common/Input';
import { AddressInputs } from '../../components/address/AddressInputs';
import { AddressPicker, SaveAddressOption } from '../../components/address/AddressPicker';
import { emptyAddress, pickAddress, trimAddress, validateAddress } from '../../components/address/addressUtils';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { useToast } from '../../hooks/useFeedback';
import { ROUTES } from '../../utils/constants';

type FieldErrors = Partial<Record<keyof ShippingDetails, string>>;

export const CheckoutPage: React.FC = () => {
  const items = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<ShippingDetails>({ ...emptyAddress(user?.name, user?.phone), notes: '' });
  // undefined while saved addresses load, null when typing a new address
  const [addressId, setAddressId] = useState<number | null | undefined>(undefined);
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [errors, setErrors] = useState<FieldErrors>({});
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once the order succeeds, so emptying the cart doesn't bounce us to /cart
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  const selectAddress = useCallback(
    (address: Address | null) => {
      setAddressId(address ? address.id : null);
      setForm((prev) => ({ ...prev, ...(address ? pickAddress(address) : emptyAddress(user?.name, user?.phone)) }));
      setErrors({});
    },
    [user?.name, user?.phone]
  );

  if (placedOrderId) {
    return <Navigate to={`/orders/${placedOrderId}`} replace state={{ justPlaced: true }} />;
  }

  if (items.length === 0) {
    return <Navigate to={ROUTES.CART} replace />;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const field = (name: keyof ShippingDetails) => ({
    name,
    value: form[name] || '',
    error: errors[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addressId === undefined) return;
    const newErrors = validateAddress(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        ...form,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      // Saving the address is a convenience; the order has already gone through if it fails
      if (addressId === null && saveAddress) {
        await createAddress({ label: addressLabel.trim() || 'Home', ...trimAddress(form) }).catch(() => {});
      }
      setPlacedOrderId(order.id);
      dispatch(clearCart());
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <h1 className="font-serif text-3xl text-[#ecc588] mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="glass-card rounded-xl p-6 md:p-8 space-y-5">
          <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Delivery address</h2>
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
          <Input label="Gift note or instructions (optional)" placeholder="e.g. Please wrap as a birthday gift" {...field('notes')} />

          <div className="border-t border-[#0e3f38]/70 pt-5 space-y-3">
            <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Payment</h2>
            <div className="input-field rounded-lg p-4 flex items-center gap-3 border-[#caa060]/60">
              <Banknote className="w-5 h-5 text-[#caa060]" />
              <div>
                <p className="text-sm text-stone-100">Cash on delivery</p>
                <p className="text-xs text-[#8ba5a0]">Pay in cash or UPI when your order arrives.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="glass-card rounded-xl p-6 space-y-4 lg:sticky lg:top-28">
          <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Your order</h2>
          <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                  <ProductImage src={item.image} alt={item.name} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-200 truncate">{item.name}</p>
                  <p className="text-[11px] text-[#8ba5a0]">Qty {item.quantity}</p>
                </div>
                <span className="text-xs text-stone-200">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#0e3f38]/70 pt-4 flex justify-between text-base">
            <span className="text-stone-100 font-medium">Total</span>
            <span className="text-[#ecc588] font-semibold">{formatCurrency(total)}</span>
          </div>
          <Button type="submit" isLoading={isSubmitting} disabled={addressId === undefined}>Place order</Button>
        </aside>
      </form>
    </div>
  );
};
