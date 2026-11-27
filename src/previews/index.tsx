import type { CSSProperties, ReactNode } from 'react'
import type { Lang } from '../i18n'

export interface PreviewProps {
  open: string[]
  fixed: string[]
  polish: number
  lang: Lang
}

const has = (list: string[], id: string) => list.includes(id)

function ConsoleStrip({ lines }: { lines: string[] }) {
  if (!lines.length) return null
  return (
    <div className="pv-console">
      {lines.map((l) => (
        <div key={l}>⚠ {l}</div>
      ))}
    </div>
  )
}

/* ---------------- Todo ---------------- */
function TodoPreview({ open, fixed, lang }: PreviewProps) {
  const ko = lang === 'ko'
  const ugly = has(open, 'ugly')
  const noDelete = has(open, 'nodelete')
  const mobile = has(open, 'mobile')
  const persist = has(open, 'persist')
  const tasks = [
    { t: ko ? '귀리 우유 사기' : 'Buy oat milk', done: true },
    { t: ko ? 'PR #42 리뷰' : 'Review PR #42', done: false },
    { t: ko ? '사무실 화분 물 주기' : 'Water the office plant', done: false },
  ]
  const wrap: CSSProperties = ugly
    ? { fontFamily: '"Comic Sans MS", "Comic Sans", cursive', background: 'linear-gradient(90deg,#ff00ff,#00ffff)', color: '#39ff14', minHeight: '100%', padding: 12 }
    : { fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: '#f4f5f7', color: '#1f2933', minHeight: '100%', padding: 24 }
  const card: CSSProperties = ugly
    ? { background: '#ffff00', border: '5px dashed red', padding: 8, width: mobile ? 820 : undefined }
    : { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.08)', maxWidth: mobile ? undefined : 480, width: mobile ? 820 : undefined, margin: '0 auto' }
  return (
    <div style={{ ...wrap, overflowX: 'auto' }}>
      <div style={card}>
        <h1 style={ugly ? { fontSize: 34, textShadow: '3px 3px 0 #f00', margin: 0, color: '#ff0080' } : { fontSize: 22, margin: '0 0 12px', fontWeight: 600 }}>
          {ugly ? (ko ? '내 할 일!!!!!' : 'MY TODOS!!!!!') : ko ? '팀 할 일' : 'Team Todos'}
        </h1>
        <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
          <input
            readOnly
            placeholder={ko ? '무엇을 해야 하나요?' : 'What needs doing?'}
            style={ugly ? { width: 90, border: '3px solid blue' } : { flex: 1, padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: 8, fontSize: 14 }}
          />
          <button style={ugly ? { background: 'red', color: 'yellow', fontSize: 10 } : { background: '#4f46e5', color: '#fff', border: 0, borderRadius: 8, padding: '0 16px', minHeight: 40, fontWeight: 600 }}>
            {ugly ? (ko ? '추가!!' : 'ADD!!') : ko ? '추가' : 'Add'}
          </button>
        </div>
        {tasks.map((task) => (
          <div
            key={task.t}
            style={
              ugly
                ? { display: 'flex', gap: 30, alignItems: 'center', borderBottom: '2px dotted purple', padding: 2 }
                : { display: 'flex', gap: 10, alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #eef0f3', minHeight: 44 }
            }
          >
            <input type="checkbox" readOnly checked={task.done} />
            <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : undefined, opacity: task.done && !ugly ? 0.5 : 1 }}>{task.t}</span>
            {!noDelete && <button style={ugly ? {} : { border: 0, background: 'transparent', color: '#9aa4b2', fontSize: 16 }}>✕</button>}
          </div>
        ))}
        {noDelete && <div style={{ fontSize: 11, marginTop: 6, color: ugly ? '#000' : '#c00' }}>// TODO: {ko ? '삭제 기능 구현 ㅋㅋ' : 'implement delete lol'}</div>}
        {!noDelete && (
          <div style={{ fontSize: 12, marginTop: 10, color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
            <span>{ko ? '2개 남음' : '2 items left'}</span>
            <span style={{ textDecoration: 'underline' }}>{ko ? '완료 항목 지우기' : 'Clear completed'}</span>
          </div>
        )}
        {has(fixed, 'persist') && <div style={{ fontSize: 11, color: '#10b981', marginTop: 8 }}>✓ {ko ? '로컬에 저장됨' : 'Saved locally'}</div>}
      </div>
      <ConsoleStrip lines={[...(persist ? [ko ? '할 일이 저장되지 않음: 새로고침 = 데이터 손실' : 'Tasks are not persisted: refresh = data loss'] : []), ...(mobile ? [ko ? '레이아웃이 화면을 넘침 (820px 고정 너비)' : 'Layout overflows viewport (820px fixed width)'] : [])]} />
    </div>
  )
}

/* ---------------- Cafe ---------------- */
function CafePreview({ open, fixed, lang }: PreviewProps) {
  const ko = lang === 'ko'
  const flashy = has(open, 'flashy')
  const broken = has(open, 'images')
  const cta = has(open, 'cta')
  const contrast = has(open, 'contrast')
  const footer = has(fixed, 'footer')
  const menu = [
    { name: ko ? '라테' : 'Latte', price: ko ? '₩5,500' : '$4.5', emoji: '☕', img: 'latte.jpg' },
    { name: ko ? '크루아상' : 'Croissant', price: ko ? '₩4,800' : '$3.8', emoji: '🥐', img: 'croissant.jpg' },
  ]
  return (
    <div style={{ fontFamily: flashy ? 'Impact, "Arial Black", sans-serif' : 'Georgia, "Times New Roman", serif', background: flashy ? 'repeating-linear-gradient(45deg,#ff0,#ff0 10px,#f0f 10px,#f0f 20px)' : '#faf6f0', minHeight: '100%', color: '#3b2a1f' }}>
      {flashy ? (
        <div style={{ padding: 10, textAlign: 'center' }}>
          <div className="pv-marquee">{ko ? '☕☕ BEAN THERE에 오신 걸 환영합니다!!! 우주 최고의 커피!!! ☕☕' : '☕☕ WELCOME TO BEAN THERE!!! BEST COFFEE IN THE UNIVERSE!!! ☕☕'}</div>
          <h1 className="pv-rainbow" style={{ fontSize: 44, margin: '8px 0' }}>BEAN THERE</h1>
          <div style={{ background: '#0f0', display: 'inline-block', padding: 4, transform: 'rotate(-4deg)' }}>🔥🔥 {ko ? '핫 핫 핫' : 'HOT HOT HOT'} 🔥🔥</div>
          {!cta && <div><button className="pv-cta-flashy">{ko ? '지금 주문!!!' : 'ORDER NOW!!!'}</button></div>}
        </div>
      ) : (
        <div style={{ padding: '36px 24px', background: 'linear-gradient(rgba(59,42,31,.55),rgba(59,42,31,.55)), radial-gradient(circle at 30% 30%,#c08a5b,#5a3b28)', color: '#fff7ec', textAlign: 'center' }}>
          <div style={{ letterSpacing: 4, fontSize: 11, opacity: 0.8 }}>EST. 2019 · SEOUL</div>
          <h1 style={{ fontSize: 34, margin: '8px 0', fontWeight: 400 }}>Bean There</h1>
          <p style={{ margin: 0, opacity: 0.85, fontStyle: 'italic' }}>{ko ? '바쁜 사람들을 위한 느린 커피.' : 'Slow coffee for busy people.'}</p>
          {!cta && <button style={{ marginTop: 16, background: '#e8b46a', color: '#3b2a1f', border: 0, borderRadius: 999, padding: '10px 22px', fontWeight: 700, fontFamily: 'system-ui' }}>{ko ? '미리 주문' : 'Order Ahead'}</button>}
        </div>
      )}
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: flashy ? 26 : 18, color: contrast ? '#ffff66' : '#3b2a1f', background: flashy ? undefined : undefined }}>
          {flashy ? (ko ? '메뉴!!!' : 'MENU!!!') : ko ? '메뉴' : 'Our Menu'}
        </h2>
        <div style={{ display: 'flex', gap: 12, background: contrast ? '#fff' : undefined, padding: contrast ? 8 : 0 }}>
          {menu.map((m) => (
            <div key={m.name} style={{ flex: 1, background: '#fff', borderRadius: flashy ? 0 : 10, overflow: 'hidden', border: flashy ? '4px ridge orange' : '1px solid #eadfce' }}>
              {broken ? (
                <div className="pv-broken-img">
                  <span>🖼̸</span> {m.img}
                </div>
              ) : (
                <div style={{ height: 70, display: 'grid', placeItems: 'center', fontSize: 38, background: 'linear-gradient(135deg,#f3e3cf,#d9b48f)' }}>{m.emoji}</div>
              )}
              <div style={{ padding: 8, color: contrast ? '#ffee77' : '#3b2a1f', display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.name}</span>
                <span>{m.price}</span>
              </div>
            </div>
          ))}
        </div>
        {cta && <div style={{ fontSize: 9, marginTop: 30, color: '#999' }}>{ko ? '미리 주문하려면 ' : 'to order ahead '}<u>{ko ? '여기를 클릭' : 'click here'}</u></div>}
      </div>
      {footer && (
        <div style={{ borderTop: '1px solid #eadfce', padding: '10px 16px', fontSize: 12, display: 'flex', justifyContent: 'space-between', color: '#6b5444', fontFamily: 'system-ui' }}>
          <span>{ko ? '매일 오전 8시–오후 8시' : 'Open daily 8am–8pm'}</span>
          <span>📷 @beanthere</span>
        </div>
      )}
      <ConsoleStrip lines={broken ? ['GET /img/latte.jpg 404 (Not Found)', 'GET /img/croissant.jpg 404 (Not Found)'] : []} />
    </div>
  )
}

/* ---------------- Weather ---------------- */
function WeatherPreview({ open, lang }: PreviewProps) {
  const ko = lang === 'ko'
  const raw = has(open, 'raw')
  const kelvin = has(open, 'kelvin')
  const loading = has(open, 'loading')
  const small = has(open, 'tvsize')
  const days = [
    { d: ko ? '월' : 'Mon', k: 285.15, i: '☀️' },
    { d: ko ? '화' : 'Tue', k: 283.15, i: '⛅' },
    { d: ko ? '수' : 'Wed', k: 280.15, i: '🌧' },
    { d: ko ? '목' : 'Thu', k: 282.15, i: '⛅' },
    { d: ko ? '금' : 'Fri', k: 286.15, i: '☀️' },
  ]
  const t = (k: number) => (kelvin ? `${k.toFixed(2)}K` : `${Math.round(k - 273.15)}°C`)
  if (raw) {
    return (
      <div style={{ fontFamily: 'Times New Roman, serif', padding: 8, background: '#fff', minHeight: '100%' }}>
        <h3 style={{ margin: '0 0 4px' }}>{ko ? '날씨' : 'Weather'}</h3>
        {loading && <div>{ko ? '기온' : 'Temperature'}: undefined</div>}
        <pre style={{ fontSize: 10, margin: 0, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ city: 'Seoul', current: { temp: kelvin ? 285.15 : 12, wind: 3.4, code: 1 }, daily: days.map((d) => ({ day: d.d, temp: kelvin ? d.k : Math.round(d.k - 273.15) })) }, null, 1)}
        </pre>
      </div>
    )
  }
  const scale = small ? 0.6 : 1
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: small ? '#dfe6ee' : 'linear-gradient(160deg,#0f172a,#1e3a8a)', color: small ? '#334' : '#fff', minHeight: '100%', padding: 16 * scale }}>
      <div style={{ fontSize: 14 * scale, opacity: 0.8 }}>{ko ? '서울 · 현재' : 'Seoul · Now'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 64 * scale }}>☀️</span>
        <span style={{ fontSize: (small ? 40 : 84) * scale, fontWeight: 700 }}>{loading ? 'undefined' : t(285.15)}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 * scale, marginTop: 12 }}>
        {days.map((d, i) => (
          <div key={d.d} style={{ flex: 1, background: small ? '#fff' : 'rgba(255,255,255,.12)', borderRadius: 10, padding: 8 * scale, textAlign: 'center', fontSize: 14 * scale }}>
            <div style={{ opacity: 0.8 }}>{d.d}</div>
            <div style={{ fontSize: 26 * scale }}>{d.i}</div>
            <div style={{ fontWeight: 600 }}>{loading && i === 2 ? 'undefined' : t(d.k)}</div>
          </div>
        ))}
      </div>
      {!small && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 10 }}>{ko ? '10분마다 자동 새로고침' : 'Auto-refresh every 10 min'}</div>}
    </div>
  )
}

