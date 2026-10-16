import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, IndianRupee, KeyRound, LogOut, MapPin, Package, Pencil, Sparkles, UserRound } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { logoutThunk, setUser } from '../../features/auth/authSlice';
import { useAsync } from '../../hooks/useAsync';
import { changePassword, fetchProfile, updateProfile } from '../../features/shop/shopService';
import type { Profile } from '../../features/shop/shopTypes';
import { CustomStatusBadge, ErrorMessage, Spinner, StatusBadge } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AddressBook } from '../../components/address/AddressBook';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { useToast } from '../../hooks/useFeedback';
import { ROUTES } from '../../utils/constants';

const labelClass = 'text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase';

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-[#0e3f38]/60 last:border-0">
    <dt className="text-xs text-[#8ba5a0] sm:w-36 shrink-0">{label}</dt>
    <dd className="text-sm text-stone-100 break-all">{value}</dd>
  </div>
);

const PersonalDetails: React.FC<{ user: Profile['user']; onSaved: (user: Profile['user']) => void }> = ({ user, onSaved }) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, phone: user.phone });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const startEditing = () => {
    setForm({ name: user.name, phone: user.phone });
    setErrors({});
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) newErrors.phone = 'Please enter a valid phone number';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      const result = await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      onSaved(result.data);
      // Keeps the header greeting and checkout prefill in step with the new details
      dispatch(setUser({ id: result.data.id, name: result.data.name, email: result.data.email, phone: result.data.phone, role: result.data.role }));
      toast.success(result.message);
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="glass-card rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className={`${labelClass} flex items-center gap-2`}><UserRound className="w-4 h-4" /> Personal details</h2>
        {!editing && (
          <button onClick={startEditing} className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588] flex items-center gap-1.5 cursor-pointer">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <Input label="Full name" value={form.name} error={errors.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <Input label="Phone" type="tel" value={form.phone} error={errors.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          <Input label="Email" value={user.email} disabled className="opacity-60 cursor-not-allowed" />
          <p className="text-[11px] text-stone-500 -mt-2">Your email is your sign-in, so it can't be changed here.</p>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSaving} className="sm:w-auto sm:px-8">Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)} className="sm:w-auto sm:px-8">Cancel</Button>
          </div>
        </form>
      ) : (
        <dl>
          <DetailRow label="Full name" value={user.name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow label="Account type" value={user.role === 'admin' ? 'Shop admin' : 'Customer'} />
          <DetailRow label="Member since" value={formatDate(user.createdAt)} />
        </dl>
      )}
    </section>
  );
};

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

