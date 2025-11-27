import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface DashboardStats {
  blueprints_count: number;
  time_saved_seconds: number;
  youtube_ratio: number;
  text_ratio: number;
}

export interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_STATS: DashboardStats = {
  blueprints_count: 0,
  time_saved_seconds: 0,
  youtube_ratio: 0,
  text_ratio: 0
};

export function useDashboardStats(): UseDashboardStatsResult {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(DEFAULT_STATS);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        target_user_id: user.id
      });

      if (error) {
        throw error;
      }

      setStats(data as DashboardStats);
    } catch (err) {
      console.error('[useDashboardStats] Failed to fetch dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      // Keep old stats if available, or default
      if (!stats) setStats(DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
}
