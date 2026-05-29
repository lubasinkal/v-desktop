import './style.css'
import './app.css'
import './lib/toast.js'

import { renderNav, switchTab, createTabContent } from './lib/tabs.js'
import * as dashboard from './components/dashboard.js'
import * as pv from './components/pv.js'
import * as annuities from './components/annuities.js'
import * as mortality from './components/mortality.js'
import * as reserves from './components/reserves.js'
import * as montecarlo from './components/montecarlo.js'
import * as risk from './components/risk.js'
import * as census from './components/census.js'
import * as rateConverter from './components/rate-converter.js'

const appEl = document.querySelector('#app')
appEl.innerHTML = ''

const bg = document.createElement('div')
bg.className = 'bg-effects'
bg.innerHTML = '<div class="dot-grid"></div><div class="orb-1"></div><div class="orb-2"></div>'
appEl.appendChild(bg)

renderNav(appEl)

const tabs = [
  { id: 'dashboard', init: dashboard.init },
  { id: 'pv', init: pv.init },
  { id: 'annuities', init: annuities.init },
  { id: 'mortality', init: mortality.init },
  { id: 'reserves', init: reserves.init },
  { id: 'montecarlo', init: montecarlo.init },
  { id: 'risk', init: risk.init },
  { id: 'census', init: census.init },
  { id: 'rate-converter', init: rateConverter.init },
]

tabs.forEach(t => {
  const content = createTabContent(t.id)
  appEl.appendChild(content)
  t.init(content)
})

switchTab('dashboard')

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
    const idx = parseInt(e.key) - 1
    if (idx < tabs.length) switchTab(tabs[idx].id)
  }
})
