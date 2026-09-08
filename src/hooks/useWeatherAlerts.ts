import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define the shape of your alert row from Supabase
export interface WeatherAlert {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  severity: 'INFO' | 'WARNING' | 'SEVERE' | 'EXTREME';
  source: string;
  latitude: number | null;
  longitude: number | null;
  expires_at: string;
  is_active: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl, supabaseKey);

export function useWeatherAlerts(): WeatherAlert[] {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    // 1. Fetch initial active alerts
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error.message);
        return;
      }

      if (data) setAlerts(data as WeatherAlert[]);
    };

    fetchAlerts();

    // 2. Subscribe to real-time additions
    const channel = supabase
      .channel('alerts_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('New alert received!', payload.new);
          setAlerts((current) => [payload.new as WeatherAlert, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return alerts;
}