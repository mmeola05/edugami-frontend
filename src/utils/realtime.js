import { getToken } from "src/utils/authUtil";

class RealtimeService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.status = "disconnected";
    this.statusListeners = [];
    this.reconnectTimeout = null;
  }

  connect(url) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = getToken();
    const fullUrl = `${url}?token=${token}`; // SSE doesn't support custom headers easily, so we pass token in query

    this.eventSource = new EventSource(fullUrl);
    this.updateStatus("connecting");

    this.eventSource.onopen = () => {
      this.updateStatus("connected");
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      this.updateStatus("disconnected");
      this.eventSource.close();

      // Auto-reconnect after 5 seconds
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          this.connect(url);
        }, 5000);
      }
    };

    // Generic message handler
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notify("message", data);
      } catch (e) {
        console.error("Failed to parse SSE message:", e);
      }
    };

    // Listen for specific event types if backend sends them
    // Example: event: metrics
    // res.write(`event: metrics\ndata: ...\n\n`)
  }

  on(event, callback) {
    if (this.eventSource) {
      this.eventSource.addEventListener(event, (e) => {
        try {
          const data = JSON.parse(e.data);
          callback(data);
        } catch (err) {
          callback(e.data);
        }
      });
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  updateStatus(status) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.status);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.updateStatus("disconnected");
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => cb(data));
    }
  }
}

export const realtimeService = new RealtimeService();
