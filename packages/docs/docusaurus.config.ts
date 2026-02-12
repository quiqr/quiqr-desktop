import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Quiqr Desktop',
  tagline: 'Local-first CMS for static site generators',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://quiqr.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/quiqr-desktop/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'quiqr', // Usually your GitHub org/user name.
  projectName: 'quiqr-desktop', // Usually your repo name.

  trailingSlash: false,
  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/quiqr/quiqr-desktop/tree/main/packages/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('docusaurus-lunr-search'),
      {
        languages: ['en'], // language codes
        indexBaseUrl: true, // Whether to index the base URL
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Quiqr Desktop',
      logo: {
        alt: 'Quiqr Logo',
        src: 'img/quiqr-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://quiqr.github.io/quiqr-desktop/specs',
          label: 'OpenSpec',
          position: 'left',
        },
        {
          href: 'https://github.com/quiqr/quiqr-desktop',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Site & CMS Developer Guide',
              to: '/docs/site-and-cms-developer-guide',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/quiqr/quiqr-desktop',
            },
            {
              label: 'Issues',
              href: 'https://github.com/quiqr/quiqr-desktop/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'OpenSpec',
              href: 'https://quiqr.github.io/quiqr-desktop/specs',
            },
            {
              label: 'Releases',
              href: 'https://github.com/quiqr/quiqr-desktop/releases',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Quiqr Organization. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
