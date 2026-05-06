import { defineStore } from 'pinia';
import { ref } from 'vue';

const MAX_VISIBLE_ALERTS = 5;

export const useNotificationStore = defineStore('notifications', () => {
  const alerts = ref([]);
  const position = ref('top-right'); // top-right, top-left, bottom-right, bottom-left

  const addNotification = (notif) => {
    const id = Date.now() + Math.random();
    const type = notif.type || 'info';
    const timeout = notif.timeout ?? 5000;

    const newAlert = {
      id,
      title: notif.title || getDefaultTitle(type),
      message: notif.message || '',
      type, // success, warning, error, fatal, info
      icon: notif.icon || getDefaultIcon(type),
      timeout,
      remaining: timeout,
      startedAt: null,
      timerId: null
    };

    const nextAlerts = [...alerts.value, newAlert];
    const droppedAlerts = nextAlerts.slice(0, Math.max(0, nextAlerts.length - MAX_VISIBLE_ALERTS));
    droppedAlerts.forEach(clearAlertTimer);
    alerts.value = nextAlerts.slice(-MAX_VISIBLE_ALERTS);

    if (timeout > 0) {
      startAlertTimer(newAlert);
    }
  };

  const removeNotification = (id) => {
    const alert = alerts.value.find(a => a.id === id);
    clearAlertTimer(alert);
    alerts.value = alerts.value.filter(a => a.id !== id);
  };

  const setPosition = (pos) => {
    position.value = pos;
  };

  const pauseNotification = (id) => {
    const alert = alerts.value.find(a => a.id === id);
    if (!alert || alert.timeout <= 0 || !alert.timerId) return;

    clearTimeout(alert.timerId);
    alert.timerId = null;
    alert.remaining = Math.max(0, alert.remaining - (Date.now() - alert.startedAt));
  };

  const resumeNotification = (id) => {
    const alert = alerts.value.find(a => a.id === id);
    if (!alert || alert.timeout <= 0 || alert.timerId || alert.remaining <= 0) return;

    startAlertTimer(alert);
  };

  function startAlertTimer(alert) {
    alert.startedAt = Date.now();
    alert.timerId = setTimeout(() => {
      removeNotification(alert.id);
    }, alert.remaining);
  }

  function clearAlertTimer(alert) {
    if (!alert?.timerId) return;

    clearTimeout(alert.timerId);
    alert.timerId = null;
  }

  function getDefaultIcon(type) {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error_outline';
      case 'fatal': return 'bolt';
      default: return 'info';
    }
  }

  function getDefaultTitle(type) {
    switch (type) {
      case 'success': return 'Exito';
      case 'warning': return 'Advertencia';
      case 'error': return 'Error';
      case 'fatal': return 'Error Critico';
      default: return 'Informacion';
    }
  }

  return {
    alerts,
    position,
    addNotification,
    removeNotification,
    pauseNotification,
    resumeNotification,
    setPosition
  };
});
