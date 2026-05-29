const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pv', label: 'PV & Duration' },
  { id: 'annuities', label: 'Annuities' },
  { id: 'mortality', label: 'Mortality' },
  { id: 'reserves', label: 'Reserves' },
  { id: 'montecarlo', label: 'Monte Carlo' },
  { id: 'risk', label: 'Risk' },
  { id: 'census', label: 'Census' },
  { id: 'rate-converter', label: 'Rates' },
  { id: 'profit', label: 'Profit' },
]

export function renderNav(container) {
  const nav = document.createElement('nav')
  nav.className = 'tab-nav'

  const brand = document.createElement('span')
  brand.className = 'tab-nav-brand'
  brand.innerHTML = 'V-<span>DESKTOP</span>'
  nav.appendChild(brand)

  TABS.forEach(t => {
    const btn = document.createElement('button')
    btn.className = 'tab-btn'
    btn.dataset.tab = t.id
    btn.textContent = t.label
    btn.onclick = () => switchTab(t.id)
    nav.appendChild(btn)
  })
  container.prepend(nav)
}

export function switchTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === id)
  })
  document.querySelectorAll('.tab-content').forEach(d => {
    d.classList.toggle('active', d.id === `tab-${id}`)
  })
}

export function createTabContent(id) {
  const div = document.createElement('div')
  div.id = `tab-${id}`
  div.className = 'tab-content'
  return div
}
