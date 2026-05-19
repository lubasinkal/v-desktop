let tableNames = []

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
    <div class="card" style="max-width:600px">
      <div class="field"><label>Mortality Table</label>
        <select id="ann-table">${tableNames.map(n => `<option>${n}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Annuity Type</label>
        <select id="ann-type">${types.map(t => `<option value="${t}">${t.replace(/-/g, ' ')}</option>`).join('')}</select>
      </div>
      <div class="calc-grid">
        <div>
          <div class="field"><label>Age</label><input id="ann-age" type="number" value="65"></div>
          <div class="field"><label>Term</label><input id="ann-term" type="number" value="10"></div>
          <div class="field"><label>Deferment</label><input id="ann-def" type="number" value="0"></div>
        </div>
        <div>
          <div class="field"><label>Amount</label><input id="ann-amount" type="number" value="1000"></div>
          <div class="field"><label>Rate</label><input id="ann-rate" type="number" value="0.05" step="0.001"></div>
        </div>
      </div>
      <button onclick="window._annCalc()">Calculate</button>
      <div class="result-box" id="ann-result"></div>
    </div>`

  window._annCalc = async () => {
    const req = {
      tableName: document.getElementById('ann-table').value,
      type: document.getElementById('ann-type').value,
      age: parseInt(document.getElementById('ann-age').value),
      term: parseInt(document.getElementById('ann-term').value),
      deferment: parseInt(document.getElementById('ann-def').value),
      amount: parseFloat(document.getElementById('ann-amount').value),
      rate: parseFloat(document.getElementById('ann-rate').value),
    }
    try {
      const resp = await window.go.main.App.CalcAnnuity(req)
      document.getElementById('ann-result').innerHTML =
        `Present Value = <strong>${resp.presentValue.toFixed(4)}</strong>`
    } catch (e) { document.getElementById('ann-result').textContent = 'Error: ' + e }
  }
}
