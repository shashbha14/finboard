
import React from 'react';
import { Widget } from '@/lib/types';
import { WidgetContainer } from './WidgetContainer';
import { CardWidget } from '../widgets/CardWidget';
import { TableWidget } from '../widgets/TableWidget';
import { ChartWidget } from '../widgets/ChartWidget';
import { AccordionWidget } from '../widgets/AccordionWidget';
import { WatchlistWidget } from '../widgets/WatchlistWidget';
import { MarketWidget } from '../widgets/MarketWidget';

interface WidgetRendererProps {
    widget: Widget;
    onRemove: () => void;
    onEdit?: () => void;
}

const renderContent = (widget: Widget) => {
    switch (widget.type) {
        case 'card':
            return <CardWidget widget={widget} />;
        case 'table':
            return <TableWidget widget={widget} />;
        case 'chart':
            return <ChartWidget widget={widget} />;
        case 'accordion':
            return <AccordionWidget widget={widget} />;
        case 'watchlist':
            return <WatchlistWidget widget={widget} />;
        case 'market':
            return <MarketWidget widget={widget} />;
        default:
            return <div className="p-4 text-destructive">Unknown Widget Type</div>;
    }
};

// ...

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, onRemove, onEdit }) => {
    return (
        <WidgetContainer widget={widget} onRemove={onRemove} onEdit={onEdit}>
            {renderContent(widget)}
        </WidgetContainer>
    );
};
