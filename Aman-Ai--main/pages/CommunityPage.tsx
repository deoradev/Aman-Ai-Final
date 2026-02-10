
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { CommunityPost } from '../types';
import { formatTimeAgo } from '../utils';
import SEOMeta from '../components/SEOMeta';
import PullToRefresh from '../components/PullToRefresh';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';

const POST_STORAGE_KEY = 'amandigitalcare-community-posts';

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
        <div className="flex items-center gap-3 mt-2 w-full bg-base-50 dark:bg-base-900/50 p-3 rounded-xl border border-base-100 dark:border-base-700/50">
            <audio ref={audioRef} src={post.content} preload="metadata"></audio>
            <button onClick={togglePlayPause} className="flex-shrink-0 p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-md focus:outline-none" aria-label={isPlaying ? t('community.voice_note.pause_aria') : t('community.voice_note.play_aria')}>
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
            <div ref={progressBarRef} onClick={onScrub} className="flex-grow bg-base-200 dark:bg-base-700 rounded-full h-1.5 cursor-pointer group">
                <div className="bg-primary-500 h-1.5 rounded-full relative" style={{ width: `${progress}%` }}>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>
            <div className="text-[10px] font-bold text-base-400 w-16 text-right tabular-nums">
                {formatTime(currentTime)}
            </div>
        </div>
    );
};

