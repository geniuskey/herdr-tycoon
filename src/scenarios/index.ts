import type { Issue, ProjectScenario, StageDef } from '../game/types'
import { l } from '../i18n'

/** Injected when the player takes a shortcut prompt. Always jumps to the front of the queue. */
export const REGRESSION: Issue = {
  id: 'regression',
  title: l('Crash after shortcut', '지름길 후 크래시'),
  visibleIn: 'browser',
  great: l(
    'The page crashes with "TypeError: Cannot read properties of undefined (reading \'map\')". Find the root cause, fix it, and add a test that reproduces it.',
    '페이지가 "TypeError: Cannot read properties of undefined (reading \'map\')"로 크래시 나. 근본 원인을 찾아서 고치고, 재현하는 테스트도 추가해 줘.',
  ),
  ok: l('Something is broken now. Please fix the error.', '뭔가 망가졌어. 에러 좀 고쳐 줘.'),
  fixedReply: l(
    'Found it: state was undefined on first render. Added a default value and a regression test. The crash is gone.',
    '찾았어요: 첫 렌더링 때 state가 undefined였어요. 기본값과 회귀 테스트를 추가했고, 크래시는 사라졌어요.',
  ),
  files: [{ path: 'src/__tests__/regression.test.ts', mark: 'new' }],
}

export const VAGUE_PROMPTS = [
  l('Make it better.', '더 좋게 만들어 줘.'),
  l('Fix everything.', '다 고쳐 줘.'),
  l("You know what I mean, just do it.", '무슨 말인지 알지? 그냥 해 줘.'),
  l('Make it pop!', '좀 확 튀게 해 줘!'),
]

export const TRAP_PROMPTS = [
  l('Rewrite the whole thing from scratch, fast.', '처음부터 전부 다시 짜. 빨리.'),
  l('Skip the tests and push straight to main.', '테스트는 건너뛰고 main에 바로 푸시해.'),
  l('Install every UI library you can find and use them all.', '찾을 수 있는 UI 라이브러리 다 설치해서 전부 써.'),
  l('Just disable the linter and type checks so it builds.', '빌드되게 린터랑 타입 체크 그냥 꺼 버려.'),
]

export const POLISH_PROMPTS = [
  l('Write a README with setup instructions and screenshots.', '설치 방법과 스크린샷이 담긴 README를 써 줘.'),
  l('Set up CI with GitHub Actions: lint, typecheck, test on every PR.', 'GitHub Actions로 CI 구성해 줘: PR마다 lint, typecheck, test.'),
  l('Refactor for readability. Keep behavior identical and tests green.', '가독성 위주로 리팩터링해 줘. 동작은 그대로, 테스트는 통과하게.'),
  l('Add a dark mode that follows the system preference.', '시스템 설정을 따라가는 다크 모드를 추가해 줘.'),
  l('Run Lighthouse and fix the top 3 performance issues.', 'Lighthouse 돌려서 성능 이슈 상위 3개를 고쳐 줘.'),
  l('Add keyboard navigation and ARIA labels for accessibility.', '접근성을 위해 키보드 내비게이션과 ARIA 라벨을 추가해 줘.'),
]

