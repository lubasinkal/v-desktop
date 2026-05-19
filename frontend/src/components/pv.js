import { destroyChart, createGroupedBarChart } from '../lib/charts.js'

let durationChart = null

export function init(container) {
  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; present-value</div>
    <h2>Present Value &amp; Duration</h2>
    <div class="calc-grid">
      <div class="card">
        <h3>Present Value</h3>
        <div class="field"><label>Interest Rate (i)</label><input id="pv-rate" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>j (v* rate, optional)</label><input id="pv-j" type="number" value="0" step="0.001"></div>
        <div class="field"><label>Sum Assured</label><input id="pv-sa" type="number" value="100000"></div>
        <div class="field"><label>Term (years)</label><input id="pv-term" type="number" value="20"></div>
        <button onclick="window._pvCalc()">Calculate PV</button>
        <div class="result-box" id="pv-result"></div>
      </div>
      <div class="card">
        <h3>Bulk PV</h3>
        <div class="field"><label>Rate</label><input id="pv-bulk-rate" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>Records</label>
          <textarea id="pv-bulk-records" rows="5">[{"sumAssured":100000,"term":20},{"sumAssured":50000,"term":15},{"sumAssured":200000,"term":30}]</textarea>
        </div>
        <button onclick="window._pvBulk()">Process Bulk</button>
        <div class="result-box" id="pv-bulk-result"></div>
      </div>
    </div>
    <div class="card">
      <h3>Duration Analysis</h3>
      <div class="calc-grid">
        <div>
          <div class="field"><label>Rate (i)</label><input id="pv-dur-rate" type="number" value="0.05" step="0.001"></div>
          <div class="field"><label>Cash Flows</label><input id="pv-cf" type="text" value="100,100,100,1100"></div>
          <button onclick="window._pvDur()">Calculate</button>
        </div>
        <div class="result-box" id="pv-dur-result"></div>
      </div>
      <div class="chart-wrap"><canvas id="pv-dur-chart"></canvas></div>
    </div>`

  window._pvCalc = async () => {
    const rate = parseFloat(document.getElementById('pv-rate').value)
    const j = parseFloat(document.getElementById('pv-j').value)
    const sa = parseFloat(document.getElementById('pv-sa').value)
    const term = parseInt(document.getElementById('pv-term').value)
    try {
      let pv
      if (j !== 0) {
        pv = await window.go.main.App.CalculatePVStar(rate, j, sa, term)
      } else {
        pv = await window.go.main.App.CalculatePV(rate, sa, term)
      }
      const v = await window.go.main.App.V(rate)
      document.getElementById('pv-result').innerHTML =
        `PV = <strong>${pv.toFixed(2)}</strong><br>v = ${v.toFixed(6)}${j !== 0 ? ` &nbsp;|&nbsp; v* = ${(v * (1 + j)).toFixed(6)}` : ''}`
    } catch (e) { document.getElementById('pv-result').textContent = 'Error: ' + e }
  }

  window._pvBulk = async () => {
    const rate = parseFloat(document.getElementById('pv-bulk-rate').value)
    try {
      const records = JSON.parse(document.getElementById('pv-bulk-records').value)
      const resp = await window.go.main.App.ProcessPV({ interestRate: rate, rateJ: 0, records })
      let html = '<table><tr><th>#</th><th>Amount</th><th>Term</th><th>PV</th></tr>'
      resp.results.forEach(r => {
        html += `<tr><td>${r.index}</td><td>${r.sumAssured.toFixed(2)}</td><td>${r.term}</td><td>${r.presentValue.toFixed(2)}</td></tr>`
      })
      html += '</table>'
      document.getElementById('pv-bulk-result').innerHTML = html
    } catch (e) { document.getElementById('pv-bulk-result').textContent = 'Error: ' + e }
  }

  window._pvDur = async () => {
    const rate = parseFloat(document.getElementById('pv-dur-rate').value)
    const cf = document.getElementById('pv-cf').value.split(',').map(Number)
    try {
      const mac = await window.go.main.App.MacaulayDuration(rate, cf)
      const mod = await window.go.main.App.ModifiedDuration(rate, cf)
      const conv = await window.go.main.App.Convexity(rate, cf)
      document.getElementById('pv-dur-result').innerHTML =
        `Macaulay Duration: <strong>${mac.toFixed(4)}</strong><br>Modified Duration: <strong>${mod.toFixed(4)}</strong><br>Convexity: <strong>${conv.toFixed(4)}</strong>`

      destroyChart(durationChart)
      const labels = cf.map((_, i) => `t=${i + 1}`)
      const pvCF = cf.map((c, i) => c / Math.pow(1 + rate, i + 1))
      const canvas = document.getElementById('pv-dur-chart')
      durationChart = createGroupedBarChart(canvas, labels, [
        { label: 'Cash Flow', data: cf, backgroundColor: 'rgba(60, 255, 208, 0.6)', borderColor: '#3cffd0', borderWidth: 1 },
        { label: 'PV of CF', data: pvCF, backgroundColor: 'rgba(82, 0, 255, 0.5)', borderColor: '#5200ff', borderWidth: 1 },
      ])
    } catch (e) { document.getElementById('pv-dur-result').textContent = 'Error: ' + e }
  }
}
