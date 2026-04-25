import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useCompanyProfile } from '../hooks/useCompanyProfile';
import { AxiosError } from 'axios';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LoginPage = () => {
  const { login } = useAuth();
  const { profile } = useCompanyProfile();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg =
        axiosErr?.response?.data?.message ||
        'Invalid username or password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div>
        {profile?.logoUrl ? (
          <img
            src={profile.logoUrl}
            alt="Company Logo"
            className="mb-6 h-12 w-auto object-contain"
          />
        ) : null}
        <h2 className="text-3xl font-semibold text-white">
          {profile?.companyTitle ? `Welcome to ${profile.companyTitle}` : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-sm text-steel-300">
          Enter your credentials to access the QMS dashboard.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Username */}
        <div>
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              className="input pr-12"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-steel-400 transition hover:text-accent-400 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-steel-400 transition hover:text-accent-400"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-steel-400">
        Need to update your password?{' '}
        <Link to="/change-password" className="text-accent-400 transition hover:text-accent-300">
          Change password
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
