import { destroyChart, createBarChart } from '../lib/charts.js'
import { showToast } from '../lib/toast.js'
import { validateAge, validatePositive, validateRate, setButtonLoading, formatCurrency, copyToClipboard } from '../lib/utils.js'

let tableNames = []
let profitChart = null

function id(s) { return document.getElementById(s) }

async function refreshTableDropdown() {
  try {
    const names = await window.go.main.App.GetTableNames()
    if (names.length > 0) {
      tableNames = names
      const sel = document.getElementById('profit-table')
      if (sel) {
        const current = sel.value
        sel.innerHTML = names.map(n => `<option>${n}</option>`).join('')
        if (names.includes(current)) sel.value = current
      }
    }
  } catch (_) {}
}

export async function init(container) {
  try {
    tableNames = await window.go.main.App.GetTableNames()
  } catch (e) { tableNames = ['cso2017_male'] }

  window.addEventListener('tables-updated', refreshTableDropdown)

  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; profit</div>
    <h2>Profit Testing</h2>
    <div class="calc-grid">
      <div class="card" onkeydown="if(event.key==='Enter')window._profitRun()">
        <h3>Policy &amp; Assumptions</h3>
        <div class="field"><label>Mortality Table</label>
          <select id="profit-table">${tableNames.map(n => `<option>${n}</option>`).join('')}</select>
        </div>
        <div class="calc-grid" style="gap:8px">
          <div>
            <div class="field"><label>Age at Issue</label><input id="profit-age" type="number" value="35" min="0" max="120"></div>
            <div class="field"><label>Term (years)</label><input id="profit-term" type="number" value="20" min="1"></div>
            <div class="field"><label>Sum Assured</label><input id="profit-sa" type="number" value="100000" min="1"></div>
            <div class="field"><label>Annual Premium</label><input id="profit-premium" type="number" value="5000" min="0"></div>
          </div>
          <div>
            <div class="field"><label>Earned Rate (i)</label><input id="profit-earned" type="number" value="0.05" step="0.001" min="0" max="1"></div>
            <div class="field"><label>Risk Discount Rate (r)</label><input id="profit-discount" type="number" value="0.08" step="0.001" min="0" max="1"></div>
            <div class="field"><label>Acquisition Expense</label><input id="profit-acq" type="number" value="500" min="0"></div>
            <div class="field"><label>Renewal Expense /yr</label><input id="profit-renew" type="number" value="50" min="0"></div>
          </div>
        </div>
        <div class="calc-grid" style="gap:8px">
          <div>
            <div class="field"><label>Commission Rate (%)</label><input id="profit-comm-rate" type="number" value="5" min="0" max="100"></div>
          </div>
          <div>
            <div class="field"><label>Commission Years (0=all)</label><input id="profit-comm-years" type="number" value="0" min="0"></div>
          </div>
          <div>
            <div class="field" style="display:flex; align-items:center; gap:8px; margin-top:22px">
              <input id="profit-reserves" type="checkbox" checked>
              <label for="profit-reserves" style="margin:0">Include Reserves</label>
            </div>
          </div>
        </div>
        <button id="profit-btn" onclick="window._profitRun()" style="width:100%">Run Profit Test</button>
      </div>
      <div class="card">
        <h3>Results</h3>
        <div id="profit-summary" class="result-box" style="white-space:pre-line"></div>
        <div id="profit-metrics" style="margin-top:8px"></div>
      </div>
    </div>
    <div class="card">
      <div class="chart-wrap"><canvas id="profit-chart"></canvas></div>
    </div>
    <div class="card">
      <h3>Profit Signature</h3>
      <div style="max-height:350px;overflow:auto">
        <table id="profit-table-data"></table>
      </div>
    </div>`

  window._profitRun = async () => {
    const tableName = id('profit-table').value
    const age = parseInt(id('profit-age').value)
    const term = parseInt(id('profit-term').value)
    const sa = parseFloat(id('profit-sa').value)
    const premium = parseFloat(id('profit-premium').value)
    const earnedRate = parseFloat(id('profit-earned').value)
    const discountRate = parseFloat(id('profit-discount').value)
    const acqExp = parseFloat(id('profit-acq').value)
    const renewExp = parseFloat(id('profit-renew').value)
    const commRate = parseFloat(id('profit-comm-rate').value) / 100
    const commYears = parseInt(id('profit-comm-years').value)
    const reserveEnabled = id('profit-reserves').checked

    const err = validateAge(age) || validatePositive(term, 'Term') || validatePositive(sa, 'Sum Assured')
      || validateRate(earnedRate, 'Earned Rate') || validateRate(discountRate, 'Discount Rate')
    if (err) { showToast(err, 'warning'); return }

    const req = {
      tableName, age, term, sumAssured: sa, premium,
      earnedRate, discountRate,
      acquisitionExp: acqExp, renewalExp: renewExp,
      commissionRate: commRate, commissionYears: commYears,
      reserveEnabled,
    }

    id('profit-summary').innerHTML = '<span class="spinner" style="border-top-color:#3cffd0"></span> Running...'
    setButtonLoading(id('profit-btn'), true)
    try {
      const resp = await window.go.main.App.RunProfitTest(req)

      // --- Metrics ---
      const metricsEl = id('profit-metrics')
      metricsEl.innerHTML = `
        <div class="calc-grid" style="gap:8px">
          <div style="padding:8px;background:#1c1c1c;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#949494;text-transform:uppercase">PV of Profits</div>
            <div style="font-size:18px;font-weight:600;color:#3cffd0">${formatCurrency(resp.pvOfProfits, 2)}</div>
          </div>
          <div style="padding:8px;background:#1c1c1c;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#949494;text-transform:uppercase">Profit Margin</div>
            <div style="font-size:18px;font-weight:600;color:${resp.profitMargin >= 0 ? '#3cffd0' : '#ff5f57'}">${(resp.profitMargin * 100).toFixed(2)}%</div>
          </div>
          <div style="padding:8px;background:#1c1c1c;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#949494;text-transform:uppercase">IRR</div>
            <div style="font-size:18px;font-weight:600;color:#febc2e">${resp.irr < 0 ? 'N/A' : (resp.irr * 100).toFixed(2) + '%'}</div>
          </div>
          <div style="padding:8px;background:#1c1c1c;border-radius:6px;text-align:center">
            <div style="font-size:10px;color:#949494;text-transform:uppercase">Payback Year</div>
            <div style="font-size:18px;font-weight:600;color:#5200ff">${resp.paybackYear > 0 ? resp.paybackYear : 'Never'}</div>
          </div>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#949494">
          PV of Premiums: ${formatCurrency(resp.pvOfPremiums, 2)}
          <button class="copy-btn" style="margin-left:8px" onclick="window._copyProfit(window._lastProfitResp)">Copy All</button>
        </div>
      `

      window._lastProfitResp = resp

      // --- Chart (profit signature as bar chart) ---
      destroyChart(profitChart)
      const labels = resp.profitSignature.map((_, i) => `Year ${i + 1}`)
      const canvas = id('profit-chart')
      if (canvas) {
        profitChart = createBarChart(canvas, labels, resp.profitSignature, 'Profit Signature ($)', resp.profitSignature.some(v => v < 0) ? undefined : '#3cffd0')
      }

      // --- Table ---
      let html = '<tr><th>Year</th><th>Profit Signature</th><th>Cumulative</th><th>Discounted</th></tr>'
      const disc = resp.profitSignature.map((p, i) => p / Math.pow(1 + parseFloat(id('profit-discount').value || 0.08), i + 1))
      let cumDisc = 0
      for (let i = 0; i < resp.profitSignature.length; i++) {
        const ps = resp.profitSignature[i]
        const cp = resp.cumulativeProfit[i]
        cumDisc += disc[i]
        const psClass = ps < 0 ? 'style="color:#ff5f57"' : 'style="color:#3cffd0"'
        html += `<tr><td>${i + 1}</td><td ${psClass}>${formatCurrency(ps, 2)}</td><td>${formatCurrency(cp, 2)}</td><td>${formatCurrency(cumDisc, 2)}</td></tr>`
      }
      id('profit-table-data').innerHTML = html

      id('profit-summary').innerHTML = '' // clear spinner
      showToast('Profit test complete', 'success')
    } catch (e) {
      id('profit-summary').textContent = 'Error: ' + e
      showToast('Profit test failed', 'error')
    } finally {
      setButtonLoading(id('profit-btn'), false)
    }
  }

  window._copyProfit = async (resp) => {
    const text = `Profit Test Results
PV of Profits: ${resp.pvOfProfits.toFixed(2)}
PV of Premiums: ${resp.pvOfPremiums.toFixed(2)}
Profit Margin: ${(resp.profitMargin * 100).toFixed(2)}%
IRR: ${resp.irr < 0 ? 'N/A' : (resp.irr * 100).toFixed(2) + '%'}
Payback Year: ${resp.paybackYear > 0 ? resp.paybackYear : 'Never'}`
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