export const PROJECTS: Record<string, ProjectScenario> = {
  todo: {
    id: 'todo',
    name: 'todo-app',
    branch: 'main',
    title: l('Todo App', '할 일 앱'),
    port: 3001,
    brief: {
      from: l('Mina (PM)', '미나 (PM)'),
      subject: l('Tiny todo app for the team', '팀에서 쓸 작은 할 일 앱'),
      body: l(
        'Hi! We need a simple todo app: add tasks, check them off, delete them. Keep it simple, no backend please. Most of us will use it on our phones.',
        '안녕하세요! 간단한 할 일 앱이 필요해요: 할 일 추가, 완료 체크, 삭제. 단순하게, 백엔드는 없이 부탁드려요. 대부분 휴대폰으로 쓸 거예요.',
      ),
    },
    buildChoices: [
      {
        label: l(
          'Build a single-page todo app with React + Vite: add, toggle, delete tasks. No backend; keep the state local.',
          'React + Vite로 한 페이지짜리 할 일 앱을 만들어 줘: 추가, 완료 토글, 삭제. 백엔드 없이 state는 로컬로.',
        ),
        tier: 'great',
        seconds: 7,
        reply: l(
          'Prototype is up at localhost:3001. It works! The design is... questionable. Take a look.',
          '프로토타입을 localhost:3001에 띄웠어요. 동작은 해요! 디자인은... 글쎄요. 한번 보세요.',
        ),
      },
      {
        label: l('Make a todo app.', '할 일 앱 만들어 줘.'),
        tier: 'ok',
        seconds: 11,
        reply: l('I made a todo app. I picked some colors I liked. Check localhost:3001.', '할 일 앱을 만들었어요. 제 맘에 드는 색을 골랐어요. localhost:3001을 확인하세요.'),
      },
      {
        label: l('Build a todo app with microservices, Kubernetes and a GraphQL gateway.', '마이크로서비스, Kubernetes, GraphQL 게이트웨이로 할 일 앱을 만들어 줘.'),
        tier: 'trap',
        seconds: 16,
        reply: l(
          'Spent a while on the Helm charts. The frontend is barely there, but it runs on localhost:3001.',
          'Helm 차트에 시간을 꽤 썼어요. 프론트엔드는 거의 없지만 localhost:3001에서 돌아가요.',
        ),
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
        title: l('Comic Sans & neon colors', 'Comic Sans와 형광색'),
        visibleIn: 'browser',
        great: l(
          'Restyle with a clean look: system font stack, neutral gray palette with one accent color, 8px spacing grid, rounded cards.',
          '깔끔하게 다시 스타일링해 줘: 시스템 폰트, 중립 회색 팔레트에 포인트 색 하나, 8px 간격 그리드, 둥근 카드.',
        ),
        ok: l('Make the design look more modern.', '디자인을 좀 더 모던하게 해 줘.'),
        fixedReply: l(
          'Swapped Comic Sans for the system font and toned the palette down. Much easier on the eyes.',
          'Comic Sans를 시스템 폰트로 바꾸고 색을 차분하게 낮췄어요. 눈이 훨씬 편해요.',
        ),
        files: [{ path: 'src/style.css', mark: 'modified' }],
      },
      {
        id: 'nodelete',
        title: l('Cannot delete tasks', '할 일을 삭제할 수 없음'),
        visibleIn: 'browser',
        great: l(
          "There's no way to delete tasks. Add a delete button on each item and a 'Clear completed' action at the bottom.",
          "할 일을 지울 방법이 없어. 항목마다 삭제 버튼을 달고, 아래쪽에 '완료 항목 지우기'를 추가해 줘.",
        ),
        ok: l('Add the missing features.', '빠진 기능 추가해 줘.'),
        fixedReply: l('Each task now has a delete button, plus "Clear completed" in the footer.', '이제 항목마다 삭제 버튼이 있고, 하단에 "완료 항목 지우기"도 있어요.'),
        files: [{ path: 'src/App.tsx', mark: 'modified' }],
      },
      {
        id: 'mobile',
        title: l('Broken on mobile', '모바일에서 깨짐'),
        visibleIn: 'browser',
        great: l(
          'On a phone the list overflows horizontally. Make it responsive: max-width 480px, fluid input, tap targets at least 44px.',
          '휴대폰에서 목록이 가로로 넘쳐. 반응형으로 해 줘: max-width 480px, 유동 입력창, 터치 영역은 최소 44px.',
        ),
        ok: l('Make it work on mobile.', '모바일에서도 되게 해 줘.'),
        fixedReply: l('Layout is now fluid with a 480px max width. Buttons are thumb-friendly.', '레이아웃이 최대 480px 유동형이 됐어요. 버튼도 엄지로 누르기 편해요.'),
        files: [{ path: 'src/style.css', mark: 'modified' }],
      },
      {
        id: 'notests',
        title: l('No tests', '테스트 없음'),
        visibleIn: 'explorer',
        great: l('There is no test folder. Add Vitest and unit tests for add, toggle and delete.', '테스트 폴더가 없어. Vitest를 추가하고 추가/토글/삭제 단위 테스트를 작성해 줘.'),
        ok: l('Can you add some tests?', '테스트 좀 추가해 줄래?'),
        fixedReply: l('Added Vitest with 6 tests for add/toggle/delete. All green.', 'Vitest와 추가/토글/삭제 테스트 6개를 추가했어요. 전부 통과.'),
        files: [
          { path: 'src/__tests__/todo.test.ts', mark: 'new' },
          { path: 'vitest.config.ts', mark: 'new' },
        ],
      },
      {
        id: 'persist',
        title: l('Tasks vanish on refresh', '새로고침하면 할 일이 사라짐'),
        visibleIn: 'browser',
        great: l('Tasks disappear on refresh. Save them to localStorage and load them on startup.', '새로고침하면 할 일이 사라져. localStorage에 저장하고 시작할 때 불러오게 해 줘.'),
        ok: l('Remember the tasks somehow.', '할 일을 어떻게든 기억하게 해 줘.'),
        fixedReply: l('Tasks are now saved to localStorage. Refresh-proof.', '이제 할 일이 localStorage에 저장돼요. 새로고침해도 안전해요.'),
        files: [{ path: 'src/storage.ts', mark: 'new' }],
      },
    ],
  },

  cafe: {
    id: 'cafe',
    name: 'cafe-landing',
    branch: 'feat/landing',
    title: l('Cafe Landing Page', '카페 랜딩 페이지'),
    port: 3002,
    brief: {
      from: l('Mr. Park (Cafe Owner)', '박 사장님 (카페 사장)'),
      subject: l('Website for my cafe "Bean There"', '제 카페 "Bean There" 홈페이지'),
      body: l(
        'Hello. I need a landing page for my cafe. People should see our menu and order ahead. I like it classy, not flashy. Thank you!',
        '안녕하세요. 저희 카페 랜딩 페이지가 필요합니다. 손님들이 메뉴를 보고 미리 주문할 수 있어야 해요. 요란한 것보다 고급스러운 게 좋아요. 감사합니다!',
      ),
    },
    buildChoices: [
      {
        label: l(
          'Build a landing page for "Bean There" cafe: hero section, menu with photos, and an order-ahead button. Classy, not flashy.',
          '"Bean There" 카페 랜딩 페이지를 만들어 줘: 히어로 섹션, 사진 있는 메뉴, 미리 주문 버튼. 요란하지 않고 고급스럽게.',
        ),
        tier: 'great',
        seconds: 7,
        reply: l(
          'Landing page is live at localhost:3002. I got a bit... creative with the hero. Please review.',
          '랜딩 페이지를 localhost:3002에 띄웠어요. 히어로가 좀... 창의적이에요. 확인 부탁드려요.',
        ),
      },
      {
        label: l('Make a cafe website.', '카페 홈페이지 만들어 줘.'),
        tier: 'ok',
        seconds: 11,
        reply: l('Here is a cafe website at localhost:3002. I added lots of energy!', 'localhost:3002에 카페 홈페이지가 있어요. 에너지를 듬뿍 넣었어요!'),
      },
      {
        label: l('Copy a famous coffee chain website exactly, pixel by pixel.', '유명 커피 체인 홈페이지를 픽셀 하나까지 똑같이 베껴 줘.'),
        tier: 'trap',
        seconds: 14,
        reply: l(
          "I can't clone someone else's brand, so I improvised something at localhost:3002.",
          '남의 브랜드를 그대로 베낄 순 없어서, localhost:3002에 즉흥적으로 뭔가 만들었어요.',
        ),
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
        title: l('Rainbow WordArt hero', '무지개 워드아트 히어로'),
        visibleIn: 'browser',
        great: l(
          'The hero has rainbow text and a marquee. Replace with a calm hero: serif headline, warm coffee palette, one background photo.',
          '히어로에 무지개 글씨와 흐르는 글자가 있어. 차분하게 바꿔 줘: 세리프 제목, 따뜻한 커피 색감, 배경 사진 한 장.',
        ),
        ok: l('Make it look more classy.', '좀 더 고급스럽게 해 줘.'),
        fixedReply: l('Removed the marquee and rainbow text. The hero is now calm and warm.', '흐르는 글자와 무지개 글씨를 없앴어요. 히어로가 차분하고 따뜻해졌어요.'),
        files: [{ path: 'styles.css', mark: 'modified' }],
      },
      {
        id: 'images',
        title: l('Broken menu images', '메뉴 이미지 깨짐'),
        visibleIn: 'explorer',
        great: l(
          'Menu images are broken: the folder is public/Imgs but the code points to /img. Rename the folder to public/img.',
          '메뉴 이미지가 깨져: 폴더는 public/Imgs인데 코드는 /img를 가리켜. 폴더 이름을 public/img로 바꿔 줘.',
        ),
        ok: l('The images do not show. Fix them.', '이미지가 안 보여. 고쳐 줘.'),
        fixedReply: l('The folder name had the wrong case. Renamed to public/img and the photos load now.', '폴더 이름 대소문자가 틀렸어요. public/img로 바꾸니 사진이 잘 떠요.'),
        files: [
          { path: 'public/img/latte.jpg', mark: 'modified' },
          { path: 'public/img/croissant.jpg', mark: 'modified' },
        ],
      },
      {
        id: 'cta',
        title: l('Hidden order button', '숨어 있는 주문 버튼'),
        visibleIn: 'browser',
        great: l(
          "The 'click here' link is hidden at the bottom. Add a primary 'Order Ahead' button above the fold.",
          "'여기를 클릭' 링크가 맨 아래 숨어 있어. 첫 화면에 눈에 띄는 '미리 주문' 버튼을 넣어 줘.",
        ),
        ok: l('Make the order button easier to find.', '주문 버튼을 찾기 쉽게 해 줘.'),
        fixedReply: l('Added a bold "Order Ahead" button right in the hero.', '히어로 한가운데에 큼직한 "미리 주문" 버튼을 넣었어요.'),
        files: [{ path: 'index.html', mark: 'modified' }],
      },
      {
        id: 'secret',
        title: l('API key committed in .env', '.env에 API 키 커밋됨'),
        visibleIn: 'explorer',
        great: l(
          '.env with a payment key is committed. Remove it from git, add .env to .gitignore, and use .env.example instead.',
          '결제 키가 든 .env가 커밋돼 있어. git에서 빼고, .gitignore에 .env를 추가하고, 대신 .env.example을 써.',
        ),
        ok: l('Check the repo for security problems.', '저장소에 보안 문제 없는지 봐 줘.'),
        fixedReply: l(
          'Removed .env from version control, added .gitignore and .env.example. Rotate that key!',
          '.env를 버전 관리에서 빼고 .gitignore와 .env.example을 추가했어요. 그 키는 꼭 교체하세요!',
        ),
        files: [
          { path: '.gitignore', mark: 'new' },
          { path: '.env.example', mark: 'new' },
        ],
      },
      {
        id: 'contrast',
        title: l('Unreadable text', '읽을 수 없는 글씨'),
        visibleIn: 'browser',
        great: l(
          'Menu text is yellow on white and fails contrast. Use WCAG AA colors (4.5:1) for body text.',
          '메뉴 글씨가 흰 바탕에 노란색이라 대비가 부족해. 본문은 WCAG AA(4.5:1) 색으로 바꿔 줘.',
        ),
        ok: l('The text is hard to read.', '글씨가 잘 안 읽혀.'),
        fixedReply: l('Text colors now meet WCAG AA contrast.', '글씨 색이 이제 WCAG AA 대비 기준을 충족해요.'),
        files: [{ path: 'styles.css', mark: 'modified' }],
      },
    ],
    lateMails: [
      {
        at: 70,
        from: l('Mr. Park (Cafe Owner)', '박 사장님 (카페 사장)'),
        subject: l('Small change please', '작은 수정 부탁드려요'),
        body: l(
          'My daughter says the site needs our Instagram link (@beanthere) in the footer, and opening hours: 8am-8pm. Thanks!',
          '딸아이가 그러는데 하단에 인스타그램 링크(@beanthere)랑 영업시간(오전 8시~오후 8시)이 있어야 한대요. 고맙습니다!',
        ),
        issue: {
          id: 'footer',
          title: l('Instagram & hours in footer', '하단에 인스타그램과 영업시간'),
          visibleIn: 'mail',
          great: l(
            'Add a footer with opening hours (8am-8pm) and an Instagram link to @beanthere.',
            '영업시간(오전 8시~오후 8시)과 @beanthere 인스타그램 링크가 있는 하단 영역을 추가해 줘.',
          ),
          ok: l('Do what the client asked in the email.', '고객이 메일로 요청한 거 해 줘.'),
          fixedReply: l('Footer now shows opening hours and the Instagram link.', '이제 하단에 영업시간과 인스타그램 링크가 보여요.'),
          files: [{ path: 'index.html', mark: 'modified' }],
        },
      },
    ],
  },

  weather: {
    id: 'weather',
    name: 'weather-dash',
    branch: 'dashboard-v1',
    title: l('Weather Dashboard', '날씨 대시보드'),
    port: 3003,
    brief: {
      from: l('Jun (Data Team)', '준 (데이터팀)'),
      subject: l('Weather dashboard for the lobby TV', '로비 TV용 날씨 대시보드'),
      body: l(
        'Hey, can we get a weather dashboard for Seoul? Current temp in Celsius, plus a 5-day forecast. It runs on the lobby TV, so it should look nice.',
        '안녕하세요, 서울 날씨 대시보드 하나 만들어 주실 수 있나요? 현재 기온(섭씨)과 5일 예보요. 로비 TV에 띄울 거라 보기 좋아야 해요.',
      ),
    },
    buildChoices: [
      {
        label: l(
          'Build a weather dashboard for Seoul using the Open-Meteo API: current temp in Celsius and a 5-day forecast.',
          'Open-Meteo API로 서울 날씨 대시보드를 만들어 줘: 현재 기온(섭씨)과 5일 예보.',
        ),
        tier: 'great',
        seconds: 7,
        reply: l('Hooked up the API. Data is coming in at localhost:3003, but the UI is... raw.', 'API를 연결했어요. localhost:3003에 데이터는 들어오는데, UI가... 날것이에요.'),
      },
      {
        label: l('Weather thing please.', '날씨 그거 좀.'),
        tier: 'ok',
        seconds: 11,
        reply: l('Made a weather thing at localhost:3003. It shows weather. Technically.', 'localhost:3003에 날씨 그거 만들었어요. 날씨가 나오긴 해요. 기술적으로는요.'),
      },
      {
        label: l('Train our own weather prediction AI model first.', '먼저 우리만의 날씨 예측 AI 모델부터 학습시켜.'),
        tier: 'trap',
        seconds: 16,
        reply: l('The model predicts 300 degrees tomorrow. I fell back to an API. See localhost:3003.', '모델이 내일 300도라고 예측해서 API로 대체했어요. localhost:3003을 보세요.'),
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
        title: l('Raw JSON dump', 'JSON 그대로 출력'),
        visibleIn: 'browser',
        great: l(
          'The page just dumps raw JSON. Render it as a big current-temp card and a row of 5 forecast cards with icons.',
          '페이지가 JSON을 그대로 뿌리고 있어. 큰 현재 기온 카드와 아이콘 있는 예보 카드 5개로 보여 줘.',
        ),
        ok: l('Make the UI nicer.', 'UI 좀 예쁘게 해 줘.'),
        fixedReply: l('Replaced the JSON dump with a big current-temp card and 5 forecast cards.', 'JSON 출력을 큰 현재 기온 카드와 예보 카드 5개로 바꿨어요.'),
        files: [
          { path: 'src/components/Forecast.jsx', mark: 'new' },
          { path: 'src/App.jsx', mark: 'modified' },
        ],
      },
      {
        id: 'kelvin',
        title: l('Temperatures in Kelvin', '켈빈으로 표시되는 기온'),
        visibleIn: 'browser',
        great: l('Temperatures show in Kelvin (285.15K). Convert to Celsius and round to whole degrees.', '기온이 켈빈(285.15K)으로 나와. 섭씨로 바꾸고 정수로 반올림해 줘.'),
        ok: l('The numbers look weird.', '숫자가 이상해 보여.'),
        fixedReply: l('Converted Kelvin to Celsius. 285.15K is now 12°C, as it should be.', '켈빈을 섭씨로 바꿨어요. 285.15K가 이제 제대로 12°C로 나와요.'),
        files: [{ path: 'src/units.js', mark: 'new' }],
      },
      {
        id: 'deadcode',
        title: l('Duplicate dead files', '중복된 죽은 파일'),
        visibleIn: 'explorer',
        great: l(
          'There is a leftover src/final_final_v2.jsx that duplicates App.jsx. Delete it and remove unused imports.',
          'App.jsx를 복붙한 src/final_final_v2.jsx가 남아 있어. 지우고 안 쓰는 import도 정리해 줘.',
        ),
        ok: l('Clean up the project.', '프로젝트 정리 좀 해 줘.'),
        fixedReply: l('Deleted final_final_v2.jsx and pruned unused imports. Cleaner repo.', 'final_final_v2.jsx를 지우고 안 쓰는 import를 정리했어요. 저장소가 깔끔해졌어요.'),
      },
      {
        id: 'loading',
        title: l('Shows "undefined" while loading', '로딩 중 "undefined" 표시'),
        visibleIn: 'browser',
        great: l(
          "Before data arrives the page shows 'undefined'. Add a loading skeleton and a friendly error state if the API fails.",
          "데이터가 오기 전에 'undefined'가 보여. 로딩 스켈레톤을 넣고, API가 실패하면 친절한 에러 화면을 보여 줘.",
        ),
        ok: l('Handle errors better.', '에러 처리 좀 잘해 줘.'),
        fixedReply: l('Added a loading skeleton and an error message with a retry button.', '로딩 스켈레톤과 다시 시도 버튼이 있는 에러 메시지를 추가했어요.'),
        files: [{ path: 'src/components/Skeleton.jsx', mark: 'new' }],
      },
      {
        id: 'tvsize',
        title: l('Too small for a TV', 'TV에 비해 너무 작음'),
        visibleIn: 'mail',
        great: l(
          'It runs on a lobby TV: scale fonts up (current temp at least 120px), high contrast, auto-refresh every 10 minutes.',
          '로비 TV에 띄우는 거야: 글씨를 키우고(현재 기온은 최소 120px), 대비를 높이고, 10분마다 자동 새로고침해 줘.',
        ),
        ok: l('Make it bigger.', '더 크게 해 줘.'),
        fixedReply: l('Scaled everything for a TV across the room and added a 10-minute auto-refresh.', '멀리서 보는 TV에 맞게 전부 키우고 10분 자동 새로고침을 넣었어요.'),
        files: [{ path: 'src/App.jsx', mark: 'modified' }],
      },
    ],
  },
  rsvp: {
    id: 'rsvp',
    name: 'rsvp-form',
    branch: 'feature/rsvp',
    title: l('Meetup RSVP', '밋업 참가 신청'),
    port: 3004,
    brief: {
      from: l('Sora (Community)', '소라 (커뮤니티팀)'),
      subject: l('RSVP page for Friday’s meetup', '금요일 밋업 참가 신청 페이지'),
      body: l(
        'Hi! We need an RSVP page for Friday’s meetup: name, email and dietary needs. The room holds 40 people, so show how many seats are left. One of our regulars uses a screen reader, so every field must be properly labeled and announced.',
        '안녕하세요! 금요일 밋업 참가 신청 페이지가 필요해요: 이름, 이메일, 식단 요청. 방에 40명까지 들어가니 남은 자리를 보여 주세요. 단골 한 분이 스크린 리더를 쓰셔서, 모든 입력란에 제대로 된 라벨이 있고 읽혀야 해요.',
      ),
    },
    buildChoices: [
      {
        label: l(
          'Build an RSVP form with React: name, email, dietary needs, and a live "seats left" counter out of 40. No backend; keep RSVPs in local state.',
          'React로 참가 신청 폼을 만들어 줘: 이름, 이메일, 식단 요청, 그리고 40석 중 "남은 자리" 실시간 표시. 백엔드 없이 신청 내역은 로컬 state로.',
        ),
        tier: 'great',
        seconds: 7,
        reply: l('The form is live at localhost:3004. People can sign up! Try submitting it.', 'localhost:3004에 폼을 띄웠어요. 신청은 돼요! 한번 제출해 보세요.'),
      },
      {
        label: l('Make a signup page.', '신청 페이지 만들어 줘.'),
        tier: 'ok',
        seconds: 11,
        reply: l('Made a signup page at localhost:3004. It has a form.', 'localhost:3004에 신청 페이지를 만들었어요. 폼이 있어요.'),
      },
      {
        label: l('Build a full ticketing platform with payments, QR codes and a mobile app.', '결제, QR 코드, 모바일 앱까지 있는 티켓팅 플랫폼을 통째로 만들어 줘.'),
        tier: 'trap',
        seconds: 16,
        reply: l('The payment provider needs a business license. The form part works on localhost:3004.', '결제 대행사가 사업자 등록증을 요구해요. 폼 부분은 localhost:3004에서 돌아가요.'),
      },
    ],
    baseFiles: [
      { path: 'package.json' },
      { path: 'src/App.jsx' },
      { path: 'src/RsvpForm.jsx' },
      { path: 'data/attendees.csv', mark: 'warn' },
    ],
    issues: [
      {
        id: 'novalid',
        title: l('Empty form accepted', '빈 폼도 제출됨'),
        visibleIn: 'browser',
        great: l(
          'Submitting the empty form shows "Thanks, undefined!". Require name and a valid email, and show inline errors next to each field.',
          '빈 폼을 제출하면 "감사합니다, undefined!"가 떠. 이름과 올바른 이메일을 필수로 하고, 입력란마다 옆에 에러를 보여 줘.',
        ),
        ok: l('Add some validation.', '검증 좀 넣어 줘.'),
        fixedReply: l('Name and email are required now, with inline errors. No more "Thanks, undefined!".', '이제 이름과 이메일이 필수이고, 입력란 옆에 에러가 떠요. "감사합니다, undefined!"는 이제 없어요.'),
        files: [
          { path: 'src/validate.js', mark: 'new' },
          { path: 'src/RsvpForm.jsx', mark: 'modified' },
        ],
      },
      {
        id: 'overbook',
        title: l('Seats left goes negative', '남은 자리가 음수'),
        visibleIn: 'browser',
        great: l(
          'The counter says "-3 seats left" and still accepts RSVPs. Stop at 40 and switch the button to "Join the waitlist" when full.',
          '카운터가 "남은 자리 -3"인데도 계속 신청을 받아. 40명에서 막고, 꽉 차면 버튼을 "대기자 명단 등록"으로 바꿔 줘.',
        ),
        ok: l('The seat count is wrong.', '자리 수가 이상해.'),
        fixedReply: l('Capped RSVPs at 40. Once full, new people join a waitlist instead.', '신청을 40명으로 제한했어요. 꽉 차면 새 신청은 대기자 명단으로 가요.'),
        files: [{ path: 'src/RsvpForm.jsx', mark: 'modified' }],
      },
      {
        id: 'labels',
        title: l('Fields not labeled for screen readers', '스크린 리더용 라벨 없음'),
        visibleIn: 'mail',
        great: l(
          'Inputs only have placeholder text. Add a <label> for every field, link errors with aria-describedby, and announce success in an aria-live region.',
          '입력란에 placeholder만 있어. 모든 입력란에 <label>을 달고, 에러는 aria-describedby로 연결하고, 성공 메시지는 aria-live 영역으로 읽어 줘.',
        ),
        ok: l('Make it accessible.', '접근성 좀 챙겨 줘.'),
        fixedReply: l('Every field has a real label now, errors are linked, and the confirmation is announced.', '이제 모든 입력란에 진짜 라벨이 있고, 에러가 연결되고, 확인 메시지가 읽혀요.'),
        files: [{ path: 'src/RsvpForm.jsx', mark: 'modified' }],
      },
      {
        id: 'leak',
        title: l('Attendee emails committed to git', '참가자 이메일이 git에 커밋됨'),
        visibleIn: 'explorer',
        great: l(
          'data/attendees.csv has real attendee emails and is committed. Delete it, add data/ to .gitignore, and use made-up sample data instead.',
          'data/attendees.csv에 실제 참가자 이메일이 들어 있고 커밋까지 됐어. 지우고, data/를 .gitignore에 넣고, 가짜 샘플 데이터를 대신 써.',
        ),
        ok: l('Clean up the data folder.', 'data 폴더 정리 좀 해 줘.'),
        fixedReply: l('Removed attendees.csv, ignored data/, and added fake sample data for development.', 'attendees.csv를 지우고, data/를 무시하게 하고, 개발용 가짜 샘플 데이터를 넣었어요.'),
        files: [
          { path: '.gitignore', mark: 'new' },
          { path: 'src/sample-data.js', mark: 'new' },
        ],
      },
    ],
    lateMails: [
      {
        at: 60,
        from: l('Sora (Community)', '소라 (커뮤니티팀)'),
        subject: l('Change of plans: new venue!', '계획 변경: 장소가 바뀌었어요!'),
        body: l(
          'Sorry for the late change! We moved to a bigger hall: it’s now on Saturday at 2pm and holds 60 people. Can the page show the new date and capacity?',
          '갑자기 바꿔서 죄송해요! 더 큰 홀로 옮겼어요: 토요일 오후 2시로 바뀌었고 60명까지 들어가요. 페이지에 새 날짜와 정원을 반영해 주실 수 있나요?',
        ),
        issue: {
          id: 'venue',
          title: l('New date and capacity', '새 날짜와 정원'),
          visibleIn: 'mail',
          great: l(
            'The meetup moved: Saturday 2pm, capacity 60. Update the date in the header and make capacity a single config value used by the counter.',
            '밋업이 바뀌었어: 토요일 오후 2시, 정원 60명. 헤더의 날짜를 고치고, 정원은 카운터가 쓰는 설정값 하나로 빼 줘.',
          ),
          ok: l('The event details changed, update them.', '행사 정보가 바뀌었어, 반영해 줘.'),
          fixedReply: l('Updated to Saturday 2pm and moved capacity (now 60) into one config value.', '토요일 오후 2시로 고치고, 정원(이제 60명)을 설정값 하나로 뺐어요.'),
          files: [{ path: 'src/event.config.js', mark: 'new' }],
        },
      },
    ],
  },
}

