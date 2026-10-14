import React from 'react';
import { Link } from 'react-router-dom';
import { ProductImage } from '../../../components/common/ProductImage';
import { formatCurrency } from '../../../utils/formatters';
import { WishlistButton } from '../../wishlist/WishlistButton';
import type { Product } from '../shopTypes';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="relative">
      <Link
        to={`/products/${product.id}`}
        className="group glass-card rounded-xl overflow-hidden flex flex-col h-full hover:border-[#caa060]/50 transition-colors duration-300"
      >
        <div className="relative aspect-square overflow-hidden">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {product.stock === 0 && (
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-stone-950/85 text-stone-300 px-2.5 py-1 rounded-full">
              Sold out
            </span>
          )}
          {product.stock > 0 && discount > 0 && (
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-gold-gradient text-stone-950 px-2.5 py-1 rounded-full">
              {discount}% off
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          {product.category && (
            <span className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">{product.category.name}</span>
          )}
          <h3 className="text-sm text-stone-100 font-medium leading-snug line-clamp-2">{product.name}</h3>
          <div className="mt-auto pt-2 flex items-baseline gap-2">
            <span className="text-[#ecc588] font-semibold">{formatCurrency(product.price)}</span>
            {discount > 0 && <span className="text-xs text-stone-500 line-through">{formatCurrency(product.mrp!)}</span>}
          </div>
        </div>
      </Link>
      <WishlistButton productId={product.id} className="absolute top-3 right-3" />
    </div>
  );
};
