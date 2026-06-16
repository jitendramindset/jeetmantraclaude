// JeetMantra Website — Shared Components
// Header, Footer, CourseCard

const { useState } = React;

// ── Logo ──────────────────────────────────────────────────────────────
function Logo({ dark = false }) {
  const text = dark ? '#ffffff' : '#0f172a';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <img src="../../assets/logo.png" alt="JeetMantra" style={{ width: 40, height: 40, objectFit: 'contain' }} />
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: text, lineHeight: 1 }}>
          Jeet<span style={{ color: '#f97316' }}>Mantra</span>
        </div>
        <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af', marginTop: 2 }}>
          The Modern Gurukul
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────
function Header({ page, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = ['Home', 'Courses', 'Earn', 'Directory', 'About', 'Contact'];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => setPage('Home')}><Logo /></div>
        <nav style={{ display: 'flex', gap: 4 }}>
          {links.map(l => (
            <button key={l} onClick={() => setPage(l)} style={{
              background: page === l ? '#fff7ed' : 'transparent',
              color: page === l ? '#f97316' : '#374151',
              border: 'none', borderRadius: 8, padding: '8px 14px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 150ms'
            }}>{l}</button>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPage('Login')} style={{ border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: 'white', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit' }}>Login</button>
          <button onClick={() => setPage('Contact')} style={{ border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#f97316', color: 'white', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 12px rgba(249,115,22,0.3)' }}>Book Free Demo</button>
        </div>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  const cols = [
    { title: 'Programs', links: ['JEE Coaching', 'NEET Coaching', 'CA Foundation', 'AI Skills', 'Sports Academy'] },
    { title: 'Platform', links: ['Earn While Learn', 'Referral System', 'Student Wallet', 'Partner With Us', 'Become a Teacher'] },
    { title: 'Company', links: ['About Us', 'Why JeetMantra', 'Blog', 'Careers', 'Contact'] },
  ];
  return (
    <footer style={{ background: '#0f172a', color: 'white', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <Logo dark />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginTop: 16, maxWidth: 220 }}>
              India's modern education platform. Learn, earn, and grow — all in one place.
            </p>
            <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              📍 Galaxia Mall, Ranchi<br/>
              <span style={{ color: '#f97316', marginTop: 4, display: 'block' }}>+91 XXXXX XXXXX</span>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 10, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='#f97316'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2025 JeetMantra. All rights reserved.</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Seekho. Bano. <span style={{ color: '#f97316' }}>Jeeto.</span></div>
        </div>
      </div>
    </footer>
  );
}

// ── Course Card ───────────────────────────────────────────────────────
function CourseCard({ title, subject, schedule, price, oldPrice, badge, badgeColor, gradient, setPage }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: 'white', borderRadius: 16, boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.14)' : '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden', transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)', transform: hovered ? 'translateY(-3px)' : 'none', cursor: 'pointer' }}>
      <div style={{ height: 100, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 36 }}>{subject}</div>
      </div>
      <div style={{ padding: 20 }}>
        <span style={{ background: badgeColor + '18', color: badgeColor, borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{badge}</span>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '10px 0 4px', lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{schedule}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>₹{price}</span>
            <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through', marginLeft: 6 }}>₹{oldPrice}</span>
          </div>
          <button onClick={() => setPage('Contact')} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Enroll →</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Logo, Header, Footer, CourseCard });
