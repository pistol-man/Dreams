import { useEffect, useState, useCallback } from 'react';
import { useDevice } from './use-device';

interface ShakeOptions {
  threshold?: number;
  timeout?: number;
  onShake: () => void;
}

declare global {
  interface Window {
    DeviceMotionEvent: {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
      new(type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
    };
  }
}

export const useShake = ({ threshold = 15, timeout = 1000, onShake }: ShakeOptions) => {
  const { isIOS, isMobile } = useDevice();
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [error, setError] = useState<string | null>(null);

  const requestIOSPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
        const permission = await window.DeviceMotionEvent.requestPermission();
        setPermissionStatus(permission);
        setError(null);
        return permission === 'granted';
      }
      return true;
    } catch (err) {
      console.error('Error requesting iOS motion permission:', err);
      setError('Failed to get motion sensor permission. Please enable it in your device settings.');
      return false;
    }
  }, []);

  const requestAndroidPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Create a temporary event listener to trigger permission prompt
      const tempListener = () => {};
      window.addEventListener('devicemotion', tempListener, { once: true });
      window.removeEventListener('devicemotion', tempListener);
      
      setPermissionStatus('granted');
      setError(null);
      return true;
    } catch (err) {
      console.error('Error accessing motion sensors:', err);
      setError('Failed to access motion sensors. Please ensure they are enabled on your device.');
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setError(null);

    // First check if we're on a mobile device
    if (!isMobile) {
      setError('Shake detection is only available on mobile devices.');
      return false;
    }

    // Check if device motion is available
    if (typeof window.DeviceMotionEvent === 'undefined') {
      setError('Motion sensors are not available on this device.');
      return false;
    }

    try {
      // Handle iOS permission
      if (isIOS) {
        return await requestIOSPermission();
      }
      
      // Handle Android permission
      return await requestAndroidPermission();

    } catch (error) {
      console.error('Error requesting motion permission:', error);
      setError('Failed to access motion sensors. Please try again.');
      setPermissionStatus('denied');
      return false;
    }
  }, [isIOS, isMobile, requestIOSPermission, requestAndroidPermission]);

  useEffect(() => {
    if (!isEnabled) return;

    let lastShake = 0;
    let shakeCount = 0;

    const handleShake = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      const acceleration = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);
      const now = Date.now();

      if (acceleration > threshold) {
        if (now - lastShake < timeout) return;
        
        shakeCount++;
        lastShake = now;

        console.log('Shake detected:', shakeCount); // Debug log

        if (shakeCount === 2) {
          onShake();
          shakeCount = 0;
        }

        // Reset shake count after 2 seconds of no shakes
        setTimeout(() => {
          if (now - lastShake >= 2000) {
            shakeCount = 0;
          }
        }, 2000);
      }
    };

    window.addEventListener('devicemotion', handleShake);
    return () => window.removeEventListener('devicemotion', handleShake);
  }, [isEnabled, threshold, timeout, onShake]);

  return {
    isEnabled,
    permissionStatus,
    error,
    isIOS,
    isMobile,
    enableShake: async () => {
      const hasPermission = await requestPermission();
      setIsEnabled(hasPermission);
      return hasPermission;
    },
    disableShake: () => {
      setIsEnabled(false);
      setError(null);
    },
  };
}; 