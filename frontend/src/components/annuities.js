import { showToast } from '../lib/toast.js'
import { validateRate, validateAge, validatePositive, setButtonLoading, formatCurrency, copyToClipboard } from '../lib/utils.js'

let tableNames = []

function id(s) { return document.getElementById(s) }

export async function init(container) {
  try {
    tableNames = await window.go.main.App.GetTableNames()
  } catch (e) { tableNames = ['cso2017_male'] }

  const types = [
    'whole-life-immediate', 'whole-life-due', 'term-immediate', 'term-due',
    'deferred-whole-life', 'deferred-term', 'whole-life-nsp', 'term-nsp',
    'endowment-nsp', 'approx-whole-life',
  ]

  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; annuities</div>
    <h2>Annuity Calculator</h2>
    <div class="card" style="max-width:600px" onkeydown="if(event.key==='Enter')window._annCalc()">
      <div class="field"><label>Mortality Table</label>
        <select id="ann-table">${tableNames.map(n => `<option>${n}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Annuity Type</label>
        <select id="ann-type">${types.map(t => `<option value="${t}">${t.replace(/-/g, ' ')}</option>`).join('')}</select>
      </div>
      <div class="calc-grid">
        <div>
          <div class="field"><label>Age</label><input id="ann-age" type="number" value="65" min="0" max="120"></div>
          <div class="field"><label>Term</label><input id="ann-term" type="number" value="10" min="0"></div>
          <div class="field"><label>Deferment</label><input id="ann-def" type="number" value="0" min="0"></div>
        </div>
        <div>
          <div class="field"><label>Amount</label><input id="ann-amount" type="number" value="1000" min="1"></div>
          <div class="field"><label>Rate</label><input id="ann-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
        </div>
      </div>
      <button id="ann-btn" onclick="window._annCalc()">Calculate</button>
      <div class="result-box" id="ann-result"></div>
    </div>`

  window._annCalc = async () => {
    const age = parseInt(id('ann-age').value)
    const term = parseInt(id('ann-term').value)
    const amount = parseFloat(id('ann-amount').value)
    const rate = parseFloat(id('ann-rate').value)
    const err = validateAge(age) || validatePositive(amount, 'Amount') || validateRate(rate)
    if (err) { showToast(err, 'warning'); return }

    const req = {
      tableName: id('ann-table').value,
      type: id('ann-type').value,
      age, term,
      deferment: parseInt(id('ann-def').value),
      amount, rate,
    }
    setButtonLoading(id('ann-btn'), true)
    try {
      const resp = await window.go.main.App.CalcAnnuity(req)
      const el = id('ann-result')
      el.innerHTML = `Present Value = <strong class="result-value">${formatCurrency(resp.presentValue, 4)}</strong>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('Annuity PV: ${resp.presentValue.toFixed(4)}')">Copy</button>`
      showToast('Annuity calculated', 'success')
    } catch (e) { id('ann-result').textContent = 'Error: ' + e; showToast('Calculation failed', 'error') }
    finally { setButtonLoading(id('ann-btn'), false) }
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
