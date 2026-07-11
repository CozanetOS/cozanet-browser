import { z } from 'zod';

export interface BrowserSession {
  id: string;
  status: 'active' | 'idle' | 'closed';
  url: string;
  title: string;
  createdAt: Date;
}

export interface NavigationResult {
  url: string;
  title: string;
  content: string;
  screenshot?: Buffer;
}

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

export interface ScrapedContent {
  url: string;
  title: string;
  textContent: string;
  html: string;
  markdown: string;
  byline?: string;
  excerpt?: string;
}

export interface ArticleContent {
  title: string;
  content: string;
  textContent: string;
  byline?: string;
  length: number;
  excerpt?: string;
}

export const FormFieldMapSchema = z.record(z.string(), z.string());
export type FormFieldMap = z.infer<typeof FormFieldMapSchema>;
