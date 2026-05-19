import './style.css'
import './app.css'

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
