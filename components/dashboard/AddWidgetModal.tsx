import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/lib/store';
import { WidgetType, Widget, WidgetConfig } from '@/lib/types';
import { Button, Input } from '@/components/ui/primitives';
import { X } from 'lucide-react';

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose }) => {
    const { addWidget } = useDashboardStore();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<WidgetType>('card');
    const [symbol, setSymbol] = useState('AAPL');
    const [selectedPreset, setSelectedPreset] = useState<string>('Custom');

    const [config, setConfig] = useState<Omit<WidgetConfig, 'id' | 'type'> & { title: string }>({
        title: '',
        apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        refreshInterval: 60,
        dataMapping: {
            valuePath: 'bitcoin.usd',
            subtitlePath: 'usd'
        }
    });

    const API_PRESETS = [
        {
            name: 'Custom',
            url: '',
            mapping: { valuePath: '', subtitlePath: '' }
        },
        {
            name: 'CoinGecko (Bitcoin)',
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
            mapping: { valuePath: 'bitcoin.usd', subtitlePath: 'usd' }
        },
        {
            name: 'Finnhub (Stock)',
            isDynamic: true,
            // Use Next.js API proxy to avoid CORS issues
            getUrl: (sym: string) => `/api/finnhub?symbol=${sym.toUpperCase()}`,
            mapping: { valuePath: 'c', subtitlePath: 'dp' }
        },
        {
            name: 'Alpha Vantage (Stock)',
            isDynamic: true,
            // Use Next.js API proxy to avoid CORS issues
            getUrl: (sym: string) => `/api/alphavantage?symbol=${sym.toUpperCase()}&function=GLOBAL_QUOTE`,
            // Uses bracket notation for keys with spaces/dots
            mapping: {
                valuePath: 'Global Quote["05. price"]',
                subtitlePath: 'Global Quote["10. change percent"]'
            }
        },
        {
            name: 'Indian Stock API',
            isDynamic: true,
            // Use Next.js API proxy to avoid CORS issues
            getUrl: (name: string) => `/api/indianapi?name=${encodeURIComponent(name)}`,
            mapping: {
                valuePath: '',
                subtitlePath: ''
            }
        }
    ];

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setType('card');
            setSymbol('AAPL');
            setSelectedPreset('Custom');
            setConfig({
                title: '',
                apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
                refreshInterval: 60,
                dataMapping: {
                    valuePath: 'bitcoin.usd',
                    subtitlePath: 'usd'
                }
            });
        }
    }, [isOpen]);

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const presetName = e.target.value;
        setSelectedPreset(presetName);
        const preset = API_PRESETS.find(p => p.name === presetName);

        if (preset) {
            if (preset.name === 'Custom') {
                setConfig(prev => ({
                    ...prev,
                    title: '',
                    apiUrl: '',
                    dataMapping: { valuePath: '', subtitlePath: '' }
                }));
                return;
            }

            // If it's a dynamic preset, use the current symbol/name
            const newUrl = (preset as any).isDynamic
                ? (preset as any).getUrl(symbol)
                : preset.url;

            // Set different mappings based on widget type
            let dataMapping = { ...config.dataMapping, ...preset.mapping };

            // For Finnhub preset, customize mapping based on widget type
            if (preset.name === 'Finnhub (Stock)') {
                if (type === 'chart') {
                    dataMapping = {
                        valuePath: '', // Not used for charts
                        subtitlePath: '', // Not used for charts
                        xAxisPath: 't', // timestamp
                        yAxisPath: 'c', // current price
                    };
                } else if (type === 'table') {
                    dataMapping = {
                        valuePath: '', // Not used for tables
                        subtitlePath: '', // Not used for tables
                        columns: [
                            { header: 'Current', path: 'c' },
                            { header: 'Change', path: 'd' },
                            { header: 'Change %', path: 'dp' },
                            { header: 'High', path: 'h' },
                            { header: 'Low', path: 'l' },
                            { header: 'Open', path: 'o' },
                            { header: 'Previous Close', path: 'pc' },
                        ]
                    };
                } else {
                    // Card widget - use default mapping
                    dataMapping = { valuePath: 'c', subtitlePath: 'dp' };
                }
            } else if (preset.name === 'Alpha Vantage (Stock)') {
                // For Alpha Vantage preset, customize mapping based on widget type
                if (type === 'chart') {
                    dataMapping = {
                        valuePath: '', // Not used for charts
                        subtitlePath: '', // Not used for charts
                        xAxisPath: 'Global Quote["07. latest trading day"]', // date
                        yAxisPath: 'Global Quote["05. price"]', // current price
                    };
                } else if (type === 'table') {
                    dataMapping = {
                        valuePath: '', // Not used for tables
                        subtitlePath: '', // Not used for tables
                        listPath: 'Global Quote',
                        columns: [
                            { header: 'Symbol', path: '["01. symbol"]' },
                            { header: 'Price', path: '["05. price"]' },
                            { header: 'Change', path: '["09. change"]' },
                            { header: 'Change %', path: '["10. change percent"]' },
                            { header: 'High', path: '["03. high"]' },
                            { header: 'Low', path: '["04. low"]' },
                            { header: 'Open', path: '["02. open"]' },
                            { header: 'Previous Close', path: '["08. previous close"]' },
                            { header: 'Volume', path: '["06. volume"]' },
                            { header: 'Date', path: '["07. latest trading day"]' },
                        ]
                    };
                } else {
                    // Card widget - use default mapping
                    dataMapping = {
                        valuePath: 'Global Quote["05. price"]',
                        subtitlePath: 'Global Quote["10. change percent"]'
                    };
                }
            }

            // For Indian API, use appropriate title
            let widgetTitle = (preset as any).isDynamic
                ? (preset.name === 'Indian Stock API' ? `${symbol} Stock Info` : `${symbol} Price`)
                : preset.name.replace(/\s\(.*\)/, '');

            setConfig({
                ...config,
                title: widgetTitle,
                apiUrl: newUrl,
                dataMapping
            });
        }
    };

    // Update URL when symbol/name changes for dynamic presets
    const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const newSymbol = selectedPreset === 'Indian Stock API'
            ? inputValue
            : inputValue.toUpperCase();
        setSymbol(newSymbol);

        const preset = API_PRESETS.find(p => p.name === selectedPreset);
        if (preset && (preset as any).isDynamic) {
            const title = preset.name === 'Indian Stock API'
                ? `${newSymbol} Stock Info`
                : `${newSymbol} Price`;
            setConfig(prev => ({
                ...prev,
                title,
                apiUrl: (preset as any).getUrl(newSymbol)
            }));
        }
    };

    // Update mapping when widget type changes and dynamic presets are selected
    useEffect(() => {
        if ((selectedPreset === 'Finnhub (Stock)' || selectedPreset === 'Alpha Vantage (Stock)' || selectedPreset === 'Indian Stock API') && config.apiUrl) {
            let dataMapping = { ...config.dataMapping };

            if (selectedPreset === 'Finnhub (Stock)') {
                if (type === 'chart') {
                    dataMapping = {
                        valuePath: '', // Not used for charts
                        subtitlePath: '', // Not used for charts
                        xAxisPath: 't',
                        yAxisPath: 'c',
                    };
                } else if (type === 'table') {
                    dataMapping = {
                        valuePath: '', // Not used for tables
                        subtitlePath: '', // Not used for tables
                        columns: [
                            { header: 'Current', path: 'c' },
                            { header: 'Change', path: 'd' },
                            { header: 'Change %', path: 'dp' },
                            { header: 'High', path: 'h' },
                            { header: 'Low', path: 'l' },
                            { header: 'Open', path: 'o' },
                            { header: 'Previous Close', path: 'pc' },
                        ]
                    };
                } else {
                    dataMapping = { valuePath: 'c', subtitlePath: 'dp' };
                }
            } else if (selectedPreset === 'Alpha Vantage (Stock)') {
                if (type === 'chart') {
                    dataMapping = {
                        valuePath: '', // Not used for charts
                        subtitlePath: '', // Not used for charts
                        xAxisPath: 'Global Quote["07. latest trading day"]',
                        yAxisPath: 'Global Quote["05. price"]',
                    };
                } else if (type === 'table') {
                    dataMapping = {
                        valuePath: '', // Not used for tables
                        subtitlePath: '', // Not used for tables
                        listPath: 'Global Quote',
                        columns: [
                            { header: 'Symbol', path: '["01. symbol"]' },
                            { header: 'Price', path: '["05. price"]' },
                            { header: 'Change', path: '["09. change"]' },
                            { header: 'Change %', path: '["10. change percent"]' },
                            { header: 'High', path: '["03. high"]' },
                            { header: 'Low', path: '["04. low"]' },
                            { header: 'Open', path: '["02. open"]' },
                            { header: 'Previous Close', path: '["08. previous close"]' },
                            { header: 'Volume', path: '["06. volume"]' },
                            { header: 'Date', path: '["07. latest trading day"]' },
                        ]
                    };
                } else {
                    dataMapping = {
                        valuePath: 'Global Quote["05. price"]',
                        subtitlePath: 'Global Quote["10. change percent"]'
                    };
                }
            } else if (selectedPreset === 'Indian Stock API') {
                // For Indian Stock API, accordion widget displays entire JSON structure
                // No special mapping needed - accordion handles nested data automatically
                dataMapping = {
                    valuePath: '',
                    subtitlePath: ''
                };
            }

            setConfig(prev => ({ ...prev, dataMapping }));
        }
    }, [type, selectedPreset]);

    if (!isOpen) return null;

    const handleAdd = () => {
        const newWidget: Widget = {
            id: crypto.randomUUID(),
            type,
            config: {
                ...config,
                dataMapping: config.dataMapping
            }
        };
        addWidget(newWidget);
        onClose();
        // State is reset by useEffect when isOpen changes
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[500px] bg-popover border border-border rounded-lg shadow-xl overflow-hidden text-popover-foreground">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Add New Widget</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            {['card', 'table', 'chart', 'accordion'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t as WidgetType)}
                                    className={`p-4 rounded border transition-colors ${type === t
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/50 text-muted-foreground'
                                        }`}
                                >
                                    <div className="capitalize font-medium">{t}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase text-muted-foreground font-semibold">API Preset</label>
                                <select
                                    className="w-full mt-1 h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={selectedPreset}
                                    onChange={handlePresetChange}
                                >
                                    {API_PRESETS.map(p => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Show symbol input for any dynamic preset (Finnhub, Alpha Vantage, Indian API) */}
                            {(selectedPreset === 'Finnhub (Stock)' || selectedPreset === 'Alpha Vantage (Stock)' || selectedPreset === 'Indian Stock API') && (
                                <div>
                                    <label className="text-xs uppercase text-blue-500 font-semibold">
                                        {selectedPreset === 'Indian Stock API' ? 'Stock Name' : 'Stock Symbol'}
                                    </label>
                                    <Input
                                        value={symbol || ''}
                                        onChange={handleSymbolChange}
                                        placeholder={selectedPreset === 'Indian Stock API' ? 'e.g. TCS' : 'e.g. MSFT'}
                                        className="mt-1 border-blue-500/50"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs uppercase text-muted-foreground font-semibold">Title</label>
                                <Input
                                    value={config.title || ''}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                    placeholder="e.g. Bitcoin Price"
                                    className="mt-1 bg-background"
                                />
                            </div>
                            {selectedPreset === 'Custom' ? (
                                <div>
                                    <label className="text-xs uppercase text-muted-foreground font-semibold">API URL</label>
                                    <Input
                                        value={config.apiUrl || ''}
                                        onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                                        placeholder="https://api.example.com/data"
                                        className="mt-1 font-mono text-xs text-muted-foreground bg-background"
                                    />
                                </div>
                            ) : (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-600 dark:text-blue-300">
                                    Using secure endpoint with environment token.
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-muted-foreground font-semibold">Value Path (JSON)</label>
                                    <Input
                                        value={config.dataMapping?.valuePath || ''}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            dataMapping: { ...config.dataMapping, valuePath: e.target.value }
                                        })}
                                        placeholder="e.g. data.price"
                                        className="mt-1 bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-muted-foreground font-semibold">Refresh (sec)</label>
                                    <Input
                                        type="number"
                                        value={config.refreshInterval ?? 60}
                                        onChange={(e) => setConfig({ ...config, refreshInterval: Number(e.target.value) || 60 })}
                                        className="mt-1 bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/10">
                    {step === 2 ? (
                        <>
                            <Button onClick={() => setStep(1)} variant="ghost" className="hover:bg-muted">Back</Button>
                            <Button onClick={handleAdd}>Add Widget</Button>
                        </>
                    ) : (
                        <Button onClick={() => setStep(2)}>Next</Button>
                    )}
                </div>
            </div>
        </div>
    );
};
