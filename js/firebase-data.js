window.FNAdminData = window.FNAdminData || {};

window.FNAdminData.collections = ['courts', 'users', 'teams', 'matches', 'tournaments', 'payments', 'reviews', 'notifications', 'reports', 'admins', 'activityLogs'];
window.FNAdminData.unsubscribers = [];
window.FNAdmin.state = window.FNAdmin.state || {};
window.FNAdmin.state.liveCollections = window.FNAdmin.state.liveCollections || {};

window.FNAdminData.getLiveStatus = function() {
  const reasons = [];
  if (!window.firebase) reasons.push('Firebase SDK not loaded');
  if (!firebase.firestore) reasons.push('Firestore not available');
  if (!firebase.auth) reasons.push('Firebase Auth not available');
  if (firebase.auth && !firebase.auth().currentUser) reasons.push('No Firebase user is signed in');
  if (!window.FNAdmin || !window.FNAdmin.config) reasons.push('Firebase config missing');
  if (window.FNAdmin && window.FNAdmin.demoMode) reasons.push('Demo mode enabled');
  if (window.FNAdmin && window.FNAdmin.config && Object.values(window.FNAdmin.config).some((value) => typeof value === 'string' && /(YOUR_|your_|replace_me|example)/i.test(value))) {
    reasons.push('Firebase config still contains placeholder values');
  }
  return reasons;
};

window.FNAdminData.isLive = function() {
  return this.getLiveStatus().length === 0;
};

window.FNAdminData.getDb = function() {
  if (!this.isLive()) throw new Error('Firebase is not configured.');
  return firebase.firestore();
};

window.FNAdminData.getCollection = function(name) {
  return this.getDb().collection(name);
};

window.FNAdminData.getNotificationQueries = function(role) {
  const collection = this.getCollection('notifications');
  if (role === 'Admin' || role === 'Super Admin' || role === 'Manager') return [collection];
  const user = window.FNAdminAuth && window.FNAdminAuth.user;
  if (!user || !user.uid) return [];
  return [collection.where('targetUserId', '==', user.uid)];
};

window.FNAdminData.loadNotifications = function(role) {
  const queries = this.getNotificationQueries(role);
  if (!queries.length) {
    window.FNAdmin.state.notifications = [];
    return Promise.resolve();
  }
  return Promise.all(queries.map((query) => query.get().catch((error) => {
    if (error && error.code === 'permission-denied') return { docs: [] };
    throw error;
  }))).then((snapshots) => {
    const byId = new Map();
    snapshots.forEach((snapshot) => snapshot.docs.forEach((doc) => byId.set(doc.id, { id: doc.id, ...doc.data() })));
    window.FNAdmin.state.notifications = Array.from(byId.values());
  });
};

window.FNAdminData.ensureCollectionState = function(collectionName, item) {
  window.FNAdmin.state = window.FNAdmin.state || {};
  if (!Array.isArray(window.FNAdmin.state[collectionName])) {
    window.FNAdmin.state[collectionName] = [];
  }
  if (item && !window.FNAdmin.state[collectionName].some((entry) => entry.id === item.id)) {
    window.FNAdmin.state[collectionName].push(item);
  }
};

