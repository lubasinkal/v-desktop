const TOAST_CONTAINER_ID = 'toast-container'

function getContainer() {
  let el = document.getElementById(TOAST_CONTAINER_ID)
  if (!el) {
    el = document.createElement('div')
    el.id = TOAST_CONTAINER_ID
    document.body.appendChild(el)
  }
  return el
}

export function showToast(message, type = 'info', duration = 3500) {
  const container = getContainer()
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.setAttribute('role', 'alert')

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `

  toast.querySelector('.toast-close').onclick = () => dismiss(toast)
  container.appendChild(toast)

  requestAnimationFrame(() => toast.classList.add('toast-visible'))

  const timer = setTimeout(() => dismiss(toast), duration)
  toast._timer = timer

  return toast
}

function dismiss(toast) {
  clearTimeout(toast._timer)
  toast.classList.remove('toast-visible')
  toast.addEventListener('transitionend', () => toast.remove(), { once: true })
}
