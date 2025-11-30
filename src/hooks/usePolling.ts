import { useState, useEffect, useRef, useCallback } from 'react';

export interface UsePollingOptions {
  enabled?: boolean;
  immediate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Custom hook for polling data at regular intervals
 * 
 * @param fetchFn - Async function that fetches the data
 * @param interval - Polling interval in milliseconds
 * @param options - Configuration options
 * @returns Polling state and control functions
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number,
  options: UsePollingOptions = {}
): UsePollingResult<T> {
  const {
    enabled = true,
    immediate = true,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const fetchFnRef = useRef(fetchFn);

  // Update the ref when fetchFn changes, but don't trigger re-renders
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  /**
   * Fetch data function with error handling
   */
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFnRef.current();

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        setLoading(false);

        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');

      if (isMountedRef.current) {
        setError(error);
        setLoading(false);

        if (onError) {
          onError(error);
        } else {
          console.error('Polling error:', error);
        }
      }
    }
  }, [enabled, onError, onSuccess]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Set up polling interval
   */
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!enabled) {
      return;
    }

    // Fetch immediately if requested
    if (immediate) {
      fetchData();
    }

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData, interval, enabled, immediate]);

  /**
   * Track component mount status
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}
