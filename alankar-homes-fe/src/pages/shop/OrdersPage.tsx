import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { fetchMyOrders } from '../../features/shop/shopService';
import { EmptyState, ErrorMessage, Spinner, StatusBadge } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, error, reload } = useAsync(fetchMyOrders, []);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <h1 className="font-serif text-3xl text-[#ecc588] mb-8">My orders</h1>

      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {orders && orders.length === 0 && (
        <EmptyState icon={<Package className="w-10 h-10" strokeWidth={1.25} />} title="No orders yet">
          <Link to={ROUTES.PRODUCTS} className="mt-2 py-3 px-6 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm">
            Start shopping
          </Link>
        </EmptyState>
      )}

      {orders && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-[#caa060]/50 transition-colors"
              >
                <div className="flex -space-x-3 shrink-0">
                  {order.items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#011714]">
                      <ProductImage src={item.productImage} alt={item.productName} className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-stone-100 font-medium">Order #{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-[#8ba5a0]">
                    {formatDate(order.createdAt)} · {order.items?.reduce((n, i) => n + i.quantity, 0)} items ·{' '}
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
