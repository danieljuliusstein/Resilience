import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  needsRefresh: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    needsRefresh: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          setState(prev => ({ ...prev, isUpdating: true }));

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available, refresh needed
                setState(prev => ({ 
                  ...prev, 
                  isUpdating: false, 
                  needsRefresh: true 
                }));
              } else {
                // First time installation
                setState(prev => ({ ...prev, isUpdating: false }));
              }
            }
          });
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            setState(prev => ({ ...prev, needsRefresh: true }));
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setState(prev => ({ ...prev, isRegistered: false }));
      }
    };

    registerSW();
  }, [state.isSupported]);

  const updateServiceWorker = async () => {
    if (state.registration) {
      if (state.registration.waiting) {
        state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  const getCacheInfo = async (): Promise<any> => {
    if (!state.registration) return null;
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      const registration = state.registration;
      if (registration && registration.active) {
        registration.active.postMessage(
          { type: 'GET_CACHE_INFO' }, 
          [messageChannel.port2]
        );
      }


    });
  };

  return {
    ...state,
    updateServiceWorker,
    getCacheInfo,
  };
}