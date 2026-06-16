/**
 * JeetMantra - Unified Webhook Handler Library
 * Single webhook endpoint routes all requests intelligently
 * Supports user ops, course ops, dashboard, admin, MCP calls
 */

class WebhookHandler {
  constructor(webhookUrl) {
    // Auto-detect if not provided
    if (!webhookUrl) {
      // Use cloud URL if on HTTPS, else localhost
      if (window.location.protocol === 'https:') {
        webhookUrl = 'https://work.mantravat.cloud/webhook/jeetmantra';
      } else {
        webhookUrl = 'https://work.mantravat.cloud/webhook/jeetmantra';
      }
    }
    this.webhookUrl = webhookUrl;
    this.isLoading = false;
    this.lastResponse = null;
    this.offlineMode = false;
    this.offlineWarningShown = false;
  }

  /**
   * Send request to unified webhook
   * @param {string} action - Action name (user-signup, course-create, mcp-validate, etc)
   * @param {object} data - Action-specific data
   * @param {function} onSuccess - Success callback
   * @param {function} onError - Error callback
   */
  async sendWebhook(action, data, onSuccess, onError) {
    this.isLoading = true;
    try {
      console.log(`[Webhook] Action: ${action}`, data);

      if (this.offlineMode) {
        return this.handleOfflineAction(action, data, onSuccess, onError);
      }

      const payload = {
        action,
        data,
        timestamp: new Date().toISOString(),
        source: 'frontend'
      };

      const authToken = this.getAuthToken();
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this.lastResponse = result;

      console.log(`[Webhook] Response for action "${action}":`, result);

      if (result.success || result.status === 'success') {
        if (onSuccess) onSuccess(result);
        return { success: true, data: result };
      } else {
        if (onError) onError(result.error || 'Unknown error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`[Webhook] Error:`, error);
      if (!this.offlineMode) {
        this.offlineMode = true;
      }
      return this.handleOfflineAction(action, data, onSuccess, onError, error.message);
    } finally {
      this.isLoading = false;
    }
  }

  handleOfflineAction(action, data, onSuccess, onError, previousError) {
    if (!this.offlineWarningShown) {
      showToast('Webhook unavailable — continuing in offline mode.', 'warning', 5000);
      this.offlineWarningShown = true;
    }

    const fallback = this.getOfflineFallback(action, data);
    if (!fallback) {
      const message = previousError || 'No offline fallback available for this action.';
      console.warn(`[WebhookFallback] ${action}:`, message);
      if (onError) onError(message);
      return { success: false, error: message };
    }

    this.lastResponse = fallback;
    if (onSuccess) onSuccess(fallback);
    return { success: true, data: fallback };
  }

  getOfflineFallback(action, data) {
    const user = this.getCurrentUser();
    const now = new Date().toISOString();
    switch (action) {
      case 'user-signup':
        return { success: true, status: 'success', message: 'Signup simulated offline', data: { user: { id: 'offline-user', name: data.name || 'Guest', role: data.role || 'Student', email: data.email }, token: 'offline-token' } };
      case 'user-login':
      case 'user-login-otp-verify':
      case 'user-login-google':
        return { success: true, status: 'success', data: { user: { id: user?.id || 'offline-user', name: user?.name || 'Offline User', role: user?.role || 'Student' }, token: 'offline-token' } };
      case 'course-create':
      case 'admin-create-course':
        return { success: true, status: 'success', courseId: `offline-course-${Date.now()}`, courseTitle: data.title || 'Offline Course' };
      case 'class-schedule':
        return { success: true, status: 'success', classId: `offline-class-${Date.now()}`, scheduledAt: now, ...data };
      case 'class-live-start':
      case 'class-live-end':
        return { success: true, status: 'success', ...data };
      case 'partner-session-book':
      case 'student-admission':
      case 'admin-create-partner':
      case 'admin-create-user':
      case 'admin-approve-payment':
      case 'payment-initiate':
      case 'withdrawal-request':
        return { success: true, status: 'success', ...data, timestamp: now };
      case 'course-enroll':
        return { success: true, status: 'success', enrollmentId: `offline-enroll-${Date.now()}`, courseId: data.courseId, studentId: data.studentId };
      case 'mcp-recommend-courses':
        return { success: true, status: 'success', recommendations: [
          { id: 'offline-1', title: 'AI Basics for Beginners' },
          { id: 'offline-2', title: 'JEE Crash Course' }
        ] };
      case 'mcp-generate-course-description':
        return { success: true, status: 'success', description: data.topics ? `Offline course description for ${data.title}: ${data.topics.join(', ')}.` : `Offline course description for ${data.title}.` };
      case 'mcp-generate-blog-post':
        return { success: true, status: 'success', blogId: `offline-blog-${Date.now()}`, title: data.title || 'Offline Blog Title', content: `This is an offline-generated SEO blog draft for ${data.title || 'Your Course'}.` };
      case 'attendance-mark':
      case 'attendance-bulk-mark':
      case 'homework-submit':
      case 'feedback-submit':
      case 'mcp-generate-homework':
      case 'mcp-validate':
      case 'mcp-autofill':
      case 'mcp-suggestions':
        return { success: true, status: 'success', message: `Offline fallback for ${action}`, data };
      case 'admin-dashboard':
        return { success: true, status: 'success', dashboard: { users: 12, courses: 8, revenue: '₹0 (offline)', pending: 2 } };
      case 'admin-get-users':
        return { success: true, status: 'success', users: [{ id: 'offline-user-1', name: 'Offline User', email: 'offline@example.com', role: 'Student' }] };
      case 'admin-get-courses':
        return { success: true, status: 'success', courses: [{ id: 'offline-course-1', title: 'Offline Course', instructor: 'Offline Teacher' }] };
      case 'admin-get-partners':
        return { success: true, status: 'success', partners: [{ id: 'offline-partner-1', name: 'Offline Partner', service: 'Demo Service' }] };
      case 'admin-get-payments':
        return { success: true, status: 'success', payments: [{ id: 'offline-payment-1', amount: '₹0', status: 'offline' }] };
      default:
        return null;
    }
  }
  // ==================== USER & AUTH WEBHOOKS ====================

  /**
   * User Registration (Complete Signup)
   * Validates email, creates account, sends verification email
   */
  async registerUser(userData) {
    return this.sendWebhook('user-signup', userData,
    (result) => {
      showToast(`Welcome! Verification email sent to ${userData.email}`, 'success');
      setTimeout(() => window.location.href = '/website.html?login=1', 2000);
    },
    (error) => {
      showToast(`Signup failed: ${error}`, 'error');
    });
  }

  /**
   * User Login
   * Validates credentials, generates JWT token
   */
  async loginUser(email, password) {
    return this.sendWebhook('user-login', {
      email,
      password
    },
    (result) => {
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('userId', result.data.user.id || result.data.user.userId || '');
      showToast(`Welcome back, ${result.data.user.name}!`, 'success');

      // Redirect based on role
      const dashboards = {
        'Student': '/dashboard.html?role=student',
        'Teacher': '/dashboard.html?role=teacher',
        'Partner': '/dashboard.html?role=partner',
        'Admin': '/admin.html'
      };
      setTimeout(() => window.location.href = dashboards[result.data.user.role] || '/dashboard.html', 1500);
    },
    (error) => {
      showToast(`Login failed: ${error}`, 'error');
    });
  }

  /**
   * Login with OTP
   * Send OTP to phone, verify OTP
   */
  async loginWithOTP(phone, otp = null) {
    if (!otp) {
      // Step 1: Send OTP
      return this.sendWebhook('user-login-otp-send', { phone },
        (result) => {
          showToast('OTP sent to your phone', 'success');
          document.getElementById('otp-input')?.focus();
        },
        (error) => {
          showToast(`Failed to send OTP: ${error}`, 'error');
        });
    } else {
      // Step 2: Verify OTP
      return this.sendWebhook('user-login-otp-verify', { phone, otp },
        (result) => {
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('userId', result.user.id || result.user.userId || '');
          showToast('Login successful!', 'success');
          setTimeout(() => window.location.href = '/dashboard.html', 1500);
        },
        (error) => {
          showToast(`Invalid OTP: ${error}`, 'error');
        });
    }
  }

  /**
   * Google Sign-in
   * Validate Google token, create/login user
   */
  async loginWithGoogle(googleToken) {
    return this.sendWebhook('user-login-google', { googleToken },
      (result) => {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('userId', result.user.id || result.user.userId || '');
        showToast('Google login successful!', 'success');
        setTimeout(() => window.location.href = '/dashboard.html', 1500);
      },
      (error) => {
        showToast(`Google login failed: ${error}`, 'error');
      });
  }

  // ==================== COURSE WEBHOOKS ====================

  /**
   * Create Course
   * Validate course data, generate description via MCP, create course
   */
  async createCourse(courseData) {
    return this.sendWebhook('course-create', {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      price: courseData.price,
      teacherId: localStorage.getItem('userId'),
      duration: courseData.duration,
      level: courseData.level,
      topics: courseData.topics,
      targetExam: courseData.targetExam,
      fullFee: courseData.fullFee,
      discountedFee: courseData.discountedFee,
      maxSeats: courseData.maxSeats,
      installments: courseData.installments,
      schedule: courseData.schedule,
      mode: courseData.mode
    },
    (result) => {
      showToast(`Course "${result.courseTitle}" created successfully!`, 'success');
      setTimeout(() => window.location.href = `/dashboard.html?course=${result.courseId}`, 1500);
    },
    (error) => {
      showToast(`Failed to create course: ${error}`, 'error');
    });
  }

  /**
   * Get Course Recommendations (via MCP)
   * AI-powered course recommendations based on student profile
   */
  async scheduleClass(classData) {
    return this.sendWebhook('class-schedule', {
      ...classData,
      teacherId: localStorage.getItem('userId'),
      scheduledAt: new Date().toISOString()
    },
    (result) => {
      showToast('Class scheduled successfully!', 'success');
    });
  }

  async startLiveClass(classData) {
    return this.sendWebhook('class-live-start', {
      ...classData,
      teacherId: localStorage.getItem('userId'),
      startedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Live class started!', 'success');
    });
  }

  async endLiveClass(classId) {
    return this.sendWebhook('class-live-end', {
      classId,
      endedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Live class ended.', 'success');
    });
  }

  async bookPartnerSession(sessionData) {
    return this.sendWebhook('partner-session-book', {
      ...sessionData,
      partnerId: localStorage.getItem('userId'),
      bookedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Partner session booked successfully!', 'success');
    });
  }

  async admitStudent(studentData) {
    return this.sendWebhook('student-admission', {
      ...studentData,
      admittedBy: localStorage.getItem('userId'),
      admittedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Student admission completed!', 'success');
    });
  }

  async generateBlogPost(blogData) {
    return this.sendWebhook('mcp-generate-blog-post', {
      ...blogData,
      authorId: localStorage.getItem('userId')
    },
    (result) => {
      showToast('SEO blog post generated!', 'success');
    });
  }

  async getCourseRecommendations(studentId) {
    return this.sendWebhook('mcp-recommend-courses', {
      studentId,
      limit: 5
    },
    (result) => {
      return result.recommendations || [];
    });
  }

  /**
   * Enroll in Course
   * Check capacity, create enrollment, send confirmation
   */
  async enrollCourse(courseId) {
    return this.sendWebhook('course-enroll', {
      courseId,
      studentId: localStorage.getItem('userId')
    },
    (result) => {
      showToast('Successfully enrolled in course!', 'success');
      setTimeout(() => window.location.reload(), 1500);
    },
    (error) => {
      showToast(`Enrollment failed: ${error}`, 'error');
    });
  }

  /**
   * Generate Course Description via MCP
   * Uses Claude to generate professional course description
   */
  async generateCourseDescription(title, topics) {
    return this.sendWebhook('mcp-generate-course-description', {
      title,
      topics: topics.split(',').map(t => t.trim())
    },
    (result) => {
      if (document.getElementById('course-description')) {
        document.getElementById('course-description').value = result.description;
      }
      showToast('Course description generated!', 'success');
    });
  }

  // ==================== ATTENDANCE WEBHOOKS ====================

  /**
   * Mark Attendance
   * Record student attendance, check threshold, send alerts if needed
   */
  async markAttendance(classId, studentId, status) {
    return this.sendWebhook('attendance-mark', {
      classId,
      studentId,
      status, // 'present' or 'absent'
      timestamp: new Date().toISOString()
    },
    (result) => {
      showToast(`Attendance marked as ${status}`, 'success');
      if (result.alert) {
        showToast(`⚠️ ${result.alert}`, 'warning');
      }
    },
    (error) => {
      showToast(`Failed to mark attendance: ${error}`, 'error');
    });
  }

  /**
   * Bulk Mark Attendance
   * Mark attendance for multiple students at once
   */
  async bulkMarkAttendance(classId, attendanceData) {
    return this.sendWebhook('attendance-bulk-mark', {
      classId,
      attendanceData
    },
    (result) => {
      showToast(`Attendance marked for ${result.count} students`, 'success');
    },
    (error) => {
      showToast(`Failed to mark attendance: ${error}`, 'error');
    });
  }

  // ==================== HOMEWORK WEBHOOKS ====================

  /**
   * Submit Homework
   * Receive submission, validate, assign to teacher for grading
   */
  async submitHomework(assignmentId, fileUrl, submissionText) {
    return this.sendWebhook('homework-submit', {
      assignmentId,
      studentId: localStorage.getItem('userId'),
      fileUrl,
      submissionText,
      submittedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Homework submitted successfully!', 'success');
      setTimeout(() => window.location.reload(), 1500);
    },
    (error) => {
      showToast(`Failed to submit homework: ${error}`, 'error');
    });
  }

  /**
   * Generate Homework Assignment via MCP
   * Uses Claude to generate homework questions, rubric, answer key
   */
  async generateHomework(courseId, week, topic) {
    return this.sendWebhook('mcp-generate-homework', {
      courseId,
      week,
      topic
    },
    (result) => {
      showToast('Homework generated!', 'success');
      return result;
    });
  }

  // ==================== FEEDBACK WEBHOOKS ====================

  /**
   * Submit Class Feedback
   * Record feedback, alert teacher if rating is low
   */
  async submitFeedback(classId, rating, reviewText) {
    return this.sendWebhook('feedback-submit', {
      classId,
      studentId: localStorage.getItem('userId'),
      rating,
      reviewText,
      submittedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Feedback submitted, thank you!', 'success');
      if (result.teacherAlert) {
        showToast(`Teacher notified of low rating`, 'warning');
      }
    },
    (error) => {
      showToast(`Failed to submit feedback: ${error}`, 'error');
    });
  }

  // ==================== PAYMENT WEBHOOKS ====================

  /**
   * Process Payment
   * Initiate payment, create transaction, send confirmation
   */
  async processPayment(amount, paymentMethod, description) {
    return this.sendWebhook('payment-initiate', {
      userId: localStorage.getItem('userId'),
      amount,
      paymentMethod, // 'card', 'upi', 'wallet'
      description,
      timestamp: new Date().toISOString()
    },
    (result) => {
      showToast('Payment initiated, redirecting...', 'success');
      // Redirect to payment gateway
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    },
    (error) => {
      showToast(`Payment failed: ${error}`, 'error');
    });
  }

  /**
   * Request Withdrawal
   * Create withdrawal request, get approval
   */
  async requestWithdrawal(amount, bankDetails) {
    return this.sendWebhook('withdrawal-request', {
      userId: localStorage.getItem('userId'),
      amount,
      bankDetails,
      requestedAt: new Date().toISOString()
    },
    (result) => {
      showToast('Withdrawal request submitted!', 'success');
    },
    (error) => {
      showToast(`Withdrawal request failed: ${error}`, 'error');
    });
  }

  // ==================== ADMIN WEBHOOKS ====================

  /**
   * Admin Block User
   * Block user account, prevent login
   */
  async adminBlockUser(userId, reason) {
    return this.sendWebhook('admin-block-user', {
      userId,
      reason,
      blockedBy: localStorage.getItem('userId')
    },
    (result) => {
      showToast(`User blocked`, 'warning');
    });
  }

  /**
   * Admin Unblock User
   * Restore user account access
   */
  async adminUnblockUser(userId) {
    return this.sendWebhook('admin-unblock-user', {
      userId,
      unblockedBy: localStorage.getItem('userId')
    },
    (result) => {
      showToast(`User unblocked`, 'success');
    });
  }

  /**
   * Admin Delete User
   * Permanently delete user account
   */
  async adminDeleteUser(userId) {
    return this.sendWebhook('admin-delete-user', {
      userId,
      deletedBy: localStorage.getItem('userId')
    },
    (result) => {
      showToast(`User deleted`, 'success');
    });
  }

  /**
   * Admin Get Dashboard Data
   * Get overview stats for admin dashboard
   */
  async adminGetDashboard() {
    return this.sendWebhook('admin-dashboard', {});
  }

  /**
   * Admin Get Users
   * Get paginated list of all users
   */
  async adminGetUsers(filters = {}) {
    return this.sendWebhook('admin-get-users', filters);
  }

  /**
   * Admin Get Courses
   * Get paginated list of all courses
   */
  async adminGetCourses(filters = {}) {
    return this.sendWebhook('admin-get-courses', filters);
  }

  /**
   * Admin Get Partners
   * Get paginated list of all partners
   */
  async adminGetPartners(filters = {}) {
    return this.sendWebhook('admin-get-partners', filters);
  }

  /**
   * Admin Get Payments
   * Get paginated list of all payments
   */
  async adminGetPayments(filters = {}) {
    return this.sendWebhook('admin-get-payments', filters);
  }

  /**
   * Admin Approve Payment
   * Approve a pending payment
   */
  async adminApprovePayment(paymentId) {
    return this.sendWebhook('admin-approve-payment', {
      paymentId,
      approvedBy: localStorage.getItem('userId')
    },
    (result) => {
      showToast('Payment approved', 'success');
    });
  }

  /**
   * Admin Create User
   * Create a new user account (admin only)
   */
  async adminCreateUser(userData) {
    return this.sendWebhook('admin-create-user', userData,
    (result) => {
      showToast('User created successfully', 'success');
    });
  }

  /**
   * Admin Create Course
   * Create a new course (admin only)
   */
  async adminCreateCourse(courseData) {
    return this.sendWebhook('admin-create-course', courseData,
    (result) => {
      showToast('Course created successfully', 'success');
    });
  }

  /**
   * Admin Create Partner
   * Create a new partner (admin only)
   */
  async adminCreatePartner(partnerData) {
    return this.sendWebhook('admin-create-partner', partnerData,
    (result) => {
      showToast('Partner created successfully', 'success');
    });
  }

  // ==================== MCP SUGGESTION WEBHOOKS ====================

  /**
   * Get Auto-fill Suggestions
   * MCP suggests field values based on context
   */
  async getAutoFillSuggestions(fieldType, context) {
    return this.sendWebhook('mcp-autofill', {
      fieldType, // 'course-description', 'schedule', 'price', etc.
      context
    });
  }

  /**
   * Validate Form Data via MCP/Claude
   * AI validates all form inputs for quality and correctness
   */
  async validateFormData(formType, formData) {
    return this.sendWebhook('mcp-validate', {
      formType, // 'course-creation', 'user-signup', etc.
      formData
    },
    (result) => {
      if (result.data.valid) {
        showToast('✓ Validation passed', 'success');
      } else {
        result.data.errors?.forEach(err => showToast(`✗ ${err}`, 'error'));
      }
    });
  }

  /**
   * Get Smart Suggestions
   * MCP provides intelligent suggestions based on user data
   */
  async getSmartSuggestions(suggestionType, userId) {
    return this.sendWebhook('mcp-suggestions', {
      suggestionType, // 'course-recommendations', 'schedule-optimization', etc.
      userId
    });
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Attach webhook to form element
   * Automatically submit form to webhook on submit
   */
  attachFormWebhook(formId, webhookEndpoint, onSuccess, onError) {
    const form = document.getElementById(formId);
    if (!form) {
      console.warn(`Form with ID "${formId}" not found`);
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      await this.sendWebhook(webhookEndpoint, data, onSuccess, onError);
    });
  }

  /**
   * Test webhook connection
   */
  async testConnection() {
    try {
      const baseUrl = this.webhookUrl.replace('/webhook/jeetmantra', '');
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET'
      });
      const healthy = response.ok;
      this.offlineMode = !healthy;
      return healthy;
    } catch (error) {
      console.error('Webhook connection test failed:', error);
      this.offlineMode = true;
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    window.location.href = '/website.html';
  }

  /**
   * Get bearer token
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }
}

// ==================== GLOBAL INSTANCE ====================
const webhooks = new WebhookHandler();

// ==================== TOAST HELPER ====================
function showToast(message, type = 'success', duration = 3000) {
  // Check if custom toast element exists, otherwise create simple alert
  const container = document.getElementById('toast-container');
  if (container) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// ==================== AUTO-INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  // Test webhook connection on page load
  webhooks.testConnection().then(isConnected => {
    if (!isConnected) {
      console.warn('⚠️ n8n webhook not reachable. Make sure n8n is running on http://localhost:5678');
    }
  });

  // Check authentication status
  if (webhooks.isAuthenticated()) {
    const user = webhooks.getCurrentUser();
    console.log(`Logged in as: ${user?.name} (${user?.role})`);
  }
});
