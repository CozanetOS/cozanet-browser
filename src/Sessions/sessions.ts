import { BrowserEngine } from '../BrowserEngine';
import { BrowserSession } from '../types';
import pino from 'pino';

const logger = pino({ name: 'BrowserSessionManager' });

export class BrowserSessionManager {
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
  }

  async createSession(): Promise<string> {
    logger.info('Creating session managed by BrowserSessionManager');
    return await this.engine.newSession();
  }

  async closeSession(sessionId: string): Promise<void> {
    logger.info({ sessionId }, 'Closing session managed by BrowserSessionManager');
    await this.engine.closeSession(sessionId);
  }

  listSessions(): BrowserSession[] {
    return this.engine.listSessions();
  }
}
