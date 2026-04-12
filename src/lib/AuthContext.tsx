import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// Define User Profile type based on database schema
export interface UserProfile {
  id: string;
  phone: string;
  full_name?: string;
  role: 'user' | 'admin';
  bank_code?: string;       // FK → banks.code
  bank_account?: string;
  referral_code?: string;
  referred_by?: string;
  loyalty_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total_spent?: number;
  is_otp_verified: boolean;
  password?: string;
  kyc_status: 'unverified' | 'pending' | 'verified';
  updated_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  balance: number;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  submitKyc: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  balance: 0,
  loading: true,
  profileLoading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  refreshProfile: async () => { },
  verifyOtp: async () => false,
  setPin: async () => { },
  verifyPin: async () => false,
  submitKyc: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const refreshProfile = async (userId: string, force = false, retryCount = 0) => {
    // Throttling logic: skip if fetched in last 10 seconds unless forced
    const now = Date.now();
    if (!force && lastFetch && now - lastFetch < 10000 && profile) {
      return;
    }

    setProfileLoading(true);
    
    // Safety Timeout: 10 seconds MAX for profile loading (Increased for stability)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile connection timeout')), 10000)
    );

    try {
      await Promise.race([
        (async () => {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          // Fetch balance from wallets table
          const { data: walletData } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', userId)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData);
          } else if (profileError && profileError.code === 'PGRST116') {
            const fallback: UserProfile = { 
              id: userId, 
              phone: 'Guest', 
              role: 'user', 
              is_otp_verified: false,
              kyc_status: 'unverified'
            };
            setProfile(fallback);
          }

          if (walletData) {
            setBalance(Number(walletData.balance) || 0);
          } else {
            // สร้าง Wallet อัตโนมัติหากยังไม่มี (ยอดเงินเริ่มต้น 0)
            try {
              await supabase.from('wallets').insert({ user_id: userId, balance: 0 });
            } catch (err) {
              console.error('Auto-creating wallet failed:', err);
            }
            setBalance(0);
          }
          setLastFetch(now);
        })(),
        timeoutPromise
      ]);
    } catch (err) {
      console.error(`Error fetching profile (Attempt ${retryCount + 1}):`, err);
      
      // Retry Logic: Try up to 2 additional times if timeout occurs
      if (retryCount < 2) {
        return refreshProfile(userId, true, retryCount + 1);
      }

      // If profile is still null after error/timeout, we should still stop loading
      if (!profile) {
        setProfileLoading(false);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        refreshProfile(currentSession.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
        setProfileLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const email = trimmed.includes('@') ? trimmed : `${trimmed}@chokdee.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await refreshProfile(data.user.id);
    }
  };

  const signUp = async (identifier: string, password: string, metadata?: any) => {
    const trimmed = identifier.trim();
    const email = trimmed.includes('@') ? trimmed : `${trimmed}@chokdee.com`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: {
          ...metadata,
          is_otp_verified: false
        }
      }
    });
    if (error) throw error;

    if (data.user) {
      const { error: pErr } = await supabase.from('profiles').upsert({
        id: data.user.id,
        phone: metadata.phone || '',
        full_name: metadata.full_name || '',
        is_otp_verified: false,
        kyc_status: 'unverified'
      });
      if (pErr) console.error('Error creating/updating profile', pErr);
    }
  };

  const verifyOtp = async (code: string) => {
    // SYSTEM-GENERATED OTP LOGIC - Using User ID's last 6 characters
    if (user) {
      const userCode = user.id.replace(/-/g, '').slice(-6).toUpperCase();
      if (code.toUpperCase() === userCode) {
        const { error } = await supabase.from('profiles')
          .update({ is_otp_verified: true })
          .eq('id', user.id);
        if (error) throw error;
        await refreshProfile(user.id);
        return true;
      }
    }
    return false;
  };

  const setPin = async (securityPassword: string) => {
    if (user) {
      const { error } = await supabase.from('profiles')
        .update({ password: securityPassword })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile(user.id);
    }
  };

  const verifyPin = async (securityPassword: string) => {
    if (profile?.password === securityPassword) return true;
    return false;
  };

  const submitKyc = async (data: any) => {
    if (user) {
      const { error } = await supabase.from('profiles')
        .update({ ...data, kyc_status: 'pending' })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      balance,
      loading,
      profileLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile: async () => { if (user) await refreshProfile(user.id); },
      verifyOtp,
      setPin,
      verifyPin,
      submitKyc
    }}>
      {children}
    </AuthContext.Provider>
  );
};

