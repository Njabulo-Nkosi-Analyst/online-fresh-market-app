import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(data);
    })();
  }, [user]);

  const signUp = async (email, password, full_name) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });
      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Sign up failed' } };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Sign in failed' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Google sign-in failed' } };
    }
  };

  const resendConfirmation = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Could not resend email' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider
      value={{ user, profile, loading, signUp, signIn, signInWithGoogle, signOut, resendConfirmation }}
    >
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