const ChangePassword: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_PASSWORDS>>({});
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const field = (name: keyof typeof EMPTY_PASSWORDS) => ({
    type: 'password',
    value: form[name],
    error: errors[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!form.currentPassword) newErrors.currentPassword = 'Please enter your current password';
    if (form.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.newPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      const result = await changePassword(form);
      toast.success(result.message);
      setForm(EMPTY_PASSWORDS);
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="glass-card rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className={`${labelClass} flex items-center gap-2`}><KeyRound className="w-4 h-4" /> Password</h2>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588] cursor-pointer"
          >
            Change password
          </button>
        )}
      </div>
      {open ? (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Input label="Current password" autoComplete="current-password" {...field('currentPassword')} />
          <Input label="New password" autoComplete="new-password" placeholder="At least 8 characters" {...field('newPassword')} />
          <Input label="Confirm new password" autoComplete="new-password" {...field('confirmPassword')} />
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSaving} className="sm:w-auto sm:px-8">Update password</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setForm(EMPTY_PASSWORDS);
                setErrors({});
              }}
              className="sm:w-auto sm:px-8"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-stone-400">••••••••</p>
      )}
    </section>
  );
};

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: profile, setData, isLoading, error, reload } = useAsync(fetchProfile, []);

  if (isLoading) return <Spinner />;
  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14">
        <ErrorMessage message={error || 'Could not load your profile'} onRetry={reload} />
      </div>
    );
  }

  const { user, stats, lastAddress, recentOrders, recentCustomRequests } = profile;

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate(ROUTES.HOME);
  };

  const STATS = [
    { label: 'Orders', value: stats.orderCount, icon: Package, to: ROUTES.ORDERS },
    { label: 'Total spent', value: formatCurrency(stats.totalSpent), icon: IndianRupee, to: ROUTES.ORDERS },
    { label: 'Custom requests', value: stats.customRequestCount, icon: Sparkles, to: ROUTES.CUSTOM_ORDERS },
    { label: 'Wishlist', value: stats.wishlistCount, icon: Heart, to: ROUTES.WISHLIST },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-2xl font-serif text-stone-950 shrink-0">
          {user.name.trim().charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl md:text-3xl text-[#ecc588] truncate">{user.name}</h1>
          <p className="text-xs text-[#8ba5a0] mt-1">{user.email} · Member since {formatDate(user.createdAt)}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#8ba5a0] hover:text-[#ecc588] flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="glass-card rounded-xl p-4 hover:border-[#caa060]/50 transition-colors">
            <Icon className="w-4 h-4 text-[#caa060]" />
            <p className="text-xl text-stone-100 font-semibold mt-2">{value}</p>
            <p className="text-[11px] text-[#8ba5a0]">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <PersonalDetails user={user} onSaved={(updated) => setData((prev) => prev && { ...prev, user: updated })} />
          <ChangePassword />
        </div>

        <div className="space-y-6">
          <section className="glass-card rounded-xl p-6 space-y-4">
            <h2 className={`${labelClass} flex items-center gap-2`}><MapPin className="w-4 h-4" /> Saved addresses</h2>
            <AddressBook suggestion={lastAddress} />
          </section>

          <section className="glass-card rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={`${labelClass} flex items-center gap-2`}><Package className="w-4 h-4" /> Recent orders</h2>
              {stats.orderCount > 0 && <Link to={ROUTES.ORDERS} className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588]">View all</Link>}
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-stone-400">
                No orders yet. <Link to={ROUTES.PRODUCTS} className="text-[#caa060] hover:text-[#ecc588]">Start shopping</Link>
              </p>
            ) : (
              <ul className="divide-y divide-[#0e3f38]/60">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link to={`${ROUTES.ORDERS}/${order.id}`} className="flex items-center gap-3 py-3 group">
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                        <ProductImage src={order.items?.[0]?.productImage} alt={`Order #${order.id}`} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-100 group-hover:text-[#ecc588]">Order #{order.id}</p>
                        <p className="text-xs text-[#8ba5a0]">{formatDate(order.createdAt)} · {formatCurrency(order.totalAmount)}</p>
                      </div>
                      <StatusBadge status={order.status} />
                      <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-card rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={`${labelClass} flex items-center gap-2`}><Sparkles className="w-4 h-4" /> Custom requests</h2>
              {stats.customRequestCount > 0 && <Link to={ROUTES.CUSTOM_ORDERS} className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588]">View all</Link>}
            </div>
            {recentCustomRequests.length === 0 ? (
              <p className="text-sm text-stone-400">
                Want something made just for you? <Link to={ROUTES.NEW_CUSTOM_ORDER} className="text-[#caa060] hover:text-[#ecc588]">Send a request</Link>
              </p>
            ) : (
              <ul className="divide-y divide-[#0e3f38]/60">
                {recentCustomRequests.map((request) => (
                  <li key={request.id}>
                    <Link to={`${ROUTES.CUSTOM_ORDERS}/${request.id}`} className="flex items-center gap-3 py-3 group">
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                        <ProductImage src={request.images[0]} alt={request.title} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-100 group-hover:text-[#ecc588] truncate">{request.title}</p>
                        <p className="text-xs text-[#8ba5a0]">{formatDate(request.createdAt)}</p>
                      </div>
                      <CustomStatusBadge status={request.status} />
                      <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