const CommunityPage: React.FC = () => {
    const { t } = useLocalization();
    const { getScopedKey } = useAuth();
    const { showToast } = useToast();
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

    useEffect(() => {
        try {
            const storedPosts = localStorage.getItem(POST_STORAGE_KEY);
            if (storedPosts) {
                setPosts(JSON.parse(storedPosts));
            }
            const storedReported = localStorage.getItem(getScopedKey('reported-posts'));
            if (storedReported) {
                setReportedPostIds(new Set(JSON.parse(storedReported)));
            }
        } catch (error) {
            console.error("Failed to load community data from localStorage", error);
            setPosts([]);
            setReportedPostIds(new Set());
        }
    }, [getScopedKey]);

    const savePosts = (updatedPosts: CommunityPost[]) => {
        setPosts(updatedPosts);
        try {
            localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(updatedPosts));
        } catch (error) {
            console.error("Failed to save community posts to localStorage", error);
        }
    };

    const handleConfirmReport = () => {
        if (reportingPostId === null) return;

        const newReportedIds = new Set(reportedPostIds);
        newReportedIds.add(reportingPostId);
        setReportedPostIds(newReportedIds);
        try {
            localStorage.setItem(getScopedKey('reported-posts'), JSON.stringify(Array.from(newReportedIds)));
            showToast(t('community.report_success'), 'success');
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
            <ConfirmModal
                isOpen={reportingPostId !== null}
                onClose={() => setReportingPostId(null)}
                onConfirm={handleConfirmReport}
                title={t('community.report_confirm_title')}
                text={t('community.report_confirm_text')}
                confirmText={t('community.report_confirm_button')}
                cancelText={t('community.report_cancel_button')}
                variant="warning"
            />
            <PullToRefresh onRefresh={handleRefresh}>
                <div className="py-8 bg-base-50 dark:bg-black min-h-screen">
                    <div className="container mx-auto px-4 max-w-xl">
                        
                        <div className="text-center mb-8">
                             <h1 className="text-3xl font-black text-primary-500 tracking-tight">{t('community.title')}</h1>
                             <p className="text-xs text-base-400 font-black uppercase tracking-[0.2em] mt-2">{t('community.subtitle')}</p>
                        </div>

                        {/* Input Card */}
                        <div className="bg-white dark:bg-base-900 rounded-[2.5rem] shadow-xl p-2 border border-base-100 dark:border-base-800">
                            {/* Text Area */}
                            <div className="p-4">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder={t('community.placeholder')}
                                    rows={3}
                                    className="w-full bg-transparent text-lg placeholder-base-300 dark:placeholder-base-700 text-base-900 dark:text-white resize-none focus:outline-none font-medium"
                                />
                            </div>

                            {/* Action Buttons Row */}
                            <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                            
                            {isRecording ? (
                                // Recording UI
                                <div className="m-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-between animate-pulse">
                                    <span className="text-red-500 font-bold flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Recording...
                                    </span>
                                    <button onClick={handleStopRecording} className="bg-white dark:bg-base-800 text-red-500 px-4 py-2 rounded-xl font-bold text-xs shadow-sm uppercase tracking-wider">Stop</button>
                                </div>
                            ) : (
                                <div className="flex gap-2 px-2 pb-2">
                                    <button onClick={() => addPost('hi')} className="flex-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors uppercase tracking-wider">
                                        <span className="text-base">👋</span> {t('community.hi_button')}
                                    </button>
                                    <button onClick={handleStartRecording} className="flex-1 bg-base-100 dark:bg-base-800 text-base-600 dark:text-base-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-base-200 dark:hover:bg-base-700 transition-colors uppercase tracking-wider">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                        </svg> 
                                        {t('community.record_voice_note')}
                                    </button>
                                    <button onClick={handleSharePhotoClick} className="flex-1 bg-base-100 dark:bg-base-800 text-base-600 dark:text-base-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-base-200 dark:hover:bg-base-700 transition-colors uppercase tracking-wider">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                        {t('community.share_photo_button')}
                                    </button>
                                </div>
                            )}

                            {/* Share Button */}
                            <div className="px-2 pb-2">
                                <button
                                    onClick={() => addPost('text', newPostContent)}
                                    disabled={isPosting || (!newPostContent.trim() && !isRecording)} 
                                    className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:hover:bg-slate-200 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-500 disabled:hover:shadow-none"
                                >
                                    {t('community.share_button')}
                                </button>
                            </div>
                            
                            {micError && <p className="text-warning-500 text-xs text-center pb-2">{micError}</p>}
                            {photoError && <p className="text-warning-500 text-xs text-center pb-2">{photoError}</p>}
                        </div>

                        {/* Filters */}
                        <div className="mt-10 flex flex-col items-center gap-6">
                            <div className="flex flex-wrap justify-center gap-3">
                                {filterOptions.map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setActiveFilter(opt.key)}
                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                            activeFilter === opt.key
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 transform scale-105'
                                                : 'bg-white dark:bg-base-900 border border-base-200 dark:border-base-800 text-base-400 hover:border-primary-300 dark:hover:border-primary-700'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs font-bold text-base-400 bg-base-200/50 dark:bg-base-800/50 px-4 py-1.5 rounded-full">
                                <select 
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="bg-transparent border-none focus:ring-0 text-base-500 dark:text-base-400 cursor-pointer uppercase tracking-wider text-[10px] font-black appearance-none pr-6 relative z-10"
                                >
                                    <option value="newest">{t('community.sort_newest')}</option>
                                    <option value="oldest">{t('community.sort_oldest')}</option>
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 -ml-6 z-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Posts List */}
                        <div className="mt-10 space-y-6">
                            {filteredAndSortedPosts.length > 0 ? (
                                filteredAndSortedPosts.map(post => (
                                    <div key={post.id} className="bg-white dark:bg-base-900 p-6 rounded-[2rem] shadow-soft border border-base-100 dark:border-base-800 animate-fade-in relative group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary-500/20">
                                                    A
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-base-900 dark:text-base-100 leading-none">{t('community.anonymous_user')}</p>
                                                    <p className="text-[10px] font-bold text-base-400 uppercase tracking-wider mt-1">{formatTimeAgo(post.timestamp, t)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setReportingPostId(post.id)} className="text-base-300 hover:text-warning-500 p-2 rounded-full hover:bg-base-50 dark:hover:bg-base-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label={t('community.report_post')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                        
                                        <div className="pl-13">
                                            {post.type === 'text' && <p className="text-base-800 dark:text-base-200 whitespace-pre-wrap leading-relaxed text-lg font-medium">{post.content}</p>}
                                            {post.type === 'hi' && (
                                                <div className="inline-flex items-center gap-3 px-5 py-3 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 rounded-2xl font-bold text-sm border border-primary-100 dark:border-primary-900/30">
                                                    <span className="text-2xl animate-bounce">👋</span> {t('community.said_hi')}
                                                </div>
                                            )}
                                            {post.type === 'voice' && <VoicePost post={post} />}
                                            {post.type === 'photo' && (
                                                <div className="mt-2 rounded-2xl overflow-hidden shadow-sm border border-base-200 dark:border-base-800">
                                                    <img src={post.content} alt={`${t('community.anonymous_user')} shared a photo.`} className="w-full h-auto max-h-96 object-cover" loading="lazy" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-40">
                                    <div className="inline-block p-6 rounded-full bg-base-100 dark:bg-base-900 mb-6">
                                        <svg className="w-10 h-10 text-base-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                    </div>
                                    <p className="text-base-500 dark:text-base-400 font-bold uppercase tracking-widest text-sm">{t('community.empty')}</p>
                                </div>
                            )}
                            <div ref={feedEndRef}></div>
                        </div>
                    </div>
                </div>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.4s ease-out forwards;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
            </PullToRefresh>
        </>
    );
};

export default CommunityPage;
