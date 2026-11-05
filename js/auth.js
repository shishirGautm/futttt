window.FNAdminAuth = window.FNAdminAuth || {};

window.FNAdminAuth.user = null;
window.FNAdminAuth.loadingOperations = 0;

window.FNAdminAuth.setLoading = function(message) {
  const loading = document.getElementById('authLoginLoading');
  if (!loading) return;
  this.loadingOperations += 1;
  const label = loading.querySelector('.auth-login-message');
  if (label) label.textContent = message;
  loading.hidden = false;
  document.body.classList.add('auth-login-loading-active');
};

window.FNAdminAuth.updateLoading = function(message) {
  const loading = document.getElementById('authLoginLoading');
  const label = loading && loading.querySelector('.auth-login-message');
  if (label) label.textContent = message;
};

window.FNAdminAuth.clearLoading = function() {
  this.loadingOperations = Math.max(0, this.loadingOperations - 1);
  if (this.loadingOperations > 0) return;
  const loading = document.getElementById('authLoginLoading');
  if (loading) loading.hidden = true;
  if (document.body) document.body.classList.remove('auth-login-loading-active');
};

window.FNAdminAuth.isAuthenticated = function() {
  return !!this.user;
};

window.FNAdminAuth.getRole = function() {
  return this.user ? this.user.role : null;
};

window.FNAdminAuth.showLandingPage = function() {
  const landingPage = document.getElementById('publicLanding');
  const authScreen = document.getElementById('authScreen');
  const appShell = document.getElementById('app-shell');
  const userSection = document.getElementById('userSection');
  const ownerSection = document.getElementById('ownerSection');
  if (document.body) document.body.classList.remove('auth-active');
  if (document.body) document.body.classList.add('public-home');
  if (landingPage) landingPage.classList.remove('hidden');
  if (authScreen) authScreen.classList.add('hidden');
  if (appShell) appShell.classList.add('hidden');
  if (userSection) userSection.classList.add('hidden');
  if (ownerSection) ownerSection.classList.add('hidden');
};

