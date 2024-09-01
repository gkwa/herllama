import { HackerNewsRepository } from '../repositories/hackerNewsRepository';

export class HackerNewsService {
 constructor(private repository: HackerNewsRepository) {}

 async getTopStoriesTitles(): Promise<string[]> {
   const topStoryIds = await this.repository.getTopStories();
   const stories = await Promise.all(
     topStoryIds.slice(0, 30).map(id => this.repository.getStory(id))
   );
   return stories.map(story => story.title);
 }
}

