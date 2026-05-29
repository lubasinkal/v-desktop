import { showToast } from '../lib/toast.js'
import { setButtonLoading, copyToClipboard } from '../lib/utils.js'

function id(s) { return document.getElementById(s) }

export function init(container) {
  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; risk</div>
    <h2>Risk Metrics</h2>
    <div class="calc-grid">
      <div class="card" onkeydown="if(event.key==='Enter')window._riskCompute()">
        <h3>VaR &amp; CTE</h3>
        <div class="field"><label>Losses</label>
          <textarea id="risk-losses" rows="6" placeholder="Comma-separated or JSON array">0.01, 0.02, 0.015, 0.03, 0.025, 0.04, 0.035, 0.05, 0.045, 0.06, 0.055, 0.07, 0.065, 0.08, 0.075, 0.09, 0.085, 0.1, 0.095, 0.12</textarea>
        </div>
        <button id="risk-btn" onclick="window._riskCompute()">Compute</button>
        <div class="result-box" id="risk-result"></div>
      </div>
      <div class="card">
        <h3>Notes</h3>
        <p style="color:#949494;font-size:13px;line-height:1.7">
          <strong style="color:#e9e9e9">VaR</strong> (Value at Risk) — maximum loss at a given confidence level.<br><br>
          <strong style="color:#e9e9e9">CTE</strong> (Conditional Tail Expectation) — average loss beyond VaR, also known as Expected Shortfall.<br><br>
          Input losses as comma-separated values or a JSON array.
        </p>
      </div>
    </div>`

  window._riskCompute = async () => {
    const raw = id('risk-losses').value.trim()
    let losses
    try {
      losses = JSON.parse(raw)
    } catch {
      losses = raw.split(/\s*[,\s]\s*/).map(Number)
    }
    losses = losses.filter(v => !isNaN(v))
    if (losses.length < 2) {
      showToast('Need at least 2 values', 'warning')
      return
    }
    setButtonLoading(id('risk-btn'), true)
    try {
      const report = await window.go.main.App.ComputeRiskMetrics(losses)
      const el = id('risk-result')
      el.innerHTML =
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
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('Risk: Mean=${report.mean.toFixed(6)}, VaR95=${report.var95.toFixed(6)}, VaR99=${report.var99.toFixed(6)}, CTE95=${report.cte95.toFixed(6)}')">Copy</button>`
      showToast('Risk metrics computed', 'success')
    } catch (e) { id('risk-result').textContent = 'Error: ' + e; showToast('Computation failed', 'error') }
    finally { setButtonLoading(id('risk-btn'), false) }
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
