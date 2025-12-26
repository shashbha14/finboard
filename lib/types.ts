export type WidgetType = 'card' | 'table' | 'chart' | 'accordion' | 'watchlist' | 'market';

export interface WidgetConfig {
  apiUrl: string;
  refreshInterval: number; // in seconds
  title: string;
  // For Watchlist
  symbols?: string[];
  // Dynamic mapping for API response
  dataMapping?: {
    // For CARD:
    valuePath?: string;
    subtitlePath?: string;

    // For TABLE (array path):
    listPath?: string;
    columns?: Array<{ header: string; path: string }>;

    // For CHART:
    xAxisPath?: string;
    yAxisPath?: string;
  };
}

export interface Widget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
}

export type Theme = 'light' | 'dark';
