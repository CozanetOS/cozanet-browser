/**
 * LiteBrowser — Fetch-based browser for serverless environments.
 * Used when Playwright is not available (e.g. Vercel Edge Runtime).
 * Provides navigate, scrape, extractText, getLinks, search without Playwright.
 */

export interface LiteNavResult {
  url: string;
  title: string;
  text: string;
  html: string;
  contentLength: number;
  links: { text: string; url: string }[];
}

export interface LiteScrapeResult {
  url: string;
  title: string;
  textContent: string;
  markdown: string;
  excerpt: string;
  byline?: string;
}

export interface LiteSearchResult {
  title: string;
  url: string;
  snippet: string;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class LiteBrowser {
  readonly id = 'browser:lite';

  async navigate(url: string): Promise<LiteNavResult> {
    const response = await fetch(url, {
      headers: { 'User-Agent': UA },
    });

    if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);

    const html = await response.text();
    const title = this.extractTitle(html);
    const text = this.htmlToText(html);
    const links = this.extractLinks(html);

    return { url, title, text, html, contentLength: html.length, links };
  }

  async scrape(url: string): Promise<LiteScrapeResult> {
    const navResult = await this.navigate(url);
    const markdown = this.htmlToMarkdown(navResult.html);

    return {
      url: navResult.url,
      title: navResult.title,
      textContent: navResult.text,
      markdown,
      excerpt: navResult.text.slice(0, 300),
    };
  }

  async search(
    query: string,
    engine: 'duckduckgo' | 'google' | 'bing' = 'duckduckgo'
  ): Promise<LiteSearchResult[]> {
    // DuckDuckGo HTML — no API key needed
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': UA },
    });

    if (!response.ok) throw new Error(`Search failed: ${response.status}`);

    const html = await response.text();
    return this.parseDuckDuckGoResults(html);
  }

  async extractText(url: string): Promise<{ url: string; title: string; text: string; length: number }> {
    const navResult = await this.navigate(url);
    return { url, title: navResult.title, text: navResult.text, length: navResult.text.length };
  }

  async getLinks(url: string): Promise<{ url: string; links: { text: string; url: string }[]; count: number }> {
    const navResult = await this.navigate(url);
    return { url, links: navResult.links, count: navResult.links.length };
  }

  // ── Helpers ──────────────────────────────────────────────

  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].trim() : 'Untitled';
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private htmlToMarkdown(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<h1[^>]*>([^<]*)<\/h1>/gi, '\n# $1\n')
      .replace(/<h2[^>]*>([^<]*)<\/h2>/gi, '\n## $1\n')
      .replace(/<h3[^>]*>([^<]*)<\/h3>/gi, '\n### $1\n')
      .replace(/<li[^>]*>([^<]*)<\/li>/gi, '- $1\n')
      .replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n\n')
      .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, '[$2]($1)')
      .replace(/<strong[^>]*>([^<]*)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>([^<]*)<\/em>/gi, '*$1*')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private extractLinks(html: string): { text: string; url: string }[] {
    const links: { text: string; url: string }[] = [];
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      if (href.startsWith('http') && text) {
        links.push({ text, url: href });
      }
    }
    return links;
  }

  private parseDuckDuckGoResults(html: string): LiteSearchResult[] {
    const results: LiteSearchResult[] = [];
    const resultRegex = /<a[^>]*class="result__a"[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>[\s\S]*?class="result__snippet"[^>]*>([^<]*)/gi;
    let match;
    while ((match = resultRegex.exec(html)) !== null) {
      results.push({
        title: match[2].trim(),
        url: match[1].trim(),
        snippet: match[3].trim(),
      });
    }
    return results;
  }
}
