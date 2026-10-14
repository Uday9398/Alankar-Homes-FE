import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { adminFetchCustomRequests, adminUpdateCustomRequest } from '../../features/shop/shopService';
import type { CustomRequest, CustomRequestStatus, CustomRequestUpdate } from '../../features/shop/shopTypes';
import { CustomStatusBadge, ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { CUSTOM_STATUS_LABELS } from '../../utils/constants';

const FILTERS: (CustomRequestStatus | '')[] = ['', 'pending', 'quoted', 'accepted', 'in_progress', 'shipped', 'delivered', 'cancelled'];

// What the shop owner can move a request to from each status (sending a price is done with the price form)
const NEXT_STEPS: Record<CustomRequestStatus, CustomRequestStatus[]> = {
  pending: ['cancelled'],
  quoted: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const ACTION_LABELS: Partial<Record<CustomRequestStatus, string>> = {
  accepted: 'Customer agreed (mark accepted)',
  in_progress: 'Start making',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  cancelled: 'Cancel request',
};

const labelClass = 'text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase';

// wa.me needs the number with country code and no symbols; 10-digit numbers are assumed to be Indian
const whatsappLink = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};

const RequestRow: React.FC<{ request: CustomRequest; onUpdated: (request: CustomRequest) => void }> = ({ request, onUpdated }) => {
  const [open, setOpen] = useState(request.status === 'pending');
  const [price, setPrice] = useState(request.quotedPrice !== null ? String(request.quotedPrice) : '');
  const [note, setNote] = useState(request.adminNote || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canQuote = request.status === 'pending' || request.status === 'quoted';

  const save = async (changes: CustomRequestUpdate) => {
    setIsSaving(true);
    setError(null);
    try {
      // The message box is always sent along, so it can be edited with any action
      onUpdated(await adminUpdateCustomRequest(request.id, { adminNote: note.trim(), ...changes }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const sendQuote = () => {
    const amount = Number(price);
    if (!(amount > 0)) {
      setError('Enter a price greater than 0');
      return;
    }
    save({ quotedPrice: amount });
  };

  const changeStatus = (status: CustomRequestStatus) => {
    if (status === 'cancelled' && !window.confirm(`Cancel request #${request.id}? Add a reason in the message box so the customer knows why.`)) return;
    save({ status });
  };

  return (
    <li className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 md:p-5 flex items-center gap-4 text-left cursor-pointer">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
          <ProductImage src={request.images[0]} alt={request.title} className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-stone-100 font-medium">#{request.id} · {request.title}</span>
            <CustomStatusBadge status={request.status} />
          </div>
          <p className="text-xs text-[#8ba5a0]">
            {request.shippingName} · {formatDate(request.createdAt)} · Qty {request.quantity}
            {request.quotedPrice !== null && ` · ${formatCurrency(request.quotedPrice)}`}
            {request.neededBy && ` · needed by ${formatDate(request.neededBy)}`}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-[#0e3f38]/70 p-4 md:p-5 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className={labelClass}>What they want</p>
              <p className="text-sm text-stone-200 whitespace-pre-line leading-relaxed">{request.description}</p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[#8ba5a0]">Quantity</dt>
                <dd className="text-stone-100">{request.quantity}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#8ba5a0]">Budget</dt>
                <dd className="text-stone-100">{request.budget !== null ? formatCurrency(request.budget) : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#8ba5a0]">Needed by</dt>
                <dd className="text-stone-100">{request.neededBy ? formatDate(request.neededBy) : '—'}</dd>
              </div>
            </dl>
            {request.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {request.images.map((image, index) => (
                  <a key={image} href={image} target="_blank" rel="noreferrer" title="Open full size" className="aspect-square rounded-md overflow-hidden border border-[#0e3f38] hover:border-[#caa060]/60">
                    <ProductImage src={image} alt={`Reference photo ${index + 1}`} className="w-full h-full" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500">No reference photos.</p>
            )}

            <div className="space-y-1 text-sm text-stone-300">
              <p className={labelClass}>Customer</p>
              <p className="text-stone-100">{request.shippingName}</p>
              <div className="flex flex-wrap gap-4">
                <a href={`tel:${request.shippingPhone}`} className="inline-flex items-center gap-1.5 text-[#caa060] hover:text-[#ecc588]">
                  <Phone className="w-3.5 h-3.5" /> {request.shippingPhone}
                </a>
                <a href={whatsappLink(request.shippingPhone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#caa060] hover:text-[#ecc588]">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
              <p>{request.shippingAddress}</p>
              <p>{request.shippingCity}, {request.shippingState} – {request.shippingPincode}</p>
              {request.user && <p className="text-xs text-stone-500">Account: {request.user.email}</p>}
            </div>
          </div>

          <div className="space-y-4">
            {canQuote && (
              <div className="space-y-2">
                <label className={labelClass}>Price for the whole request (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1800"
                  className="input-field px-4 py-3 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className={labelClass}>Message to the customer (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What the price includes, how long it will take, or why you can't make it..."
                className="input-field px-4 py-3 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full resize-y"
              />
              <p className="text-[11px] text-stone-500">The customer sees this on their request page.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canQuote && (
                <button
                  disabled={isSaving}
                  onClick={sendQuote}
                  className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 bg-gold-gradient text-stone-950"
                >
                  {request.status === 'quoted' ? 'Update price' : 'Send price'}
                </button>
              )}
              {!canQuote && request.status !== 'delivered' && request.status !== 'cancelled' && (
                <button
                  disabled={isSaving}
                  onClick={() => save({})}
                  className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 border border-[#0e3f38] text-stone-300 hover:text-[#ecc588]"
                >
                  Save message
                </button>
              )}
              {NEXT_STEPS[request.status].map((status) => (
                <button
                  key={status}
                  disabled={isSaving}
                  onClick={() => changeStatus(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                    status === 'cancelled'
                      ? 'border border-red-900/70 text-red-400 hover:bg-red-950/40'
                      : canQuote
                        ? 'border border-[#0e3f38] text-stone-300 hover:text-[#ecc588]'
                        : 'bg-gold-gradient text-stone-950'
                  }`}
                >
                  {ACTION_LABELS[status]}
                </button>
              ))}
            </div>
            {request.status === 'quoted' && (
              <p className="text-[11px] text-stone-500">Waiting for the customer to accept the price on the website.</p>
            )}
            {error && <ErrorMessage message={error} />}
          </div>
        </div>
      )}
    </li>
  );
};

export const AdminCustomOrdersPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') || '') as CustomRequestStatus | '';
  const [page, setPage] = useState(1);
  const { data, setData, isLoading, error, reload } = useAsync(() => adminFetchCustomRequests({ status, page }), [status, page]);

  const handleUpdated = (updated: CustomRequest) => {
    setData((prev) => prev && { ...prev, requests: prev.requests.map((r) => (r.id === updated.id ? updated : r)) });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#ecc588]">Custom orders</h1>

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
            {f ? CUSTOM_STATUS_LABELS[f] : 'All'}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!isLoading && data && data.requests.length === 0 && (
        <p className="glass-card rounded-xl p-10 text-sm text-[#8ba5a0] text-center">No custom requests here.</p>
      )}

      {!isLoading && data && data.requests.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.requests.map((request) => (
              <RequestRow key={request.id} request={request} onUpdated={handleUpdated} />
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
