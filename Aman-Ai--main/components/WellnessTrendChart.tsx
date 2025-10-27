import React, { useState } from 'react';
import { WellnessEntry } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface WellnessTrendChartProps {
    data: WellnessEntry[];
}

const activityToY = (level: WellnessEntry['activityLevel']): number => {
    if (level === 'high') return 0;
    if (level === 'moderate') return 1;
    if (level === 'low') return 2;
    return 2;
};

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ data }) => {
    const { t } = useLocalization();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
    
    if (!data || data.length < 2) {
        return <div className="text-center text-base-500 dark:text-base-400 py-10">{t('analytics.wellness.no_data')}</div>;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dataMap = new Map<string, WellnessEntry>(data.map(d => [new Date(d.date).toDateString(), d]));
    
    const chartData: { date: Date; entry: WellnessEntry | null }[] = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        chartData.push({
            date,
            entry: dataMap.get(date.toDateString()) || null,
        });
    }

    const width = 500;
    const height = 150;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / 30 * 0.7;

    const handleMouseOver = (event: React.MouseEvent, content: string) => {
        const svgRect = (event.currentTarget as SVGGElement).ownerSVGElement!.getBoundingClientRect();
        setTooltip({
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
            content
        });
    };
    
    const maxSleep = 12; // Cap sleep hours at 12 for better visualization

    return (
        <div className="flex justify-center relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg" role="img" aria-label="Wellness trend chart over the last 30 days.">
                <g transform={`translate(${padding}, ${padding})`}>
                    {/* Y Axis for Sleep */}
                    <text x={-padding + 5} y={0} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">{maxSleep}h</text>
                    <text x={-padding + 5} y={chartHeight} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">0h</text>
                     <text x={-padding + 10} y={chartHeight / 2} dy="0.32em" textAnchor="middle" transform={`rotate(-90, ${-padding+10}, ${chartHeight/2})`} className="text-xs fill-current text-base-500 dark:text-base-400">{t('analytics.wellness.sleep_label')}</text>

                    {/* Y Axis for Activity */}
                     <text x={chartWidth + 5} y={0} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">{t('dashboard.wellness.activity_high')}</text>
                     <text x={chartWidth + 5} y={chartHeight/2} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">{t('dashboard.wellness.activity_moderate')}</text>
                     <text x={chartWidth + 5} y={chartHeight} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">{t('dashboard.wellness.activity_low')}</text>
                     <text x={chartWidth + 20} y={chartHeight/2} dy="0.32em" textAnchor="middle" transform={`rotate(90, ${chartWidth+20}, ${chartHeight/2})`} className="text-xs fill-current text-base-500 dark:text-base-400">{t('analytics.wellness.activity_label')}</text>

                    {/* X Axis */}
                    {chartData.map((d, i) => {
                        if (i % 7 === 0) {
                           return ( <text key={i} x={(i / 29) * chartWidth} y={chartHeight + 15} textAnchor="middle" className="text-xs fill-current text-base-500 dark:text-base-400">
                                {d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </text> )
                        }
                        return null;
                    })}
                    
                    {/* Grid Lines */}
                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-current text-base-200 dark:text-base-700" strokeWidth="1" />

                    {/* Data Bars and Points */}
                    {chartData.map((d, i) => {
                        if (d.entry === null) return null;
                        
                        const x = (i / 29) * chartWidth - barWidth / 2;
                        const sleepY = chartHeight - (Math.min(d.entry.sleepHours, maxSleep) / maxSleep) * chartHeight;
                        const sleepHeight = chartHeight - sleepY;
                        
                        const activityY = (activityToY(d.entry.activityLevel) / 2) * chartHeight;
                        
                        const tooltipContent = `${d.date.toLocaleDateString()}: ${d.entry.sleepHours}h sleep, ${t(`dashboard.wellness.activity_${d.entry.activityLevel}`)} activity.`;

                        return (
                            <g key={i}>
                                <rect
                                    x={x}
                                    y={sleepY}
                                    width={barWidth}
                                    height={sleepHeight}
                                    className="fill-current text-primary-500/50"
                                    onMouseOver={(e) => handleMouseOver(e, tooltipContent)}
                                    onMouseOut={() => setTooltip(null)}
                                />
                                <circle 
                                    cx={x + barWidth/2}
                                    cy={activityY}
                                    r="3"
                                    className="fill-current text-secondary-500"
                                    onMouseOver={(e) => handleMouseOver(e, tooltipContent)}
                                    onMouseOut={() => setTooltip(null)}
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>
            {tooltip && (
                <div 
                    className="absolute z-10 w-max bg-base-800 dark:bg-base-200 text-white dark:text-base-900 text-xs rounded py-1 px-2 pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -120%)' }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default WellnessTrendChart;