window.FNAdminAuth.openLogin = function(role = 'user') {
  this.toggleAuthScreens(true);
  const roleButton = document.querySelector('.access-btn[data-role="' + role + '"]');
  if (roleButton) roleButton.click();
  const email = document.getElementById('authLoginEmail');
  if (email) email.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.FNAdminAuth.resolveFirebaseProfile = function(firebaseUser) {
  const uid = firebaseUser.uid;
  const fallbackName = firebaseUser.displayName || firebaseUser.email || 'Player';
  const fallbackProfile = { role: 'User', name: fallbackName };
  const readDoc = (collectionName, docId) => firebase.firestore().collection(collectionName).doc(docId).get().catch((error) => {
    if (error && error.code === 'permission-denied') return null;
    throw error;
  });

  return readDoc('admins', uid).then((adminDoc) => {
    if (adminDoc && adminDoc.exists) return { role: 'Admin', name: adminDoc.data().name || fallbackName };
    return readDoc('users', uid).then((userDoc) => {
      if (userDoc && userDoc.exists && userDoc.data().role === 'Owner') return { role: 'Owner', name: userDoc.data().name || fallbackName };
      if (userDoc && userDoc.exists) return { role: 'User', name: userDoc.data().name || fallbackName };
      return null;
    }).then((profile) => {
      if (profile) return profile;
      return firebase.firestore().collection('courts').where('ownerId', '==', uid).limit(1).get().catch((error) => {
        if (error && error.code === 'permission-denied') return { empty: true };
        throw error;
      }).then((ownerCourts) => {
        if (ownerCourts && ownerCourts.empty) return fallbackProfile;
        return { role: 'Owner', name: fallbackName };
      });
    });
  }).catch((error) => {
    if (error && error.code === 'permission-denied') return fallbackProfile;
    throw error;
  });
};

window.FNAdminAuth.toggleAuthScreens = function(showAuth) {
  const landingPage = document.getElementById('publicLanding');
  const authScreen = document.getElementById('authScreen');
  const appShell = document.getElementById('app-shell');
  const userSection = document.getElementById('userSection');
  const ownerSection = document.getElementById('ownerSection');

  if (document.body) {
    document.body.classList.toggle('auth-active', showAuth);
    document.body.classList.toggle('public-home', !showAuth && !this.isAuthenticated());
  }
  if (landingPage) landingPage.classList.toggle('hidden', showAuth || this.isAuthenticated());
  if (authScreen) authScreen.classList.toggle('hidden', !showAuth);
  if (appShell) appShell.classList.toggle('hidden', showAuth || ['User', 'Owner'].includes(this.getRole()));
  if (userSection) userSection.classList.toggle('hidden', showAuth || this.getRole() !== 'User');
  if (ownerSection) ownerSection.classList.toggle('hidden', showAuth || this.getRole() !== 'Owner');
};

window.FNAdminAuth.setUser = function(user) {
  this.user = user;
  const role = (user && user.role) || 'Admin';
  const authScreen = document.getElementById('authScreen');
  const appShell = document.getElementById('app-shell');
  const userSection = document.getElementById('userSection');
  const ownerSection = document.getElementById('ownerSection');

  const landingPage = document.getElementById('publicLanding');
  if (document.body) document.body.classList.remove('auth-active', 'public-home');
  if (landingPage) landingPage.classList.add('hidden');
  if (authScreen) authScreen.classList.add('hidden');
  if (appShell) appShell.classList.toggle('hidden', role === 'User' || role === 'Owner');
  if (userSection) userSection.classList.toggle('hidden', role !== 'User');
  if (ownerSection) ownerSection.classList.toggle('hidden', role !== 'Owner');
};

window.FNAdminAuth.login = function(email, password, role = 'admin') {
  const demoAccounts = {
    admin: { email: 'admin@futsalnepal.com', password: 'admin123', name: 'Admin Nepal', displayRole: 'Admin' },
    user: { email: 'user@futsalnepal.com', password: 'user123', name: 'Futsal Customer', displayRole: 'User' },
    owner: { email: 'owner@futsalnepal.com', password: 'owner123', name: 'Aarav Shrestha', displayRole: 'Owner' }
  };

  const account = demoAccounts[role] || demoAccounts.admin;
  if (email === account.email && password === account.password) {
    window.FNAdmin.demoMode = true;
    window.FNAdmin.state = window.FNAdmin.demoState;
    this.setUser({ uid: 'demo-' + account.displayRole.toLowerCase(), email, name: account.name, role: account.displayRole });
    if (!window.FNAdmin.state) window.FNAdmin.state = {};
    window.FNAdmin.state.bookings = window.FNAdmin.state.bookings || [];
    window.FNAdmin.state.courts = window.FNAdmin.state.courts || [];
    window.FNAdmin.state.notifications = window.FNAdmin.state.notifications || [];
    window.FNAdminComponents.showToast('Welcome back, ' + account.name + '. Demo mode is active for local testing.', 'success');
    return Promise.resolve(true);
  }

  if (!window.FNAdmin.demoMode && window.firebase && firebase.auth) {
    return firebase.auth().signInWithEmailAndPassword(email, password).then((credential) => {
      const uid = credential.user.uid;
      this.user = { uid, email, name: email, role: 'User' };
      return this.resolveFirebaseProfile(credential.user).then((profile) => {
        if (role && String(profile.role).toLowerCase() !== role.toLowerCase()) {
          return firebase.auth().signOut().then(() => {
            throw new Error('This account does not match the selected access type.');
          });
        }
        this.setUser({ uid, email, name: profile.name, role: profile.role });
        window.FNAdmin.subscribeToBookings();
        const profileWrite = profile.role === 'User' ? window.FNAdminData.save('users', uid, { id: uid, email, name: profile.name, updatedAt: new Date().toISOString() }) : Promise.resolve();
        return profileWrite.then(() => window.FNAdminData.loadState(profile.role)).catch((error) => {
          console.error('Unable to load Firebase collections after login:', error);
          window.FNAdminComponents.showToast('Some Firebase data could not be loaded. Check your connection and permissions.', 'error');
          return true;
        }).then(() => {
          window.FNAdminData.subscribeState(profile.role);
          window.FNAdmin.subscribeToBookings();
          window.FNAdminComponents.showToast('Welcome back, ' + profile.name + '.', 'success');
          return true;
        });
      }).catch((error) => {
        if (error && error.code === 'permission-denied') {
          const fallbackRole = (role && role.toLowerCase() === 'owner') ? 'Owner' : ((role && role.toLowerCase() === 'admin') ? 'Admin' : 'User');
          this.setUser({ uid: credential.user.uid, email, name: credential.user.displayName || email, role: fallbackRole });
          return window.FNAdminData.loadState(fallbackRole).then(() => {
            window.FNAdminData.subscribeState(fallbackRole);
            window.FNAdmin.subscribeToBookings();
            return true;
          });
        }
        throw error;
      });
    }).catch((error) => {
      const message = error.code === 'auth/invalid-credential'
        ? 'Incorrect Firebase email or password.'
        : error.code === 'auth/user-not-found'
          ? 'No Firebase account exists for this email.'
          : error.message || 'Unable to sign in.';
      window.FNAdminComponents.showToast(message, 'error');
      return false;
    });
  }

  window.FNAdminComponents.showToast('Use the matching demo credentials for the selected role.', 'error');
  return Promise.resolve(false);
};

window.FNAdminAuth.sendUserPasswordReset = function(email) {
  if (window.location.protocol === 'file:') {
    return Promise.reject(new Error('Open Futsal Nepal from a local web server (localhost) or its HTTPS website. Firebase cannot send reset emails from a file:// page.'));
  }
  if (window.FNAdmin.demoMode) {
    return Promise.reject(new Error('Password reset is unavailable for demo accounts. Use a player account registered in Firebase Authentication.'));
  }
  if (!window.firebase || !firebase.auth) {
    return Promise.reject(new Error('Firebase Authentication did not load. Check your connection and reload the page.'));
  }
  if (!window.FNAdmin.ensureFirebase()) {
    return Promise.reject(new Error('Firebase could not initialize. Check the Firebase configuration and reload the page.'));
  }
  return firebase.auth().sendPasswordResetEmail(email);
};

window.FNAdminAuth.loginWithGoogle = function() {
  if (window.FNAdmin.demoMode || !window.firebase || !firebase.auth || !firebase.apps || !firebase.apps.length) {
    const reason = window.FNAdmin.firebaseError ? window.FNAdmin.firebaseError.message : 'Firebase Authentication is not initialized.';
    window.FNAdminComponents.showToast('Google sign-in is unavailable: ' + reason, 'error');
    return Promise.resolve(false);
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  return firebase.auth().signInWithPopup(provider).then((credential) => {
    const firebaseUser = credential.user;
    this.user = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email, role: 'User' };
    return this.resolveFirebaseProfile(firebaseUser).then((profile) => {
      this.setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: profile.name, role: profile.role });
      const profileWrite = profile.role === 'User' ? window.FNAdminData.save('users', firebaseUser.uid, { id: firebaseUser.uid, email: firebaseUser.email, name: profile.name, updatedAt: new Date().toISOString() }) : Promise.resolve();
      return profileWrite.then(() => window.FNAdminData.loadState(profile.role)).then(() => {
        window.FNAdminData.subscribeState(profile.role);
        window.FNAdmin.subscribeToBookings();
        window.FNAdminComponents.showToast('Welcome back, ' + profile.name + '.', 'success');
        window.FNAdminApp.renderAll();
        return true;
      });
    });
  }).catch((error) => {
  this.user = null;
    window.FNAdminComponents.showToast(error.message || 'Google sign-in failed.', 'error');
    return false;
  });
};

