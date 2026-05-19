export function init(container) {
  container.innerHTML = `
    <h2>Rate Converter</h2>
    <div class="calc-grid">
      <div class="card">
        <div class="field"><label>From Type</label>
          <select id="rc-type">
            <option value="effective">Effective Rate</option>
            <option value="nominal">Nominal Rate</option>
          </select>
        </div>
        <div class="field"><label>Value</label><input id="rc-value" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>Compounding Frequency</label>
          <select id="rc-m">
            <option value="1">Annual (m=1)</option>
            <option value="2">Semi-Annual (m=2)</option>
            <option value="4" selected>Quarterly (m=4)</option>
            <option value="12">Monthly (m=12)</option>
            <option value="365">Daily (m=365)</option>
          </select>
        </div>
        <button onclick="window._rcConvert()">Convert</button>
        <div class="result-box" id="rc-result"></div>
      </div>
      <div class="card">
        <h3>Annuity Certain (No Mortality)</h3>
        <div class="field"><label>Rate</label><input id="rc-ac-rate" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>Term (n)</label><input id="rc-ac-n" type="number" value="10"></div>
        <button onclick="window._rcAnnCertain()">Calculate</button>
        <div class="result-box" id="rc-ac-result"></div>
      </div>
    </div>`

  window._rcConvert = async () => {
    const req = {
      fromValue: parseFloat(document.getElementById('rc-value').value),
      fromType: document.getElementById('rc-type').value,
      compounding: parseInt(document.getElementById('rc-m').value),
    }
    try {
      const resp = await window.go.main.App.ConvertRate(req)
      document.getElementById('rc-result').innerHTML =
        `Effective Rate: <strong>${resp.effectiveRate.toFixed(6)}</strong> (${(resp.effectiveRate * 100).toFixed(4)}%)<br>
         Nominal Rate (m=${req.compounding}): <strong>${resp.nominalRate.toFixed(6)}</strong> (${(resp.nominalRate * 100).toFixed(4)}%)<br>
         Force of Interest (δ): <strong>${resp.forceOfInterest.toFixed(6)}</strong>`
    } catch (e) { document.getElementById('rc-result').textContent = 'Error: ' + e }
  }

  window._rcAnnCertain = async () => {
    const i = parseFloat(document.getElementById('rc-ac-rate').value)
    const n = parseInt(document.getElementById('rc-ac-n').value)
    try {
      const imm = await window.go.main.App.AnnuityCertainImmediate(i, n)
      const due = await window.go.main.App.AnnuityCertainDue(i, n)
      document.getElementById('rc-ac-result').innerHTML =
        `a<sub>n</sub> (immediate) = <strong>${imm.toFixed(6)}</strong><br>
         ¨a<sub>n</sub> (due) = <strong>${due.toFixed(6)}</strong>`
    } catch (e) { document.getElementById('rc-ac-result').textContent = 'Error: ' + e }
  }
}
