/**
 * JeetMantra Dashboard API Service
 * Provides backend integration for dashboard.html
 * Connect to http://localhost:5000/api backend endpoints
 */

const DASHBOARD_API_CONFIG = {
  baseURL: 'http://localhost:5000/api',
  timeout: 30000
};

/**
 * Get authentication token from localStorage
 */
function getDashboardAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Make authenticated API call to dashboard backend
 */
async function dashboardApiCall(endpoint, method = 'GET', data = null) {
  const token = getDashboardAuthToken();
  
  if (!token) {
    console.warn('No auth token found, redirecting to login');
    window.location.href = '/website.html?tab=login';
    return null;
  }

  const url = `${DASHBOARD_API_CONFIG.baseURL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const options = {
    method,
    headers,
    timeout: DASHBOARD_API_CONFIG.timeout
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      console.warn('Token expired, redirecting to login');
      localStorage.clear();
      window.location.href = '/website.html?tab=login';
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Dashboard API Error (${endpoint}):`, error.message);
    throw error;
  }
}

/**
 * Get dashboard statistics and summary data
 */
async function getDashboardData() {
  try {
    const data = await dashboardApiCall('/dashboard');
    const dashboard = data?.dashboard || data || {};
    const attendanceValue = Array.isArray(dashboard.attendance)
      ? `${dashboard.attendance.length}`
      : dashboard.attendance || dashboard.attendancePercentage || '87%';
    return {
      attendance: attendanceValue,
      classesDone: dashboard.classesDone || dashboard.enrolledCourses?.length || dashboard.courses?.length || 0,
      walletBalance: dashboard.walletBalance || '₹1,250',
      skillsLearned: dashboard.skillsLearned || dashboard.skillsThisWeek?.length || dashboard.courses?.length || 0,
      ...dashboard
    };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return null;
  }
}

/**
 * Get user's enrolled courses
 */
async function getUserCourses() {
  try {
    const data = await dashboardApiCall('/enrollments/my');
    return data.enrollments || [];
  } catch (error) {
    console.error('Failed to load user courses:', error);
    return [];
  }
}

/**
 * Get user's attendance records
 */
async function getUserAttendance() {
  try {
    const data = await dashboardApiCall('/dashboard/attendance');
    return data.records || [];
  } catch (error) {
    console.error('Failed to load attendance records:', error);
    return [];
  }
}

/**
 * Get students enrolled in a teacher's course
 */
async function getCourseStudents(courseId) {
  try {
    const data = await dashboardApiCall(`/enrollments/course/${courseId}/students`);
    return data.students || [];
  } catch (error) {
    console.error('Failed to load course students:', error);
    return [];
  }
}

/**
 * Record attendance for a student enrollment
 */
async function recordAttendance(enrollmentId, status, classDate) {
  try {
    const response = await dashboardApiCall('/attendance', 'POST', {
      enrollmentId,
      status,
      classDate
    });
    return response;
  } catch (error) {
    console.error('Failed to record attendance:', error);
    throw error;
  }
}

/**
 * Get user's homework assignments
 */
async function getUserHomework() {
  try {
    const data = await dashboardApiCall('/dashboard');
    return data?.dashboard?.homework || data?.homework || [];
  } catch (error) {
    console.error('Failed to load homework:', error);
    return [];
  }
}

/**
 * Get live classes schedule
 */
async function getLiveClasses() {
  try {
    const data = await dashboardApiCall('/live-classes/upcoming');
    return data.liveClasses || data.classes || [];
  } catch (error) {
    console.error('Failed to load live classes:', error);
    return [];
  }
}

/**
 * Get teacher's live classes for a course
 */
async function getTeacherLiveClasses(courseId) {
  if (!courseId) return { upcoming: [], past: [] };
  try {
    const data = await dashboardApiCall(`/live-classes/course/${courseId}`);
    return data.liveClasses || { upcoming: [], past: [] };
  } catch (error) {
    console.error('Failed to load teacher live classes:', error);
    return { upcoming: [], past: [] };
  }
}

/**
 * Get recorded lectures
 */
async function getRecordedLectures() {
  try {
    const data = await dashboardApiCall('/dashboard');
    return data?.dashboard?.recordedLectures || data?.recordedLectures || [];
  } catch (error) {
    console.error('Failed to load recorded lectures:', error);
    return [];
  }
}

/**
 * Get user's skills progress
 */
async function getUserSkills() {
  try {
    const data = await dashboardApiCall('/dashboard');
    return data?.dashboard?.skillsThisWeek || data?.skills || [];
  } catch (error) {
    console.error('Failed to load skills:', error);
    return [];
  }
}

/**
 * Get partner recommendations (services)
 */
async function getPartnerServices() {
  try {
    const data = await dashboardApiCall('/courses?category=partner');
    return data.courses || [];
  } catch (error) {
    console.error('Failed to load partner services:', error);
    return [];
  }
}

/**
 * Submit feedback for a class
 */
