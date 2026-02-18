import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { fetchPrices } from '../services/prices/priceApi';

const PRICE_REFRESH_INTERVAL = 60000; // 60 seconds

export function useLivePrices(assets: string[]) {
  const [cachedPrices, setCachedPrices] = useState<Record<string, number>>({});
  const lastSuccessfulPrices = useRef<Record<string, number>>({});

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['prices', assets.sort().join(',')],
    queryFn: async () => {
      if (assets.length === 0) return {};
      return fetchPrices(assets);
    },
    enabled: assets.length > 0,
    refetchInterval: PRICE_REFRESH_INTERVAL,
    retry: 2,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      lastSuccessfulPrices.current = data;
      setCachedPrices(data);
    }
  }, [data]);

  const prices = isError ? lastSuccessfulPrices.current : (data || cachedPrices);

  return {
    prices,
    isLoading,
    isError,
    error: error as Error | null,
    hasData: Object.keys(prices).length > 0,
  };
}
