interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

interface DeviceMotionEventConstructorWithPermission extends DeviceMotionEventConstructor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

declare global {
  interface Window {
    DeviceMotionEvent: DeviceMotionEventConstructorWithPermission;
  }
}

export {}; 