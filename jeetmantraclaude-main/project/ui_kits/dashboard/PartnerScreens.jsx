// JeetMantra — Partner Dashboard Screens
const { useState } = React;

// ── Partner Sidebar ───────────────────────────────────────────────────
function PartnerSidebar({ screen, setScreen, setRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [
    { id: 'home',       label: 'Overview',       icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: 'bookings',   label: 'Bookings',       icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { id: 'attendance', label: 'Take Attendance',icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { id: 'services',   label: 'My Services',    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { id: 'live',       label: 'Live Session',   icon: 'M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z' },
    { id: 'payments',   label: 'Payments',       icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'references', label: 'References',     icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  ];

  const SidebarContent = () => (
    <aside style={{ width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="../../assets/logo.png" alt="JeetMantra" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>Jeet<span style={{ color: '#f97316' }}>Mantra</span></div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Partner Portal</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0 }}>CS</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>CodeSpark Academy</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>AI & Coding · Verified ✓</div>
        </div>
      </div>
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        {items.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => { setScreen(item.id); setMobileOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: active ? 'rgba(249,115,22,0.15)' : 'transparent', color: active ? '#f97316' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'inherit', marginBottom: 2, transition: 'all 150ms', textAlign: 'left' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={active ? '#f97316' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
              {item.label}
              {item.id === 'bookings' && <span style={{ marginLeft: 'auto', background: '#f97316', color: 'white', borderRadius: 9999, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>5</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => setRole(null)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 9, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>← Switch Role</button>
      </div>
    </aside>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(o => !o)} className="hamburger" style={{ display: 'none', position: 'fixed', top: 12, left: 12, zIndex: 300, background: '#0f172a', border: 'none', borderRadius: 8, padding: 10, cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div style={{ flexShrink: 0, width: 240, minHeight: '100vh', position: 'sticky', top: 0 }} className="sidebar-desktop">
        <SidebarContent />
      </div>
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ width: 240, height: '100%' }}><SidebarContent /></div>
          <div onClick={() => setMobileOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}></div>
        </div>
      )}
    </>
  );
}

// ── Partner Overview ──────────────────────────────────────────────────
function PartnerHome({ setScreen }) {
  const todayBookings = [
    { student: 'Rahul Kumar', service: 'Python Basics', time: '9:00 AM', duration: '1 hr', status: 'confirmed', color: '#7c3aed' },
    { student: 'Priya Singh', service: 'AI Workshop', time: '11:00 AM', duration: '2 hr', status: 'confirmed', color: '#3b82f6' },
    { student: 'Sneha Gupta', service: 'Web Dev Intro', time: '2:00 PM', duration: '1 hr', status: 'pending', color: '#f97316' },
    { student: 'Rohan Jha', service: 'Python Basics', time: '4:00 PM', duration: '1 hr', status: 'confirmed', color: '#7c3aed' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Welcome, CodeSpark! 🚀</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Monday, April 25 · 4 sessions today</p>
        </div>
        <button onClick={() => setScreen('live')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 16px rgba(239,68,68,0.35)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'inline-block' }}></span>
          Start Live Session
        </button>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="stats-grid">
        {[
          { label: 'Bookings Today', value: '4', sub: '5 pending this week', icon: 'M8 6h13M8 12h13M8 18h13', bg: '#fff7ed', color: '#f97316', trend: 20 },
          { label: 'Active Students', value: '182', sub: 'This month', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', bg: '#f0fdfa', color: '#0d9488', trend: 8 },
          { label: 'Monthly Revenue', value: '₹36,400', sub: 'April 2025', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', bg: '#f0fdf4', color: '#22c55e', trend: 15 },
          { label: 'Avg. Rating', value: '4.8★', sub: '96 reviews', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', bg: '#fffbeb', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round"><path d={s.icon}/></svg>
              </div>
              {s.trend && <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', borderRadius: 9999, padding: '2px 8px' }}>↑ {s.trend}%</span>}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Today's bookings */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Today's Bookings</div>
          <button onClick={() => setScreen('bookings')} style={{ fontSize: 12, fontWeight: 600, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All Bookings →</button>
        </div>
        {todayBookings.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < todayBookings.length - 1 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: b.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: b.color, fontSize: 15, flexShrink: 0 }}>{b.student[0]}</div>
            <div style={{ flex: 1, minWidth: 130 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.student}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{b.service} · {b.time} · {b.duration}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: b.status === 'confirmed' ? '#22c55e' : '#f59e0b', background: b.status === 'confirmed' ? '#f0fdf4' : '#fffbeb', borderRadius: 9999, padding: '3px 10px' }}>{b.status}</span>
            <button onClick={() => setScreen('attendance')} style={{ background: b.color, color: 'white', border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Mark Attendance</button>
          </div>
        ))}
      </div>
      {/* Revenue strip */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 16, padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {[['₹36,400','April Revenue','#f97316'],['₹1,82,000','Total Revenue','#0d9488'],['₹8,200','Pending Payout','#fbbf24']].map(([v,l,c]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Partner Bookings ──────────────────────────────────────────────────
function PartnerBookings({ setScreen }) {
  const [filter, setFilter] = useState('All');
  const bookings = [
    { student: 'Rahul Kumar', service: 'Python Basics', date: 'Today', time: '9:00 AM', duration: '1 hr', rate: '₹199', status: 'Confirmed' },
    { student: 'Priya Singh', service: 'AI Workshop', date: 'Today', time: '11:00 AM', duration: '2 hr', rate: '₹398', status: 'Confirmed' },
    { student: 'Sneha Gupta', service: 'Web Dev Intro', date: 'Today', time: '2:00 PM', duration: '1 hr', rate: '₹199', status: 'Pending' },
    { student: 'Rohan Jha', service: 'Python Basics', date: 'Today', time: '4:00 PM', duration: '1 hr', rate: '₹199', status: 'Confirmed' },
    { student: 'Arjun Mehta', service: 'AI Workshop', date: 'Tomorrow', time: '10:00 AM', duration: '2 hr', rate: '₹398', status: 'Confirmed' },
    { student: 'Kavya Sharma', service: 'Python Basics', date: 'Tomorrow', time: '3:00 PM', duration: '1 hr', rate: '₹199', status: 'Cancelled' },
    { student: 'Amit Verma', service: 'Web Dev Intro', date: 'Apr 27', time: '5:00 PM', duration: '1 hr', rate: '₹199', status: 'Confirmed' },
  ];
  const statColors = { Confirmed: '#22c55e', Pending: '#f59e0b', Cancelled: '#ef4444' };
  const statBg = { Confirmed: '#f0fdf4', Pending: '#fffbeb', Cancelled: '#fef2f2' };
  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Bookings</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All','Confirmed','Pending','Cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ border: filter === f ? 'none' : '1.5px solid #e5e7eb', borderRadius: 9999, padding: '7px 18px', fontSize: 12, fontWeight: 700, background: filter === f ? '#f97316' : 'white', color: filter === f ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>{f}</button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e5e7eb' }}>
                {['Student','Service','Date & Time','Duration','Amount','Status','Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{b.student[0]}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{b.student}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{b.service}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151' }}>{b.date} · {b.time}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151' }}>{b.duration}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.rate}</td>
                  <td style={{ padding: '13px 16px' }}><span style={{ fontSize: 11, fontWeight: 700, color: statColors[b.status], background: statBg[b.status], borderRadius: 9999, padding: '3px 10px' }}>{b.status}</span></td>
                  <td style={{ padding: '13px 16px' }}>
                    {b.status !== 'Cancelled' && <button onClick={() => setScreen('attendance')} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Attend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Partner Attendance ────────────────────────────────────────────────
function PartnerAttendance() {
  const [session, setSession] = useState(0);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const sessions = ['Python Basics · Today 9:00 AM', 'AI Workshop · Today 11:00 AM', 'Web Dev Intro · Today 2:00 PM'];
  const students = [
    { id: 1, name: 'Rahul Kumar', id_no: 'JM-001' },
    { id: 2, name: 'Priya Singh', id_no: 'JM-002' },
    { id: 3, name: 'Rohan Jha', id_no: 'JM-003' },
    { id: 4, name: 'Sneha Gupta', id_no: 'JM-004' },
    { id: 5, name: 'Arjun Mehta', id_no: 'JM-005' },
    { id: 6, name: 'Kavya Sharma', id_no: 'JM-006' },
  ];
  const toggle = (id, val) => setAttendance(a => ({ ...a, [id]: val }));
  const presentCount = Object.values(attendance).filter(v => v === 'P').length;

  if (submitted) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Attendance Submitted!</h2>
      <p style={{ fontSize: 14, color: '#64748b' }}>{presentCount} of {students.length} students marked present</p>
      <button onClick={() => { setSubmitted(false); setAttendance({}); }} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 9, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Take Another</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Take Attendance</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {sessions.map((s, i) => (
          <button key={i} onClick={() => { setSession(i); setAttendance({}); }} style={{ border: session === i ? 'none' : '1.5px solid #e5e7eb', borderRadius: 9999, padding: '8px 16px', fontSize: 12, fontWeight: 700, background: session === i ? '#f97316' : 'white', color: session === i ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>{s}</button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{sessions[session].split('·')[0].trim()}<span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginLeft: 8 }}>{presentCount}/{students.length} present</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { const a = {}; students.forEach(s => a[s.id] = 'P'); setAttendance(a); }} style={{ background: '#f0fdf4', color: '#22c55e', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>All Present</button>
            <button onClick={() => { const a = {}; students.forEach(s => a[s.id] = 'A'); setAttendance(a); }} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>All Absent</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
          {students.map(s => {
            const status = attendance[s.id];
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${status === 'P' ? '#bbf7d0' : status === 'A' ? '#fecaca' : '#e5e7eb'}`, background: status === 'P' ? '#f0fdf4' : status === 'A' ? '#fef2f2' : '#f9fafb', transition: 'all 150ms' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: status === 'P' ? '#22c55e' : status === 'A' ? '#ef4444' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: status ? 'white' : '#9ca3af', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.id_no}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggle(s.id, 'P')} style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: status === 'P' ? '#22c55e' : '#e5e7eb', color: status === 'P' ? 'white' : '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 150ms' }}>P</button>
                  <button onClick={() => toggle(s.id, 'A')} style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: status === 'A' ? '#ef4444' : '#e5e7eb', color: status === 'A' ? 'white' : '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 150ms' }}>A</button>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setSubmitted(true)} style={{ width: '100%', background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 18, boxShadow: '0 0 16px rgba(249,115,22,0.3)' }}>Submit Attendance →</button>
      </div>
    </div>
  );
}

// ── Partner Services ──────────────────────────────────────────────────
function PartnerServices() {
  const [showCreate, setShowCreate] = useState(false);
  const services = [
    { name: 'Python Basics', type: 'Online Course', category: 'AI & Coding', hourly: '₹199', daily: '₹999', students: 42, sessions: 'Weekdays', level: 'Beginner', color: '#7c3aed' },
    { name: 'AI Workshop', type: 'Short-term Workshop', category: 'AI & Coding', hourly: '₹299', daily: '₹1,499', students: 28, sessions: 'Weekends', level: 'Intermediate', color: '#3b82f6' },
    { name: 'Web Dev Full Course', type: 'Certification', category: 'AI & Coding', hourly: '₹249', daily: '₹1,199', students: 35, sessions: 'Mon·Wed·Fri', level: 'Beginner–Advanced', color: '#0d9488' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>My Services</h1>
        <button onClick={() => setShowCreate(s => !s)} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{showCreate ? '← Back' : '+ Add Service'}</button>
      </div>

      {!showCreate ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
          {services.map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{s.name}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ background: s.color + '14', color: s.color, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.type}</span>
                <span style={{ background: '#f4f6f8', color: '#64748b', borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s.level}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>HOURLY</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e' }}>{s.hourly}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>DAILY</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>{s.daily}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>📅 {s.sessions} · 👥 {s.students} students</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, background: s.color, color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                <button style={{ flex: 1, background: '#f4f6f8', color: '#374151', border: 'none', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Pause</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Add New Service</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
            {[['Service Name','text','e.g. Python for Beginners'],['Category','select'],['Type','select2'],['Target Age Group','select3'],['Level','select4'],['Sessions per Week','number','3'],['Hourly Rate (₹)','number','199'],['Daily Rate (₹)','number','999'],['Max Students','number','20']].map(([l,t,p]) => (
              <div key={l}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{l}</label>
                {t === 'select' ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                    <option>AI & Coding</option><option>Sports & Fitness</option><option>Music & Arts</option><option>Dance</option><option>Yoga / Wellness</option><option>Other</option>
                  </select>
                : t === 'select2' ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                    <option>Short-term Workshop</option><option>Certification Course</option><option>Long-term Program</option><option>One-on-One Session</option><option>Online / Virtual</option>
                  </select>
                : t === 'select3' ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                    <option>Children (Under 10)</option><option>Teens (10–18)</option><option>Adults (18+)</option><option>All Ages</option>
                  </select>
                : t === 'select4' ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option>
                  </select>
                : <input type={t === 'number' ? 'number' : 'text'} placeholder={p} style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none' }} onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />}
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Description</label>
              <textarea rows={3} placeholder="Describe what students will learn or experience…" style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', resize: 'vertical' }} onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
            </div>
          </div>
          <button onClick={() => setShowCreate(false)} style={{ width: '100%', background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 20, boxShadow: '0 0 16px rgba(249,115,22,0.3)' }}>Submit Service for Approval →</button>
        </div>
      )}
    </div>
  );
}

// ── Partner Live Session ──────────────────────────────────────────────
function PartnerLive() {
  const [live, setLive] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Live Session</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="live-grid">
        <div style={{ background: live ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', textAlign: 'center', transition: 'all 300ms' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: live ? 'rgba(255,255,255,0.2)' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={live ? 'white' : '#ef4444'} strokeWidth="2" strokeLinecap="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: live ? 'white' : '#0f172a', marginBottom: 8 }}>{live ? '🔴 Session is LIVE' : 'Start Live Session'}</h3>
          <p style={{ fontSize: 13, color: live ? 'rgba(255,255,255,0.75)' : '#64748b', marginBottom: 22, lineHeight: 1.6 }}>{live ? 'Students can now join your session.' : 'Start a live training session for your booked students.'}</p>
          {live && <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontFamily: 'monospace', fontSize: 13, color: 'white' }}>jeetmantra.in/live/codespark-12</div>}
          <button onClick={() => setLive(l => !l)} style={{ background: live ? 'rgba(255,255,255,0.2)' : '#ef4444', color: 'white', border: live ? '1.5px solid rgba(255,255,255,0.4)' : 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: live ? 'none' : '0 0 20px rgba(239,68,68,0.4)' }}>
            {live ? 'End Session' : 'Go Live Now'}
          </button>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 18 }}>Schedule a Session</h3>
          {[['Service', 'select'], ['Date', 'date'], ['Time', 'time'], ['Duration (min)', 'number']].map(([l, t]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{l}</label>
              {t === 'select'
                ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                    <option>Python Basics</option><option>AI Workshop</option><option>Web Dev Full Course</option>
                  </select>
                : <input type={t} style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', outline: 'none' }} onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
              }
            </div>
          ))}
          <button style={{ width: '100%', background: '#f97316', color: 'white', border: 'none', borderRadius: 9, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>Schedule Session</button>
        </div>
      </div>
    </div>
  );
}

// ── Partner Payments ──────────────────────────────────────────────────
function PartnerPayments() {
  const txns = [
    { label: 'Python Basics — April sessions', amount: '₹14,200', date: 'Apr 24', type: 'credit' },
    { label: 'AI Workshop — April', amount: '₹11,600', date: 'Apr 22', type: 'credit' },
    { label: 'Web Dev Course — April', amount: '₹12,400', date: 'Apr 20', type: 'credit' },
    { label: 'Platform Fee (8%)', amount: '−₹3,056', date: 'Apr 20', type: 'debit' },
    { label: 'Withdrawal to Bank', amount: '−₹30,000', date: 'Apr 15', type: 'debit' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Payments</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="pay-grid">
        {[['₹36,400','This Month','#f97316'],['₹1,82,000','Total Revenue','#0d9488'],['₹8,200','Pending Payout','#fbbf24']].map(([v,l,c]) => (
          <div key={l} style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Transactions</div>
          <button style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Withdraw</button>
        </div>
        {txns.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < txns.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: t.type === 'credit' ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.type === 'credit' ? '#22c55e' : '#ef4444'} strokeWidth="3" strokeLinecap="round"><line x1="12" y1={t.type === 'credit' ? '19' : '5'} x2="12" y2={t.type === 'credit' ? '5' : '19'}/><polyline points={t.type === 'credit' ? '5 12 12 5 19 12' : '19 12 12 19 5 12'}/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{t.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.type === 'credit' ? '#22c55e' : '#ef4444' }}>{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Partner References ─────────────────────────────────────────────────
function PartnerReferences() {
  const refs = [
    { name: 'Rahul Kumar', joined: 'Apr 20', service: 'Python Basics', earned: '₹300' },
    { name: 'Priya Singh', joined: 'Apr 15', service: 'AI Workshop', earned: '₹300' },
    { name: 'Amit Verma', joined: 'Apr 10', service: 'Python Basics', earned: '₹300' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>References & Referrals</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="ref-grid">
        {[['3','Students Referred','#f97316'],['₹900','Referral Earnings','#0d9488'],['₹300','Per Referral','#fbbf24']].map(([v,l,c]) => (
          <div key={l} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#0f172a', borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Referral Code</div>
          <div style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 800, color: '#f97316', letterSpacing: '0.08em' }}>PARTNER-CS42</div>
        </div>
        <button style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 9, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Share Code</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Referred Students</div>
        {refs.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < refs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>{r.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{r.service} · Joined {r.joined}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#f97316' }}>{r.earned}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PartnerSidebar, PartnerHome, PartnerBookings, PartnerAttendance, PartnerServices, PartnerLive, PartnerPayments, PartnerReferences });
