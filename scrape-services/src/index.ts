import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { chromium } from 'playwright';
const app = new Hono();

app.get('/', (c) => {
  return c.text('NHIS Services');
});

app.get('/severe-weather-outlook', async (c) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
      'https://www.metservice.com/warnings/severe-weather-outlook',
    );
    // await page.waitForTimeout(1500);

    await page
      .locator('.u-mT-responsive')
      .first()
      .waitFor({ state: 'visible', timeout: 5000 });

    const data = await page.evaluate(() => {
      const container = document.querySelector('.u-mT-responsive');
      if (!container) return { outlookItems: [], issuedDate: '' };

      const h2Elements = container.querySelectorAll('h2');
      const pElements = container.querySelectorAll('p[style="clear:both"]');

      const outlookItems = Array.from(h2Elements).map((h2, index) => {
        const pElement = pElements[index];
        let outlook = '';
        if (pElement) {
          const clone = pElement.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
          outlook = clone.textContent?.trim() || '';
        }
        return {
          date: h2.textContent?.trim() || '',
          outlook,
        };
      });

      const greyElements = document.querySelectorAll(
        '.u-textGrey.small.u-block.u-mT-xs',
      );
      let issuedDate = '';
      greyElements.forEach((el) => {
        const text = el.textContent || '';
        if (text.includes('Issued:')) {
          issuedDate = text.trim().replace('Issued:', '').trim();
        }
      });

      return {
        outlookItems,
        issuedDate,
      };
    });
    console.log('Severe Weather Outlook data fetched successfully');
    return c.json(data);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get('/thunderstorm-outlook', async (c) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.metservice.com/warnings/thunderstorm-outlook');
    // await page.waitForTimeout(1500);

    await page
      .locator('.u-mT-responsive')
      .first()
      .waitFor({ state: 'visible', timeout: 5000 });

    const data = await page.evaluate(() => {
      const groupByIssuedDate = (
        arr: string[],
      ): {
        issuedDate: string;
        outlook: string[];
      }[] => {
        const result: {
          issuedDate: string;
          outlook: string[];
        }[] = [];
        let currentOutlook: string[] = [];

        for (const line of arr) {
          if (!line || !line.trim()) continue;

          if (line.startsWith('Issued:')) {
            result.push({
              issuedDate: line.replace('Issued:', '').trim(),
              outlook: currentOutlook,
            });
            currentOutlook = [];
          } else {
            currentOutlook.push(line);
          }
        }

        return result;
      };

      const container = document.querySelector('.u-mT-responsive');
      if (!container) return { outlookItems: [], issuedDate: '' };

      const h2Elements = container.querySelectorAll('h2');
      const pElements = container.querySelectorAll('p');

      const headers = Array.from(h2Elements).map(
        (h2) => h2.innerText?.trim() || '',
      );
      const pTexts = Array.from(pElements).map((p) => {
        return p.innerText?.trim() || '';
      });

      const groupedOutlooks = groupByIssuedDate(pTexts);

      return headers.map((header, index) => {
        return {
          header,
          outlook: groupedOutlooks[index]?.outlook.join('\n\n').trim() || '',
          issuedDate: groupedOutlooks[index]?.issuedDate || '',
        };
      });
    });
    console.log('Thunderstorm Outlook data fetched successfully');
    return c.json(data);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok' }));

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
