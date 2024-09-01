import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

test('fetch and process Gleam Lang article', async ({ page }) => {
  const url = 'https://pliutau.com/my-first-experience-with-gleam-lang/';
  await page.goto(url);

  const content = await page.content();

  const processedContent = await page.evaluate((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.getElementsByTagName('a');
    for (let link of links) {
      link.href = new URL(link.href, 'https://pliutau.com').href;
    }
    const images = doc.getElementsByTagName('img');
    for (let img of images) {
      img.src = new URL(img.src, 'https://pliutau.com').href;
    }
    return doc.documentElement.outerHTML;
  }, content);

  const scratchDir = path.join(os.tmpdir(), 'gleam_lang_scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const filePath = path.join(scratchDir, 'my-first-experience-with-gleam-lang.html');
  fs.writeFileSync(filePath, processedContent);

  console.log(`File saved to: ${filePath}`);

  expect(fs.existsSync(filePath)).toBeTruthy();

  // Verify that all links are absolute
  const savedContent = fs.readFileSync(filePath, 'utf-8');
  const absoluteLinkRegex = /<a[^>]+href="(https?:\/\/[^"]+)"/g;
  const links = savedContent.match(absoluteLinkRegex) || [];
  
  expect(links.length).toBeGreaterThan(0);
  links.forEach(link => {
    expect(link).toMatch(/href="https?:\/\//);
  });

  // Verify that all image sources are absolute
  const absoluteImgRegex = /<img[^>]+src="(https?:\/\/[^"]+)"/g;
  const images = savedContent.match(absoluteImgRegex) || [];
  
  expect(images.length).toBeGreaterThan(0);
  images.forEach(img => {
    expect(img).toMatch(/src="https?:\/\//);
  });
});

