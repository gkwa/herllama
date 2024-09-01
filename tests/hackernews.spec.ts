import { test, expect } from '@playwright/test';
import { HackerNewsService } from '../src/services/hackerNewsService';
import { HackerNewsRepository } from '../src/repositories/hackerNewsRepository';
import { CacheManager } from '../src/utils/cacheManager';

test.describe('Hacker News Titles', () => {
 let hackerNewsService: HackerNewsService;

 test.beforeEach(async ({ page }) => {
   const cacheManager = new CacheManager();
   const hackerNewsRepository = new HackerNewsRepository(cacheManager);
   hackerNewsService = new HackerNewsService(hackerNewsRepository);

   await page.routeFromHAR('./hars/hackernews.har', {
     url: '*//hacker-news.firebaseio.com/v0/**',
     update: process.env.UPDATE_HAR === 'true',
   });
 });

 test('fetch top stories titles', async () => {
   const titles = await hackerNewsService.getTopStoriesTitles();
   expect(titles.length).toBeGreaterThan(0);
   expect(titles[0]).toBeTruthy();
 });
});

