export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  channelName: string;
  channelId: string;
  publishedAt: Date;
  viewCount: number;
  likeCount?: number;
  relevanceScore: number; // 0-1, AI calculated
  isEducational: boolean;
  tags: string[];
}

export interface YouTubeSearchOptions {
  maxResults?: number;
  duration?: 'short' | 'medium' | 'long'; // <4min, 4-20min, >20min
  publishedAfter?: Date;
  relevanceLanguage?: string;
  safeSearch?: 'strict' | 'moderate' | 'none';
  order?: 'relevance' | 'date' | 'rating' | 'viewCount';
  educationalChannelsOnly?: boolean;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  totalResults: number;
  nextPageToken?: string;
  searchQuery: string;
}

export interface EducationalChannel {
  channelId: string;
  channelName: string;
  description: string;
  isVerified: boolean;
  subscriberCount: number;
  categories: string[];
  qualityScore: number; // 0-1
}
