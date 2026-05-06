
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

export default async ({ app, router, store }) => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push Notifications not supported on Web (yet)')
    return
  }

  try {
    // 1. Request Permission
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push permission denied')
      return
    }

    // 2. Register
    await PushNotifications.register()

    // 3. Listeners
    // Registration successful
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push Registration Token:', token.value)
      try {
        const accessToken = localStorage.getItem('edugami_access_token')
        if (accessToken) {
          await fetch('/api/notifications/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ token: token.value, platform: 'mobile' })
          })
          console.log('Push token saved to backend')
        }
      } catch (err) {
        console.error('Failed to save push token:', err)
      }
    })

    // Registration failed
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error))
    })

    // Foreground Notification
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', notification)
      // Show local toast or update badge
    })

    // Notification Tapped (Action)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification)
      const data = notification.notification.data
      if (data && data.url) {
        router.push(data.url)
      }
    })

    console.log('Push Notifications Initialized')

  } catch (e) {
    console.error('Push Init Error', e)
  }
}
