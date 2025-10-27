import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const TermsOfServicePage: React.FC = () => {
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
        title={t('seo.terms_of_service.title')}
        description={t('seo.terms_of_service.description')}
        noIndex={true}
      />
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">Terms of Service</h1>
            <p className="mt-4 text-lg text-base-600 dark:text-base-300">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">Welcome to Aman Digital Care. These Terms of Service ("Terms") govern your use of our application and services. By accessing or using our service, you agree to be bound by these Terms.</p>

            <PolicySection title="1. Description of Service">
              <p>Aman Digital Care ("the Service") is a digital application that provides AI-powered support, evidence-informed programs, and wellness tools for individuals on a journey of addiction recovery and mental wellness. The Service is provided by the AMAN AI Foundation, a non-profit initiative.</p>
            </PolicySection>

            <PolicySection title="2. Medical Disclaimer - CRITICAL">
              <p className="p-4 bg-warning-50 dark:bg-warning-900/30 border-l-4 border-warning-500 rounded-r-lg">
                <strong>The Service is not a substitute for professional medical advice, diagnosis, or treatment.</strong> It is not a medical device or a healthcare provider. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read, heard, or experienced on the Service. <strong>If you are in a crisis or think you may have an emergency, call your doctor or 911 immediately.</strong>
              </p>
            </PolicySection>

            <PolicySection title="3. User Responsibilities">
              <ul>
                <li>You agree to use the Service for its intended purpose of personal self-help and support.</li>
                <li>You are responsible for maintaining the confidentiality of your account (if applicable) and for all activities that occur under your account.</li>
                <li>You agree not to use the Service for any unlawful purpose or to violate any laws in your jurisdiction.</li>
                <li>When using community features, you agree not to post content that is hateful, threatening, pornographic, or that contains nudity or graphic or gratuitous violence.</li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Privacy">
              <p>Your privacy is critically important to us. Our Privacy Policy details how we handle your information. As a core principle, your personal data (journal entries, mood logs, etc.) is stored on your own device. Please review our <a href="/#/privacy-policy">Privacy Policy</a> to understand our practices.</p>
            </PolicySection>

            <PolicySection title="5. Intellectual Property">
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of the AMAN AI Foundation. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.</p>
            </PolicySection>

            <PolicySection title="6. Limitation of Liability">
              <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. To the maximum extent permitted by applicable law, in no event shall the AMAN AI Foundation, its directors, employees, partners, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.</p>
            </PolicySection>
            
            <PolicySection title="7. Termination">
                <p>We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </PolicySection>

            <PolicySection title="8. Governing Law">
              <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
            </PolicySection>

            <PolicySection title="9. Changes to Terms">
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
            </PolicySection>
            
            <PolicySection title="10. Contact Us">
              <p>If you have any questions about these Terms, please contact us at <a href="mailto:officialamanfoundation@gmail.com">officialamanfoundation@gmail.com</a>.</p>
            </PolicySection>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;
