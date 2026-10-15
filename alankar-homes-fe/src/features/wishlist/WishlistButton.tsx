import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleWishlist } from './wishlistSlice';
import { ROUTES } from '../../utils/constants';

interface WishlistButtonProps {
  productId: number;
  // "icon" floats on a product photo, "full" is a labelled button on the product page
  variant?: 'icon' | 'full';
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, variant = 'icon', className = '' }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const signedIn = useAppSelector((state) => Boolean(state.auth.user));
  const saved = useAppSelector((state) => state.wishlist.ids.includes(productId));

  const handleClick = (e: React.MouseEvent) => {
    // The icon sits inside a product link, so don't open the product too
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname + location.search } });
      return;
    }
    dispatch(toggleWishlist(productId));
  };

  const label = saved ? 'Remove from wishlist' : 'Add to wishlist';

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
          saved
            ? 'border-[#caa060]/60 text-[#ecc588] bg-[#caa060]/10'
            : 'border-[#0e3f38] text-stone-300 hover:border-[#caa060]/50 hover:text-[#ecc588]'
        } ${className}`}
      >
        <Heart className={`w-4 h-4 transition-transform ${saved ? 'scale-110' : ''}`} fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'Saved to wishlist' : 'Save to wishlist'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={saved}
      title={label}
      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer active:scale-90 ${
        saved
          ? 'bg-[#00110f]/80 text-[#ecc588]'
          : 'bg-[#00110f]/60 text-stone-200 hover:text-[#ecc588] hover:bg-[#00110f]/80'
      } ${className}`}
    >
      <Heart className={`w-4.5 h-4.5 transition-transform ${saved ? 'scale-110' : ''}`} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
};
