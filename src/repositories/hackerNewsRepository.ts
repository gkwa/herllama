import axios from 'axios';
import { CacheManager } from '../utils/cacheManager';

export interface Story {
 id: number;
 title: string;
}

export class HackerNewsRepository {
 private baseUrl = 'https://hacker-news.firebaseio.com/v0';

 constructor(private cacheManager: CacheManager) {}

 async getTopStories(): Promise<number[]> {
   return this.cacheManager.getOrSet('topStories', () =>
     axios.get<number[]>(`${this.baseUrl}/topstories.json`).then(res => res.data)
   );
 }

 async getStory(id: number): Promise<Story> {
   return this.cacheManager.getOrSet(`story:${id}`, () =>
     axios.get<Story>(`${this.baseUrl}/item/${id}.json`).then(res => res.data)
   );
 }
}

