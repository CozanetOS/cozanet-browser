import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { BrowserSession, NavigationResult } from './types';

const logger = pino({ name: 'BrowserEngine' });

export class BrowserEngine {
  readonly id = 'browser:engine';
  private browser: Browser | null = null;
  private sessions = new Map<string, Page>();
  private sessionDetails = new Map<string, BrowserSession>();

  async init(): Promise<void> {
    logger.info('Initializing BrowserEngine with Playwright chromium instance...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    logger.info('BrowserEngine initialized successfully.');
  }

  async newSession(): Promise<string> {
    if (!this.browser) {
      throw new Error('BrowserEngine not initialized. Call init() first.');
    }
    const sessionId = uuidv4();
    logger.info({ sessionId }, 'Creating new browser session');
    
    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    this.sessions.set(sessionId, page);
    
    this.sessionDetails.set(sessionId, {
      id: sessionId,
      status: 'active',
      url: 'about:blank',
      title: 'New Tab',
      createdAt: new Date()
    });
    
    return sessionId;
  }

  getSessionPage(sessionId: string): Page {
    const page = this.sessions.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found.`);
    }
    return page;
  }

  async navigate(sessionId: string, url: string): Promise<NavigationResult> {
    const page = this.getSessionPage(sessionId);
    logger.info({ sessionId, url }, 'Navigating to URL');
    
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const finalUrl = page.url();
    const title = await page.title();
    const content = await page.content();
    
    // Update session details
    const session = this.sessionDetails.get(sessionId);
    if (session) {
      session.url = finalUrl;
      session.title = title;
    }
    
    return {
      url: finalUrl,
      title,
      content
    };
  }

  async screenshot(sessionId: string): Promise<Buffer> {
    const page = this.getSessionPage(sessionId);
    logger.info({ sessionId }, 'Capturing screenshot');
    return await page.screenshot({ fullPage: false });
  }

  async getContent(sessionId: string): Promise<string> {
    const page = this.getSessionPage(sessionId);
    return await page.content();
  }

  async closeSession(sessionId: string): Promise<void> {
    const page = this.sessions.get(sessionId);
    if (page) {
      logger.info({ sessionId }, 'Closing session page');
      await page.close();
      const context = page.context();
      if (context) {
        await context.close();
      }
      this.sessions.delete(sessionId);
      
      const session = this.sessionDetails.get(sessionId);
      if (session) {
        session.status = 'closed';
      }
    }
  }

  async destroy(): Promise<void> {
    logger.info('Destroying BrowserEngine and closing browser');
    for (const sessionId of this.sessions.keys()) {
      await this.closeSession(sessionId).catch(() => {});
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  listSessions(): BrowserSession[] {
    return Array.from(this.sessionDetails.values());
  }
}
