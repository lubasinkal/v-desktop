export function init(container) {
  container.innerHTML = `
    <div class="welcome">
      <h2>v-desktop — Actuarial Workbench</h2>
      <p class="subtitle">Powered by <strong>v-star</strong> engine. Select a tool from the tabs above.</p>
    </div>
    <div class="dashboard-grid">
      <div class="card quick-calc">
        <h3>Quick PV</h3>
        <div class="field"><label>Rate (i)</label><input id="dash-rate" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>Amount</label><input id="dash-amount" type="number" value="100000"></div>
        <div class="field"><label>Term (years)</label><input id="dash-term" type="number" value="20"></div>
        <button onclick="window._dashCalc()">Calculate PV</button>
        <div class="result-box" id="dash-result"></div>
      </div>
      <div class="card quick-calc">
        <h3>Quick Annuity</h3>
        <div class="field"><label>Age</label><input id="dash-age" type="number" value="65"></div>
        <div class="field"><label>Amount</label><input id="dash-ann-amount" type="number" value="1000"></div>
        <div class="field"><label>Rate (i)</label><input id="dash-ann-rate" type="number" value="0.05" step="0.001"></div>
        <button onclick="window._dashAnn()">Calculate Annuity</button>
        <div class="result-box" id="dash-ann-result"></div>
      </div>
      <div class="card quick-calc">
        <h3>Quick Monte Carlo</h3>
        <div class="field"><label>Paths</label><input id="dash-paths" type="number" value="10000"></div>
        <div class="field"><label>Steps</label><input id="dash-steps" type="number" value="10"></div>
        <div class="field"><label>Volatility</label><input id="dash-vol" type="number" value="0.15" step="0.01"></div>
        <button onclick="window._dashMC()">Run</button>
        <div class="result-box" id="dash-mc-result"></div>
      </div>
    </div>`

  window._dashCalc = async () => {
    const rate = parseFloat(document.getElementById('dash-rate').value)
    const amount = parseFloat(document.getElementById('dash-amount').value)
    const term = parseInt(document.getElementById('dash-term').value)
    try {
      const pv = await window.go.main.App.CalculatePV(rate, amount, term)
      document.getElementById('dash-result').innerHTML = `PV = <strong>${pv.toFixed(2)}</strong>`
    } catch (e) { document.getElementById('dash-result').textContent = 'Error: ' + e }
  }

  window._dashAnn = async () => {
    const age = parseInt(document.getElementById('dash-age').value)
    const amount = parseFloat(document.getElementById('dash-ann-amount').value)
    const rate = parseFloat(document.getElementById('dash-ann-rate').value)
    const tables = await window.go.main.App.GetTableNames()
    const tableName = tables[0] || 'cso2017_male'
    try {
      const resp = await window.go.main.App.CalcAnnuity({
        tableName, type: 'whole-life-immediate', age, term: 0, deferment: 0, amount, rate,
      })
      document.getElementById('dash-ann-result').innerHTML = `Annuity PV = <strong>${resp.presentValue.toFixed(2)}</strong>`
    } catch (e) { document.getElementById('dash-ann-result').textContent = 'Error: ' + e }
  }

  window._dashMC = async () => {
    const numPaths = parseInt(document.getElementById('dash-paths').value)
    const steps = parseInt(document.getElementById('dash-steps').value)
    const vol = parseFloat(document.getElementById('dash-vol').value)
    try {
      const resp = await window.go.main.App.RunGBM({
        model: 'gbm', initialRate: 0.05, drift: 0.02, volatility: vol,
        longTermMean: 0, meanReversion: 0, numPaths, steps, dt: 1.0, seed: 42,
      })
      let min = Infinity, max = -Infinity, sum = 0
      resp.finalValues.forEach(v => { min = Math.min(min, v); max = Math.max(max, v); sum += v })
      const mean = sum / resp.finalValues.length
      document.getElementById('dash-mc-result').innerHTML =
        `Mean: ${mean.toFixed(4)} | Min: ${min.toFixed(4)} | Max: ${max.toFixed(4)} (${numPaths.toLocaleString()} paths)`
    } catch (e) { document.getElementById('dash-mc-result').textContent = 'Error: ' + e }
  }
}
