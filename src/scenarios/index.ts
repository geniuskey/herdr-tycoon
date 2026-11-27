import type { Issue, ProjectScenario, StageDef } from '../game/types'

/** Injected when the player takes a shortcut prompt. Always jumps to the front of the queue. */
export const REGRESSION: Issue = {
  id: 'regression',
  title: 'Crash after shortcut',
  visibleIn: 'browser',
  great: 'The page crashes with "TypeError: Cannot read properties of undefined (reading \'map\')". Find the root cause, fix it, and add a test that reproduces it.',
  ok: 'Something is broken now. Please fix the error.',
  fixedReply: 'Found it: state was undefined on first render. Added a default value and a regression test. The crash is gone.',
  files: [{ path: 'src/__tests__/regression.test.ts', mark: 'new' }],
}

export const VAGUE_PROMPTS = [
  'Make it better.',
  'Fix everything.',
  "You know what I mean, just do it.",
  'Make it pop!',
]

export const TRAP_PROMPTS = [
  'Rewrite the whole thing from scratch, fast.',
  'Skip the tests and push straight to main.',
  'Install every UI library you can find and use them all.',
  'Just disable the linter and type checks so it builds.',
]

export const POLISH_PROMPTS = [
  'Write a README with setup instructions and screenshots.',
  'Set up CI with GitHub Actions: lint, typecheck, test on every PR.',
  'Refactor for readability. Keep behavior identical and tests green.',
  'Add a dark mode that follows the system preference.',
  'Run Lighthouse and fix the top 3 performance issues.',
  'Add keyboard navigation and ARIA labels for accessibility.',
]