window.FNAdminAuth.registerWithGoogle = function(role) {
  if (role === 'Admin') {
    window.FNAdminComponents.showToast('Admin accounts must be created by an existing administrator.', 'error');
    return Promise.resolve(false);
  }
  if (window.FNAdmin.demoMode || !window.firebase || !firebase.auth || !firebase.apps || !firebase.apps.length) {
    window.FNAdminComponents.showToast('Google registration requires Firebase Authentication.', 'error');
    return Promise.resolve(false);
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  return firebase.auth().signInWithPopup(provider).then((credential) => {
    const firebaseUser = credential.user;
    const name = firebaseUser.displayName || firebaseUser.email;
    return window.FNAdminData.save('users', firebaseUser.uid, { id: firebaseUser.uid, name, email: firebaseUser.email, role, createdAt: new Date().toISOString() }).then(() => {
      window.FNAdminAuth.setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name, role });
      return window.FNAdminData.loadState(role).then(() => {
        window.FNAdminData.subscribeState(role);
        window.FNAdmin.subscribeToBookings();
        window.FNAdminApp.renderAll();
        window.FNAdminComponents.showToast('Account created with Google.', 'success');
        return true;
      });
    });
  }).catch((error) => {
    window.FNAdminComponents.showToast(error.message || 'Google registration failed.', 'error');
    return false;
  });
};

