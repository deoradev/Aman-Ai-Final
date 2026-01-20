
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
    "founder": {
      "@type": "Person",
      "name": "Devanshu Deora"
    },
    "foundingDate": "2001",
    "description": "Global mental health and addiction recovery companion leveraging artificial intelligence to make support accessible to all.",
    "url": baseUrl,
    "logo": `${baseUrl}/assets/icons/icon-512x512.png`
  };
  
  return (
    <>
    <SEOMeta
        title="Our Mission & Legacy | Devanshu Deora | Aman Digital Care"
        description="Founded on the belief of kindness by Devanshu Deora, Aman Digital Care carries forward a 20-year legacy of helping over 200,000 individuals find healing."
        keywords="Devanshu Deora, Aman Foundation, kindness in mental health, AI for good, non-profit recovery"
        canonicalUrl={`${baseUrl}/#/about`}
        schema={orgSchema}
    />
    <div className="bg-base-50 dark:bg-base-900">
      <section className="bg-primary-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.5em] mb-4 text-primary-200">The Human Story</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Rooted in Kindness</h1>
          <p className="mt-8 text-xl max-w-3xl mx-auto text-primary-100 font-medium">
            "Aman Digital Care is not just an algorithm. It is the legacy of a family’s devotion to healing, reimagined by a son who believes kindness is the world's most powerful medicine."
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
          <article>
            <h2 className="text-4xl font-black text-base-900 dark:text-white mb-6 tracking-tight">The Vision of Devanshu Deora</h2>
            <p className="text-xl text-base-700 dark:text-base-300 leading-relaxed mb-6">
              Our founder, **Devanshu Deora**, grew up witnessing the transformative power of compassionate care. His family’s NGO has been a beacon of hope in India since 2001, supporting over 200,000 people through the darkest moments of addiction.
            </p>
            <p className="text-xl text-base-700 dark:text-base-300 leading-relaxed">
              Devanshu realized that while the legacy was deep, the need was global. He built Aman AI to ensure that no matter where you are—from a small village to a bustling metropolis—you have access to the same kindness and evidence-based support that his family has provided for decades.
            </p>
          </article>
          <div className="flex justify-center">
            <div className="p-16 bg-white dark:bg-base-800 rounded-[4rem] shadow-2xl relative">
                <div className="absolute -top-4 -right-4 bg-accent-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">Est. 2001</div>
                <Logo size="large" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-base-100 dark:bg-base-950/50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
            <h2 className="text-4xl font-black text-base-900 dark:text-white mb-16 tracking-tight">Global Authority (E-A-T)</h2>
            <div className="grid md:grid-cols-3 gap-12 text-left">
                <div className="p-10 bg-white/40 dark:bg-base-800/40 rounded-[3rem] border border-base-200 dark:border-white/5">
                    <h3 className="font-black text-primary-500 text-xl mb-4 uppercase tracking-tighter">Legacy</h3>
                    <p className="text-base-600 dark:text-base-400 leading-relaxed">20+ years of clinical NGO experience in de-addiction and psychiatric rehabilitation.</p>
                </div>
                <div className="p-10 bg-white/40 dark:bg-base-800/40 rounded-[3rem] border border-base-200 dark:border-white/5">
                    <h3 className="font-black text-primary-500 text-xl mb-4 uppercase tracking-tighter">Impact</h3>
                    <p className="text-base-600 dark:text-base-400 leading-relaxed">Verified record of 200,000+ lives impacted through offline and online initiatives.</p>
                </div>
                <div className="p-10 bg-white/40 dark:bg-base-800/40 rounded-[3rem] border border-base-200 dark:border-white/5">
                    <h3 className="font-black text-primary-500 text-xl mb-4 uppercase tracking-tighter">Vision</h3>
                    <p className="text-base-600 dark:text-base-400 leading-relaxed">Pioneering ethical AI to bridge the accessibility gap in global mental health.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-base-900 dark:text-white mb-8 tracking-tighter">Join the Movement</h2>
          <p className="text-xl text-base-600 dark:text-base-300 max-w-2xl mx-auto mb-12 font-medium">
            Be part of a mission where technology serves humanity. Explore our free programs and start your journey today.
          </p>
          <NavLink to="/programs" className="inline-block bg-primary-500 text-white font-black py-5 px-16 rounded-[2rem] text-xl hover:scale-105 transition-all shadow-2xl shadow-primary-500/30 uppercase tracking-widest">
            Start Your Free Journey
          </NavLink>
        </div>
      </section>
    </div>
    </>
  );
};

export default AboutPage;
