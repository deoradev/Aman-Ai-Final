import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const DisclaimerPage: React.FC = () => {
  const { t } = useLocalization();

  return (
    <>
      <SEOMeta
        title={t('seo.disclaimer.title')}
        description={t('seo.disclaimer.description')}
        noIndex={true}
      />
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-warning-600">Clinical Disclaimer</h1>
            <p className="mt-4 text-lg text-base-600 dark:text-base-300">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-8 text-lg text-base-800 dark:text-base-200 leading-relaxed">
            <div className="p-6 bg-warning-50 dark:bg-warning-900/30 border-l-4 border-warning-500 rounded-r-lg">
                <h2 className="text-2xl font-bold text-warning-700 dark:text-warning-200 mb-3">Not a Medical Device or Service</h2>
                <p>Aman Digital Care, including its AI companion "Aman," is a supportive tool for wellness and self-help. It is <strong>NOT</strong> a medical device, a healthcare provider, or a diagnostic tool. The services and information provided by this application are not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3">For Informational & Educational Purposes Only</h2>
                <p>The content, exercises, and conversations within Aman Digital Care are based on principles of Cognitive Behavioral Therapy (CBT), mindfulness, and other evidence-informed approaches. However, they are provided for informational, educational, and self-help purposes only.</p>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3">Always Seek Professional Advice</h2>
                <p><strong>Never disregard professional medical advice or delay in seeking it because of something you have read or experienced in this application.</strong> Always consult with a qualified and licensed physician, psychiatrist, therapist, or other healthcare provider with any questions you may have regarding a medical condition or mental health concern.</p>
            </div>
            
             <div className="p-6 bg-warning-50 dark:bg-warning-900/30 border-l-4 border-warning-500 rounded-r-lg">
                <h2 className="text-2xl font-bold text-warning-700 dark:text-warning-200 mb-3">In Case of Emergency</h2>
                <p>This application is <strong>NOT</strong> monitored for crisis situations. If you are experiencing a medical or mental health emergency, or if you are having suicidal thoughts, <strong>call 911 (or your local emergency number) immediately</strong> or go to the nearest emergency room. The "SOS" button within the app is a resource to help you find external crisis helplines, but it is not a substitute for calling emergency services.</p>
            </div>

            <div className="text-center pt-8">
                <p className="text-base-600 dark:text-base-400">By using Aman Digital Care, you acknowledge and agree to this disclaimer.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DisclaimerPage;
