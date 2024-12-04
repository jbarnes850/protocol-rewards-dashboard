import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { SDKManager } from '../lib/sdk-manager';
import { MetricsCache } from '../lib/metrics-cache';
import { ProcessedMetrics } from '../types/metrics';
import { BaseError, ErrorCode } from '../types/errors';
import { RewardCalculation } from '../types/sdk';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

interface MetricsContextType {
  metrics: ProcessedMetrics | null;
  rewards: RewardCalculation | null;
  loading: boolean;
  error: BaseError | null;
  lastUpdated: number | null;
  isTracking: boolean;
  refreshMetrics: () => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

const DEBOUNCE_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProcessedMetrics | null>(null);
  const [rewards, setRewards] = useState<RewardCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BaseError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const retryCount = useRef(0);
  const mounted = useRef(true);

  const sdkManager = SDKManager.getInstance();
  const metricsCache = MetricsCache.getInstance();

  // Cleanup function
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleMetricsUpdate = useCallback(async (newMetrics: ProcessedMetrics) => {
    try {
      if (!mounted.current) return;

      // Validate metrics
      if (!newMetrics.validation.isValid) {
        console.warn('Received invalid metrics:', newMetrics.validation.errors);
        toast.warning('Received potentially invalid metrics data', {
          description: newMetrics.validation.errors.join(', ')
        });
        return;
      }

      if (user?.trackedRepository) {
        // Update cache
        await metricsCache.cacheMetrics(user.trackedRepository.full_name, newMetrics);
        
        // Update state
        setMetrics(newMetrics);
        setLastUpdated(Date.now());
        setError(null);
        retryCount.current = 0; // Reset retry count on successful update
      }
    } catch (error) {
      console.error('Error handling metrics update:', error);
      handleError(error);
    }
  }, [user?.trackedRepository]);

  const handleRewardUpdate = useCallback((reward: RewardCalculation) => {
    if (!mounted.current) return;
    setRewards(reward);
  }, []);

  const handleTrackingStatus = useCallback((status: boolean) => {
    if (!mounted.current) return;
    setIsTracking(status);
    if (status) {
      toast.success('Metrics tracking started');
    } else {
      toast.info('Metrics tracking stopped');
    }
  }, []);

  // Debounced metrics update
  const debouncedMetricsUpdate = useCallback(
    debounce(handleMetricsUpdate, DEBOUNCE_DELAY),
    [handleMetricsUpdate]
  );

  const handleError = useCallback((error: unknown) => {
    if (!mounted.current) return;

    const baseError = error instanceof BaseError ? error : new BaseError(
      ErrorCode.SDK_ERROR,
      'Failed to process metrics',
      error instanceof Error ? error.message : 'Unknown error'
    );

    console.error('SDK error:', baseError);
    setError(baseError);

    // Handle specific error types
    switch (baseError.code) {
      case ErrorCode.RATE_LIMIT_ERROR:
        toast.error('Rate limit exceeded. Waiting before retrying...');
        break;
      case ErrorCode.API_ERROR:
        toast.error('GitHub API error. Please check your token.');
        break;
      case ErrorCode.VALIDATION_ERROR:
        toast.error('Invalid configuration or data');
        break;
      default:
        // Implement retry logic for other errors
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          toast.error(`Error collecting metrics. Retrying... (${retryCount.current}/${MAX_RETRIES})`);
          setTimeout(() => {
            if (mounted.current) {
              refreshMetrics();
            }
          }, RETRY_DELAY * retryCount.current);
        } else {
          toast.error('Failed to collect metrics after multiple attempts');
        }
    }
  }, []);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await metricsCache.initialize();
      } catch (error) {
        console.error('Failed to initialize metrics cache:', error);
        toast.error('Failed to initialize metrics system');
      }
    };

    initializeServices();
  }, []);

  useEffect(() => {
    if (!user?.trackedRepository) {
      setMetrics(null);
      setRewards(null);
      setLastUpdated(null);
      return;
    }

    const githubToken = localStorage.getItem('github_token');
    if (!githubToken) {
      setError(new BaseError(ErrorCode.CONFIGURATION_ERROR, 'GitHub token not found'));
      return;
    }

    // Initialize SDK with current repository
    sdkManager.initialize(githubToken, user.trackedRepository.full_name, {
      timeframe: 'week',
      maxRequestsPerSecond: 5,
      logger: console
    });

    // Set up event listeners
    const metricsUnsubscribe = sdkManager.onMetricsCollected(debouncedMetricsUpdate);
    const rewardUnsubscribe = sdkManager.onRewardCalculated(handleRewardUpdate);
    const errorUnsubscribe = sdkManager.onError(handleError);
    const trackingUnsubscribe = sdkManager.onTrackingStatusChange(handleTrackingStatus);

    // Start tracking
    const startTracking = async () => {
      try {
        setLoading(true);
        
        // Try to get cached metrics first
        const cachedMetrics = await metricsCache.getMetrics(user.trackedRepository.full_name);
        if (cachedMetrics) {
          setMetrics(cachedMetrics);
          setLastUpdated(Date.now());
        }

        // Start real-time tracking
        await sdkManager.startTracking();
        
        // If no cached metrics, get initial metrics
        if (!cachedMetrics) {
          const initialMetrics = await sdkManager.getLatestMetrics();
          if (initialMetrics) {
            await handleMetricsUpdate(initialMetrics);
          }
        }
      } catch (error) {
        handleError(error);
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    startTracking();

    // Cleanup
    return () => {
      metricsUnsubscribe();
      rewardUnsubscribe();
      errorUnsubscribe();
      trackingUnsubscribe();
      sdkManager.stopTracking();
      debouncedMetricsUpdate.cancel();
    };
  }, [user?.trackedRepository, debouncedMetricsUpdate, handleError, handleRewardUpdate, handleTrackingStatus]);

  const refreshMetrics = useCallback(async () => {
    if (!user?.trackedRepository) return;

    try {
      setLoading(true);
      const newMetrics = await sdkManager.getLatestMetrics();
      if (newMetrics) {
        await handleMetricsUpdate(newMetrics);
        toast.success('Metrics refreshed successfully');
      }
    } catch (error) {
      handleError(error);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [user?.trackedRepository, handleMetricsUpdate]);

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        rewards,
        loading,
        error,
        lastUpdated,
        isTracking,
        refreshMetrics,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}; 