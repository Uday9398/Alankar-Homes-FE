import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, PartyPopper } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { cancelOrder, fetchOrder } from '../../features/shop/shopService';
import { ErrorMessage, Spinner, StatusBadge } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { OrderProgress } from '../../features/shop/components/OrderProgress';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { useConfirm, useToast } from '../../hooks/useFeedback';
import { ROUTES } from '../../utils/constants';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced;
  const { data: order, setData, isLoading, error } = useAsync(() => fetchOrder(id!), [id]);
  const [isCancelling, setIsCancelling] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  if (isLoading) return <Spinner />;
  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-6">
        <ErrorMessage message={error || 'Order not found'} />
        <Link to={ROUTES.ORDERS} className="text-sm text-[#caa060]">← My orders</Link>
      </div>
    );
  }

  const handleCancel = async () => {
    const ok = await confirm({ title: 'Cancel this order?', confirmLabel: 'Cancel order', cancelLabel: 'Keep order', tone: 'danger' });
    if (!ok) return;
    setIsCancelling(true);
    try {
      setData(await cancelOrder(order.id));
      toast.success('Your order has been cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-6">
      <Link to={ROUTES.ORDERS} className="inline-flex items-center gap-1.5 text-xs text-[#8ba5a0] hover:text-[#ecc588]">
        <ArrowLeft className="w-3.5 h-3.5" /> My orders
      </Link>

      {justPlaced && order.status === 'pending' && (
        <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-emerald-800/60">
          <PartyPopper className="w-8 h-8 text-[#ecc588] shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-lg text-[#ecc588]">Thank you for your order!</p>
            <p className="text-sm text-[#8ba5a0]">We'll confirm it shortly and start preparing your handmade gift.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[#ecc588]">Order #{order.id}</h1>
          <p className="text-xs text-[#8ba5a0] mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <OrderProgress status={order.status} />

      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Items</h2>
        <ul className="space-y-3">
          {order.items?.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <ProductImage src={item.productImage} alt={item.productName} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                {item.productId ? (
                  <Link to={`/products/${item.productId}`} className="text-sm text-stone-100 hover:text-[#ecc588]">{item.productName}</Link>
                ) : (
                  <span className="text-sm text-stone-100">{item.productName}</span>
                )}
                <p className="text-xs text-[#8ba5a0]">{formatCurrency(item.price)} × {item.quantity}</p>
              </div>
              <span className="text-sm text-stone-200">{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[#0e3f38]/70 pt-4 flex justify-between">
          <span className="text-stone-100 font-medium">Total (cash on delivery)</span>
          <span className="text-[#ecc588] font-semibold">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-2">
        <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Delivering to</h2>
        <p className="text-sm text-stone-100">{order.shippingName} · {order.shippingPhone}</p>
        <p className="text-sm text-stone-300">
          {order.shippingAddress}, {order.shippingCity}, {order.shippingState} – {order.shippingPincode}
        </p>
        {order.notes && <p className="text-sm text-[#8ba5a0] italic">Note: {order.notes}</p>}
      </div>

      {order.status === 'pending' && (
        <div className="space-y-3">
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel this order'}
          </button>
        </div>
      )}
    </div>
  );
};
