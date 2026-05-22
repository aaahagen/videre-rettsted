'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the service worker as soon as possible
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered:', registration.scope);
        } catch (error) {
          console.error('SW registration failed:', error);
        }
      };

      register();
    }
  }, []);

  return null;
}
