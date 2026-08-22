/**
 * It is sad and frustrating that there's no _good_ way to use TypeScript for
 * service worker. If you will found one, your contribution is welcome!
 * But it should not _just work_. It should be simple and intuitive, just like
 * this file is. Maybe via special vite plugin. Maybe even hand-written? Idk.
 *
 * Commented-by: @y9san9
 */

importScripts(
    'https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js',
);
importScripts(
    'https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
    apiKey: 'AIzaSyCNiyRTYRCUC5RrDUevOHh1PIvs-E8m0E0',
    authDomain: 'friendly-e8071.firebaseapp.com',
    projectId: 'friendly-e8071',
    storageBucket: 'friendly-e8071.firebasestorage.app',
    messagingSenderId: '665338758593',
    appId: '1:665338758593:web:9674acf4e970d01c921b40',
});

const messaging = firebase.messaging();

async function handleMessage(payload) {
    const details = JSON.parse(payload.data.details);
    const language = pickLanguage();

    let title;
    let body;

    switch (details.type) {
        case 'new_request':
            if (details.from.isMutual) {
                switch (language) {
                    case 'en':
                        title = `New connection with ${details.from.nickname}`;
                        body = 'Click to view in browser';
                        break;
                    case 'ru':
                        title = `${details.from.nickname} принял запрос на дружбу`;
                        body = 'Нажми, чтобы продолжить в браузере';
                        break;
                }
            } else {
                switch (language) {
                    case 'en':
                        title = `New request from ${details.from.nickname}`;
                        body = 'Click to view in browser';
                        break;
                    case 'ru':
                        title = `Новый запрос от ${details.from.nickname}`;
                        body = 'Нажми, чтобы продолжить в браузере';
                        break;
                }
            }
            break;
        case 'new_reply':
            switch (language) {
                case 'en':
                    title = `New reply from ${details.post.owner.nickname}`;
                    body = 'Click to view in browser';
                    break;
                case 'ru':
                    title = `Новый ответ от ${details.post.owner.nickname}`;
                    body = 'Нажми, чтобы продолжить в браузере';
                    break;
            }
    }

    if (title !== undefined && body !== undefined) {
        self.registration.showNotification(title, {
            body: body,
            icon: '/pwa-icon.svg',
        });
    }
}

messaging.onBackgroundMessage(handleMessage);
self.addEventListener('message', message => handleMessage(message.data));

const supportedLanguages = ['en', 'ru'];

function pickLanguage() {
    for (const language of navigator.languages) {
        const locale = new Intl.Locale(language);
        if (supportedLanguages.includes(locale.language)) {
            return locale.language;
        }
    }
    return 'en';
}
