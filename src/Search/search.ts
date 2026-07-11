import { BrowserEngine } from '../BrowserEngine';
import { SearchResult } from '../types';
import pino from 'pino';

const logger = pino({ name: 'SearchEngine' });

export class SearchEngine {
  readonly id = 'browser:search';
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
  }

  async search(
    query: string,
    engine: 'google' | 'bing' | 'duckduckgo' = 'google'
  ): Promise<SearchResult[]> {
    logger.info({ query, engine }, 'Executing search query');
    const sessionId = await this.engine.newSession();
    const page = this.engine.getSessionPage(sessionId);

    try {
      if (engine === 'google') {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        // Wait for search result containers
        await page.waitForSelector('#search', { timeout: 10000 }).catch(() => {});
        
        const results = await page.evaluate(() => {
          const items: any[] = [];
          const elements = document.querySelectorAll('div.g');
          elements.forEach(el => {
            const titleEl = el.querySelector('h3');
            const linkEl = el.querySelector('a');
            const snippetEl = el.querySelector('div[style*="-webkit-line-clamp"], .VwiC3b');
            
            if (titleEl && linkEl) {
              items.push({
                title: titleEl.textContent || '',
                url: linkEl.getAttribute('href') || '',
                snippet: snippetEl ? snippetEl.textContent || '' : ''
              });
            }
          });
          return items;
        });
        return results;

      } else if (engine === 'bing') {
        const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#b_results', { timeout: 10000 }).catch(() => {});
        
        const results = await page.evaluate(() => {
          const items: any[] = [];
          const elements = document.querySelectorAll('li.b_algo');
          elements.forEach(el => {
            const titleEl = el.querySelector('h2 a');
            const snippetEl = el.querySelector('.b_caption p, .b_algoSubcaption');
            
            if (titleEl) {
              items.push({
                title: titleEl.textContent || '',
                url: titleEl.getAttribute('href') || '',
                snippet: snippetEl ? snippetEl.textContent || '' : ''
              });
            }
          });
          return items;
        });
        return results;

      } else if (engine === 'duckduckgo') {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        const results = await page.evaluate(() => {
          const items: any[] = [];
          const elements = document.querySelectorAll('.links_main');
          elements.forEach(el => {
            const titleEl = el.querySelector('.result__a');
            const snippetEl = el.nextElementSibling?.classList.contains('result__snippet') 
              ? el.nextElementSibling 
              : null;
              
            if (titleEl) {
              items.push({
                title: titleEl.textContent || '',
                url: titleEl.getAttribute('href') || '',
                snippet: snippetEl ? snippetEl.textContent || '' : ''
              });
            }
          });
          return items;
        });
        return results;
      }
      
      return [];
    } catch (err) {
      logger.error(err, 'Search execution failed');
      throw err;
    } finally {
      await this.engine.closeSession(sessionId).catch(() => {});
    }
  }
}
