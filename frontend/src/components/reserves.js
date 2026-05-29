import { showToast } from '../lib/toast.js'
import { validateAge, validatePositive, validateRate, setButtonLoading, formatCurrency, copyToClipboard } from '../lib/utils.js'

let tableNames = []

function id(s) { return document.getElementById(s) }

export async function init(container) {
  try {
    tableNames = await window.go.main.App.GetTableNames()
  } catch (e) { tableNames = ['cso2017_male'] }

  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; reserves</div>
    <h2>Reserve Calculator</h2>
    <div class="card" style="max-width:600px" onkeydown="if(event.key==='Enter')window._resCalc()">
      <div class="calc-grid">
        <div>
          <div class="field"><label>Mortality Table</label>
            <select id="res-table">${tableNames.map(n => `<option>${n}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Reserve Type</label>
            <select id="res-type">
              <option value="net-premium">Net Premium</option>
              <option value="gross-premium">Gross Premium</option>
              <option value="prospective">Prospective</option>
              <option value="retrospective">Retrospective</option>
            </select>
          </div>
          <div class="field"><label>Age</label><input id="res-age" type="number" value="65" min="0" max="120"></div>
          <div class="field"><label>Term</label><input id="res-term" type="number" value="10" min="1"></div>
        </div>
        <div>
          <div class="field"><label>Sum Assured</label><input id="res-sa" type="number" value="100000" min="1"></div>
          <div class="field"><label>Annual Premium</label><input id="res-prem" type="number" value="5000" min="0"></div>
          <div class="field"><label>Expenses (gross)</label><input id="res-exp" type="number" value="500" min="0"></div>
          <div class="field"><label>Rate</label><input id="res-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
        </div>
      </div>
      <button id="res-btn" onclick="window._resCalc()">Calculate Reserve</button>
      <div class="result-box" id="res-result"></div>
    </div>`

  window._resCalc = async () => {
    const age = parseInt(id('res-age').value)
    const term = parseInt(id('res-term').value)
    const sa = parseFloat(id('res-sa').value)
    const prem = parseFloat(id('res-prem').value)
    const exp = parseFloat(id('res-exp').value)
    const rate = parseFloat(id('res-rate').value)

    const err = validateAge(age) || validatePositive(term, 'Term') || validatePositive(sa, 'Sum Assured') || validateRate(rate)
    if (err) { showToast(err, 'warning'); return }

    const req = { age, term, sumAssured: sa, premium: prem, expenses: exp, rate, tableName: id('res-table').value, type: id('res-type').value }
    setButtonLoading(id('res-btn'), true)
    try {
      const resp = await window.go.main.App.CalcReserve(req)
      const label = id('res-type').selectedOptions[0].text
      const el = id('res-result')
      el.innerHTML = `<strong>${label}:</strong> <strong class="result-value">${formatCurrency(resp.value, 4)}</strong>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('${label}: ${resp.value.toFixed(4)}')">Copy</button>`
      showToast('Reserve calculated', 'success')
    } catch (e) { id('res-result').textContent = 'Error: ' + e; showToast('Calculation failed', 'error') }
    finally { setButtonLoading(id('res-btn'), false) }
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
