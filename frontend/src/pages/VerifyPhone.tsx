import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyPhone = () => {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Automatically redirect if already verified
  if (user?.is_phone_verified) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/request-otp', { phone_number: phoneNumber });
      setStep('VERIFY');
      setSuccess('OTP sent successfully! Check your phone.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { phone_number: phoneNumber, otp });
      // Fetch updated user to get verification status
      const res = await api.get('/auth/me');
      if (token) {
          login(token, res.data);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl animate-fade-in">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 flex items-center justify-center rounded-full">
            <Phone className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Verify Phone Number
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            For security and accountability, we require a verified phone number before you can report incidents.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && step === 'VERIFY' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {step === 'REQUEST' ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Phone Number (e.g. +1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transition-all"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <label htmlFor="otp" className="sr-only">OTP Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || !otp}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transition-all"
              >
                {loading ? 'Verifying...' : 'Verify Phone'}
              </button>
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyPhone;
