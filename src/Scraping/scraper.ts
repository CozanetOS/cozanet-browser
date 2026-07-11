import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { BrowserEngine } from '../BrowserEngine';
import { ScrapedContent, ArticleContent } from '../types';
import pino from 'pino';

const logger = pino({ name: 'WebScraper' });

export class WebScraper {
  private engine: BrowserEngine;
  private turndown: TurndownService;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
  }

  async scrape(url: string): Promise<ScrapedContent> {
    logger.info({ url }, 'Scraping content from URL');
    const sessionId = await this.engine.newSession();
    
    try {
      const navResult = await this.engine.navigate(sessionId, url);
      const article = await this.extract(navResult.content);
      const markdown = this.toMarkdown(article.content || navResult.content);

      return {
        url: navResult.url,
        title: article.title || navResult.title,
        textContent: article.textContent || '',
        html: navResult.content,
        markdown,
        byline: article.byline,
        excerpt: article.excerpt
      };
    } finally {
      await this.engine.closeSession(sessionId).catch(() => {});
    }
  }

  async extract(html: string): Promise<ArticleContent> {
    logger.info('Extracting readability article elements from HTML');
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      logger.warn('Readability parsing returned null, trying fallback parsing');
      return {
        title: dom.window.document.title || 'Untitled',
        content: dom.window.document.body?.innerHTML || '',
        textContent: dom.window.document.body?.textContent || '',
        length: dom.window.document.body?.textContent?.length || 0
      };
    }

    return {
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      byline: article.byline,
      length: article.length,
      excerpt: article.excerpt
    };
  }

  toMarkdown(html: string): string {
    logger.info('Converting HTML to Markdown');
    return this.turndown.turndown(html);
  }
}
