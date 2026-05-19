export function init(container) {
  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; risk</div>
    <h2>Risk Metrics</h2>
    <div class="calc-grid">
      <div class="card">
        <h3>VaR &amp; CTE</h3>
        <div class="field"><label>Losses</label>
          <textarea id="risk-losses" rows="6">0.01, 0.02, 0.015, 0.03, 0.025, 0.04, 0.035, 0.05, 0.045, 0.06, 0.055, 0.07, 0.065, 0.08, 0.075, 0.09, 0.085, 0.1, 0.095, 0.12</textarea>
        </div>
        <button onclick="window._riskCompute()">Compute</button>
        <div class="result-box" id="risk-result"></div>
      </div>
      <div class="card">
        <h3>Notes</h3>
        <p style="color:#949494;font-size:13px;line-height:1.7">
          VaR (Value at Risk) measures the maximum loss at a given confidence level over a specified period.<br><br>
          CTE (Conditional Tail Expectation) is the average loss beyond the VaR threshold — also known as Expected Shortfall.<br><br>
          Input losses as comma-separated values or a JSON array.
        </p>
      </div>
    </div>`

  window._riskCompute = async () => {
    const raw = document.getElementById('risk-losses').value.trim()
    let losses
    try {
      losses = JSON.parse(raw)
    } catch {
      losses = raw.split(/\s*[,\s]\s*/).map(Number)
    }
    losses = losses.filter(v => !isNaN(v))
    if (losses.length < 2) {
      document.getElementById('risk-result').textContent = 'Need at least 2 values'
      return
    }
    try {
      const report = await window.go.main.App.ComputeRiskMetrics(losses)
      document.getElementById('risk-result').innerHTML =
        `Count: ${losses.length}<br>
         Mean: <strong>${report.mean.toFixed(6)}</strong><br>
         Std Dev: <strong>${report.stdDev.toFixed(6)}</strong><br>
         Min: ${report.min.toFixed(6)} &nbsp;|&nbsp; Max: ${report.max.toFixed(6)}<hr>
         VaR(95%): <strong>${report.var95.toFixed(6)}</strong><br>
         VaR(99%): <strong>${report.var99.toFixed(6)}</strong><br>
         CTE(95%): <strong>${report.cte95.toFixed(6)}</strong><br>
         CTE(99%): <strong>${report.cte99.toFixed(6)}</strong><hr>
         Std Error: ${report.stdError.toFixed(6)}<br>
         95% CI: [${report.confidence95Lo.toFixed(6)}, ${report.confidence95Hi.toFixed(6)}]`
    } catch (e) { document.getElementById('risk-result').textContent = 'Error: ' + e }
  }
}