export const STAGES: StageDef[] = [
  {
    id: 0,
    name: l('First Day at Work', '출근 첫날'),
    subtitle: l('Tutorial · 1 agent', '튜토리얼 · 에이전트 1개'),
    projects: ['todo'],
    blockChance: 0.25,
    par: 80,
    tutorial: true,
    lessons: [
      l('Start in the inbox: the client mail tells you what to build.', '받은 편지함부터: 고객 메일이 뭘 만들지 알려 줘요.'),
      l('○ idle = wasted time. ● yellow = working = good.', '○ 대기 = 시간 낭비. ● 노란색 = 작업 중 = 좋음.'),
      l('Check results in the Browser and Explorer to unlock ⭐ prompts.', '브라우저와 탐색기에서 결과를 확인하면 ⭐ 프롬프트가 열려요.'),
      l('Vague prompts are slow. Shortcut prompts come back to bite you.', '모호한 프롬프트는 느려요. 지름길 프롬프트는 나중에 발목을 잡아요.'),
    ],
  },
  {
    id: 1,
    name: l('Side Hustle', '부업'),
    subtitle: l('2 agents in parallel', '에이전트 2개 동시 운영'),
    projects: ['todo', 'cafe'],
    blockChance: 0.35,
    par: 120,
    lessons: [
      l('While one agent works, feed the other one.', '한 에이전트가 일하는 동안 다른 에이전트에게 일을 주세요.'),
      l('Red dot = the agent is waiting for your approval. Answer fast!', '빨간 점 = 에이전트가 승인을 기다리는 중. 빨리 답하세요!'),
      l('Read client mail: it unlocks sharp prompts too.', '고객 메일을 읽으세요: 정확한 프롬프트가 열려요.'),
    ],
  },
  {
    id: 2,
    name: l('Permission Hell', '권한 지옥'),
    subtitle: l('3 agents · lots of approvals', '에이전트 3개 · 승인 폭탄'),
    projects: ['todo', 'cafe', 'weather'],
    blockChance: 0.6,
    par: 160,
    lessons: [
      l('"Don\'t ask again" saves time... but read what you approve.', '"다시 묻지 않기"는 시간을 아껴 줘요... 하지만 뭘 승인하는지는 읽으세요.'),
      l('Never approve destructive commands blindly.', '파괴적인 명령은 절대 무작정 승인하지 마세요.'),
      l('Keep every dot yellow.', '모든 점을 노란색으로 유지하세요.'),
    ],
  },
  {
    id: 3,
    name: l('Crunch Time', '마감 직전'),
    subtitle: l('4 agents · plans change mid-shift', '에이전트 4개 · 근무 중 계획 변경'),
    projects: ['cafe', 'rsvp', 'weather', 'todo'],
    blockChance: 0.45,
    par: 195,
    lessons: [
      l('Four agents: press N to jump to whoever needs you.', '에이전트 4개: N을 눌러 손이 필요한 에이전트로 바로 가세요.'),
      l('Clients change their minds. Watch the inbox for new mail.', '고객은 마음을 바꿔요. 새 메일이 오는지 받은 편지함을 지켜보세요.'),
      l('A secret or personal data in the repo is a bug too: check the Explorer.', '저장소에 든 비밀번호나 개인정보도 버그예요: 탐색기를 확인하세요.'),
    ],
  },
]
