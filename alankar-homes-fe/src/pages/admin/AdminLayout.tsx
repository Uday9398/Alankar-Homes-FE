import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Sparkles, Tags, Users } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const TABS = [
  { to: ROUTES.ADMIN, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Products', icon: Package, end: false },
  { to: ROUTES.ADMIN_CATEGORIES, label: 'Categories', icon: Tags, end: false },
  { to: ROUTES.ADMIN_ORDERS, label: 'Orders', icon: ShoppingCart, end: false },
  { to: ROUTES.ADMIN_CUSTOM_ORDERS, label: 'Custom orders', icon: Sparkles, end: false },
  { to: ROUTES.ADMIN_USERS, label: 'Users', icon: Users, end: false },
];

export const AdminLayout: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
    <div className="mb-8 space-y-4">
      <p className="text-[10px] font-bold tracking-[0.25em] text-[#8ba5a0] uppercase">Shop admin</p>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors ${
                isActive
                  ? 'bg-gold-gradient text-stone-950 border-transparent'
                  : 'border-[#0e3f38] text-[#8ba5a0] hover:text-[#ecc588] hover:border-[#caa060]/50'
              }`
            }
          >
            <Icon className="w-4 h-4" /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
    <Outlet />
  </div>
);
