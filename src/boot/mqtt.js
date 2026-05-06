import { boot } from 'quasar/wrappers'
import MQTT from 'src/utils/MqttManager'

export default boot(({ app }) => {
  // Use VITE_ prefix or fallbacks. Ensure protocol is ws:// in logic or MqttManager
  const host = import.meta.env.VITE_IPMQTT
  const port = import.meta.env.VITE_PUERTOMQTT
  const options = {
    clean: true,
    connectTimeout: 4000,
    clientId: 'edugami_client_' + Math.random().toString(16).substr(2, 8),
    username: import.meta.env.VITE_MQTT_USERNAME,
    password: import.meta.env.VITE_MQTT_PASSWORD
  }

  const mqttClient = new MQTT(host, port, options)
  
  // Attempt connect
  mqttClient.connect()
    .then(() => console.log('MQTT Connected'))
    .catch(err => console.error('MQTT Connect Error:', err))

  // Global + Provide
  app.config.globalProperties.$mqtt = mqttClient
  app.provide('mqtt', mqttClient)
})
