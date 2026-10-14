import React, { useState } from 'react';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

interface RegisterFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10 || phone.length > 15) {
      newErrors.phone = 'Phone must be between 10 and 15 digits';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agree) {
      newErrors.agree = 'You must agree to the Terms of Service';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      onSubmit({ name, email, phone, password, confirmPassword });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Centered subtle gold horizontal accent bar */}
      <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#caa060] to-transparent mx-auto opacity-50 mb-2"></div>

      <Input
        label="Name"
        type="text"
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
        }}
        error={errors.name}
        placeholder="Aditi Sharma"
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
        }}
        error={errors.email}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Phone"
        type="tel"
        name="phone"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
        }}
        error={errors.phone}
        placeholder="9876543210"
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
        }}
        error={errors.password}
        placeholder="........"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }}
        error={errors.confirmPassword}
        placeholder="........"
        required
      />

      <div className="space-y-1">
        <label className="flex items-start gap-2.5 text-xs text-stone-400 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              if (errors.agree) setErrors((prev) => ({ ...prev, agree: '' }));
            }}
            className="w-4 h-4 rounded border-stone-700 bg-stone-900/60 text-amber-700 accent-amber-600 focus:ring-0 focus:ring-offset-0 mt-0.5"
          />
          <span className="leading-relaxed text-left">
            I agree to the{' '}
            <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#caa060] hover:text-[#ecc588] transition-colors font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#caa060] hover:text-[#ecc588] transition-colors font-medium">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.agree && <span className="text-[11px] text-red-400 block mt-1 text-left">{errors.agree}</span>}
      </div>

      <Button type="submit" isLoading={isLoading} className="mt-2" disabled={!agree || isLoading}>
        Create Account
      </Button>
    </form>
  );
};
