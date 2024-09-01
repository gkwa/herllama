import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { processContent } from '../lib/utils';

test('fetch and process AirTags article', async ({ page }) => {
  test.setTimeout(30000);

  const baseUrl = 'https://appleinsider.com';
  const articlePath = '/inside/airtags';
  const url = `${baseUrl}${articlePath}`;
  
  await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => console.log('H1 not found, but continuing.'));

  const isContentLoaded = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const paragraphs = document.querySelectorAll('p');
    return h1 && paragraphs.length > 5;
  });

  if (!isContentLoaded) {
    console.log('Essential content not detected, but continuing with the test.');
  }

  const content = await page.content();
  const processedContent = await processContent(page, content, baseUrl);

  const scratchDir = path.join(os.tmpdir(), 'airtags_scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const filePath = path.join(scratchDir, 'airtags-article.html');
  fs.writeFileSync(filePath, processedContent);

  console.log(`File saved to: ${filePath}`);

  expect(fs.existsSync(filePath)).toBeTruthy();

  const savedContent = fs.readFileSync(filePath, 'utf-8');
  const absoluteUrlRegex = /(href|src|srcset)="(https?:\/\/[^"]+)"/g;
  const matches = savedContent.match(absoluteUrlRegex) || [];
  
  expect(matches.length).toBeGreaterThan(0);
  matches.forEach(match => {
    expect(match).toMatch(/(href|src|srcset)="https?:\/\//);
  });
});

