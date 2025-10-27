import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { CommunityPost } from '../types';
import { formatTimeAgo } from '../utils';
import SEOMeta from '../components/SEOMeta';
import PullToRefresh from '../components/PullToRefresh';
import Logo from '../components/Logo';

const POST_STORAGE_KEY = 'amandigitalcare-community-posts';
const REPORTED_POST_STORAGE_KEY = 'amandigitalcare-reported-posts';

const VoicePost: React.FC<{ post: CommunityPost }> = ({ post }) => {
    const { t } = useLocalization();
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => {
                console.error("Error playing audio:", err);
            });
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        
        const handleError = (e: Event) => {
            console.error("Audio playback error:", e);
            setIsPlaying(false);
        };

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);
    
    const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !audioRef.current || !Number.isFinite(duration)) return;
        const progressBar = progressBarRef.current;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = progressBar.offsetWidth;
        const newTime = (x / width) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const formatTime = (timeInSeconds: number) => {
        if (!Number.isFinite(timeInSeconds)) {
            return '0:00';
        }
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 mt-2 w-full">
            <audio ref={audioRef} src={post.content} preload="metadata"></audio>
            <button onClick={togglePlayPause} className="flex-shrink-0 p-2 rounded-full bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-200 hover:bg-base-300 dark:hover:bg-base-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label={isPlaying ? t('community.voice_note.pause_aria') : t('community.voice_note.play_aria')}>
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
            <div ref={progressBarRef} onClick={onScrub} className="flex-grow bg-base-200 dark:bg-base-600 rounded-full h-2 cursor-pointer group">
                <div className="bg-primary-500 h-2 rounded-full relative" style={{ width: `${progress}%` }}>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>
            <div className="text-xs text-base-500 dark:text-base-400 w-24 text-right tabular-nums">
                <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
};

