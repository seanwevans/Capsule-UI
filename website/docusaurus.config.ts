import type {Config} from '@docusaurus/types';

const {
  DOCS_SITE_URL,
  DOCS_BASE_URL,
  DOCS_ORGANIZATION_NAME,
  DOCS_PROJECT_NAME,
  DOCS_GTAG_ID,
  NODE_ENV
} = process.env;

const isProduction = NODE_ENV === 'production';

const requiredProductionEnvVars = {
  DOCS_SITE_URL,
  DOCS_ORGANIZATION_NAME,
  DOCS_PROJECT_NAME
};

const missingProductionEnvVars = Object.entries(requiredProductionEnvVars)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (isProduction && missingProductionEnvVars.length > 0) {
  throw new Error(
    `[docusaurus.config] Missing required production environment variables: ${missingProductionEnvVars.join(', ')}`
  );
}

const gtagConfig = DOCS_GTAG_ID
  ? {
      gtag: {
        trackingID: DOCS_GTAG_ID,
        anonymizeIP: true
      }
    }
  : {};

const config: Config = {
  title: 'Capsule UI',
  tagline: 'Isolated, token-driven components',
  url: DOCS_SITE_URL ?? 'http://localhost:3000',
  baseUrl: DOCS_BASE_URL ?? '/',
  favicon: 'img/favicon.ico',
  organizationName: DOCS_ORGANIZATION_NAME ?? 'capsule-ui',
  projectName: DOCS_PROJECT_NAME ?? 'capsule-ui',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs'
        },
        blog: {
          showReadingTime: true
        },
        theme: {
          customCss: './src/css/custom.css'
        },
        ...gtagConfig
      }
    ]
  ],
  themes: ['@docusaurus/theme-live-codeblock']
};

export default config;
