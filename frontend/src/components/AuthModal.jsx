import React, { useState } from 'react';
import { X, Leaf } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { toast } from 'sonner';

const AuthModal = () => {
  const { authOpen, setAuthOpen } = useUI();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { error } =
        mode === 'signin'
          ? await signIn(email, password)
          : await signUp(email, password, name);
      if (error) {
        const raw = error.message || String(error);
        const msg = raw.toLowerCase();

        // ---- Sign-in specific ----
        if (mode === 'signin' && msg.includes('email not confirmed')) {
          toast.error(
            'Your email is not confirmed yet. Check your inbox for the Supabase verification link — or turn off "Confirm email" in Supabase → Authentication → Providers → Email for instant access.',
            { duration: 9000 },
          );
        } else if (mode === 'signin' && (msg.includes('invalid login') || msg.includes('invalid credentials'))) {
          toast.error('Wrong email or password. Try again, or sign up if you don\'t have an account yet.');
        }
        // ---- Sign-up specific ----
        else if (mode === 'signup' && (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already'))) {
          toast.error('An account with this email already exists. Try signing in instead.');
        } else if (msg.includes('email') && msg.includes('invalid')) {
          toast.error('Use a real email domain (e.g. gmail.com)');
        } else if (msg.includes('rate limit')) {
          toast.error('Too many attempts — wait a minute and try again.');
        } else if (msg.includes('password') && msg.includes('6')) {
          toast.error('Password must be at least 6 characters.');
        } else {
          toast.error(raw);
        }
      } else {
        toast.success(
          mode === 'signin'
            ? 'Welcome back'
            : 'Account created! If email confirmation is enabled in Supabase, check your inbox before signing in.',
        );
        setAuthOpen(false);
      }
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('not enabled') || msg.includes('unsupported provider') || msg.includes('validation_failed')) {
          toast.error(
            'Google sign-in is off. Turn it on in Supabase → Authentication → Providers → Google, or just use email + password below.',
            { duration: 8000 },
          );
        } else {
          toast.error(error.message);
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Could not start Google sign-in');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        data-testid="auth-modal"
        className="relative w-full max-w-md card-surface rounded-2xl p-8"
      >
        <button
          data-testid="auth-close-btn"
          onClick={() => setAuthOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#262924] text-[#a8a69c]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Leaf className="w-5 h-5 text-[#d69e4b]" />
          <span className="font-serif text-xl text-[#f2f0e6]">Roots & Earth</span>
        </div>

        <h2 className="font-serif text-3xl text-[#f2f0e6]">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-[#a8a69c] mt-1 mb-6">
          {mode === 'signin'
            ? 'Sign in to track orders, save favourites, and check out faster.'
            : 'Use a real email (e.g. gmail.com). For instant testing, disable email confirmation in Supabase → Authentication → Providers → Email.'}
        </p>

        <button
          data-testid="google-signin-btn"
          onClick={google}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-[#2d302a] hover:border-[#f2f0e6] hover:bg-[#262924] transition text-[#f2f0e6]"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.3 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-xs text-[#75746c]">
          <div className="flex-1 h-px bg-[#2d302a]" />
          OR
          <div className="flex-1 h-px bg-[#2d302a]" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input
              data-testid="auth-name-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
            />
          )}
          <input
            data-testid="auth-email-input"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
          />
          <input
            data-testid="auth-password-input"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
          />
          <button
            data-testid="auth-submit-btn"
            type="submit"
            disabled={busy}
            className="w-full btn-primary py-3 rounded-full text-sm tracking-wide disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#a8a69c] mt-5">
          {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
          <button
            data-testid="auth-switch-mode"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-[#d69e4b] hover:text-[#f2f0e6] link-underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
