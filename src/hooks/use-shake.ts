import { useState, useEffect, useCallback } from 'react';

interface ShakeOptions {
  threshold?: number;
  timeout?: number;
  onShake?: () => void;
}

interface UseShakeReturn {
  enableShake: () => Promise<boolean>;
  disableShake: () => void;
  isEnabled: boolean;
  permissionStatus: PermissionState | null;
  error: string | null;
  isIOS: boolean;
  isMobile: boolean;
}

// Add type declarations for sensor permissions
declare global {
  interface Window {
    DeviceMotionEvent: {
      requestPermission?: () => Promise<PermissionState>;
    } & typeof DeviceMotionEvent;
    DeviceOrientationEvent: {
      requestPermission?: () => Promise<PermissionState>;
    } & typeof DeviceOrientationEvent;
  }
  interface Navigator {
    permissions?: {
      query: (descriptor: { name: string }) => Promise<PermissionStatus>;
    };
  }
}

export function useShake({
  threshold = 15,
  timeout = 1000,
  onShake
}: ShakeOptions = {}): UseShakeReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [lastShakeTimeout, setLastShakeTimeout] = useState<NodeJS.Timeout | null>(null);

  // Detect platform
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Request sensor permissions based on platform
  const requestSensorPermissions = async (): Promise<boolean> => {
    try {
      if (isIOS) {
        // iOS requires explicit permission requests
        if (window.DeviceMotionEvent?.requestPermission && window.DeviceOrientationEvent?.requestPermission) {
          // Request both motion and orientation permissions
          const motionPermission = await window.DeviceMotionEvent.requestPermission();
          const orientationPermission = await window.DeviceOrientationEvent.requestPermission();

          const permissionsGranted = motionPermission === 'granted' && orientationPermission === 'granted';
          setPermissionStatus(permissionsGranted ? 'granted' : 'denied');
          
          if (!permissionsGranted) {
            throw new Error(
              'Sensor access denied. Please enable motion and orientation sensors in iOS Settings > Safari > Motion & Orientation Access'
            );
          }
          return true;
        }
      } else {
        // Android and other platforms
        if (navigator.permissions) {
          // Check for accelerometer permission
          const accelerometer = await navigator.permissions.query({ name: 'accelerometer' as any });
          const gyroscope = await navigator.permissions.query({ name: 'gyroscope' as any });
          
          const permissionsGranted = 
            accelerometer.state === 'granted' && 
            gyroscope.state === 'granted';

          setPermissionStatus(permissionsGranted ? 'granted' : 'denied');

          if (!permissionsGranted) {
            throw new Error(
              'Sensor access denied. Please enable motion sensors in your device settings'
            );
          }
          return true;
        }

        // Fallback for browsers without Permissions API
        // Try to access sensors directly
        return new Promise((resolve) => {
          let sensorAccessed = false;
          
          const testMotion = (e: DeviceMotionEvent) => {
            if (e.acceleration || e.accelerationIncludingGravity) {
              sensorAccessed = true;
              window.removeEventListener('devicemotion', testMotion);
              resolve(true);
            }
          };

          window.addEventListener('devicemotion', testMotion, { once: true });

          // Set a timeout to check if we received any sensor data
          setTimeout(() => {
            window.removeEventListener('devicemotion', testMotion);
            if (!sensorAccessed) {
              setError('No sensor data received. Please ensure motion sensors are enabled in your device settings');
              resolve(false);
            }
          }, 1000);
        });
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access motion sensors';
      setError(errorMessage);
      return false;
    }
  };

  // Reset shake count after a delay
  const resetShakeCount = useCallback(() => {
    if (lastShakeTimeout) {
      clearTimeout(lastShakeTimeout);
    }
    const timeout = setTimeout(() => {
      setShakeCount(0);
    }, 2000);
    setLastShakeTimeout(timeout);
  }, []);

  // Handle device motion
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isEnabled) return;

    // Get acceleration with gravity if acceleration is not available
    const acceleration = event.acceleration || event.accelerationIncludingGravity;
    if (!acceleration) return;

    const now = Date.now();
    const timeDiff = now - lastShakeTime;

    // Calculate total acceleration
    const totalAcceleration = Math.sqrt(
      Math.pow(acceleration.x || 0, 2) +
      Math.pow(acceleration.y || 0, 2) +
      Math.pow(acceleration.z || 0, 2)
    );

    // Check if acceleration exceeds threshold and enough time has passed
    if (totalAcceleration > threshold && timeDiff > timeout) {
      setLastShakeTime(now);
      setShakeCount(prev => {
        const newCount = prev + 1;
        if (newCount === 2) {
          if (onShake) {
            onShake();
          }
          return 0;
        }
        resetShakeCount();
        return newCount;
      });

      // Show visual feedback for first shake
      const alertBadge = document.getElementById('shake-alert');
      if (alertBadge && shakeCount === 0) {
        alertBadge.style.display = 'block';
        alertBadge.style.opacity = '1';
        setTimeout(() => {
          alertBadge.style.display = 'none';
          alertBadge.style.opacity = '0';
        }, 2000);
      }
    }
  }, [isEnabled, threshold, timeout, lastShakeTime, onShake, resetShakeCount, shakeCount]);

  // Request permission and enable shake detection
  const enableShake = async (): Promise<boolean> => {
    try {
      setError(null);

      // Check if we're on a mobile device
      if (!isMobile) {
        throw new Error('Shake detection is only available on mobile devices');
      }

      // Request sensor permissions
      const hasPermission = await requestSensorPermissions();
      if (!hasPermission) {
        return false;
      }

      // Add the actual event listener
      window.addEventListener('devicemotion', handleMotion);
      setIsEnabled(true);

      // Verify that we're receiving motion events
      let motionReceived = false;
      const testMotion = (e: DeviceMotionEvent) => {
        motionReceived = true;
        window.removeEventListener('devicemotion', testMotion);
      };
      window.addEventListener('devicemotion', testMotion, { once: true });

      // Check if we actually receive motion events after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!motionReceived) {
        throw new Error('No motion events received. Please ensure motion sensors are enabled in your device settings.');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable shake detection';
      setError(errorMessage);
      setIsEnabled(false);
      return false;
    }
  };

  // Disable shake detection
  const disableShake = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsEnabled(false);
    setShakeCount(0);
    if (lastShakeTimeout) {
      clearTimeout(lastShakeTimeout);
    }
  }, [handleMotion, lastShakeTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableShake();
    };
  }, [disableShake]);

  return {
    enableShake,
    disableShake,
    isEnabled,
    permissionStatus,
    error,
    isIOS,
    isMobile
  };
} 