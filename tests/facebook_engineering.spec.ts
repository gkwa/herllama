import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

test('fetch and process Facebook Engineering article', async ({ page }) => {
 const url = 'https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/';
 await page.goto(url);

 const content = await page.content();

 const processedContent = await page.evaluate((html) => {
   const parser = new DOMParser();
   const doc = parser.parseFromString(html, 'text/html');
   const links = doc.getElementsByTagName('a');
   for (let link of links) {
     link.href = new URL(link.href, 'https://engineering.fb.com').href;
   }
   return doc.documentElement.outerHTML;
 }, content);

 const scratchDir = path.join(os.tmpdir(), 'fb_engineering_scratch');
 if (!fs.existsSync(scratchDir)) {
   fs.mkdirSync(scratchDir, { recursive: true });
 }

 const filePath = path.join(scratchDir, 'tao-the-power-of-the-graph.html');
 fs.writeFileSync(filePath, processedContent);

 console.log(`File saved to: ${filePath}`);

 expect(fs.existsSync(filePath)).toBeTruthy();
});

