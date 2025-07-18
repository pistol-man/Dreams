import { useRef, useState, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const enableCamera = async (): Promise<boolean> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsInitialized(true);
      }

      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      console.error('Camera initialization error:', err);
      setError(errorMessage);
      return false;
    }
  };

  const disableCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsInitialized(false);
    setError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableCamera();
    };
  }, []);

  // Monitor video element and stream connection
  useEffect(() => {
    if (videoRef.current && stream && !isInitialized) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Failed to display camera feed');
      });
    }
  }, [stream, isInitialized]);

  return {
    videoRef,
    error,
    enableCamera,
    disableCamera,
    stream,
    isInitialized
  };
}; 