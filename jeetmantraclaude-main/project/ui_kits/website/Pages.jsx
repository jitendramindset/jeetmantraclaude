// JeetMantra Website — Page Components
const { useState } = React;

// ── Home Page ─────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const programs = [
    { icon: '📐', title: 'Academic Coaching', desc: 'Class 7–12, JEE, NEET, CA — expert faculty, structured batches', color: '#f97316' },
    { icon: '💻', title: 'Skill Development', desc: 'AI, coding, public speaking, digital marketing & more', color: '#3b82f6' },
    { icon: '⚽', title: 'Sports Academy', desc: 'Cricket, football, chess, yoga — certified coaches', color: '#22c55e' },
    { icon: '💰', title: 'Earn While Learn', desc: 'Referrals, tasks, content — earn real money as a student', color: '#fbbf24' },
  ];
  const stats = [
    { value: '1,200+', label: 'Active Students' },
    { value: '50+', label: 'Expert Teachers' },
    { value: '₹5L+', label: 'Student Earnings' },
    { value: '30+', label: 'Programs' },
  ];
  const testimonials = [
    { name: 'Priya Sharma', class: 'JEE 2024 — AIR 1820', text: 'JeetMantra ke saath meri preparation aur bhi focused ho gayi. Best decision!' },
    { name: 'Arjun Mehta', class: 'Class 11, Science', text: 'Maine referral se ₹3,000 earn kiye iss month. Seriously, earn while you learn works!' },
    { name: 'Riya Singh', class: 'NEET Aspirant', text: 'Teachers are amazing and the app keeps me on track with attendance and scores.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '100px 32px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.06) 0%, transparent 50%)' }}></div>
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 9999, padding: '6px 18px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 28 }}>
            🔥 India's Modern Gurukul — Now in Ranchi
          </span>
          <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Seekho. Bano. <span style={{ color: '#f97316' }}>Jeeto.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            Study, earn skills, play sports, and make real money — all in one place. Join 1,200+ students already winning with JeetMantra.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPage('Contact')} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 12, padding: '16px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 32px rgba(249,115,22,0.4)', transition: 'all 200ms' }}>
              Book Free Demo →
            </button>
            <button onClick={() => setPage('Courses')} style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '16px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#f97316' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '28px 24px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section style={{ padding: '80px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f97316', marginBottom: 12 }}>Our Programs</div>
          <h2 style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Study + Skill + Sports + Earning</h2>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>Everything a student needs — under one roof, one platform.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {programs.map((p, i) => (
            <div key={i} onClick={() => setPage(i === 3 ? 'Earn' : 'Courses')} style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 250ms', border: '1px solid rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.13)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{p.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{p.desc}</div>
              <div style={{ marginTop: 18, fontSize: 13, fontWeight: 700, color: p.color }}>Explore →</div>
            </div>
          ))}
        </div>
      </section>

      {/* Earn section */}
      <section style={{ background: '#0f172a', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fbbf24', marginBottom: 14 }}>Earn While Learn</div>
            <h2 style={{ fontSize: 'clamp(28px,3vw,44px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 20 }}>Real Money.<br/>While You Study.</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 32 }}>
              Refer friends, complete tasks, create content — and earn real ₹₹₹ credited to your wallet. Spend it on courses, activities, or withdraw directly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Referral Bonus — ₹250 per friend enrolled', 'Task Completion — ₹50–500 per task', 'Content Creation — Earn from your notes & videos', 'Loyalty Rewards — Laptops, phones, courses'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPage('Earn')} style={{ marginTop: 36, background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(249,115,22,0.35)' }}>
              Start Earning Today →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'This Month', value: '₹3,450', sub: 'earned by you', color: '#22c55e' },
              { label: 'Friends Referred', value: '14', sub: 'this semester', color: '#f97316' },
              { label: 'Wallet Balance', value: '₹1,200', sub: 'ready to use', color: '#fbbf24' },
              { label: 'Top Reward', value: 'Laptop', sub: '500 pts away', color: '#3b82f6' },
            ].map((card, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 32px', background: '#f4f6f8' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Students Who Are Already Winning</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 32, color: '#f97316', lineHeight: 1, marginBottom: 14, fontFamily: 'serif' }}>"</div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{t.class}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section style={{ background: '#f97316', padding: '60px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Limited Seats. Don't Miss Out.</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>Book a free demo and see JeetMantra from inside — zero pressure, zero cost.</p>
        <button onClick={() => setPage('Contact')} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Book Free Demo Now
        </button>
      </section>
    </div>
  );
}

