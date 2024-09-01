import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('get Hacker News titles', async ({ page, context }) => {
  const harPath = path.join(__dirname, '..', 'hars', 'hackernews.har');
  const useLiveRequests = process.env.USE_LIVE_REQUESTS === 'true';

  if (useLiveRequests) {
    console.log('Using live requests to Hacker News.');
  } else if (!fs.existsSync(harPath)) {
    console.log('HAR file does not exist. Creating a new one and using live requests.');
    await context.routeFromHAR(harPath, {
      url: '*://news.ycombinator.com/*',
      update: true,
    });
  } else {
    console.log('Using existing HAR file for requests.');
    await context.routeFromHAR(harPath, {
      url: '*://news.ycombinator.com/*',
      update: false,
    });
  }

  try {
    await page.goto('https://news.ycombinator.com/', { timeout: 30000 });
  } catch (error) {
    console.error('Failed to load the page:', error);
    throw error;
  }

  const titles = await page.evaluate(() => {
    const titleElements = document.querySelectorAll('.titleline > a');
    return Array.from(titleElements).map((el) => el.textContent);
  });

  console.log('Hacker News Titles:');
  titles.forEach((title, index) => {
    console.log(`${index + 1}. ${title}`);
  });

  expect(titles.length).toBeGreaterThan(0);
});
