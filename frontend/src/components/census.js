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
          </div>
        </div>
        <div class="calc-grid" style="gap:8px">
          <div class="field"><label>Rate</label><input id="census-rate" type="number" value="0.05" step="0.001"></div>
          <div class="field"><label>Limit (0 = all)</label><input id="census-limit" type="number" value="0"></div>
        </div>
        <div class="field"><label>Workers (parallel)</label><input id="census-workers" type="number" value="8"></div>
        <div style="display:flex;gap:8px">
          <button onclick="window._censusRun()">Process</button>
          <button onclick="window._censusRunParallel()" class="btn-secondary">Parallel</button>
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
        document.getElementById('census-path').value = result
      }
    } catch (e) {
      document.getElementById('census-status').textContent = 'Dialog unavailable in dev mode'
    }
  }

  const showResults = (resp) => {
    document.getElementById('census-summary').innerHTML =
      `<span class="terminal-prompt">~</span> Processed <strong>${resp.recordCount}</strong> records in ${resp.processingMs}ms &nbsp;|&nbsp; Total PV: <strong>${resp.totalPV.toFixed(2)}</strong>`

    let html = '<tr><th>Sex</th><th>Type</th><th>Age</th><th>Sum Assured</th><th>Term</th><th>PV</th></tr>'
    const maxRows = 100
    const showRecords = resp.records.slice(0, maxRows)
    showRecords.forEach(r => {
      html += `<tr><td>${r.sex}</td><td>${r.policyType}</td><td>${r.age}</td><td>${r.sumAssured.toFixed(2)}</td><td>${r.term}</td><td>${r.presentValue.toFixed(2)}</td></tr>`
    })
    if (resp.records.length > maxRows) {
      html += `<tr><td colspan="6" style="color:#949494">... and ${resp.records.length - maxRows} more rows</td></tr>`
    }
    document.getElementById('census-table').innerHTML = html
    document.getElementById('census-status').innerHTML = 'Done'
  }

  window._censusRun = async () => {
    const req = {
      filePath: document.getElementById('census-path').value,
      interestRate: parseFloat(document.getElementById('census-rate').value),
      rateJ: 0,
      limit: parseInt(document.getElementById('census-limit').value),
      workers: 1,
    }
    if (!req.filePath) { document.getElementById('census-status').textContent = 'Enter file path'; return }
    document.getElementById('census-status').innerHTML = '<span class="terminal-prompt">~</span> Processing...'
    try {
      const resp = await window.go.main.App.ProcessCensus(req)
      showResults(resp)
    } catch (e) { document.getElementById('census-status').textContent = 'Error: ' + e }
  }

  window._censusRunParallel = async () => {
    const req = {
      filePath: document.getElementById('census-path').value,
      interestRate: parseFloat(document.getElementById('census-rate').value),
      rateJ: 0,
      limit: parseInt(document.getElementById('census-limit').value),
      workers: parseInt(document.getElementById('census-workers').value),
    }
    if (!req.filePath) { document.getElementById('census-status').textContent = 'Enter file path'; return }
    document.getElementById('census-status').innerHTML = '<span class="terminal-prompt">~</span> Processing parallel...'
    try {
      const resp = await window.go.main.App.ProcessCensusParallel(req)
      showResults(resp)
    } catch (e) { document.getElementById('census-status').textContent = 'Error: ' + e }
  }
}
