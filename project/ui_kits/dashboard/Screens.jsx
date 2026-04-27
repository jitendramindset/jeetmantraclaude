// JeetMantra Dashboard — Screen Components
const { useState } = React;

// ── Topbar ────────────────────────────────────────────────────────────
function Topbar({ title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ width: 40, height: 40, borderRadius: 10, background: 'white', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" size={18} stroke="#374151" />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, background: '#f97316', borderRadius: '50%', border: '2px solid white' }}></span>
        </button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 16, cursor: 'pointer' }}>R</div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconPath, iconBg, iconColor, trend }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={iconPath} size={18} stroke={iconColor} />
        </div>
        {trend && <span style={{ fontSize: 11, fontWeight: 700, color: trend > 0 ? '#22c55e' : '#ef4444', background: trend > 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 9999, padding: '2px 8px' }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Quick Action Button ───────────────────────────────────────────────
function QuickAction({ icon, label, color, bg, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 10px', borderRadius: 14, border: 'none', background: hov ? bg : 'white', cursor: 'pointer', fontFamily: 'inherit', boxShadow: hov ? `0 4px 16px ${color}22` : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 200ms', flex: 1 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={icon} size={20} stroke={color} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: hov ? color : '#374151', textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
    </button>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)} onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: 16, color: n <= (hov || value) ? '#f97316' : '#e5e7eb', transition: 'color 100ms', lineHeight: 1 }}>
          ★
        </button>
      ))}
    </div>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────
