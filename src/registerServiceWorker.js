// ServiceWorkerService.js
const SERVICE_WORKER_API = 'serviceWorker';
const SERVICE_WORKER_FILE_PATH = '/service-worker.js';

const isSupportServiceWorker = () => SERVICE_WORKER_API in navigator;

if (isSupportServiceWorker()) {
    navigator
        .serviceWorker
        .register(SERVICE_WORKER_FILE_PATH)
        .then(() => console.log('Load service worker Success.'))
        .catch(() => console.error('Load service worker fail'));
} else {
    console.info('Browser not support Service Worker.');
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    e.prompt();
    e.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the prompt');
        } else {
            console.log('User dismissed the prompt');
        }
    });
});