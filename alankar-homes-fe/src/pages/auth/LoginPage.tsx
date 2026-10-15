import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginThunk, clearAuthError } from '../../features/auth/authSlice';
import { Logo } from '../../components/common/Logo';
import { ROUTES } from '../../utils/constants';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);
  // Where to go after signing in, e.g. back to checkout
  const from = (location.state as { from?: string } | null)?.from || ROUTES.HOME;

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleLoginSubmit = (data: { email: string; password: string }) => {
    dispatch(loginThunk(data));
  };

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="bg-radial-teal min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 text-center animate-fadeIn select-none">
      <div className="w-full max-w-[440px] space-y-8 flex flex-col items-center">
        {/* Emblem Logo */}
        <div className="space-y-4 flex flex-col items-center">
          <Link to={ROUTES.HOME} aria-label="Alankar Homes home">
            <Logo />
          </Link>
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold tracking-[0.25em] text-[#8ba5a0] uppercase">
              ALANKAR HOMES
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-[#ecc588] font-medium tracking-wide">
              Welcome back
            </h1>
            <p className="text-xs text-[#8ba5a0]/75 font-light max-w-[280px] mx-auto leading-relaxed">
              Sign in to continue your journey through our handcrafted collection.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-2xl w-full p-7 md:p-9 space-y-6">
          {error && (
            <div className="text-red-400 text-xs font-semibold bg-red-950/45 border border-red-900/60 p-3.5 rounded-lg text-left animate-fadeIn">
              {error}
            </div>
          )}
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
        </div>

        {/* Footer Navigation */}
        <p className="text-xs text-[#8ba5a0]/85">
          New to Alankar Homes?{' '}
          <Link
            to={ROUTES.REGISTER}
            state={location.state}
            className="text-[#caa060] hover:text-[#ecc588] transition-colors font-semibold cursor-pointer border-b border-[#caa060]/20 hover:border-[#ecc588] pb-0.5 ml-1"
          >
            Create an account
          </Link>
        </p>
        <Link to={ROUTES.PRODUCTS} className="text-xs text-[#8ba5a0]/70 hover:text-[#ecc588]">
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
};
