import { useEffect } from 'react';

export function useWebPush(userId?: number) {
    useEffect(() => {
        if (!userId) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        async function subscribe() {
            const registration = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;

            // Get VAPID public key from backend (should be exposed via endpoint or env)
            const response = await fetch('/api/webpush/public-key');
            const vapidPublicKey = await response.text();
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            });

            // Send subscription to backend
            await fetch('/api/webpush/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription }),
            });
        }

        subscribe();
    }, [userId]);
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
} 