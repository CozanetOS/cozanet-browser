import { BrowserEngine } from '../BrowserEngine';
import { NavigationResult } from '../types';
import pino from 'pino';

const logger = pino({ name: 'NavigationEngine' });

export class NavigationEngine {
  readonly id = 'browser:navigation';
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
  }

  async navigate(sessionId: string, url: string): Promise<NavigationResult> {
    logger.info({ sessionId, url }, 'Navigating via NavigationEngine');
    return await this.engine.navigate(sessionId, url);
  }

  async back(sessionId: string): Promise<NavigationResult> {
    logger.info({ sessionId }, 'Going back in history');
    const page = this.engine.getSessionPage(sessionId);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    return {
      url: page.url(),
      title: await page.title(),
      content: await page.content()
    };
  }

  async forward(sessionId: string): Promise<NavigationResult> {
    logger.info({ sessionId }, 'Going forward in history');
    const page = this.engine.getSessionPage(sessionId);
    await page.goForward({ waitUntil: 'domcontentloaded' });
    return {
      url: page.url(),
      title: await page.title(),
      content: await page.content()
    };
  }

  async reload(sessionId: string): Promise<NavigationResult> {
    logger.info({ sessionId }, 'Reloading page');
    const page = this.engine.getSessionPage(sessionId);
    await page.reload({ waitUntil: 'domcontentloaded' });
    return {
      url: page.url(),
      title: await page.title(),
      content: await page.content()
    };
  }
}
