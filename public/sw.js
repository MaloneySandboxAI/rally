self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || "Rally"
  const options = {
    body: data.body || "You have an update!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: data.url || "/home" },
    tag: data.tag || "rally-notification",
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/home"
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
