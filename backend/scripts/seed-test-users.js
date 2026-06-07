/**
 * seed-test-users.js — idempotent test-fixture for every role.
 *
 * Creates (if absent) one user per role:
 *   demo_student@jm.test, demo_teacher@jm.test, demo_partner@jm.test,
 *   demo_school@jm.test, demo_coaching@jm.test, demo_admin@jm.test
 *
 * Then wires institution links: school+coaching each get one teacher
 * linked, school gets one student linked, and the student is enrolled
 * in the teacher's demo course.
 *
 * Password for all: Demo1234!
 *
 * Run: node scripts/seed-test-users.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const BASE = process.env.SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API  = 'http://localhost:5000/api';
const http = require('http');

const PASSWORD = 'Demo1234!';

const USERS = [
  { role:'student',  email:'demo_student@jm.test',  fullName:'Demo Student' },
  { role:'teacher',  email:'demo_teacher@jm.test',  fullName:'Demo Teacher' },
  { role:'partner',  email:'demo_partner@jm.test',  fullName:'Demo Partner' },
  { role:'school',   email:'demo_school@jm.test',   fullName:'Demo School',
    schoolName:'Demo Public School', affiliationBoard:'CBSE', studentCount:300, teacherCount:25, address:'12 Demo Lane',
    contactPerson:'Demo Principal' },
  { role:'coaching', email:'demo_coaching@jm.test', fullName:'Demo Coaching',
    centerName:'Demo Coaching Center', specializations:['JEE','NEET'], studentCapacity:150, batchCount:6, address:'5 Demo Rd' },
  { role:'admin',    email:'demo_admin@jm.test',    fullName:'Demo Admin' }
];

function http_(path, method, body, token) {
  return new Promise(res => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type':'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers.Authorization = 'Bearer ' + token;
    // All script paths are relative to /api — prepend it here so callers can write '/auth/login' etc.
    const r = http.request({ host:'localhost', port:5000, path: '/api' + path, method, headers }, (resp) => {
      let d=''; resp.on('data',c=>d+=c);
      resp.on('end', () => res({ status: resp.statusCode, body: d ? JSON.parse(d) : null }));
    });
    r.on('error', e => res({ status: 0, body: { error: e.message } }));
    if (data) r.write(data); r.end();
  });
}

async function ensureUser(u) {
  // Try login first — if successful, user already exists
  const login = await http_('/auth/login', 'POST', { email: u.email, password: PASSWORD });
  if (login.status === 200) {
    return { existed: true, token: login.body.token, user: login.body.user };
  }
  // Otherwise sign up
  const signup = await http_('/auth/signup', 'POST', { ...u, password: PASSWORD, phone: '9000000000' });
  if (signup.status !== 201) throw new Error(`Signup ${u.role}: ${signup.body?.error || signup.status}`);
  return { existed: false, token: signup.body.token, user: signup.body.user };
}

(async () => {
  console.log('\n🌱  Seeding demo users (idempotent)\n');
  const created = {};

  // 1. Create or login every demo user
  for (const u of USERS) {
    const result = await ensureUser(u);
    created[u.role] = result;
    console.log(`  ${result.existed ? '· ' : '+ '}${u.role.padEnd(10)} ${u.email}`);
  }

  // 2. Teacher creates a demo course (idempotent: only if they have none)
  const tToken = created.teacher.token;
  const tCourses = await http_('/courses', 'GET', null, tToken);
  let demoCourseId = (tCourses.body.courses || []).find(c => c.title === 'Demo Course — Math Foundation')?.id;
  if (!demoCourseId) {
    const c = await http_('/courses', 'POST', {
      title: 'Demo Course — Math Foundation',
      description: 'A starter course used by the demo seeder.',
      category: 'Mathematics', level: 'beginner', price: 299
    }, tToken);
    demoCourseId = c.body?.course?.id;
    console.log(`  + course      Demo Course — Math Foundation`);
  } else {
    console.log(`  · course      Demo Course — Math Foundation`);
  }

  // 3. Teacher adds one topic + one lecture + one material so the Configure
  //    modal isn't empty for reviewers.
  if (demoCourseId) {
    const topics = await http_('/course-content/' + demoCourseId + '/topics', 'GET', null, tToken);
    if (!topics.body.topics?.length) {
      const t = await http_('/course-content/' + demoCourseId + '/topics', 'POST',
        { title: 'Chapter 1 — Numbers', description: 'Counting and operations' }, tToken);
      const topicId = t.body.topic.id;
      await http_('/course-content/' + demoCourseId + '/lectures', 'POST',
        { topicId, title: 'Introduction Lecture', duration: 30, isRecorded: true, videoUrl: 'https://video.example/intro' }, tToken);
      // Use a plain JSON material rather than multipart so this script stays curl-free.
      await http_('/course-content/' + demoCourseId + '/materials', 'POST',
        { topicId, title: 'Reference Sheet', type: 'link', url: 'https://docs.example/reference.pdf' }, tToken);
      console.log('  + content     1 topic / 1 lecture / 1 material');
    } else {
      console.log('  · content     (already populated)');
    }
  }

  // 4. School links the teacher
  const schToken = created.school.token;
  const link = await http_('/institutions/teachers', 'POST',
    { email: USERS.find(u => u.role==='teacher').email, subject: 'Mathematics' }, schToken);
  console.log(`  ${link.status===201 ? '+ ' : '· '}link        school → teacher (${link.body?.message || link.body?.error || 'already linked'})`);

  // 5. Coaching links the teacher
  const cToken = created.coaching.token;
  const link2 = await http_('/institutions/teachers', 'POST',
    { email: USERS.find(u => u.role==='teacher').email, subject: 'JEE Math' }, cToken);
  console.log(`  ${link2.status===201 ? '+ ' : '· '}link        coaching → teacher (${link2.body?.message || link2.body?.error || 'already linked'})`);

  // 6. School links the student
  const slink = await http_('/institutions/students', 'POST',
    { email: USERS.find(u => u.role==='student').email, classLabel: 'Class 8 — Section A' }, schToken);
  console.log(`  ${slink.status===201 ? '+ ' : '· '}link        school → student (${slink.body?.message || slink.body?.error || 'already linked'})`);

  // 7. Student enrolls in the teacher's demo course
  const sToken = created.student.token;
  if (demoCourseId) {
    const enroll = await http_('/enrollments', 'POST', { courseId: demoCourseId }, sToken);
    console.log(`  ${enroll.status===201 ? '+ ' : '· '}enrollment  student → demo course (${enroll.body?.message || enroll.body?.error || 'already enrolled'})`);
  }

  console.log('\n✅  All demo users seeded. Password for everyone: Demo1234!\n');
  console.log('Try logging in at http://localhost:5000/login.html\n');
})().catch(e => { console.error('Seed failed:', e); process.exit(1); });
