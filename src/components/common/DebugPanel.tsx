import React, { useState, useEffect, CSSProperties, ReactNode } from 'react';

type PositionType =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

type DebugValue = string | number | boolean | object | null | undefined;

interface DebugPanelProps {
    children?: ReactNode
    position?: PositionType;
    data?: Record<string, DebugValue>;
    title?: ReactNode;
    defaultOpen?: boolean;
    className?: string;
    style?: CSSProperties;
    width?: string | number;
    maxHeight?: string | number;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
    children,
    position = 'bottom-right',
    data = {},
    title = 'Debug Panel',
    defaultOpen = true,
    className = '',
    style = { border: '1px solid #eee', backgroundColor: '#ffffff50' },
    width = 300,
    maxHeight = 400
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [panelPosition, setPanelPosition] = useState<CSSProperties>({
        top: 'auto',
        bottom: 'auto',
        left: 'auto',
        right: 'auto',
        transform: 'none'
    });

    useEffect(() => {
        const positions: Record<PositionType, CSSProperties> = {
            'top-left': { top: '10px', left: '10px' },
            'top-center': { top: '10px', left: '50%', transform: 'translateX(-50%)' },
            'top-right': { top: '10px', right: '10px' },
            'center-left': { top: '50%', left: '10px', transform: 'translateY(-50%)' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            'center-right': { top: '50%', right: '10px', transform: 'translateY(-50%)' },
            'bottom-left': { bottom: '10px', left: '10px' },
            'bottom-center': { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
            'bottom-right': { bottom: '10px', right: '10px' }
        };

        setPanelPosition(positions[position] || positions['bottom-right']);
    }, [position]);

    const toggleExpand = (key: string) => {
        setExpandedKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const renderValue = (value: DebugValue, key: string): ReactNode => {
        if (value === null) return <span className="text-purple-600">null</span>;
        if (value === undefined) return <span className="text-gray-500">undefined</span>;

        switch (typeof value) {
            case 'boolean':
                return (
                    <span className={`${value ? 'text-green-600' : 'text-red-600'} uppercase`}>
                        {value.toString()}
                    </span>
                );
            case 'number':
                return <span className="text-blue-600">{value}</span>;
            case 'string':
                return <span className="text-gray-800">"{value}"</span>;
            case 'object':
                const isExpanded = expandedKeys.has(key);
                const isEmpty = Object.keys(value).length === 0;

                return (
                    <div className="ml-2">
                        <span
                            className="cursor-pointer text-gray-700 hover:text-gray-900 pointer-events-auto"
                            onClick={() => toggleExpand(key)}
                        >
                            {isExpanded ? '▼' : '▶'}
                        </span>
                        {isExpanded && !isEmpty && (
                            <div className="border-l border-gray-300 pl-2">
                                {Object.entries(value).map(([subKey, subValue]) => (
                                    <div key={subKey}>
                                        <span className="font-medium">{subKey}: </span>
                                        {renderValue(subValue, `${key}.${subKey}`)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return <span>{String(value)}</span>;
        }
    };

    return (
        <div
            className={`select-none pointer-events-none fixed font-light text-xs text-stone-600 z-1000 ${className}`}
            style={{
                ...panelPosition,
                padding: '8px 12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: typeof width === 'number' ? `${width}px` : width,
                maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
                overflowY: 'auto',
                transition: 'all 0.2s ease',
                ...style
            }}
        >
            <div
                className="text-sm font-medium cursor-pointer mb-1 flex justify-between items-center sticky top-0"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title} &gt;</span>
                <span className="text-xs pointer-events-auto">{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (<>
                <div className="space-y-1">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="break-words">
                            <span className="font-medium">{key}: </span>
                            {renderValue(value, key)}
                        </div>
                    ))}
                </div>
                <div className='pointer-events-auto'>
                {children}
                </div>
            </>)}
        </div>
    );
};

export default DebugPanel;