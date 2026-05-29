import { showToast } from '../lib/toast.js'
import { validatePositive, validateRate, setButtonLoading, formatCurrency, copyToClipboard } from '../lib/utils.js'

function id(s) { return document.getElementById(s) }

let _pendingCensusContent = null // CSV content from HTML file input fallback

export function init(container) {
  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; census</div>
    <h2>CSV Census Processor</h2>
    <div class="calc-grid">
      <div class="card">
        <div class="field"><label>CSV File</label>
          <div style="display:flex;gap:8px">
            <input id="census-path" type="text" placeholder="path/to/policies.csv" style="flex:1">
            <button onclick="window._censusBrowse()" class="btn-secondary" style="white-space:nowrap">Browse</button>
            <input id="census-file-input" type="file" accept=".csv" style="display:none" onchange="window._censusFileSelected(event)">
          </div>
        </div>
        <div class="calc-grid" style="gap:8px">
          <div class="field"><label>Rate</label><input id="census-rate" type="number" value="0.05" step="0.001" min="0" max="1"></div>
          <div class="field"><label>Limit (0 = all)</label><input id="census-limit" type="number" value="0" min="0"></div>
        </div>
        <div class="field"><label>Workers (parallel)</label><input id="census-workers" type="number" value="8" min="1"></div>
        <div style="display:flex;gap:8px">
          <button id="census-btn" onclick="window._censusRun()">Process</button>
          <button id="census-par-btn" onclick="window._censusRunParallel()" class="btn-secondary">Parallel</button>
        </div>
        <div class="result-box" id="census-status"></div>
      </div>
    </div>
    <div class="card">
      <div id="census-summary"></div>
      <div style="max-height:500px;overflow:auto;margin-top:12px">
        <table id="census-table"></table>
      </div>
    </div>`

  window._censusBrowse = async () => {
    try {
      const result = await window.runtime.OpenFileDialog({
        filters: [{ displayName: 'CSV Files', pattern: '*.csv' }],
        properties: ['openFile'],
      })
      if (result) {
        id('census-path').value = result
        _pendingCensusContent = null
        showToast('File selected', 'info')
      }
    } catch (e) {
      // Runtime dialog unavailable (dev mode) — use HTML file input fallback
      id('census-file-input').click()
    }
  }

  window._censusFileSelected = (event) => {
    const file = event.target.files[0]
    if (!file) return
    id('census-path').value = file.name
    // Read file content for backend processing
    const reader = new FileReader()
    reader.onload = (e) => {
      _pendingCensusContent = e.target.result
      showToast('File loaded: ' + file.name, 'success')
    }
    reader.onerror = () => {
      showToast('Failed to read file', 'error')
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const showResults = (resp) => {
    const summaryEl = id('census-summary')
    summaryEl.innerHTML =
      `<span class="terminal-prompt">~</span> Processed <strong>${resp.recordCount}</strong> records in ${resp.processingMs}ms &nbsp;|&nbsp; Total PV: <strong>${formatCurrency(resp.totalPV)}</strong>`
    summaryEl.innerHTML += ` <button class="copy-btn" onclick="window._copyText('Census: ${resp.recordCount} records, ${resp.processingMs}ms, Total PV: ${resp.totalPV.toFixed(2)}')">Copy</button>`

    let html = '<tr><th>Sex</th><th>Type</th><th>Age</th><th>Sum Assured</th><th>Term</th><th>PV</th></tr>'
    const maxRows = 100
    const showRecords = resp.records.slice(0, maxRows)
    showRecords.forEach(r => {
      html += `<tr><td>${r.sex}</td><td>${r.policyType}</td><td>${r.age}</td><td>${formatCurrency(r.sumAssured)}</td><td>${r.term}</td><td>${formatCurrency(r.presentValue)}</td></tr>`
    })
    if (resp.records.length > maxRows) {
      html += `<tr><td colspan="6" style="color:#949494">... and ${resp.records.length - maxRows} more rows</td></tr>`
    }
    id('census-table').innerHTML = html
    id('census-status').innerHTML = 'Done'
  }

  window._censusRun = async () => {
    const filePath = id('census-path').value
    const rate = parseFloat(id('census-rate').value)
    if (!filePath) { showToast('Enter file path', 'warning'); return }
    if (validateRate(rate)) { showToast(validateRate(rate), 'warning'); return }

    const req = { filePath, interestRate: rate, rateJ: 0, limit: parseInt(id('census-limit').value), workers: 1 }
    id('census-status').innerHTML = '<span class="spinner" style="border-top-color:#3cffd0"></span> Processing...'
    setButtonLoading(id('census-btn'), true)
    try {
      let resp
      if (_pendingCensusContent) {
        resp = await window.go.main.App.ProcessCensusFromData(req, _pendingCensusContent)
        _pendingCensusContent = null
      } else {
        resp = await window.go.main.App.ProcessCensus(req)
      }
      showResults(resp)
      showToast(`Processed ${resp.recordCount} records in ${resp.processingMs}ms`, 'success')
    } catch (e) { id('census-status').textContent = 'Error: ' + e; showToast('Processing failed', 'error') }
    finally { setButtonLoading(id('census-btn'), false) }
  }

  window._censusRunParallel = async () => {
    const filePath = id('census-path').value
    const rate = parseFloat(id('census-rate').value)
    if (!filePath) { showToast('Enter file path', 'warning'); return }
    if (validateRate(rate)) { showToast(validateRate(rate), 'warning'); return }

    const req = {
      filePath, interestRate: rate, rateJ: 0,
      limit: parseInt(id('census-limit').value),
      workers: parseInt(id('census-workers').value),
    }
    id('census-status').innerHTML = '<span class="spinner" style="border-top-color:#3cffd0"></span> Processing parallel...'
    setButtonLoading(id('census-par-btn'), true)
    try {
      let resp
      if (_pendingCensusContent) {
        resp = await window.go.main.App.ProcessCensusFromData(req, _pendingCensusContent)
        _pendingCensusContent = null
      } else {
        resp = await window.go.main.App.ProcessCensusParallel(req)
      }
      showResults(resp)
      showToast(`Processed ${resp.recordCount} records in ${resp.processingMs}ms (parallel)`, 'success')
    } catch (e) { id('census-status').textContent = 'Error: ' + e; showToast('Processing failed', 'error') }
    finally { setButtonLoading(id('census-par-btn'), false) }
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
