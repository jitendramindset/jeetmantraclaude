// JeetMantra — Teacher Dashboard Screens
const { useState } = React;

// ── Teacher Sidebar ───────────────────────────────────────────────────
function TeacherSidebar({ screen, setScreen, setRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [
    { id: 'home',       label: 'Overview',       icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: 'classes',    label: 'My Classes',     icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
    { id: 'attendance', label: 'Take Attendance',icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { id: 'live',       label: 'Live Class',     icon: 'M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z' },
    { id: 'create',     label: 'Create Course',  icon: 'M12 5v14M5 12h14' },
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
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Teacher Portal</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0 }}>AS</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Mr. Anil Sharma</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Mathematics · 340 students</div>
        </div>
      </div>
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        {items.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => { setScreen(item.id); setMobileOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: active ? 'rgba(13,148,136,0.18)' : 'transparent', color: active ? '#0d9488' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'inherit', marginBottom: 2, transition: 'all 150ms', textAlign: 'left' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={active ? '#0d9488' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
              {item.label}
              {item.id === 'attendance' && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 9999, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>3</span>}
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
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', position: 'fixed', top: 12, left: 12, zIndex: 300, background: '#0f172a', border: 'none', borderRadius: 8, padding: 10, cursor: 'pointer' }} className="hamburger">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      {/* Desktop sidebar */}
      <div style={{ flexShrink: 0, width: 240, minHeight: '100vh', position: 'sticky', top: 0 }} className="sidebar-desktop">
        <SidebarContent />
      </div>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ width: 240, height: '100%' }}><SidebarContent /></div>
          <div onClick={() => setMobileOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}></div>
        </div>
      )}
    </>
  );
}

