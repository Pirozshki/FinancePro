import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const DEFAULT_DATA = {
  income: 20000,
  categories: [
    '🏠 Rent/Mortgage', '🛒 Groceries', '⚡ Utilities', '🎢 Kids/Family',
    '⚾ Cubs Trip', '🚗 Transport', '✈️ Travel', '🍔 Dining Out', '💰 Savings'
  ],
  monthlyData: {},
  recurringItems: []
};

export const useSupabaseSync = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const isRemoteUpdate = useRef(false);

  // Initial fetch + realtime subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cloudData, error } = await supabase
          .from('budget_data')
          .select('content')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;
        setData(cloudData ? cloudData.content : DEFAULT_DATA);
      } catch (err) {
        console.error('Fetch error:', err.message);
        setData(DEFAULT_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for updates from other devices
    const channel = supabase.channel('realtime-budget')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'budget_data' },
        (payload) => {
          if (payload.new?.content) {
            // Flag so the save effect knows to skip this cycle
            isRemoteUpdate.current = true;
            setData(payload.new.content);
          }
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Debounced save — skips saves triggered by remote updates to prevent feedback loop
  useEffect(() => {
    if (!loading && data) {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      const timer = setTimeout(async () => {
        const { error } = await supabase
          .from('budget_data')
          .upsert({ id: 1, content: data }, { onConflict: 'id' });

        if (error) {
          console.error('Save error:', error.message);
          setSaveError('Sync failed — your changes may not have been saved.');
        } else {
          setSaveError(null);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  return { data, setData, loading, saveError };
};
