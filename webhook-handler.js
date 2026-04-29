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
        webhookUrl = 'http://localhost:5678/webhook/jeetmantra';
      }
    }
    this.webhookUrl = webhookUrl;
    this.isLoading = false;
    this.lastResponse = null;
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

      const payload = {
        action,
        data,
        timestamp: new Date().toISOString(),
        source: 'frontend'
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      if (onError) onError(error.message);
      return { success: false, error: error.message };
    } finally {
      this.isLoading = false;
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
      level: courseData.level
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
      return response.ok;
    } catch (error) {
      console.error('Webhook connection test failed:', error);
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
