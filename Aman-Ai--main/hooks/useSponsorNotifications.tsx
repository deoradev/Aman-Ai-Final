import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { usePushNotifications } from './usePushNotifications';
import { generateNotificationMessage } from '../services/geminiService';
import { getUserContext } from '../utils';
import { JournalEntry } from '../types';

const NOTIFICATION_COOLDOWN_HOURS = 8;
const MORNING_HOUR = 8; // 8 AM
const EVENING_HOUR = 21; // 9 PM

export const useSponsorNotifications = () => {
    const { currentUser, getScopedKey } = useAuth();
    const { permissionStatus } = usePushNotifications();

    useEffect(() => {
        if (!currentUser) return; // Only run for logged-in users

        const checkAndSendNotification = async () => {
            if (permissionStatus !== 'granted') {
                // Silently return if permission isn't granted.
                // The user can enable it from the profile page.
                return;
            }
            
            const now = new Date();
            const lastNotificationTimestamp = parseInt(localStorage.getItem(getScopedKey('last-notification-timestamp')) || '0', 10);
            const hoursSinceLast = (now.getTime() - lastNotificationTimestamp) / (1000 * 60 * 60);

            if (hoursSinceLast < NOTIFICATION_COOLDOWN_HOURS) {
                return; // Cooldown period
            }

            const userContext = getUserContext();
            if (!userContext) return;

            let notificationType: 'morning' | 'journal_nudge' | null = null;
            const hour = now.getHours();

            const lastMorningKey = `last-morning-notification-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
            const lastNudgeKey = `last-nudge-notification-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

            if (hour >= MORNING_HOUR && hour < 12 && !localStorage.getItem(getScopedKey(lastMorningKey))) {
                notificationType = 'morning';
                localStorage.setItem(getScopedKey(lastMorningKey), 'true');
            } else if (hour >= EVENING_HOUR && hour < 23 && !localStorage.getItem(getScopedKey(lastNudgeKey))) {
                const journals: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]');
                const todayStr = now.toISOString().split('T')[0];
                const hasJournaledToday = journals.some(j => j.date === todayStr);
                if (!hasJournaledToday) {
                    notificationType = 'journal_nudge';
                    localStorage.setItem(getScopedKey(lastNudgeKey), 'true');
                }
            }

            if (notificationType) {
                try {
                    const message = await generateNotificationMessage(notificationType, userContext.language);
                    if (message) {
                        new Notification("Aman Digital Care", {
                            body: message,
                            icon: '/assets/icons/icon-192x192.png',
                            badge: '/assets/icons/icon-96x96.png'
                        });
                        localStorage.setItem(getScopedKey('last-notification-timestamp'), now.getTime().toString());
                    }
                } catch (error) {
                    console.error("Failed to generate or send notification:", error);
                }
            }
        };

        // Check for notifications periodically, e.g., every hour
        const intervalId = setInterval(checkAndSendNotification, 1000 * 60 * 60);
        
        // Also run once on startup after a short delay
        setTimeout(checkAndSendNotification, 1000 * 10);

        return () => clearInterval(intervalId);
    }, [currentUser, permissionStatus, getScopedKey]);
};