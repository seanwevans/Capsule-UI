import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home() {
  return (
    <Layout title="Capsule UI" description="Isolated, token-driven components">
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">Capsule UI</h1>
          <p className="hero__subtitle">
            Design system powered by tokens and isolation
          </p>
          <div>
            <Link className="button button--secondary button--lg" to="/docs/">
              Get Started
            </Link>
            <Link
              className="button button--lg"
              style={{marginLeft: '1rem'}}
              to="/docs/theming-lab"
            >
              Theming Lab
            </Link>
          </div>
        </div>
      </header>
    </Layout>
  );
}
