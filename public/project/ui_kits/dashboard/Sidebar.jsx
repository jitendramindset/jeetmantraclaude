// JeetMantra Dashboard — Sidebar + Shell
const { useState } = React;

const NAV_ITEMS = [
  { id: 'home',       label: 'Overview',   icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { id: 'courses',    label: 'My Courses', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
  { id: 'attendance', label: 'Attendance', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { id: 'wallet',     label: 'Wallet',     icon: 'M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 1 0-4h14' },
  { id: 'profile',    label: 'Profile',    icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
];

function Icon({ d, size = 20, stroke = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Sidebar({ screen, setScreen }) {
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="../../assets/logo.png" alt="JeetMantra" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Jeet<span style={{ color: '#f97316' }}>Mantra</span>
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Student Portal</div>
          </div>
        </div>
      </div>

      {/* Student avatar */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 16, flexShrink: 0 }}>R</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Rahul Kumar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>JEE 2025 · Class XI</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 12px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
              color: active ? '#f97316' : 'rgba(255,255,255,0.55)',
              fontSize: 14, fontWeight: active ? 700 : 500, fontFamily: 'inherit',
              marginBottom: 2, transition: 'all 150ms', textAlign: 'left',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <Icon d={item.icon} size={18} stroke={active ? '#f97316' : 'rgba(255,255,255,0.45)'} />
              {item.label}
              {item.id === 'wallet' && <span style={{ marginLeft: 'auto', background: '#22c55e', color: 'white', borderRadius: 9999, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>+₹250</span>}
            </button>
          );
        })}
      </nav>

      {/* Upgrade nudge */}
      <div style={{ margin: 12, background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(251,191,36,0.10))', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 12, padding: '16px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 4 }}>Refer & Earn ₹250</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 12 }}>Share your code. Earn every time a friend joins.</div>
        <button onClick={() => setScreen('wallet')} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>Share My Code</button>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar, Icon, NAV_ITEMS });