const ReportConfirmModal: React.FC<{ onConfirm: () => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    const { t } = useLocalization();
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16" role="alertdialog" aria-modal="true" aria-labelledby="report-dialog-title">
            <div className="bg-white dark:bg-base-800 rounded-2xl shadow-soft-lg w-full max-w-sm">
                <div className="p-6">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <h2 id="report-dialog-title" className="text-xl font-bold text-primary-500 mb-4">{t('community.report_confirm_title')}</h2>
                    <p className="text-base-600 dark:text-base-300 mb-6">{t('community.report_confirm_text')}</p>
                    <div className="flex justify-end gap-4">
                        <button onClick={onCancel} className="px-4 py-2 bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-500 transition-colors">
                            {t('community.report_cancel_button')}
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-warning-500 text-white font-semibold rounded-lg hover:bg-warning-600 transition-colors">
                            {t('community.report_confirm_button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Toast: React.FC<{ message: string, show: boolean }> = ({ message, show }) => (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-base-900 text-white px-4 py-2 rounded-lg shadow-soft-lg transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} role="status">
        {message}
    </div>
);


const CommunityPage: React.FC = () => {
    const { t } = useLocalization();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [reportedPostIds, setReportedPostIds] = useState<Set<number>>(new Set());
    const feedEndRef = useRef<HTMLDivElement>(null);
    
    // Voice note state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [micError, setMicError] = useState('');
    
    // Photo state
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [photoError, setPhotoError] = useState('');

    // Filtering and Sorting State
    type FilterType = 'all' | 'text' | 'hi' | 'voice' | 'photo';
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    
    // Reporting State
    const [reportingPostId, setReportingPostId] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);


    useEffect(() => {
        try {
            const storedPosts = localStorage.getItem(POST_STORAGE_KEY);
            if (storedPosts) {
                setPosts(JSON.parse(storedPosts));
            }
            const storedReported = localStorage.getItem(REPORTED_POST_STORAGE_KEY);
            if (storedReported) {
                setReportedPostIds(new Set(JSON.parse(storedReported)));
            }
        } catch (error) {
            console.error("Failed to load community data from localStorage", error);
            setPosts([]);
            setReportedPostIds(new Set());
        }
    }, []);

    const savePosts = (updatedPosts: CommunityPost[]) => {
        setPosts(updatedPosts);
        try {
            localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(updatedPosts));
        } catch (error) {
            console.error("Failed to save community posts to localStorage", error);
        }
    };
    
    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }

    const handleConfirmReport = () => {
        if (reportingPostId === null) return;

        const newReportedIds = new Set(reportedPostIds);
        newReportedIds.add(reportingPostId);
        setReportedPostIds(newReportedIds);
        try {
            localStorage.setItem(REPORTED_POST_STORAGE_KEY, JSON.stringify(Array.from(newReportedIds)));
            triggerToast();
        } catch (error) {
            console.error("Failed to save reported post", error);
        }
        setReportingPostId(null);
    };


    const filteredAndSortedPosts = useMemo(() => {
        let processedPosts = posts.filter(p => !reportedPostIds.has(p.id));

        if (activeFilter !== 'all') {
            processedPosts = processedPosts.filter(p => p.type === activeFilter);
        }

        processedPosts.sort((a, b) => {
            if (sortOrder === 'newest') {
                return b.timestamp - a.timestamp;
            } else {
                return a.timestamp - b.timestamp;
            }
        });

        return processedPosts;
    }, [posts, reportedPostIds, activeFilter, sortOrder]);


    const addPost = (type: CommunityPost['type'], content?: string) => {
        if (isPosting) return;
        if (type === 'text' && (!content || content.trim().length === 0)) return;

        setIsPosting(true);
        const newPost: CommunityPost = {
            id: Date.now(),
            type,
            content: content?.trim(),
            timestamp: Date.now(),
        };

        setTimeout(() => {
            savePosts([newPost, ...posts]);
            if (type === 'text') {
                setNewPostContent('');
            }
            setIsPosting(false);
            feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const handleStartRecording = async () => {
        if (isRecording) return;
        setMicError('');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        addPost('voice', base64String);
                    };
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone access denied:", err);
                setMicError(t('community.mic_error'));
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPhotoError('');

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setPhotoError('Image is too large. Please select an image under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            addPost('photo', base64String);
        };
        reader.onerror = () => {
            setPhotoError('Failed to read the image file.');
        };
        event.target.value = '';
    };

    const handleSharePhotoClick = () => {
        setPhotoError('');
        photoInputRef.current?.click();
    };

    const filterOptions: { key: FilterType, label: string }[] = [
        { key: 'all', label: t('community.filter_all') },
        { key: 'text', label: t('community.filter_text') },
        { key: 'voice', label: t('community.filter_voice') },
        { key: 'photo', label: t('community.filter_photos') },
        { key: 'hi', label: t('community.filter_hi') }
    ];

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <SEOMeta
                title={t('seo.community.title')}
                description={t('seo.community.description')}
                noIndex={true}
            />
            {reportingPostId !== null && <ReportConfirmModal onConfirm={handleConfirmReport} onCancel={() => setReportingPostId(null)} />}
            <Toast message={t('community.report_success')} show={showToast} />
            <PullToRefresh onRefresh={handleRefresh}>
                <div className="py-12 bg-base-100 dark:bg-base-900/50 flex-grow">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('community.title')}</h1>
                                <p className="mt-3 text-md text-base-600 dark:text-base-400">
                                    {t('community.subtitle')}
                                </p>
                            </div>

                            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-soft mb-8">
                                <input
                                    type="file"
                                    ref={photoInputRef}
                                    onChange={handlePhotoSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {isRecording ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full bg-warning-500 animate-pulse"></div>
                                            <span className="text-warning-500 font-semibold">{t('community.recording')}</span>
                                        </div>
                                        <button onClick={handleStopRecording} className="bg-warning-500 text-white font-bold py-2 px-4 rounded-full hover:bg-warning-600 transition-colors">
                                            {t('community.stop_recording')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder={t('community.placeholder')}
                                            rows={3}
                                            className="w-full p-3 border border-base-300 dark:border-base-600 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-base-50/50 dark:bg-base-700/50 text-base-800 dark:text-white"
                                        />
                                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button onClick={() => addPost('hi')} className="px-4 py-2 bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-200 rounded-full font-semibold hover:bg-base-300 dark:hover:bg-base-600 transition-colors">
                                                    {t('community.hi_button')}
                                                </button>
                                                <button onClick={handleStartRecording} className="px-4 py-2 bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-200 rounded-full font-semibold hover:bg-base-300 dark:hover:bg-base-600 transition-colors flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                                                    {t('community.record_voice_note')}
                                                </button>
                                                 <button onClick={handleSharePhotoClick} className="px-4 py-2 bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-200 rounded-full font-semibold hover:bg-base-300 dark:hover:bg-base-600 transition-colors flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                                                    {t('community.share_photo_button')}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => addPost('text', newPostContent)}
                                                disabled={isPosting || newPostContent.trim().length === 0}
                                                className="w-full sm:w-auto bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors disabled:bg-base-400 dark:disabled:bg-base-600"
                                            >
                                                {t('community.share_button')}
                                            </button>
                                        </div>
                                        {micError && <p className="text-warning-500 text-xs mt-2">{micError}</p>}
                                        {photoError && <p className="text-warning-500 text-xs mt-2">{photoError}</p>}
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {filterOptions.map(opt => (
                                        <button 
                                            key={opt.key}
                                            onClick={() => setActiveFilter(opt.key)}
                                            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${activeFilter === opt.key ? 'bg-primary-500 text-white' : 'bg-white dark:bg-base-700 text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-600'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <select 
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                    className="bg-white dark:bg-base-700 border border-base-300 dark:border-base-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value="newest">{t('community.sort_newest')}</option>
                                    <option value="oldest">{t('community.sort_oldest')}</option>
                                </select>
                            </div>

                            <div className="space-y-6">
                                {filteredAndSortedPosts.length > 0 ? (
                                    filteredAndSortedPosts.map(post => (
                                        <div key={post.id} className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-4 rounded-xl shadow-soft animate-fade-in">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-base-800 dark:text-base-200">{t('community.anonymous_user')}</p>
                                                    <p className="text-xs text-base-500 dark:text-base-400">{formatTimeAgo(post.timestamp, t)}</p>
                                                </div>
                                                <button onClick={() => setReportingPostId(post.id)} className="text-base-400 hover:text-warning-500 p-1 rounded-full" aria-label={t('community.report_post')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                            {post.type === 'text' && <p className="mt-2 text-base-700 dark:text-base-300 whitespace-pre-wrap">{post.content}</p>}
                                            {post.type === 'hi' && <p className="mt-2 text-2xl italic text-base-600 dark:text-base-400">{t('community.said_hi')}</p>}
                                            {post.type === 'voice' && <VoicePost post={post} />}
                                            {post.type === 'photo' && (
                                                <div className="mt-2">
                                                    <img src={post.content} alt={`${t('community.anonymous_user')} shared a photo.`} className="max-h-96 w-auto rounded-lg bg-base-200 dark:bg-base-700" loading="lazy" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-base-500 dark:text-base-400">{t('community.empty')}</p>
                                    </div>
                                )}
                                <div ref={feedEndRef}></div>
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
                        animation: fade-in 0.3s ease-out forwards;
                    }
                `}</style>
            </PullToRefresh>
        </>
    );
};

export default CommunityPage;