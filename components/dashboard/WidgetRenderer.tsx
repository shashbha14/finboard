import React from 'react';
import { Widget } from '@/lib/types';
import { WidgetContainer } from './WidgetContainer';
import { CardWidget } from '../widgets/CardWidget';
import { TableWidget } from '../widgets/TableWidget';
import { ChartWidget } from '../widgets/ChartWidget';
import { AccordionWidget } from '../widgets/AccordionWidget';

interface WidgetRendererProps {
    widget: Widget;
    onRemove: () => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, onRemove }) => {
    const renderContent = () => {
        switch (widget.type) {
            case 'card':
                return <CardWidget widget={widget} />;
            case 'table':
                return <TableWidget widget={widget} />;
            case 'chart':
                return <ChartWidget widget={widget} />;
            case 'accordion':
                return <AccordionWidget widget={widget} />;
            default:
                return <div className="p-4 text-red-400">Unknown Widget Type</div>;
        }
    };

    return (
        <WidgetContainer widget={widget} onRemove={onRemove}>
            {renderContent()}
        </WidgetContainer>
    );
};
