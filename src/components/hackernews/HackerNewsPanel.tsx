import { useState, useEffect, useCallback, memo } from 'react';
import { usePolling } from '../../hooks/usePolling';
import { useTheme } from '../../contexts/ThemeContext';
import { HackerNewsService, HNStorySummary } from '../../services/HackerNewsService';
import { Newspaper, RefreshCw, ExternalLink, MessageSquare, TrendingUp } from 'lucide-react';

type StoryType = 'top' | 'new' | 'best';

export const HackerNewsPanel = memo(function HackerNewsPanel() {
  const { setHealthStatus } = useTheme();
  const [storyType, setStoryType] = useState<StoryType>('top');
  const [stories, setStories] = useState<HNStorySummary[]>([]);

  // Fetch stories based on selected type
  const fetchStories = useCallback(async () => {
    try {
      let rawStories;
      switch (storyType) {
        case 'new':
          rawStories = await HackerNewsService.fetchNewStories(15);
          break;
        case 'best':
          rawStories = await HackerNewsService.fetchBestStories(15);
          break;
        case 'top':
        default:
          rawStories = await HackerNewsService.fetchTopStories(15);
          break;
      }
      return HackerNewsService.processStories(rawStories);
    } catch (error) {
      console.error('Failed to fetch HN stories:', error);
      return [];
    }
  }, [storyType]);

  // Poll for new stories every 5 minutes
  const { data, loading, refetch } = usePolling<HNStorySummary[]>(
    fetchStories,
    300000, // 5 minutes
    { enabled: true, immediate: true }
  );

  // Update stories when data changes
  useEffect(() => {
    if (data) {
      setStories(data);
    }
  }, [data]);

  // Set health to 100 (peaceful mode) when using Hacker News
  // The horror theme doesn't make sense for reading news
  useEffect(() => {
    setHealthStatus(100);
  }, [setHealthStatus]);

  // Optional: If you want HN activity to affect the theme, uncomment below
  // useEffect(() => {
  //   if (stories.length > 0) {
  //     const healthScore = HackerNewsService.calculateHealthScore(stories);
  //     setHealthStatus(healthScore);
  //   }
  // }, [stories, setHealthStatus]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleStoryTypeChange = useCallback((type: StoryType) => {
    setStoryType(type);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-8 flex flex-col h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Newspaper size={24} className="text-white" />
          <h2 className="text-2xl font-bold text-white tracking-wider">
            HACKER NEWS
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Story Type Selector */}
          <div className="flex gap-2">
            {(['top', 'new', 'best'] as StoryType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleStoryTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  storyType === type
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-white bg-opacity-5 text-white text-opacity-60 hover:bg-opacity-10'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition-all"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span className="text-base font-semibold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stories List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white scrollbar-thumb-opacity-20 scrollbar-track-transparent">
        {loading && stories.length === 0 ? (
          <div className="text-center py-12 text-white text-opacity-60">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
            <p>Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 text-white text-opacity-60">
            <p>No stories available</p>
          </div>
        ) : (
          stories.map((story, index) => (
            <div
              key={story.id}
              className="p-5 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border-2 border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-right">
                  <span className="text-white text-opacity-60 font-bold text-lg">
                    {index + 1}
                  </span>
                </div>

                {/* Story Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-opacity-80 transition-colors group flex items-start gap-2"
                  >
                    <h3 
                      className="text-xl font-bold leading-snug break-words" 
                      style={{ 
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {story.title}
                    </h3>
                    <ExternalLink
                      size={16}
                      className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-60 transition-opacity"
                    />
                  </a>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-white text-opacity-60">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      <span className="font-semibold">{story.score}</span>
                      <span>points</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span className="font-semibold">{story.commentCount}</span>
                      <span>comments</span>
                    </div>
                    <span>by {story.author}</span>
                    <span>{story.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-white text-opacity-40 text-sm flex-shrink-0">
        <p>
          Data from{' '}
          <a
            href="https://news.ycombinator.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-opacity-60 transition-colors underline"
          >
            Hacker News
          </a>
          {' '}• Updates every 5 minutes
        </p>
      </div>
    </div>
  );
});
