import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchWishlist } from '../../features/shop/shopService';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { addToCart } from '../../features/cart/cartSlice';
import type { Product } from '../../features/shop/shopTypes';
import { EmptyState, ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const savedIds = useAppSelector((state) => state.wishlist.ids);
  const cartIds = useAppSelector((state) => state.cart.items.map((item) => item.productId));
  const { data, isLoading, error, reload } = useAsync(fetchWishlist, []);

  // Hide items as soon as they're un-hearted, without refetching
  const products = (data || []).filter((p) => savedIds.includes(p.id));

  const moveToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(toggleWishlist(product.id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="flex items-baseline justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl text-[#ecc588]">My wishlist</h1>
        {products.length > 0 && (
          <span className="text-xs text-[#8ba5a0]">{products.length} saved {products.length === 1 ? 'item' : 'items'}</span>
        )}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && products.length === 0 && (
        <EmptyState icon={<Heart className="w-10 h-10" strokeWidth={1.25} />} title="Your wishlist is empty">
          <p className="text-sm text-[#8ba5a0]">Tap the heart on any gift to save it here for later.</p>
          <Link to={ROUTES.PRODUCTS} className="mt-2 py-3 px-6 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm">
            Browse gifts
          </Link>
        </EmptyState>
      )}

      {products.length > 0 && (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const inCart = cartIds.includes(product.id);
            const soldOut = product.stock === 0;
            return (
              <li key={product.id} className="glass-card rounded-xl overflow-hidden flex flex-col">
                <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden group">
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  {soldOut && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-stone-950/85 text-stone-300 px-2.5 py-1 rounded-full">
                      Sold out
                    </span>
                  )}
                </Link>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <Link to={`/products/${product.id}`} className="text-sm text-stone-100 font-medium leading-snug line-clamp-2 hover:text-[#ecc588]">
                    {product.name}
                  </Link>
                  <span className="text-[#ecc588] font-semibold">{formatCurrency(product.price)}</span>
                  <div className="mt-auto pt-2 flex gap-2">
                    {inCart ? (
                      <Link
                        to={ROUTES.CART}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border border-[#caa060]/50 text-[#ecc588]"
                      >
                        In cart
                      </Link>
                    ) : (
                      <button
                        onClick={() => moveToCart(product)}
                        disabled={soldOut}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold bg-gold-gradient text-stone-950 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> {soldOut ? 'Sold out' : 'Move to cart'}
                      </button>
                    )}
                    <button
                      onClick={() => dispatch(toggleWishlist(product.id))}
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove"
                      className="p-2.5 rounded-lg border border-[#0e3f38] text-stone-400 hover:text-red-400 hover:border-red-900/60 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
