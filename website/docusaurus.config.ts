import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'Capsule UI',
  tagline: 'Isolated, token-driven components',
  url: 'https://your-org.github.io',
  baseUrl: '/capsule-ui/',
  favicon: 'img/favicon.ico',
  organizationName: 'your-org',
  projectName: 'capsule-ui',
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
        gtag: {
          trackingID: 'G-XXXXXXXXXX',
          anonymizeIP: true
        }
      }
    ]
  ],
  themes: ['@docusaurus/theme-live-codeblock']
};

export default config;
