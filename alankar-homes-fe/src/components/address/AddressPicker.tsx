import React, { useEffect } from 'react';
import { Check, Plus } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { fetchAddresses } from '../../features/shop/shopService';
import type { Address } from '../../features/shop/shopTypes';
import { AddressLabelPicker } from './AddressInputs';
import { labelIcon } from './addressUtils';

interface PickerProps {
  // undefined until the saved addresses have loaded, null for "a new address"
  selectedId: number | null | undefined;
  onSelect: (address: Address | null) => void;
}

// Lets the customer pick one of their saved addresses, or choose to type a new one
export const AddressPicker: React.FC<PickerProps> = ({ selectedId, onSelect }) => {
  const { data: addresses, isLoading, error } = useAsync(fetchAddresses, []);

  // Start on the default address, or on a blank form if nothing is saved (or loading failed)
  useEffect(() => {
    if (selectedId !== undefined || isLoading) return;
    onSelect(addresses?.find((a) => a.isDefault) ?? addresses?.[0] ?? null);
  }, [addresses, isLoading, error, selectedId, onSelect]);

  if (isLoading) {
    return <p className="text-xs text-[#8ba5a0]">Loading your saved addresses...</p>;
  }
  if (!addresses || addresses.length === 0) return null;

  const card = (active: boolean) =>
    `relative text-left rounded-xl p-4 border transition-colors cursor-pointer ${
      active ? 'border-[#caa060]/70 bg-[#caa060]/5' : 'border-[#0e3f38] hover:border-[#caa060]/40'
    }`;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {addresses.map((address) => {
        const Icon = labelIcon(address.label);
        const active = selectedId === address.id;
        return (
          <button key={address.id} type="button" onClick={() => onSelect(address)} className={card(active)}>
            {active && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-gradient flex items-center justify-center">
                <Check className="w-3 h-3 text-stone-950" />
              </span>
            )}
            <span className="flex items-center gap-2 text-sm text-stone-100 font-semibold">
              <Icon className="w-4 h-4 text-[#caa060]" /> {address.label}
              {address.isDefault && <span className="text-[9px] font-bold uppercase tracking-wider text-[#8ba5a0]">Default</span>}
            </span>
            <span className="block text-xs text-stone-300 mt-2">{address.shippingName} · {address.shippingPhone}</span>
            <span className="block text-xs text-[#8ba5a0] mt-0.5 line-clamp-2">
              {address.shippingAddress}, {address.shippingCity}, {address.shippingState} – {address.shippingPincode}
            </span>
          </button>
        );
      })}
      <button type="button" onClick={() => onSelect(null)} className={`${card(selectedId === null)} flex items-center justify-center gap-2 text-xs font-semibold text-[#8ba5a0] min-h-24`}>
        <Plus className="w-4 h-4" /> Deliver to a new address
      </button>
    </div>
  );
};

// Shown under the new-address inputs: "Save this address" + Home / Work / Other
export const SaveAddressOption: React.FC<{
  save: boolean;
  onSaveChange: (save: boolean) => void;
  label: string;
  onLabelChange: (label: string) => void;
}> = ({ save, onSaveChange, label, onLabelChange }) => (
  <div className="space-y-4">
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={save} onChange={(e) => onSaveChange(e.target.checked)} className="w-4 h-4 accent-amber-600" />
      <span className="text-sm text-stone-200">Save this address to my profile</span>
    </label>
    {save && <AddressLabelPicker value={label} onChange={onLabelChange} />}
  </div>
);
