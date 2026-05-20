// Only allow same-origin relative paths. A push payload must never be
// able to navigate the user to an absolute or protocol-relative URL.
function safeUrl(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/home"
  }
  return raw
}

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || "Rally"
  const options = {
    body: data.body || "You have an update!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: safeUrl(data.url) },
    tag: data.tag || "rally-notification",
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = safeUrl(event.notification.data?.url)
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
