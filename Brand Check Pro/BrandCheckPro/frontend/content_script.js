/**
 * BrandCheck Pro — Web Content Script DOM Overlay Manager
 */

console.log("[BrandCheck Pro] DOM overlay script loaded.");

// Inject core styles required for high-contrast highlights and dynamic tooltips
injectCSSRules();

// Create or retrieve the singleton tooltip overlay
const tooltip = createTooltipElement();

// Setup event listeners for message brokers and event delegation hover layers
setupEventListeners();

/**
 * Injects required CSS rules into the active tab document.
 */
function injectCSSRules() {
  const styleId = "brandcheck-core-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .brandcheck-highlight-span {
      border-bottom: 2px dashed #EF4444 !important;
      cursor: help !important;
      position: relative !important;
      background-color: rgba(239, 68, 68, 0.12) !important;
      transition: background-color 0.2s ease !important;
    }
    .brandcheck-highlight-span:hover {
      background-color: rgba(239, 68, 68, 0.24) !important;
    }
    #brandcheck-tooltip {
      position: absolute !important;
      z-index: 2147483647 !important;
      background: #1E293B !important;
      color: #F8FAFC !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      border: 1px solid #334155 !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 10px rgba(56, 189, 248, 0.1) !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      max-width: 280px !important;
      pointer-events: none !important;
      opacity: 0;
      transform: translateY(5px);
      transition: opacity 0.15s ease, transform 0.15s ease !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Creates and appends a hidden singleton tooltip overlay in the document body.
 */
function createTooltipElement() {
  let el = document.getElementById("brandcheck-tooltip");
  if (!el) {
    el = document.createElement("div");
    el.id = "brandcheck-tooltip";
    el.style.display = "none";
    document.body.appendChild(el);
  }
  return el;
}

/**
 * Registers message listeners and page hover controllers.
 */
function setupEventListeners() {
  // 1. Message listener receiving instructions from the extension popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[BrandCheck Pro] Received message action:", request.action);

    if (request.action === "highlight_risk_tokens") {
      try {
        const issues = request.flagged_issues || [];
        
        // Remove prior highlighting frames to maintain clean state normalizations
        removeExistingHighlights();

        if (issues.length > 0) {
          walkAndHighlight(document.body, issues);
          console.log(`[BrandCheck Pro] Highlight run complete. Handled ${issues.length} issue(s).`);
          sendResponse({ status: "success", count: issues.length });
        } else {
          console.log("[BrandCheck Pro] Zero issues parsed. Highlighting cleared.");
          sendResponse({ status: "cleared" });
        }
      } catch (err) {
        console.error("[BrandCheck Pro] Error executing DOM highlights:", err);
        sendResponse({ status: "error", message: err.message });
      }
    }
    return true; // Keep channel open for async notifications
  });

  // 2. Hover event delegation for highlights tooltip triggers
  document.body.addEventListener("mouseover", (e) => {
    const highlightNode = e.target.closest(".brandcheck-highlight-span");
    if (!highlightNode) return;

    const category = highlightNode.getAttribute("data-category");
    const rationale = highlightNode.getAttribute("data-rationale");

    // Populate tooltip markup content
    tooltip.innerHTML = `
      <div style="font-weight: 700; color: #38BDF8; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; margin-bottom: 4px;">${category}</div>
      <div style="color: #CBD5E1; font-size: 11px;">${rationale}</div>
    `;

    tooltip.style.display = "block";

    // Position coordinates calculations
    const rect = highlightNode.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const targetCenter = rect.left + rect.width / 2;
    const tooltipWidth = tooltip.offsetWidth;

    let tooltipLeft = targetCenter - tooltipWidth / 2;
    let tooltipTop = rect.top - tooltip.offsetHeight - 8;

    // Viewport bounds validations (Horizontal check)
    if (tooltipLeft < 10) tooltipLeft = 10;
    if (tooltipLeft + tooltipWidth > window.innerWidth - 10) {
      tooltipLeft = window.innerWidth - tooltipWidth - 10;
    }

    // Viewport bounds validations (Vertical top check - flip to bottom if necessary)
    if (rect.top - tooltip.offsetHeight - 8 < 10) {
      tooltipTop = rect.bottom + 8;
    }

    tooltip.style.left = `${tooltipLeft + scrollLeft}px`;
    tooltip.style.top = `${tooltipTop + scrollTop}px`;

    // Trigger transition frames
    requestAnimationFrame(() => {
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translateY(0)";
    });
  });

  document.body.addEventListener("mouseout", (e) => {
    const highlightNode = e.target.closest(".brandcheck-highlight-span");
    if (!highlightNode) return;

    // Fade out animations
    tooltip.style.opacity = "0";
    tooltip.style.transform = "translateY(5px)";

    // Terminate display logic post transitions
    setTimeout(() => {
      if (tooltip.style.opacity === "0") {
        tooltip.style.display = "none";
      }
    }, 150);
  });
}

/**
 * Removes highlighted span layers and restores text nodes back to clean states.
 */
function removeExistingHighlights() {
  const highlights = document.querySelectorAll(".brandcheck-highlight-span");
  highlights.forEach((span) => {
    const parent = span.parentNode;
    if (parent) {
      const textNode = document.createTextNode(span.textContent);
      parent.replaceChild(textNode, span);
    }
  });

  // Re-normalize DOM to merge neighboring text nodes back together
  document.body.normalize();
}

/**
 * Recursively scans elements and wraps target phrases inside text nodes.
 */
function walkAndHighlight(node, flaggedIssues) {
  if (!node) return;

  const skipTags = ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "IFRAME", "CODE", "PRE"];
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toUpperCase();
    if (skipTags.includes(tagName)) return;
    if (node.classList && node.classList.contains("brandcheck-highlight-span")) return;
    if (node.id === "brandcheck-tooltip") return;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = node.nodeValue;
    if (!textContent.trim()) return;

    let matchedIssue = null;
    let firstMatchIndex = -1;
    let matchLength = 0;

    // Determine if any flagged term is within this node
    for (const issue of flaggedIssues) {
      const phrase = issue.phrase;
      if (!phrase || phrase.trim() === "") continue;

      const idx = textContent.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx !== -1) {
        if (firstMatchIndex === -1 || idx < firstMatchIndex) {
          firstMatchIndex = idx;
          matchedIssue = issue;
          matchLength = phrase.length;
        }
      }
    }

    if (matchedIssue && firstMatchIndex !== -1) {
      const parent = node.parentNode;
      if (!parent) return;

      const beforeText = textContent.substring(0, firstMatchIndex);
      const matchedText = textContent.substring(firstMatchIndex, firstMatchIndex + matchLength);
      const afterText = textContent.substring(firstMatchIndex + matchLength);

      const fragment = document.createDocumentFragment();

      if (beforeText) {
        fragment.appendChild(document.createTextNode(beforeText));
      }

      const span = document.createElement("span");
      span.className = "brandcheck-highlight-span";
      span.setAttribute("data-category", matchedIssue.category);
      span.setAttribute("data-rationale", matchedIssue.rationale);
      span.appendChild(document.createTextNode(matchedText));
      fragment.appendChild(span);

      const afterNode = document.createTextNode(afterText);
      fragment.appendChild(afterNode);

      parent.replaceChild(fragment, node);

      // Recursive scan on remaining split text elements
      walkAndHighlight(afterNode, flaggedIssues);
    }
  } else {
    // Array allocation prevents dynamic node additions from causing live collection loops
    const children = Array.from(node.childNodes);
    for (const child of children) {
      walkAndHighlight(child, flaggedIssues);
    }
  }
}
