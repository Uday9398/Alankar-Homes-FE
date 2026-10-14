import React, { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { useAsync } from '../../hooks/useAsync';
import { createAddress, deleteAddress, fetchAddresses, setDefaultAddress, updateAddress } from '../../features/shop/shopService';
import type { Address, AddressFields } from '../../features/shop/shopTypes';
import { ErrorMessage, Spinner } from '../common/Feedback';
import { Button } from '../common/Button';
import { AddressInputs, AddressLabelPicker } from './AddressInputs';
import { emptyAddress, labelIcon, pickAddress, trimAddress, validateAddress } from './addressUtils';
import type { AddressErrors } from './addressUtils';
import { getErrorMessage } from '../../utils/helpers';

const MAX_ADDRESSES = 10;

interface FormProps {
  initial?: Address;
  prefill?: AddressFields;
  isFirst: boolean;
  onSaved: () => void;
  onCancel: () => void;
}

const AddressForm: React.FC<FormProps> = ({ initial, prefill, isFirst, onSaved, onCancel }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [label, setLabel] = useState(initial?.label ?? 'Home');
  const [fields, setFields] = useState<AddressFields>(
    initial ? pickAddress(initial) : prefill ?? emptyAddress(user?.name, user?.phone)
  );
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? isFirst);
  const [errors, setErrors] = useState<AddressErrors & { label?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = validateAddress(fields);
    if (!label.trim()) newErrors.label = 'Please give this address a name';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    setError(null);
    try {
      const payload = { label: label.trim(), ...trimAddress(fields), isDefault };
      if (initial) {
        await updateAddress(initial.id, payload);
      } else {
        await createAddress(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-field rounded-xl p-5 space-y-5">
      <p className="text-sm text-stone-100 font-medium">{initial ? `Edit "${initial.label}"` : 'New address'}</p>
      <AddressLabelPicker value={label} error={errors.label} onChange={(value) => {
        setLabel(value);
        if (errors.label) setErrors((prev) => ({ ...prev, label: '' }));
      }} />
      <AddressInputs
        value={fields}
        errors={errors}
        onChange={(name, value) => {
          setFields((prev) => ({ ...prev, [name]: value }));
          if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        }}
      />
      {!initial?.isDefault && !isFirst && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 accent-amber-600" />
          <span className="text-sm text-stone-200">Use as my default address</span>
        </label>
      )}
      {error && <ErrorMessage message={error} />}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSaving} className="sm:w-auto sm:px-8">Save address</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="sm:w-auto sm:px-8">Cancel</Button>
      </div>
    </form>
  );
};

// Shown on the profile page. `suggestion` is the address from the last order, offered when nothing is saved yet.
export const AddressBook: React.FC<{ suggestion?: AddressFields | null }> = ({ suggestion }) => {
  const { data: addresses, isLoading, error, reload } = useAsync(fetchAddresses, []);
  // null = list view, 'new' = adding, a number = editing that address
  const [editing, setEditing] = useState<'new' | number | null>(null);
  const [prefill, setPrefill] = useState<AddressFields | undefined>();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <Spinner label="Loading addresses..." />;
  if (error || !addresses) return <ErrorMessage message={error || 'Could not load addresses'} onRetry={reload} />;

  const closeForm = () => {
    setEditing(null);
    setPrefill(undefined);
  };

  const run = async (id: number, action: () => Promise<unknown>) => {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (address: Address) => {
    if (window.confirm(`Delete the "${address.label}" address?`)) run(address.id, () => deleteAddress(address.id));
  };

  if (editing !== null) {
    return (
      <AddressForm
        initial={typeof editing === 'number' ? addresses.find((a) => a.id === editing) : undefined}
        prefill={prefill}
        isFirst={addresses.length === 0}
        onSaved={() => {
          closeForm();
          reload();
        }}
        onCancel={closeForm}
      />
    );
  }

  return (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-stone-400">You haven't saved any addresses yet.</p>
          {suggestion && (
            <div className="input-field rounded-xl p-4 text-sm text-stone-300 space-y-2">
              <p className="text-xs text-[#8ba5a0]">From your last order:</p>
              <p>{suggestion.shippingName} · {suggestion.shippingAddress}, {suggestion.shippingCity} – {suggestion.shippingPincode}</p>
              <button
                onClick={() => {
                  setPrefill(pickAddress(suggestion));
                  setEditing('new');
                }}
                className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588] cursor-pointer"
              >
                Save this address
              </button>
            </div>
          )}
        </div>
      )}

      {addresses.map((address) => {
        const Icon = labelIcon(address.label);
        return (
          <div
            key={address.id}
            className={`rounded-xl p-4 border space-y-2 ${address.isDefault ? 'border-[#caa060]/60 bg-[#caa060]/5' : 'border-[#0e3f38]'}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#caa060]" />
              <span className="text-sm text-stone-100 font-semibold">{address.label}</span>
              {address.isDefault && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-gold-gradient text-stone-950 px-2 py-0.5 rounded-full">Default</span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setEditing(address.id)}
                  title="Edit address"
                  className="p-1.5 text-[#8ba5a0] hover:text-[#ecc588] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(address)}
                  disabled={busyId === address.id}
                  title="Delete address"
                  className="p-1.5 text-[#8ba5a0] hover:text-red-400 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-sm text-stone-300 space-y-0.5">
              <p className="text-stone-100">{address.shippingName} · {address.shippingPhone}</p>
              <p>{address.shippingAddress}</p>
              <p>{address.shippingCity}, {address.shippingState} – {address.shippingPincode}</p>
            </div>
            {!address.isDefault && (
              <button
                onClick={() => run(address.id, () => setDefaultAddress(address.id))}
                disabled={busyId === address.id}
                className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588] cursor-pointer disabled:opacity-50"
              >
                Set as default
              </button>
            )}
          </div>
        );
      })}

      {actionError && <ErrorMessage message={actionError} />}

      {addresses.length < MAX_ADDRESSES ? (
        <button
          onClick={() => setEditing('new')}
          className="w-full rounded-xl border-2 border-dashed border-[#0e3f38] hover:border-[#caa060]/60 py-3 text-xs font-semibold text-[#8ba5a0] hover:text-[#ecc588] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add a new address
        </button>
      ) : (
        <p className="text-xs text-stone-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> You've saved the maximum of {MAX_ADDRESSES} addresses.
        </p>
      )}
    </div>
  );
};
