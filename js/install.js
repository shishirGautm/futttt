(function() {
  const installButton = document.getElementById('installAppButton');
  if (!installButton) return;

  let deferredInstallPrompt = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  if (isStandalone) installButton.hidden = true;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateButtonPosition(x, y) {
    const maxX = window.innerWidth - installButton.offsetWidth - 12;
    const maxY = window.innerHeight - installButton.offsetHeight - 12;
    installButton.style.right = 'auto';
    installButton.style.left = clamp(x, 12, maxX) + 'px';
    installButton.style.bottom = 'auto';
    installButton.style.top = clamp(y, 12, maxY) + 'px';
  }

  function setInitialPosition() {
    const buttonWidth = installButton.offsetWidth || 150;
    const buttonHeight = installButton.offsetHeight || 48;
    const defaultX = window.innerWidth - buttonWidth - 24;
    const defaultY = window.innerHeight - buttonHeight - 110;
    updateButtonPosition(defaultX, defaultY);
  }

  window.addEventListener('resize', function() {
    const left = parseFloat(installButton.style.left || '0');
    const top = parseFloat(installButton.style.top || '0');
    if (!Number.isNaN(left) && !Number.isNaN(top)) {
      updateButtonPosition(left, top);
    } else {
      setInitialPosition();
    }
  });

  window.addEventListener('beforeinstallprompt', function(event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
    setInitialPosition();
  });

  window.addEventListener('appinstalled', function() {
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  installButton.addEventListener('pointerdown', function(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    isDragging = true;
    installButton.setPointerCapture(event.pointerId);
    installButton.classList.add('is-dragging');
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    startX = parseFloat(installButton.style.left || (window.innerWidth - installButton.offsetWidth - 24));
    startY = parseFloat(installButton.style.top || (window.innerHeight - installButton.offsetHeight - 110));
  });

  installButton.addEventListener('pointermove', function(event) {
    if (!isDragging) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    const nextX = startX + dx;
    const nextY = startY + dy;
    updateButtonPosition(nextX, nextY);
  });

  installButton.addEventListener('pointerup', function(event) {
    if (!isDragging) return;
    isDragging = false;
    installButton.classList.remove('is-dragging');
    installButton.releasePointerCapture(event.pointerId);
  });

  installButton.addEventListener('pointerleave', function() {
    if (isDragging) {
      isDragging = false;
      installButton.classList.remove('is-dragging');
    }
  });

  installButton.addEventListener('click', async function(event) {
    if (isDragging) {
      event.preventDefault();
      return;
    }

    if (!deferredInstallPrompt) {
      const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const message = isAppleMobile
        ? 'To install, tap Share in Safari, then choose “Add to Home Screen”.'
        : 'To install, open your browser menu and choose “Install app” or “Add to Home Screen”.';
      window.FNAdminComponents.showToast(message, 'success');
      return;
    }

    const installPrompt = deferredInstallPrompt;
    deferredInstallPrompt = null;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') installButton.hidden = true;
    } catch (error) {
      console.error('Could not open the app installation prompt:', error);
      window.FNAdminComponents.showToast('Could not open the install prompt. Please try again from your browser menu.', 'error');
    }
  });

  setInitialPosition();
})();
