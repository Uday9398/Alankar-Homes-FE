import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeFromCart, setQuantity } from '../../features/cart/cartSlice';
import { EmptyState } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export const CartPage: React.FC = () => {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14">
        <EmptyState icon={<ShoppingBag className="w-10 h-10" strokeWidth={1.25} />} title="Your cart is empty">
          <p className="text-sm text-[#8ba5a0]">Find something special in our handmade collection.</p>
          <Link to={ROUTES.PRODUCTS} className="mt-2 py-3 px-6 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm">
            Browse gifts
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <h1 className="font-serif text-3xl text-[#ecc588] mb-8">Your cart</h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="glass-card rounded-xl p-4 flex gap-4">
              <Link to={`/products/${item.productId}`} className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0">
                <ProductImage src={item.image} alt={item.name} className="w-full h-full" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex justify-between gap-3">
                  <Link to={`/products/${item.productId}`} className="text-sm text-stone-100 font-medium hover:text-[#ecc588] line-clamp-2">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    aria-label={`Remove ${item.name}`}
                    className="text-stone-500 hover:text-red-400 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-[#8ba5a0]">{formatCurrency(item.price)} each</span>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center input-field rounded-lg">
                    <button
                      onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="p-2 text-stone-300 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                      className="p-2 text-stone-300 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm text-[#ecc588] font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="glass-card rounded-xl p-6 space-y-4 lg:sticky lg:top-28">
          <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Order summary</h2>
          <div className="flex justify-between text-sm text-stone-300">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-300">
            <span>Delivery</span>
            <span className="text-emerald-400">Free</span>
          </div>
          <div className="border-t border-[#0e3f38]/70 pt-4 flex justify-between text-base">
            <span className="text-stone-100 font-medium">Total</span>
            <span className="text-[#ecc588] font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <Button onClick={() => navigate(ROUTES.CHECKOUT)}>Proceed to checkout</Button>
          <Link to={ROUTES.PRODUCTS} className="block text-center text-xs text-[#caa060] hover:text-[#ecc588]">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};
