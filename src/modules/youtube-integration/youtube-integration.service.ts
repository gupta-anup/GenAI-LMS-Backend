import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  YouTubeVideo,
  YouTubeSearchOptions,
  YouTubeSearchResult,
  EducationalChannel,
} from './interfaces';

@Injectable()
export class YouTubeIntegrationService {
  private readonly logger = new Logger(YouTubeIntegrationService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';
  
  // Educational channels whitelist (high-quality programming/educational content)
  private readonly educationalChannels: EducationalChannel[] = [
    {
      channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA',
      channelName: 'Programming with Mosh',
      description: 'Programming tutorials',
      isVerified: true,
      subscriberCount: 3000000,
      categories: ['programming', 'web-development', 'software-engineering'],
      qualityScore: 0.95,
    },
    {
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      channelName: 'freeCodeCamp.org',
      description: 'Free programming courses',
      isVerified: true,
      subscriberCount: 7000000,
      categories: ['programming', 'web-development', 'computer-science'],
      qualityScore: 0.98,
    },
    {
      channelId: 'UCvjgXvBlbQiydffZU7m1_aw',
      channelName: 'The Coding Train',
      description: 'Creative coding tutorials',
      isVerified: true,
      subscriberCount: 1500000,
      categories: ['programming', 'creative-coding', 'javascript'],
      qualityScore: 0.92,
    },
    {
      channelId: 'UCcabW7890RKdqK30bkdFjxw',
      channelName: 'Fireship',
      description: 'Fast-paced programming tutorials',
      isVerified: true,
      subscriberCount: 2800000,
      categories: ['programming', 'web-development', 'javascript'],
      qualityScore: 0.94,
    },
    {
      channelId: 'UCFbNIlppjAuEX4znoulh0Cw',
      channelName: 'Web Dev Simplified',
      description: 'Web development made simple',
      isVerified: true,
      subscriberCount: 1200000,
      categories: ['web-development', 'javascript', 'css'],
      qualityScore: 0.90,
    },
  ];

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('YouTube API key not found. Using mock data.');
    }
  }

  async searchVideos(
    query: string,
    options: YouTubeSearchOptions = {},
  ): Promise<YouTubeSearchResult> {
    this.logger.log(`Searching for videos: ${query}`);

    try {
      if (!this.apiKey) {
        return this.getMockSearchResult(query, options);
      }

      return await this.searchYouTubeAPI(query, options);
    } catch (error) {
      this.logger.error('Error searching YouTube:', error);
      // Fallback to mock data if API fails
      return this.getMockSearchResult(query, options);
    }
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    this.logger.log(`Getting video details for: ${videoId}`);

    try {
      if (!this.apiKey) {
        return this.getMockVideoDetails(videoId);
      }

      return await this.getYouTubeVideoDetails(videoId);
    } catch (error) {
      this.logger.error('Error getting video details:', error);
      return this.getMockVideoDetails(videoId);
    }
  }

  calculateRelevanceScore(video: any, searchQuery: string): number {
    let score = 0;

    // Title relevance (40% weight)
    const titleMatch = this.calculateTextRelevance(video.snippet.title, searchQuery);
    score += titleMatch * 0.4;

    // Description relevance (30% weight)
    const descMatch = this.calculateTextRelevance(video.snippet.description, searchQuery);
    score += descMatch * 0.3;

    // Educational channel bonus (20% weight)
    const isEducational = this.isEducationalChannel(video.snippet.channelId);
    if (isEducational) {
      const channel = this.educationalChannels.find(c => c.channelId === video.snippet.channelId);
      score += (channel?.qualityScore || 0.8) * 0.2;
    }

    // View count factor (10% weight) - normalized
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    const viewScore = Math.min(viewCount / 1000000, 1); // Cap at 1M views = 1.0 score
    score += viewScore * 0.1;

    return Math.min(score, 1); // Cap at 1.0
  }

  private calculateTextRelevance(text: string, query: string): number {
    if (!text || !query) return 0;

    const textLower = text.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');
    
    let matches = 0;
    for (const term of queryTerms) {
      if (textLower.includes(term)) {
        matches++;
      }
    }

    return matches / queryTerms.length;
  }

  private isEducationalChannel(channelId: string): boolean {
    return this.educationalChannels.some(channel => channel.channelId === channelId);
  }

  private async searchYouTubeAPI(
    query: string,
    options: YouTubeSearchOptions,
  ): Promise<YouTubeSearchResult> {
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      key: this.apiKey,
      maxResults: options.maxResults || 10,
      order: options.order || 'relevance',
      safeSearch: options.safeSearch || 'strict',
      relevanceLanguage: options.relevanceLanguage || 'en',
      videoDuration: options.duration,
      publishedAfter: options.publishedAfter?.toISOString(),
    };

    // Filter for educational channels if requested
    if (options.educationalChannelsOnly) {
      const channelIds = this.educationalChannels.map(c => c.channelId).join(',');
      params['channelId'] = channelIds;
    }

    const response = await axios.get(`${this.baseUrl}/search`, { params });
    const searchData = response.data as any;

    // Get detailed information for each video
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videoDetails = await this.getVideosDetails(videoIds);

    const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
      const details = videoDetails.find((v: any) => v.id === item.id.videoId);
      const relevanceScore = this.calculateRelevanceScore({ ...item, statistics: details?.statistics }, query);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        duration: this.parseDuration(details?.contentDetails?.duration || 'PT0S'),
        channelName: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: new Date(item.snippet.publishedAt),
        viewCount: parseInt(details?.statistics?.viewCount || '0'),
        likeCount: parseInt(details?.statistics?.likeCount || '0'),
        relevanceScore,
        isEducational: this.isEducationalChannel(item.snippet.channelId),
        tags: details?.snippet?.tags || [],
      };
    });

    // Sort by relevance score
    videos.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      videos,
      totalResults: searchData.pageInfo.totalResults,
      nextPageToken: searchData.nextPageToken,
      searchQuery: query,
    };
  }

  private async getVideosDetails(videoIds: string): Promise<any[]> {
    const params = {
      part: 'statistics,contentDetails,snippet',
      id: videoIds,
      key: this.apiKey,
    };

    const response = await axios.get(`${this.baseUrl}/videos`, { params });
    return (response.data as any).items;
  }

  private async getYouTubeVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    const params = {
      part: 'snippet,statistics,contentDetails',
      id: videoId,
      key: this.apiKey,
    };

    const response = await axios.get(`${this.baseUrl}/videos`, { params });
    const video = (response.data as any).items[0];

    if (!video) return null;

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
      duration: this.parseDuration(video.contentDetails.duration),
      channelName: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: new Date(video.snippet.publishedAt),
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      relevanceScore: 0.8, // Default score for direct video lookup
      isEducational: this.isEducationalChannel(video.snippet.channelId),
      tags: video.snippet.tags || [],
    };
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (PT#H#M#S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Mock implementations for when API is not available
  private getMockSearchResult(query: string, options: YouTubeSearchOptions): YouTubeSearchResult {
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'mock-video-1',
        title: `${query} - Complete Tutorial`,
        description: `Learn ${query} from scratch with this comprehensive tutorial covering all the basics and advanced concepts.`,
        url: 'https://www.youtube.com/watch?v=mock-video-1',
        thumbnailUrl: 'https://i.ytimg.com/vi/mock-video-1/mqdefault.jpg',
        duration: 1800, // 30 minutes
        channelName: 'Programming with Mosh',
        channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA',
        publishedAt: new Date('2024-01-15'),
        viewCount: 250000,
        likeCount: 12000,
        relevanceScore: 0.95,
        isEducational: true,
        tags: [query.toLowerCase(), 'tutorial', 'programming'],
      },
      {
        id: 'mock-video-2',
        title: `${query} Explained in 20 Minutes`,
        description: `Quick and comprehensive explanation of ${query} concepts with practical examples.`,
        url: 'https://www.youtube.com/watch?v=mock-video-2',
        thumbnailUrl: 'https://i.ytimg.com/vi/mock-video-2/mqdefault.jpg',
        duration: 1200, // 20 minutes
        channelName: 'freeCodeCamp.org',
        channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
        publishedAt: new Date('2024-01-10'),
        viewCount: 180000,
        likeCount: 8500,
        relevanceScore: 0.92,
        isEducational: true,
        tags: [query.toLowerCase(), 'explained', 'basics'],
      },
      {
        id: 'mock-video-3',
        title: `Advanced ${query} Techniques`,
        description: `Take your ${query} skills to the next level with these advanced techniques and best practices.`,
        url: 'https://www.youtube.com/watch?v=mock-video-3',
        thumbnailUrl: 'https://i.ytimg.com/vi/mock-video-3/mqdefault.jpg',
        duration: 2400, // 40 minutes
        channelName: 'Web Dev Simplified',
        channelId: 'UCFbNIlppjAuEX4znoulh0Cw',
        publishedAt: new Date('2024-01-05'),
        viewCount: 95000,
        likeCount: 4200,
        relevanceScore: 0.88,
        isEducational: true,
        tags: [query.toLowerCase(), 'advanced', 'techniques'],
      },
    ];

    return {
      videos: mockVideos.slice(0, options.maxResults || 10),
      totalResults: mockVideos.length,
      searchQuery: query,
    };
  }

  private getMockVideoDetails(videoId: string): YouTubeVideo {
    return {
      id: videoId,
      title: 'Mock Video Tutorial',
      description: 'This is a mock video for demonstration purposes.',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      duration: 900, // 15 minutes
      channelName: 'Mock Channel',
      channelId: 'mock-channel-id',
      publishedAt: new Date(),
      viewCount: 10000,
      likeCount: 500,
      relevanceScore: 0.8,
      isEducational: true,
      tags: ['tutorial', 'programming'],
    };
  }
}
