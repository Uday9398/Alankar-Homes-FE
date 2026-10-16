import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MessageSquareText, Send } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { acceptCustomQuote, cancelCustomRequest, fetchCustomRequest } from '../../features/shop/shopService';
import type { CustomRequest, CustomRequestStatus } from '../../features/shop/shopTypes';
import { CustomStatusBadge, ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { useConfirm, useToast } from '../../hooks/useFeedback';
import { CUSTOM_STATUS_LABELS, ROUTES } from '../../utils/constants';

const STEPS: CustomRequestStatus[] = ['pending', 'quoted', 'accepted', 'in_progress', 'shipped', 'delivered'];

const Progress: React.FC<{ status: CustomRequestStatus }> = ({ status }) => {
  if (status === 'cancelled') return null;
  const current = STEPS.indexOf(status);

  return (
    <ol className="glass-card rounded-xl p-5 grid grid-cols-3 sm:grid-cols-6 gap-y-4">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="flex flex-col items-center gap-2 text-center">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                done ? 'bg-gold-gradient text-stone-950 border-transparent' : 'border-[#0e3f38] text-stone-500'
              }`}
            >
              {index < current ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>
            <span className={`text-[10px] font-semibold ${done ? 'text-[#ecc588]' : 'text-stone-500'}`}>
              {CUSTOM_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export const CustomOrderDetailsPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const justSent = (location.state as { justSent?: boolean } | null)?.justSent;
  const { data: request, setData, isLoading, error } = useAsync(() => fetchCustomRequest(id!), [id]);
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<'accept' | 'cancel' | null>(null);

  if (isLoading) return <Spinner />;
  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-6">
        <ErrorMessage message={error || 'Request not found'} />
        <Link to={ROUTES.CUSTOM_ORDERS} className="text-sm text-[#caa060]">← Custom orders</Link>
      </div>
    );
  }

  const run = async (action: 'accept' | 'cancel', call: (id: number) => Promise<CustomRequest>) => {
    setBusy(action);
    try {
      setData(await call(request.id));
      toast.success(action === 'accept' ? "Price accepted, we'll start making it soon" : 'Your request has been cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    const ok = await confirm({ title: 'Cancel this custom request?', confirmLabel: 'Cancel request', cancelLabel: 'Keep request', tone: 'danger' });
    if (ok) run('cancel', cancelCustomRequest);
  };

  const canCancel = request.status === 'pending' || request.status === 'quoted';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-6">
      <Link to={ROUTES.CUSTOM_ORDERS} className="inline-flex items-center gap-1.5 text-xs text-[#8ba5a0] hover:text-[#ecc588]">
        <ArrowLeft className="w-3.5 h-3.5" /> Custom orders
      </Link>

      {justSent && request.status === 'pending' && (
        <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-emerald-800/60">
          <Send className="w-7 h-7 text-[#ecc588] shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-lg text-[#ecc588]">Thank you, we've got your request!</p>
            <p className="text-sm text-[#8ba5a0]">We'll look at your idea and share a price here soon. We may also call you to talk through the details.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[#ecc588]">{request.title}</h1>
          <p className="text-xs text-[#8ba5a0] mt-1">Request #{request.id} · Sent on {formatDate(request.createdAt)}</p>
        </div>
        <CustomStatusBadge status={request.status} />
      </div>

      <Progress status={request.status} />

      {request.quotedPrice !== null && request.status !== 'cancelled' && (
        <div className={`glass-card rounded-xl p-6 space-y-4 ${request.status === 'quoted' ? 'border-[#caa060]/60' : ''}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Our price</p>
              <p className="font-serif text-3xl text-[#ecc588] mt-1">{formatCurrency(request.quotedPrice)}</p>
              <p className="text-xs text-[#8ba5a0]">For {request.quantity} piece{request.quantity > 1 ? 's' : ''} · cash on delivery</p>
            </div>
            {request.status === 'quoted' && (
              <Button onClick={() => run('accept', acceptCustomQuote)} isLoading={busy === 'accept'} disabled={busy !== null} className="sm:w-auto sm:px-8">
                Accept & start making
              </Button>
            )}
          </div>
          {request.status === 'quoted' && (
            <p className="text-xs text-stone-500">Not quite right? Cancel below, or call us to talk it through.</p>
          )}
        </div>
      )}

      {request.adminNote && (
        <div className="glass-card rounded-xl p-6 flex gap-3">
          <MessageSquareText className="w-5 h-5 text-[#caa060] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Message from Alankar Homes</p>
            <p className="text-sm text-stone-200 whitespace-pre-line">{request.adminNote}</p>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Your request</h2>
        <p className="text-sm text-stone-200 whitespace-pre-line leading-relaxed">{request.description}</p>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[#8ba5a0]">Quantity</dt>
            <dd className="text-stone-100">{request.quantity}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8ba5a0]">Your budget</dt>
            <dd className="text-stone-100">{request.budget !== null ? formatCurrency(request.budget) : 'Not given'}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8ba5a0]">Needed by</dt>
            <dd className="text-stone-100">{request.neededBy ? formatDate(request.neededBy) : 'No rush'}</dd>
          </div>
        </dl>
        {request.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {request.images.map((image, index) => (
              <a key={image} href={image} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-[#0e3f38] hover:border-[#caa060]/60">
                <ProductImage src={image} alt={`Reference photo ${index + 1}`} className="w-full h-full" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-6 space-y-2">
        <h2 className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Delivering to</h2>
        <p className="text-sm text-stone-100">{request.shippingName} · {request.shippingPhone}</p>
        <p className="text-sm text-stone-300">
          {request.shippingAddress}, {request.shippingCity}, {request.shippingState} – {request.shippingPincode}
        </p>
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={busy !== null}
          className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer disabled:opacity-50"
        >
          {busy === 'cancel' ? 'Cancelling...' : 'Cancel this request'}
        </button>
      )}
    </div>
  );
};
