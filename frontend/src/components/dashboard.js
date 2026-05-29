import { showToast } from '../lib/toast.js'
import { validatePositive, validateRate, validateAge, markInvalid, clearValidation, setButtonLoading, copyToClipboard, formatCurrency } from '../lib/utils.js'

function valid(id) { return document.getElementById(id) }

export function init(container) {
  container.innerHTML = `
    <div class="welcome">
      <h2>Actuarial Workbench</h2>
      <p class="subtitle">Powered by <strong>v-star</strong> engine. Select a tool above. <kbd>Ctrl+1-9</kbd> switch tabs.</p>
    </div>
    <div class="terminal-box">
      <div class="terminal-header">
        <span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span>
        <span class="terminal-title">lubasi@v-desktop ~ % ./quick-calc</span>
      </div>
      <div class="terminal-body">
        <div class="dashboard-grid">
          <div class="card quick-calc" onkeydown="if(event.key==='Enter')window._dashCalc()">
            <h3>Present Value</h3>
            <div class="field"><label>Rate (i)</label><input id="dash-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
            <div class="field"><label>Amount</label><input id="dash-amount" type="number" value="100000" min="1"></div>
            <div class="field"><label>Term</label><input id="dash-term" type="number" value="20" min="1"></div>
            <button id="dash-btn" onclick="window._dashCalc()">Calculate PV</button>
            <div class="result-box" id="dash-result"></div>
          </div>
          <div class="card quick-calc" onkeydown="if(event.key==='Enter')window._dashAnn()">
            <h3>Life Annuity</h3>
            <div class="field"><label>Age</label><input id="dash-age" type="number" value="65" min="0" max="120"></div>
            <div class="field"><label>Amount</label><input id="dash-ann-amount" type="number" value="1000" min="1"></div>
            <div class="field"><label>Rate</label><input id="dash-ann-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
            <button id="dash-ann-btn" onclick="window._dashAnn()">Calculate</button>
            <div class="result-box" id="dash-ann-result"></div>
          </div>
          <div class="card quick-calc" onkeydown="if(event.key==='Enter')window._dashMC()">
            <h3>Monte Carlo</h3>
            <div class="field"><label>Paths</label><input id="dash-paths" type="number" value="10000" min="100"></div>
            <div class="field"><label>Steps</label><input id="dash-steps" type="number" value="10" min="1"></div>
            <div class="field"><label>Volatility</label><input id="dash-vol" type="number" value="0.15" step="0.01" min="0.001"></div>
            <button id="dash-mc-btn" onclick="window._dashMC()">Run</button>
            <div class="result-box" id="dash-mc-result"></div>
          </div>
        </div>
      </div>
    </div>`

  window._dashCalc = async () => {
    const rate = parseFloat(valid('dash-rate').value)
    const amount = parseFloat(valid('dash-amount').value)
    const term = parseInt(valid('dash-term').value)
    clearValidation(valid('dash-rate'), valid('dash-amount'), valid('dash-term'))

    const err = validateRate(rate) || validatePositive(amount, 'Amount') || validatePositive(term, 'Term')
    if (err) { showToast(err, 'warning'); return }

    setButtonLoading(valid('dash-btn'), true)
    try {
      const pv = await window.go.main.App.CalculatePV(rate, amount, term)
      const el = valid('dash-result')
      el.innerHTML = `PV = <strong class="result-value">${formatCurrency(pv)}</strong>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('PV: ${pv.toFixed(2)}')">Copy</button>`
      showToast('PV calculated', 'success')
    } catch (e) { valid('dash-result').textContent = 'Error: ' + e; showToast('Calculation failed', 'error') }
    finally { setButtonLoading(valid('dash-btn'), false) }
  }

  window._dashAnn = async () => {
    const age = parseInt(valid('dash-age').value)
    const amount = parseFloat(valid('dash-ann-amount').value)
    const rate = parseFloat(valid('dash-ann-rate').value)
    clearValidation(valid('dash-age'), valid('dash-ann-amount'), valid('dash-ann-rate'))

    const err = validateAge(age) || validatePositive(amount, 'Amount') || validateRate(rate)
    if (err) { showToast(err, 'warning'); return }

    setButtonLoading(valid('dash-ann-btn'), true)
    try {
      const tables = await window.go.main.App.GetTableNames()
      const tableName = tables[0] || 'cso2017_male'
      const resp = await window.go.main.App.CalcAnnuity({
        tableName, type: 'whole-life-immediate', age, term: 0, deferment: 0, amount, rate,
      })
      const el = valid('dash-ann-result')
      el.innerHTML = `Annuity PV = <strong class="result-value">${formatCurrency(resp.presentValue)}</strong>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('Annuity PV: ${resp.presentValue.toFixed(2)}')">Copy</button>`
      showToast('Annuity calculated', 'success')
    } catch (e) { valid('dash-ann-result').textContent = 'Error: ' + e; showToast('Calculation failed', 'error') }
    finally { setButtonLoading(valid('dash-ann-btn'), false) }
  }

  window._dashMC = async () => {
    const numPaths = parseInt(valid('dash-paths').value)
    const steps = parseInt(valid('dash-steps').value)
    const vol = parseFloat(valid('dash-vol').value)
    clearValidation(valid('dash-paths'), valid('dash-steps'), valid('dash-vol'))

    const err = validatePositive(numPaths, 'Paths') || validatePositive(steps, 'Steps') || validatePositive(vol, 'Volatility')
    if (err) { showToast(err, 'warning'); return }

    setButtonLoading(valid('dash-mc-btn'), true)
    try {
      const resp = await window.go.main.App.RunGBM({
        model: 'gbm', initialRate: 0.05, drift: 0.02, volatility: vol,
        longTermMean: 0, meanReversion: 0, numPaths, steps, dt: 1.0, seed: 42,
      })
      let min = Infinity, max = -Infinity, sum = 0
      resp.finalValues.forEach(v => { min = Math.min(min, v); max = Math.max(max, v); sum += v })
      const mean = sum / resp.finalValues.length
      const el = valid('dash-mc-result')
      el.innerHTML =
        `Mean: <strong class="result-value">${mean.toFixed(4)}</strong> &nbsp;|&nbsp; Min: ${min.toFixed(4)} &nbsp;|&nbsp; Max: ${max.toFixed(4)}<br><span class="result-meta">${numPaths.toLocaleString()} paths</span>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('MC: Mean=${mean.toFixed(4)}, Min=${min.toFixed(4)}, Max=${max.toFixed(4)}')">Copy</button>`
      showToast('Simulation complete', 'success')
    } catch (e) { valid('dash-mc-result').textContent = 'Error: ' + e; showToast('Simulation failed', 'error') }
    finally { setButtonLoading(valid('dash-mc-btn'), false) }
  }

  window._copyText = async text => {
    const ok = await copyToClipboard(text)
    if (ok) showToast('Copied to clipboard', 'success')
    else showToast('Copy failed', 'error')
  }
}
