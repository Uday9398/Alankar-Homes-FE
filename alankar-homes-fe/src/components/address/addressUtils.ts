import { Briefcase, Home, MapPin } from 'lucide-react';
import type { AddressFields } from '../../features/shop/shopTypes';

export type AddressErrors = Partial<Record<keyof AddressFields, string>>;

export const emptyAddress = (name = '', phone = ''): AddressFields => ({
  shippingName: name,
  shippingPhone: phone,
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingPincode: '',
});

// Copies just the delivery fields, e.g. from a saved address onto an order form
export const pickAddress = (source: AddressFields): AddressFields => ({
  shippingName: source.shippingName,
  shippingPhone: source.shippingPhone,
  shippingAddress: source.shippingAddress,
  shippingCity: source.shippingCity,
  shippingState: source.shippingState,
  shippingPincode: source.shippingPincode,
});

export const trimAddress = (form: AddressFields): AddressFields => ({
  shippingName: form.shippingName.trim(),
  shippingPhone: form.shippingPhone.trim(),
  shippingAddress: form.shippingAddress.trim(),
  shippingCity: form.shippingCity.trim(),
  shippingState: form.shippingState.trim(),
  shippingPincode: form.shippingPincode.trim(),
});

// Same rules as the backend's shipping fields
export const validateAddress = (form: AddressFields): AddressErrors => {
  const errors: AddressErrors = {};
  if (form.shippingName.trim().length < 2) errors.shippingName = 'Please enter the full name';
  if (!/^[0-9+\-\s]{10,15}$/.test(form.shippingPhone.trim())) errors.shippingPhone = 'Please enter a valid phone number';
  if (form.shippingAddress.trim().length < 5) errors.shippingAddress = 'Please enter the full address';
  if (form.shippingCity.trim().length < 2) errors.shippingCity = 'City is required';
  if (form.shippingState.trim().length < 2) errors.shippingState = 'State is required';
  if (!/^[0-9]{6}$/.test(form.shippingPincode.trim())) errors.shippingPincode = 'Pincode must be 6 digits';
  return errors;
};

export const labelIcon = (label: string) => {
  if (label.toLowerCase() === 'home') return Home;
  if (label.toLowerCase() === 'work') return Briefcase;
  return MapPin;
};