function HomeScreen({ setScreen }) {
  const [feedback, setFeedback] = useState({ math: 0, physics: 0, ai: 0 });
  const [feedbackSent, setFeedbackSent] = useState({});
  const [activeTab, setActiveTab] = useState('live');

  const liveLectures = [
    { subject: 'Mathematics', topic: 'Integration — Part 3', time: '7:00 AM', teacher: 'Mr. Sharma', color: '#f97316', live: true },
    { subject: 'Physics', topic: 'Electrostatics', time: '9:30 AM', teacher: 'Mrs. Gupta', color: '#3b82f6', live: false },
    { subject: 'AI Workshop', topic: 'Prompt Engineering', time: '4:00 PM', teacher: 'Mr. Verma', color: '#7c3aed', live: false },
  ];
  const recordedLectures = [
    { subject: 'Chemistry', topic: 'Organic Chemistry — Alkanes', duration: '52 min', teacher: 'Mr. Jha', color: '#22c55e', watched: true },
    { subject: 'Mathematics', topic: 'Limits & Continuity', duration: '48 min', teacher: 'Mr. Sharma', color: '#f97316', watched: false },
    { subject: 'Physics', topic: 'Waves & Oscillations', duration: '61 min', teacher: 'Mrs. Gupta', color: '#3b82f6', watched: false },
  ];
  const homework = [
    { subject: 'Mathematics', task: 'Solve Ex. 7.4 — Q1–15', due: 'Today 11:59 PM', color: '#f97316', done: false },
    { subject: 'Physics', task: 'Numericals — Electrostatics Set B', due: 'Tomorrow', color: '#3b82f6', done: true },
    { subject: 'Chemistry', task: 'Read Chapter 13 + Notes', due: 'Wed', color: '#22c55e', done: false },
  ];
  const skillsThisWeek = [
    { name: 'Prompt Engineering', pct: 75, color: '#7c3aed' },
    { name: 'Python Basics', pct: 40, color: '#3b82f6' },
    { name: 'Public Speaking', pct: 60, color: '#f59e0b' },
  ];
  const partners = [
    { name: 'CodeSpark Academy', type: 'AI & Coding', hourly: '₹199/hr', daily: '₹999/day', rating: 4.8, color: '#7c3aed' },
    { name: 'SportZone Ranchi', type: 'Cricket & Fitness', hourly: '₹149/hr', daily: '₹799/day', rating: 4.6, color: '#22c55e' },
    { name: 'ArtVista Studio', type: 'Music & Arts', hourly: '₹179/hr', daily: '₹849/day', rating: 4.7, color: '#f59e0b' },
  ];
  const feedbackClasses = [
    { key: 'math', subject: 'Mathematics', teacher: 'Mr. Sharma', date: 'Today 7:00 AM' },
    { key: 'physics', subject: 'Physics', teacher: 'Mrs. Gupta', date: 'Yesterday 9:30 AM' },
    { key: 'ai', subject: 'AI Workshop', teacher: 'Mr. Verma', date: 'Yesterday 4:00 PM' },
  ];

  const btn = (label, color, bg, onClick) => (
    <button onClick={onClick} style={{ background: bg, color, border: `1.5px solid ${color}30`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Topbar title="Good morning, Rahul 👋" subtitle="Monday, April 25 · JEE 2025 Batch" />

      {/* Top stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard label="Attendance" value="87%" sub="This month" iconPath="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" iconBg="#f0fdf4" iconColor="#22c55e" trend={5} />
        <StatCard label="Classes Done" value="42" sub="Out of 48" iconPath="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" iconBg="#eff6ff" iconColor="#3b82f6" />
        <StatCard label="Wallet Balance" value="₹1,250" sub="Ready to withdraw" iconPath="M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 1 0-4h14" iconBg="#fff7ed" iconColor="#f97316" trend={18} />
        <StatCard label="Skills Learned" value="3" sub="This week" iconPath="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" iconBg="#fdf4ff" iconColor="#7c3aed" trend={12} />
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickAction icon="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" label="Live Lecture" color="#ef4444" bg="#fef2f2" />
          <QuickAction icon="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6" label="Recorded" color="#3b82f6" bg="#eff6ff" />
          <QuickAction icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M12 12h.01M12 16h.01" label="Take Test" color="#f97316" bg="#fff7ed" />
          <QuickAction icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" label="Do Quiz" color="#7c3aed" bg="#fdf4ff" />
          <QuickAction icon="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" label="See Books" color="#22c55e" bg="#f0fdf4" />
          <QuickAction icon="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" label="Homework" color="#f59e0b" bg="#fffbeb" />
          <QuickAction icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" label="Book Class" color="#0f172a" bg="#f4f6f8" />
        </div>
      </div>

      {/* Live + Recorded lectures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Lectures panel */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 4, background: '#f4f6f8', borderRadius: 10, padding: 4 }}>
              {['live','recorded'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: activeTab === t ? 'white' : 'transparent', color: activeTab === t ? '#0f172a' : '#64748b', boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 150ms', textTransform: 'capitalize' }}>{t === 'live' ? '🔴 Live' : '▶ Recorded'}</button>
              ))}
            </div>
            <button onClick={() => setScreen('courses')} style={{ fontSize: 12, fontWeight: 600, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>See All →</button>
          </div>

          {activeTab === 'live' && liveLectures.map((cls, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < liveLectures.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cls.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: cls.color }}>{cls.subject.slice(0,3).toUpperCase()}</div>
                {cls.live && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', borderRadius: 9999, padding: '1px 5px', fontSize: 8, fontWeight: 800, color: 'white', border: '2px solid white' }}>LIVE</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.subject}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cls.topic} · {cls.time}</div>
              </div>
              <button style={{ background: cls.live ? '#ef4444' : cls.color, color: 'white', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>{cls.live ? 'Join Now' : 'Remind'}</button>
            </div>
          ))}

          {activeTab === 'recorded' && recordedLectures.map((cls, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < recordedLectures.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cls.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" size={16} stroke={cls.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.topic}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cls.subject} · {cls.duration}</div>
              </div>
              {cls.watched
                ? <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, background: '#f0fdf4', borderRadius: 6, padding: '4px 8px' }}>✓ Watched</span>
                : <button style={{ background: cls.color + '18', color: cls.color, border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Watch</button>
              }
            </div>
          ))}
        </div>

        {/* Homework */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Homework</div>
            <span style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>2 pending</span>
          </div>
          {homework.map((hw, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: i < homework.length - 1 ? '1px solid #f1f5f9' : 'none', opacity: hw.done ? 0.5 : 1 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${hw.done ? '#22c55e' : hw.color}`, background: hw.done ? '#22c55e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, cursor: 'pointer' }}>
                {hw.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: hw.done ? 'line-through' : 'none' }}>{hw.task}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{hw.subject} · Due: <span style={{ color: i === 0 ? '#ef4444' : '#64748b', fontWeight: 600 }}>{hw.due}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills this week + Partner/Book class */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Skills learned this week */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Skills This Week</div>
            <span style={{ background: '#fdf4ff', color: '#7c3aed', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>3 active</span>
          </div>
          {skillsThisWeek.map((sk, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sk.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sk.color }}>{sk.pct}%</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 7 }}>
                <div style={{ background: sk.color, height: '100%', borderRadius: 9999, width: sk.pct + '%', transition: 'width 600ms' }}></div>
              </div>
            </div>
          ))}
          <button style={{ width: '100%', background: '#fdf4ff', color: '#7c3aed', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>Explore More Skills →</button>
        </div>

        {/* Partner & Skills — hourly/daily rates + book */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Partners & Skills</div>
            <button style={{ fontSize: 12, fontWeight: 600, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>See All →</button>
          </div>
          {partners.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < partners.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: p.color }}>{p.name.slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{p.type} · ⭐ {p.rating}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>{p.hourly}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>{p.daily}</span>
                </div>
              </div>
              <button style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Book</button>
            </div>
          ))}
        </div>
      </div>

      {/* Class Review & Feedback */}
      <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Class Review & Feedback</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Rate each class out of 10 — your feedback helps teachers improve</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {feedbackClasses.map((cls) => (
            <div key={cls.key} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px', border: feedbackSent[cls.key] ? '1.5px solid #22c55e' : '1.5px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{cls.subject}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>{cls.teacher} · {cls.date}</div>
              <StarRating value={feedback[cls.key]} onChange={v => setFeedback(f => ({ ...f, [cls.key]: v }))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: feedback[cls.key] ? '#f97316' : '#9ca3af' }}>
                  {feedback[cls.key] ? `${feedback[cls.key]} / 10` : '— / 10'}
                </span>
                {feedbackSent[cls.key]
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>✓ Sent</span>
                  : <button onClick={() => feedback[cls.key] && setFeedbackSent(f => ({ ...f, [cls.key]: true }))}
                      style={{ background: feedback[cls.key] ? '#f97316' : '#e5e7eb', color: feedback[cls.key] ? 'white' : '#9ca3af', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: feedback[cls.key] ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 150ms' }}>
                      Submit
                    </button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Courses Screen ────────────────────────────────────────────────────
function CoursesScreen() {
  const courses = [
    { name: 'JEE Mathematics', teacher: 'Mr. Sharma', progress: 72, total: 120, done: 86, color: '#f97316', next: 'Integration — Part 3 · Tomorrow 7:00 AM' },
    { name: 'JEE Physics', teacher: 'Mrs. Gupta', progress: 58, total: 110, done: 64, color: '#3b82f6', next: 'Electrostatics · Today 9:30 AM' },
    { name: 'JEE Chemistry', teacher: 'Mr. Jha', progress: 65, total: 100, done: 65, color: '#22c55e', next: 'Organic Chemistry · Wed 8:00 AM' },
    { name: 'AI Workshop', teacher: 'Mr. Verma', progress: 40, total: 20, done: 8, color: '#7c3aed', next: 'Prompt Engineering · Today 4:00 PM' },
  ];
  return (
    <div>
      <Topbar title="My Courses" subtitle="4 active enrollments · JEE 2025 Batch" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
        {courses.map((c, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{c.teacher}</div>
              </div>
              <span style={{ background: c.color + '18', color: c.color, borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{c.progress}%</span>
            </div>
            {/* Progress bar */}
            <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 8, marginBottom: 12 }}>
              <div style={{ background: c.color, borderRadius: 9999, height: '100%', width: c.progress + '%', transition: 'width 600ms' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              <span>{c.done} classes attended</span>
              <span>{c.total} total classes</span>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#64748b', borderLeft: `3px solid ${c.color}` }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Next: </span>{c.next}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Attendance Screen ─────────────────────────────────────────────────
function AttendanceScreen() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const weeks = [
    [1,1,1,0,1,1],
    [1,0,1,1,1,0],
    [1,1,1,1,0,1],
    [1,1,0,1,1,'today'],
  ];
  return (
    <div>
      <Topbar title="Attendance" subtitle="April 2025 · 87% this month" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>April 2025</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              {[['#22c55e','Present'],['#ef4444','Absent'],['#f97316','Today']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: c }}></div><span style={{ color: '#64748b' }}>{l}</span></div>
              ))}
            </div>
          </div>
          {/* Days header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 8 }}>
            {days.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em' }}>{d}</div>)}
          </div>
          {/* Calendar grid */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 8 }}>
              {week.map((val, di) => {
                const date = wi * 6 + di + 1;
                const isToday = val === 'today';
                const bg = isToday ? '#f97316' : val === 1 ? '#22c55e' : val === 0 ? '#fef2f2' : '#f4f6f8';
                const border = isToday ? 'none' : val === 0 ? '1px solid #fecaca' : 'none';
                return (
                  <div key={di} style={{ background: bg, border, borderRadius: 10, height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: (val === 1 || isToday) ? 'white' : '#ef4444' }}>{date}</div>
                    {val === 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {val === 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Streak + summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 16, padding: 24, textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Current Streak</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: '#f97316', lineHeight: 1 }}>12</div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>days in a row 🔥</div>
          </div>
          {[['87%','This Month','#22c55e'],['94%','Best Month','#fbbf24'],['42/48','Classes Done','#3b82f6']].map(([v,l,c]) => (
            <div key={l} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{l}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Wallet Screen ─────────────────────────────────────────────────────
function WalletScreen() {
  const txns = [
    { type: 'credit', label: 'Referral — Pooja enrolled', amount: '+₹250', date: 'Today', color: '#22c55e' },
    { type: 'credit', label: 'Task: Daily Quiz completed', amount: '+₹50', date: 'Yesterday', color: '#22c55e' },
    { type: 'debit',  label: 'Course: AI Workshop', amount: '−₹499', date: 'Apr 22', color: '#ef4444' },
    { type: 'credit', label: 'Referral — Amit enrolled', amount: '+₹250', date: 'Apr 20', color: '#22c55e' },
    { type: 'credit', label: 'Content Reward: Notes shared', amount: '+₹150', date: 'Apr 18', color: '#22c55e' },
    { type: 'debit',  label: 'Withdrawal to bank', amount: '−₹1,000', date: 'Apr 15', color: '#ef4444' },
  ];
  return (
    <div>
      <Topbar title="Wallet & Earnings" subtitle="Track your earnings and transactions" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: 16, padding: '24px 22px', color: 'white', gridColumn: '1/2' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Available Balance</div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>₹1,250</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Last updated: Today</div>
          <button style={{ marginTop: 20, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Withdraw →</button>
        </div>
        <StatCard label="Total Earned" value="₹5,200" sub="Since joining" iconPath="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" iconBg="#f0fdf4" iconColor="#22c55e" trend={18} />
        <StatCard label="This Month" value="₹3,450" sub="April 2025" iconPath="M3 3h18v18H3z M3 9h18M9 21V9" iconBg="#eff6ff" iconColor="#3b82f6" trend={12} />
      </div>

      {/* Referral code */}
      <div style={{ background: '#0f172a', borderRadius: 16, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Your Referral Code</div>
          <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color: '#f97316', letterSpacing: '0.08em' }}>RAHUL-JM14</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Earn per referral</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>₹250</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Copy Code</button>
          <button style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Share on WhatsApp</button>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: 'white', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 18 }}>Recent Transactions</div>
        {txns.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < txns.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: t.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {t.type === 'credit'
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{t.date}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.color }}>{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────
function ProfileScreen() {
  return (
    <div>
      <Topbar title="My Profile" subtitle="Manage your account and settings" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 36, margin: '0 auto 16px' }}>R</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Rahul Kumar</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>JEE 2025 Batch · Class XI</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <span style={{ background: '#fff7ed', color: '#f97316', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>JEE 2025</span>
            <span style={{ background: '#f0fdf4', color: '#22c55e', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>Active</span>
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            {[['Enrollment Date','Jan 15, 2025'],['Student ID','JM-2025-1142'],['Batch','Morning — Batch A']].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{l}</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 18 }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['Full Name','Rahul Kumar'],['Mobile','+91 98765 43210'],['Email','rahul@email.com'],['School','Delhi Public School, Ranchi'],['Parent Name','Mr. Suresh Kumar'],['Parent Mobile','+91 87654 32100']].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Achievement Badges</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[['🔥 12-Day Streak','#f97316'],['⭐ Top Earner','#fbbf24'],['👥 14 Referrals','#7c3aed'],['📚 42 Classes','#3b82f6']].map(([l,c]) => (
                <span key={l} style={{ background: c, color: 'white', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 700, boxShadow: `0 2px 8px ${c}44` }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar, StatCard, HomeScreen, CoursesScreen, AttendanceScreen, WalletScreen, ProfileScreen });
