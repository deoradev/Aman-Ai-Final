
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const ApproachPage: React.FC = () => {
  const { t } = useLocalization();
  const baseUrl = "https://amandigitalcare.com";

  // High-authority FAQ Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does AI help with addiction recovery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aman AI uses evidence-informed techniques like Cognitive Behavioral Therapy (CBT) and Mindfulness to provide 24/7 confidential support, helping individuals identify triggers and manage cravings in real-time."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free app for confidential mental health support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Aman Digital Care is a completely free, non-profit initiative by the AMAN AI Foundation, designed to provide private mental health and addiction support globally."
        }
      }
    ]
  };

  return (
    <>
      <SEOMeta
        title="Our Evidence-Informed Approach | Free AI Addiction Support"
        description="Learn how Aman AI combines clinical CBT, Mindfulness, and 20 years of rehabilitation expertise to provide free, confidential recovery support."
        keywords="CBT app for recovery, mindfulness addiction tool, free mental health AI, confidential sobriety companion"
        canonicalUrl={`${baseUrl}/#/our-approach`}
        schema={faqSchema}
      />
      <div className="bg-base-50 dark:bg-base-900">
        <section className="bg-primary-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold">{t('approach_page.title')}</h1>
            <p className="mt-4 text-lg max-w-3xl mx-auto text-primary-100">{t('approach_page.subtitle')}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-16">
              
              <article>
                <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 text-center mb-6">Built on Clinical Foundations</h2>
                <p className="text-center text-lg text-base-700 dark:text-base-300 leading-relaxed mb-10">Our methodology bridges the gap between traditional clinical science and modern accessible technology.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: "CBT Focus", text: "Transforming negative thought patterns into healthy cognitive behaviors through AI guidance." },
                    { title: "Mindfulness", text: "MBSR-based techniques to build a gap between cravings and actions." },
                    { title: "MI Strategy", text: "Strengthening internal motivation for lasting behavioral change." }
                  ].map(method => (
                    <div key={method.title} className="bg-white/60 dark:bg-base-800/60 p-6 rounded-xl shadow-soft border-t-4 border-primary-400">
                      <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{method.title}</h3>
                      <p className="text-base-600 dark:text-base-400 text-sm">{method.text}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* Semantic SEO Block for Google 'Freshness' and Context */}
              <div className="bg-white/40 dark:bg-base-800/40 p-10 rounded-3xl border border-base-200 dark:border-base-700">
                <h2 className="text-2xl font-bold text-primary-600 mb-6">Aman AI: The Best Free Alternative to Paid Recovery Apps</h2>
                <div className="grid md:grid-cols-2 gap-8 text-base-700 dark:text-base-300">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Anonymous and Safe</h3>
                    <p>Unlike many mental health apps, Aman Digital Care stores your personal data locally. We don't require your real identity to help you heal. This makes us the leading choice for confidential recovery.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">24/7 Availability</h3>
                    <p>Craving doesn't wait for business hours. Our AI companion is ready to talk at 3 AM or 3 PM, providing immediate grounding exercises and emotional support when you need it most.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-base-800/60 p-8 rounded-xl shadow-soft text-center">
                <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">Start Your Recovery Journey</h2>
                <p className="text-lg text-base-700 dark:text-base-300 max-w-2xl mx-auto mb-6">Join thousands of others using evidence-based tools for a healthier life.</p>
                <NavLink to="/programs" className="inline-block bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg">
                    Browse Free Programs
                </NavLink>
              </div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ApproachPage;