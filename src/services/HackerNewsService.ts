/**
 * Hacker News API Service
 * 
 * Fetches and processes data from the Hacker News API
 * API Documentation: https://github.com/HackerNews/API
 */

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number; // comment count
  type: string;
}

export interface HNStorySummary {
  id: number;
  title: string;
  url: string;
  score: number;
  author: string;
  timeAgo: string;
  commentCount: number;
}

export class HackerNewsService {
  private static readonly BASE_URL = 'https://hacker-news.firebaseio.com/v0';
  private static readonly ITEM_URL = `${this.BASE_URL}/item`;
  private static readonly TOP_STORIES_URL = `${this.BASE_URL}/topstories.json`;
  private static readonly NEW_STORIES_URL = `${this.BASE_URL}/newstories.json`;
  private static readonly BEST_STORIES_URL = `${this.BASE_URL}/beststories.json`;

  /**
   * Fetch top story IDs
   */
  static async fetchTopStoryIds(limit: number = 30): Promise<number[]> {
    try {
      const response = await fetch(this.TOP_STORIES_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch top stories: ${response.status}`);
      }
      const ids: number[] = await response.json();
      return ids.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top story IDs:', error);
      throw error;
    }
  }

  /**
   * Fetch new story IDs
   */
  static async fetchNewStoryIds(limit: number = 30): Promise<number[]> {
    try {
      const response = await fetch(this.NEW_STORIES_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch new stories: ${response.status}`);
      }
      const ids: number[] = await response.json();
      return ids.slice(0, limit);
    } catch (error) {
      console.error('Error fetching new story IDs:', error);
      throw error;
    }
  }

  /**
   * Fetch best story IDs
   */
  static async fetchBestStoryIds(limit: number = 30): Promise<number[]> {
    try {
      const response = await fetch(this.BEST_STORIES_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch best stories: ${response.status}`);
      }
      const ids: number[] = await response.json();
      return ids.slice(0, limit);
    } catch (error) {
      console.error('Error fetching best story IDs:', error);
      throw error;
    }
  }

  /**
   * Fetch a single story by ID
   */
  static async fetchStory(id: number): Promise<HNStory | null> {
    try {
      const response = await fetch(`${this.ITEM_URL}/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch story ${id}: ${response.status}`);
      }
      const story: HNStory = await response.json();
      return story;
    } catch (error) {
      console.error(`Error fetching story ${id}:`, error);
      return null;
    }
  }

  /**
   * Fetch multiple stories by IDs
   */
  static async fetchStories(ids: number[]): Promise<HNStory[]> {
    try {
      const promises = ids.map(id => this.fetchStory(id));
      const stories = await Promise.all(promises);
      // Filter out null values (failed fetches)
      return stories.filter((story): story is HNStory => story !== null);
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  /**
   * Fetch top stories with full details
   */
  static async fetchTopStories(limit: number = 15): Promise<HNStory[]> {
    const ids = await this.fetchTopStoryIds(limit);
    return this.fetchStories(ids);
  }

  /**
   * Fetch new stories with full details
   */
  static async fetchNewStories(limit: number = 15): Promise<HNStory[]> {
    const ids = await this.fetchNewStoryIds(limit);
    return this.fetchStories(ids);
  }

  /**
   * Fetch best stories with full details
   */
  static async fetchBestStories(limit: number = 15): Promise<HNStory[]> {
    const ids = await this.fetchBestStoryIds(limit);
    return this.fetchStories(ids);
  }

  /**
   * Process story into summary format
   */
  static processStory(story: HNStory): HNStorySummary {
    return {
      id: story.id,
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      score: story.score,
      author: story.by,
      timeAgo: this.formatTimeAgo(story.time),
      commentCount: story.descendants || 0,
    };
  }

  /**
   * Process multiple stories into summary format
   */
  static processStories(stories: HNStory[]): HNStorySummary[] {
    return stories.map(story => this.processStory(story));
  }

  /**
   * Format Unix timestamp to "time ago" string
   */
  private static formatTimeAgo(unixTime: number): string {
    const now = Date.now() / 1000; // Convert to seconds
    const diff = now - unixTime;

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }

  /**
   * Calculate "health score" based on HN activity
   * This is a fun metric to drive the horror theme
   * Lower scores = more activity/chaos = more horror
   */
  static calculateHealthScore(stories: HNStorySummary[]): number {
    if (stories.length === 0) return 100;

    // Calculate average score
    const avgScore = stories.reduce((sum, story) => sum + story.score, 0) / stories.length;
    
    // Calculate average comment count
    const avgComments = stories.reduce((sum, story) => sum + story.commentCount, 0) / stories.length;

    // High scores and high comment counts = lots of activity = lower health
    // Normalize to 0-100 scale
    let health = 100;

    // Deduct for high average scores (popular stories)
    if (avgScore > 100) {
      health -= Math.min(30, (avgScore - 100) / 10);
    }

    // Deduct for high comment counts (controversial/active discussions)
    if (avgComments > 50) {
      health -= Math.min(40, (avgComments - 50) / 5);
    }

    // Add some randomness for variety
    health -= Math.random() * 10;

    return Math.max(0, Math.min(100, Math.round(health)));
  }
}
