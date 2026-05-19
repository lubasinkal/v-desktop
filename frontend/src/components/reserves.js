let tableNames = []

export async function init(container) {
  try {
    tableNames = await window.go.main.App.GetTableNames()
  } catch (e) { tableNames = ['cso2017_male'] }

  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; reserves</div>
    <h2>Reserve Calculator</h2>
    <div class="card" style="max-width:600px">
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
          <div class="field"><label>Age</label><input id="res-age" type="number" value="65"></div>
          <div class="field"><label>Term</label><input id="res-term" type="number" value="10"></div>
        </div>
        <div>
          <div class="field"><label>Sum Assured</label><input id="res-sa" type="number" value="100000"></div>
          <div class="field"><label>Annual Premium</label><input id="res-prem" type="number" value="5000"></div>
          <div class="field"><label>Expenses (gross)</label><input id="res-exp" type="number" value="500"></div>
          <div class="field"><label>Rate</label><input id="res-rate" type="number" value="0.05" step="0.001"></div>
        </div>
      </div>
      <button onclick="window._resCalc()">Calculate Reserve</button>
      <div class="result-box" id="res-result"></div>
    </div>`

  window._resCalc = async () => {
    const req = {
      age: parseInt(document.getElementById('res-age').value),
      term: parseInt(document.getElementById('res-term').value),
      sumAssured: parseFloat(document.getElementById('res-sa').value),
      premium: parseFloat(document.getElementById('res-prem').value),
      expenses: parseFloat(document.getElementById('res-exp').value),
      rate: parseFloat(document.getElementById('res-rate').value),
      tableName: document.getElementById('res-table').value,
      type: document.getElementById('res-type').value,
    }
    try {
      const resp = await window.go.main.App.CalcReserve(req)
      const label = document.getElementById('res-type').selectedOptions[0].text
      document.getElementById('res-result').innerHTML =
        `<strong>${label}:</strong> ${resp.value.toFixed(4)}`
    } catch (e) { document.getElementById('res-result').textContent = 'Error: ' + e }
  }
}