window.FNAdminAuth.register = function(name, email, password, role) {
  if (role === 'Admin') {
    window.FNAdminComponents.showToast('Admin accounts must be created by an existing administrator.', 'error');
    return Promise.resolve(false);
  }
  if (window.FNAdmin.demoMode || !window.firebase || !firebase.auth) {
    window.FNAdminComponents.showToast('Account creation requires Firebase Authentication.', 'error');
    return Promise.resolve(false);
  }
  return firebase.auth().createUserWithEmailAndPassword(email, password).then((credential) => {
    const user = credential.user;
    return window.FNAdminData.save('users', user.uid, { id: user.uid, name, email, role, createdAt: new Date().toISOString() }).then(() => {
      this.setUser({ uid: user.uid, email, name, role });
      return window.FNAdminData.loadState(role).then(() => {
        window.FNAdminData.subscribeState(role);
        window.FNAdminComponents.showToast('Account created successfully.', 'success');
        window.FNAdminApp.renderAll();
        return true;
      });
    });
  }).catch((error) => {
    window.FNAdminComponents.showToast(error.message || 'Unable to create account.', 'error');
    return false;
  });
};

window.FNAdminAuth.logout = function() {
  const hadDemoMode = !!(window.FNAdmin && window.FNAdmin.demoMode);
  if (window.FNAdmin) window.FNAdmin.demoMode = false;
  if (window.FNAdmin && window.FNAdmin.demoState) window.FNAdmin.state = window.FNAdmin.demoState;
  if (window.FNAdmin && window.FNAdmin.stopBookingSlotSubscription) window.FNAdmin.stopBookingSlotSubscription();
  if (!hadDemoMode && window.firebase && firebase.auth) firebase.auth().signOut();
  if (window.FNAdmin.listeners) {
    window.FNAdmin.listeners.forEach((unsubscribe) => unsubscribe());
    window.FNAdmin.listeners = [];
  }
  if (window.FNAdminData) window.FNAdminData.stopSubscriptions();
  this.user = null;
  this.showLandingPage();
};

