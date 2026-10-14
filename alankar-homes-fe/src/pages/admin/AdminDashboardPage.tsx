import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { fetchStats } from '../../features/shop/shopService';
import { ErrorMessage, Spinner, StatusBadge } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

const StatTile: React.FC<{ label: string; value: string | number; hint?: string; to?: string }> = ({ label, value, hint, to }) => {
  const body = (
    <>
      <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">{label}</p>
      <p className="text-2xl md:text-3xl text-[#ecc588] font-semibold mt-2">{value}</p>
      {hint && <p className="text-xs text-[#8ba5a0]/80 mt-1">{hint}</p>}
    </>
  );
  return to ? (
    <Link to={to} className="glass-card rounded-xl p-5 hover:border-[#caa060]/50 transition-colors">{body}</Link>
  ) : (
    <div className="glass-card rounded-xl p-5">{body}</div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, reload } = useAsync(fetchStats, []);

  if (isLoading) return <Spinner />;
  if (error || !stats) return <ErrorMessage message={error || 'Could not load dashboard'} onRetry={reload} />;

  const pending = stats.ordersByStatus.pending || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-[#ecc588]">Dashboard</h1>
        <Link
          to={ROUTES.ADMIN_NEW_PRODUCT}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile label="Sales" value={formatCurrency(stats.revenue)} hint="Excluding cancelled orders" />
        <StatTile
          label="New orders"
          value={pending}
          hint={pending > 0 ? 'Waiting for you to confirm' : 'All caught up'}
          to={`${ROUTES.ADMIN_ORDERS}?status=pending`}
        />
        <StatTile label="Total orders" value={stats.totalOrders} to={ROUTES.ADMIN_ORDERS} />
        <StatTile label="Products" value={stats.totalProducts} to={ROUTES.ADMIN_PRODUCTS} />
        <StatTile label="Registered customers" value={stats.totalCustomers} hint="View all users" to={ROUTES.ADMIN_USERS} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Recent orders</h2>
            <Link to={ROUTES.ADMIN_ORDERS} className="text-xs text-[#caa060] hover:text-[#ecc588]">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-stone-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-[#0e3f38]/70">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-stone-100">#{order.id} · {order.user?.name}</p>
                    <p className="text-xs text-[#8ba5a0]">{formatDate(order.createdAt)} · {formatCurrency(order.totalAmount)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Running low (3 or fewer left)</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-stone-500">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-[#0e3f38]/70">
              {stats.lowStockProducts.map((product) => (
                <li key={product.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                    <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full" />
                  </div>
                  <Link to={`/admin/products/${product.id}/edit`} className="flex-1 text-sm text-stone-100 hover:text-[#ecc588] truncate">
                    {product.name}
                  </Link>
                  <span className={`text-xs font-semibold ${product.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {product.stock === 0 ? 'Sold out' : `${product.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
