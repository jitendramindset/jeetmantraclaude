// API Configuration and Integration for JeetMantra Frontend

const API_BASE_URL = 'http://localhost:5000/api';

class JeetMantraAPI {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear token on logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Helper method to make requests
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error: ${response.status}`, data);
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  // ============ AUTHENTICATION ============

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(response.token);
    return response;
  }

  async verifyToken() {
    return this.request('/auth/verify', {
      method: 'GET'
    });
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', {
      method: 'POST'
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.clearToken();
  }

  // ============ OAUTH & OTP AUTHENTICATION ============

  async googleLogin(googleData) {
    const response = await this.request('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({
        email: googleData.email,
        fullName: googleData.name,
        googleId: googleData.id,
        profileImage: googleData.picture,
        role: 'student'
      })
    });
    this.setToken(response.token);
    return response;
  }

  async sendOTP(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifyOTP(phone, otp, fullName = null) {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        phone,
        otp,
        fullName: fullName || `User_${phone.slice(-4)}`,
        role: 'student'
      })
    });
    this.setToken(response.token);
    return response;
  }

  // ============ USERS ============

  async getProfile() {
    return this.request('/users/profile', {
      method: 'GET'
    });
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getUserStats() {
    return this.request('/users/stats', {
      method: 'GET'
    });
  }

  // ============ COURSES ============

  async getCourses(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/courses?${queryParams}`, {
      method: 'GET'
    });
  }

  async getCourseById(courseId) {
    return this.request(`/courses/${courseId}`, {
      method: 'GET'
    });
  }

  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(courseId, courseData) {
    return this.request(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  }

  async deleteCourse(courseId) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  }

  // ============ ENROLLMENTS ============

  async getMyEnrollments() {
    return this.request('/enrollments/my', {
      method: 'GET'
    });
  }

  async enrollCourse(courseId) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId })
    });
  }

  async getCourseStudents(courseId) {
    return this.request(`/enrollments/course/${courseId}/students`, {
      method: 'GET'
    });
  }

  async cancelEnrollment(enrollmentId) {
    return this.request(`/enrollments/${enrollmentId}`, {
      method: 'DELETE'
    });
  }

  // ============ DASHBOARD ============

  async getDashboard() {
    return this.request('/dashboard', {
      method: 'GET'
    });
  }

  // ============ ATTENDANCE ============

  async recordAttendance(attendanceData) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  async getStudentAttendance(studentId) {
    return this.request(`/attendance/student/${studentId}`, {
      method: 'GET'
    });
  }

  async getCourseAttendance(courseId) {
    return this.request(`/attendance/course/${courseId}`, {
      method: 'GET'
    });
  }

  // ============ PAYMENTS ============

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getMyPayments() {
    return this.request('/payments/my', {
      method: 'GET'
    });
  }

  async processPaymentWebhook(paymentData) {
    return this.request('/payments/webhook/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  // ============ ADMIN ============

  async getAdminUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/admin/users?${queryParams}`, {
      method: 'GET'
    });
  }

  async toggleUserStatus(userId) {
    return this.request(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT'
    });
  }

  async getAdminStats() {
    return this.request('/admin/stats', {
      method: 'GET'
    });
  }

  // ============ WEBHOOKS ============

  // ============ LIVE CLASSES ============

  async scheduleLiveClass(classData) {
    return this.request('/live-classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  }

  async getLiveClassesForCourse(courseId) {
    return this.request(`/live-classes/course/${courseId}`, {
      method: 'GET'
    });
  }

  async getUpcomingLiveClasses() {
    return this.request('/live-classes/upcoming', {
      method: 'GET'
    });
  }

  async getLiveClassDetails(classId) {
    return this.request(`/live-classes/${classId}`, {
      method: 'GET'
    });
  }

  async joinLiveClass(classId) {
    return this.request(`/live-classes/${classId}/join`, {
      method: 'POST'
    });
  }

  async updateLiveClass(classId, updateData) {
    return this.request(`/live-classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async startLiveClass(classId) {
    return this.request(`/live-classes/${classId}/start`, {
      method: 'POST'
    });
  }

  async endLiveClass(classId) {
    return this.request(`/live-classes/${classId}/end`, {
      method: 'POST'
    });
  }

  async getClassAttendees(classId) {
    return this.request(`/live-classes/${classId}/attendees`, {
      method: 'GET'
    });
  }

  // ============ WEBHOOKS ============

  async sendWebhook(action, data) {
    return this.request('/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        action,
        data,
        source: 'frontend'
      })
    });
  }
}

// Create global instance
const api = new JeetMantraAPI();

// Export for use in HTML/React components
if (typeof window !== 'undefined') {
  window.JeetMantraAPI = api;
}
