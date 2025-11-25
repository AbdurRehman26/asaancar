declare global {
    interface Window {
        Pusher: unknown;
    }
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
window.Pusher = Pusher;

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

// Only initialize Echo if Pusher is properly configured
let echo: Echo | null = null;

if (pusherKey) {
    if (!pusherCluster) {
        console.error('Pusher cluster is required but not specified. Please set VITE_PUSHER_APP_CLUSTER in your .env file. Common values: "us-east-1", "us-west-1", "eu", "ap-southeast-1"');
    } else {
        const echoConfig: {
            broadcaster: string;
            key: string;
            cluster: string;
            forceTLS: boolean;
            encrypted: boolean;
            authEndpoint: string;
            auth: {
                headers: {
                    Authorization?: string;
                };
            };
        } = {
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: pusherCluster, // Cluster is required for Pusher
            forceTLS: true,
            encrypted: true,
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}),
                },
            },
        };

        try {
            echo = new Echo(echoConfig);
        } catch (error) {
            console.error('Failed to initialize Laravel Echo:', error);
        }
    }
} else {
    console.warn('Pusher app key not found. Make sure VITE_PUSHER_APP_KEY is set in your .env file.');
}

export default echo as Echo;
