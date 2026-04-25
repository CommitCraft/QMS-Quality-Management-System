import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
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

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

const PasswordField = ({ id, label, value, onChange, placeholder, disabled, autoComplete }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="input pr-12"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-steel-400 transition hover:text-accent-400 focus:outline-none"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
};

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      toast.success(response.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg =
        axiosErr?.response?.data?.message ||
        'Unable to change password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-white">Change Password</h2>
        <p className="mt-2 text-sm text-steel-300">
          Update your account password. Choose a strong password.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <PasswordField
          id="current-password"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Enter current password"
          disabled={loading}
          autoComplete="current-password"
        />

        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password (min. 6 characters)"
          disabled={loading}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter new password"
          disabled={loading}
          autoComplete="new-password"
        />

        <button
          className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
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
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>

      {/* Back link */}
      <p className="text-center text-sm text-steel-400">
        <Link to="/login" className="text-accent-400 transition hover:text-accent-300">
          ← Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ChangePasswordPage;
