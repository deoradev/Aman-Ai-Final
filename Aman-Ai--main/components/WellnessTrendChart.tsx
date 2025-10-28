import React from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';
import { WellnessEntry } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface WellnessTrendChartProps {
    data: WellnessEntry[];
}

const activityToValue = (level: WellnessEntry['activityLevel']): number => {
    if (level === 'high') return 2;
    if (level === 'moderate') return 1;
    if (level === 'low') return 0;
    return 0;
};

const CustomTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
        const sleepData = payload.find((p: any) => p.dataKey === 'sleepHours');
        const activityData = payload.find((p: any) => p.dataKey === 'activityValue');
        
        let activityName = '';
        if (activityData) {
            if (activityData.value === 2) activityName = t('dashboard.wellness.activity_high');
            if (activityData.value === 1) activityName = t('dashboard.wellness.activity_moderate');
            if (activityData.value === 0) activityName = t('dashboard.wellness.activity_low');
        }

        return (
            <div className="bg-base-800/80 dark:bg-base-200/90 text-white dark:text-base-900 p-2 rounded-md shadow-lg text-sm">
                <p className="font-bold">{label}</p>
                {sleepData && <p>{`${t('analytics.wellness.sleep_label')}: ${sleepData.value}h`}</p>}
                {activityName && <p>{`${t('analytics.wellness.activity_label')}: ${activityName}`}</p>}
            </div>
        );
    }
    return null;
};

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ data }) => {
    const { t } = useLocalization();
    
    if (!data || data.length === 0) {
        return <div className="text-center text-base-500 dark:text-base-400 py-10 h-48 flex items-center justify-center">{t('analytics.wellness.no_data')}</div>;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dataMap = new Map<string, WellnessEntry>(data.map(d => [new Date(d.date).toDateString(), d]));
    
    const chartData = Array.from({ length: 30 }).map((_, i) => {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const entry = dataMap.get(date.toDateString()) || null;
        return {
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            sleepHours: entry ? entry.sleepHours : null,
            activityValue: entry ? activityToValue(entry.activityLevel) : null,
        };
    });

    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        domain={[0, 12]} 
                        tick={{ fill: 'currentColor', fontSize: 12 }} 
                        stroke="currentColor" 
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[0, 2]} 
                        ticks={[0,1,2]} 
                        tickFormatter={(value) => {
                            if (value === 2) return t('dashboard.wellness.activity_high');
                            if (value === 1) return t('dashboard.wellness.activity_moderate');
                            if (value === 0) return t('dashboard.wellness.activity_low');
                            return '';
                        }}
                        tick={{ fill: 'currentColor', fontSize: 12 }} 
                        stroke="currentColor" 
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: 'currentColor', fillOpacity: 0.1 }} />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Bar yAxisId="left" dataKey="sleepHours" name={t('analytics.wellness.sleep_label')} barSize={10} fill="rgb(var(--color-primary-500))" fillOpacity={0.6} />
                    <Line yAxisId="right" type="monotone" dataKey="activityValue" name={t('analytics.wellness.activity_label')} stroke="rgb(var(--color-secondary-500))" strokeWidth={2} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WellnessTrendChart;