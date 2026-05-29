import { destroyChart, createGroupedBarChart } from '../lib/charts.js'
import { showToast } from '../lib/toast.js'
import { validateRate, validatePositive, setButtonLoading, formatCurrency, copyToClipboard } from '../lib/utils.js'

let durationChart = null

function id(s) { return document.getElementById(s) }

export function init(container) {
  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; present-value</div>
    <h2>Present Value &amp; Duration</h2>
    <div class="calc-grid">
      <div class="card" onkeydown="if(event.key==='Enter')window._pvCalc()">
        <h3>Present Value</h3>
        <div class="field"><label>Interest Rate (i)</label><input id="pv-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
        <div class="field"><label>j (v* rate, optional)</label><input id="pv-j" type="number" value="0" step="0.001" min="0"></div>
        <div class="field"><label>Sum Assured</label><input id="pv-sa" type="number" value="100000" min="1"></div>
        <div class="field"><label>Term (years)</label><input id="pv-term" type="number" value="20" min="1"></div>
        <button id="pv-btn" onclick="window._pvCalc()">Calculate PV</button>
        <div class="result-box" id="pv-result"></div>
      </div>
      <div class="card" onkeydown="if(event.key==='Enter')window._pvBulk()">
        <h3>Bulk PV</h3>
        <div class="field"><label>Rate</label><input id="pv-bulk-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
        <div class="field"><label>Records (JSON array)</label>
          <textarea id="pv-bulk-records" rows="5" placeholder='[{"sumAssured":100000,"term":20}]'></textarea>
        </div>
        <button id="pv-bulk-btn" onclick="window._pvBulk()">Process Bulk</button>
        <div class="result-box" id="pv-bulk-result"></div>
      </div>
    </div>
    <div class="card">
      <h3>Duration Analysis</h3>
      <div class="calc-grid">
        <div>
          <div class="field"><label>Rate (i)</label><input id="pv-dur-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
          <div class="field"><label>Cash Flows (comma-separated)</label><input id="pv-cf" type="text" value="100,100,100,1100"></div>
          <button id="pv-dur-btn" onclick="window._pvDur()">Calculate</button>
        </div>
        <div class="result-box" id="pv-dur-result"></div>
      </div>
      <div class="chart-wrap"><canvas id="pv-dur-chart"></canvas></div>
    </div>`

  window._pvCalc = async () => {
    const rate = parseFloat(id('pv-rate').value)
    const j = parseFloat(id('pv-j').value)
    const sa = parseFloat(id('pv-sa').value)
    const term = parseInt(id('pv-term').value)
    const err = validateRate(rate) || validatePositive(sa, 'Sum Assured') || validatePositive(term, 'Term')
    if (err) { showToast(err, 'warning'); return }
    setButtonLoading(id('pv-btn'), true)
    try {
      let pv
      if (j !== 0) {
        pv = await window.go.main.App.CalculatePVStar(rate, j, sa, term)
      } else {
        pv = await window.go.main.App.CalculatePV(rate, sa, term)
      }
      const v = await window.go.main.App.V(rate)
      const el = id('pv-result')
      el.innerHTML =
        `PV = <strong class="result-value">${formatCurrency(pv)}</strong><br>v = ${v.toFixed(6)}${j !== 0 ? ` &nbsp;|&nbsp; v* = ${(v * (1 + j)).toFixed(6)}` : ''}`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyPvRes()">Copy</button>`
      window._pvLastRes = `PV = ${pv.toFixed(2)}, v = ${v.toFixed(6)}`
      showToast('PV calculated', 'success')
    } catch (e) { id('pv-result').textContent = 'Error: ' + e; showToast('Calculation failed', 'error') }
    finally { setButtonLoading(id('pv-btn'), false) }
  }

  window._pvBulk = async () => {
    const rate = parseFloat(id('pv-bulk-rate').value)
    let records
    try {
      records = JSON.parse(id('pv-bulk-records').value)
    } catch { showToast('Invalid JSON in records', 'warning'); return }
    if (!Array.isArray(records) || records.length === 0) {
      showToast('Records must be a non-empty array', 'warning'); return
    }
    setButtonLoading(id('pv-bulk-btn'), true)
    try {
      const resp = await window.go.main.App.ProcessPV({ interestRate: rate, rateJ: 0, records })
      let html = '<table><tr><th>#</th><th>Amount</th><th>Term</th><th>PV</th></tr>'
      resp.results.forEach(r => {
        html += `<tr><td>${r.index}</td><td>${formatCurrency(r.sumAssured)}</td><td>${r.term}</td><td>${formatCurrency(r.presentValue)}</td></tr>`
      })
      html += '</table>'
      id('pv-bulk-result').innerHTML = html
      showToast(`Processed ${resp.results.length} records`, 'success')
    } catch (e) { id('pv-bulk-result').textContent = 'Error: ' + e; showToast('Bulk processing failed', 'error') }
    finally { setButtonLoading(id('pv-bulk-btn'), false) }
  }

  window._pvDur = async () => {
    const rate = parseFloat(id('pv-dur-rate').value)
    if (validateRate(rate)) { showToast(validateRate(rate), 'warning'); return }
    const cf = id('pv-cf').value.split(',').map(Number)
    if (cf.some(isNaN) || cf.length < 2) { showToast('Enter at least 2 valid cash flows', 'warning'); return }
    setButtonLoading(id('pv-dur-btn'), true)
    try {
      const mac = await window.go.main.App.MacaulayDuration(rate, cf)
      const mod = await window.go.main.App.ModifiedDuration(rate, cf)
      const conv = await window.go.main.App.Convexity(rate, cf)
      const el = id('pv-dur-result')
      el.innerHTML =
        `Macaulay Duration: <strong>${mac.toFixed(4)}</strong><br>Modified Duration: <strong>${mod.toFixed(4)}</strong><br>Convexity: <strong>${conv.toFixed(4)}</strong>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('Mac: ${mac.toFixed(4)}, Mod: ${mod.toFixed(4)}, Conv: ${conv.toFixed(4)}')">Copy</button>`

      destroyChart(durationChart)
      const labels = cf.map((_, i) => `t=${i + 1}`)
      const pvCF = cf.map((c, i) => c / Math.pow(1 + rate, i + 1))
      const canvas = id('pv-dur-chart')
      durationChart = createGroupedBarChart(canvas, labels, [
        { label: 'Cash Flow', data: cf, backgroundColor: 'rgba(60, 255, 208, 0.6)', borderColor: '#3cffd0', borderWidth: 1 },
        { label: 'PV of CF', data: pvCF, backgroundColor: 'rgba(82, 0, 255, 0.5)', borderColor: '#5200ff', borderWidth: 1 },
      ])
      showToast('Duration analysis complete', 'success')
    } catch (e) { id('pv-dur-result').textContent = 'Error: ' + e; showToast('Duration calculation failed', 'error') }
    finally { setButtonLoading(id('pv-dur-btn'), false) }
  }

  window._copyPvRes = async () => {
    if (await copyToClipboard(window._pvLastRes)) showToast('Copied', 'success')
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
