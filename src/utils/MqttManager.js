import mqtt from "mqtt";
export default class MQTT extends EventTarget {
  constructor(host, port, options) {
    super();
    this.host = host;
    this.port = port;
    this.options = options;

    /**
     * === Quality of Service ===
     * QoS0: Sin seguridad de que el mensaje llega correctamente
     * QoS1: Con seguridad minima de que el mensaje llega correctamente
     * QoS2: Con seguridad de que el mensaje llega correctamente
     */
    this.qos = 2;
    this.retain = false;
    this.clientConnected = false;

    this.client = undefined;
    this.subscribedTopics = [];
    this.isConnecting = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const connectUrl = `ws://${this.host}:${this.port}`;

      try {
        this.client = mqtt.connect(connectUrl, this.options);

        this.client.on("connect", () => {
          this.clientConnected = true;
          // Auto-announce if context exists (handles auto-reconnects)
          if (this.currentUserId) {
            this.client.publish(`status/${this.currentUserId}`, "online", {
              retain: true,
              qos: this.options.will?.qos || 1,
            });
          }
          this.dispatchEvent(new Event("connected"));
          resolve(true);
        });

        this.client.on("error", (error) => {
          this.dispatchEvent(new Event("generalError", error));
          reject("mqtt.connect error: ", error);
        });

        this.client.on("message", (topic, message) => {
          this.dispatchEvent(
            new CustomEvent("message", { detail: { topic, message } }),
          );
          let subscribedTopic = this.subscribedTopics.find(
            (subscribedTopic) =>
              subscribedTopic.name === topic ||
              (typeof subscribedTopic.name === "object" &&
                subscribedTopic.name.includes(topic)),
          );
          if (subscribedTopic) {
            subscribedTopic.cb(message, topic);
          }
        });

        this.client.on("reconnect", (error) => {
          this.dispatchEvent(new Event("generalError", error));
          reject("mqtt.connect error: ", error);
        });

        this.client.on("offline", (error) => {
          this.clientConnected = false;
          // this.dispatchEvent(new Event("generalError", error));
          // reject("mqtt.connect error: ", error); // Don't reject, let it retry
        });

        this.client.on("close", (error) => {
          this.clientConnected = false;
          this.dispatchEvent(new Event("generalError", error));
          // reject("mqtt.connect error: ", error);
        });
      } catch (error) {
        this.dispatchEvent(new Event("generalError", error));
        reject("mqtt.connect error: ", error);
      }
    });
  }

  subscribe(topic, cb = () => {}) {
    return new Promise((resolve, reject) => {
      if (
        this.subscribedTopics.some(
          (subscribedTopic) => subscribedTopic.name === topic,
        )
      ) {
        console.error(
          "You are already subscribed to this topic! (" + topic + ")",
        );
      } else {
        this.client.subscribe(topic, { qos: 0 }, (error, res) => {
          if (error) {
            this.dispatchEvent(new Event("generalError", error));
            reject(error);
          } else {
            this.subscribedTopics.push({
              name: topic,
              cb,
            });

            resolve(res, topic);
          }
        });
      }
    });
  }

  unSubscribe(topic) {
    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (error) => {
        if (error) {
          reject("Unsubscribe error", error);
        }
        resolve(true);
        let pos = undefined;
        this.subscribedTopics.forEach((subscribedTopic, index) => {
          if (subscribedTopic.name === topic) {
            pos = index;
          }
        });
        this.subscribedTopics.splice(pos, 1);
      });
    });
  }

  unSubscribeFromAllTopics() {
    let aux = [];

    this.subscribedTopics.forEach((topic) => {
      aux.push(this.unSubscribe(topic.name));
    });

    return Promise.all(aux);
  }

  publish(topic, payload, options = {}) {
    if (process.env.DEV) {
      //return Promise.reject("La publicación mediante MQTT esta BLOQUEADA!");
    }

    return new Promise((resolve, reject) => {
      this.client.publish(
        topic,
        payload,
        {
          qos: options.qos !== undefined ? options.qos : this.qos,
          retain: options.retain !== undefined ? options.retain : this.retain,
        },
        (error) => {
          if (error) {
            reject("Publish error", error);
          } else {
            resolve(true);
          }
        },
      );
    });
  }

  destroy() {
    return new Promise((resolve, reject) => {
      if (this.client) {
        try {
          this.client.end(true); // Force close
          this.client = undefined;
          this.clientConnected = false;
          resolve(true);
        } catch (error) {
          reject("Disconnect failed", error.toString());
        }
      } else {
        // Already disconnected or never connected, resolve anyway
        resolve(true);
      }
    });
  }

  async setPresence(userId) {
    if (
      this.currentUserId === userId &&
      (this.clientConnected || this.isConnecting)
    ) {
      // console.log("MQTT Presence already active/connecting for", userId);
      return;
    }

    // Lock
    this.currentUserId = userId;
    this.isConnecting = true;

    try {
      // 1. Disconnect existing
      await this.destroy().catch(() => {});

      // 2. Configure LWT
      this.options.will = {
        topic: `status/${userId}`,
        payload: "offline",
        qos: 1,
        retain: true,
      };

      // 3. Reconnect
      await this.connect();

      // 4. Announce Online
      this.publish(`status/${userId}`, "online", { retain: true });
    } catch (e) {
      console.error("Error setting presence:", e);
    } finally {
      this.isConnecting = false;
    }
  }

  async clearPresence(userId) {
    if (!userId) return;
    try {
      await this.publish(`status/${userId}`, "offline", { retain: true });
    } catch (e) {
      console.error("Error clearing presence", e);
    }
  }
}
