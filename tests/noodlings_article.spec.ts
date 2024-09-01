import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { processContent } from '../lib/utils';

test('fetch and process Noodlings article', async ({ page }) => {
  const baseUrl = 'https://fraklopez.com';
  const articlePath = '/noodlings/2024-08-25-i-will-fail-your-technicals/';
  const url = `${baseUrl}${articlePath}`;
  
  await page.goto(url);

  const content = await page.content();
  let processedContent = await processContent(page, content, baseUrl);

  // Convert each sentence to a new paragraph
  processedContent = processedContent.replace(/\. /g, '.</p><p>');

  const scratchDir = path.join(os.tmpdir(), 'noodlings_scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const filePath = path.join(scratchDir, 'i-will-fail-your-technicals.html');
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

