import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerThunk, clearAuthError, clearAuthSuccess } from '../../features/auth/authSlice';
import { Logo } from '../../components/common/Logo';
import { ROUTES } from '../../utils/constants';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, successMessage } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate(ROUTES.LOGIN, { state: location.state });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate, location.state]);

  const handleRegisterSubmit = (data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => {
    dispatch(registerThunk(data));
  };

  return (
    <div className="bg-radial-teal min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 text-center animate-fadeIn select-none">
      <div className="w-full max-w-[480px] space-y-8 flex flex-col items-center py-6">
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
              Join the house
            </h1>
            <p className="text-xs text-[#8ba5a0]/75 font-light max-w-[340px] mx-auto leading-relaxed">
              Create an account for faster checkout, saved wishlists and early access to new arrivals.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-2xl w-full p-7 md:p-9 space-y-6">
          {successMessage && (
            <div className="text-emerald-400 text-xs font-semibold bg-emerald-950/45 border border-emerald-900/60 p-3.5 rounded-lg text-left animate-fadeIn">
              {successMessage} Redirecting to login...
            </div>
          )}
          {error && !successMessage && (
            <div className="text-red-400 text-xs font-semibold bg-red-950/45 border border-red-900/60 p-3.5 rounded-lg text-left animate-fadeIn">
              {error}
            </div>
          )}
          <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} />
        </div>

        {/* Footer Navigation */}
        <p className="text-xs text-[#8ba5a0]/85">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            state={location.state}
            className="text-[#caa060] hover:text-[#ecc588] transition-colors font-semibold cursor-pointer border-b border-[#caa060]/20 hover:border-[#ecc588] pb-0.5 ml-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
