export function formatCurrency(v, decimals = 2) {
  return Number(v).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercent(v, decimals = 4) {
  return (v * 100).toFixed(decimals) + '%'
}

export function validatePositive(v, label) {
  if (v == null || isNaN(v) || v <= 0) return `${label} must be positive`
  return null
}

export function validateRange(v, min, max, label) {
  if (v == null || isNaN(v)) return `${label} is required`
  if (v < min || v > max) return `${label} must be between ${min} and ${max}`
  return null
}

export function validateRate(v, label = 'Rate') {
  return validateRange(v, 0, 1, label)
}

export function validateAge(v) {
  return validateRange(v, 0, 120, 'Age')
}

export function validateTerm(v) {
  return validatePositive(v, 'Term')
}

export function markInvalid(el, message) {
  el.setCustomValidity(message || '')
  el.classList.toggle('field-invalid', !!message)
  if (message) el.title = message
  else el.title = ''
}

export function clearValidation(...els) {
  els.forEach(el => {
    if (el) { el.setCustomValidity(''); el.classList.remove('field-invalid'); el.title = '' }
  })
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    try { document.execCommand('copy'); return true } catch { return false }
    finally { document.body.removeChild(ta) }
  }
}

export function debounce(fn, ms = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function setButtonLoading(btn, loading) {
  if (!btn) return
  if (loading) {
    btn._origText = btn.textContent
    btn.innerHTML = '<span class="spinner"></span>'
    btn.disabled = true
  } else {
    btn.innerHTML = btn._origText || ''
    btn.disabled = false
  }
}
