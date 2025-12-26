import { Widget } from "./types";

export interface DashboardTemplate {
    id: string;
    name: string;
    description: string;
    widgets: Widget[];
    layout: any[]; // layout items
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
    {
        id: 'us-tech',
        name: 'US Tech Giants',
        description: 'Track Apple, Google, Microsoft and Top Gainers.',
        widgets: [
            {
                id: 'w-1',
                type: 'watchlist',
                title: 'Tech Watchlist',
                config: {
                    title: 'Tech Watchlist',
                    apiUrl: '', // dynamic
                    refreshInterval: 60,
                    symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']
                }
            },
            {
                id: 'w-2',
                type: 'market',
                title: 'Market Movers',
                config: {
                    title: 'Market Movers',
                    apiUrl: '',
                    refreshInterval: 300
                }
            },
            {
                id: 'w-3',
                type: 'chart',
                title: 'AAPL Price Action',
                config: {
                    title: 'AAPL Price Action',
                    apiUrl: 'https://finnhub.io/api/v1/quote?symbol=AAPL&token=NEXT_PUBLIC_FINNHUB_TOKEN', // will need token replacement logic or rely on interceptors if used
                    refreshInterval: 60,
                    dataMapping: {
                        xAxisPath: 't', // generic timestamp
                        yAxisPath: 'c'
                    }
                }
            }
        ],
        layout: [
            { i: 'w-1', x: 0, y: 0, w: 4, h: 8 },
            { i: 'w-2', x: 4, y: 0, w: 4, h: 8 },
            { i: 'w-3', x: 8, y: 0, w: 4, h: 8 }
        ]
    },
    {
        id: 'crypto-tracker',
        name: 'Crypto Tracker',
        description: 'Bitcoin and Ethereum tracking.',
        widgets: [
            {
                id: 'c-1',
                type: 'watchlist',
                title: 'Crypto Watch',
                config: {
                    title: 'Crypto Watch',
                    apiUrl: '',
                    refreshInterval: 30,
                    symbols: ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'] // Finnhub supports these
                }
            }
        ],
        layout: [
            { i: 'c-1', x: 0, y: 0, w: 6, h: 6 }
        ]
    }
];
