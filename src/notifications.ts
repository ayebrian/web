import {initializeApp} from 'firebase/app';
import {
    getMessaging,
    getToken,
    onMessage,
    MessagePayload,
} from 'firebase/messaging';
import {FriendlyClientImpl} from '@/network/friendly-client';
import {BackendService} from '@/services/backend-service';

// Erm... Actually, these are not private
const firebaseConfig = {
    apiKey: 'AIzaSyCNiyRTYRCUC5RrDUevOHh1PIvs-E8m0E0',
    authDomain: 'friendly-e8071.firebaseapp.com',
    projectId: 'friendly-e8071',
    storageBucket: 'friendly-e8071.firebasestorage.app',
    messagingSenderId: '665338758593',
    appId: '1:665338758593:web:9674acf4e970d01c921b40',
    measurementId: 'G-R5K08P6EBR',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const swiped = Number(localStorage.getItem('feed-swipes') ?? '0');

if (swiped > 20 || localStorage.getItem('request-notifications') === 'true') {
    void window.Notification.requestPermission().then(permission => {
        if (permission !== 'granted') return;
        void getToken(messaging, {
            vapidKey:
                'BAEj5IbZiBmuUHKNu1Z3hoM5OHEEETG63Lg7mcxxG-kX5t-r5minZEeZTFC-qlW5vYir7mSt3eruuZbr0WcORX0',
        }).then(token => {
            setFirebaseToken(token);
            void nudge();
        });
    });
}

/**
 * Nudging tries to upload firebase token to server. It happens in these cases:
 *
 * ø  Account sign-up / sign-in
 * |  If user logged in after authorization, we need to notify server about
 * |  this.
 *
 * ø  App initialization
 * |  We need to upload token if previous attempts were not successful.
 *
 * o  Firebase token change
 * |  We need to upload a new token if it was refreshed. Currently no change
 * |  callback is provided by firebase (but it will be provided in the future
 * |  versions).
 */
export async function nudge() {
    const firebaseToken = getFirebaseToken();
    if (!firebaseToken) return;
    if (firebaseToken === getUploadedToken()) return;

    const client = new FriendlyClientImpl();
    const backend = new BackendService(client);
    if (!backend.restoreAuthorizationIfPossible()) return;

    while (true) {
        const result = await backend.authFirebase({firebaseToken});
        if (result.ok) break;
    }

    setUploadedToken(firebaseToken);
}

export function logout() {
    setUploadedToken(null);
}

function getFirebaseToken(): string | null {
    return localStorage.getItem('notifications.firebaseToken');
}

function setFirebaseToken(value: string | null) {
    if (value === null) {
        localStorage.removeItem('notifications.firebaseToken');
    } else {
        localStorage.setItem('notifications.firebaseToken', value);
    }
}

function getUploadedToken(): string | null {
    return localStorage.getItem('notifications.uploadedToken');
}

function setUploadedToken(value: string | null) {
    if (value === null) {
        localStorage.removeItem('notifications.uploadedToken');
    } else {
        localStorage.setItem('notifications.uploadedToken', value);
    }
}

async function postMessage(payload: MessagePayload) {
    const registration = await navigator.serviceWorker.getRegistration(
        '/firebase-cloud-messaging-push-scope',
    );
    registration?.active?.postMessage(payload);
}
onMessage(messaging, message => void postMessage(message));
