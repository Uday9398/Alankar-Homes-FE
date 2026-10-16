import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Phone } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { adminFetchOrders, updateOrderStatus } from '../../features/shop/shopService';
import type { Order, OrderStatus } from '../../features/shop/shopTypes';
import { ErrorMessage, Spinner, StatusBadge } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { useConfirm, useToast } from '../../hooks/useFeedback';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const FILTERS: (OrderStatus | '')[] = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// What the shop owner can move an order to from each status
const NEXT_STEPS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Confirm order',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  cancelled: 'Cancel order',
};

const OrderRow: React.FC<{ order: Order; onUpdated: (order: Order) => void }> = ({ order, onUpdated }) => {
  const [open, setOpen] = useState(order.status === 'pending');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const changeStatus = async (status: OrderStatus) => {
    if (status === 'cancelled') {
      const ok = await confirm({
        title: `Cancel order #${order.id}?`,
        message: 'The items will go back into stock.',
        confirmLabel: 'Cancel order',
        cancelLabel: 'Keep order',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setIsSaving(true);
    try {
      onUpdated(await updateOrderStatus(order.id, status));
      toast.success(`Order #${order.id} is now ${ORDER_STATUS_LABELS[status].toLowerCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const itemCount = order.items?.reduce((n, i) => n + i.quantity, 0) || 0;

  return (
    <li className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 md:p-5 flex items-center gap-4 text-left cursor-pointer">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-stone-100 font-medium">#{order.id} · {order.shippingName}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-[#8ba5a0]">
            {formatDate(order.createdAt)} · {itemCount} items · {formatCurrency(order.totalAmount)}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-[#0e3f38]/70 p-4 md:p-5 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Items</p>
            <ul className="space-y-2">
              {order.items?.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                    <ProductImage src={item.productImage} alt={item.productName} className="w-full h-full" />
                  </div>
                  <span className="flex-1 text-sm text-stone-200">{item.productName}</span>
                  <span className="text-xs text-[#8ba5a0]">× {item.quantity}</span>
                  <span className="text-xs text-stone-200 w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-right text-[#ecc588] font-semibold">Collect {formatCurrency(order.totalAmount)} (COD)</p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Deliver to</p>
            <div className="text-sm text-stone-300 space-y-1">
              <p className="text-stone-100">{order.shippingName}</p>
              <a href={`tel:${order.shippingPhone}`} className="inline-flex items-center gap-1.5 text-[#caa060] hover:text-[#ecc588]">
                <Phone className="w-3.5 h-3.5" /> {order.shippingPhone}
              </a>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState} – {order.shippingPincode}</p>
              {order.user && <p className="text-xs text-stone-500">Account: {order.user.email}</p>}
              {order.notes && <p className="text-[#ecc588]/90 italic">Note: {order.notes}</p>}
            </div>

            {NEXT_STEPS[order.status].length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {NEXT_STEPS[order.status].map((status) => (
                  <button
                    key={status}
                    disabled={isSaving}
                    onClick={() => changeStatus(status)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                      status === 'cancelled'
                        ? 'border border-red-900/70 text-red-400 hover:bg-red-950/40'
                        : 'bg-gold-gradient text-stone-950'
                    }`}
                  >
                    {ACTION_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

export const AdminOrdersPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') || '') as OrderStatus | '';
  const [page, setPage] = useState(1);
  const { data, setData, isLoading, error, reload } = useAsync(() => adminFetchOrders({ status, page }), [status, page]);

  const handleUpdated = (updated: Order) => {
    setData((prev) => prev && { ...prev, orders: prev.orders.map((o) => (o.id === updated.id ? updated : o)) });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#ecc588]">Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => {
              setPage(1);
              setParams(f ? { status: f } : {});
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer ${
              status === f
                ? 'bg-gold-gradient text-stone-950 border-transparent'
                : 'border-[#0e3f38] text-[#8ba5a0] hover:text-[#ecc588]'
            }`}
          >
            {f ? ORDER_STATUS_LABELS[f] : 'All'}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!isLoading && data && data.orders.length === 0 && (
        <p className="glass-card rounded-xl p-10 text-sm text-[#8ba5a0] text-center">No orders here.</p>
      )}

      {!isLoading && data && data.orders.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.orders.map((order) => (
              <OrderRow key={order.id} order={order} onUpdated={handleUpdated} />
            ))}
          </ul>
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#0e3f38] text-stone-300 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-[#8ba5a0]">Page {page} of {data.pagination.totalPages}</span>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#0e3f38] text-stone-300 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
