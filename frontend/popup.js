/**
 * BrandCheck Pro — Extension Popup Event Broker & Renderer
 */
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const textInput = document.getElementById('copyInput').value;
  const marketSelect = document.getElementById('marketSelect').value;
  
  if (!textInput.trim()) return;

  const loader = document.getElementById('loader');
  const resultsPanel = document.getElementById('resultsPanel');
  
  // Update popup UI states
  loader.classList.remove('hidden');
  resultsPanel.classList.add('hidden');

  try {
    // 1. Perform async request to backend API
    const response = await fetch('http://localhost:8000/v1/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textInput, market: marketSelect })
    });

    if (!response.ok) {
      throw new Error(`API HTTP error: status ${response.status}`);
    }

    const data = await response.json();
    console.log('[BrandCheck Pro] API analysis response received:', data);

    // 2. Render popup UI dashboard
    renderValidationDashboard(data);

    // 3. Dispatch flagged issues to the active browser tab content script
    dispatchHighlightRequest(data.flagged_issues);

  } catch (error) {
    console.error('[BrandCheck Pro] API communication fault:', error);
    alert('System connection fault with backend service pipeline. Please ensure the FastAPI server is running on port 8000.');
  } finally {
    loader.classList.add('hidden');
  }
});

/**
 * Dispatch highlight message containing flagged issues to the active Chrome tab.
 */
function dispatchHighlightRequest(flaggedIssues) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.warn('[BrandCheck Pro] No active tab detected to send highlight instructions.');
      return;
    }

    const activeTab = tabs[0];
    // Avoid sending messages to restricted Chrome internal pages
    if (activeTab.url && (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('https://chrome.google.com/'))) {
      console.warn('[BrandCheck Pro] Cannot inject highlighting scripts into system-protected Chrome URLs.');
      return;
    }

    console.log(`[BrandCheck Pro] Dispatching ${flaggedIssues.length} flagged issue(s) to Tab ID ${activeTab.id}`);
    chrome.tabs.sendMessage(
      activeTab.id,
      {
        action: 'highlight_risk_tokens',
        flagged_issues: flaggedIssues
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            '[BrandCheck Pro] Could not transmit message to content script (is the page refreshed or system-protected?):',
            chrome.runtime.lastError.message
          );
        } else {
          console.log('[BrandCheck Pro] Content script acknowledged highlighting:', response);
        }
      }
    );
  });
}

/**
 * Renders raw API response elements into structured popup widgets.
 */
function renderValidationDashboard(data) {
  const panel = document.getElementById('resultsPanel');
  const scoreVal = document.getElementById('scoreValue');
  const riskLabel = document.getElementById('riskLabel');
  const summaryText = document.getElementById('summaryText');
  const list = document.getElementById('violationsList');

  scoreVal.innerText = data.overall_score;
  riskLabel.innerText = data.risk_level.toUpperCase();
  summaryText.innerText = data.summary;
  list.innerHTML = '';

  // Classify dynamic risk-sensitive colors
  riskLabel.className = '';
  if (data.overall_score >= 90) {
    riskLabel.classList.add('risk-safe');
  } else if (data.overall_score >= 70) {
    riskLabel.classList.add('risk-caution');
  } else {
    riskLabel.classList.add('risk-high');
  }

  if (!data.flagged_issues || data.flagged_issues.length === 0) {
    list.innerHTML = '<li style="font-size: 11px; color: #94A3B8; text-align: center; padding: 10px 0;">Zero risk anomalies detected.</li>';
  } else {
    data.flagged_issues.forEach(issue => {
      const li = document.createElement('li');
      li.className = 'violation-item';
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span class="violation-term">"${issue.phrase}"</span>
          <span style="color: #94A3B8; font-size: 10px; font-weight: 500;">${issue.category}</span>
        </div>
        <p style="margin: 0; font-size: 11px; color: #CBD5E1; line-height: 1.4;">${issue.rationale}</p>
      `;
      list.appendChild(li);
    });
  }
  panel.classList.remove('hidden');
}
