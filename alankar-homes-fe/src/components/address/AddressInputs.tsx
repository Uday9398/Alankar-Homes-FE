import React from 'react';
import { MapPin } from 'lucide-react';
import type { AddressFields } from '../../features/shop/shopTypes';
import { Input } from '../common/Input';
import { labelIcon } from './addressUtils';
import type { AddressErrors } from './addressUtils';

// The six delivery inputs, used by checkout, custom requests and the address book
export const AddressInputs: React.FC<{
  value: AddressFields;
  errors: AddressErrors;
  onChange: (name: keyof AddressFields, value: string) => void;
}> = ({ value, errors, onChange }) => {
  const field = (name: keyof AddressFields) => ({
    name,
    value: value[name],
    error: errors[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(name, e.target.value),
  });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Input label="Full name" placeholder="Aditi Sharma" autoComplete="name" {...field('shippingName')} />
        <Input label="Phone" type="tel" placeholder="9876543210" autoComplete="tel" {...field('shippingPhone')} />
      </div>
      <Input label="Address" placeholder="House no, street, area, landmark" autoComplete="street-address" {...field('shippingAddress')} />
      <div className="grid sm:grid-cols-3 gap-5">
        <Input label="City" placeholder="Hyderabad" autoComplete="address-level2" {...field('shippingCity')} />
        <Input label="State" placeholder="Telangana" autoComplete="address-level1" {...field('shippingState')} />
        <Input label="Pincode" inputMode="numeric" maxLength={6} placeholder="500001" autoComplete="postal-code" {...field('shippingPincode')} />
      </div>
    </div>
  );
};

const PRESETS = ['Home', 'Work'];

// Home / Work / Other chips; "Other" lets the customer type their own name
export const AddressLabelPicker: React.FC<{ value: string; onChange: (label: string) => void; error?: string }> = ({
  value,
  onChange,
  error,
}) => {
  const isCustom = !PRESETS.includes(value);
  const chip = (active: boolean) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
      active ? 'bg-gold-gradient text-stone-950 border-transparent' : 'border-[#0e3f38] text-[#8ba5a0] hover:text-[#ecc588]'
    }`;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">Save as</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const Icon = labelIcon(preset);
          return (
            <button key={preset} type="button" onClick={() => onChange(preset)} className={chip(value === preset)}>
              <Icon className="w-3.5 h-3.5" /> {preset}
            </button>
          );
        })}
        <button type="button" onClick={() => isCustom || onChange('')} className={chip(isCustom)}>
          <MapPin className="w-3.5 h-3.5" /> Other
        </button>
      </div>
      {isCustom && (
        <Input
          placeholder="e.g. Mom's place, Office 2"
          maxLength={30}
          value={value}
          error={error}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};
