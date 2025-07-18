import { useEffect, useRef, useState } from 'react';

export const useCamera = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state);
      return result.state;
    } catch (error) {
      // Some browsers don't support permission query for camera
      return 'prompt';
    }
  };

  const requestPermission = async () => {
    try {
      setError(null);
      
      // First check current permission status
      const currentStatus = await checkPermission();
      if (currentStatus === 'denied') {
        setError('Camera permission was previously denied. Please enable it in your browser settings.');
        return false;
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setPermissionStatus('granted');
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setError(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please enable it to use the SOS feature.'
          : 'Unable to access camera. Please make sure your device has a working camera.'
      );
      setPermissionStatus('denied');
      return false;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsEnabled(false);
  };

  useEffect(() => {
    // Check initial permission status
    checkPermission();

    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    isEnabled,
    permissionStatus,
    error,
    enableCamera: async () => {
      const hasPermission = await requestPermission();
      setIsEnabled(hasPermission);
      return hasPermission;
    },
    disableCamera: stopCamera,
  };
}; 