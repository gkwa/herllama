import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { processContent } from '../lib/utils';

test('fetch and process Frak Lopez article', async ({ page }) => {
  const baseUrl = 'https://fraklopez.com';
  const url = `${baseUrl}/noodlings/2024-08-25-i-will-fail-your-technicals/`;
  await page.goto(url);

  const content = await page.content();
  const processedContent = await processContent(page, content, baseUrl);

  const scratchDir = path.join(os.tmpdir(), 'fraklopez_scratch');
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

