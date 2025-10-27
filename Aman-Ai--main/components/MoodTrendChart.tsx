import React, { useState } from 'react';
import { MoodEntry } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface MoodTrendChartProps {
    data: MoodEntry[];
}

const moodToY = (mood: MoodEntry['mood']): number => {
    if (mood === 'happy') return 0;
    if (mood === 'neutral') return 1;
    if (mood === 'sad') return 2;
    return 1;
};

const yToMood = (y: number): MoodEntry['mood'] => {
    if (y === 0) return 'happy';
    if (y === 1) return 'neutral';
    if (y === 2) return 'sad';
    return 'neutral';
};

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data }) => {
    const { t } = useLocalization();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
    
    if (!data || data.length === 0) {
        return <div className="text-center text-base-500 dark:text-base-400 py-10">{t('mood_chart.no_data')}</div>;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dataMap = new Map<string, MoodEntry['mood']>(data.map(d => [new Date(d.date).toDateString(), d.mood]));
    
    const chartData: { date: Date; mood: MoodEntry['mood'] | null }[] = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        chartData.push({
            date,
            mood: dataMap.get(date.toDateString()) || null,
        });
    }

    const width = 500;
    const height = 150;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = chartData
        .map((d, i) => {
            if (d.mood === null) return null;
            const x = (i / 29) * chartWidth;
            const y = (moodToY(d.mood) / 2) * chartHeight;
            return { x, y, date: d.date, mood: d.mood };
        })
        .filter(p => p !== null) as { x: number; y: number; date: Date; mood: MoodEntry['mood']}[]

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    const handleMouseOver = (point: { x: number; y: number; date: Date; mood: MoodEntry['mood']}) => {
        setTooltip({
            x: point.x + padding,
            y: point.y + padding,
            content: `${point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${t(`dashboard.mood.${point.mood}`)}`
        });
    };

    return (
        <div className="flex justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg" role="img" aria-label="Mood trend chart over the last 30 days.">
                <g transform={`translate(${padding}, ${padding})`}>
                    {/* Y Axis */}
                    <text x={-padding + 10} y={0} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">😊</text>
                    <text x={-padding + 10} y={chartHeight / 2} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">😐</text>
                    <text x={-padding + 10} y={chartHeight} dy="0.32em" textAnchor="start" className="text-xs fill-current text-base-500 dark:text-base-400">😔</text>
                    
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
                    <line x1="0" y1="0" x2={chartWidth} y2="0" className="stroke-current text-base-200 dark:text-base-700" strokeWidth="1" />
                    <line x1="0" y1={chartHeight/2} x2={chartWidth} y2={chartHeight/2} className="stroke-current text-base-200 dark:text-base-700" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-current text-base-200 dark:text-base-700" strokeWidth="1" />
                    
                    {/* Data Line */}
                    <path d={pathData} fill="none" className="stroke-current text-primary-500" strokeWidth="2" />
                    
                    {/* Data Points */}
                    {points.map((p, i) => (
                        <circle 
                            key={i} 
                            cx={p.x} 
                            cy={p.y} 
                            r="4" 
                            className="fill-current text-base-800 dark:text-base-300 cursor-pointer"
                            onMouseOver={() => handleMouseOver(p)}
                            onMouseOut={() => setTooltip(null)}
                        />
                    ))}
                </g>

                {/* Tooltip */}
                {tooltip && (
                    <g transform={`translate(${tooltip.x}, ${tooltip.y})`}>
                        <rect x="-40" y="-30" width="80" height="20" rx="4" className="fill-base-800/80 dark:fill-base-200/90" />
                        <text x="0" y="-20" textAnchor="middle" className="text-xs fill-white dark:fill-base-900 font-semibold">{tooltip.content}</text>
                    </g>
                )}
            </svg>
        </div>
    );
};

export default MoodTrendChart;