// ── Courses Page ──────────────────────────────────────────────────────
function CoursesPage({ setPage }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Academic', 'Skills', 'Sports'];
  const courses = [
    { title: 'JEE Mathematics — Advanced', subject: '📐', schedule: 'Mon·Wed·Fri · 7:00 AM', price: '4,999', oldPrice: '7,500', badge: 'JEE 2025', badgeColor: '#f97316', gradient: 'linear-gradient(135deg,#fff7ed,#ffedd5)', cat: 'Academic' },
    { title: 'NEET Biology — Foundation', subject: '🔬', schedule: 'Tue·Thu·Sat · 8:00 AM', price: '4,499', oldPrice: '6,500', badge: 'NEET', badgeColor: '#22c55e', gradient: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', cat: 'Academic' },
    { title: 'Physics — Class 12 Board', subject: '⚡', schedule: 'Daily · 6:00 PM', price: '2,999', oldPrice: '4,000', badge: 'Class 12', badgeColor: '#3b82f6', gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', cat: 'Academic' },
    { title: 'AI & Prompt Engineering', subject: '🤖', schedule: 'Weekends · 10:00 AM', price: '3,499', oldPrice: '5,000', badge: 'AI Skills', badgeColor: '#7c3aed', gradient: 'linear-gradient(135deg,#fdf4ff,#f3e8ff)', cat: 'Skills' },
    { title: 'Public Speaking & Debate', subject: '🎤', schedule: 'Sat·Sun · 11:00 AM', price: '1,999', oldPrice: '3,000', badge: 'Skill', badgeColor: '#f59e0b', gradient: 'linear-gradient(135deg,#fffbeb,#fef3c7)', cat: 'Skills' },
    { title: 'Cricket Coaching — Junior', subject: '🏏', schedule: 'Daily · 5:00 PM', price: '2,499', oldPrice: '3,500', badge: 'Sports', badgeColor: '#22c55e', gradient: 'linear-gradient(135deg,#f0fdf4,#d1fae5)', cat: 'Sports' },
  ];
  const shown = filter === 'All' ? courses : courses.filter(c => c.cat === filter);
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 32px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>All Programs</h1>
        <p style={{ fontSize: 16, color: '#64748b' }}>Choose from academics, skills, and sports — taught by expert faculty.</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ border: filter === f ? 'none' : '1.5px solid #e5e7eb', borderRadius: 9999, padding: '8px 20px', fontSize: 13, fontWeight: 700, background: filter === f ? '#f97316' : 'white', color: filter === f ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>{f}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {shown.map((c, i) => <CourseCard key={i} {...c} setPage={setPage} />)}
      </div>
    </div>
  );
}

// ── Earn Page ─────────────────────────────────────────────────────────
function EarnPage({ setPage }) {
  const steps = [
    { num: '01', title: 'Join JeetMantra', desc: 'Create your free account and get your unique referral code.' },
    { num: '02', title: 'Refer & Earn', desc: 'Share your code. Earn ₹250 every time a friend enrolls.' },
    { num: '03', title: 'Complete Tasks', desc: 'Attend classes, submit assignments, complete daily tasks.' },
    { num: '04', title: 'Withdraw or Spend', desc: 'Use earnings for courses, activities, or withdraw to your bank.' },
  ];
  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 9999, padding: '6px 18px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>💰 EARN WHILE LEARN</span>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', margin: '24px 0 16px', lineHeight: 1.1 }}>Real Money.<br/>As a Student.</h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 36 }}>JeetMantra is the only platform where you earn while you study. No fake points — real ₹₹₹ in your wallet.</p>
          <button onClick={() => setPage('Contact')} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 12, padding: '16px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 32px rgba(249,115,22,0.4)' }}>Start Earning Today →</button>
        </div>
      </section>
      <section style={{ padding: '80px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 52 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '32px 24px', background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, margin: '0 auto 20px' }}>{s.num}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Contact Page ──────────────────────────────────────────────────────
function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Demo Booked!</h2>
      <p style={{ fontSize: 16, color: '#64748b', textAlign: 'center', maxWidth: 360 }}>Our team will call you within 2 hours to confirm your slot. Get ready to explore JeetMantra!</p>
    </div>
  );
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f97316', marginBottom: 12 }}>Book Free Demo</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 }}>Start Your Journey</h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>Join 1,200+ students who are already learning, earning, and growing with JeetMantra.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[{ l: 'Full Name', p: 'Rahul Kumar', t: 'text' }, { l: 'Mobile Number', p: '+91 98765 43210', t: 'tel' }, { l: 'Email', p: 'rahul@email.com', t: 'email' }].map((f, i) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{f.l}</label>
              <input type={f.t} placeholder={f.p} style={{ width: '100%', fontFamily: 'inherit', fontSize: 15, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', outline: 'none', color: '#0f172a' }} onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Target Exam / Interest</label>
            <select style={{ width: '100%', fontFamily: 'inherit', fontSize: 15, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', outline: 'none', color: '#0f172a', background: 'white' }}>
              <option>Select…</option>
              <option>JEE Mains / Advanced</option>
              <option>NEET</option>
              <option>CA Foundation</option>
              <option>Board Exams (Class 10/12)</option>
              <option>AI / Coding Skills</option>
              <option>Sports Academy</option>
            </select>
          </div>
          <button onClick={() => setSubmitted(true)} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(249,115,22,0.3)', marginTop: 4 }}>
            Book My Free Demo →
          </button>
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>No payment required. Our team will contact you within 2 hours.</p>
        </div>
      </div>
      <div style={{ paddingTop: 48 }}>
        <div style={{ background: '#0f172a', borderRadius: 20, padding: 32, color: 'white', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Visit Us</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Galaxia Mall, Ranchi<br/>Jharkhand — 834001<br/><br/>
            <span style={{ color: '#f97316', fontWeight: 600 }}>Mon–Sat:</span> 8:00 AM – 8:00 PM<br/>
            <span style={{ color: '#f97316', fontWeight: 600 }}>Sun:</span> 10:00 AM – 4:00 PM
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Reach Us</div>
          {[{ icon: '📞', label: 'Call / WhatsApp', value: '+91 XXXXX XXXXX' }, { icon: '✉️', label: 'Email', value: 'hello@jeetmantra.in' }].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontSize: 20 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const [role, setRole] = useState('Student');
  const [method, setMethod] = useState('id'); // 'id' | 'phone' | 'google'
  const [otpSent, setOtpSent] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const roles = [
    { id: 'Student', icon: '🎓', desc: 'Access courses, attendance & wallet' },
    { id: 'Teacher', icon: '📋', desc: 'Manage classes, earnings & content' },
    { id: 'Partner', icon: '🤝', desc: 'List services, track bookings & revenue' },
  ];

  if (loggedIn) return (
    <div style={{ minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Welcome back! 👋</h2>
      <p style={{ fontSize: 15, color: '#64748b' }}>Logged in as <strong>{role}</strong>. Redirecting to your dashboard…</p>
      <button onClick={() => setPage('Home')} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Go to Dashboard →</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 24, overflow: 'hidden', boxShadow: '0 16px 64px rgba(0,0,0,0.14)' }}>

        {/* Left panel */}
        <div style={{ background: 'linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
              <img src="../../assets/logo.png" alt="JeetMantra" style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Jeet<span style={{ color: '#f97316' }}>Mantra</span></div>            </div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>India's<br/>Modern Gurukul</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 40 }}>Study. Earn. Grow — all in one place.</p>
            {/* Role cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roles.map(r => (
                <div key={r.id} onClick={() => setRole(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${role === r.id ? '#f97316' : 'rgba(255,255,255,0.1)'}`, background: role === r.id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 200ms' }}>
                  <div style={{ fontSize: 22 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: role === r.id ? '#f97316' : 'white' }}>{r.id}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{r.desc}</div>
                  </div>
                  {role === r.id && <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 48 }}>© 2025 JeetMantra · Seekho. Bano. Jeeto.</div>
        </div>

        {/* Right panel — login form */}
        <div style={{ background: 'white', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ background: '#fff7ed', color: '#f97316', borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{role.toUpperCase()} LOGIN</span>
          </div>
          <h3 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>Welcome back</h3>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>Sign in to your JeetMantra account</p>

          {/* Method toggle */}
          <div style={{ display: 'flex', gap: 4, background: '#f4f6f8', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {[['id','JM ID'],['phone','Phone OTP'],['google','Google']].map(([m, label]) => (
              <button key={m} onClick={() => { setMethod(m); setOtpSent(false); }} style={{ flex: 1, padding: '8px 6px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: method === m ? 'white' : 'transparent', color: method === m ? '#0f172a' : '#64748b', boxShadow: method === m ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 150ms' }}>{label}</button>
            ))}
          </div>

          {/* JeetMantra ID + Password */}
          {method === 'id' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6, letterSpacing: '0.02em' }}>JeetMantra ID</label>
                <input type="text" placeholder="JM-2025-XXXX" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', outline: 'none', fontWeight: 600, letterSpacing: '0.04em' }} onFocus={e => { e.target.style.borderColor='#f97316'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.1)'; }} onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Password</label>
                <input type="password" placeholder="••••••••" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', outline: 'none' }} onFocus={e => { e.target.style.borderColor='#f97316'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.1)'; }} onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }} />
                <div style={{ textAlign: 'right', marginTop: 6 }}><span style={{ fontSize: 12, color: '#f97316', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span></div>
              </div>
              <button onClick={() => setLoggedIn(true)} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(249,115,22,0.3)', marginTop: 4 }}>Sign In →</button>
            </div>
          )}

          {/* Phone + OTP */}
          {method === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Mobile Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ background: '#f4f6f8', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>+91</div>
                  <input type="tel" placeholder="98765 43210" style={{ flex: 1, fontFamily: 'inherit', fontSize: 14, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', outline: 'none' }} onFocus={e => { e.target.style.borderColor='#f97316'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.1)'; }} onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }} />
                </div>
              </div>
              {!otpSent ? (
                <button onClick={() => setOtpSent(true)} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Send OTP via WhatsApp / SMS</button>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Enter OTP</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[0,1,2,3,4,5].map(i => <input key={i} type="text" maxLength={1} style={{ width: 44, height: 48, textAlign: 'center', fontFamily: 'inherit', fontSize: 20, fontWeight: 800, border: '1.5px solid #e5e7eb', borderRadius: 10, outline: 'none', color: '#0f172a' }} onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />)}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>OTP sent to +91 98765 43210 · <span style={{ color: '#f97316', cursor: 'pointer', fontWeight: 600 }}>Resend</span></div>
                  </div>
                  <button onClick={() => setLoggedIn(true)} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>Verify & Sign In →</button>
                </>
              )}
            </div>
          )}

          {/* Google */}
          {method === 'google' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 4 }}>Sign in with your Google account. We'll match it to your JeetMantra {role.toLowerCase()} profile.</p>
              <button onClick={() => setLoggedIn(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>Only verified @gmail.com accounts accepted.</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>New to JeetMantra?</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
          </div>
          <button onClick={() => setPage('Contact')} style={{ background: 'transparent', color: '#0f172a', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Create Account / Book Demo</button>
        </div>
      </div>
    </div>
  );
}

// ── Directory Page ────────────────────────────────────────────────────
function DirectoryPage({ setPage }) {
  const [tab, setTab] = useState('Teachers');
  const [search, setSearch] = useState('');

  const teachers = [
    { name: 'Mr. Anil Sharma', subjects: ['JEE Mathematics', 'Class 11–12 Maths'], exp: '12 years', rating: 4.9, students: 340, batch: 'Morning · 7:00 AM', qual: 'M.Sc. Mathematics, IIT Dhanbad', color: '#f97316', skills: ['Calculus', 'Algebra', 'Trigonometry', 'JEE Advanced'] },
    { name: 'Mrs. Priya Gupta', subjects: ['JEE Physics', 'NEET Physics'], exp: '9 years', rating: 4.8, students: 280, batch: 'Morning · 9:30 AM', qual: 'M.Sc. Physics, BIT Mesra', color: '#3b82f6', skills: ['Mechanics', 'Electrostatics', 'Optics', 'Modern Physics'] },
    { name: 'Mr. Ravi Jha', subjects: ['JEE Chemistry', 'NEET Chemistry'], exp: '11 years', rating: 4.7, students: 260, batch: 'Evening · 5:00 PM', qual: 'M.Sc. Chemistry, Ranchi University', color: '#22c55e', skills: ['Organic', 'Inorganic', 'Physical Chemistry'] },
    { name: 'Mr. Sanjay Verma', subjects: ['AI & Coding', 'Python', 'Prompt Engineering'], exp: '6 years', rating: 4.9, students: 180, batch: 'Weekend · 10:00 AM', qual: 'B.Tech CS, NIT Jamshedpur', color: '#7c3aed', skills: ['Python', 'AI Tools', 'n8n Automation', 'Web Dev'] },
    { name: 'Mrs. Kavita Singh', subjects: ['Public Speaking', 'English Communication'], exp: '8 years', rating: 4.6, students: 150, batch: 'Sat–Sun · 11:00 AM', qual: 'MA English, Ranchi University', color: '#f59e0b', skills: ['Debate', 'Presentation', 'IELTS Prep', 'Personality Dev'] },
    { name: 'Mr. Deepak Kumar', subjects: ['CA Foundation', 'Accountancy'], exp: '14 years', rating: 4.8, students: 190, batch: 'Evening · 6:30 PM', qual: 'CA, CMA · 14 yrs practice', color: '#ef4444', skills: ['Accounts', 'Tax', 'Audit', 'CA Foundation', 'CA Inter'] },
  ];

  const partners = [
    { name: 'CodeSpark Academy', type: 'AI & Coding Skills', hourly: '₹199/hr', daily: '₹999/day', rating: 4.8, students: 420, location: 'Harmu, Ranchi', color: '#7c3aed', skills: ['Python', 'Web Dev', 'AI/ML', 'App Dev', 'Scratch'], verified: true },
    { name: 'SportZone Ranchi', type: 'Sports & Fitness', hourly: '₹149/hr', daily: '₹799/day', rating: 4.6, students: 310, location: 'Doranda, Ranchi', color: '#22c55e', skills: ['Cricket', 'Football', 'Badminton', 'Yoga', 'Gym'], verified: true },
    { name: 'ArtVista Studio', type: 'Music, Art & Dance', hourly: '₹179/hr', daily: '₹849/day', rating: 4.7, students: 240, location: 'Lalpur, Ranchi', color: '#f59e0b', skills: ['Guitar', 'Vocals', 'Drawing', 'Kathak', 'Digital Art'], verified: false },
    { name: 'BrainBox Learning', type: 'Competitive Exam Prep', hourly: '₹229/hr', daily: '₹1,099/day', rating: 4.9, students: 380, location: 'Kanke Road, Ranchi', color: '#3b82f6', skills: ['SSC', 'Banking', 'UPSC Foundation', 'GK', 'Reasoning'], verified: true },
    { name: 'TechNinja Labs', type: 'Robotics & Electronics', hourly: '₹249/hr', daily: '₹1,199/day', rating: 4.7, students: 160, location: 'Bariatu, Ranchi', color: '#ef4444', skills: ['Robotics', 'Arduino', 'IoT', '3D Printing', 'Electronics'], verified: true },
    { name: 'MindFit Wellness', type: 'Mental Health & Yoga', hourly: '₹129/hr', daily: '₹649/day', rating: 4.5, students: 120, location: 'Ashok Nagar, Ranchi', color: '#f97316', skills: ['Meditation', 'Yoga', 'Counselling', 'Study Habits'], verified: false },
  ];

  const data = tab === 'Teachers' ? teachers : partners;
  const filtered = search ? data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) : data;

  const Card = ({ item }) => tab === 'Teachers' ? (
    <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${item.color}22,${item.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: item.color, flexShrink: 0 }}>{item.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.qual}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {item.subjects.map((s, i) => <span key={i} style={{ background: item.color + '14', color: item.color, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '14px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 14 }}>
        {[['⭐ Rating', item.rating], ['👥 Students', item.students], ['🎓 Exp.', item.exp]].map(([l, v]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Skills</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{item.skills.map((s, i) => <span key={i} style={{ background: '#f4f6f8', color: '#374151', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div>
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>🕐 {item.batch}</div>
      <button onClick={() => setPage('Contact')} style={{ width: '100%', background: item.color, color: 'white', border: 'none', borderRadius: 9, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Book a Demo Class →</button>
    </div>
  ) : (
    <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${item.color}22,${item.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: item.color, textAlign: 'center', lineHeight: 1.2, flexShrink: 0 }}>{item.name.slice(0,2).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
            {item.verified && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 9999, padding: '1px 8px', fontSize: 10, fontWeight: 800 }}>✓ Verified</span>}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.type}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>📍 {item.location}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '14px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 14 }}>
        {[['⭐ Rating', item.rating], ['👥 Enrolled', item.students], ['⏱ Hourly', item.hourly]].map(([l, v]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{item.hourly} <span style={{ color: '#9ca3af', fontWeight: 400 }}>/ hour</span></div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{item.daily} <span style={{ color: '#9ca3af', fontWeight: 400 }}>/ day</span></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Activities</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{item.skills.map((s, i) => <span key={i} style={{ background: item.color + '12', color: item.color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button onClick={() => setPage('Contact')} style={{ flex: 1, background: item.color, color: 'white', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Book Now</button>
        <button style={{ background: '#f4f6f8', color: '#374151', border: 'none', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Details</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f4f6f8', minHeight: '100vh' }}>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', padding: '60px 32px 52px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 10 }}>Our {tab}</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Expert educators and activity partners — all in one place</p>
        {/* Tab toggle */}
        <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {['Teachers', 'Partners'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 28px', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? '#f97316' : 'transparent', color: 'white', transition: 'all 200ms', boxShadow: tab === t ? '0 2px 12px rgba(249,115,22,0.4)' : 'none' }}>{t}</button>
          ))}
        </div>
        {/* Search */}
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder={`Search ${tab.toLowerCase()} by name or skill…`} style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, border: 'none', borderRadius: 10, padding: '13px 14px 13px 42px', outline: 'none', color: '#0f172a', fontWeight: 500 }} />
        </div>
      </section>
      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 20 }}>{filtered.length} {tab.toLowerCase()} found{search ? ` for "${search}"` : ''}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {filtered.map((item, i) => <Card key={i} item={item} />)}
          {filtered.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 15 }}>No results found for "{search}"</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, CoursesPage, EarnPage, ContactPage, LoginPage, DirectoryPage });
