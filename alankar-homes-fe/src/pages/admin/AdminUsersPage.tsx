import React, { useCallback, useEffect, useState } from 'react';
import { Check, Mail, Phone, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useAppSelector } from '../../app/hooks';
import { adminFetchUsers, updateUserRole } from '../../features/shop/shopService';
import type { AdminUser, UserRole } from '../../features/shop/shopTypes';
import { ErrorMessage, Spinner, SuccessMessage } from '../../components/common/Feedback';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';

const ADMIN_POWERS = [
  'Add, edit and delete products and photos',
  'See and update every customer order',
  'Manage categories',
  'Give or remove admin access for others',
];

const FILTERS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'customer', label: 'Customers' },
  { value: 'admin', label: 'Admins' },
];

export const AdminUsersPage: React.FC = () => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{ user: AdminUser; role: UserRole } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hide the message after 3 seconds; a newer message restarts the timer
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const { data, isLoading, error, reload } = useAsync(
    () => adminFetchUsers({ search: search.trim() || undefined, role, page }),
    [search, role, page]
  );

  const askToChangeRole = (user: AdminUser, newRole: UserRole) => {
    setDialogError(null);
    setPending({ user, role: newRole });
  };

  const closeDialog = useCallback(() => setPending(null), []);

  const confirmRoleChange = async () => {
    if (!pending) return;
    setIsSaving(true);
    setDialogError(null);
    setNotice(null);
    try {
      const result = await updateUserRole(pending.user.id, pending.role);
      setPending(null);
      setNotice({ type: 'success', text: result.message });
      // Reload so the counts at the top stay correct
      reload();
    } catch (err) {
      // Keep the popup open so the reason shows right where they clicked
      setDialogError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const makingAdmin = pending?.role === 'admin';

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#ecc588]">Users</h1>

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Registered users', value: data.summary.totalUsers },
            { label: 'Customers', value: data.summary.customers },
            { label: 'Admins', value: data.summary.admins },
            { label: 'Joined this month', value: data.summary.newThisMonth },
          ].map((tile) => (
            <div key={tile.label} className="glass-card rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">{tile.label}</p>
              <p className="text-2xl md:text-3xl text-[#ecc588] font-semibold mt-2">{tile.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or phone..."
            className="input-field pl-11 pr-4 py-3 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setRole(f.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                role === f.value
                  ? 'bg-gold-gradient text-stone-950 border-transparent'
                  : 'border-[#0e3f38] text-[#8ba5a0] hover:text-[#ecc588]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (notice.type === 'success' ? <SuccessMessage message={notice.text} /> : <ErrorMessage message={notice.text} />)}
      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!isLoading && data && data.users.length === 0 && (
        <p className="glass-card rounded-xl p-10 text-sm text-[#8ba5a0] text-center">No users found.</p>
      )}

      {!isLoading && data && data.users.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.users.map((user) => {
              const isMe = user.id === currentUserId;
              const isAdmin = user.role === 'admin';
              return (
                <li key={user.id} className="glass-card rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#0a2f29] border border-[#0e3f38] flex items-center justify-center text-[#ecc588] font-semibold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-stone-100 font-medium">{user.name}</span>
                        {isAdmin && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold-gradient text-stone-950">
                            Admin
                          </span>
                        )}
                        {isMe && <span className="text-[10px] text-[#8ba5a0]">(you)</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8ba5a0]">
                        <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1 hover:text-[#ecc588] break-all">
                          <Mail className="w-3 h-3 shrink-0" /> {user.email}
                        </a>
                        <a href={`tel:${user.phone}`} className="inline-flex items-center gap-1 hover:text-[#ecc588]">
                          <Phone className="w-3 h-3" /> {user.phone}
                        </a>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Joined {formatDate(user.createdAt)} · {user.orderCount} {user.orderCount === 1 ? 'order' : 'orders'}
                        {user.totalSpent > 0 && ` · spent ${formatCurrency(user.totalSpent)}`}
                      </p>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => askToChangeRole(user, isAdmin ? 'customer' : 'admin')}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer md:shrink-0 ${
                        isAdmin
                          ? 'border border-red-900/70 text-red-400 hover:bg-red-950/40'
                          : 'border border-[#caa060]/60 text-[#ecc588] hover:bg-[#caa060]/10'
                      }`}
                    >
                      {isAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      {isAdmin ? 'Remove admin' : 'Make admin'}
                    </button>
                  )}
                </li>
              );
            })}
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

      <ConfirmDialog
        open={pending !== null}
        tone={makingAdmin ? 'gold' : 'danger'}
        icon={makingAdmin ? <ShieldCheck className="w-7 h-7" strokeWidth={1.5} /> : <ShieldOff className="w-7 h-7" strokeWidth={1.5} />}
        title={makingAdmin ? 'Make this person an admin?' : 'Remove admin access?'}
        confirmLabel={isSaving ? 'Saving...' : makingAdmin ? 'Yes, make admin' : 'Yes, remove access'}
        cancelLabel="Not now"
        isLoading={isSaving}
        error={dialogError}
        onConfirm={confirmRoleChange}
        onCancel={closeDialog}
      >
        {pending && (
          <div className="space-y-5">
            {/* Who this is about */}
            <div className="flex items-center gap-3 rounded-xl border border-[#0e3f38] bg-[#000f0d]/60 p-3 text-left">
              <div className="w-10 h-10 rounded-full bg-gold-gradient text-stone-950 font-semibold flex items-center justify-center shrink-0">
                {pending.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-stone-100 font-medium truncate">{pending.user.name}</p>
                <p className="text-xs text-[#8ba5a0] truncate">{pending.user.email}</p>
              </div>
            </div>

            {makingAdmin ? (
              <div className="text-left space-y-2.5">
                <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">They will be able to</p>
                <ul className="space-y-2">
                  {ADMIN_POWERS.map((power) => (
                    <li key={power} className="flex items-start gap-2.5 text-sm text-stone-300">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-[#caa060]/15 text-[#ecc588] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                      {power}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-stone-500 pt-1">Only give this to people you trust.</p>
              </div>
            ) : (
              <p className="text-sm">
                They'll become a regular customer and lose access to the admin panel straight away. You can make them an admin again any time.
              </p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};
