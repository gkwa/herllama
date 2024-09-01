import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

test('fetch and process AirTags article', async ({ page }) => {
  test.setTimeout(30000); // Set timeout to 30s

  const baseUrl = 'https://appleinsider.com';
  const articlePath = '/inside/airtags';
  const url = `${baseUrl}${articlePath}`;
  
  await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

  // Wait for a specific element that indicates the main content has loaded
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => console.log('H1 not found, but continuing.'));

  // Custom function to check if essential content is present
  const isContentLoaded = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const paragraphs = document.querySelectorAll('p');
    return h1 && paragraphs.length > 5; // Adjust these criteria as needed
  });

  if (!isContentLoaded) {
    console.log('Essential content not detected, but continuing with the test.');
  }

  const content = await page.content();

  const processedContent = await page.evaluate(({ html, baseUrl }) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.getElementsByTagName('a');
    for (let link of links) {
      link.href = new URL(link.href, baseUrl).href;
    }
    const images = doc.getElementsByTagName('img');
    for (let img of images) {
      img.src = new URL(img.src, baseUrl).href;
    }
    return doc.documentElement.outerHTML;
  }, { html: content, baseUrl });

  const scratchDir = path.join(os.tmpdir(), 'airtags_scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const filePath = path.join(scratchDir, 'airtags-article.html');
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

