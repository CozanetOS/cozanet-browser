import { BrowserEngine } from '../BrowserEngine';
import pino from 'pino';

const logger = pino({ name: 'ScreenshotEngine' });

export class ScreenshotEngine {
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
  }

  async capture(url: string, fullPage: boolean = false): Promise<Buffer> {
    logger.info({ url, fullPage }, 'Capturing full-page/viewport screenshot');
    const sessionId = await this.engine.newSession();
    const page = this.engine.getSessionPage(sessionId);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      return await page.screenshot({ fullPage });
    } finally {
      await this.engine.closeSession(sessionId).catch(() => {});
    }
  }

  async captureElement(url: string, selector: string): Promise<Buffer> {
    logger.info({ url, selector }, 'Capturing selector element screenshot');
    const sessionId = await this.engine.newSession();
    const page = this.engine.getSessionPage(sessionId);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const element = await page.waitForSelector(selector, { timeout: 10000 });
      return await element.screenshot();
    } finally {
      await this.engine.closeSession(sessionId).catch(() => {});
    }
  }
}
