-- JeetMantra Database Schema with Prefix

-- Create all tables with jeetmantra_ prefix to avoid conflicts

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE jeetmantra_users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'partner', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    ai_provider VARCHAR(50),
    -- Encrypted API key - never store plaintext
    api_key_encrypted VARCHAR(500) NULL,
    -- Metadata
    profile_picture_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE (email)
);

-- ============================================================
-- USER PROFILES TABLE (Role-specific details)
-- ============================================================
CREATE TABLE jeetmantra_user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'partner')),

    -- STUDENT fields
    academic_level VARCHAR(100),
    interest_area VARCHAR(255),

    -- TEACHER fields
    qualification VARCHAR(255),
    experience_years INT,
    institution VARCHAR(255),

    -- PARTNER fields
    service_category VARCHAR(100),
    hourly_rate DECIMAL(10, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- USER SKILLS TABLE
-- ============================================================
CREATE TABLE jeetmantra_user_skills (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(20) DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_skill UNIQUE (user_id, skill_name)
);

-- ============================================================
-- EMAIL VERIFICATION TABLE
-- ============================================================
CREATE TABLE jeetmantra_email_verifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- COURSES TABLE
-- ============================================================
CREATE TABLE jeetmantra_courses (
    id VARCHAR(36) PRIMARY KEY,
    teacher_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration_hours INT,
    level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    max_students INT,
    enrolled_count INT DEFAULT 0,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (teacher_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- COURSE MODULES TABLE
-- ============================================================
CREATE TABLE jeetmantra_course_modules (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_order INT NOT NULL,
    duration_hours INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES jeetmantra_courses(id) ON DELETE CASCADE,
);

-- ============================================================
-- COURSE LESSONS TABLE
-- ============================================================
CREATE TABLE jeetmantra_course_lessons (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration_minutes INT,
    lesson_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES jeetmantra_course_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES jeetmantra_courses(id) ON DELETE CASCADE,
);

-- ============================================================
-- ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE jeetmantra_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP NULL,
    completion_date TIMESTAMP NULL,
    progress_percentage INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    amount_paid DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES jeetmantra_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
    CONSTRAINT unique_enrollment UNIQUE (course_id, student_id)
);

-- ============================================================
-- LESSON PROGRESS TABLE
-- ============================================================
CREATE TABLE jeetmantra_lesson_progress (
    id VARCHAR(36) PRIMARY KEY,
    enrollment_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES jeetmantra_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES jeetmantra_course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
    CONSTRAINT unique_progress UNIQUE (enrollment_id, lesson_id)
);

-- ============================================================
-- ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE jeetmantra_assignments (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    max_score INT DEFAULT 100,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES jeetmantra_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES jeetmantra_course_lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES jeetmantra_users(id),
);

-- ============================================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE jeetmantra_assignment_submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    submission_text TEXT,
    file_url VARCHAR(500),
    submitted_at TIMESTAMP NOT NULL,
    graded_at TIMESTAMP NULL,
    score INT,
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'grading', 'graded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES jeetmantra_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
    CONSTRAINT unique_submission UNIQUE (assignment_id, student_id)
);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE jeetmantra_attendance (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    class_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES jeetmantra_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES jeetmantra_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
    CONSTRAINT unique_attendance UNIQUE (enrollment_id, class_date)
);

-- ============================================================
-- FEEDBACK TABLE
-- ============================================================
CREATE TABLE jeetmantra_feedback (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES jeetmantra_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE jeetmantra_payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES jeetmantra_enrollments(id) ON DELETE SET NULL,
);

-- ============================================================
-- WITHDRAWALS TABLE
-- ============================================================
CREATE TABLE jeetmantra_withdrawals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    bank_account_number VARCHAR(255),
    bank_ifsc_code VARCHAR(20),
    bank_holder_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'processing', 'completed', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- USER WALLET TABLE
-- ============================================================
CREATE TABLE jeetmantra_wallets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    total_earned DECIMAL(12, 2) DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- WALLET TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE jeetmantra_wallet_transactions (
    id VARCHAR(36) PRIMARY KEY,
    wallet_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    reference_id VARCHAR(255),
    reference_type VARCHAR(50),
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES jeetmantra_wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE jeetmantra_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    reference_id VARCHAR(255),
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
CREATE TABLE jeetmantra_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    changes JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- ============================================================
-- WEBHOOK LOGS TABLE
-- ============================================================
CREATE TABLE jeetmantra_webhook_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    request_data JSON,
    response_data JSON,
    status VARCHAR(10) DEFAULT 'success' CHECK (status IN ('success', 'error')),
    error_message TEXT,
    source VARCHAR(50),
    user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- ============================================================
-- API KEYS TABLE (for admin/integration access)
-- ============================================================
CREATE TABLE jeetmantra_api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    description TEXT,
    scopes JSON,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- SETTINGS TABLE
-- ============================================================
CREATE TABLE jeetmantra_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- ============================================================
-- SESSION TABLE
-- ============================================================
CREATE TABLE jeetmantra_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES jeetmantra_users(id) ON DELETE CASCADE,
);

-- ============================================================
-- Create views for common queries
-- ============================================================

-- View: User Summary with Stats
