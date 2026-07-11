# CozanetOS Browser Engine

High-performance Playwright-based browser engine designed to enable autonomous system operations, scraping, automation, and search via simple string identifiers and clean API endpoints.

Ideal for **CEO AI** autonomous control. The CEO AI orchestrates this web browser using uniquely identifying string engine components (e.g. `browser:engine`, `browser:navigation`, `browser:search`).

## Engine Core Component IDs

- **Main Browser Engine:** `browser:engine` - Manages browser startup, creation and tear down of lightweight contexts and pages, mapping unique session IDs to distinct Playwright instances.
- **Navigation Module:** `browser:navigation` - Controls back, forward, navigation, and page reloads.
- **Search Module:** `browser:search` - Connects query strings seamlessly to Google, Bing, and DuckDuckGo for automated parsing.

## Features

- **Playwright Powered**: Native chromium headless interactions with sandbox hardening.
- **Mozilla Readability**: Extract primary article content, stripping away navigation sidebars, headers, and ads.
- **Zod Schema Validations**: Built-in strict structure and type checks for seamless form maps and data schemas.
- **High Fidelity Screenshots**: Capture target DOM elements or full page graphics asynchronously.
- **Autofill forms**: Fully interactive selector and input engine matching HTML selects, checkboxes, text fields, and radios.
- **HTML to Markdown conversion**: Built-in Turndown parsing.

## Installation

```bash
npm install
npm run build
```

## Quick Start Example

```typescript
import { BrowserEngine, NavigationEngine, WebScraper } from './dist/index.js';

const engine = new BrowserEngine();
await engine.init();

// Start a fresh, segregated profile session
const sessionId = await engine.newSession();

// Navigation Engine
const navigator = new NavigationEngine(engine);
await navigator.navigate(sessionId, 'https://github.com');

// Scrape structured article
const scraper = new WebScraper(engine);
const result = await scraper.scrape('https://example.com/some-article');
console.log(result.markdown);

await engine.destroy();
```

## License

MIT
