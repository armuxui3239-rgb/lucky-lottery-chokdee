import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export interface DashboardStats {
  balance: number;
  affiliate_balance: number;
  active_tickets: number;
  total_wins: number;
  loyalty_tier: string;
}

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc('get_user_dashboard_stats', {
        p_user_id: user.id
      });

      if (rpcError) throw rpcError;
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Optional: Real-time update for wallets
    const channel = supabase
      .channel('wallet_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { stats, loading, error, refresh: fetchStats };
};
