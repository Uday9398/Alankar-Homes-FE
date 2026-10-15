import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutThunk, setUser } from '../../features/auth/authSlice';
import { loadWishlist } from '../../features/wishlist/wishlistSlice';
import api from '../../services/api';
import { Logo } from '../common/Logo';
import { API_ENDPOINTS, ROUTES } from '../../utils/constants';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
    isActive ? 'text-[#ecc588]' : 'text-[#8ba5a0] hover:text-[#ecc588]'
  }`;

export const MainLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const wishlistCount = useAppSelector((state) => state.wishlist.ids.length);
  const cartCount = useAppSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // The mobile menu remembers which page it was opened on, so it closes itself after navigating
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const menuOpen = menuOpenedOn === location.pathname;
  const setMenuOpen = (open: boolean) => setMenuOpenedOn(open ? location.pathname : null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Pick up role changes made by an admin since this user signed in, and load their wishlist
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    dispatch(loadWishlist());
    api.get(API_ENDPOINTS.ME)
      .then((response) => dispatch(setUser(response.data.data)))
      .catch(() => {});
  }, [userId, dispatch]);

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate(ROUTES.HOME);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#00110f]">
      <header className="sticky top-0 z-40 bg-[#00110f]/90 backdrop-blur-md border-b border-[#0e3f38]/70">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-serif text-base md:text-lg text-[#ecc588] tracking-wider">Alankar Homes</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to={ROUTES.HOME} end className={navLinkClass}>Home</NavLink>
            <NavLink to={ROUTES.PRODUCTS} className={navLinkClass}>Shop</NavLink>
            <NavLink to={ROUTES.CUSTOM_ORDERS} className={navLinkClass}>Custom Orders</NavLink>
            {user && <NavLink to={ROUTES.ORDERS} className={navLinkClass}>My Orders</NavLink>}
            {isAdmin && <NavLink to={ROUTES.ADMIN} className={navLinkClass}>Admin</NavLink>}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            {user && (
              <Link
                to={ROUTES.WISHLIST}
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="relative p-2 text-[#8ba5a0] hover:text-[#ecc588] transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-gold-gradient text-stone-950 text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to={ROUTES.CART}
              aria-label={`Cart, ${cartCount} items`}
              className="relative p-2 text-[#8ba5a0] hover:text-[#ecc588] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-gold-gradient text-stone-950 text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to={ROUTES.PROFILE}
                  title="My profile"
                  className="text-xs text-stone-400 hover:text-[#ecc588] flex items-center gap-1.5 transition-colors"
                >
                  <User className="w-4 h-4" /> {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#8ba5a0] hover:text-[#ecc588] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="hidden md:inline-block text-xs font-semibold px-4 py-2 rounded-lg bg-gold-gradient text-stone-950"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="md:hidden p-2 text-[#8ba5a0] hover:text-[#ecc588] cursor-pointer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-[#0e3f38]/70 px-4 py-4 flex flex-col gap-4 bg-[#00110f]">
            <NavLink to={ROUTES.HOME} end className={navLinkClass}>Home</NavLink>
            <NavLink to={ROUTES.PRODUCTS} className={navLinkClass}>Shop</NavLink>
            <NavLink to={ROUTES.CUSTOM_ORDERS} className={navLinkClass}>
              <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Custom Orders</span>
            </NavLink>
            {user && (
              <NavLink to={ROUTES.ORDERS} className={navLinkClass}>
                <span className="inline-flex items-center gap-2"><Package className="w-4 h-4" /> My Orders</span>
              </NavLink>
            )}
            {user && (
              <NavLink to={ROUTES.WISHLIST} className={navLinkClass}>
                <span className="inline-flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist</span>
              </NavLink>
            )}
            {user && (
              <NavLink to={ROUTES.PROFILE} className={navLinkClass}>
                <span className="inline-flex items-center gap-2"><User className="w-4 h-4" /> My Profile</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to={ROUTES.ADMIN} className={navLinkClass}>
                <span className="inline-flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Admin</span>
              </NavLink>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8ba5a0] hover:text-[#ecc588] cursor-pointer"
              >
                Sign out ({user.name.split(' ')[0]})
              </button>
            ) : (
              <NavLink to={ROUTES.LOGIN} className={navLinkClass}>Sign in</NavLink>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#0e3f38]/70 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="font-serif text-[#ecc588] tracking-wider">Alankar Homes</p>
            <p className="text-xs text-[#8ba5a0]/80 max-w-sm leading-relaxed">
              Handmade gifts and keepsakes, crafted with love one piece at a time.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-[#8ba5a0]">
            <Link to={ROUTES.PRODUCTS} className="hover:text-[#ecc588]">Shop all</Link>
            <Link to={ROUTES.CUSTOM_ORDERS} className="hover:text-[#ecc588]">Custom orders</Link>
            <Link to={ROUTES.CART} className="hover:text-[#ecc588]">Cart</Link>
            {user && <Link to={ROUTES.ORDERS} className="hover:text-[#ecc588]">My Orders</Link>}
            {user && <Link to={ROUTES.WISHLIST} className="hover:text-[#ecc588]">Wishlist</Link>}
            {user && <Link to={ROUTES.PROFILE} className="hover:text-[#ecc588]">My Profile</Link>}
          </div>
          <p className="text-[11px] text-stone-600">© {new Date().getFullYear()} Alankar Homes</p>
        </div>
      </footer>
    </div>
  );
};
