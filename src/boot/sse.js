import { getAccessToken } from 'src/utils/authUtil'

let rootSse = null
const ROOT_EVENTS = [
  'access_policy_changed',
  'platform_module_updated',
  'platform_role_permissions_updated',
  'platform_account_rbac_updated',
  'tenant_access_policy_changed'
]

export function connectRootSse(onMessage = () => {}) {
  const token = getAccessToken()
  if (!token) return null

  const url = `http://localhost:7002/api/v1/root/realtime/stream?token=${encodeURIComponent(token)}`
  rootSse = new EventSource(url)

  rootSse.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data))
    } catch {
      onMessage(event.data)
    }
  }

  for (const eventType of ROOT_EVENTS) {
    rootSse.addEventListener(eventType, (event) => {
      try {
        onMessage({ type: eventType, data: JSON.parse(event.data) })
      } catch {
        onMessage({ type: eventType, data: event.data })
      }
    })
  }

  return rootSse
}

export function disconnectRootSse() {
  if (rootSse) {
    rootSse.close()
    rootSse = null
  }
}
