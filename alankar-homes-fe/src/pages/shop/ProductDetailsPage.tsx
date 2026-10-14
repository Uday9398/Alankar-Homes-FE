import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProduct } from '../../features/shop/shopService';
import { addToCart } from '../../features/cart/cartSlice';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { WishlistButton } from '../../features/wishlist/WishlistButton';
import { ROUTES } from '../../utils/constants';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: product, isLoading, error } = useAsync(() => fetchProduct(id!), [id]);
  const inCart = useAppSelector((state) => state.cart.items.find((item) => item.productId === Number(id))?.quantity || 0);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) return <Spinner />;
  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-6">
        <ErrorMessage message={error || 'Product not found'} />
        <Link to={ROUTES.PRODUCTS} className="text-sm text-[#caa060] hover:text-[#ecc588]">← Back to shop</Link>
      </div>
    );
  }

  const canAddMore = product.stock - inCart;
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAdd = (goToCart: boolean) => {
    dispatch(addToCart({ product, quantity }));
    if (goToCart) {
      navigate(ROUTES.CART);
      return;
    }
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-14">
      <Link to={ROUTES.PRODUCTS} className="inline-flex items-center gap-1.5 text-xs text-[#8ba5a0] hover:text-[#ecc588] mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="glass-card rounded-2xl overflow-hidden aspect-square">
            <ProductImage src={product.images[activeImage]} alt={product.name} className="w-full h-full" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                    index === activeImage ? 'border-[#caa060]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <ProductImage src={image} alt={`${product.name} photo ${index + 1}`} className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-3">
            {product.category && (
              <Link
                to={`${ROUTES.PRODUCTS}?category=${product.category.id}`}
                className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase hover:text-[#ecc588]"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-serif text-2xl md:text-3xl text-[#ecc588] leading-snug">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl text-stone-100 font-semibold">{formatCurrency(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-stone-500 line-through">{formatCurrency(product.mrp!)}</span>
                  <span className="text-xs font-bold text-emerald-400">{discount}% off</span>
                </>
              )}
            </div>
          </div>

          <div className="text-sm">
            {product.stock === 0 ? (
              <span className="text-red-400 font-medium">Sold out</span>
            ) : product.stock <= 3 ? (
              <span className="text-amber-400 font-medium">Only {product.stock} left – handmade in small batches</span>
            ) : (
              <span className="text-emerald-400 font-medium">In stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Quantity</span>
                <div className="flex items-center input-field rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-3 text-stone-300 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(canAddMore, q + 1))}
                    disabled={quantity >= canAddMore}
                    aria-label="Increase quantity"
                    className="p-3 text-stone-300 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {canAddMore <= 0 ? (
                <p className="text-xs text-[#8ba5a0]">
                  You already have all available pieces in your <Link to={ROUTES.CART} className="text-[#caa060]">cart</Link>.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={() => handleAdd(false)}>
                    {added ? <><Check className="w-4 h-4" /> Added to cart</> : <><ShoppingBag className="w-4 h-4" /> Add to cart</>}
                  </Button>
                  <Button onClick={() => handleAdd(true)}>Buy now</Button>
                </div>
              )}
            </div>
          )}

          <WishlistButton productId={product.id} variant="full" className="w-full sm:w-auto sm:px-6" />

          {product.description && (
            <div className="border-t border-[#0e3f38]/70 pt-6 space-y-2">
              <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">About this piece</h2>
              <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
