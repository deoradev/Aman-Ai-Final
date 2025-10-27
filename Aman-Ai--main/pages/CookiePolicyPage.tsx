import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const CookiePolicyPage: React.FC = () => {
  const { t } = useLocalization();

  const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3">{title}</h2>
      <div className="space-y-4 text-base-700 dark:text-base-300 leading-relaxed">{children}</div>
    </div>
  );

  return (
    <>
      <SEOMeta
        title={t('seo.cookie_policy.title')}
        description={t('seo.cookie_policy.description')}
        noIndex={true}
      />
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">Cookie Policy</h1>
            <p className="mt-4 text-lg text-base-600 dark:text-base-300">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <PolicySection title="What We Use">
              <p>Aman Digital Care does not use traditional HTTP cookies for tracking or advertising. Instead, we use your browser's <strong>Local Storage</strong>. This is a standard web technology that allows us to store information directly on your device to make your experience seamless and private.</p>
            </PolicySection>

            <PolicySection title="How We Use Local Storage">
              <p>We use Local Storage for essential functions of the app. Storing this data on your device means it is private to you and allows the app to work offline. Here’s what we store:</p>
              <ul>
                <li><strong>User Identification:</strong> If you log in, we store your email address to identify your account. If you use the app anonymously, a unique identifier is stored to keep your data separate.</li>
                <li><strong>Program Progress:</strong> Your enrolled program, current day, and completed challenges are saved so you can pick up where you left off.</li>
                <li><strong>User-Generated Content:</strong> All your journal entries, mood logs, goals, and other personal data are stored directly on your device. This data is not sent to our servers.</li>
                <li><strong>Preferences:</strong> Your chosen language and theme (light/dark mode) are saved for a consistent experience.</li>
                <li><strong>Session Data:</strong> We store chat history with the AI companion on your device to provide conversational context.</li>
              </ul>
            </PolicySection>

            <PolicySection title="Third-Party Services">
               <p>We use Google Analytics to collect anonymous usage data to help us understand how the app is being used and how we can improve it. This service may use its own cookies to gather information such as your IP address, browser type, and interactions within the app. This data is aggregated and does not personally identify you. For more information, you can review Google's Privacy Policy.</p>
            </PolicySection>

            <PolicySection title="Your Control">
              <p>You have full control over the data stored in your browser's Local Storage. You can clear this data at any time through your browser's settings (usually found under "Clear Browsing Data" or "Site Settings").</p>
              <p><strong>Please be aware:</strong> Clearing your Local Storage will permanently delete all your data within Aman Digital Care, including your program progress and journal entries, unless you have logged in to sync your account. If you are using the app anonymously, this action is irreversible.</p>
            </PolicySection>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;