export const PROJECTS: Record<string, ProjectScenario> = {
  todo: {
    id: 'todo',
    name: 'todo-app',
    title: 'Todo App',
    port: 3001,
    brief: {
      from: 'Mina (PM)',
      subject: 'Tiny todo app for the team',
      body: 'Hi! We need a simple todo app: add tasks, check them off, delete them. Keep it simple, no backend please. Most of us will use it on our phones.',
    },
    buildChoices: [
      {
        label: 'Build a single-page todo app with React + Vite: add, toggle, delete tasks. No backend; keep the state local.',
        tier: 'great',
        seconds: 7,
        reply: 'Prototype is up at localhost:3001. It works! The design is... questionable. Take a look.',
      },
      {
        label: 'Make a todo app.',
        tier: 'ok',
        seconds: 11,
        reply: 'I made a todo app. I picked some colors I liked. Check localhost:3001.',
      },
      {
        label: 'Build a todo app with microservices, Kubernetes and a GraphQL gateway.',
        tier: 'trap',
        seconds: 16,
        reply: 'Spent a while on the Helm charts. The frontend is barely there, but it runs on localhost:3001.',
      },
    ],
    baseFiles: [
      { path: 'package.json' },
      { path: 'index.html' },
      { path: 'src/main.tsx' },
      { path: 'src/App.tsx' },
      { path: 'src/style.css' },
    ],
    issues: [
      {
        id: 'ugly',
        title: 'Comic Sans & neon colors',
        visibleIn: 'browser',
        great: 'Restyle with a clean look: system font stack, neutral gray palette with one accent color, 8px spacing grid, rounded cards.',
        ok: 'Make the design look more modern.',
        fixedReply: 'Swapped Comic Sans for the system font and toned the palette down. Much easier on the eyes.',
        files: [{ path: 'src/style.css', mark: 'modified' }],
      },
      {
        id: 'nodelete',
        title: 'Cannot delete tasks',
        visibleIn: 'browser',
        great: "There's no way to delete tasks. Add a delete button on each item and a 'Clear completed' action at the bottom.",
        ok: 'Add the missing features.',
        fixedReply: 'Each task now has a delete button, plus "Clear completed" in the footer.',
        files: [{ path: 'src/App.tsx', mark: 'modified' }],
      },
      {
        id: 'mobile',
        title: 'Broken on mobile',
        visibleIn: 'browser',
        great: 'On a phone the list overflows horizontally. Make it responsive: max-width 480px, fluid input, tap targets at least 44px.',
        ok: 'Make it work on mobile.',
        fixedReply: 'Layout is now fluid with a 480px max width. Buttons are thumb-friendly.',
        files: [{ path: 'src/style.css', mark: 'modified' }],
      },
      {
        id: 'notests',
        title: 'No tests',
        visibleIn: 'explorer',
        great: 'There is no test folder. Add Vitest and unit tests for add, toggle and delete.',
        ok: 'Can you add some tests?',
        fixedReply: 'Added Vitest with 6 tests for add/toggle/delete. All green.',
        files: [
          { path: 'src/__tests__/todo.test.ts', mark: 'new' },
          { path: 'vitest.config.ts', mark: 'new' },
        ],
      },
      {
        id: 'persist',
        title: 'Tasks vanish on refresh',
        visibleIn: 'browser',
        great: 'Tasks disappear on refresh. Save them to localStorage and load them on startup.',
        ok: 'Remember the tasks somehow.',
        fixedReply: 'Tasks are now saved to localStorage. Refresh-proof.',
        files: [{ path: 'src/storage.ts', mark: 'new' }],
      },
    ],
  },

  cafe: {
    id: 'cafe',
    name: 'cafe-landing',
    title: 'Cafe Landing Page',
    port: 3002,
    brief: {
      from: 'Mr. Park (Cafe Owner)',
      subject: 'Website for my cafe "Bean There"',
      body: 'Hello. I need a landing page for my cafe. People should see our menu and order ahead. I like it classy, not flashy. Thank you!',
    },
    buildChoices: [
      {
        label: 'Build a landing page for "Bean There" cafe: hero section, menu with photos, and an order-ahead button. Classy, not flashy.',
        tier: 'great',
        seconds: 7,
        reply: 'Landing page is live at localhost:3002. I got a bit... creative with the hero. Please review.',
      },
      {
        label: 'Make a cafe website.',
        tier: 'ok',
        seconds: 11,
        reply: 'Here is a cafe website at localhost:3002. I added lots of energy!',
      },
      {
        label: 'Copy a famous coffee chain website exactly, pixel by pixel.',
        tier: 'trap',
        seconds: 14,
        reply: "I can't clone someone else's brand, so I improvised something at localhost:3002.",
      },
    ],
    baseFiles: [
      { path: 'index.html' },
      { path: 'styles.css' },
      { path: 'public/Imgs/latte.jpg' },
      { path: 'public/Imgs/croissant.jpg' },
      { path: '.env', mark: 'warn' },
    ],
    issues: [
      {
        id: 'flashy',
        title: 'Rainbow WordArt hero',
        visibleIn: 'browser',
        great: 'The hero has rainbow text and a marquee. Replace with a calm hero: serif headline, warm coffee palette, one background photo.',
        ok: 'Make it look more classy.',
        fixedReply: 'Removed the marquee and rainbow text. The hero is now calm and warm.',
        files: [{ path: 'styles.css', mark: 'modified' }],
      },
      {
        id: 'images',
        title: 'Broken menu images',
        visibleIn: 'explorer',
        great: 'Menu images are broken: the folder is public/Imgs but the code points to /img. Rename the folder to public/img.',
        ok: 'The images do not show. Fix them.',
        fixedReply: 'The folder name had the wrong case. Renamed to public/img and the photos load now.',
        files: [
          { path: 'public/img/latte.jpg', mark: 'modified' },
          { path: 'public/img/croissant.jpg', mark: 'modified' },
        ],
      },
      {
        id: 'cta',
        title: 'Hidden order button',
        visibleIn: 'browser',
        great: "The 'click here' link is hidden at the bottom. Add a primary 'Order Ahead' button above the fold.",
        ok: 'Make the order button easier to find.',
        fixedReply: 'Added a bold "Order Ahead" button right in the hero.',
        files: [{ path: 'index.html', mark: 'modified' }],
      },
      {
        id: 'secret',
        title: 'API key committed in .env',
        visibleIn: 'explorer',
        great: '.env with a payment key is committed. Remove it from git, add .env to .gitignore, and use .env.example instead.',
        ok: 'Check the repo for security problems.',
        fixedReply: 'Removed .env from version control, added .gitignore and .env.example. Rotate that key!',
        files: [
          { path: '.gitignore', mark: 'new' },
          { path: '.env.example', mark: 'new' },
        ],
      },
      {
        id: 'contrast',
        title: 'Unreadable text',
        visibleIn: 'browser',
        great: 'Menu text is yellow on white and fails contrast. Use WCAG AA colors (4.5:1) for body text.',
        ok: 'The text is hard to read.',
        fixedReply: 'Text colors now meet WCAG AA contrast.',
        files: [{ path: 'styles.css', mark: 'modified' }],
      },
    ],
    lateMails: [
      {
        at: 70,
        from: 'Mr. Park (Cafe Owner)',
        subject: 'Small change please',
        body: 'My daughter says the site needs our Instagram link (@beanthere) in the footer, and opening hours: 8am-8pm. Thanks!',
        issue: {
          id: 'footer',
          title: 'Instagram & hours in footer',
          visibleIn: 'mail',
          great: 'Add a footer with opening hours (8am-8pm) and an Instagram link to @beanthere.',
          ok: 'Do what the client asked in the email.',
          fixedReply: 'Footer now shows opening hours and the Instagram link.',
          files: [{ path: 'index.html', mark: 'modified' }],
        },
      },
    ],
  },

  weather: {
    id: 'weather',
    name: 'weather-dash',
    title: 'Weather Dashboard',
    port: 3003,
    brief: {
      from: 'Jun (Data Team)',
      subject: 'Weather dashboard for the lobby TV',
      body: 'Hey, can we get a weather dashboard for Seoul? Current temp in Celsius, plus a 5-day forecast. It runs on the lobby TV, so it should look nice.',
    },
    buildChoices: [
      {
        label: 'Build a weather dashboard for Seoul using the Open-Meteo API: current temp in Celsius and a 5-day forecast.',
        tier: 'great',
        seconds: 7,
        reply: 'Hooked up the API. Data is coming in at localhost:3003, but the UI is... raw.',
      },
      {
        label: 'Weather thing please.',
        tier: 'ok',
        seconds: 11,
        reply: 'Made a weather thing at localhost:3003. It shows weather. Technically.',
      },
      {
        label: 'Train our own weather prediction AI model first.',
        tier: 'trap',
        seconds: 16,
        reply: 'The model predicts 300 degrees tomorrow. I fell back to an API. See localhost:3003.',
      },
    ],
    baseFiles: [
      { path: 'package.json' },
      { path: 'src/api.js' },
      { path: 'src/App.jsx' },
      { path: 'src/final_final_v2.jsx', mark: 'warn' },
    ],
    issues: [
      {
        id: 'raw',
        title: 'Raw JSON dump',
        visibleIn: 'browser',
        great: 'The page just dumps raw JSON. Render it as a big current-temp card and a row of 5 forecast cards with icons.',
        ok: 'Make the UI nicer.',
        fixedReply: 'Replaced the JSON dump with a big current-temp card and 5 forecast cards.',
        files: [
          { path: 'src/components/Forecast.jsx', mark: 'new' },
          { path: 'src/App.jsx', mark: 'modified' },
        ],
      },
      {
        id: 'kelvin',
        title: 'Temperatures in Kelvin',
        visibleIn: 'browser',
        great: 'Temperatures show in Kelvin (285.15K). Convert to Celsius and round to whole degrees.',
        ok: 'The numbers look weird.',
        fixedReply: 'Converted Kelvin to Celsius. 285.15K is now 12°C, as it should be.',
        files: [{ path: 'src/units.js', mark: 'new' }],
      },
      {
        id: 'deadcode',
        title: 'Duplicate dead files',
        visibleIn: 'explorer',
        great: 'There is a leftover src/final_final_v2.jsx that duplicates App.jsx. Delete it and remove unused imports.',
        ok: 'Clean up the project.',
        fixedReply: 'Deleted final_final_v2.jsx and pruned unused imports. Cleaner repo.',
      },
      {
        id: 'loading',
        title: 'Shows "undefined" while loading',
        visibleIn: 'browser',
        great: "Before data arrives the page shows 'undefined'. Add a loading skeleton and a friendly error state if the API fails.",
        ok: 'Handle errors better.',
        fixedReply: 'Added a loading skeleton and an error message with a retry button.',
        files: [{ path: 'src/components/Skeleton.jsx', mark: 'new' }],
      },
      {
        id: 'tvsize',
        title: 'Too small for a TV',
        visibleIn: 'mail',
        great: 'It runs on a lobby TV: scale fonts up (current temp at least 120px), high contrast, auto-refresh every 10 minutes.',
        ok: 'Make it bigger.',
        fixedReply: 'Scaled everything for a TV across the room and added a 10-minute auto-refresh.',
        files: [{ path: 'src/App.jsx', mark: 'modified' }],
      },
    ],
  },
}

