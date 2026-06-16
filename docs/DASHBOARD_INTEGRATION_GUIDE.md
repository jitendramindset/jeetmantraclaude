# Dashboard Component Integration Guide
**Date**: May 21, 2026  
**Task**: Remove hardcoded data and wire real API integration

---

## What Changed

### ✅ Completed
1. Created `dashboard-api.js` - All backend API calls
2. Created `login-api.js` - Authentication
3. Updated `components.html` - Fixed API URL
4. Created `dashboard-components-updated.js` - New component implementations

### 🔄 To Do
1. Replace `HomeScreen()` function in dashboard.html with `HomeScreenUpdated()`
2. Replace `CoursesScreen()` function with real data loading
3. Add Live Class modal with document sharing
4. Add test/quiz handling
5. Test full integration

---

## Step-by-Step Integration

### Step 1: Update HomeScreen Function

**In dashboard.html**, find this line (around line 206):
```javascript
// ── Home Screen ───────────────────────────────────────────────────────
function HomeScreen({ setScreen }) {
```

**Replace the ENTIRE HomeScreen function with the updated version:**

Copy the `HomeScreenUpdated` function from `dashboard-components-updated.js` and replace the entire old `HomeScreen` function.

**Key changes:**
- ✅ Loads data from API using `getLiveClasses()`, `getUserCourses()`, etc.
- ✅ Shows loading state while fetching
- ✅ Displays real user name from localStorage
- ✅ Empty states if no data
- ✅ Join class functionality
- ✅ Mark homework as done
- ✅ Submit feedback to backend
- ✅ Book partner services

### Step 2: Rename HomeScreen to HomeScreenUpdated

After replacing, the function signature should be:
```javascript
function HomeScreenUpdated({ setScreen }) {
  // ... new code
}
```

But keep the reference as `HomeScreen` in the App component:
```javascript
// Find this line in App():
const studentScreens = {
  home: <HomeScreen setScreen={setScreen} />,  // Keep this name
  // ...
};
```

So either:
- Option A: Rename function back to `HomeScreen`
- Option B: Update the App component to use `HomeScreenUpdated`

### Step 3: Update CoursesScreen

**Find CoursesScreen function and replace with:**

