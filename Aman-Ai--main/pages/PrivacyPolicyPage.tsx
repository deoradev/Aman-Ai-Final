import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const PrivacyPolicyPage: React.FC = () => {
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
        title={t('seo.privacy_policy.title')}
        description={t('seo.privacy_policy.description')}
        noIndex={true}
      />
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">Privacy Policy</h1>
            <p className="mt-4 text-lg text-base-600 dark:text-base-300">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <PolicySection title="Introduction">
              <p>Welcome to Aman Digital Care ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our application. Our core principle is privacy-by-design: your personal and sensitive data is stored on your device, not on our servers.</p>
            </PolicySection>

            <PolicySection title="Information We Collect and How It's Stored">
              <p>All the personal data you generate within the app is stored in your browser's <strong>Local Storage</strong>. This means the data lives directly on your phone, tablet, or computer. We do not have access to it. This includes:</p>
              <ul>
                <li><strong>Account Information:</strong> If you choose to log in, your email address is stored on your device to identify your data. We do not store this on a central server.</li>
                <li><strong>Program and Progress Data:</strong> Your enrolled program, current day, completed challenges, and milestones are all stored locally.</li>
                <li><strong>Health and Wellness Data:</strong> Your mood logs, journal entries, goals, wellness logs, and relapse prevention plans are stored locally.</li>
                <li><strong>AI Conversation History:</strong> Your chat history with the AI companion is stored locally to provide conversational context.</li>
              </ul>
            </PolicySection>

            <PolicySection title="How We Use Your Information">
              <p>The information stored on your device is used solely to provide and improve your experience within the app:</p>
              <ul>
                <li>To save your progress and personalize your journey.</li>
                <li>To allow the AI companion to have contextually aware conversations.</li>
                <li>To enable offline access to your data and the app's features.</li>
                <li>To display your progress and analytics to you.</li>
              </ul>
            </PolicySection>
            
            <PolicySection title="Data Sharing and Third Parties">
                <p><strong>We do not sell, rent, or share your personal data with any third parties.</strong> Because your sensitive data is stored on your device, we do not have access to it and therefore cannot share it.</p>
                <p>We use Google Analytics to collect anonymous, aggregated usage data to help us understand app usage and improve our services. This data is not linked to your personal information. We also use Google's Gemini API to power our AI features. The text you send to the AI is processed by Google to generate a response, but it is not linked to your identity by us. Please refer to Google's Privacy Policy for more information on their data handling practices.</p>
            </PolicySection>

            <PolicySection title="Your Rights and Control Over Your Data">
              <p>You have complete control over your data. At any time, you can:</p>
              <ul>
                <li><strong>Export Your Data:</strong> Use the "Export My Data" feature in your profile to download a complete copy of all your information in a JSON format.</li>
                <li><strong>Delete Your Data:</strong> Use the "Delete My Account & Data" feature in your profile to permanently erase all data associated with your account from your device. In anonymous mode, you can clear your browser's site data to achieve the same result. This action is irreversible.</li>
              </ul>
            </PolicySection>
            
            <PolicySection title="Children's Privacy">
                <p>Aman Digital Care is not intended for use by individuals under the age of 16. We do not knowingly collect information from children under 16. If we become aware that we have inadvertently collected such information, we will take steps to delete it.</p>
            </PolicySection>
            
            <PolicySection title="Changes to This Privacy Policy">
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We encourage you to review this Privacy Policy periodically for any changes.</p>
            </PolicySection>
            
            <PolicySection title="Contact Us">
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:officialamanfoundation@gmail.com">officialamanfoundation@gmail.com</a>.</p>
            </PolicySection>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
