# CozanetOS Browser Engine (`cozanet-browser`)

> **AI-Native OS Web Browsing, Automation, and Web Intelligence Engine**

`cozanet-browser` is the high-performance, AI-native browser engine for CozanetOS. Engineered to act as the sensory gateway to the World Wide Web, it enables autonomous agents to interact with web applications, extract rich semantic information, and execute multi-step web automation workflows with human-like intelligence and robust anti-bot evasion.

---

## 🚀 Key Capabilities

- **AI-Native Web Browsing**: Full headless and headful browser engine based on modern Playwright/Puppeteer wrappers, optimized specifically for LLM and Agent navigation patterns.
- **Search Engine Queries**: Native interfaces for executing and parsing semantic queries across Google, Bing, DuckDuckGo, and other major engines.
- **Documentation Reading**: Highly targeted extracting filters designed to isolate code blocks, API references, and documentation hierarchies from developer portals.
- **Article Extraction**: Advanced boilerpipe-style layout analysis to extract clean, unpolluted markdown/text from blog posts, newspapers, and long-form publications.
- **Intelligent Form Filling**: Automatic heuristic and AI-driven detection of input forms, text areas, dropdowns, and button elements, followed by precise, context-aware population.
- **File Uploads & Downloads**: Robust, automated management of files passing in and out of the browser context, handled directly within the sandbox container.
- **Screenshots**: High-fidelity full-page and element-level capture, ready for visual-language model consumption and UI layout reasoning.
- **Multi-Tab & Session Management**: Supports parallel, isolated browser contexts, sandboxing cookies, `localStorage`, and `sessionStorage` independently.
- **Cookie Management**: Advanced, persistent cookie storage, allowing secure state preservation across runs.
- **Login Automation**: Intelligently handles multi-factor, OAuth flows, and traditional form-based logins, requiring human-in-the-loop validation only for initial authorization steps.
- **Workflow Automation**: Express complex multi-step browser scripts in a declarative format (e.g., click, wait, input, extract, scroll).
- **Web Scraping & Structure Extraction**: Turns unstructured HTML into rich, structured JSON datasets using dynamic schema mapping.
- **PDF Reading**: Extracts inline text and structure from web-hosted PDF documents without needing external readers.
- **Anti-Bot Handling**: Integrated proxy rotation, user-agent randomization, canvas fingerprint spoofing, and randomized human-interaction delays.
- **Navigation History**: Keeps a detailed visual and semantic graph of traversed URLs and user actions for contextual back-tracking.

---

## 🛠️ Architecture & Component Breakdown

```
                  ┌────────────────────────────────────────┐
                  │           CozanetOS Core/Agents        │
                  └───────────────────┬────────────────────┘
                                      │ (gRPC / JSON API)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         cozanet-browser core           │
                  └────┬──────────────┬──────────────┬─────┘
                       │              │              │
                       ▼              ▼              ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │ BrowserPool   │  │ Evasion Engine│  │ Parser & OCR  │
           │ (Playwright)  │  │ (Fingerprint) │  │ (Readability) │
           └───────────────┘  └───────────────┘  └───────────────┘
```

- **BrowserPool**: Core process-manager that schedules, recycles, and monitors isolated Chromium/Firefox/WebKit instances.
- **Evasion Engine**: Intercepts browser fingerprints and applies advanced behavioral delays to simulate authentic user activities.
- **Parser & OCR Component**: Converts raw DOM elements and rendered page frames into clear, readable Markdown and clean JSON objects.

---

## 🔌 API & Interface Overview

The browser engine runs an HTTP and gRPC service. Below is a sample REST interaction.

### Create a Session and Navigate

```bash
curl -X POST http://localhost:8080/v1/browser/session   -H "Content-Type: application/json"   -d '{
    "proxy_group": "premium-residential",
    "headless": true
  }'
```

**Response:**
```json
{
  "session_id": "sess_89f072a3",
  "status": "ready"
}
```

### Search and Extract

```bash
curl -X POST http://localhost:8080/v1/browser/session/sess_89f072a3/navigate   -H "Content-Type: application/json"   -d '{
    "url": "https://www.google.com",
    "action": {
      "type": "search",
      "query": "CozanetOS architecture docs",
      "submit": true
    }
  }'
```

---

## 🔗 Integration with Other CozanetOS Modules

- `cozanet-agents`: Acts as the virtual "eyes and hands" for autonomous agents seeking live web knowledge.
- `cozanet-learning`: Feeds high-quality, scraped web text and multi-step tutorials directly into training runs and fine-tuning pipelines.
- `cozanet-multimodal`: Sends page screenshots, video playbacks, and visual elements to multimodal pipelines for element localization.
- `cozanet-security`: Feeds untrusted web scripts and downloads through the browser security filter to prevent sandbox escapes.

---

## ⚡ Quick-Start Notes

### Prerequisites
- Node.js >= 20.x or Python >= 3.10
- Playwright system dependencies installed (`npx playwright install-deps`)

### Installation
```bash
git clone https://github.com/CozanetOS/cozanet-browser.git
cd cozanet-browser
npm install
npm run build
```

### Spin up the Browser Daemon
```bash
npm run start
# Server now listening on http://localhost:8080
```
