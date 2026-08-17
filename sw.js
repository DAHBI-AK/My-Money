const CACHE_NAME = 'masroofi-gold-v53';
const REMINDER_DB = 'masroofi-sw';
const REMINDER_STORE = 'reminders';
const I18N_STORE = 'i18n';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './translations.js',
  './app.js',
  './manifest.json',
  './assets/logo.jpg',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(ASSETS_TO_CACHE.map((url) => cache.add(url).catch(() => null)));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
    await checkDueReminders();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAppShell = request.mode === 'navigate'
    || /\.(?:html|js|css)$/i.test(url.pathname)
    || url.pathname.endsWith('/');

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Prefer network for HTML/JS/CSS so updates are not stuck on an old cache.
    if (isAppShell) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (_) {
        return (await cache.match(request, { ignoreSearch: true }))
          || (await cache.match('./index.html'))
          || (await cache.match('./'))
          || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    }

    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) {
      event.waitUntil(
        fetch(request).then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
        }).catch(() => null)
      );
      return cached;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (_) {
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SYNC_REMINDERS') {
    event.waitUntil((async () => {
      await saveReminders(data.reminders || []);
      try { await saveI18n(data.i18n || {}); } catch (_) {}
      await checkDueReminders();
    })());
    return;
  }
  if (data.type === 'NOTIFY') {
    event.waitUntil(showAlert(data));
  }
  if (data.type === 'CHECK') {
    event.waitUntil(checkDueReminders());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'masroofi-check') {
    event.waitUntil(checkDueReminders());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'masroofi-check') {
    event.waitUntil(checkDueReminders());
  }
});

self.addEventListener('notificationclick', (event) => {
  const data = event.notification.data || {};
  event.notification.close();
  const buyUrl = event.action === 'buy' ? data.buyUrl : '';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (buyUrl) {
      await self.clients.openWindow(buyUrl);
      return;
    }
    if (all[0]) {
      await all[0].focus();
      all[0].postMessage({ type: 'OPEN_TIMERS' });
      return;
    }
    await self.clients.openWindow('./index.html');
  })());
});

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(REMINDER_DB, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(REMINDER_STORE)) {
        db.createObjectStore(REMINDER_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(I18N_STORE)) {
        db.createObjectStore(I18N_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveReminders(list) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(REMINDER_STORE, 'readwrite');
    const store = tx.objectStore(REMINDER_STORE);
    store.clear();
    (list || []).forEach((item) => store.put(item));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadReminders() {
  const db = await openDb();
  const list = await new Promise((resolve, reject) => {
    const tx = db.transaction(REMINDER_STORE, 'readonly');
    const req = tx.objectStore(REMINDER_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return list;
}

function nextOccurrence(from, freq) {
  const d = new Date(Math.max(from, Date.now()));
  if (freq === 'daily') d.setDate(d.getDate() + 1);
  else if (freq === 'weekly') d.setDate(d.getDate() + 7);
  else if (freq === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (freq === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setDate(d.getDate() + 7);
  return d.getTime();
}

async function saveI18n(i18n) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(I18N_STORE, 'readwrite');
    tx.objectStore(I18N_STORE).put({
      id: 'ui',
      appName: i18n.appName || 'My Money',
      buyOnline: i18n.buyOnline || 'Buy online',
      openApp: i18n.openApp || 'Open app'
    });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadI18n() {
  try {
    const db = await openDb();
    const row = await new Promise((resolve, reject) => {
      const tx = db.transaction(I18N_STORE, 'readonly');
      const req = tx.objectStore(I18N_STORE).get('ui');
      req.onsuccess = () => resolve(req.result || {});
      req.onerror = () => reject(req.error);
    });
    db.close();
    return row;
  } catch (_) {
    return {};
  }
}

async function checkDueReminders() {
  const list = await loadReminders();
  const i18n = await loadI18n();
  const now = Date.now();
  let changed = false;

  for (const rem of list) {
    if (!rem.enabled || now < Number(rem.nextAt)) continue;
    if (rem.lastFiredAt && now - rem.lastFiredAt < 20000) continue;
    rem.lastFiredAt = now;
    await showAlert({
      id: rem.id,
      title: rem.title || i18n.appName || 'My Money',
      body: rem.body || '',
      buyUrl: rem.buyUrl || '',
      buyOnline: i18n.buyOnline,
      openApp: i18n.openApp,
      appName: i18n.appName
    });
    if (rem.freq === 'once') rem.enabled = false;
    else rem.nextAt = nextOccurrence(rem.nextAt, rem.freq);
    changed = true;
  }

  if (changed) {
    await saveReminders(list);
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'REMINDERS_UPDATED', reminders: list }));
  }
}

async function showAlert(data) {
  const i18n = data.appName ? data : await loadI18n();
  const buyTitle = data.buyOnline || i18n.buyOnline || 'Buy online';
  const openTitle = data.openApp || i18n.openApp || 'Open app';
  const fallbackTitle = data.appName || i18n.appName || 'My Money';
  const actions = data.buyUrl
    ? [
      { action: 'buy', title: buyTitle },
      { action: 'open', title: openTitle }
    ]
    : [{ action: 'open', title: openTitle }];

  await self.registration.showNotification(data.title || fallbackTitle, {
    body: data.body || '',
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    tag: data.id || 'masroofi',
    renotify: true,
    vibrate: [180, 80, 180],
    data: { buyUrl: data.buyUrl || '', id: data.id || '' },
    actions
  });
}