/* ---------------- RSVP ---------------- */
function RsvpPreview({ open, fixed, lang }: PreviewProps) {
  const ko = lang === 'ko'
  const novalid = has(open, 'novalid')
  const overbook = has(open, 'overbook')
  const labels = has(open, 'labels')
  const moved = has(fixed, 'venue')
  const cap = moved ? 60 : 40
  const left = overbook ? -3 : moved ? 21 : 1
  const fields = [
    { id: 'name', label: ko ? '이름' : 'Name', ph: ko ? '이름' : 'name' },
    { id: 'email', label: ko ? '이메일' : 'Email', ph: ko ? '이메일' : 'email' },
    { id: 'diet', label: ko ? '식단 요청 (선택)' : 'Dietary needs (optional)', ph: ko ? '식단?' : 'diet?' },
  ]
  const full = !overbook && left <= 0
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: labels ? '#fff' : '#f5f3ff', minHeight: '100%', color: '#1e1b4b' }}>
      <div style={{ padding: '18px 20px', background: labels ? '#ddd' : 'linear-gradient(120deg,#4f46e5,#7c3aed)', color: labels ? '#555' : '#fff' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.8 }}>{ko ? '프론트엔드 밋업' : 'FRONTEND MEETUP'}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          {moved ? (ko ? '토요일 오후 2시 · 큰 홀' : 'Saturday 2pm · Main Hall') : ko ? '금요일 오후 7시 · 3층 회의실' : 'Friday 7pm · Room 3F'}
        </div>
        <div style={{ marginTop: 6, fontWeight: 600, color: overbook ? '#ff4d4d' : undefined }}>
          {ko ? `남은 자리 ${left} / ${cap}` : `${left} of ${cap} seats left`}
        </div>
      </div>
      <div style={{ padding: 20, maxWidth: 360 }}>
        {novalid && <div style={{ background: '#dcfce7', padding: 8, marginBottom: 10, fontSize: 13 }}>✅ {ko ? '감사합니다, undefined!' : 'Thanks, undefined!'}</div>}
        {fields.map((f) => (
          <div key={f.id} style={{ marginBottom: 10 }}>
            {!labels && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{f.label}</label>}
            <div style={{ border: `1px solid ${labels ? '#ccc' : '#c7d2fe'}`, borderRadius: labels ? 0 : 8, padding: '7px 9px', fontSize: 13, color: '#9ca3af', background: '#fff' }}>
              {labels ? f.ph : ''}
            </div>
          </div>
        ))}
        <button style={{ border: 0, borderRadius: labels ? 0 : 999, padding: '9px 18px', fontWeight: 700, background: labels ? '#e5e5e5' : '#4f46e5', color: labels ? '#333' : '#fff' }}>
          {full ? (ko ? '대기자 명단 등록' : 'Join the waitlist') : ko ? '참가 신청' : 'RSVP'}
        </button>
      </div>
      <ConsoleStrip lines={overbook ? [ko ? 'seatsLeft가 0 미만인데 신청을 받았음' : 'Accepted RSVP while seatsLeft < 0'] : []} />
    </div>
  )
}

export const PREVIEWS: Record<string, (p: PreviewProps) => ReactNode> = {
  todo: TodoPreview,
  cafe: CafePreview,
  weather: WeatherPreview,
  rsvp: RsvpPreview,
}
