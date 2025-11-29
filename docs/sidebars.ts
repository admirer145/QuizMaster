import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/authentication',
        'user-guide/quiz-hub',
        'user-guide/creating-quizzes',
        'user-guide/taking-quizzes',
        'user-guide/analytics',
        'user-guide/data-privacy',
      ],
    },
    {
      type: 'category',
      label: 'Developer Guide',
      items: [
        'developer-guide/architecture',
        'developer-guide/frontend',
        'developer-guide/backend',
        'developer-guide/database',
        'developer-guide/testing',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/vercel',
        'deployment/production',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/contributing',
      ],
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/authentication-api',
        'api/quizzes-api',
        'api/results-api',
        'api/leaderboard-api',
        'api/legal-api',
      ],
    },
  ],
};

export default sidebars;

