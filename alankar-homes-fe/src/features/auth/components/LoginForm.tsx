import React, { useState } from 'react';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

interface LoginFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      onSubmit({ email, password, rememberMe });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Centered subtle gold horizontal accent bar */}
      <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#caa060] to-transparent mx-auto opacity-50 mb-2"></div>

      <div className="space-y-5">
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
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-stone-400 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-stone-700 bg-stone-900/60 text-amber-700 accent-amber-600 focus:ring-0 focus:ring-offset-0"
          />
          <span>Remember me</span>
        </label>
        <a
          href="#forgot"
          onClick={(e) => e.preventDefault()}
          className="text-[#caa060] hover:text-[#ecc588] transition-colors font-medium"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" isLoading={isLoading} className="mt-2">
        Sign In
      </Button>
    </form>
  );
};