async function submitClassFeedback(courseId, rating, comment, categories) {
  try {
    const response = await dashboardApiCall('/feedback', 'POST', {
      courseId,
      rating,
      comment,
      categories
    });
    return response;
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error;
  }
}

/**
 * Enroll in a course
 */
async function enrollCourse(courseId) {
  try {
    const response = await dashboardApiCall('/enrollments', 'POST', {
      courseId
    });
    return response;
  } catch (error) {
    console.error('Failed to enroll in course:', error);
    throw error;
  }
}

/**
 * Book a partner service
 */
async function bookPartnerService(partnerId, service, date, time, duration) {
  try {
    const response = await dashboardApiCall('/bookings', 'POST', {
      partnerId,
      service,
      date,
      time,
      duration
    });
    return response;
  } catch (error) {
    console.error('Failed to book service:', error);
    throw error;
  }
}

/**
 * For Teacher: Get classes schedule
 */
async function getTeacherClasses() {
  try {
    const data = await dashboardApiCall('/dashboard');
    return data?.dashboard?.courses || data?.courses || [];
  } catch (error) {
    console.error('Failed to load teacher classes:', error);
    return [];
  }
}

/**
 * For Teacher: Create a course
 */
async function createTeacherCourse(courseData) {
  try {
    const response = await dashboardApiCall('/courses', 'POST', courseData);
    return response;
  } catch (error) {
    console.error('Failed to create course:', error);
    throw error;
  }
}

/**
 * For Teacher: Update an existing course
 */
async function updateTeacherCourse(courseId, courseData) {
  try {
    const response = await dashboardApiCall(`/courses/${courseId}`, 'PUT', courseData);
    return response;
  } catch (error) {
    console.error('Failed to update course:', error);
    throw error;
  }
}

/**
 * For Teacher: Schedule a live class
 */
async function scheduleLiveClass(courseId, title, description, scheduledTime, duration, meetingLink, capacity) {
  try {
    const response = await dashboardApiCall('/live-classes', 'POST', {
      courseId,
      title,
      description,
      scheduledTime,
      duration,
      meetingLink,
      capacity
    });
    return response;
  } catch (error) {
    console.error('Failed to schedule live class:', error);
    throw error;
  }
}

/**
 * For Teacher: Get payment history
 */
async function getTeacherPayments() {
  try {
    const data = await dashboardApiCall('/teacher/payments');
    return data.payments || [];
  } catch (error) {
    console.error('Failed to load teacher payments:', error);
    return [];
  }
}

/**
 * For Teacher: Get referrals
 */
async function getTeacherReferrals() {
  try {
    const data = await dashboardApiCall('/teacher/referrals');
    return data.referrals || [];
  } catch (error) {
    console.error('Failed to load teacher referrals:', error);
    return [];
  }
}

/**
 * For Partner: Get bookings
 */
async function getPartnerBookings() {
  try {
    const data = await dashboardApiCall('/partner/bookings');
    return data.bookings || [];
  } catch (error) {
    console.error('Failed to load partner bookings:', error);
    return [];
  }
}

/**
 * For Partner: Get revenue/payments
 */
async function getPartnerRevenue() {
  try {
    const data = await dashboardApiCall('/partner/revenue');
    return data;
  } catch (error) {
    console.error('Failed to load partner revenue:', error);
    return null;
  }
}

/**
 * For Partner: Get referrals  
 */
async function getPartnerReferrals() {
  try {
    const data = await dashboardApiCall('/partner/referrals');
    return data.referrals || [];
  } catch (error) {
    console.error('Failed to load partner referrals:', error);
    return [];
  }
}

/**
 * Load all dashboard data at once
 */
async function loadAllDashboardData() {
  console.log('Loading dashboard data from backend...');
  
  try {
    const [
      dashboardData,
      courses,
      attendance,
      homework,
      liveClasses,
      skills,
      partners
    ] = await Promise.all([
      getDashboardData().catch(() => ({})),
      getUserCourses().catch(() => []),
      getUserAttendance().catch(() => []),
      getUserHomework().catch(() => []),
      getLiveClasses().catch(() => []),
      getUserSkills().catch(() => []),
      getPartnerServices().catch(() => [])
    ]);

    return {
      dashboardData,
      courses,
      attendance,
      homework,
      liveClasses,
      skills,
      partners,
      loaded: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to load all dashboard data:', error);
    return {
      loaded: false,
      error: error.message
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDashboardData,
    getUserCourses,
    getUserAttendance,
    getUserHomework,
    getLiveClasses,
    getRecordedLectures,
    getUserSkills,
    getPartnerServices,
    submitClassFeedback,
    enrollCourse,
    bookPartnerService,
    getTeacherClasses,
    getCourseStudents,
    recordAttendance,
    createTeacherCourse,
    updateTeacherCourse,
    scheduleLiveClass,
    getTeacherPayments,
    getTeacherReferrals,
    getPartnerBookings,
    getPartnerRevenue,
    getPartnerReferrals,
    loadAllDashboardData
  };
}

console.log('✅ Dashboard API Service loaded - Backend integration ready');
