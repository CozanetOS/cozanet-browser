import { BrowserEngine } from '../BrowserEngine';
import pino from 'pino';

const logger = pino({ name: 'BrowserAutomation' });

export class BrowserAutomation {
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
  }

  async click(sessionId: string, selector: string): Promise<void> {
    logger.info({ sessionId, selector }, 'Clicking element');
    const page = this.engine.getSessionPage(sessionId);
    await page.click(selector, { timeout: 15000 });
  }

  async type(sessionId: string, selector: string, text: string): Promise<void> {
    logger.info({ sessionId, selector }, 'Typing text into element');
    const page = this.engine.getSessionPage(sessionId);
    await page.fill(selector, text, { timeout: 15000 });
  }

  async waitFor(sessionId: string, selector: string): Promise<void> {
    logger.info({ sessionId, selector }, 'Waiting for element selector');
    const page = this.engine.getSessionPage(sessionId);
    await page.waitForSelector(selector, { timeout: 20000 });
  }

  async evaluate<T>(sessionId: string, script: string): Promise<T> {
    logger.info({ sessionId }, 'Evaluating custom JavaScript script on page');
    const page = this.engine.getSessionPage(sessionId);
    // Safe execution of custom client-side javascript
    return await page.evaluate<T>((js) => {
      return eval(js);
    }, script);
  }
}
