import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { processContent } from '../lib/utils';

test('fetch and process Facebook Engineering article', async ({ page }) => {
  const baseUrl = 'https://engineering.fb.com';
  const url = `${baseUrl}/2013/06/25/core-infra/tao-the-power-of-the-graph/`;
  await page.goto(url);

  const content = await page.content();
  const processedContent = await processContent(page, content, baseUrl);

  const scratchDir = path.join(os.tmpdir(), 'fb_engineering_scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const filePath = path.join(scratchDir, 'tao-the-power-of-the-graph.html');
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

