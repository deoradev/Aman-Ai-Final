import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { VAPID_PUBLIC_KEY } from '../constants';
import { urlBase64ToUint8Array } from '../utils';

type PermissionState = 'prompt' | 'granted' | 'denied';

interface PushNotificationsContextType {
  permissionStatus: PermissionState;
  token: string | null;
  registerForNotifications: () => Promise<void>;
}

const PushNotificationsContext = createContext<PushNotificationsContextType | undefined>(undefined);

export const PushNotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [token, setToken] = useState<string | null>(null);
  
  const isNative = Capacitor.isNativePlatform();

  const registerForNativeNotifications = useCallback(async () => {
    try {
      let permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        setPermissionStatus('granted');
        await PushNotifications.register();
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error requesting push notification permissions', error);
      setPermissionStatus('denied');
    }
  }, []);

  const registerForWebPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web push notifications not supported in this browser.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result === 'default' ? 'prompt' : result);

      if (result === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('Web push subscription:', subscription);
        setToken(JSON.stringify(subscription));
      }
    } catch (error) {
        console.error('Error registering for web push notifications:', error);
        setPermissionStatus('denied');
    }
  }, []);

  const registerForNotifications = isNative ? registerForNativeNotifications : registerForWebPush;

  useEffect(() => {
    if (isNative) {
      PushNotifications.checkPermissions().then(status => {
        setPermissionStatus(status.receive);
      }).catch(err => console.error("Error checking push permissions", err));

      const addListeners = () => {
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
        });
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          setToken(null);
        });
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received: ', notification);
        });
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed: ', notification);
        });
      };
      addListeners();
      return () => {
        PushNotifications.removeAllListeners().catch(err => console.error("Could not remove all push listeners", err));
      };
    } else {
      // For web, check initial permission status
      if ('Notification' in window) {
         setPermissionStatus(Notification.permission === 'default' ? 'prompt' : Notification.permission);
      }
    }
  }, [isNative]);


  const value = { permissionStatus, token, registerForNotifications };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

export const usePushNotifications = (): PushNotificationsContextType => {
  const context = useContext(PushNotificationsContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationsProvider');
  }
  return context;
};