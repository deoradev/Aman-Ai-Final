import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { findSoberFriendlyPlaces } from '../services/geminiService';
import SEOMeta from '../components/SEOMeta';
import { GenerateContentResponse } from '@google/genai';

type Status = 'idle' | 'loading_location' | 'loading_places' | 'success' | 'error';
type GroundingChunk = { maps?: { uri: string; title: string } };

const SoberCirclePage: React.FC = () => {
    const { t } = useLocalization();
    const { isOnline } = useConnectivity();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [results, setResults] = useState<GenerateContentResponse | null>(null);

    useEffect(() => {
        setStatus('loading_location');
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setStatus('idle');
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError(t('sober_circle_page.location_denied'));
                setStatus('error');
            },
            { timeout: 10000 }
        );
    }, [t]);

    const handleSearch = async () => {
        if (!query.trim() || !location || !isOnline) return;
        setStatus('loading_places');
        setError(null);
        setResults(null);
        try {
            const response = await findSoberFriendlyPlaces(query, location);
            setResults(response);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setError(t('sober_circle_page.error'));
            setStatus('error');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }

    const getStatusText = () => {
        switch(status) {
            case 'loading_location': return t('sober_circle_page.getting_location');
            case 'loading_places': return t('sober_circle_page.finding_places');
            default: return '';
        }
    }

    const mapChunks = results?.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(
        (chunk: GroundingChunk) => chunk.maps
    ) || [];

    return (
        <>
            <SEOMeta
                title={t('seo.sober_circle.title')}
                description={t('seo.sober_circle.description')}
                noIndex={true}
            />
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('sober_circle_page.title')}</h1>
                        <p className="mt-3 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('sober_circle_page.subtitle')}</p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('sober_circle_page.placeholder')}
                                className="flex-grow w-full px-4 py-3 border border-base-300 dark:border-base-600 rounded-full bg-white/80 dark:bg-base-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                disabled={status !== 'idle' || !isOnline}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={status !== 'idle' || !query.trim() || !isOnline}
                                className="w-full sm:w-auto bg-primary-500 text-white font-bold py-3 px-8 rounded-full hover:bg-primary-600 transition-colors disabled:bg-base-400 dark:disabled:bg-base-600"
                            >
                                {t('sober_circle_page.find_button')}
                            </button>
                        </div>

                        <div className="mt-8">
                             {(status === 'loading_location' || status === 'loading_places') && (
                                <div className="text-center py-10">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    <p className="mt-4 text-base-600 dark:text-base-300">{getStatusText()}</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="text-center py-10 text-warning-600 dark:text-warning-300 bg-warning-50 dark:bg-warning-900/30 p-4 rounded-lg">
                                    <p>{error}</p>
                                </div>
                            )}
                            
                            {status === 'success' && (
                                <div className="animate-fade-in">
                                    {results?.text && (
                                        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft mb-6">
                                            <h2 className="text-xl font-bold text-primary-500 mb-2">{t('sober_circle_page.ai_summary_title')}</h2>
                                            <p className="text-base-700 dark:text-base-300 whitespace-pre-wrap">{results.text}</p>
                                        </div>
                                    )}

                                    {mapChunks.length > 0 ? (
                                        <div className="space-y-4">
                                            {mapChunks.map((chunk, index) => (
                                                <div key={index} className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-4 rounded-xl shadow-soft flex justify-between items-center">
                                                    <p className="font-semibold text-base-800 dark:text-base-200">{chunk.maps?.title}</p>
                                                    <a href={chunk.maps?.uri} target="_blank" rel="noopener noreferrer" className="bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-2 px-4 rounded-lg text-sm hover:bg-base-700 dark:hover:bg-base-300 transition-colors">
                                                        {t('sober_circle_page.view_on_map')}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-base-500 dark:text-base-400">
                                            <p>{t('sober_circle_page.no_results')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default SoberCirclePage;