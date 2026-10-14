import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Hammer, IndianRupee, MessageSquareText, Sparkles } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { useAsync } from '../../hooks/useAsync';
import { fetchMyCustomRequests } from '../../features/shop/shopService';
import { CustomStatusBadge, ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

const STEPS = [
  { icon: MessageSquareText, title: 'Tell us your idea', text: 'Describe the piece and add photos of anything that inspires you.' },
  { icon: IndianRupee, title: 'We share a price', text: "We'll review your request and send you a price, usually within a day or two." },
  { icon: Hammer, title: 'We make & deliver it', text: 'Once you accept, we craft it by hand and deliver it to your door. Pay on delivery.' },
];

const MyRequests: React.FC = () => {
  const { data: requests, isLoading, error, reload } = useAsync(fetchMyCustomRequests, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (!requests || requests.length === 0) {
    return <p className="glass-card rounded-xl p-8 text-sm text-[#8ba5a0] text-center">You haven't sent any custom requests yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {requests.map((request) => (
        <li key={request.id}>
          <Link
            to={`${ROUTES.CUSTOM_ORDERS}/${request.id}`}
            className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-[#caa060]/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
              <ProductImage src={request.images[0]} alt={request.title} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-stone-100 font-medium truncate">{request.title}</span>
                <CustomStatusBadge status={request.status} />
              </div>
              <p className="text-xs text-[#8ba5a0]">
                Request #{request.id} · {formatDate(request.createdAt)} · Qty {request.quantity}
                {request.quotedPrice !== null && ` · ${formatCurrency(request.quotedPrice)}`}
              </p>
              {request.status === 'quoted' && (
                <p className="text-xs text-[#ecc588] font-semibold">Your price is ready, tap to review it</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export const CustomOrdersPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-10">
      <section className="text-center space-y-4">
        <p className="text-[10px] font-bold tracking-[0.3em] text-[#8ba5a0] uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Made just for you
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-[#ecc588]">Custom orders</h1>
        <p className="text-sm text-[#8ba5a0] max-w-xl mx-auto leading-relaxed">
          Have something special in mind? A name plate, a personalised gift, or a piece in your own colours?
          Share your idea and we'll handcraft it for you.
        </p>
        <Link
          to={ROUTES.NEW_CUSTOM_ORDER}
          className="inline-flex items-center gap-2 py-3.5 px-7 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm hover:shadow-lg transition-all"
        >
          Start a custom request <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className="glass-card rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#caa060]">
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Step {index + 1}</span>
            </div>
            <p className="text-sm text-stone-100 font-medium">{title}</p>
            <p className="text-xs text-[#8ba5a0] leading-relaxed">{text}</p>
          </div>
        ))}
      </section>

      {user && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-[#ecc588]">Your requests</h2>
          <MyRequests />
        </section>
      )}
    </div>
  );
};
