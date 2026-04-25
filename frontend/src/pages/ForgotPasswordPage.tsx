import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('admin@qms.local');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.message || 'Reset token created');
    } catch {
      toast.error('Unable to generate reset token');
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-steel-950/90 p-8 shadow-panel">
      <h2 className="text-3xl font-semibold text-white">Forgot Password</h2>
      <p className="mt-2 text-sm text-steel-300">Generate a password reset token for the selected email.</p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="label">Email</span>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <button className="btn-primary w-full" type="submit">Generate Token</button>
      </form>
      <Link className="mt-6 inline-block text-sm text-steel-300 hover:text-white" to="/login">Back to login</Link>
    </div>
  );
};

export default ForgotPasswordPage;