// ── Teacher Overview ──────────────────────────────────────────────────
function TeacherHome({ setScreen }) {
  const todayClasses = [
    { subject: 'JEE Maths — Batch A', time: '7:00 AM', students: 42, attended: 38, status: 'done', color: '#f97316' },
    { subject: 'Class 12 Maths', time: '10:00 AM', students: 35, attended: null, status: 'upcoming', color: '#0d9488' },
    { subject: 'JEE Maths — Batch B', time: '4:00 PM', students: 40, attended: null, status: 'upcoming', color: '#3b82f6' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Good morning, Mr. Sharma 👋</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Monday, April 25 · 3 classes today</p>
        </div>
        <button onClick={() => setScreen('live')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 16px rgba(239,68,68,0.35)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
          Start Live Class
        </button>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr) repeat(2,1fr)', gap: 14 }} className="stats-grid">
        {[
          { label: 'Total Students', value: '340', sub: 'Across 4 batches', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', bg: '#fff7ed', color: '#f97316', trend: 8 },
          { label: 'Avg. Attendance', value: '86%', sub: 'This month', icon: 'M9 11l3 3L22 4', bg: '#f0fdf4', color: '#22c55e', trend: 3 },
          { label: 'This Month', value: '₹28,400', sub: 'Total earnings', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', bg: '#eff6ff', color: '#3b82f6', trend: 12 },
          { label: 'Active Courses', value: '4', sub: '1 pending approval', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', bg: '#f0fdfa', color: '#0d9488' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round"><path d={s.icon}/></svg>
              </div>
              {s.trend && <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', borderRadius: 9999, padding: '2px 8px' }}>↑ {s.trend}%</span>}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Today's classes */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Today's Schedule</div>
          <button onClick={() => setScreen('classes')} style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All Classes →</button>
        </div>
        {todayClasses.map((cls, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < todayClasses.length - 1 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: cls.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: cls.color }}>{cls.subject.slice(0,3).toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cls.subject}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{cls.time} · {cls.students} students</div>
            </div>
            {cls.status === 'done'
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{cls.attended}/{cls.students} present</span>
                  <button onClick={() => setScreen('attendance')} style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f4f6f8', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                </div>
              : <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setScreen('attendance')} style={{ background: cls.color, color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Take Attendance</button>
                  <button onClick={() => setScreen('live')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Go Live</button>
                </div>
            }
          </div>
        ))}
      </div>
      {/* Recent payments */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 16, padding: '20px 22px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Recent Payments</div>
          <button onClick={() => setScreen('payments')} style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View All →</button>
        </div>
        {[['JEE Batch A — April','₹12,000','Apr 24'],['Class 12 — April','₹8,750','Apr 22'],['JEE Batch B — April','₹11,200','Apr 20']].map(([l,v,d],i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{l}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{d}</div>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#22c55e' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Take Attendance ───────────────────────────────────────────────────
function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState(0);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const classes = ['JEE Maths — Batch A (Today 7:00 AM)', 'Class 12 Maths (Today 10:00 AM)', 'JEE Maths — Batch B (Today 4:00 PM)'];
  const students = [
    { id: 1, name: 'Rahul Kumar', rollNo: 'JM-001', phone: '98765 43210' },
    { id: 2, name: 'Priya Singh', rollNo: 'JM-002', phone: '87654 32109' },
    { id: 3, name: 'Amit Verma', rollNo: 'JM-003', phone: '76543 21098' },
    { id: 4, name: 'Sneha Gupta', rollNo: 'JM-004', phone: '65432 10987' },
    { id: 5, name: 'Rohan Jha', rollNo: 'JM-005', phone: '54321 09876' },
    { id: 6, name: 'Kavya Sharma', rollNo: 'JM-006', phone: '43210 98765' },
    { id: 7, name: 'Arjun Mehta', rollNo: 'JM-007', phone: '32109 87654' },
    { id: 8, name: 'Riya Pandey', rollNo: 'JM-008', phone: '21098 76543' },
  ];
  const toggle = (id, val) => setAttendance(a => ({ ...a, [id]: val }));
  const presentCount = Object.values(attendance).filter(v => v === 'P').length;
  const absentCount = Object.values(attendance).filter(v => v === 'A').length;

  if (submitted) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Attendance Submitted!</h2>
      <p style={{ fontSize: 14, color: '#64748b' }}>{presentCount} present · {absentCount} absent · {students.length - presentCount - absentCount} unmarked</p>
      <button onClick={() => { setSubmitted(false); setAttendance({}); }} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: 9, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Take Another</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>Take Attendance</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Mark students present or absent for each class</p>
      </div>
      {/* Class selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {classes.map((c, i) => (
          <button key={i} onClick={() => { setSelectedClass(i); setAttendance({}); setSubmitted(false); }} style={{ border: selectedClass === i ? 'none' : '1.5px solid #e5e7eb', borderRadius: 9999, padding: '8px 16px', fontSize: 12, fontWeight: 700, background: selectedClass === i ? '#0d9488' : 'white', color: selectedClass === i ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>{c}</button>
        ))}
      </div>
      {/* Mark all */}
      <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {classes[selectedClass].split('(')[0].trim()}
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginLeft: 8 }}>{presentCount} present · {absentCount} absent</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { const a = {}; students.forEach(s => a[s.id] = 'P'); setAttendance(a); }} style={{ background: '#f0fdf4', color: '#22c55e', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Mark All Present</button>
            <button onClick={() => { const a = {}; students.forEach(s => a[s.id] = 'A'); setAttendance(a); }} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Mark All Absent</button>
          </div>
        </div>
        {/* Student list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {students.map(s => {
            const status = attendance[s.id];
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${status === 'P' ? '#bbf7d0' : status === 'A' ? '#fecaca' : '#e5e7eb'}`, background: status === 'P' ? '#f0fdf4' : status === 'A' ? '#fef2f2' : '#f9fafb', transition: 'all 150ms' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: status === 'P' ? '#22c55e' : status === 'A' ? '#ef4444' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: status ? 'white' : '#9ca3af', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.rollNo}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggle(s.id, 'P')} style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: status === 'P' ? '#22c55e' : '#e5e7eb', color: status === 'P' ? 'white' : '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>P</button>
                  <button onClick={() => toggle(s.id, 'A')} style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: status === 'A' ? '#ef4444' : '#e5e7eb', color: status === 'A' ? 'white' : '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>A</button>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setSubmitted(true)} style={{ width: '100%', background: '#0d9488', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 18, boxShadow: '0 0 16px rgba(13,148,136,0.3)' }}>Submit Attendance →</button>
      </div>
    </div>
  );
}

// ── Live Class ────────────────────────────────────────────────────────
function TeacherLive() {
  const [live, setLive] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Live Class</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="live-grid">
        {/* Start live */}
        <div style={{ background: live ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', textAlign: 'center', transition: 'all 300ms' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: live ? 'rgba(255,255,255,0.2)' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={live ? 'white' : '#ef4444'} strokeWidth="2" strokeLinecap="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: live ? 'white' : '#0f172a', marginBottom: 8 }}>{live ? '🔴 Class is LIVE' : 'Start Live Class'}</h3>
          <p style={{ fontSize: 13, color: live ? 'rgba(255,255,255,0.75)' : '#64748b', marginBottom: 22, lineHeight: 1.6 }}>{live ? 'Students can now join your session. Share the link below.' : 'Instantly start a live video class for your students.'}</p>
          {live && <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontFamily: 'monospace', fontSize: 13, color: 'white', letterSpacing: '0.04em' }}>jeetmantra.in/live/sharma-42</div>}
          <button onClick={() => setLive(l => !l)} style={{ background: live ? 'rgba(255,255,255,0.2)' : '#ef4444', color: 'white', border: live ? '1.5px solid rgba(255,255,255,0.4)' : 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: live ? 'none' : '0 0 20px rgba(239,68,68,0.4)' }}>
            {live ? 'End Class' : 'Go Live Now'}
          </button>
        </div>
        {/* Schedule */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 18 }}>Schedule a Class</h3>
          {[['Class / Batch', 'select'], ['Topic', 'text'], ['Date', 'date'], ['Time', 'time'], ['Duration (minutes)', 'number']].map(([l, t]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{l}</label>
              {t === 'select'
                ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', outline: 'none', color: '#0f172a', background: 'white' }}>
                    <option>JEE Maths — Batch A</option><option>Class 12 Maths</option><option>JEE Maths — Batch B</option>
                  </select>
                : <input type={t} placeholder={t === 'number' ? '60' : ''} style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', outline: 'none', color: '#0f172a' }} onFocus={e => { e.target.style.borderColor = '#0d9488'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              }
            </div>
          ))}
          <button onClick={() => setScheduled(true)} style={{ width: '100%', background: scheduled ? '#22c55e' : '#0d9488', color: 'white', border: 'none', borderRadius: 9, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
            {scheduled ? '✓ Scheduled!' : 'Schedule Class'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Course ─────────────────────────────────────────────────────
function TeacherCreateCourse() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const steps = ['Basic Info', 'Schedule', 'Pricing', 'Preview'];

  if (submitted) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Course Submitted!</h2>
      <p style={{ fontSize: 14, color: '#64748b', maxWidth: 320 }}>Your course is under review. It will go live within 24 hours after admin approval.</p>
      <button onClick={() => { setSubmitted(false); setStep(1); }} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: 9, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Create Another Course</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Create New Course</h1>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 12, padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i + 1)} style={{ flex: 1, padding: '9px 10px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: step === i + 1 ? '#0d9488' : 'transparent', color: step === i + 1 ? 'white' : step > i + 1 ? '#0d9488' : '#9ca3af', whiteSpace: 'nowrap', transition: 'all 150ms' }}>
            {step > i + 1 ? '✓ ' : `${i+1}. `}{s}
          </button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Basic Course Information</div>
            {[['Course Title', 'text', 'e.g. JEE Mathematics — Advanced Batch'], ['Subject', 'select'], ['Target Exam / Class', 'select2'], ['Course Description', 'textarea']].map(([l, t, p]) => (
              <div key={l}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{l}</label>
                {t === 'textarea'
                  ? <textarea rows={3} placeholder="Describe what students will learn…" style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', resize: 'vertical' }} onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                  : t === 'select'
                  ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                      <option>Mathematics</option><option>Physics</option><option>Chemistry</option><option>Biology</option><option>AI & Coding</option>
                    </select>
                  : t === 'select2'
                  ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                      <option>JEE Mains</option><option>JEE Advanced</option><option>NEET</option><option>Class 12</option><option>Class 11</option><option>Class 10</option>
                    </select>
                  : <input type="text" placeholder={p} style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none' }} onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                }
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Schedule & Timing</div>
            {[['Days', 'days'], ['Start Time', 'time'], ['Duration (min)', 'number'], ['Start Date', 'date'], ['Total Classes', 'number'], ['Mode', 'mode']].map(([l, t]) => (
              <div key={l}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{l}</label>
                {t === 'days'
                  ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => {
                        const [sel, setSel] = useState(false);
                        return <button key={d} onClick={() => setSel(s => !s)} style={{ padding: '7px 12px', borderRadius: 7, border: `1.5px solid ${sel ? '#0d9488' : '#e5e7eb'}`, background: sel ? '#f0fdfa' : 'white', color: sel ? '#0d9488' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{d}</button>;
                      })}
                    </div>
                  : t === 'mode'
                  ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                      <option>Online (Live + Recorded)</option><option>Offline (Classroom)</option><option>Hybrid</option>
                    </select>
                  : <input type={t === 'number' ? 'number' : t} style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none' }} onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                }
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Pricing & Seats</div>
            {[['Full Fee (₹)', 'number', '4999'], ['Discounted Fee (₹)', 'number', '3999'], ['Max Seats', 'number', '45'], ['Installments Allowed?', 'select3']].map(([l, t, p]) => (
              <div key={l}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{l}</label>
                {t === 'select3'
                  ? <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none', background: 'white', color: '#0f172a' }}>
                      <option>No — Full payment only</option><option>Yes — 2 installments</option><option>Yes — 3 installments</option>
                    </select>
                  : <input type="number" placeholder={p} style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', outline: 'none' }} onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                }
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Preview & Submit</div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1.5px solid #e5e7eb', marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>JEE Mathematics — Advanced Batch</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ background: '#fff7ed', color: '#f97316', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>JEE 2025</span>
                <span style={{ background: '#f0fdfa', color: '#0d9488', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Mathematics</span>
                <span style={{ background: '#f0fdf4', color: '#22c55e', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Online</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#64748b' }}>
                <div>📅 Mon · Wed · Fri</div><div>⏰ 7:00 AM · 90 min</div>
                <div>💺 45 seats max</div><div>💰 ₹3,999 (was ₹4,999)</div>
              </div>
            </div>
            <button onClick={() => setSubmitted(true)} style={{ width: '100%', background: '#0d9488', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 16px rgba(13,148,136,0.3)' }}>Submit for Approval →</button>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={() => setStep(s => Math.max(1, s - 1))} style={{ background: '#f4f6f8', color: '#374151', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, fontFamily: 'inherit' }}>← Back</button>
          {step < 4 && <button onClick={() => setStep(s => Math.min(4, s + 1))} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Next →</button>}
        </div>
      </div>
    </div>
  );
}

// ── Teacher Payments ──────────────────────────────────────────────────
function TeacherPayments() {
  const txns = [
    { label: 'JEE Batch A — April', amount: '₹12,000', date: 'Apr 24', type: 'credit' },
    { label: 'Class 12 Maths — April', amount: '₹8,750', date: 'Apr 22', type: 'credit' },
    { label: 'JEE Batch B — April', amount: '₹11,200', date: 'Apr 20', type: 'credit' },
    { label: 'Platform Fee (5%)', amount: '−₹1,597', date: 'Apr 20', type: 'debit' },
    { label: 'Withdrawal to Bank', amount: '−₹25,000', date: 'Apr 15', type: 'debit' },
    { label: 'AI Workshop — March', amount: '₹6,500', date: 'Mar 31', type: 'credit' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Payments</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="pay-grid">
        {[['₹28,400','This Month','#f97316','↑ 12%'],['₹1,24,000','Total Earned','#0d9488',''],['₹3,400','Pending','#f59e0b','']].map(([v,l,c,t]) => (
          <div key={l} style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{l}</div>
            {t && <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', borderRadius: 9999, padding: '2px 8px', marginTop: 6, display: 'inline-block' }}>{t}</span>}
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Transactions</div>
          <button style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Withdraw Earnings</button>
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

// ── Teacher References ─────────────────────────────────────────────────
function TeacherReferences() {
  const refs = [
    { name: 'Rohan Jha', joined: 'Apr 20', course: 'JEE Batch A', status: 'Active', earned: '₹500' },
    { name: 'Sneha Gupta', joined: 'Apr 18', course: 'Class 12 Maths', status: 'Active', earned: '₹500' },
    { name: 'Amit Verma', joined: 'Apr 10', course: 'JEE Batch B', status: 'Active', earned: '₹500' },
    { name: 'Pooja Singh', joined: 'Mar 25', course: 'JEE Batch A', status: 'Active', earned: '₹500' },
    { name: 'Karan Mehta', joined: 'Mar 20', course: 'AI Workshop', status: 'Inactive', earned: '₹250' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>References & Referrals</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="ref-grid">
        {[['5','Students Referred','#f97316'],['₹2,250','Referral Earnings','#0d9488'],['₹500','Per Referral','#fbbf24']].map(([v,l,c]) => (
          <div key={l} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em' }}>{v}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#0f172a', borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Referral Code</div>
          <div style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 800, color: '#0d9488', letterSpacing: '0.08em' }}>TEACHER-SHARMA</div>
        </div>
        <button style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 9, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Share Code</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Referred Students</div>
        {refs.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < refs.length - 1 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{r.name[0]}</div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{r.course} · Joined {r.joined}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.status === 'Active' ? '#22c55e' : '#9ca3af', background: r.status === 'Active' ? '#f0fdf4' : '#f4f6f8', borderRadius: 9999, padding: '3px 10px' }}>{r.status}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#f97316', minWidth: 48, textAlign: 'right' }}>{r.earned}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Teacher My Classes ────────────────────────────────────────────────
function TeacherClasses({ setScreen }) {
  const batches = [
    { name: 'JEE Maths — Batch A', schedule: 'Mon · Wed · Fri · 7:00 AM', students: 42, progress: 72, color: '#f97316', next: 'Tomorrow 7:00 AM' },
    { name: 'Class 12 Mathematics', schedule: 'Daily · 10:00 AM', students: 35, progress: 58, color: '#0d9488', next: 'Today 10:00 AM' },
    { name: 'JEE Maths — Batch B', schedule: 'Tue · Thu · Sat · 4:00 PM', students: 40, progress: 45, color: '#3b82f6', next: 'Today 4:00 PM' },
    { name: 'AI & Coding Workshop', schedule: 'Weekends · 10:00 AM', students: 28, progress: 30, color: '#7c3aed', next: 'Saturday 10:00 AM' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>My Classes</h1>
        <button onClick={() => setScreen('create')} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ New Course</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
        {batches.map((b, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderTop: `3px solid ${b.color}` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{b.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>📅 {b.schedule}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.progress}%</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 7, marginBottom: 16 }}>
              <div style={{ background: b.color, height: '100%', borderRadius: 9999, width: b.progress + '%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>👥 {b.students} students</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setScreen('attendance')} style={{ fontSize: 11, fontWeight: 700, color: b.color, background: b.color + '14', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Attendance</button>
                <button onClick={() => setScreen('live')} style={{ fontSize: 11, fontWeight: 700, color: 'white', background: '#ef4444', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Live</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TeacherSidebar, TeacherHome, TeacherAttendance, TeacherLive, TeacherCreateCourse, TeacherPayments, TeacherReferences, TeacherClasses });
