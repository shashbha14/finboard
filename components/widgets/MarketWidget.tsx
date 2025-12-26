import React, { useEffect, useState } from 'react';
import { Widget } from '@/lib/types';
import { ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';

interface MarketWidgetProps {
    widget: Widget;
}

export const MarketWidget = ({ widget }: MarketWidgetProps) => {
    const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
    const [data, setData] = useState<{ gainers: any[], losers: any[] }>({ gainers: [], losers: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            // Try Alpha Vantage Top Gainers/Losers
            // Endpoint: TOP_GAINERS_LOSERS
            const token = process.env.NEXT_PUBLIC_ALPHAVANTAGE_TOKEN;
            try {
                if (token) {
                    const res = await axios.get(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${token}`);
                    if (res.data && res.data.top_gainers) {
                        setData({
                            gainers: res.data.top_gainers.slice(0, 10),
                            losers: res.data.top_losers.slice(0, 10)
                        });
                        setLoading(false);
                        return;
                    }
                }
                throw new Error('No data');
            } catch (e) {
                // Fallback Mock Data
                setData({
                    gainers: [
                        { ticker: 'NVDA', price: '480.00', change_amount: '12.50', change_percentage: '2.5%' },
                        { ticker: 'TSLA', price: '250.00', change_amount: '8.00', change_percentage: '3.1%' },
                        { ticker: 'AMD', price: '140.00', change_amount: '4.20', change_percentage: '2.9%' },
                    ],
                    losers: [
                        { ticker: 'INTC', price: '35.00', change_amount: '-2.50', change_percentage: '-6.5%' },
                        { ticker: 'PYPL', price: '58.00', change_amount: '-1.20', change_percentage: '-2.1%' },
                    ]
                });
                setLoading(false);
            }
        };

        fetchMarketData();
    }, []);

    const list = activeTab === 'gainers' ? data.gainers : data.losers;

    if (loading) return <div className="p-4 text-xs text-center text-muted-foreground">Loading Market Data...</div>;

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="flex border-b border-border">
                <button
                    className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'gainers' ? 'border-green-500 text-green-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('gainers')}
                >
                    Top Gainers
                </button>
                <button
                    className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'losers' ? 'border-red-500 text-red-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('losers')}
                >
                    Top Losers
                </button>
            </div>

            <div className="flex-1 overflow-auto p-2">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-muted-foreground text-left">
                            <th className="pb-2 font-medium">Symbol</th>
                            <th className="pb-2 font-medium text-right">Price</th>
                            <th className="pb-2 font-medium text-right">% Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item: any, idx) => (
                            <tr key={idx} className="border-b border-border last:border-0 group hover:bg-muted/30">
                                <td className="py-2 font-bold text-card-foreground group-hover:text-primary transition-colors">{item.ticker}</td>
                                <td className="py-2 text-right text-card-foreground">${parseFloat(item.price).toFixed(2)}</td>
                                <td className={`py-2 text-right font-medium ${activeTab === 'gainers' ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.change_percentage.replace('%', '')}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
