
import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const AboutPage: React.FC = () => {
  const { t } = useLocalization();
  const baseUrl = "https://amandigitalcare.com";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Aman Digital Care",
    "parentOrganization": {
      "@type": "Organization",
      "name": "AMAN AI Foundation"
    },
    "foundingDate": "2001",
    "description": "Global mental health and addiction recovery companion leveraging artificial intelligence to make support accessible to all.",
    "url": baseUrl,
    "logo": `${baseUrl}/assets/icons/icon-512x512.png`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Delhi",
      "addressCountry": "IN"
    }
  };
  
  return (
    <>
    <SEOMeta
        title="Our Mission & 20-Year Legacy | Aman Digital Care"
        description="From Tihar Jail to a global AI companion, Aman Digital Care has supported over 200,000 individuals in their recovery journey. Discover our non-profit mission."
        keywords="recovery non-profit, Aman Foundation, mental health legacy, free sobriety support, addiction rehabilitation history"
        canonicalUrl={`${baseUrl}/#/about`}
        schema={orgSchema}
    />
    <div className="bg-base-50 dark:bg-base-900">
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold">About Our Mission</h1>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-primary-100">
            Aman Digital Care is the digital evolution of a two-decade commitment to healing and human dignity.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <article>
            <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">Born in Rehabilitation</h2>
            <p className="text-base-700 dark:text-base-300 leading-relaxed mb-4">
              Since 2001, our founder's family has been at the forefront of addiction treatment. What started as intensive support in Delhi's Tihar Jail has grown into a global movement.
            </p>
            <p className="text-base-700 dark:text-base-300 leading-relaxed">
              We have seen first-hand that recovery is possible for anyone, provided they have the right tools and a safe, non-judgmental space to grow.
            </p>
          </article>
          <div className="flex justify-center my-8">
            <div className="p-10 bg-white dark:bg-base-800 rounded-full shadow-soft-lg">
                <Logo size="large" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-base-100 dark:bg-base-800/50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">Expertise & Trust (E-A-T)</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="p-6 bg-white/50 dark:bg-base-700/50 rounded-xl">
                    <h3 className="font-bold text-primary-500 text-lg mb-2">200,000+ Lives Touched</h3>
                    <p className="text-sm text-base-600 dark:text-base-400">Our real-world NGO roots provide the data and empathy needed to build a truly effective AI companion.</p>
                </div>
                <div className="p-6 bg-white/50 dark:bg-base-700/50 rounded-xl">
                    <h3 className="font-bold text-primary-500 text-lg mb-2">Non-Profit Foundation</h3>
                    <p className="text-sm text-base-600 dark:text-base-400">Guided by the AMAN AI Foundation, we prioritize human impact over corporate profits.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">Be Part of the Solution</h2>
          <p className="text-base-600 dark:text-base-300 max-w-2xl mx-auto mb-8">
            Mental health care should be a right, not a luxury. Explore our free programs and start your journey today.
          </p>
          <NavLink to="/programs" className="inline-block bg-primary-500 text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg">
            Start Your Free Journey
          </NavLink>
        </div>
      </section>
    </div>
    </>
  );
};

export default AboutPage;