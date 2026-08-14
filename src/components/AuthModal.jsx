import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Briefcase, ShieldCheck, AlertCircle, Check, MapPin, Sparkles } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', isInline = false }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer' | 'owner' | 'broker' | 'student'
  const [city, setCity] = useState('Jammu');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const QUICK_TEST_ACCOUNTS = [
    { role: 'Buyer', email: 'buyer@trustifyhomes.test', pass: 'CHANGE_ME_BUYER_123!', color: 'bg-blue-50 hover:bg-blue-100 text-brand-700 border-blue-200' },
    { role: 'Broker', email: 'broker@trustifyhomes.test', pass: 'CHANGE_ME_BROKER_123!', color: 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200' },
    { role: 'Admin', email: 'admin@trustifyhomes.test', pass: 'CHANGE_ME_ADMIN_123!', color: 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200' }
  ];

  const [selectedQuickRole, setSelectedQuickRole] = useState(null);

  const handleQuickFill = (acc) => {
    setMode('login');
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedQuickRole(acc.role.toLowerCase());
    setErrorMessage('');
    setSuccessMessage(`Pre-filled ${acc.role} Test Account credentials! Click 'Sign In to Account'.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const data = await supabaseService.signUpUser({
          email,
          password,
          fullName,
          phone,
          role,
          city
        });
        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data?.user || { email, user_metadata: { role } }, role);
          onClose();
        }, 1200);
      } else if (mode === 'login') {
        const data = await supabaseService.signInUser({ email, password });
        setSuccessMessage('Logged in successfully!');
        const loggedRole = selectedQuickRole || data?.user?.user_metadata?.role || (email.includes('admin') ? 'admin' : email.includes('broker') ? 'broker' : email.includes('owner') ? 'owner' : email.includes('student') ? 'student' : 'buyer');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data?.user || { email, user_metadata: { role: loggedRole } }, loggedRole);
          onClose();
        }, 1000);
      } else if (mode === 'forgot') {
        await supabaseService.resetPassword(email);
        setSuccessMessage('Password reset link sent to your email.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalBody = (
    <div className={`bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative ${!isInline ? 'my-auto' : ''}`}>
        
        {/* Header & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {mode === 'login' ? 'Welcome Back to EZ HOMES' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'login' ? 'Sign in to access your dashboard & saved homes' : mode === 'signup' ? 'Select your role & join Jammu\'s premier real estate network' : 'Enter your email to receive a password reset link'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Test Account Badges */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-amber-700">
              <Sparkles className="w-3 h-3 text-amber-600" /> Demo Quick-Fill Test Accounts:
            </span>
            <span>Click to fill</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEST_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className={`px-2.5 py-1 rounded text-xs font-extrabold border transition-all ${acc.color}`}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher (Login / Signup) */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 rounded-lg mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-md transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-md transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error / Success Messages */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          
          {/* Full Name for Signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="email" 
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* Phone & Role for Signup */}
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 94191 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Primary City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection Radio Cards */}
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1.5 text-[10px]">Account Role</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      role === 'buyer' ? 'border-brand-700 bg-blue-50/50 text-brand-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-brand-600 shrink-0" />
                    <div>
                      <div className="text-[11px] leading-tight">Buyer / Tenant</div>
                      <div className="text-[9px] text-slate-500 font-normal">Search properties</div>
                    </div>
                  </button>



                  <button
                    type="button"
                    onClick={() => setRole('broker')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      role === 'broker' ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-[11px] leading-tight">Broker / Agent</div>
                      <div className="text-[9px] text-slate-500 font-normal">Lead hub & inventory</div>
                    </div>
                  </button>


                </div>
              </div>
            </>
          )}

          {/* Password Input */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-[10px] text-brand-700 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded transition-colors uppercase tracking-wider shadow-sm mt-2 disabled:opacity-50"
          >
            {loading 
              ? 'Processing...' 
              : mode === 'login' 
              ? 'Sign In to Account' 
              : mode === 'signup' 
              ? 'Create Account' 
              : 'Send Reset Link'
            }
          </button>

          {/* Back to Login link from Forgot Password */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                className="text-xs text-brand-700 font-bold hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
  );

  if (isInline) {
    return modalBody;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {modalBody}
    </div>
  );
}
