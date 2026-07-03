/**
 * JeetMantra Login/Auth API Service
 * Provides backend integration for website.html login form
 */

const LOGIN_API_CONFIG = {
  baseURL: '/api',
  timeout: 30000
};

/**
 * Login user with email and password
 */
async function loginUser(email, password) {
  const url = `${LOGIN_API_CONFIG.baseURL}/auth/login`;
  
  const headers = {
    'Content-Type': 'application/json'
  };

  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
    timeout: LOGIN_API_CONFIG.timeout
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Login failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store token and user info
    if (data.token) {
      localStorage.setItem('jm_token', data.token);
      localStorage.setItem('jm_user', JSON.stringify(data.user || {}));
      return {
        success: true,
        token: data.token,
        user: data.user
      };
    }

    throw new Error('No token received from server');
  } catch (error) {
    console.error('Login API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify login token
 */
async function verifyToken(token) {
  const url = `${LOGIN_API_CONFIG.baseURL}/auth/verify`;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers,
      timeout: LOGIN_API_CONFIG.timeout 
    });

    if (response.ok) {
      const data = await response.json();
      return { valid: true, data };
    }
    return { valid: false };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

/**
 * Logout user (clear tokens)
 */
function logout() {
  localStorage.removeItem('jm_token');
  localStorage.removeItem('jm_user');
  console.log('User logged out');
}

/**
 * Get stored user info
 */
function getStoredUser() {
  try {
    const userJson = localStorage.getItem('jm_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
}

/**
 * Get stored auth token
 */
function getStoredToken() {
  return localStorage.getItem('jm_token');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getStoredToken();
}

/**
 * Get user's role from stored info
 */
function getUserRole() {
  const user = getStoredUser();
  return user?.user_type || user?.role || null;
}

/**
 * Redirect to appropriate dashboard based on role
 */
function redirectToDashboard() {
  // Single App Shell: every role enters at /app, never a standalone page.
  const role = getUserRole() || 'student';
  window.location.href = '/app?role=' + encodeURIComponent(role);
}

/**
 * Request OTP for phone-based login
 */
async function requestOTP(phone) {
  const url = `${LOGIN_API_CONFIG.baseURL}/auth/send-otp`;
  
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone }),
      timeout: LOGIN_API_CONFIG.timeout
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message };
    }

    const error = await response.json();
    throw new Error(error.error || 'Failed to send OTP');
  } catch (error) {
    console.error('OTP Request Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify OTP and login
 */
async function verifyOTP(phone, otp) {
  const url = `${LOGIN_API_CONFIG.baseURL}/auth/verify-otp`;
  
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, otp }),
      timeout: LOGIN_API_CONFIG.timeout
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OTP verification failed');
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('jm_token', data.token);
      localStorage.setItem('jm_user', JSON.stringify(data.user || {}));
      return {
        success: true,
        token: data.token,
        user: data.user
      };
    }

    throw new Error('No token received');
  } catch (error) {
    console.error('OTP Verification Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Google OAuth login
 */
async function loginWithGoogle(googleToken) {
  const url = `${LOGIN_API_CONFIG.baseURL}/auth/google-login`;
  
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ googleToken }),
      timeout: LOGIN_API_CONFIG.timeout
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google login failed');
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('jm_token', data.token);
      localStorage.setItem('jm_user', JSON.stringify(data.user || {}));
      return {
        success: true,
        token: data.token,
        user: data.user
      };
    }

    throw new Error('No token received');
  } catch (error) {
    console.error('Google Login Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

console.log('✅ Login API Service loaded - Authentication ready');
