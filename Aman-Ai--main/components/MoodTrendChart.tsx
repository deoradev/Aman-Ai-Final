import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { MoodEntry } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface MoodTrendChartProps {
    data: MoodEntry[];
}

const moodToValue = (mood: MoodEntry['mood']): number => {
    if (mood === 'happy') return 2;
    if (mood === 'neutral') return 1;
    if (mood === 'sad') return 0;
    return 1;
};

const CustomTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
        const moodValue = payload[0].value;
        let moodName = t('dashboard.mood.neutral');
        if (moodValue === 2) moodName = t('dashboard.mood.happy');
        if (moodValue === 0) moodName = t('dashboard.mood.sad');

        return (
            <div className="bg-base-800/80 dark:bg-base-200/90 text-white dark:text-base-900 p-2 rounded-md shadow-lg text-sm">
                <p className="font-bold">{`${label}: ${moodName}`}</p>
            </div>
        );
    }
    return null;
};

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data }) => {
    const { t } = useLocalization();
    
    if (!data || data.length === 0) {
        return <div className="text-center text-base-500 dark:text-base-400 py-10 h-48 flex items-center justify-center">{t('mood_chart.no_data')}</div>;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dataMap = new Map<string, MoodEntry['mood']>(data.map(d => [new Date(d.date).toDateString(), d.mood]));
    
    const chartData = Array.from({ length: 30 }).map((_, i) => {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const mood = dataMap.get(date.toDateString()) || null;
        return {
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            moodValue: mood ? moodToValue(mood) : null,
        };
    });

    const yAxisTickFormatter = (value: number) => {
        if (value === 2) return '😊';
        if (value === 1) return '😐';
        if (value === 0) return '😔';
        return '';
    };

    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'currentColor', fontSize: 12 }} 
                        stroke="currentColor"
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis 
                        domain={[0, 2]} 
                        ticks={[0, 1, 2]}
                        tickFormatter={yAxisTickFormatter}
                        tick={{ fill: 'currentColor', fontSize: 16 }}
                        stroke="currentColor"
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip t={t} />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                    <Line 
                        type="monotone" 
                        dataKey="moodValue"
                        stroke="rgb(var(--color-primary-500))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'rgb(var(--color-primary-500))' }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MoodTrendChart;