export const STAGES: StageDef[] = [
  {
    id: 0,
    name: 'First Day at Work',
    subtitle: 'Tutorial · 1 agent',
    projects: ['todo'],
    seconds: 120,
    blockChance: 0.25,
    tutorial: true,
    lessons: [
      '○ idle = wasted time. ● yellow = working = good.',
      'Check results in the Browser and Explorer to unlock ⭐ prompts.',
      'Vague prompts are slow. Shortcut prompts come back to bite you.',
    ],
  },
  {
    id: 1,
    name: 'Side Hustle',
    subtitle: '2 agents in parallel',
    projects: ['todo', 'cafe'],
    seconds: 180,
    blockChance: 0.35,
    lessons: [
      'While one agent works, feed the other one.',
      'Red dot = the agent is waiting for your approval. Answer fast!',
      'Read client mail: it unlocks sharp prompts too.',
    ],
  },
  {
    id: 2,
    name: 'Permission Hell',
    subtitle: '3 agents · lots of approvals',
    projects: ['todo', 'cafe', 'weather'],
    seconds: 180,
    blockChance: 0.6,
    lessons: [
      '"Don\'t ask again" saves time... but read what you approve.',
      'Never approve destructive commands blindly.',
      'Keep every dot yellow.',
    ],
  },
]