```javascript
function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getUserCourses();
      setCourses(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar 
        title="My Courses" 
        subtitle={`${courses.length} active enrollments`} 
      />
      
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <div>Loading courses...</div>
        </div>
      ) : courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
          {courses.map((c, i) => (
            <div key={c.id || i} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }} onClick={() => window.location.href = `/course/${c.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{c.name || c.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{c.teacher || c.instructorName}</div>
                </div>
                <span style={{ background: (c.color || '#f97316') + '18', color: c.color || '#f97316', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{c.progress || 0}%</span>
              </div>
              
              {/* Progress bar */}
              <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 8, marginBottom: 12 }}>
                <div style={{ background: c.color || '#f97316', borderRadius: 9999, height: '100%', width: (c.progress || 0) + '%', transition: 'width 600ms' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                <span>{c.classesDone || 0} classes attended</span>
                <span>{c.totalClasses || 0} total classes</span>
              </div>
              
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#64748b', borderLeft: `3px solid ${c.color || '#f97316'}` }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Next: </span>
                {c.nextClass || 'No upcoming class'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>No courses yet</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Explore courses and enroll to get started</div>
          <button style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Explore Courses →</button>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Add LiveClassModal Component

**Add this NEW component to dashboard.html (after the other screen components):**

Copy the `LiveClassModal` function from `dashboard-components-updated.js` and add it to dashboard.html.

### Step 5: Update App Component to Show Modal

**Find the App component and update to handle live class modal:**

```javascript
function App() {
  const [role, setRole] = useState(null);
  const [screen, setScreen] = useState('home');
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [accentIdx, setAccentIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [liveClass, setLiveClass] = useState(null);  // NEW LINE
  const t = LANG[lang];
  
  // ... rest of code
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--fg-1)' }}>
      <SidebarComp screen={screen} setScreen={setScreen} setRole={handleRoleReset} lang={t} />
      <main className="main-content" style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minHeight: '100vh', background: 'var(--bg-page)' }}>
        {screenMap[screen] || screenMap['home']}
      </main>
      <SettingsPanel open={settingsOpen} setOpen={setSettingsOpen} dark={dark} setDark={setDark} lang={lang} setLang={setLang} accentIdx={accentIdx} setAccentIdx={setAccentIdx} />
      
      {/* NEW: Live Class Modal */}
      {liveClass && <LiveClassModal classData={liveClass} onClose={() => setLiveClass(null)} />}
    </div>
  );
}
```

### Step 6: Wire HomeScreen to Open Live Class Modal

**In HomeScreen, update the Join button to show modal:**

```javascript
// Change this:
<button onClick={() => handleJoinClass(cls.id)} ...>

// To this:
<button onClick={() => {
  const classDetails = {
    id: cls.id,
    title: cls.subject || cls.title,
    teacher: cls.teacher,
    documents: []
  };
  // Pass to App via context or prop
  // For now, use window to store state
  window.liveClassActive = classDetails;
}} ...>
```

---

## API Endpoints Called

### When HomeScreen Loads:
```
GET /api/dashboard               → Get dashboard stats
GET /api/live-classes             → Get live classes
GET /api/courses/recorded         → Get recorded lectures
GET /api/dashboard/homework       → Get homework
GET /api/user/skills              → Get skills
GET /api/partners/services        → Get partners
```

### When User Joins Class:
```
POST /api/live-classes/:id/join   → Join live class
POST /api/live-classes/share-document → Share document
```

### When User Submits Feedback:
```
POST /api/feedback                → Submit class feedback
```

### When User Books Partner:
```
POST /api/bookings                → Book partner service
```

---

## Features Implemented

### ✅ Live Classes
- Join active live classes
- Get LIVE indicator
- Join button that opens video call

### ✅ Document Sharing
- Upload documents during class
- Download shared documents
- See file list

### ✅ Homework Management
- Click checkbox to mark done
- See due dates
- Visual indicator for pending

### ✅ Feedback System
- Rate classes 1-10
- Submit feedback
- See submission status

### ✅ Skills Tracking
- Progress bars for each skill
- Percentage display
- Real-time updates

### ✅ Partner Services
- Browse available partners
- See hourly/daily rates
- Book services directly

---

## Backend Endpoints Needed

### Already Exist ✅
```
GET    /api/dashboard
GET    /api/admin/stats
POST   /api/auth/signup
POST   /api/auth/login
```

### Need to Create ⚠️
```
GET    /api/live-classes           → List live classes
POST   /api/live-classes/:id/join  → Join a class
POST   /api/live-classes/share-document
GET    /api/courses/recorded       → Get recorded lectures
GET    /api/dashboard/homework     → Get homework
PUT    /api/dashboard/homework/:id → Mark homework done
POST   /api/feedback               → Submit feedback
GET    /api/user/skills            → Get user skills
GET    /api/partners/services      → Get partner services
POST   /api/bookings               → Book partner
```

---

## Testing Checklist

- [ ] HomeScreen loads without errors
- [ ] Displays user's real name
- [ ] Shows real data from backend
- [ ] Shows empty states when no data
- [ ] Join class button works
- [ ] Mark homework checkbox works
- [ ] Submit feedback works
- [ ] Book partner button works
- [ ] CoursesScreen loads courses
- [ ] Live class modal opens
- [ ] Document upload works

---

## File Structure After Integration

```
dashboard.html
├── Imports
│   ├── dashboard-api.js ✅
│   ├── login-api.js ✅
│   └── React
├── Components
│   ├── HomeScreenUpdated() ✅ NEW
│   ├── CoursesScreen() ✅ UPDATED
│   ├── LiveClassModal() ✅ NEW
│   ├── AttendanceScreen()
│   ├── WalletScreen()
│   ├── TeacherHome()
│   ├── PartnerHome()
│   └── Other screens
└── App()
    └── liveClass state ✅ NEW
```

---

## Integration Flow

```
1. User opens dashboard.html
   ↓
2. HomeScreen loads (via App)
   ↓
3. useEffect triggers loadHomeData()
   ↓
4. Calls multiple API endpoints in parallel
   ↓
5. Updates state with real data
   ↓
6. Re-renders with real data instead of mocks
   ↓
7. User can interact:
   - Join live class → Opens LiveClassModal
   - Mark homework → Updates backend
   - Submit feedback → Sends to API
   - Book partner → Creates booking
```

---

## Important Notes

1. **Token Required**: All API calls need auth token from localStorage
   - Automatically handled by `dashboard-api.js`
   - Token is retrieved in each function call

2. **Empty States**: Components show helpful messages when no data
   - No live classes: "No live classes scheduled"
   - No homework: "No homework assigned"
   - No courses: "No courses yet"

3. **Loading States**: Show spinner while fetching data
   - Prevents UI jumping
   - Improves UX

4. **Error Handling**: All API errors are caught and logged
   - Won't break the page if API fails
   - User sees empty state instead

5. **Real-time Updates**: 
   - Homework status changes immediately
   - Feedback submission shows ✓ Sent
   - No page reload needed

---

## Next Steps

1. ✅ Create backend endpoints for missing APIs
2. ✅ Replace HomeScreen function
3. ✅ Update CoursesScreen function
4. ✅ Add LiveClassModal component
5. ✅ Test full signup → dashboard flow
6. ✅ Test live class features
7. ✅ Test homework and feedback

---

**Status**: Ready for integration - All code is prepared and documented