window.FNAdminData.logActivity = function(action, collectionName, documentId, details) {
  if (!this.isLive() || !firebase.auth().currentUser) return Promise.resolve();
  const actor = firebase.auth().currentUser;
  return this.getCollection('activityLogs').add({
    action,
    collection: collectionName,
    documentId: documentId || null,
    actorId: actor.uid,
    actorEmail: actor.email || null,
    details: details || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch((error) => {
    console.error('Unable to record activity:', error.message);
  });
};

window.FNAdminData.loadState = function(role) {
  if (!this.isLive()) return Promise.resolve(false);
  const allowedCollections = role === 'Admin'
    ? this.collections
    : role === 'Owner'
      ? ['courts', 'bookings', 'notifications']
      : ['courts', 'users', 'teams', 'matches', 'tournaments', 'reviews', 'notifications'];

  const dataCollections = allowedCollections.filter((name) => name !== 'notifications');
  return Promise.all(dataCollections.map((name) => this.getCollection(name).get().then((snapshot) => {
    window.FNAdmin.state[name] = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    window.FNAdmin.state.liveCollections[name] = true;
  }).catch((error) => {
    window.FNAdmin.state.liveCollections[name] = false;
    window.dispatchEvent(new CustomEvent('fn:collection-error', { detail: { collection: name, error } }));
    if (error && (error.code === 'permission-denied' || error.code === 'failed-precondition')) {
      console.warn('Skipping live load for ' + name + ' due to Firebase permissions/configuration.');
      return;
    }
    throw error;
  }))).then(() => this.loadNotifications(role)).then(() => true).catch((error) => {
    if (error && (error.code === 'permission-denied' || error.code === 'failed-precondition')) {
      dataCollections.forEach((name) => { window.FNAdmin.state.liveCollections[name] = false; });
      window.FNAdmin.state.notifications = Array.isArray(window.FNAdmin.state.notifications) ? window.FNAdmin.state.notifications : [];
      return true;
    }
    throw error;
  });
};

window.FNAdminData.save = function(collectionName, documentId, data) {
  if (!this.isLive()) {
    const reasons = this.getLiveStatus();
    const message = reasons.length ? 'Save skipped: ' + reasons.join('; ') : 'Save skipped: Firebase is not live.';
    if (window.FNAdminComponents && typeof window.FNAdminComponents.showToast === 'function') {
      window.FNAdminComponents.showToast(message, 'error');
    } else {
      console.warn(message);
    }
    window.FNAdmin.state = window.FNAdmin.state || {};
    window.FNAdmin.state[collectionName] = window.FNAdmin.state[collectionName] || [];
    const existingIndex = window.FNAdmin.state[collectionName].findIndex((item) => item.id === documentId);
    if (existingIndex >= 0) {
      window.FNAdmin.state[collectionName][existingIndex] = { ...window.FNAdmin.state[collectionName][existingIndex], ...data, id: documentId };
    } else {
      window.FNAdmin.state[collectionName].push({ ...data, id: documentId });
    }
    return Promise.resolve({ id: documentId, ...data });
  }
  return this.getCollection(collectionName).doc(documentId).set(data, { merge: true }).then(() => this.logActivity('save', collectionName, documentId));
};

window.FNAdminData.remove = function(collectionName, documentId) {
  if (!this.isLive()) {
    window.FNAdmin.state = window.FNAdmin.state || {};
    const collection = window.FNAdmin.state[collectionName] || [];
    window.FNAdmin.state[collectionName] = collection.filter((item) => item.id !== documentId);
    return Promise.resolve();
  }
  return this.getCollection(collectionName).doc(documentId).delete().then(() => this.logActivity('delete', collectionName, documentId));
};

window.FNAdminData.uploadAsset = function(file, path) {
  const r2Config = window.FNAdmin && window.FNAdmin.r2Config ? window.FNAdmin.r2Config : null;
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  if (r2Config && r2Config.enabled && file) {
    const uploadMethod = String((r2Config.uploadMethod || 'PUT')).toUpperCase();
    const requestUrl = r2Config.uploadUrl || '';
    const publicUrl = typeof r2Config.getPublicUrl === 'function'
      ? r2Config.getPublicUrl(normalizedPath, file)
      : (r2Config.publicUrl ? new URL(normalizedPath, r2Config.publicUrl.replace(/\/$/, '') + '/').toString() : '');

    if (requestUrl) {
      const body = uploadMethod === 'POST'
        ? (() => {
            const formData = new FormData();
            formData.append('file', file);
            if (normalizedPath) formData.append('key', normalizedPath);
            return formData;
          })()
        : file;

      const headers = Object.assign({}, r2Config.headers || {});
      if (uploadMethod === 'PUT') {
        headers['Content-Type'] = file.type || 'application/octet-stream';
      }

      return fetch(requestUrl, {
        method: uploadMethod,
        headers,
        body
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Cloudflare R2 upload failed.');
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await response.json();
          if (json && (json.url || json.imageUrl || json.publicUrl)) {
            return json.url || json.imageUrl || json.publicUrl;
          }
        }
        return publicUrl || requestUrl;
      });
    }
  }

  if (!window.firebase || !window.firebase.storage || !firebase.storage || window.FNAdmin.demoMode) {
    const reasons = this.getLiveStatus();
    if (!file) return Promise.resolve('');
    const message = reasons.length ? 'Image not saved: ' + reasons.join('; ') : 'Image not saved: Firebase Storage is not available.';
    return Promise.reject(new Error(message));
  }

  return firebase.storage().ref(normalizedPath).put(file).then((snapshot) => snapshot.ref.getDownloadURL());
};

window.FNAdminData.subscribeState = function(role) {
  if (!this.isLive()) return;
  this.unsubscribers.forEach((unsubscribe) => unsubscribe());
  this.unsubscribers = [];
  const allowedCollections = role === 'Admin' ? this.collections : role === 'User' ? ['courts', 'users', 'teams', 'matches', 'tournaments', 'reviews', 'notifications'] : ['courts', 'bookings', 'notifications'];
  allowedCollections.forEach((name) => {
    if (name === 'notifications' || name === 'bookings') return;
    const unsubscribe = this.getCollection(name).onSnapshot((snapshot) => {
      window.FNAdmin.state[name] = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      window.FNAdmin.state.liveCollections[name] = true;
      window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: name } }));
    }, (error) => {
      window.FNAdmin.state.liveCollections[name] = false;
      console.error('Unable to load ' + name + ':', error.message);
      window.dispatchEvent(new CustomEvent('fn:collection-error', { detail: { collection: name, error } }));
    });
    this.unsubscribers.push(unsubscribe);
  });
  const notificationQueries = this.getNotificationQueries(role);
  const notificationSnapshots = new Map();
  notificationQueries.forEach((query, index) => {
    const unsubscribe = query.onSnapshot((snapshot) => {
      notificationSnapshots.set(index, snapshot.docs);
      const byId = new Map();
      notificationSnapshots.forEach((docs) => docs.forEach((doc) => byId.set(doc.id, { id: doc.id, ...doc.data() })));
      window.FNAdmin.state.notifications = Array.from(byId.values());
      window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    }, (error) => {
      console.error('Unable to subscribe to notification updates:', error.message);
      window.dispatchEvent(new CustomEvent('fn:collection-error', { detail: { collection: 'notifications', error } }));
    });
    this.unsubscribers.push(unsubscribe);
  });
};

window.FNAdminData.stopSubscriptions = function() {
  this.unsubscribers.forEach((unsubscribe) => unsubscribe());
  this.unsubscribers = [];
};
