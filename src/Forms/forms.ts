import { BrowserEngine } from '../BrowserEngine';
import { FormFieldMap } from '../types';
import pino from 'pino';

const logger = pino({ name: 'FormFiller' });

export class FormFiller {
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine) {
    this.engine = engine;
  }

  async fillForm(sessionId: string, fields: FormFieldMap): Promise<void> {
    logger.info({ sessionId, fields: Object.keys(fields) }, 'Filling form fields');
    const page = this.engine.getSessionPage(sessionId);

    for (const [selector, value] of Object.entries(fields)) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const tag = await page.$eval(selector, el => el.tagName.toLowerCase());
        const type = await page.$eval(selector, el => el.getAttribute('type')?.toLowerCase());

        if (tag === 'select') {
          await page.selectOption(selector, value);
        } else if (type === 'checkbox' || type === 'radio') {
          const isChecked = await page.$eval(selector, (el: any) => el.checked);
          const shouldCheck = value === 'true' || value === 'yes' || value === '1';
          if (isChecked !== shouldCheck) {
            await page.click(selector);
          }
        } else {
          await page.fill(selector, value);
        }
        logger.info({ selector }, 'Filled field successfully');
      } catch (err) {
        logger.error({ selector, err }, 'Failed to autofill field');
        throw err;
      }
    }
  }

  async submitForm(sessionId: string, submitButtonSelector: string): Promise<void> {
    logger.info({ sessionId, submitButtonSelector }, 'Submitting form');
    const page = this.engine.getSessionPage(sessionId);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
      page.click(submitButtonSelector)
    ]);
  }
}
