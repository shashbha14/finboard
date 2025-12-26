import React, { useEffect, useState, useRef } from 'react';
import { Widget } from '@/lib/types';
import { Card } from '@/components/ui/primitives';
import { ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';

interface WatchlistWidgetProps {
    widget: Widget;
}

interface StockData {
    symbol: string;
    price: number;
    change: number;
    percentChange: number;
}

export const WatchlistWidget = ({ widget }: WatchlistWidgetProps) => {
    const [data, setData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const symbols = widget.config.symbols || ['AAPL', 'GOOGL', 'MSFT'];

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
                const requests = symbols.map(async (symbol) => {
                    try {
                        if (token) {
                            const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`);
                            return {
                                symbol,
                                price: res.data.c,
                                change: res.data.d,
                                percentChange: res.data.dp
                            };
                        } else {
                            return {
                                symbol,
                                price: 100 + Math.random() * 50,
                                change: Math.random() * 5 - 2,
                                percentChange: Math.random() * 5 - 2.5
                            };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch ${symbol}`, err);
                        return null;
                    }
                });

                const results = await Promise.all(requests);
                const validResults = results.filter(Boolean) as StockData[];
                setData(validResults);
                setLoading(false);
                setError(null); // Clear any previous errors
            } catch (err) {
                setError('Failed to fetch initial data');
                setLoading(false);
            }
        };

        fetchData();
        // Fallback polling for change/percentChange which sockets don't send usually (sockets send last price `p`)
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [JSON.stringify(symbols)]);

    // WebSocket for Real-time Price
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
        if (!token) return;

        const ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
        socketRef.current = ws;

        ws.onopen = () => {
            symbols.forEach(symbol => {
                ws.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
            });
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'trade' && message.data) {
                // message.data is array of trades: [{ s: 'AAPL', p: 150.2, ... }]
                message.data.forEach((trade: any) => {
                    setData(currentData => {
                        return currentData.map(item => {
                            if (item.symbol === trade.s) {
                                // Calculate new change based on old close (approximate since we don't have prev close in socket)
                                // Better: just update price and keep change static or recalculate if we had open price.
                                // For visual effect, let's just update price.
                                return {
                                    ...item,
                                    price: trade.p
                                };
                            }
                            return item;
                        });
                    });
                });
            }
        };

        ws.onerror = (event) => {
            console.error("WebSocket error:", event);
            setError("WebSocket connection error.");
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed:", event);
            // Optionally try to reconnect or set an error
        };

        return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                symbols.forEach(symbol => {
                    socketRef.current?.send(JSON.stringify({ type: 'unsubscribe', symbol: symbol }));
                });
                socketRef.current.close();
            }
        };
    }, [JSON.stringify(symbols)]);

    if (loading && data.length === 0) return <div className="p-4 flex justify-center text-xs text-muted-foreground">Loading watchlist...</div>;
    if (error) return <div className="p-4 text-xs text-destructive">{error}</div>;

    return (
        <div className="flex flex-col h-full overflow-auto">
            <div className="flex flex-col">
                {data.map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <div className="font-bold text-sm text-foreground">{item.symbol}</div>
                        <div className="flex flex-col items-end">
                            <div className="font-mono text-sm font-medium text-foreground transition-all duration-300">
                                ${item.price.toFixed(2)}
                            </div>
                            <div className={`text-xs flex items-center ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {item.change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                {Math.abs(item.change).toFixed(2)} ({item.percentChange.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