window.FNAdminAuth.init = function() {
  const authLoginForm = document.getElementById('authLoginForm');
  const authLoginEmail = document.getElementById('authLoginEmail');
  const authLoginPassword = document.getElementById('authLoginPassword');
  if (authLoginEmail) authLoginEmail.value = '';
  if (authLoginPassword) authLoginPassword.value = '';

  const accessButtons = document.querySelectorAll('.access-btn');
  const hiddenRoleInput = document.getElementById('authLoginRole');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const updateForgotPasswordVisibility = () => {
    const showForgotPassword = !!(hiddenRoleInput && hiddenRoleInput.value === 'user');
    if (forgotPasswordBtn) {
      forgotPasswordBtn.classList.toggle('hidden', !showForgotPassword);
      forgotPasswordBtn.hidden = !showForgotPassword;
    }
  };
  if (accessButtons.length && hiddenRoleInput) {
    accessButtons.forEach((button) => {
      button.addEventListener('click', function() {
        const role = this.getAttribute('data-role');
        hiddenRoleInput.value = role;
        accessButtons.forEach((btn) => btn.classList.toggle('active', btn === this));
        updateForgotPasswordVisibility();
      });
    });
  }
  updateForgotPasswordVisibility();
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('authLoginEmail');
      if (!emailInput || !emailInput.value.trim()) {
        window.FNAdminComponents.showToast('Enter your account email first.', 'error');
        if (emailInput) emailInput.focus();
        return;
      }
      if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }
      if (forgotPasswordBtn.dataset.resetInProgress === 'true') return;

      forgotPasswordBtn.dataset.resetInProgress = 'true';
      forgotPasswordBtn.disabled = true;
      const originalLabel = forgotPasswordBtn.textContent;
      forgotPasswordBtn.textContent = 'Sending reset email...';
      window.FNAdminAuth.sendUserPasswordReset(emailInput.value.trim()).then(() => {
        window.FNAdminComponents.showToast('If an account exists for this email, password reset instructions will be sent.', 'success');
      }).catch((error) => {
        console.error('Password reset request failed:', error);
        const messages = {
          'auth/invalid-email': 'Enter a valid email address.',
          'auth/user-not-found': 'No player account was found with this email. Create an account first or check the address.',
          'auth/operation-not-allowed': 'Email/password sign-in is disabled. Enable it in Firebase Console under Authentication > Sign-in method.',
          'auth/unauthorized-domain': 'This website domain is not authorized in Firebase. Add it under Authentication > Settings > Authorized domains.',
          'auth/invalid-continue-uri': 'Firebase rejected the reset link domain. Check Authentication > Settings > Authorized domains.',
          'auth/unauthorized-continue-uri': 'This reset link domain is not authorized. Add it under Firebase Authentication > Settings > Authorized domains.',
          'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection and open the app from localhost or an HTTPS website.',
          'auth/too-many-requests': 'Too many reset attempts. Please wait and try again.',
          'app/unsupported-origin': error.message
        };
        const message = error && messages[error.code] || error.message || 'Unable to send password reset instructions.';
        window.FNAdminComponents.showToast(message, 'error');
      }).finally(() => {
        forgotPasswordBtn.dataset.resetInProgress = 'false';
        forgotPasswordBtn.disabled = false;
        forgotPasswordBtn.textContent = originalLabel;
      });
    });
  }

  document.querySelectorAll('[data-open-login]').forEach((button) => {
    button.addEventListener('click', () => {
      window.FNUserPortal.pendingBooking = button.dataset.startBooking === 'true';
      this.openLogin(button.dataset.openLogin || 'user');
    });
  });
  document.querySelectorAll('[data-show-landing]').forEach((button) => {
    button.addEventListener('click', () => {
      window.FNUserPortal.pendingBooking = false;
      this.showLandingPage();
    });
  });
  const landingHeader = document.querySelector('.landing-header');
  const landingMenuToggle = document.querySelector('.landing-menu-toggle');
  const closeLandingMenu = () => {
    if (!landingHeader || !landingMenuToggle) return;
    landingHeader.classList.remove('is-menu-open');
    landingMenuToggle.setAttribute('aria-expanded', 'false');
    landingMenuToggle.setAttribute('aria-label', 'Open navigation');
    landingMenuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  };
  if (landingHeader && landingMenuToggle) {
    landingMenuToggle.addEventListener('click', () => {
      const isOpen = landingHeader.classList.toggle('is-menu-open');
      landingMenuToggle.setAttribute('aria-expanded', String(isOpen));
      landingMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      landingMenuToggle.innerHTML = '<i class="fa-solid fa-' + (isOpen ? 'xmark' : 'bars') + '" aria-hidden="true"></i>';
    });
    landingHeader.querySelectorAll('.landing-nav a').forEach((link) => {
      link.addEventListener('click', closeLandingMenu);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLandingMenu();
    });
    document.addEventListener('click', (event) => {
      if (!event.composedPath().includes(landingHeader)) closeLandingMenu();
    });
  }

  const publicSearchForm = document.getElementById('publicSearchForm');
  if (publicSearchForm) {
    publicSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      window.FNUserPortal.pendingSearchFilters = {
        search: document.getElementById('publicSearchLocation').value.trim(),
        maxPrice: document.getElementById('publicSearchBudget').value,
        type: document.getElementById('publicSearchType').value
      };
      this.openLogin('user');
    });
  }

  if (authLoginForm) {
    authLoginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      if (authLoginForm.dataset.loginInProgress === 'true') return;

      const email = document.getElementById('authLoginEmail').value.trim();
      const password = document.getElementById('authLoginPassword').value.trim();
      const role = hiddenRoleInput ? hiddenRoleInput.value : 'admin';
      const submitButton = authLoginForm.querySelector('button[type="submit"]');
      const roleButtons = document.querySelectorAll('.access-btn');
      authLoginForm.dataset.loginInProgress = 'true';
      authLoginForm.setAttribute('aria-busy', 'true');
      window.FNAdminAuth.setLoading('Logging in...');
      if (submitButton) submitButton.disabled = true;
      roleButtons.forEach((button) => { button.disabled = true; });

      window.FNAdminAuth.login(email, password, role).then((result) => {
        if (result) window.FNAdminApp.renderAll();
      }).catch((error) => {
        console.error('Login flow failed:', error);
        window.FNAdminComponents.showToast('Unable to complete login. Please try again.', 'error');
      }).finally(() => {
        authLoginForm.dataset.loginInProgress = 'false';
        authLoginForm.removeAttribute('aria-busy');
        window.FNAdminAuth.clearLoading();
        if (submitButton) submitButton.disabled = false;
        roleButtons.forEach((button) => { button.disabled = false; });
      });
    });
  }

  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => {
    window.FNAdminAuth.setLoading('Signing in with Google...');
    window.FNAdminAuth.loginWithGoogle().finally(() => window.FNAdminAuth.clearLoading());
  });
  const googleRegisterBtn = document.getElementById('googleRegisterBtn');
  if (googleRegisterBtn) googleRegisterBtn.addEventListener('click', () => {
    window.FNAdminAuth.setLoading('Creating your account...');
    window.FNAdminAuth.registerWithGoogle(document.getElementById('registerRole').value).finally(() => window.FNAdminAuth.clearLoading());
  });

  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const registerPrompt = document.getElementById('authRegisterPrompt');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const toggleRegistration = (showRegistration) => {
    if (loginForm) {
      loginForm.classList.toggle('hidden', showRegistration);
      loginForm.hidden = showRegistration;
    }
    if (registerForm) {
      registerForm.classList.toggle('hidden', !showRegistration);
      registerForm.hidden = !showRegistration;
    }
    if (registerPrompt) {
      registerPrompt.classList.toggle('hidden', showRegistration);
      registerPrompt.hidden = showRegistration;
    }
  };
  toggleRegistration(false);
  if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => toggleRegistration(true));
  if (showLoginBtn) showLoginBtn.addEventListener('click', () => toggleRegistration(false));
  if (registerForm) registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (registerForm.dataset.registerInProgress === 'true') return;
    const submitButton = registerForm.querySelector('button[type="submit"]');
    registerForm.dataset.registerInProgress = 'true';
    registerForm.setAttribute('aria-busy', 'true');
    if (submitButton) submitButton.disabled = true;
    window.FNAdminAuth.setLoading('Creating your account...');
    window.FNAdminAuth.register(
      document.getElementById('registerName').value.trim(),
      document.getElementById('registerEmail').value.trim(),
      document.getElementById('registerPassword').value,
      document.getElementById('registerRole').value
    ).catch((error) => {
      console.error('Registration flow failed:', error);
      window.FNAdminComponents.showToast('Unable to complete registration. Please try again.', 'error');
    }).finally(() => {
      registerForm.dataset.registerInProgress = 'false';
      registerForm.removeAttribute('aria-busy');
      if (submitButton) submitButton.disabled = false;
      window.FNAdminAuth.clearLoading();
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => window.FNAdminAuth.logout());
  }

  const userLogoutBtn = document.getElementById('userLogoutBtn');
  if (userLogoutBtn) {
    userLogoutBtn.addEventListener('click', () => window.FNAdminAuth.logout());
  }

  const ownerLogoutBtn = document.getElementById('ownerLogoutBtn');
  if (ownerLogoutBtn) ownerLogoutBtn.addEventListener('click', () => window.FNAdminAuth.logout());

  const mobileToggle = document.getElementById('mobileToggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  navLinks.forEach((link) => {
    link.addEventListener('click', function() {
      navLinks.forEach((item) => item.classList.remove('active'));
      this.classList.add('active');
      const view = this.getAttribute('data-view');
      document.querySelectorAll('.page-section').forEach((section) => {
        section.classList.toggle('active', section.getAttribute('data-page') === view);
      });
      document.getElementById('pageTitle').textContent = this.textContent.trim();
      if (sidebar) sidebar.classList.remove('open');
      if (view === 'reports' && window.FNAdminReports) window.FNAdminReports.render();
    });
  });

  this.showLandingPage();

  if (!window.FNAdmin.demoMode && window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        if (this.user) this.logout();
        return;
      }
      if (this.user && this.user.uid === firebaseUser.uid) return;
      this.setLoading('Loading your account...');
      const fallbackProfile = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email || 'User', role: 'User' };
      this.resolveFirebaseProfile(firebaseUser).then((profile) => {
        const resolvedProfile = profile || fallbackProfile;
        this.setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: resolvedProfile.name, role: resolvedProfile.role });
        this.updateLoading('Loading your dashboard...');
        return window.FNAdminData.loadState(resolvedProfile.role).catch((error) => {
          console.error('Unable to restore live Firebase data:', error);
          window.FNAdminComponents.showToast('Some Firebase data could not be loaded. Check your connection and permissions.', 'error');
          return true;
        }).then(() => {
          window.FNAdminData.subscribeState(resolvedProfile.role);
          window.FNAdmin.subscribeToBookings();
          window.FNAdminApp.renderAll();
        });
      }).catch((error) => {
        if (error && error.code === 'permission-denied') {
          this.setUser(fallbackProfile);
          return window.FNAdminData.loadState('User').catch(() => Promise.resolve(true)).then(() => {
            window.FNAdminApp.renderAll();
          });
        }
        window.FNAdminComponents.showToast('Unable to load your Firebase profile: ' + error.message, 'error');
      }).finally(() => this.clearLoading());
    });
  }
};
