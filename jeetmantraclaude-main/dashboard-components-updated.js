/**
 * Dashboard Component Updates
 * Replaces hardcoded data with real API integration
 * Features: Live classes, homework, document sharing, tests
 */

// ── Home Screen (Updated with API Integration) ────────────────────────────────
function HomeScreenUpdated({ setScreen }) {
  const [feedback, setFeedback] = useState({ });
  const [feedbackSent, setFeedbackSent] = useState({});
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(true);
  
  // Real data from API
  const [dashboardData, setDashboardData] = useState(null);
  const [liveLectures, setLiveLectures] = useState([]);
  const [recordedLectures, setRecordedLectures] = useState([]);
  const [homework, setHomework] = useState([]);
  const [skillsThisWeek, setSkillsThisWeek] = useState([]);
  const [partners, setPartners] = useState([]);
  const [feedbackClasses, setFeedbackClasses] = useState([]);
  const [joinedClass, setJoinedClass] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Load all data on component mount
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [dashData, liveClasses, recordedData, hwData, skillsData, partnerData] = await Promise.all([
        getDashboardData().catch(() => ({})),
        getLiveClasses().catch(() => []),
        getRecordedLectures().catch(() => []),
        getUserHomework().catch(() => []),
        getUserSkills().catch(() => []),
        getPartnerServices().catch(() => [])
      ]);

      setDashboardData(dashData);
      setLiveLectures(liveClasses || []);
      setRecordedLectures(recordedData || []);
      setHomework(hwData || []);
      setSkillsThisWeek(skillsData || []);
      setPartners(partnerData || []);
      
      // Set feedback classes from recent courses
      if (liveClasses && liveClasses.length > 0) {
        setFeedbackClasses(liveClasses.slice(0, 3).map((cls, i) => ({
          key: `class_${i}`,
          subject: cls.subject || cls.title,
          teacher: cls.teacher,
          date: cls.date || new Date().toLocaleDateString()
        })));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load home data:', error);
      setLoading(false);
    }
  };

  const handleJoinClass = async (classId) => {
    try {
      // Join class via API
      const response = await dashboardApiCall(`/live-classes/${classId}/join`, 'POST', {
        joinedAt: new Date().toISOString()
      });
      
      if (response.success || response.roomUrl) {
        setJoinedClass({
          id: classId,
          roomUrl: response.roomUrl || '#',
          documents: response.documents || []
        });
        // In production, open video call with documents
        window.open(response.roomUrl || '#', '_blank');
      }
    } catch (error) {
      console.error('Failed to join class:', error);
    }
  };

  const handleMarkHomeworkDone = async (homeworkId) => {
    try {
      await dashboardApiCall(`/dashboard/homework/${homeworkId}`, 'PUT', {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // Update local state
      setHomework(hw => hw.map(h => 
        h.id === homeworkId ? {...h, done: true} : h
      ));
    } catch (error) {
      console.error('Failed to mark homework:', error);
    }
  };

  const handleSubmitFeedback = async (classKey) => {
    try {
      if (!feedback[classKey]) return;
      
      await submitClassFeedback(
        classKey,
        feedback[classKey],
        '',
        {}
      );
      
      setFeedbackSent(fs => ({ ...fs, [classKey]: true }));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Loading your dashboard...</div>
        <div style={{ display: 'inline-block', width: 30, height: 30, borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: '3px solid #f97316', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  const user = getStoredUser();
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user?.fullName || 'Learner'} 👋`;

  const btn = (label, color, bg, onClick) => (
    <button onClick={onClick} style={{ background: bg, color, border: `1.5px solid ${color}30`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Topbar title={greeting} subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

      {/* Top stats row - Load from real data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard 
          label="Attendance" 
          value={dashboardData?.attendance || '—%'} 
          sub="This month" 
          iconPath="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" 
          iconBg="#f0fdf4" 
          iconColor="#22c55e" 
          trend={5} 
        />
        <StatCard 
          label="Classes Done" 
          value={dashboardData?.classesDone || '0'} 
          sub={`Out of ${dashboardData?.totalClasses || '0'}`}
          iconPath="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" 
          iconBg="#eff6ff" 
          iconColor="#3b82f6" 
        />
        <StatCard 
          label="Wallet Balance" 
          value={dashboardData?.walletBalance || '₹0'} 
          sub="Ready to withdraw" 
          iconPath="M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 1 0-4h14" 
          iconBg="#fff7ed" 
          iconColor="#f97316" 
          trend={18} 
        />
        <StatCard 
          label="Skills Learned" 
          value={skillsThisWeek.length} 
          sub="This week" 
          iconPath="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
          iconBg="#fdf4ff" 
          iconColor="#7c3aed" 
          trend={12} 
        />
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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

          {activeTab === 'live' && (liveLectures.length > 0 ? liveLectures.map((cls, i) => (
            <div key={cls.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < liveLectures.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (cls.color || '#f97316') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: cls.color || '#f97316' }}>{(cls.subject || cls.title || '').slice(0,3).toUpperCase()}</div>
                {cls.isLive && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', borderRadius: 9999, padding: '1px 5px', fontSize: 8, fontWeight: 800, color: 'white', border: '2px solid white' }}>LIVE</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.subject || cls.title}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cls.topic} · {cls.time || cls.scheduledTime}</div>
              </div>
              <button onClick={() => handleJoinClass(cls.id)} style={{ background: cls.isLive ? '#ef4444' : cls.color || '#f97316', color: 'white', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>{cls.isLive ? 'Join Now' : 'Remind'}</button>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No live classes scheduled</div>)}

          {activeTab === 'recorded' && (recordedLectures.length > 0 ? recordedLectures.map((cls, i) => (
            <div key={cls.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < recordedLectures.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (cls.color || '#f97316') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" size={16} stroke={cls.color || '#f97316'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.topic || cls.title}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cls.subject} · {cls.duration || '0 min'}</div>
              </div>
              {cls.watched
                ? <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, background: '#f0fdf4', borderRadius: 6, padding: '4px 8px' }}>✓ Watched</span>
                : <button style={{ background: (cls.color || '#f97316') + '18', color: cls.color || '#f97316', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Watch</button>
              }
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No recorded lectures available</div>)}
        </div>

        {/* Homework */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Homework</div>
            <span style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{homework.filter(h => !h.done).length} pending</span>
          </div>
          {homework.length > 0 ? homework.map((hw, i) => (
            <div key={hw.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: i < homework.length - 1 ? '1px solid #f1f5f9' : 'none', opacity: hw.done ? 0.5 : 1 }}>
              <div 
                style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${hw.done ? '#22c55e' : hw.color || '#f97316'}`, background: hw.done ? '#22c55e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, cursor: 'pointer' }}
                onClick={() => handleMarkHomeworkDone(hw.id)}
              >
                {hw.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: hw.done ? 'line-through' : 'none' }}>{hw.task || hw.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{hw.subject} · Due: <span style={{ color: !hw.done && new Date(hw.dueDate) < new Date() ? '#ef4444' : '#64748b', fontWeight: 600 }}>{hw.due || new Date(hw.dueDate).toLocaleDateString()}</span></div>
              </div>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No homework assigned</div>}
        </div>
      </div>

      {/* Skills this week + Partner/Book class */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Skills learned this week */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Skills This Week</div>
            <span style={{ background: '#fdf4ff', color: '#7c3aed', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{skillsThisWeek.length} active</span>
          </div>
          {skillsThisWeek.length > 0 ? skillsThisWeek.map((sk, i) => (
            <div key={sk.id || i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sk.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sk.color || '#7c3aed' }}>{sk.percentage || sk.pct}%</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 7 }}>
                <div style={{ background: sk.color || '#7c3aed', height: '100%', borderRadius: 9999, width: (sk.percentage || sk.pct) + '%', transition: 'width 600ms' }}></div>
              </div>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No skills tracked yet</div>}
          <button style={{ width: '100%', background: '#fdf4ff', color: '#7c3aed', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>Explore More Skills →</button>
        </div>

        {/* Partner & Skills */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Partners & Skills</div>
            <button style={{ fontSize: 12, fontWeight: 600, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>See All →</button>
          </div>
          {partners.length > 0 ? partners.map((p, i) => (
            <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < partners.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (p.color || '#7c3aed') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: p.color || '#7c3aed' }}>{(p.name || '').slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{p.type} · ⭐ {p.rating || '—'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>{p.hourlyRate || p.hourly}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>{p.dailyRate || p.daily}</span>
                </div>
              </div>
              <button onClick={() => bookPartnerService(p.id, p.name, '', '', 60)} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Book</button>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No partners available</div>}
        </div>
      </div>

      {/* Class Review & Feedback */}
      {feedbackClasses.length > 0 && (
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
                <StarRating value={feedback[cls.key] || 0} onChange={v => setFeedback(f => ({ ...f, [cls.key]: v }))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: feedback[cls.key] ? '#f97316' : '#9ca3af' }}>
                    {feedback[cls.key] ? `${feedback[cls.key]} / 10` : '— / 10'}
                  </span>
                  {feedbackSent[cls.key]
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>✓ Sent</span>
                    : <button onClick={() => handleSubmitFeedback(cls.key)}
                        style={{ background: feedback[cls.key] ? '#f97316' : '#e5e7eb', color: feedback[cls.key] ? 'white' : '#9ca3af', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: feedback[cls.key] ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 150ms' }}>
                        Submit
                      </button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Live Class Modal (NEW - Document Sharing & Screen Share) ────────────────────────────
function LiveClassModal({ classData, onClose }) {
  const [documents, setDocuments] = useState(classData?.documents || []);
  const [screenSharing, setScreenSharing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const handleShareDocument = async (file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', classData.id);

      const response = await fetch(`http://localhost:5000/api/live-classes/${classData.id}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(prev => [...prev, data.document]);
      }
    } catch (error) {
      console.error('Failed to share document:', error);
    }
  };

  const handleToggleMedia = async (type) => {
    try {
      if (!videoStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setVideoStream(stream);
        setCameraOn(true);
        setMicrophoneOn(true);
        return;
      }

      if (type === 'video') {
        const videoTrack = videoStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !cameraOn;
          setCameraOn(!cameraOn);
        }
      } else if (type === 'audio') {
        const audioTrack = videoStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !microphoneOn;
          setMicrophoneOn(!microphoneOn);
        }
      }
    } catch (error) {
      console.error('Failed to access camera or microphone:', error);
    }
  };

  const handleScreenShare = async () => {
    try {
      if (screenSharing) {
        setScreenSharing(false);
      } else {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenSharing(true);
      }
    } catch (error) {
      console.error('Failed to share screen:', error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '90%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{classData?.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Taught by {classData?.teacher}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af' }}>×</button>
        </div>

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ background: '#000', borderRadius: 12, aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
            {videoStream ? (
              <video ref={videoRef} autoPlay muted={!microphoneOn} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 10 }}>Video Stream Area</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Enable camera and mic to start broadcasting.</div>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 18, left: 18, display: 'flex', gap: 8 }}>
              <button onClick={() => handleToggleMedia('video')} style={{ background: cameraOn ? '#22c55e' : '#64748b', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {cameraOn ? 'Camera On' : 'Camera Off'}
              </button>
              <button onClick={() => handleToggleMedia('audio')} style={{ background: microphoneOn ? '#22c55e' : '#64748b', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {microphoneOn ? 'Mic On' : 'Mic Off'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Documents</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#f97316', color: 'white', padding: '8px 12px', borderRadius: 6, textAlign: 'center' }}>
                  + Share Document
                  <input type="file" style={{ display: 'none' }} onChange={(e) => handleShareDocument(e.target.files[0])} />
                </label>
              </div>
              {documents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.map((doc, i) => (
                    <div key={i} style={{ background: 'white', padding: 10, borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📄</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename || doc.name}</span>
                      <a href={doc.url || doc.downloadUrl || '#'} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: 12, fontWeight: 700 }}>Open</a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 20 }}>No documents shared</div>
              )}
            </div>
            <button onClick={onClose} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>Leave Class</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export updated components
console.log('✅ Dashboard Component Updates loaded - Ready for integration');
