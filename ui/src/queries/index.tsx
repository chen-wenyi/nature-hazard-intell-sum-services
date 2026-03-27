import {
  fetchSevereWeatherOutlook,
  fetchThunderstormOutlook,
  getLatestIssuedAlerts,
} from '@/serverFuncs/fetch';

import { useQuery } from '@tanstack/react-query';

export const useIssuedWarningsAndWatches = () =>
  useQuery({
    queryKey: ['issuedWarningsAndWatches'],
    queryFn: async () => getLatestIssuedAlerts(),
    staleTime: Infinity,
    // refetchInterval: 1000 * 60 * 1, // refetch every 1 minute
  });

export const useSevereWeatherOutlook = () =>
  useQuery({
    queryKey: ['severeWeatherOutlook'],
    queryFn: async () => fetchSevereWeatherOutlook(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    // refetchInterval: 1000 * 60 * 5, // refetch every 5 minute
  });

export const useThunderstormOutlook = () =>
  useQuery({
    queryKey: ['thunderstormOutlook'],
    queryFn: async () => fetchThunderstormOutlook(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    // refetchInterval: 1000 * 60 * 5, // refetch every 5 minutes
  });
