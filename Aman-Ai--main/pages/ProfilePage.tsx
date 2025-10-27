import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { usePushNotifications } from '../hooks/usePushNotifications';
import SEOMeta from '../components/SEOMeta';
import { getAllUserData, deleteAllUserData } from '../utils';
import Logo from '../components/Logo';

const ExportModal: React.FC<{ onConfirm: () => void; onClose: () => void; }> = ({ onConfirm, onClose }) => {
    const { t } = useLocalization();
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">
            <div className="bg-base-50 dark:bg-base-800 rounded-2xl shadow-soft-lg max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('profile.export.modal.title')}</h2>
                    <p className="text-base-600 dark:text-base-300 mb-6">{t('profile.export.modal.text')}</p>
                    <div className="flex justify-end space-x-4">
                        <button onClick={onClose} className="px-4 py-2 bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-500 transition-colors">
                            {t('profile.export.modal.cancel')}
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors">
                            {t('profile.export.modal.confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteModal: React.FC<{
    currentUser: string;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ currentUser, onConfirm, onClose }) => {
    const { t } = useLocalization();
    const [confirmEmail, setConfirmEmail] = useState('');
    const [error, setError] = useState('');

    const isMatch = confirmEmail.toLowerCase() === currentUser.toLowerCase();

    const handleDelete = () => {
        if (isMatch) {
            onConfirm();
        } else {
            setError(t('profile.delete.error'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">
            <div className="bg-base-50 dark:bg-base-800 rounded-2xl shadow-soft-lg max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <h2 className="text-2xl font-bold text-warning-500 mb-4">{t('profile.delete.modal.title')}</h2>
                    <p className="text-base-600 dark:text-base-300 mb-4">{t('profile.delete.modal.text')}</p>
                    <input
                        type="email"
                        value={confirmEmail}
                        onChange={(e) => { setConfirmEmail(e.target.value); setError(''); }}
                        className="w-full px-3 py-2 border border-base-300 dark:border-base-600 rounded-lg focus:ring-warning-500 focus:border-warning-500 bg-white dark:bg-base-700 text-base-800 dark:text-white"
                        placeholder={currentUser}
                    />
                    {error && <p className="text-warning-500 text-xs mt-1">{error}</p>}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button onClick={onClose} className="px-4 py-2 bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-500 transition-colors">
                            {t('profile.delete.modal.cancel')}
                        </button>
                        <button onClick={handleDelete} disabled={!isMatch} className="px-4 py-2 bg-warning-500 text-white font-bold rounded-lg hover:bg-warning-600 transition-colors disabled:bg-warning-300 dark:disabled:bg-warning-800 disabled:cursor-not-allowed">
                            {t('profile.delete.modal.confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PushNotificationManager: React.FC = () => {
    const { t } = useLocalization();
    const { permissionStatus, token, registerForNotifications } = usePushNotifications();
    
    const getStatusText = () => {
        switch(permissionStatus) {
            case 'granted': return t('profile.notifications.status_granted');
            case 'denied': return t('profile.notifications.status_denied');
            case 'prompt': return t('profile.notifications.status_prompt');
            default: return '';
        }
    };

    return (
         <div className="mt-8 pt-6 border-t border-base-200 dark:border-base-700">
            <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400 text-center">{t('profile.notifications.title')}</h2>
            <p className="text-center text-sm text-base-500 dark:text-base-400 mt-1 mb-4">{t('profile.notifications.description')}</p>
            <div className="p-4 bg-base-100 dark:bg-base-700/50 rounded-lg space-y-3 text-center">
                <p className="text-sm font-semibold">{getStatusText()}</p>
                {permissionStatus === 'prompt' && (
                     <button onClick={registerForNotifications} className="w-full text-center py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                        {t('profile.notifications.enable_button')}
                    </button>
                )}
                {permissionStatus === 'granted' && (
                     <button disabled className="w-full text-center py-2 px-4 bg-accent-500 text-white font-semibold rounded-lg cursor-default">
                        {t('profile.notifications.disable_button')}
                    </button>
                )}
                {token && (
                    <div className="text-xs text-base-500 dark:text-base-400 break-all">
                        <p className="font-bold">{t('profile.notifications.token_label')}</p>
                        <p className="font-mono">{token}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
  const { currentUser, login, logout, getScopedKey } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [age, setAge] = useState('');
  const [ageSaved, setAgeSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
        const savedAge = localStorage.getItem(getScopedKey('user-age'));
        if (savedAge) {
            setAge(savedAge);
        }
    }
  }, [currentUser, getScopedKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
      const userEmail = email.trim().toLowerCase();
      login(userEmail);
      if (age && !isNaN(parseInt(age, 10))) {
          // Manually construct the scoped key because `getScopedKey` relies on `currentUser` which is set asynchronously.
          const key = `amandigitalcare-user-${userEmail}-user-age`;
          localStorage.setItem(key, age);
      }
      navigate('/dashboard');
    } else {
      setError(t('profile.email_invalid_error'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleExportData = () => {
      const userData = getAllUserData();
      const jsonString = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentUser?.split('@')[0] || 'anonymous'}-amandigitalcare-journey.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportModal(false);
  };

  const handleDeleteAccount = () => {
      deleteAllUserData();
      logout();
      navigate('/');
  };

  const handleSaveAge = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && !isNaN(parseInt(age, 10))) {
        localStorage.setItem(getScopedKey('user-age'), age);
        setAgeSaved(true);
        setTimeout(() => setAgeSaved(false), 2000);
    }
  };

  return (
    <>
    {showExportModal && <ExportModal onConfirm={handleExportData} onClose={() => setShowExportModal(false)} />}
    {showDeleteModal && currentUser && <DeleteModal currentUser={currentUser} onConfirm={handleDeleteAccount} onClose={() => setShowDeleteModal(false)} />}
    <SEOMeta
        title={t('seo.profile.title')}
        description={t('seo.profile.description')}
        noIndex={true}
    />
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 text-center">{t('profile.title')}</h1>
            <p className="text-center text-base-600 dark:text-base-300 mt-2">{t('profile.subtitle')}</p>

            {currentUser ? (
              <div>
                <div className="mt-8">
                    <div className="text-center">
                        <p className="text-base-700 dark:text-base-300">{t('profile.logged_in_as')}</p>
                        <p className="font-semibold text-primary-500 text-lg break-words">{currentUser}</p>
                    </div>

                    <form onSubmit={handleSaveAge} className="mt-6">
                        <label htmlFor="age" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('profile.age_label')}</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="number"
                                id="age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-3 py-2 border border-base-300 dark:border-base-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-base-700 text-base-800 dark:text-white"
                                placeholder={t('profile.age_input_placeholder')}
                            />
                            <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors w-28 flex-shrink-0">
                                {ageSaved ? t('profile.saved_button') : t('profile.save_button')}
                            </button>
                        </div>
                    </form>

                    <button
                        onClick={handleLogout}
                        className="mt-6 w-full bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-2 px-4 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors"
                    >
                        {t('profile.logout')}
                    </button>

                    <div className="mt-8 pt-6 border-t border-base-200 dark:border-base-700">
                        <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400 text-center">{t('profile.data_management.title')}</h2>
                        <p className="text-center text-sm text-base-500 dark:text-base-400 mt-1 mb-4">{t('profile.data_management.description')}</p>
                        <div className="space-y-3">
                            <button onClick={() => setShowExportModal(true)} className="w-full text-center py-2 px-4 border border-primary-500 text-primary-600 dark:text-primary-300 dark:border-primary-400 font-semibold rounded-lg hover:bg-primary-500 hover:text-white dark:hover:bg-primary-400 dark:hover:text-base-900 transition-colors">
                                {t('profile.export.button')}
                            </button>
                             <button onClick={() => setShowDeleteModal(true)} className="w-full text-center py-2 px-4 border border-warning-500 text-warning-600 font-semibold rounded-lg hover:bg-warning-500 hover:text-white transition-colors">
                                {t('profile.delete.button')}
                            </button>
                        </div>
                    </div>
                </div>
                <PushNotificationManager />
              </div>
            ) : (
              <div>
                <div className="mt-6 p-4 bg-base-100 dark:bg-base-800/20 border-l-4 border-base-800 dark:border-base-300 rounded-r-lg">
                    <h2 className="font-bold text-base-900 dark:text-white">{t('profile.anonymous_title')}</h2>
                    <p className="text-sm text-base-700 dark:text-base-300">{t('profile.anonymous_text')}</p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                  <div className="rounded-lg shadow-sm -space-y-px">
                      <div>
                          <label htmlFor="email" className="sr-only">{t('profile.email_placeholder')}</label>
                          <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setError(''); }}
                              className="appearance-none rounded-none rounded-t-lg relative block w-full px-3 py-3 border border-base-300 dark:border-base-600 bg-base-50/50 dark:bg-base-700/50 placeholder-base-500 dark:placeholder-base-400 text-base-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                              placeholder={t('profile.email_placeholder')}
                          />
                      </div>
                      <div>
                          <label htmlFor="age-login" className="sr-only">{t('profile.age_placeholder')}</label>
                          <input
                              id="age-login"
                              name="age-login"
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              className="appearance-none rounded-none rounded-b-lg relative block w-full px-3 py-3 border border-base-300 dark:border-base-600 bg-base-50/50 dark:bg-base-700/50 placeholder-base-500 dark:placeholder-base-400 text-base-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                              placeholder={t('profile.age_placeholder')}
                          />
                      </div>
                  </div>

                  {error && <p className="text-warning-500 text-xs text-center pt-2">{error}</p>}

                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white dark:text-base-900 bg-base-900 dark:bg-base-200 hover:bg-base-700 dark:hover:bg-base-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-500"
                    >
                      {t('profile.login_button')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;